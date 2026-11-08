import { z } from "zod";

export const dealStatusSchema = z.enum([
  "draft",
  "token_booked",
  "financing_pending",
  "payment_cleared",
  "delivered",
  "rto_in_progress",
  "completed",
  "cancelled",
]);

export const paymentMethodSchema = z.enum([
  "upi",
  "bank_transfer",
  "cheque",
  "cash",
  "card",
  "auto_loan",
  "exchange_trade_in",
]);

export const paymentTypeSchema = z.enum([
  "token_deposit",
  "down_payment",
  "loan_disbursement",
  "exchange_adjustment",
  "final_settlement",
  "refund",
]);

export const paymentStatusSchema = z.enum([
  "pending_clearance",
  "cleared",
  "bounced",
  "refunded",
]);

export const rtoTransferStatusSchema = z.enum([
  "pending_docs",
  "docs_collected",
  "submitted_to_rto",
  "scrutiny_approved",
  "rc_transferred",
  "disputed",
]);

export const reconditioningCategorySchema = z.enum([
  "mechanical_repair",
  "bodywork_paint",
  "detailing_ceramic",
  "tyre_replacement",
  "interior_restoration",
  "electrical_battery",
  "rto_paperwork_fines",
  "transportation_towing",
  "other",
]);

export const createSalesDealSchema = z.object({
  vehicleId: z.string().min(1, "Please select an available vehicle from inventory"),
  leadId: z.string().optional().or(z.literal("")).nullable(),
  salesRepId: z.string().optional().or(z.literal("")).nullable(),
  customerName: z.string().min(2, "Customer full name is required"),
  customerPhone: z.string().min(8, "Valid phone number is required"),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")).nullable(),
  customerAddress: z.string().optional().or(z.literal("")).nullable(),
  customerPan: z.string().optional().or(z.literal("")).nullable(),
  customerAadhaar: z.string().optional().or(z.literal("")).nullable(),
  agreedSellingPrice: z.coerce.number().min(10000, "Selling price must be at least ₹10,000"),
  rtoTransferCharges: z.coerce.number().min(0).default(0),
  insuranceCharges: z.coerce.number().min(0).default(0),
  extendedWarrantyFee: z.coerce.number().min(0).default(0),
  accessoriesCharges: z.coerce.number().min(0).default(0),
  discountAmount: z.coerce.number().min(0).default(0),
  tokenAmount: z.coerce.number().min(0).default(0),
  isTokenRefundable: z.boolean().default(false),
  isFinanced: z.boolean().default(false),
  financierName: z.string().optional().or(z.literal("")).nullable(),
  loanSanctionedAmount: z.coerce.number().min(0).default(0),
  hasExchange: z.boolean().default(false),
  exchangeAllowance: z.coerce.number().min(0).default(0),
  salesCommissionAmount: z.coerce.number().min(0).default(0),
  internalNotes: z.string().optional().nullable(),
});

export const recordPaymentSchema = z.object({
  dealId: z.string().min(1, "Invalid deal ID"),
  amount: z.coerce.number().min(100, "Minimum payment amount is ₹100"),
  paymentType: paymentTypeSchema.default("down_payment"),
  paymentMethod: paymentMethodSchema.default("bank_transfer"),
  transactionRef: z.string().min(2, "Transaction reference or UTR is required"),
  chequeBankName: z.string().optional().or(z.literal("")).nullable(),
  chequeDate: z.string().optional().or(z.literal("")).nullable(),
  notes: z.string().optional().nullable(),
});

export const addVehicleExpenseSchema = z.object({
  vehicleId: z.string().min(1, "Invalid vehicle ID"),
  category: reconditioningCategorySchema.default("mechanical_repair"),
  description: z.string().min(3, "Detailed expense description required"),
  amount: z.coerce.number().min(1, "Expense amount must be positive"),
  vendorName: z.string().optional().or(z.literal("")).nullable(),
  invoiceNumber: z.string().optional().or(z.literal("")).nullable(),
  invoiceDate: z.string().optional().or(z.literal("")).nullable(),
});

export const issueDeliveryGatePassSchema = z.object({
  dealId: z.string().min(1, "Invalid deal ID"),
  deliveryOdometerKm: z.coerce.number().min(0, "Current odometer reading required"),
  deliveryFuelLevel: z.string().min(1, "Fuel level specification required").default("full"),
  handoverNotes: z.string().optional().nullable(),
});

export const updateRtoStatusSchema = z.object({
  dealId: z.string().min(1, "Invalid deal ID"),
  rtoStatus: rtoTransferStatusSchema,
  rtoApplicationNo: z.string().optional().or(z.literal("")).nullable(),
  rtoCompletionDate: z.string().optional().or(z.literal("")).nullable(),
  newRcSmartcardUrl: z.string().optional().or(z.literal("")).nullable(),
});

export type CreateSalesDealInput = z.infer<typeof createSalesDealSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type AddVehicleExpenseInput = z.infer<typeof addVehicleExpenseSchema>;
export type IssueDeliveryGatePassInput = z.infer<typeof issueDeliveryGatePassSchema>;
export type UpdateRtoStatusInput = z.infer<typeof updateRtoStatusSchema>;

