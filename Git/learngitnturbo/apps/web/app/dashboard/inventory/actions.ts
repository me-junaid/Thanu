"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedContext } from "../../../lib/auth";
import { assertPermission, requireAuthContext } from "../../../lib/permissions";
import { formatINR, formatINRCompact } from "../../../lib/currency";
import {
  vehicleCreateSchema,
  vehicleUpdateStatusSchema,
  type VehicleCreateInput,
  type VehicleUpdateStatusInput,
} from "../../../lib/schemas/vehicle";

export interface InventoryVehicle {
  id: string;
  dealershipId: string;
  brand: string;
  model: string;
  variant: string | null;
  manufacturingYear: number;
  registrationYear: number;
  registrationNumber: string | null;
  vin: string | null;
  fuelType: "petrol" | "diesel" | "hybrid" | "electric" | "cng";
  transmission: "manual" | "automatic" | "dual_clutch" | "pdk";
  bodyType: "coupe" | "sedan" | "suv" | "hatchback" | "convertible" | "wagon";
  kilometers: number;
  ownershipCount: number;
  exteriorColor: string | null;
  interiorColor: string | null;
  askingPrice: number;
  formattedPrice: string;
  featured: boolean;
  certified: boolean;
  description: string | null;
  // Private Financials
  purchasePrice: number | null;
  formattedPurchasePrice: string | null;
  refurbishmentCost: number | null;
  estimatedMargin: number | null;
  marginPercentage: number | null;
  status: "draft" | "in_refurbishment" | "available" | "reserved" | "sold" | "archived";
  heroImage: string;
  mediaUrls: string[];
  daysInStock: number;
  createdAt: string;
}

export interface InventoryStats {
  totalCount: number;
  availableCount: number;
  reservedCount: number;
  refurbishmentCount: number;
  soldCount: number;
  totalInvestedCapital: number;
  formattedInvestedCapital: string;
  projectedGrossMargin: number;
  formattedProjectedMargin: string;
  averageMarginPercentage: number;
}

export interface InventoryFilterOptions {
  searchQuery?: string;
  status?: string;
  fuelType?: string;
  transmission?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "km_asc" | "margin_desc";
}

/**
 * Get verified caller's dealership_id and role using request-cached auth context
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
    role: auth.profile.role,
    userId: auth.user.id,
    userName: auth.profile.fullName,
    auth,
  };
}

/**
 * Fetch all vehicles with media for the caller's showroom lot
 */
export async function getInventoryAction(
  options: InventoryFilterOptions = {}
): Promise<{ vehicles: InventoryVehicle[]; stats: InventoryStats }> {
  const auth = await requireAuthContext("inventory:view");
  const isPrivileged = auth.can("inventory:view_financials");
  const supabase = auth.supabase;
  const dealershipId = auth.profile.dealershipId;

  let query = (supabase.from("vehicles") as any)
    .select(`
      *,
      vehicle_media (*)
    `)
    .eq("dealership_id", dealershipId);

  // Apply status filter
  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  // Apply fuel type filter
  if (options.fuelType && options.fuelType !== "all") {
    query = query.eq("fuel_type", options.fuelType);
  }

  // Apply transmission filter
  if (options.transmission && options.transmission !== "all") {
    query = query.eq("transmission", options.transmission);
  }

  // Apply sorting
  switch (options.sortBy) {
    case "price_asc":
      query = query.order("asking_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("asking_price", { ascending: false });
      break;
    case "km_asc":
      query = query.order("kilometers", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data: rawVehicles, error } = await query;

  if (error) {
    console.error("Error fetching vehicles:", error);
    throw new Error("Failed to load inventory vehicles.");
  }

  const now = new Date();
  const vehicles: InventoryVehicle[] = [];

  let totalCount = 0;
  let availableCount = 0;
  let reservedCount = 0;
  let refurbishmentCount = 0;
  let soldCount = 0;
  let totalInvestedCapital = 0;
  let totalProjectedMargin = 0;

  for (const item of rawVehicles || []) {
    totalCount++;
    if (item.status === "available") availableCount++;
    else if (item.status === "reserved") reservedCount++;
    else if (item.status === "in_refurbishment") refurbishmentCount++;
    else if (item.status === "sold") soldCount++;

    const purchase = item.purchase_price ? Number(item.purchase_price) : 0;
    const refurb = item.refurbishment_cost ? Number(item.refurbishment_cost) : 0;
    const asking = Number(item.asking_price) || 0;

    const invested = purchase + refurb;
    totalInvestedCapital += invested;

    const margin = asking > 0 && invested > 0 ? asking - invested : 0;
    if (item.status !== "sold" && item.status !== "archived") {
      totalProjectedMargin += margin;
    }

    const marginPct = invested > 0 ? (margin / invested) * 100 : 0;

    // Filter media items
    const mediaList = Array.isArray(item.vehicle_media) ? item.vehicle_media : [];
    const heroObj = mediaList.find((m: any) => m.is_hero) || mediaList[0];
    const heroImage =
      heroObj?.url ||
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80";

    const createdDate = new Date(item.created_at);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const daysInStock = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Client-side text search (matches brand, model, variant, reg number)
    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      const match =
        item.brand?.toLowerCase().includes(q) ||
        item.model?.toLowerCase().includes(q) ||
        item.variant?.toLowerCase().includes(q) ||
        item.registration_number?.toLowerCase().includes(q) ||
        item.vin?.toLowerCase().includes(q);

      if (!match) continue;
    }

    vehicles.push({
      id: item.id,
      dealershipId: item.dealership_id,
      brand: item.brand,
      model: item.model,
      variant: item.variant,
      manufacturingYear: item.manufacturing_year,
      registrationYear: item.registration_year,
      registrationNumber: item.registration_number,
      vin: item.vin,
      fuelType: item.fuel_type,
      transmission: item.transmission,
      bodyType: item.body_type,
      kilometers: item.kilometers,
      ownershipCount: item.ownership_count,
      exteriorColor: item.exterior_color,
      interiorColor: item.interior_color,
      askingPrice: asking,
      formattedPrice: formatINR(asking),
      featured: item.featured,
      certified: item.certified,
      description: item.description,
      // Mask financial numbers if caller lacks privilege
      purchasePrice: isPrivileged ? purchase : null,
      formattedPurchasePrice: isPrivileged && purchase > 0 ? formatINR(purchase) : null,
      refurbishmentCost: isPrivileged ? refurb : null,
      estimatedMargin: isPrivileged ? margin : null,
      marginPercentage: isPrivileged ? Math.round(marginPct * 10) / 10 : null,
      status: item.status,
      heroImage,
      mediaUrls: mediaList.map((m: any) => m.url),
      daysInStock,
      createdAt: item.created_at,
    });
  }

  const avgMarginPercentage =
    totalInvestedCapital > 0
      ? Math.round((totalProjectedMargin / totalInvestedCapital) * 1000) / 10
      : 0;

  const stats: InventoryStats = {
    totalCount,
    availableCount,
    reservedCount,
    refurbishmentCount,
    soldCount,
    totalInvestedCapital: isPrivileged ? totalInvestedCapital : 0,
    formattedInvestedCapital: isPrivileged ? formatINRCompact(totalInvestedCapital) : "—",
    projectedGrossMargin: isPrivileged ? totalProjectedMargin : 0,
    formattedProjectedMargin: isPrivileged ? formatINRCompact(totalProjectedMargin) : "—",
    averageMarginPercentage: isPrivileged ? avgMarginPercentage : 0,
  };

  return { vehicles, stats };
}

/**
 * Update Vehicle Lifecycle Status
 */
export async function updateVehicleStatusAction(input: VehicleUpdateStatusInput) {
  const validation = vehicleUpdateStatusSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || "Invalid status payload");
  }

  const { vehicleId, status } = validation.data;
  const auth = await requireAuthContext("inventory:edit");
  const { supabase, profile } = auth;
  const dealershipId = profile.dealershipId;

  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "sold") {
    updates.sold_at = new Date().toISOString();
  } else {
    updates.sold_at = null;
  }

  const { error } = await (supabase.from("vehicles") as any)
    .update(updates)
    .eq("id", vehicleId)
    .eq("dealership_id", dealershipId);

  if (error) {
    console.error("Error updating vehicle status:", error);
    throw new Error("Failed to update vehicle status.");
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/inventory");
  return { success: true };
}

/**
 * Create a new Vehicle record
 */
export async function createVehicleAction(input: VehicleCreateInput) {
  const validation = vehicleCreateSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || "Validation failed");
  }

  const data = validation.data;
  const auth = await requireAuthContext("inventory:create");
  const { supabase, profile } = auth;
  const dealershipId = profile.dealershipId;

  const { data: newVehicle, error: vehicleError } = await (supabase
    .from("vehicles") as any)
    .insert({
      dealership_id: dealershipId,
      brand: data.brand.trim(),
      model: data.model.trim(),
      variant: data.variant?.trim() || null,
      manufacturing_year: data.manufacturingYear,
      registration_year: data.registrationYear,
      registration_number: data.registrationNumber?.trim() || null,
      vin: data.vin?.trim() || null,
      fuel_type: data.fuelType,
      transmission: data.transmission,
      body_type: data.bodyType,
      kilometers: data.kilometers,
      ownership_count: data.ownershipCount,
      exterior_color: data.exteriorColor?.trim() || null,
      interior_color: data.interiorColor?.trim() || null,
      asking_price: data.askingPrice,
      featured: data.featured,
      certified: data.certified,
      description: data.description?.trim() || null,
      purchase_price: data.purchasePrice || null,
      refurbishment_cost: data.refurbishmentCost || 0,
      minimum_floor_price: data.minimumFloorPrice || null,
      internal_notes: data.internalNotes?.trim() || null,
      status: data.status,
    })
    .select("id")
    .single();

  if (vehicleError || !newVehicle) {
    console.error("Error creating vehicle:", vehicleError);
    throw new Error(vehicleError?.message || "Failed to create vehicle record.");
  }

  // Insert hero media if provided
  if (data.heroImageUrl) {
    await (supabase.from("vehicle_media") as any).insert({
      dealership_id: dealershipId,
      vehicle_id: newVehicle.id,
      url: data.heroImageUrl,
      is_hero: true,
      sort_order: 0,
    });
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/inventory");
  return { success: true, vehicleId: newVehicle.id };
}

/**
 * Delete a Vehicle record (Owner / Admin with inventory:delete capability only)
 */
export async function deleteVehicleAction(vehicleId: string) {
  const auth = await requireAuthContext(
    "inventory:delete",
    "Only Showroom Principals and General Managers can permanently delete vehicles."
  );
  const { supabase, profile } = auth;
  const dealershipId = profile.dealershipId;

  const { error } = await (supabase.from("vehicles") as any)
    .delete()
    .eq("id", vehicleId)
    .eq("dealership_id", dealershipId);

  if (error) {
    console.error("Error deleting vehicle:", error);
    throw new Error("Failed to delete vehicle.");
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/inventory");
  return { success: true };
}

