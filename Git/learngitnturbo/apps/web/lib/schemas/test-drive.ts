import { z } from "zod";

export const testDriveStatusSchema = z.enum([
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);

export const fuelLevelSchema = z.enum([
  "reserve",
  "quarter",
  "half",
  "three_quarters",
  "full",
]);

export const customerInterestTierSchema = z.enum(["hot", "warm", "cold"]);

export const testDriveScheduleSchema = z.object({
  vehicleId: z.string().uuid("Please select a vehicle from inventory"),
  leadId: z.string().uuid().optional().or(z.literal("")).nullable(),
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: z.string().min(8, "Valid phone number is required"),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")).nullable(),
  drivingLicenseNumber: z.string().optional().or(z.literal("")).nullable(),
  scheduledAt: z.string().min(1, "Appointment date and time required"),
  durationMinutes: z.coerce.number().min(15).max(180).default(30),
  assignedTo: z.string().uuid().optional().or(z.literal("")).nullable(),
  preDriveNotes: z.string().optional().nullable(),
});

export const testDriveCheckoutSchema = z.object({
  id: z.string().uuid("Invalid test drive ID"),
  startOdometerKm: z.coerce.number().min(0, "Valid starting odometer reading is required"),
  startFuelLevel: fuelLevelSchema.default("half"),
  drivingLicenseNumber: z.string().min(4, "Driving license number is required for gate pass rollout"),
  drivingLicenseUrl: z.string().optional().or(z.literal("")).nullable(),
  preDriveNotes: z.string().optional().nullable(),
  assignedTo: z.string().uuid().optional().or(z.literal("")).nullable(),
});

export const testDriveCheckinSchema = z.object({
  id: z.string().uuid("Invalid test drive ID"),
  endOdometerKm: z.coerce.number().min(0, "Valid return odometer reading is required"),
  endFuelLevel: fuelLevelSchema.default("half"),
  customerRating: z.coerce.number().min(1).max(5).default(5),
  interestTier: customerInterestTierSchema.default("warm"),
  customerFeedback: z.string().optional().nullable(),
  nextStepAction: z.string().optional().nullable(),
  postDriveNotes: z.string().optional().nullable(),
});

export const testDriveCancelSchema = z.object({
  id: z.string().uuid("Invalid test drive ID"),
  cancellationReason: z.string().min(2, "Cancellation reason is required"),
});

export type TestDriveScheduleInput = z.infer<typeof testDriveScheduleSchema>;
export type TestDriveCheckoutInput = z.infer<typeof testDriveCheckoutSchema>;
export type TestDriveCheckinInput = z.infer<typeof testDriveCheckinSchema>;
export type TestDriveCancelInput = z.infer<typeof testDriveCancelSchema>;

