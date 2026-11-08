"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { AccountingHeader } from "./accounting-header";
import { AccountingToolbar } from "./accounting-toolbar";
import { DealsTable } from "./deals/deals-table";
import { DealsKanban } from "./deals/deals-kanban";
import { DealDetailDrawer } from "./deals/deal-detail-drawer";
import { CreateDealModal } from "./modals/create-deal-modal";
import { RecordPaymentModal } from "./modals/record-payment-modal";
import { ExpenseLedgerModal } from "./modals/expense-ledger-modal";
import { RtoUpdateModal } from "./modals/rto-update-modal";
import { MarginInvoiceModal } from "./documents/margin-invoice-modal";
import { TokenReceiptModal } from "./documents/token-receipt-modal";
import { DeliveryGatePassModal } from "./documents/delivery-gate-pass-modal";
import { formatINR } from "../../lib/currency";
import {
  getAccountingOverviewAction,
  type AccountingDataResponse,
  type SalesDealItem,
  type VehicleExpenseItem,
} from "../../app/dashboard/accounting/actions";
import {
  ReceiptText,
  Wrench,
  BarChart3,
  Coins,
  TrendingUp,
  Building2,
  Calendar,
  AlertCircle,
  Plus,
} from "lucide-react";

interface AccountingShellProps {
  initialData?: AccountingDataResponse;
}

export function AccountingShell({ initialData }: AccountingShellProps) {
  // SWR: in-memory client cache with background revalidation
  const { data: responseData, isLoading, mutate } = useSWR(
    "dashboard-accounting-data",
    async () => {
      const res = await getAccountingOverviewAction();
      return res.data;
    },
    {
      fallbackData: initialData,
      dedupingInterval: 60000,
      revalidateOnFocus: false,
      revalidateIfStale: true,
      keepPreviousData: true,
    }
  );

  const data: AccountingDataResponse = responseData || initialData || {
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
    isOwnerOrAccountant: true,
  };

  const [activeTab, setActiveTab] = useState<"deals" | "landed_costs" | "analytics">("deals");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Drawer & Modal States
  const [selectedDeal, setSelectedDeal] = useState<SalesDealItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isCreateDealOpen, setIsCreateDealOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentTargetDeal, setPaymentTargetDeal] = useState<SalesDealItem | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isRtoModalOpen, setIsRtoModalOpen] = useState(false);
  const [rtoTargetDeal, setRtoTargetDeal] = useState<SalesDealItem | null>(null);

  // Document Modal States
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isTokenReceiptOpen, setIsTokenReceiptOpen] = useState(false);
  const [isGatePassOpen, setIsGatePassOpen] = useState(false);
  const [documentTargetDeal, setDocumentTargetDeal] = useState<SalesDealItem | null>(null);

  const refreshData = async () => {
    await mutate();
  };

  // Active deals filtering
  const filteredDeals = useMemo(() => {
    return data.deals.filter((deal) => {
      // Status filter only applies in table view (Kanban inherently visualizes all stages)
      if (viewMode === "table") {
        if (statusFilter === "active") {
          if (deal.status === "completed" || deal.status === "cancelled") return false;
        } else if (statusFilter !== "all" && deal.status !== statusFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = deal.dealNumber.toLowerCase().includes(q);
        const matchCustomer = deal.customerName.toLowerCase().includes(q);
        const matchPhone = deal.customerPhone.toLowerCase().includes(q);
        const matchCar = `${deal.vehicle.brand} ${deal.vehicle.model}`.toLowerCase().includes(q);
        const matchReg = (deal.vehicle.registrationNumber || "").toLowerCase().includes(q);

        if (!matchNumber && !matchCustomer && !matchPhone && !matchCar && !matchReg) {
          return false;
        }
      }

      return true;
    });
  }, [data.deals, statusFilter, searchQuery, viewMode]);

  // Handlers
  const handleOpenDealDetail = (deal: SalesDealItem) => {
    setSelectedDeal(deal);
    setIsDetailOpen(true);
  };

  const handleCloseDealDetail = () => {
    setIsDetailOpen(false);
  };

  const handleOpenCreateDeal = () => {
    setIsCreateDealOpen(true);
  };

  const handleOpenAddExpense = () => {
    setIsExpenseModalOpen(true);
  };

  const handleRecordPayment = (deal: SalesDealItem) => {
    setPaymentTargetDeal(deal);
    setIsRecordPaymentOpen(true);
  };

  const handleIssueGatePass = (deal: SalesDealItem) => {
    setDocumentTargetDeal(deal);
    setIsGatePassOpen(true);
  };

  const handleUpdateRtoStatus = (deal: SalesDealItem) => {
    setRtoTargetDeal(deal);
    setIsRtoModalOpen(true);
  };

  const handlePrintInvoice = (deal: SalesDealItem) => {
    setDocumentTargetDeal(deal);
    setIsInvoiceOpen(true);
  };

  const handlePrintTokenReceipt = (deal: SalesDealItem) => {
    setDocumentTargetDeal(deal);
    setIsTokenReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ─── Header & KPIs ─── */}
      <AccountingHeader
        metrics={data.metrics}
        isLoading={isLoading && !responseData}
        onOpenCreateDeal={handleOpenCreateDeal}
        onOpenAddExpense={handleOpenAddExpense}
        isOwnerOrAccountant={data.isOwnerOrAccountant}
      />

      {/* ─── Tab Switcher ─── */}
      <div className="flex items-center gap-1 border-b border-neutral-200/90 pt-1">
        <button
          type="button"
          onClick={() => setActiveTab("deals")}
          className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition ${
            activeTab === "deals"
              ? "border-neutral-950 text-neutral-950"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <ReceiptText className="h-4 w-4" />
          <span>Deals Pipeline & Ledger</span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-700">
            {data.deals.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("landed_costs")}
          className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition ${
            activeTab === "landed_costs"
              ? "border-neutral-950 text-neutral-950"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>Vehicle Landed Costing & Workshop</span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-700">
            {data.expenses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition ${
            activeTab === "analytics"
              ? "border-neutral-950 text-neutral-950"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>P&L & Margin Economics</span>
        </button>
      </div>

      {/* ─── TAB 1: Deals Pipeline & Ledger ─── */}
      {activeTab === "deals" && (
        <div className="space-y-4">
          <AccountingToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalDeals={filteredDeals.length}
          />

          {viewMode === "table" ? (
            <DealsTable
              deals={filteredDeals}
              isLoading={isLoading && !responseData}
              onSelectDeal={handleOpenDealDetail}
              onRecordPayment={handleRecordPayment}
              onIssueGatePass={handleIssueGatePass}
            />
          ) : (
            <DealsKanban
              deals={filteredDeals}
              isLoading={isLoading && !responseData}
              onSelectDeal={handleOpenDealDetail}
              onRecordPayment={handleRecordPayment}
              onIssueGatePass={handleIssueGatePass}
            />
          )}
        </div>
      )}

      {/* ─── TAB 2: Landed Costing & Workshop Ledger ─── */}
      {activeTab === "landed_costs" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-normal text-neutral-950">
                  Vehicle Reconditioning & Expense Ledger
                </h3>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  Job cards, mechanical overhauls, detailing invoices, and parts capitalized into vehicle landed costs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <span className="block text-[10px] text-neutral-400 uppercase">Total Capitalized</span>
                  <span className="text-base font-bold text-neutral-900 font-serif">
                    {formatINR(data.expenses.reduce((s, e) => s + e.amount, 0))}
                  </span>
                </div>

                {data.isOwnerOrAccountant && (
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition active:scale-98"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Bill</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200/80 bg-neutral-50/70 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Vehicle</th>
                    <th className="px-4 py-2.5 font-semibold">Category</th>
                    <th className="px-4 py-2.5 font-semibold">Description</th>
                    <th className="px-4 py-2.5 font-semibold">Vendor / Invoice #</th>
                    <th className="px-4 py-2.5 font-semibold">Date</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Capitalized Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {isLoading && !responseData && data.expenses.length === 0 ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3.5">
                          <div className="h-4 w-32 bg-neutral-200 rounded" />
                          <div className="h-2.5 w-20 bg-neutral-100 rounded mt-1" />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="h-5 w-16 bg-neutral-200 rounded-md" />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="h-3.5 w-40 bg-neutral-200 rounded" />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="h-3.5 w-28 bg-neutral-200 rounded" />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="h-3.5 w-20 bg-neutral-200 rounded" />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="h-4 w-20 bg-neutral-200 rounded ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : data.expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-neutral-400">
                        No workshop bills or capitalized expenses recorded.
                      </td>
                    </tr>
                  ) : (
                    data.expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-neutral-50/60 transition">
                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {exp.vehicleTitle}
                          <span className="block font-mono text-[10px] text-neutral-400">
                            {exp.registrationNumber || "Lot Stock"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-700 capitalize">
                            {exp.category.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-700 max-w-xs truncate">
                          {exp.description}
                        </td>
                        <td className="px-4 py-3 font-mono text-neutral-600">
                          {exp.vendorName || "In-house Workshop"}
                          {exp.invoiceNumber && (
                            <span className="block text-[10px] text-neutral-400">
                              Inv: {exp.invoiceNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-neutral-500 whitespace-nowrap">
                          {exp.invoiceDate || new Date(exp.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900 whitespace-nowrap">
                          {exp.formattedAmount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: P&L and Margin Economics ─── */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-2xs space-y-2">
              <span className="text-[11px] font-mono font-semibold uppercase text-neutral-400">
                Gross Turnover Realization
              </span>
              <p className="text-2xl font-serif font-bold text-neutral-950">
                {data.metrics.formattedGrossRevenue}
              </p>
              <p className="text-xs text-neutral-500">
                Total contracted sales revenue from delivered and closed showroom transactions.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-2xs space-y-2">
              <span className="text-[11px] font-mono font-semibold uppercase text-neutral-400">
                Net Dealer Profit
              </span>
              <p className="text-2xl font-serif font-bold text-emerald-700">
                {data.metrics.formattedGrossProfit}
              </p>
              <p className="text-xs text-neutral-500">
                Retained gross margin after deducting acquisition, workshop repairs, and GST margin liability.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-2xs space-y-2">
              <span className="text-[11px] font-mono font-semibold uppercase text-neutral-400">
                Average Margin Yield
              </span>
              <p className="text-2xl font-serif font-bold text-neutral-950">
                {data.metrics.avgGrossMarginPercent}%
              </p>
              <p className="text-xs text-neutral-500">
                Weighted showroom margin spread across luxury sport, exotic, and executive inventory.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs">
            <h3 className="font-serif text-lg font-normal text-neutral-950 mb-1">
              Indian GST Margin Scheme Compliance (Notification No. 8/2018)
            </h3>
            <p className="text-xs text-neutral-500 max-w-2xl font-light mb-4">
              Pre-owned vehicles are exempt from GST on total invoice value. Tax is levied strictly on the positive margin spread between selling price and purchase price.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50/50">
                <span className="font-bold text-neutral-900 block mb-1">12% Margin Bracket</span>
                <span className="text-neutral-500 block">Sub-4 meter compact cars (&lt;1200cc petrol, &lt;1500cc diesel, CNG).</span>
                <span className="text-neutral-700 font-semibold mt-2 block">CGST 6% + SGST 6%</span>
              </div>
              <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50/50">
                <span className="font-bold text-neutral-900 block mb-1">18% Margin Bracket</span>
                <span className="text-neutral-500 block">Mid-size, luxury sedans, sports exotics, and SUVs (&gt;4000mm length).</span>
                <span className="text-neutral-700 font-semibold mt-2 block">CGST 9% + SGST 9%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Deal Detail Dossier Drawer ─── */}
      <DealDetailDrawer
        deal={selectedDeal}
        isOpen={isDetailOpen}
        onClose={handleCloseDealDetail}
        onRecordPayment={handleRecordPayment}
        onIssueGatePass={handleIssueGatePass}
        onUpdateRtoStatus={handleUpdateRtoStatus}
        onPrintInvoice={handlePrintInvoice}
        onPrintTokenReceipt={handlePrintTokenReceipt}
        isOwnerOrAccountant={data.isOwnerOrAccountant}
      />

      {/* ─── Modals ─── */}
      <CreateDealModal
        isOpen={isCreateDealOpen}
        onClose={() => setIsCreateDealOpen(false)}
        onSuccess={refreshData}
        availableInventory={data.availableInventory}
        salesStaff={data.salesStaff}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        deal={paymentTargetDeal}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setPaymentTargetDeal(null);
        }}
        onSuccess={refreshData}
      />

      <ExpenseLedgerModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={refreshData}
        availableInventory={data.availableInventory}
      />

      <RtoUpdateModal
        isOpen={isRtoModalOpen}
        deal={rtoTargetDeal}
        onClose={() => {
          setIsRtoModalOpen(false);
          setRtoTargetDeal(null);
        }}
        onSuccess={refreshData}
      />

      {/* ─── Document Modals ─── */}
      <MarginInvoiceModal
        isOpen={isInvoiceOpen}
        deal={documentTargetDeal}
        onClose={() => {
          setIsInvoiceOpen(false);
          setDocumentTargetDeal(null);
        }}
      />

      <TokenReceiptModal
        isOpen={isTokenReceiptOpen}
        deal={documentTargetDeal}
        onClose={() => {
          setIsTokenReceiptOpen(false);
          setDocumentTargetDeal(null);
        }}
      />

      <DeliveryGatePassModal
        isOpen={isGatePassOpen}
        deal={documentTargetDeal}
        onClose={() => {
          setIsGatePassOpen(false);
          setDocumentTargetDeal(null);
        }}
        onSuccess={refreshData}
      />
    </div>
  );
}

