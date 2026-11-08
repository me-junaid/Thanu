"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedContext } from "../../../lib/auth";
import { requireAuthContext, assertPermission, ForbiddenError } from "../../../lib/permissions";
import { formatINR, formatINRCompact } from "../../../lib/currency";
import {
  leadCreateSchema,
  leadUpdateStatusSchema,
  leadAddActivitySchema,
  leadAssignSchema,
  type LeadCreateInput,
  type LeadUpdateStatusInput,
  type LeadAddActivityInput,
  type LeadAssignInput,
} from "../../../lib/schemas/lead";

export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "test_drive_scheduled"
  | "negotiation"
  | "booked"
  | "converted"
  | "lost";

export type LeadSource =
  | "website_form"
  | "whatsapp_direct"
  | "showroom_walkin"
  | "phone_call"
  | "referral"
  | "other";

export type LeadPriority = "low" | "medium" | "high" | "urgent";

export interface LeadActivityItem {
  id: string;
  leadId: string;
  createdBy: string | null;
  authorName: string;
  activityType:
    | "status_change"
    | "note_added"
    | "call_logged"
    | "whatsapp_sent"
    | "test_drive_booked"
    | "assignment_change";
  title: string;
  description: string | null;
  createdAt: string;
}

export interface LeadVehicleSummary {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  manufacturingYear: number;
  askingPrice: number;
  formattedPrice: string;
  heroImage: string;
  status: string;
}

export interface LeadItem {
  id: string;
  dealershipId: string;
  customerName: string;
  phoneNumber: string;
  email: string | null;
  city: string | null;
  vehicleId: string | null;
  vehicle: LeadVehicleSummary | null;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  budgetAmount: number | null;
  formattedBudget: string | null;
  financingRequired: boolean;
  tradeInVehicle: string | null;
  assignedTo: string | null;
  assignedStaffName: string | null;
  nextFollowupAt: string | null;
  isFollowupDue: boolean;
  lostReason: string | null;
  activities: LeadActivityItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadsStats {
  totalActive: number;
  newCount: number;
  testDriveCount: number;
  negotiationCount: number;
  bookedCount: number;
  convertedCount: number;
  followupsDueToday: number;
  totalPipelineValue: number;
  formattedPipelineValue: string;
}

export interface LeadsFilterOptions {
  searchQuery?: string;
  status?: string;
  source?: string;
  priority?: string;
  assignedTo?: string;
  sortBy?: "newest" | "followup_asc" | "priority_desc" | "budget_desc";
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
 * Fetch all leads, linked vehicle info, assigned staff, and activity history
 */
export async function getLeadsAction(
  options: LeadsFilterOptions = {}
): Promise<{ leads: LeadItem[]; stats: LeadsStats }> {
  const auth = await requireAuthContext();
  if (!auth.can("leads:view_all") && !auth.can("leads:view_assigned_only")) {
    throw new ForbiddenError(
      "Forbidden: You do not have permission to view leads CRM.",
      "leads:view_all"
    );
  }

  const { supabase, profile, user } = auth;
  const dealershipId = profile.dealershipId;
  const isAssignedOnly = !auth.can("leads:view_all") && auth.can("leads:view_assigned_only");

  // Query leads with joined vehicles and assigned staff profiles with pruned projections
  let query = (supabase.from("leads") as any)
    .select(`
      id,
      dealership_id,
      customer_name,
      phone_number,
      email,
      city,
      vehicle_id,
      source,
      status,
      priority,
      budget_amount,
      financing_required,
      trade_in_vehicle,
      assigned_to,
      next_followup_at,
      lost_reason,
      created_at,
      updated_at,
      vehicles (
        id,
        brand,
        model,
        variant,
        manufacturing_year,
        asking_price,
        status,
        vehicle_media (url, is_hero)
      ),
      profiles (
        id,
        full_name
      ),
      lead_activities (
        id,
        lead_id,
        created_by,
        activity_type,
        title,
        description,
        created_at,
        profiles (full_name)
      )
    `)
    .eq("dealership_id", dealershipId);

  // Filter: Status
  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  // Filter: Source
  if (options.source && options.source !== "all") {
    query = query.eq("source", options.source);
  }

  // Filter: Priority
  if (options.priority && options.priority !== "all") {
    query = query.eq("priority", options.priority);
  }

  // Filter: Assigned staff / Isolation scoping
  if (isAssignedOnly) {
    // Strictly isolate sales reps to their own assigned leads
    query = query.eq("assigned_to", user.id);
  } else if (options.assignedTo && options.assignedTo !== "all") {
    query = query.eq("assigned_to", options.assignedTo);
  }

  // Order
  switch (options.sortBy) {
    case "followup_asc":
      query = query.order("next_followup_at", { ascending: true, nullsFirst: false });
      break;
    case "budget_desc":
      query = query.order("budget_amount", { ascending: false, nullsFirst: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data: rawLeads, error } = await query;

  if (error) {
    console.error("Error fetching leads:", error);
    throw new Error("Failed to load leads from database.");
  }

  const now = new Date();
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  let totalActive = 0;
  let newCount = 0;
  let testDriveCount = 0;
  let negotiationCount = 0;
  let bookedCount = 0;
  let convertedCount = 0;
  let followupsDueToday = 0;
  let totalPipelineValue = 0;

  const leads: LeadItem[] = [];

  for (const item of rawLeads || []) {
    // Stats calculation
    const status = item.status as LeadStatus;
    if (status !== "lost" && status !== "converted") {
      totalActive++;
    }

    if (status === "new") newCount++;
    else if (status === "test_drive_scheduled") testDriveCount++;
    else if (status === "negotiation") negotiationCount++;
    else if (status === "booked") bookedCount++;
    else if (status === "converted") convertedCount++;

    const budget = item.budget_amount ? Number(item.budget_amount) : 0;
    if (status !== "lost") {
      totalPipelineValue += budget;
    }

    const nextFollowup = item.next_followup_at ? new Date(item.next_followup_at) : null;
    const isDue = nextFollowup ? nextFollowup <= todayEnd && status !== "lost" && status !== "converted" : false;
    if (isDue) followupsDueToday++;

    // Client-side text search (matches customer name, phone, email, or car brand/model)
    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      const carText = item.vehicles
        ? `${item.vehicles.brand} ${item.vehicles.model} ${item.vehicles.variant || ""}`.toLowerCase()
        : "";
      const matches =
        item.customer_name?.toLowerCase().includes(q) ||
        item.phone_number?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        carText.includes(q);

      if (!matches) continue;
    }

    // Vehicle summary mapping
    let vehicleSummary: LeadVehicleSummary | null = null;
    if (item.vehicles) {
      const mediaList = Array.isArray(item.vehicles.vehicle_media)
        ? item.vehicles.vehicle_media
        : [];
      const hero = mediaList.find((m: any) => m.is_hero) || mediaList[0];
      const asking = Number(item.vehicles.asking_price) || 0;

      vehicleSummary = {
        id: item.vehicles.id,
        brand: item.vehicles.brand,
        model: item.vehicles.model,
        variant: item.vehicles.variant,
        manufacturingYear: item.vehicles.manufacturing_year,
        askingPrice: asking,
        formattedPrice: formatINR(asking),
        heroImage:
          hero?.url ||
          "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80",
        status: item.vehicles.status,
      };
    }

    // Lead activities mapping
    const rawActivities = Array.isArray(item.lead_activities) ? item.lead_activities : [];
    const activities: LeadActivityItem[] = rawActivities
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((act: any) => ({
        id: act.id,
        leadId: act.lead_id,
        createdBy: act.created_by,
        authorName: act.profiles?.full_name || "System",
        activityType: act.activity_type,
        title: act.title,
        description: act.description,
        createdAt: act.created_at,
      }));

    leads.push({
      id: item.id,
      dealershipId: item.dealership_id,
      customerName: item.customer_name,
      phoneNumber: item.phone_number,
      email: item.email,
      city: item.city,
      vehicleId: item.vehicle_id,
      vehicle: vehicleSummary,
      source: item.source,
      status: item.status,
      priority: item.priority,
      budgetAmount: budget > 0 ? budget : null,
      formattedBudget: budget > 0 ? formatINR(budget) : null,
      financingRequired: item.financing_required,
      tradeInVehicle: item.trade_in_vehicle,
      assignedTo: item.assigned_to,
      assignedStaffName: item.profiles?.full_name || "Unassigned",
      nextFollowupAt: item.next_followup_at,
      isFollowupDue: isDue,
      lostReason: item.lost_reason,
      activities,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    });
  }

  const stats: LeadsStats = {
    totalActive,
    newCount,
    testDriveCount,
    negotiationCount,
    bookedCount,
    convertedCount,
    followupsDueToday,
    totalPipelineValue,
    formattedPipelineValue: formatINRCompact(totalPipelineValue),
  };

  return { leads, stats };
}

/**
 * Create a new Lead (Showroom Walk-in, Phone Call, or Web Entry)
 */
export async function createLeadAction(input: LeadCreateInput) {
  const validation = leadCreateSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || "Validation failed");
  }

  const data = validation.data;
  const auth = await requireAuthContext("leads:create");
  const { supabase, profile, user } = auth;
  const dealershipId = profile.dealershipId;
  const userId = user.id;
  const userName = profile.fullName;

  // If caller cannot reassign leads to others, force assignment to themselves
  const assignedTo = auth.can("leads:reassign")
    ? (data.assignedTo || userId)
    : userId;

  const { data: newLead, error: leadError } = await (supabase.from("leads") as any)
    .insert({
      dealership_id: dealershipId,
      customer_name: data.customerName.trim(),
      phone_number: data.phoneNumber.trim(),
      email: data.email?.trim() || null,
      city: data.city?.trim() || null,
      vehicle_id: data.vehicleId || null,
      source: data.source,
      status: data.status,
      priority: data.priority,
      budget_amount: data.budgetAmount || null,
      financing_required: data.financingRequired,
      trade_in_vehicle: data.tradeInVehicle?.trim() || null,
      assigned_to: assignedTo,
      next_followup_at: data.nextFollowupAt || null,
    })
    .select("id")
    .single();

  if (leadError || !newLead) {
    console.error("Error creating lead:", leadError);
    throw new Error(leadError?.message || "Failed to create lead.");
  }

  // Create initial activity log entry
  const noteContent = data.initialNote?.trim() || `Inquiry created via ${data.source.replace("_", " ")} by ${userName}.`;
  await (supabase.from("lead_activities") as any).insert({
    dealership_id: dealershipId,
    lead_id: newLead.id,
    created_by: userId,
    activity_type: "note_added",
    title: "Lead Captured",
    description: noteContent,
  });

  revalidatePath("/dashboard/leads");
  return { success: true, leadId: newLead.id };
}

/**
 * Update Lead Stage / Status with mandatory or optional timeline note
 */
export async function updateLeadStatusAction(input: LeadUpdateStatusInput) {
  const validation = leadUpdateStatusSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || "Validation failed");
  }

  const { leadId, status, note } = validation.data;
  const auth = await requireAuthContext("leads:update");
  const { supabase, profile, user } = auth;
  const dealershipId = profile.dealershipId;
  const userId = user.id;
  const userName = profile.fullName;

  let updateQuery = (supabase.from("leads") as any)
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("dealership_id", dealershipId);

  // If sales rep has assigned-only rights, enforce lead ownership
  if (!auth.can("leads:view_all") && auth.can("leads:view_assigned_only")) {
    updateQuery = updateQuery.eq("assigned_to", userId);
  }

  const { error: updateError } = await updateQuery;

  if (updateError) {
    console.error("Error updating lead status:", updateError);
    throw new Error("Failed to update lead status.");
  }

  // Append status change to audit timeline
  const title = `Stage changed to ${status.replace(/_/g, " ").toUpperCase()}`;
  const description = note ? `${note} (Updated by ${userName})` : `Updated stage by ${userName}`;

  await (supabase.from("lead_activities") as any).insert({
    dealership_id: dealershipId,
    lead_id: leadId,
    created_by: userId,
    activity_type: "status_change",
    title,
    description,
  });

  revalidatePath("/dashboard/leads");
  return { success: true };
}

/**
 * Add a Note, Call Summary, or WhatsApp log to Lead Activity Timeline
 */
export async function addLeadActivityAction(input: LeadAddActivityInput) {
  const validation = leadAddActivitySchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || "Validation failed");
  }

  const { leadId, activityType, title, description } = validation.data;
  const auth = await requireAuthContext("leads:update");
  const { supabase, profile, user } = auth;
  const dealershipId = profile.dealershipId;
  const userId = user.id;

  const { error } = await (supabase.from("lead_activities") as any).insert({
    dealership_id: dealershipId,
    lead_id: leadId,
    created_by: userId,
    activity_type: activityType,
    title,
    description: description || null,
  });

  if (error) {
    console.error("Error logging activity:", error);
    throw new Error("Failed to add activity note.");
  }

  // Touch lead's updated_at
  await (supabase.from("leads") as any)
    .update({ updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("dealership_id", dealershipId);

  revalidatePath("/dashboard/leads");
  return { success: true };
}

/**
 * Assign Lead to a Sales Executive / Manager
 */
export async function assignLeadAction(input: LeadAssignInput) {
  const validation = leadAssignSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || "Validation failed");
  }

  const { leadId, assignedTo } = validation.data;
  const auth = await requireAuthContext(
    "leads:reassign",
    "Only Showroom Principals and Sales Managers can reassign leads."
  );
  const { supabase, profile, user } = auth;
  const dealershipId = profile.dealershipId;
  const userId = user.id;
  const userName = profile.fullName;

  const { error } = await (supabase.from("leads") as any)
    .update({
      assigned_to: assignedTo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("dealership_id", dealershipId);

  if (error) {
    console.error("Error assigning lead:", error);
    throw new Error("Failed to reassign lead.");
  }

  // Log assignment change
  await (supabase.from("lead_activities") as any).insert({
    dealership_id: dealershipId,
    lead_id: leadId,
    created_by: userId,
    activity_type: "assignment_change",
    title: "Lead Reassigned",
    description: `Assigned sales representative updated by ${userName}.`,
  });

  revalidatePath("/dashboard/leads");
  return { success: true };
}

/**
 * Fetch available showroom vehicles (for the "Vehicle of Interest" dropdown)
 */
export async function getLeadVehicleOptionsAction(): Promise<
  { id: string; label: string; price: string }[]
> {
  const { supabase, dealershipId } = await getAuthenticatedUserContext();

  const { data: vehicles } = await (supabase.from("vehicles") as any)
    .select("id, brand, model, variant, manufacturing_year, asking_price")
    .eq("dealership_id", dealershipId)
    .neq("status", "sold")
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  return (vehicles || []).map((v: any) => ({
    id: v.id,
    label: `${v.manufacturing_year} ${v.brand} ${v.model} ${v.variant || ""}`.trim(),
    price: formatINR(Number(v.asking_price) || 0),
  }));
}

/**
 * Fetch dealership staff (for the "Assigned Sales Rep" dropdown)
 */
export async function getDealershipStaffOptionsAction(): Promise<
  { id: string; fullName: string; role: string }[]
> {
  const { supabase, dealershipId } = await getAuthenticatedUserContext();

  const { data: staff } = await (supabase.from("profiles") as any)
    .select("id, full_name, role")
    .eq("dealership_id", dealershipId)
    .order("full_name", { ascending: true });

  return (staff || []).map((s: any) => ({
    id: s.id,
    fullName: s.full_name || "Showroom Staff",
    role: s.role || "sales_executive",
  }));
}

/**
 * Optimized bundle action running leads list, vehicle options, and staff options in parallel.
 * Reused by LeadsShell and predictive prefetcher for 0ms transitions.
 */
export async function getLeadsDashboardBundleAction(options: LeadsFilterOptions = {}): Promise<{
  leads: LeadItem[];
  stats: LeadsStats;
  vehicleOptions: { id: string; label: string; price: string }[];
  staffOptions: { id: string; fullName: string; role: string }[];
}> {
  const [{ leads, stats }, vehicleOptions, staffOptions] = await Promise.all([
    getLeadsAction(options),
    getLeadVehicleOptionsAction(),
    getDealershipStaffOptionsAction(),
  ]);

  return { leads, stats, vehicleOptions, staffOptions };
}

/**
 * Permanently Delete Lead (Principal / General Manager with leads:delete capability only)
 */
export async function deleteLeadAction(leadId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await requireAuthContext(
      "leads:delete",
      "Only Showroom Principals and General Managers can permanently delete leads."
    );
    const { supabase, profile } = auth;
    const dealershipId = profile.dealershipId;

    const { error } = await (supabase.from("leads") as any)
      .delete()
      .eq("id", leadId)
      .eq("dealership_id", dealershipId);

    if (error) {
      console.error("Error deleting lead:", error);
      return { success: false, error: "Failed to delete customer lead." };
    }

    revalidatePath("/dashboard/leads");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete lead." };
  }
}

