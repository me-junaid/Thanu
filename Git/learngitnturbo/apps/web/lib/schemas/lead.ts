import { z } from "zod";

export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "interested",
  "test_drive_scheduled",
  "negotiation",
  "booked",
  "converted",
  "lost",
]);

export const leadSourceSchema = z.enum([
  "website_form",
  "whatsapp_direct",
  "showroom_walkin",
  "phone_call",
  "referral",
  "other",
]);

export const leadPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
]);

export const leadCreateSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  phoneNumber: z.string().min(8, "Valid phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")).nullable(),
  city: z.string().optional().nullable(),
  vehicleId: z.string().uuid().optional().or(z.literal("")).nullable(),
  source: leadSourceSchema.default("showroom_walkin"),
  status: leadStatusSchema.default("new"),
  priority: leadPrioritySchema.default("medium"),
  budgetAmount: z.number().optional().nullable(),
  financingRequired: z.boolean().default(false),
  tradeInVehicle: z.string().optional().nullable(),
  assignedTo: z.string().uuid().optional().or(z.literal("")).nullable(),
  nextFollowupAt: z.string().optional().nullable(),
  initialNote: z.string().optional().nullable(),
});

export const leadUpdateStatusSchema = z.object({
  leadId: z.string().uuid("Invalid lead ID"),
  status: leadStatusSchema,
  note: z.string().optional().nullable(),
});

export const leadAddActivitySchema = z.object({
  leadId: z.string().uuid("Invalid lead ID"),
  activityType: z.enum([
    "status_change",
    "note_added",
    "call_logged",
    "whatsapp_sent",
    "test_drive_booked",
    "assignment_change",
  ]),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional().nullable(),
});

export const leadAssignSchema = z.object({
  leadId: z.string().uuid("Invalid lead ID"),
  assignedTo: z.string().uuid("Invalid profile ID").nullable(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadUpdateStatusInput = z.infer<typeof leadUpdateStatusSchema>;
export type LeadAddActivityInput = z.infer<typeof leadAddActivitySchema>;
export type LeadAssignInput = z.infer<typeof leadAssignSchema>;

