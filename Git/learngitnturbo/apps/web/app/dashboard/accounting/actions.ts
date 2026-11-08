"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedContext } from "../../../lib/auth";
import { formatINR } from "../../../lib/currency";
import {
  createSalesDealSchema,
  recordPaymentSchema,
  addVehicleExpenseSchema,
  issueDeliveryGatePassSchema,
  updateRtoStatusSchema,
  type CreateSalesDealInput,
  type RecordPaymentInput,
  type AddVehicleExpenseInput,
  type IssueDeliveryGatePassInput,
  type UpdateRtoStatusInput,
} from "../../../lib/schemas/accounting";
import { calculateUnitEconomics } from "../../../lib/accounting/margin-calculator";

export type DealStatus =
  | "draft"
  | "token_booked"
  | "financing_pending"
  | "payment_cleared"
  | "delivered"
  | "rto_in_progress"
  | "completed"
  | "cancelled";

export type PaymentMethod =
  | "upi"
  | "bank_transfer"
  | "cheque"
  | "cash"
  | "card"
  | "auto_loan"
  | "exchange_trade_in";

export type PaymentType =
  | "token_deposit"
  | "down_payment"
  | "loan_disbursement"
  | "exchange_adjustment"
  | "final_settlement"
  | "refund";

export type PaymentStatus =
  | "pending_clearance"
  | "cleared"
  | "bounced"
  | "refunded";

export type RtoTransferStatus =
  | "pending_docs"
  | "docs_collected"
  | "submitted_to_rto"
  | "scrutiny_approved"
  | "rc_transferred"
  | "disputed";

export type ReconditioningCategory =
  | "mechanical_repair"
  | "bodywork_paint"
  | "detailing_ceramic"
  | "tyre_replacement"
  | "interior_restoration"
  | "electrical_battery"
  | "rto_paperwork_fines"
  | "transportation_towing"
  | "other";

export interface DealVehicleSummary {
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
  purchasePrice: number;
  refurbishmentCost: number;
  landedCost: number;
}

export interface PaymentItem {
  id: string;
  paymentNumber: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: number;
  formattedAmount: string;
  transactionRef: string | null;
  chequeBankName: string | null;
  chequeDate: string | null;
  clearedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface SalesDealItem {
  id: string;
  dealNumber: string;
  dealershipId: string;
  vehicleId: string;
  vehicle: DealVehicleSummary;
  leadId: string | null;
  salesRepId: string | null;
  salesRepName: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string | null;
  customerPan: string | null;
  customerAadhaar: string | null;
  
  // Commercials
  agreedSellingPrice: number;
  formattedSellingPrice: string;
  rtoTransferCharges: number;
  insuranceCharges: number;
  extendedWarrantyFee: number;
  accessoriesCharges: number;
  discountAmount: number;
  totalDealAmount: number;
  formattedTotalDealAmount: string;

  // Payments & Balance
  tokenAmount: number;
  formattedTokenAmount: string;
  tokenPaidAt: string | null;
  tokenReceiptNumber: string | null;
  isTokenRefundable: boolean;
  totalPaid: number;
  formattedTotalPaid: string;
  balanceDue: number;
  formattedBalanceDue: string;
  payments: PaymentItem[];

  // Financing
  isFinanced: boolean;
  financierName: string | null;
  loanApplicationRef: string | null;
  loanSanctionedAmount: number;
  loanDisbursedAmount: number;
  deliveryOrderNumber: string | null;

  // Exchange
  hasExchange: boolean;
  exchangeAllowance: number;

  // Unit Economics (Protected)
  vehiclePurchaseCost: number;
  vehicleLandedCost: number;
  taxableMargin: number;
  gstRatePercent: number;
  cgstAmount: number;
  sgstAmount: number;
  totalGstOnMargin: number;
  netGrossProfit: number;
  formattedGrossProfit: string;
  grossMarginPercent: number;
  salesCommissionAmount: number;

  // Status & Milestones
  status: DealStatus;
  rtoStatus: RtoTransferStatus;
  rtoApplicationNo: string | null;
  rtoCompletionDate: string | null;
  newRcSmartcardUrl: string | null;

  // Gate Pass
  gatePassNumber: string | null;
  deliveredAt: string | null;
  deliveryOdometerKm: number | null;
  deliveryFuelLevel: string | null;
  deliveryNotes: string | null;

  cancellationReason: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleExpenseItem {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  registrationNumber: string | null;
  category: ReconditioningCategory;
  description: string;
  vendorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  amount: number;
  formattedAmount: string;
  receiptUrl: string | null;
  createdAt: string;
}

export interface AccountingMetrics {
  grossRevenueRealized: number;
  formattedGrossRevenue: string;
  netGrossProfit: number;
  formattedGrossProfit: string;
  avgGrossMarginPercent: number;
  capitalDeployedInStock: number;
  formattedCapitalDeployed: string;
  pendingReceivables: number;
  formattedPendingReceivables: string;
  activeDealsCount: number;
  deliveredDealsCount: number;
  totalDealsCount: number;
}

export interface AccountingDataResponse {
  metrics: AccountingMetrics;
  deals: SalesDealItem[];
  expenses: VehicleExpenseItem[];
  availableInventory: {
    id: string;
    brand: string;
    model: string;
    variant: string | null;
    registrationNumber: string | null;
    askingPrice: number;
    formattedPrice: string;
    purchasePrice: number;
    refurbishmentCost: number;
    landedCost: number;
    heroImage: string;
  }[];
  salesStaff: {
    id: string;
    name: string;
    role: string;
  }[];
  isOwnerOrAccountant: boolean;
}

/**
 * Main query action: loads deals, metrics, expenses, and available cars
 */
export async function getAccountingOverviewAction(): Promise<{
  success: boolean;
  data: AccountingDataResponse;
  error?: string;
}> {
  try {
    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!dealershipId || !authContext?.supabase) {
      throw new Error("Unauthorized. Please log in to your showroom workspace.");
    }

    if (!authContext.can("accounting:view_pnl")) {
      return {
        success: false,
        error: "Forbidden: You do not have permission to inspect accounting and P&L metrics.",
        data: {
          metrics: {
            grossRevenueRealized: 0,
            formattedGrossRevenue: "₹0",
            netGrossProfit: 0,
            formattedGrossProfit: "₹0",
            avgGrossMarginPercent: 0,
            capitalDeployedInStock: 0,
            formattedCapitalDeployed: "₹0",
            pendingReceivables: 0,
            formattedPendingReceivables: "₹0",
            activeDealsCount: 0,
            deliveredDealsCount: 0,
            totalDealsCount: 0,
          },
          deals: [],
          expenses: [],
          availableInventory: [],
          salesStaff: [],
          isOwnerOrAccountant: false,
        },
      };
    }

    const supabase = authContext.supabase;
    const userRole = authContext.profile?.role || "owner";
    const isOwnerOrAccountant = ["owner", "admin", "accountant"].includes(userRole);

    // Parallel execution: fetch deals, expenses, inventory, and staff concurrently to avoid backend waterfall
    const [
      { data: dbDeals, error: dealsError },
      { data: dbExpenses, error: expensesError },
      { data: dbInventory, error: inventoryError },
      { data: dbStaff, error: staffError },
    ] = await Promise.all([
      supabase
        .from("sales_deals")
        .select(`
          *,
          vehicle:vehicles (
            id,
            brand,
            model,
            variant,
            manufacturing_year,
            registration_number,
            asking_price,
            purchase_price,
            refurbishment_cost,
            status,
            vehicle_media (url, is_hero)
          ),
          payments:deal_payments (*),
          sales_rep:profiles!sales_deals_sales_rep_id_fkey (id, full_name)
        `)
        .eq("dealership_id", dealershipId)
        .order("created_at", { ascending: false }),

      supabase
        .from("vehicle_expenses")
        .select(`
          *,
          vehicle:vehicles (brand, model, registration_number)
        `)
        .eq("dealership_id", dealershipId)
        .order("created_at", { ascending: false }),

      supabase
        .from("vehicles")
        .select("id, brand, model, variant, registration_number, asking_price, purchase_price, refurbishment_cost, vehicle_media(url, is_hero)")
        .eq("dealership_id", dealershipId)
        .eq("status", "available"),

      supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("dealership_id", dealershipId),
    ]);

    if (dealsError) {
      console.error("Error fetching deals:", dealsError);
    }
    if (expensesError) {
      console.error("Error fetching expenses:", expensesError);
    }
    if (inventoryError) {
      console.error("Error fetching inventory:", inventoryError);
    }
    if (staffError) {
      console.error("Error fetching staff:", staffError);
    }

    // Map deals to presentation structure
    const deals: SalesDealItem[] = (dbDeals || []).map((d: any) => {
      const v = d.vehicle || {};
      const hero = v.vehicle_media?.find((m: any) => m.is_hero)?.url ||
        v.vehicle_media?.[0]?.url ||
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80";

      const paymentsList: PaymentItem[] = (d.payments || []).map((p: any) => ({
        id: p.id,
        paymentNumber: p.payment_number,
        paymentType: p.payment_type,
        paymentMethod: p.payment_method,
        paymentStatus: p.payment_status,
        amount: Number(p.amount),
        formattedAmount: formatINR(Number(p.amount)),
        transactionRef: p.transaction_ref,
        chequeBankName: p.cheque_bank_name,
        chequeDate: p.cheque_date,
        clearedAt: p.cleared_at,
        notes: p.notes,
        createdAt: p.created_at,
      }));

      const totalPaid = paymentsList
        .filter((p) => p.paymentStatus === "cleared")
        .reduce((sum, p) => sum + p.amount, 0);

      const totalDealAmount = Number(d.total_deal_amount || 0);
      const balanceDue = Math.max(0, totalDealAmount - totalPaid);
      const agreedSellingPrice = Number(d.agreed_selling_price || 0);
      const netGrossProfit = isOwnerOrAccountant ? Number(d.net_gross_profit || 0) : 0;
      const grossMarginPercent = agreedSellingPrice > 0
        ? Number(((netGrossProfit / agreedSellingPrice) * 100).toFixed(1))
        : 0;

      return {
        id: d.id,
        dealNumber: d.deal_number,
        dealershipId: d.dealership_id,
        vehicleId: d.vehicle_id,
        vehicle: {
          id: v.id || d.vehicle_id,
          brand: v.brand || "Automobile",
          model: v.model || "",
          variant: v.variant || null,
          manufacturingYear: v.manufacturing_year || 2024,
          registrationNumber: v.registration_number || null,
          askingPrice: Number(v.asking_price || agreedSellingPrice),
          formattedPrice: formatINR(Number(v.asking_price || agreedSellingPrice)),
          heroImage: hero,
          kilometers: Number(v.kilometers || 0),
          status: v.status || "available",
          purchasePrice: isOwnerOrAccountant ? Number(v.purchase_price || 0) : 0,
          refurbishmentCost: isOwnerOrAccountant ? Number(v.refurbishment_cost || 0) : 0,
          landedCost: isOwnerOrAccountant
            ? Number(v.purchase_price || 0) + Number(v.refurbishment_cost || 0)
            : 0,
        },
        leadId: d.lead_id,
        salesRepId: d.sales_rep_id,
        salesRepName: d.sales_rep?.full_name || "Sales Executive",
        customerName: d.customer_name,
        customerPhone: d.customer_phone,
        customerEmail: d.customer_email,
        customerAddress: d.customer_address,
        customerPan: d.customer_pan,
        customerAadhaar: d.customer_aadhaar,
        agreedSellingPrice,
        formattedSellingPrice: formatINR(agreedSellingPrice),
        rtoTransferCharges: Number(d.rto_transfer_charges || 0),
        insuranceCharges: Number(d.insurance_charges || 0),
        extendedWarrantyFee: Number(d.extended_warranty_fee || 0),
        accessoriesCharges: Number(d.accessories_charges || 0),
        discountAmount: Number(d.discount_amount || 0),
        totalDealAmount,
        formattedTotalDealAmount: formatINR(totalDealAmount),
        tokenAmount: Number(d.token_amount || 0),
        formattedTokenAmount: formatINR(Number(d.token_amount || 0)),
        tokenPaidAt: d.token_paid_at,
        tokenReceiptNumber: d.token_receipt_number,
        isTokenRefundable: Boolean(d.is_token_refundable),
        totalPaid,
        formattedTotalPaid: formatINR(totalPaid),
        balanceDue,
        formattedBalanceDue: balanceDue === 0 ? "₹0" : formatINR(balanceDue),
        payments: paymentsList,
        isFinanced: Boolean(d.is_financed),
        financierName: d.financier_name,
        loanApplicationRef: d.loan_application_ref,
        loanSanctionedAmount: Number(d.loan_sanctioned_amount || 0),
        loanDisbursedAmount: Number(d.loan_disbursed_amount || 0),
        deliveryOrderNumber: d.delivery_order_number,
        hasExchange: Boolean(d.has_exchange),
        exchangeAllowance: Number(d.exchange_allowance || 0),
        vehiclePurchaseCost: isOwnerOrAccountant ? Number(d.vehicle_purchase_cost || 0) : 0,
        vehicleLandedCost: isOwnerOrAccountant ? Number(d.vehicle_landed_cost || 0) : 0,
        taxableMargin: isOwnerOrAccountant ? Number(d.taxable_margin || 0) : 0,
        gstRatePercent: Number(d.gst_rate_percent || 18),
        cgstAmount: isOwnerOrAccountant ? Number(d.cgst_amount || 0) : 0,
        sgstAmount: isOwnerOrAccountant ? Number(d.sgst_amount || 0) : 0,
        totalGstOnMargin: isOwnerOrAccountant ? Number(d.total_gst_on_margin || 0) : 0,
        netGrossProfit,
        formattedGrossProfit: formatINR(netGrossProfit),
        grossMarginPercent,
        salesCommissionAmount: Number(d.sales_commission_amount || 0),
        status: d.status as DealStatus,
        rtoStatus: d.rto_status as RtoTransferStatus,
        rtoApplicationNo: d.rto_application_no,
        rtoCompletionDate: d.rto_completion_date,
        newRcSmartcardUrl: d.new_rc_smartcard_url,
        gatePassNumber: d.gate_pass_number,
        deliveredAt: d.delivered_at,
        deliveryOdometerKm: d.delivery_odometer_km,
        deliveryFuelLevel: d.delivery_fuel_level,
        deliveryNotes: d.delivery_notes,
        cancellationReason: d.cancellation_reason,
        internalNotes: d.internal_notes,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      };
    });

    // Map expenses
    const expenses: VehicleExpenseItem[] = (dbExpenses || []).map((e: any) => ({
      id: e.id,
      vehicleId: e.vehicle_id,
      vehicleTitle: `${e.vehicle?.brand || "Car"} ${e.vehicle?.model || ""}`.trim(),
      registrationNumber: e.vehicle?.registration_number || null,
      category: e.category,
      description: e.description,
      vendorName: e.vendor_name,
      invoiceNumber: e.invoice_number,
      invoiceDate: e.invoice_date,
      amount: Number(e.amount),
      formattedAmount: formatINR(Number(e.amount)),
      receiptUrl: e.receipt_url,
      createdAt: e.created_at,
    }));

    // Available inventory mapping
    const availableInventory = (dbInventory || []).map((v: any) => {
      const hero = v.vehicle_media?.find((m: any) => m.is_hero)?.url ||
        v.vehicle_media?.[0]?.url ||
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80";

      const pPrice = Number(v.purchase_price || 0);
      const rCost = Number(v.refurbishment_cost || 0);

      return {
        id: v.id,
        brand: v.brand,
        model: v.model,
        variant: v.variant,
        registrationNumber: v.registration_number,
        askingPrice: Number(v.asking_price),
        formattedPrice: formatINR(Number(v.asking_price)),
        purchasePrice: isOwnerOrAccountant ? pPrice : 0,
        refurbishmentCost: isOwnerOrAccountant ? rCost : 0,
        landedCost: isOwnerOrAccountant ? pPrice + rCost : 0,
        heroImage: hero,
      };
    });

    const salesStaff = (dbStaff || []).map((s: any) => ({
      id: s.id,
      name: s.full_name || "Staff Member",
      role: s.role || "sales_executive",
    }));

    // Metrics computation
    const grossRevenueRealized = deals
      .filter((d) => d.status === "delivered" || d.status === "completed")
      .reduce((sum, d) => sum + d.totalDealAmount, 0);

    const netGrossProfit = isOwnerOrAccountant
      ? deals
          .filter((d) => d.status === "delivered" || d.status === "completed")
          .reduce((sum, d) => sum + d.netGrossProfit, 0)
      : 0;

    const avgGrossMarginPercent =
      grossRevenueRealized > 0
        ? Number(((netGrossProfit / grossRevenueRealized) * 100).toFixed(1))
        : 0;

    const capitalDeployedInStock = availableInventory.reduce(
      (sum, item) => sum + item.landedCost,
      0
    );

    const pendingReceivables = deals
      .filter((d) => d.status === "token_booked" || d.status === "financing_pending")
      .reduce((sum, d) => sum + d.balanceDue, 0);

    return {
      success: true,
      data: {
        metrics: {
          grossRevenueRealized,
          formattedGrossRevenue: formatINR(grossRevenueRealized),
          netGrossProfit,
          formattedGrossProfit: formatINR(netGrossProfit),
          avgGrossMarginPercent,
          capitalDeployedInStock,
          formattedCapitalDeployed: formatINR(capitalDeployedInStock),
          pendingReceivables,
          formattedPendingReceivables: formatINR(pendingReceivables),
          activeDealsCount: deals.filter((d) => d.status !== "completed" && d.status !== "cancelled").length,
          deliveredDealsCount: deals.filter((d) => d.status === "delivered").length,
          totalDealsCount: deals.length,
        },
        deals,
        expenses,
        availableInventory,
        salesStaff,
        isOwnerOrAccountant,
      },
    };
  } catch (err: any) {
    console.error("Failed to load accounting workspace:", err);
    return {
      success: false,
      data: {
        metrics: {
          grossRevenueRealized: 0,
          formattedGrossRevenue: "₹0",
          netGrossProfit: 0,
          formattedGrossProfit: "₹0",
          avgGrossMarginPercent: 0,
          capitalDeployedInStock: 0,
          formattedCapitalDeployed: "₹0",
          pendingReceivables: 0,
          formattedPendingReceivables: "₹0",
          activeDealsCount: 0,
          deliveredDealsCount: 0,
          totalDealsCount: 0,
        },
        deals: [],
        expenses: [],
        availableInventory: [],
        salesStaff: [],
        isOwnerOrAccountant: false,
      },
      error: err.message || "Failed to load accounting workspace",
    };
  }
}

/**
 * Creates a new Deal Sheet, snapshots landed costs, calculates GST margin,
 * locks the vehicle to 'reserved', and creates token payment if supplied.
 */
export async function createSalesDealAction(rawInput: CreateSalesDealInput) {
  try {
    const validated = createSalesDealSchema.parse(rawInput);
    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!dealershipId || !authContext?.supabase) {
      return { success: false, error: "Unauthorized. Please log in to your showroom workspace." };
    }

    if (!authContext.can("sales:create")) {
      return { success: false, error: "Forbidden: You do not have permission to contract sales deals." };
    }

    const supabase = authContext.supabase;

    // 1. Fetch vehicle specifications & current landed cost
    const { data: vehicle, error: vehicleErr } = await (supabase.from("vehicles") as any)
      .select("id, brand, model, purchase_price, refurbishment_cost, fuel_type, status")
      .eq("id", validated.vehicleId)
      .eq("dealership_id", dealershipId)
      .single();

    if (vehicleErr || !vehicle) {
      return { success: false, error: "Selected vehicle could not be found." };
    }

    if (vehicle.status !== "available") {
      return {
        success: false,
        error: `Vehicle is currently marked as '${vehicle.status}'. Only 'available' inventory can be contracted.`,
      };
    }

    const purchaseCost = Number(vehicle.purchase_price || 0);
    const reconditioningCost = Number(vehicle.refurbishment_cost || 0);

    // 2. Compute Statutory GST Margin Scheme
    const economics = calculateUnitEconomics({
      purchaseCost,
      reconditioningCost,
      agreedSellingPrice: validated.agreedSellingPrice,
      rtoTransferCharges: validated.rtoTransferCharges,
      insuranceCharges: validated.insuranceCharges,
      extendedWarrantyFee: validated.extendedWarrantyFee,
      accessoriesCharges: validated.accessoriesCharges,
      discountAmount: validated.discountAmount,
      salesCommissionAmount: validated.salesCommissionAmount,
      fuelType: vehicle.fuel_type,
    });

    const dealYear = new Date().getFullYear();
    const dealSeq = Math.floor(1000 + Math.random() * 9000);
    const dealNumber = `DL-${dealYear}-${dealSeq}`;
    const initialStatus: DealStatus = validated.tokenAmount > 0 ? "token_booked" : "draft";

    // 3. Insert Sales Deal
    const { data: newDeal, error: dealInsertErr } = await (supabase.from("sales_deals") as any)
      .insert({
        dealership_id: dealershipId,
        deal_number: dealNumber,
        vehicle_id: validated.vehicleId,
        lead_id: validated.leadId || null,
        sales_rep_id: validated.salesRepId || authContext.profile?.id || null,
        customer_name: validated.customerName,
        customer_phone: validated.customerPhone,
        customer_email: validated.customerEmail || null,
        customer_address: validated.customerAddress || null,
        customer_pan: validated.customerPan || null,
        customer_aadhaar: validated.customerAadhaar || null,
        agreed_selling_price: validated.agreedSellingPrice,
        rto_transfer_charges: validated.rtoTransferCharges,
        insurance_charges: validated.insuranceCharges,
        extended_warranty_fee: validated.extendedWarrantyFee,
        accessories_charges: validated.accessoriesCharges,
        discount_amount: validated.discountAmount,
        total_deal_amount: economics.totalDealAmount,
        token_amount: validated.tokenAmount,
        token_paid_at: validated.tokenAmount > 0 ? new Date().toISOString() : null,
        token_receipt_number: validated.tokenAmount > 0 ? `TKN-${dealYear}-${dealSeq}` : null,
        is_token_refundable: validated.isTokenRefundable,
        is_financed: validated.isFinanced,
        financier_name: validated.financierName || null,
        loan_sanctioned_amount: validated.loanSanctionedAmount,
        has_exchange: validated.hasExchange,
        exchange_allowance: validated.exchangeAllowance,
        vehicle_purchase_cost: purchaseCost,
        vehicle_landed_cost: economics.totalLandedCost,
        taxable_margin: economics.gstMargin.taxableMarginBase,
        gst_rate_percent: economics.gstMargin.gstRatePercent,
        cgst_amount: economics.gstMargin.cgstAmount,
        sgst_amount: economics.gstMargin.sgstAmount,
        total_gst_on_margin: economics.gstMargin.totalGstAmount,
        net_gross_profit: economics.netGrossProfit,
        sales_commission_amount: validated.salesCommissionAmount,
        status: initialStatus,
        internal_notes: validated.internalNotes || null,
      })
      .select("id")
      .single();

    if (dealInsertErr || !newDeal) {
      return { success: false, error: dealInsertErr?.message || "Failed to create deal sheet." };
    }

    // 4. Record Token Payment tranche if provided
    if (validated.tokenAmount > 0) {
      const paySeq = Math.floor(1000 + Math.random() * 9000);
      await (supabase.from("deal_payments") as any).insert({
        dealership_id: dealershipId,
        deal_id: newDeal.id,
        payment_number: `PAY-${dealYear}-${paySeq}`,
        payment_type: "token_deposit",
        payment_method: "bank_transfer",
        payment_status: "cleared",
        amount: validated.tokenAmount,
        transaction_ref: `TOKEN/${dealNumber}`,
        notes: "Initial booking deposit collected at deal creation.",
      });

      // Update vehicle status to 'reserved'
      await (supabase.from("vehicles") as any)
        .update({ status: "reserved" })
        .eq("id", validated.vehicleId)
        .eq("dealership_id", dealershipId);
    }

    // 5. Update linked lead if applicable
    if (validated.leadId) {
      await (supabase.from("leads") as any)
        .update({ status: "booked" })
        .eq("id", validated.leadId)
        .eq("dealership_id", dealershipId);

      await (supabase.from("lead_activities") as any).insert({
        dealership_id: dealershipId,
        lead_id: validated.leadId,
        actor_id: authContext.profile?.id || null,
        activity_type: "status_change",
        description: `Deal sheet created (${dealNumber}). Vehicle reserved. Lead converted to booked.`,
      });
    }

    revalidatePath("/dashboard/accounting");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/leads");

    return {
      success: true,
      dealNumber,
      message: `Deal ${dealNumber} created successfully.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create sales deal" };
  }
}

/**
 * Records a payment tranche (down payment, loan disbursal, cheque).
 * Automatically checks if balance reaches zero to transition deal to 'payment_cleared'.
 */
export async function recordPaymentAction(rawInput: RecordPaymentInput) {
  try {
    const validated = recordPaymentSchema.parse(rawInput);
    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!dealershipId || !authContext?.supabase) {
      return { success: false, error: "Unauthorized. Please log in to your showroom workspace." };
    }

    if (!authContext.can("accounting:record_transactions")) {
      return { success: false, error: "Forbidden: Only accounting personnel can record payments." };
    }

    const supabase = authContext.supabase;
    const payYear = new Date().getFullYear();
    const paySeq = Math.floor(1000 + Math.random() * 9000);
    const paymentNumber = `PAY-${payYear}-${paySeq}`;

    // 1. Insert payment record
    const { error: payErr } = await (supabase.from("deal_payments") as any).insert({
      dealership_id: dealershipId,
      deal_id: validated.dealId,
      payment_number: paymentNumber,
      payment_type: validated.paymentType,
      payment_method: validated.paymentMethod,
      payment_status: "cleared",
      amount: validated.amount,
      transaction_ref: validated.transactionRef,
      cheque_bank_name: validated.chequeBankName || null,
      cheque_date: validated.chequeDate || null,
      notes: validated.notes || null,
      received_by: authContext.profile?.id || null,
    });

    if (payErr) {
      return { success: false, error: payErr.message || "Failed to log payment transaction." };
    }

    // 2. Query deal total and all cleared payments to update status
    const { data: deal } = await (supabase.from("sales_deals") as any)
      .select("id, total_deal_amount, status")
      .eq("id", validated.dealId)
      .eq("dealership_id", dealershipId)
      .single();

    if (deal) {
      const { data: payments } = await (supabase.from("deal_payments") as any)
        .select("amount")
        .eq("deal_id", validated.dealId)
        .eq("payment_status", "cleared");

      const totalCleared = (payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      // If fully paid and not yet delivered or completed, mark payment_cleared
      if (totalCleared >= Number(deal.total_deal_amount) && deal.status !== "delivered" && deal.status !== "completed") {
        await (supabase.from("sales_deals") as any)
          .update({ status: "payment_cleared" })
          .eq("id", validated.dealId);
      }
    }

    revalidatePath("/dashboard/accounting");
    return {
      success: true,
      paymentNumber,
      message: `Payment of ${formatINR(validated.amount)} recorded (${paymentNumber}).`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record payment" };
  }
}

/**
 * Adds workshop / reconditioning expenditure and capitalizes it into vehicle landed cost.
 */
export async function addVehicleExpenseAction(rawInput: AddVehicleExpenseInput) {
  try {
    const validated = addVehicleExpenseSchema.parse(rawInput);
    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!dealershipId || !authContext?.supabase) {
      return { success: false, error: "Unauthorized. Please log in to your showroom workspace." };
    }

    if (!authContext.can("accounting:record_transactions")) {
      return { success: false, error: "Forbidden: You lack permission to record lot and vehicle expenses." };
    }

    const supabase = authContext.supabase;

    // 1. Insert vehicle expense
    const { error: expErr } = await (supabase.from("vehicle_expenses") as any).insert({
      dealership_id: dealershipId,
      vehicle_id: validated.vehicleId,
      category: validated.category,
      description: validated.description,
      amount: validated.amount,
      vendor_name: validated.vendorName || null,
      invoice_number: validated.invoiceNumber || null,
      invoice_date: validated.invoiceDate || null,
      created_by: authContext.profile?.id || null,
    });

    if (expErr) {
      return { success: false, error: expErr.message || "Failed to log vehicle expense." };
    }

    // 2. Sum total expenses for this car and update vehicle refurbishment_cost
    const { data: expenses } = await (supabase.from("vehicle_expenses") as any)
      .select("amount")
      .eq("vehicle_id", validated.vehicleId)
      .eq("dealership_id", dealershipId);

    const totalRecon = (expenses || []).reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    await (supabase.from("vehicles") as any)
      .update({ refurbishment_cost: totalRecon })
      .eq("id", validated.vehicleId)
      .eq("dealership_id", dealershipId);

    revalidatePath("/dashboard/accounting");
    revalidatePath("/dashboard/inventory");

    return {
      success: true,
      message: `Reconditioning expense of ${formatINR(validated.amount)} capitalized into vehicle landed cost.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add vehicle expense" };
  }
}

/**
 * Issues a Delivery Gate Pass, capturing exit odometer and fuel level,
 * and marks the deal status as 'delivered'.
 */
export async function issueDeliveryGatePassAction(rawInput: IssueDeliveryGatePassInput) {
  try {
    const validated = issueDeliveryGatePassSchema.parse(rawInput);
    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!dealershipId || !authContext?.supabase) {
      return { success: false, error: "Unauthorized. Please log in to your showroom workspace." };
    }

    if (!authContext.can("sales:create")) {
      return { success: false, error: "Forbidden: You do not have permission to contract sales deals." };
    }

    const supabase = authContext.supabase;
    const year = new Date().getFullYear();
    const passSeq = Math.floor(1000 + Math.random() * 9000);
    const gatePassNumber = `GP-${year}-${passSeq}`;

    const { error: updateErr } = await (supabase.from("sales_deals") as any)
      .update({
        gate_pass_number: gatePassNumber,
        status: "delivered",
        delivered_at: new Date().toISOString(),
        delivery_odometer_km: validated.deliveryOdometerKm,
        delivery_fuel_level: validated.deliveryFuelLevel,
        delivery_notes: validated.handoverNotes || null,
      })
      .eq("id", validated.dealId)
      .eq("dealership_id", dealershipId);

    if (updateErr) {
      return { success: false, error: updateErr.message || "Failed to issue gate pass." };
    }

    revalidatePath("/dashboard/accounting");
    return {
      success: true,
      gatePassNumber,
      message: `Delivery Gate Pass ${gatePassNumber} issued successfully. Vehicle cleared for road departure.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to issue delivery gate pass" };
  }
}

/**
 * Updates RTO Title Transfer status. If status is 'rc_transferred',
 * transitions deal to 'completed' and marks vehicle as 'sold'.
 */
export async function updateRtoStatusAction(rawInput: UpdateRtoStatusInput) {
  try {
    const validated = updateRtoStatusSchema.parse(rawInput);
    const authContext = await getAuthenticatedContext();
    const dealershipId = authContext?.dealership?.id;

    if (!dealershipId || !authContext?.supabase) {
      return { success: false, error: "Unauthorized. Please log in to your showroom workspace." };
    }

    if (!authContext.can("accounting:record_transactions")) {
      return { success: false, error: "Forbidden: You lack permission to update RTO registration status." };
    }

    const supabase = authContext.supabase;

    const updatePayload: any = {
      rto_status: validated.rtoStatus,
      rto_application_no: validated.rtoApplicationNo || null,
      rto_completion_date: validated.rtoCompletionDate || null,
      new_rc_smartcard_url: validated.newRcSmartcardUrl || null,
    };

    // If transferred, complete the deal & mark car sold
    if (validated.rtoStatus === "rc_transferred") {
      updatePayload.status = "completed";

      // Find vehicle id
      const { data: deal } = await (supabase.from("sales_deals") as any)
        .select("vehicle_id")
        .eq("id", validated.dealId)
        .eq("dealership_id", dealershipId)
        .single();

      if (deal?.vehicle_id) {
        await (supabase.from("vehicles") as any)
          .update({ status: "sold" })
          .eq("id", deal.vehicle_id)
          .eq("dealership_id", dealershipId);
      }

      // Approve commission
      await (supabase.from("deal_commissions") as any)
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: authContext.profile?.id || null,
        })
        .eq("deal_id", validated.dealId)
        .eq("dealership_id", dealershipId);
    }

    const { error: updateErr } = await (supabase.from("sales_deals") as any)
      .update(updatePayload)
      .eq("id", validated.dealId)
      .eq("dealership_id", dealershipId);

    if (updateErr) {
      return { success: false, error: updateErr.message || "Failed to update RTO status." };
    }

    revalidatePath("/dashboard/accounting");
    revalidatePath("/dashboard/inventory");

    return {
      success: true,
      message: `RTO transfer status updated to '${validated.rtoStatus}'.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update RTO status" };
  }
}
