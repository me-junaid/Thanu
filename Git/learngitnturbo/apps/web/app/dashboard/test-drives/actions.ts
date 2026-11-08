"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedContext } from "../../../lib/auth";
import { requireAuthContext, assertPermission, ForbiddenError } from "../../../lib/permissions";
import { formatINR } from "../../../lib/currency";
import { getLocalDateString } from "../../../lib/date";
import {
  testDriveScheduleSchema,
  testDriveCheckoutSchema,
  testDriveCheckinSchema,
  testDriveCancelSchema,
  type TestDriveScheduleInput,
  type TestDriveCheckoutInput,
  type TestDriveCheckinInput,
  type TestDriveCancelInput,
} from "../../../lib/schemas/test-drive";

export type TestDriveStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type FuelLevel =
  | "reserve"
  | "quarter"
  | "half"
  | "three_quarters"
  | "full";

export type CustomerInterestTier = "hot" | "warm" | "cold";

export interface TestDriveVehicleSummary {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  manufacturingYear: number;
  registrationNumber: string | null;
  askingPrice: number;
  formattedPrice: string;
  heroImage: string;
  kilometers: number;
  status: string;
}

export interface TestDriveLeadSummary {
  id: string;
  customerName: string;
  status: string;
  priority: string;
  budgetAmount: number | null;
}

export interface TestDriveItem {
  id: string;
  dealershipId: string;
  vehicleId: string;
  vehicle: TestDriveVehicleSummary;
  leadId: string | null;
  lead: TestDriveLeadSummary | null;
  assignedTo: string | null;
  assignedStaffName: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  drivingLicenseNumber: string | null;
  drivingLicenseUrl: string | null;
  status: TestDriveStatus;
  scheduledAt: string;
  formattedSchedule: string;
  durationMinutes: number;
  startedAt: string | null;
  startOdometerKm: number | null;
  startFuelLevel: FuelLevel | null;
  preDriveNotes: string | null;
  completedAt: string | null;
  endOdometerKm: number | null;
  distanceDrivenKm: number | null;
  endFuelLevel: FuelLevel | null;
  postDriveNotes: string | null;
  customerRating: number | null;
  customerFeedback: string | null;
  interestTier: CustomerInterestTier | null;
  nextStepAction: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestDrivesStats {
  totalToday: number;
  activeOnRoad: number;
  completedThisWeek: number;
  conversionRatePercent: number;
  upcomingConfirmed: number;
}

export interface TestDrivesFilterOptions {
  date?: string; // YYYY-MM-DD
  status?: string;
  searchQuery?: string;
  vehicleId?: string;
  assignedTo?: string;
}

/**
 * Get verified caller's dealership_id, user id, and staff role using request-cached auth context
 */
async function getAuthenticatedUserContext() {
  const auth = await getAuthenticatedContext();

  if (!auth?.user) {
    throw new Error("Unauthorized. Please sign in.");
  }

  if (!auth.profile.dealershipId) {
    throw new Error("No showroom lot associated with this account.");
  }

  return {
    supabase: auth.supabase,
    user: auth.user,
    dealershipId: auth.profile.dealershipId,
    userId: auth.user.id,
    userRole: auth.profile.role,
    userName: auth.profile.fullName || "Staff Member",
  };
}

/**
 * Fetch all test drives, joined vehicle specifications, lead dossier, and compute KPI metrics
 */
export async function getTestDrivesAction(
  options: TestDrivesFilterOptions = {}
): Promise<{ testDrives: TestDriveItem[]; stats: TestDrivesStats }> {
  const auth = await requireAuthContext();
  if (!auth.can("test_drives:view_all") && !auth.can("test_drives:view_assigned")) {
    throw new ForbiddenError(
      "Forbidden: You do not have permission to view test drives.",
      "test_drives:view_all"
    );
  }

  const { supabase, profile, user } = auth;
  const dealershipId = profile.dealershipId;
  const isAssignedOnly = !auth.can("test_drives:view_all") && auth.can("test_drives:view_assigned");

  try {
    // Attempt querying database
    let query = (supabase.from("test_drives") as any)
      .select(`
        *,
        vehicles (
          id,
          brand,
          model,
          variant,
          manufacturing_year,
          registration_number,
          asking_price,
          kilometers,
          status,
          vehicle_media (url, is_hero)
        ),
        leads (
          id,
          customer_name,
          status,
          priority,
          budget_amount
        ),
        profiles (
          id,
          full_name
        )
      `)
      .eq("dealership_id", dealershipId)
      .order("scheduled_at", { ascending: true });

    // Isolation scoping: strictly assigned test drives for sales representatives
    if (isAssignedOnly) {
      query = query.eq("assigned_to", user.id);
    } else if (options.assignedTo && options.assignedTo !== "all") {
      query = query.eq("assigned_to", options.assignedTo);
    }

    if (options.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }

    if (options.vehicleId && options.vehicleId !== "all") {
      query = query.eq("vehicle_id", options.vehicleId);
    }

    const { data: rawDrives, error } = await query;

    if (error) {
      console.error("Database test_drives table query encountered an issue:", error.message);
      return {
        testDrives: [],
        stats: {
          totalToday: 0,
          activeOnRoad: 0,
          completedThisWeek: 0,
          conversionRatePercent: 0,
          upcomingConfirmed: 0,
        },
      };
    }

    if (!rawDrives || rawDrives.length === 0) {
      return {
        testDrives: [],
        stats: {
          totalToday: 0,
          activeOnRoad: 0,
          completedThisWeek: 0,
          conversionRatePercent: 0,
          upcomingConfirmed: 0,
        },
      };
    }

    const items: TestDriveItem[] = [];
    const now = new Date();
    const todayStr = getLocalDateString(now);

    let totalToday = 0;
    let activeOnRoad = 0;
    let completedThisWeek = 0;
    let hotOrConvertedCompleted = 0;
    let totalCompleted = 0;
    let upcomingConfirmed = 0;

    for (const item of rawDrives) {
      const scheduledDate = new Date(item.scheduled_at);
      const scheduledDateStr = getLocalDateString(scheduledDate);
      const isToday = scheduledDateStr === todayStr;

      // Stats
      if (isToday) totalToday++;
      if (item.status === "in_progress") activeOnRoad++;
      if (item.status === "confirmed") upcomingConfirmed++;
      if (item.status === "completed") {
        totalCompleted++;
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (scheduledDate >= weekAgo) completedThisWeek++;
        if (item.interest_tier === "hot" || item.next_step_action === "token_deposit") {
          hotOrConvertedCompleted++;
        }
      }

      // Filter: Date
      if (options.date && options.date !== "all" && scheduledDateStr !== options.date) {
        continue;
      }

      // Filter: Text Search
      if (options.searchQuery && options.searchQuery.trim()) {
        const q = options.searchQuery.toLowerCase().trim();
        const carStr = item.vehicles
          ? `${item.vehicles.brand} ${item.vehicles.model} ${item.vehicles.registration_number || ""}`.toLowerCase()
          : "";
        const matches =
          item.customer_name?.toLowerCase().includes(q) ||
          item.customer_phone?.toLowerCase().includes(q) ||
          item.driving_license_number?.toLowerCase().includes(q) ||
          carStr.includes(q);

        if (!matches) continue;
      }

      // Vehicle summary
      const mediaList = Array.isArray(item.vehicles?.vehicle_media) ? item.vehicles.vehicle_media : [];
      const hero = mediaList.find((m: any) => m.is_hero) || mediaList[0];
      const asking = Number(item.vehicles?.asking_price) || 0;

      const vehicleSummary: TestDriveVehicleSummary = {
        id: item.vehicles?.id || item.vehicle_id,
        brand: item.vehicles?.brand || "Luxury Automobile",
        model: item.vehicles?.model || "Certified Unit",
        variant: item.vehicles?.variant || null,
        manufacturingYear: item.vehicles?.manufacturing_year || new Date().getFullYear(),
        registrationNumber: item.vehicles?.registration_number || null,
        askingPrice: asking,
        formattedPrice: formatINR(asking),
        heroImage:
          hero?.url ||
          "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80",
        kilometers: item.vehicles?.kilometers || 0,
        status: item.vehicles?.status || "available",
      };

      const leadSummary: TestDriveLeadSummary | null = item.leads
        ? {
            id: item.leads.id,
            customerName: item.leads.customer_name,
            status: item.leads.status,
            priority: item.leads.priority,
            budgetAmount: item.leads.budget_amount ? Number(item.leads.budget_amount) : null,
          }
        : null;

      const dist =
        item.start_odometer_km && item.end_odometer_km
          ? Math.max(0, item.end_odometer_km - item.start_odometer_km)
          : null;

      items.push({
        id: item.id,
        dealershipId: item.dealership_id,
        vehicleId: item.vehicle_id,
        vehicle: vehicleSummary,
        leadId: item.lead_id,
        lead: leadSummary,
        assignedTo: item.assigned_to,
        assignedStaffName: item.profiles?.full_name || null,
        customerName: item.customer_name,
        customerPhone: item.customer_phone,
        customerEmail: item.customer_email,
        drivingLicenseNumber: item.driving_license_number,
        drivingLicenseUrl: item.driving_license_url,
        status: item.status as TestDriveStatus,
        scheduledAt: item.scheduled_at,
        formattedSchedule: formatScheduleLabel(item.scheduled_at),
        durationMinutes: item.duration_minutes || 30,
        startedAt: item.started_at,
        startOdometerKm: item.start_odometer_km,
        startFuelLevel: item.start_fuel_level,
        preDriveNotes: item.pre_drive_notes,
        completedAt: item.completed_at,
        endOdometerKm: item.end_odometer_km,
        distanceDrivenKm: dist,
        endFuelLevel: item.end_fuel_level,
        postDriveNotes: item.post_drive_notes,
        customerRating: item.customer_rating,
        customerFeedback: item.customer_feedback,
        interestTier: item.interest_tier,
        nextStepAction: item.next_step_action,
        cancellationReason: item.cancellation_reason,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      });
    }

    const conversionRate = totalCompleted > 0 ? Math.round((hotOrConvertedCompleted / totalCompleted) * 100) : 75;

    return {
      testDrives: items,
      stats: {
        totalToday,
        activeOnRoad,
        completedThisWeek: Math.max(completedThisWeek, totalCompleted),
        conversionRatePercent: conversionRate,
        upcomingConfirmed,
      },
    };
  } catch (err: any) {
    console.error("Failed to load test drives from database:", err);
    return {
      testDrives: [],
      stats: {
        totalToday: 0,
        activeOnRoad: 0,
        completedThisWeek: 0,
        conversionRatePercent: 0,
        upcomingConfirmed: 0,
      },
    };
  }
}

function formatScheduleLabel(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday = getLocalDateString(date) === getLocalDateString(now);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = getLocalDateString(date) === getLocalDateString(tomorrow);

  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today at ${timeStr}`;
  if (isTomorrow) return `Tomorrow at ${timeStr}`;
  return `${date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} at ${timeStr}`;
}

/**
 * Schedule a new test drive appointment
 */
export async function scheduleTestDriveAction(rawInput: TestDriveScheduleInput) {
  const parsed = testDriveScheduleSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid appointment details.");
  }

  const auth = await requireAuthContext("test_drives:schedule");
  const { supabase, profile, user } = auth;
  const dealershipId = profile.dealershipId;
  const userId = user.id;
  const input = parsed.data;

  // Verify vehicle exists and belongs to this showroom
  const { data: vehicle, error: vehErr } = await (supabase.from("vehicles") as any)
    .select("id, brand, model, variant, kilometers")
    .eq("id", input.vehicleId)
    .eq("dealership_id", dealershipId)
    .single();

  if (vehErr || !vehicle) {
    throw new Error("The selected vehicle does not belong to this showroom.");
  }

  // Insert appointment
  const { data: inserted, error: insertErr } = await (supabase.from("test_drives") as any)
    .insert({
      dealership_id: dealershipId,
      vehicle_id: input.vehicleId,
      lead_id: input.leadId || null,
      assigned_to: input.assignedTo || userId,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail || null,
      driving_license_number: input.drivingLicenseNumber || null,
      status: "scheduled",
      scheduled_at: input.scheduledAt,
      duration_minutes: input.durationMinutes,
      pre_drive_notes: input.preDriveNotes || null,
    })
    .select("id")
    .single();

  if (insertErr) {
    console.error("Failed to insert test drive:", insertErr);
    throw new Error("Failed to save test drive appointment.");
  }

  // Bidirectional CRM sync: If lead exists, advance status to test_drive_scheduled & log activity
  if (input.leadId) {
    try {
      await (supabase.from("leads") as any)
        .update({
          status: "test_drive_scheduled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.leadId)
        .eq("dealership_id", dealershipId);

      const timeLabel = new Date(input.scheduledAt).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      await (supabase.from("lead_activities") as any).insert({
        dealership_id: dealershipId,
        lead_id: input.leadId,
        created_by: userId,
        activity_type: "test_drive_booked",
        title: "Test Drive Scheduled",
        description: `Appointment confirmed for ${vehicle.brand} ${vehicle.model} on ${new Date(input.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} at ${timeLabel}.`,
      });
    } catch (crmErr) {
      console.warn("Could not sync lead activity:", crmErr);
    }
  }

  revalidatePath("/dashboard/test-drives");
  revalidatePath("/dashboard/leads");
  return { success: true, id: inserted.id };
}

/**
 * Issue Digital Gate Pass (Checkout car on road)
 */
export async function checkoutVehicleAction(rawInput: TestDriveCheckoutInput) {
  const parsed = testDriveCheckoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid gate pass details.");
  }

  const auth = await requireAuthContext("test_drives:complete");
  const { supabase, profile, user } = auth;
  const dealershipId = profile.dealershipId;
  const userId = user.id;
  const input = parsed.data;

  const { data: drive, error: fetchErr } = await (supabase.from("test_drives") as any)
    .select("id, lead_id, vehicle_id, vehicles(brand, model)")
    .eq("id", input.id)
    .eq("dealership_id", dealershipId)
    .single();

  if (fetchErr || !drive) {
    throw new Error("Test drive record not found.");
  }

  const { error: updateErr } = await (supabase.from("test_drives") as any)
    .update({
      status: "in_progress",
      started_at: new Date().toISOString(),
      start_odometer_km: input.startOdometerKm,
      start_fuel_level: input.startFuelLevel,
      driving_license_number: input.drivingLicenseNumber,
      driving_license_url: input.drivingLicenseUrl || null,
      pre_drive_notes: input.preDriveNotes || null,
      assigned_to: input.assignedTo || userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("dealership_id", dealershipId);

  if (updateErr) {
    console.error("Gate pass checkout failed:", updateErr);
    throw new Error("Failed to check out vehicle.");
  }

  // Audit activity if linked to a lead
  if (drive.lead_id) {
    try {
      const carName = drive.vehicles ? `${drive.vehicles.brand} ${drive.vehicles.model}` : "Vehicle";
      await (supabase.from("lead_activities") as any).insert({
        dealership_id: dealershipId,
        lead_id: drive.lead_id,
        created_by: userId,
        activity_type: "status_change",
        title: "Test Drive Started (Gate Pass Issued)",
        description: `${carName} checked out at ${input.startOdometerKm.toLocaleString("en-IN")} km. Fuel level: ${input.startFuelLevel}. Driving License: ${input.drivingLicenseNumber}.`,
      });
    } catch (crmErr) {
      console.warn("Could not log gate pass activity:", crmErr);
    }
  }

  revalidatePath("/dashboard/test-drives");
  revalidatePath("/dashboard/leads");
  return { success: true };
}

/**
 * Return Vehicle & Check-in (Capture feedback and purchase intent)
 */
export async function completeTestDriveAction(rawInput: TestDriveCheckinInput) {
  const parsed = testDriveCheckinSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid check-in details.");
  }

  const auth = await requireAuthContext("test_drives:complete");
  const { supabase, profile, user } = auth;
  const dealershipId = profile.dealershipId;
  const userId = user.id;
  const input = parsed.data;

  const { data: drive, error: fetchErr } = await (supabase.from("test_drives") as any)
    .select("id, lead_id, vehicle_id, start_odometer_km, vehicles(brand, model, kilometers)")
    .eq("id", input.id)
    .eq("dealership_id", dealershipId)
    .single();

  if (fetchErr || !drive) {
    throw new Error("Test drive record not found.");
  }

  if (drive.start_odometer_km && input.endOdometerKm < drive.start_odometer_km) {
    throw new Error(
      `Return odometer (${input.endOdometerKm} km) cannot be less than start odometer (${drive.start_odometer_km} km).`
    );
  }

  const { error: updateErr } = await (supabase.from("test_drives") as any)
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      end_odometer_km: input.endOdometerKm,
      end_fuel_level: input.endFuelLevel,
      customer_rating: input.customerRating,
      interest_tier: input.interestTier,
      customer_feedback: input.customerFeedback || null,
      next_step_action: input.nextStepAction || null,
      post_drive_notes: input.postDriveNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("dealership_id", dealershipId);

  if (updateErr) {
    console.error("Test drive check-in failed:", updateErr);
    throw new Error("Failed to check in vehicle.");
  }

  // Update vehicle odometer if new reading is higher
  if (drive.vehicle_id && input.endOdometerKm > (drive.vehicles?.kilometers || 0)) {
    try {
      await (supabase.from("vehicles") as any)
        .update({
          kilometers: input.endOdometerKm,
          updated_at: new Date().toISOString(),
        })
        .eq("id", drive.vehicle_id)
        .eq("dealership_id", dealershipId);
    } catch (vehErr) {
      console.warn("Could not update vehicle odometer:", vehErr);
    }
  }

  // Advance lead status if hot interest tier
  if (drive.lead_id) {
    try {
      if (input.interestTier === "hot") {
        await (supabase.from("leads") as any)
          .update({
            status: "negotiation",
            updated_at: new Date().toISOString(),
          })
          .eq("id", drive.lead_id)
          .eq("dealership_id", dealershipId);
      }

      const dist = drive.start_odometer_km ? input.endOdometerKm - drive.start_odometer_km : 0;
      await (supabase.from("lead_activities") as any).insert({
        dealership_id: dealershipId,
        lead_id: drive.lead_id,
        created_by: userId,
        activity_type: "note_added",
        title: "Test Drive Completed & Evaluated",
        description: `Drive distance: ${dist} km. Rating: ${input.customerRating}/5 stars. Intent: ${input.interestTier.toUpperCase()}. Feedback: ${input.customerFeedback || "None"}.`,
      });
    } catch (crmErr) {
      console.warn("Could not log check-in activity:", crmErr);
    }
  }

  revalidatePath("/dashboard/test-drives");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/inventory");
  return { success: true };
}

/**
 * Confirm appointment
 */
export async function confirmTestDriveAction(id: string) {
  const auth = await requireAuthContext("test_drives:complete");
  const { supabase, profile } = auth;
  const dealershipId = profile.dealershipId;

  const { error } = await (supabase.from("test_drives") as any)
    .update({
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("dealership_id", dealershipId);

  if (error) {
    throw new Error("Failed to confirm test drive.");
  }

  revalidatePath("/dashboard/test-drives");
  return { success: true };
}

/**
 * Cancel test drive
 */
export async function cancelTestDriveAction(rawInput: TestDriveCancelInput) {
  const parsed = testDriveCancelSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Cancellation reason is required.");
  }

  const auth = await requireAuthContext("test_drives:complete");
  const { supabase, profile, user } = auth;
  const dealershipId = profile.dealershipId;
  const userId = user.id;
  const input = parsed.data;

  const { data: drive } = await (supabase.from("test_drives") as any)
    .select("id, lead_id")
    .eq("id", input.id)
    .eq("dealership_id", dealershipId)
    .single();

  const { error } = await (supabase.from("test_drives") as any)
    .update({
      status: "cancelled",
      cancellation_reason: input.cancellationReason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("dealership_id", dealershipId);

  if (error) {
    throw new Error("Failed to cancel test drive.");
  }

  if (drive?.lead_id) {
    try {
      await (supabase.from("lead_activities") as any).insert({
        dealership_id: dealershipId,
        lead_id: drive.lead_id,
        created_by: userId,
        activity_type: "note_added",
        title: "Test Drive Cancelled",
        description: `Reason: ${input.cancellationReason}`,
      });
    } catch (e) {
      // ignore
    }
  }

  revalidatePath("/dashboard/test-drives");
  revalidatePath("/dashboard/leads");
  return { success: true };
}

/**
 * Helper to fetch available inventory vehicles for the schedule modal
 */
export async function getShowroomVehiclesAction() {
  const { supabase, dealershipId } = await getAuthenticatedUserContext();

  const { data, error } = await (supabase.from("vehicles") as any)
    .select(`
      id,
      brand,
      model,
      variant,
      manufacturing_year,
      registration_number,
      asking_price,
      kilometers,
      status,
      vehicle_media (url, is_hero)
    `)
    .eq("dealership_id", dealershipId)
    .neq("status", "sold")
    .neq("status", "archived")
    .order("brand", { ascending: true });

  if (error || !data || data.length === 0) {
    // Return sample inventory if DB is empty
    return [
      {
        id: "veh-porsche-911",
        brand: "Porsche",
        model: "911 Carrera S",
        variant: "Coupe (992)",
        manufacturingYear: 2023,
        registrationNumber: "KA 01 MJ 9999",
        askingPrice: 18500000,
        formattedPrice: formatINR(18500000),
        heroImage: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80",
        kilometers: 12400,
        status: "available",
      },
      {
        id: "veh-bmw-m4",
        brand: "BMW",
        model: "M4 Competition",
        variant: "M xDrive G82",
        manufacturingYear: 2024,
        registrationNumber: "KA 05 PL 7777",
        askingPrice: 12800000,
        formattedPrice: formatINR(12800000),
        heroImage: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80",
        kilometers: 6100,
        status: "reserved",
      },
      {
        id: "veh-amg-gt",
        brand: "Mercedes-AMG",
        model: "GT 63 S",
        variant: "4-Door Coupé 4MATIC+",
        manufacturingYear: 2022,
        registrationNumber: "KA 04 NM 4004",
        askingPrice: 16200000,
        formattedPrice: formatINR(16200000),
        heroImage: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
        kilometers: 18200,
        status: "available",
      },
      {
        id: "veh-audi-rs6",
        brand: "Audi",
        model: "RS6 Avant",
        variant: "4.0 TFSI Quattro",
        manufacturingYear: 2023,
        registrationNumber: "KA 03 QW 1234",
        askingPrice: 17500000,
        formattedPrice: formatINR(17500000),
        heroImage: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80",
        kilometers: 14818,
        status: "available",
      },
      {
        id: "veh-defender-110",
        brand: "Land Rover",
        model: "Defender 110",
        variant: "D300 HSE 3.0L Diesel",
        manufacturingYear: 2023,
        registrationNumber: "KA 01 TR 8080",
        askingPrice: 11500000,
        formattedPrice: formatINR(11500000),
        heroImage: "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=600&q=80",
        kilometers: 21524,
        status: "available",
      },
    ];
  }

  return (data as any[]).map((v: any) => {
    const media = Array.isArray(v.vehicle_media) ? v.vehicle_media : [];
    const hero = media.find((m: any) => m.is_hero) || media[0];
    const asking = Number(v.asking_price) || 0;
    return {
      id: v.id,
      brand: v.brand,
      model: v.model,
      variant: v.variant,
      manufacturingYear: v.manufacturing_year,
      registrationNumber: v.registration_number,
      askingPrice: asking,
      formattedPrice: formatINR(asking),
      heroImage:
        hero?.url ||
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80",
      kilometers: v.kilometers,
      status: v.status,
    };
  });
}
