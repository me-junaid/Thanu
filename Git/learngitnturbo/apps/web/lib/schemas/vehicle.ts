import { z } from "zod";

export const vehicleStatusSchema = z.enum([
  "draft",
  "in_refurbishment",
  "available",
  "reserved",
  "sold",
  "archived",
]);

export const vehicleFuelTypeSchema = z.enum([
  "petrol",
  "diesel",
  "hybrid",
  "electric",
  "cng",
]);

export const vehicleTransmissionSchema = z.enum([
  "manual",
  "automatic",
  "dual_clutch",
  "pdk",
]);

export const vehicleBodyTypeSchema = z.enum([
  "coupe",
  "sedan",
  "suv",
  "hatchback",
  "convertible",
  "wagon",
]);

export const vehicleCreateSchema = z.object({
  brand: z.string().min(2, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  variant: z.string().optional().nullable(),
  manufacturingYear: z
    .number()
    .int()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  registrationYear: z
    .number()
    .int()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  registrationNumber: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
  fuelType: vehicleFuelTypeSchema.default("petrol"),
  transmission: vehicleTransmissionSchema.default("automatic"),
  bodyType: vehicleBodyTypeSchema.default("sedan"),
  kilometers: z.number().int().min(0, "Kilometers must be positive"),
  ownershipCount: z.number().int().min(1).max(10).default(1),
  exteriorColor: z.string().optional().nullable(),
  interiorColor: z.string().optional().nullable(),
  askingPrice: z.number().min(10000, "Price must be at least ₹10,000"),
  featured: z.boolean().default(false),
  certified: z.boolean().default(true),
  description: z.string().optional().nullable(),
  // Private Financials
  purchasePrice: z.number().optional().nullable(),
  refurbishmentCost: z.number().optional().nullable().default(0),
  minimumFloorPrice: z.number().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  status: vehicleStatusSchema.default("available"),
  heroImageUrl: z.string().url().optional().nullable(),
});

export const vehicleUpdateStatusSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle ID"),
  status: vehicleStatusSchema,
});

export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateStatusInput = z.infer<typeof vehicleUpdateStatusSchema>;

