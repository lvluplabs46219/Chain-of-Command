"use client";

import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Layers,
  PieChart,
  BarChart3,
  Sliders,
  CheckCircle2,
  Building,
  Users,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  PROFIT_MODEL_SCENARIOS,
  UNIT_ECONOMICS,
  MONETIZATION_STREAMS,
} from "@/lib/vericue-data";
import { ProfitModelScenario } from "@/lib/vericue-types";

export function ProfitModelView() {
  const [activeScenarioKey, setActiveScenarioKey] = useState<"conservative" | "base" | "optimistic">("base");
  const [activeTab, setActiveTab] = useState<"pnl" | "unit_economics" | "streams" | "strategy">("pnl");

  const currentScenario: ProfitModelScenario = PROFIT_MODEL_SCENARIOS[activeScenarioKey];

  const formatCurrency = (val: number) => {
    if (val < 0) {
      return `-$${Math.abs(val).toLocaleString()}`;
    }
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-[#E1E2E5]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232636] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Monetization Architecture & Financial Model (Blueprint §2 & §14)
            </span>
            <span className="text-xs text-neutral-400">3-Scenario 3-Year P&L Model</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            VeriCue AI — Monetization Plan & Unit Economics
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            The core truth: Consumer is a marketing funnel (51% margin); the real business is B2B workspaces (74–78% margin).
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex rounded-xl bg-[#12141D] p-1 border border-[#232636]">
          <button
            onClick={() => setActiveScenarioKey("conservative")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeScenarioKey === "conservative"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Conservative
          </button>
          <button
            onClick={() => setActiveScenarioKey("base")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeScenarioKey === "base"
                ? "bg-emerald-500 text-neutral-950 shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Base Case
          </button>
          <button
            onClick={() => setActiveScenarioKey("optimistic")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeScenarioKey === "optimistic"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Optimistic
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex rounded-xl bg-[#12141D] p-1 border border-[#232636] max-w-lg">
        <button
          onClick={() => setActiveTab("pnl")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === "pnl" ? "bg-[#1E2232] text-white" : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          3-Year P&L Table
        </button>
        <button
          onClick={() => setActiveTab("unit_economics")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === "unit_economics" ? "bg-[#1E2232] text-white" : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Unit Economics
        </button>
        <button
          onClick={() => setActiveTab("streams")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === "streams" ? "bg-[#1E2232] text-white" : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          12 Revenue Streams
        </button>
        <button
          onClick={() => setActiveTab("strategy")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === "strategy" ? "bg-[#1E2232] text-white" : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          The 5 Realities (§14.4)
        </button>
      </div>

      {/* Summary Headline Card */}
      <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-neutral-400 block">Active Scenario</span>
          <span className="text-base font-bold text-white capitalize">{currentScenario.name}</span>
          <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{currentScenario.description}</p>
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase text-neutral-400 block">Year 3 Revenue</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(currentScenario.years[2].totalRevenue)}
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            ARR: {formatCurrency(currentScenario.years[2].arrExitingYear)}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase text-neutral-400 block">Year 3 Op Profit / Loss</span>
          <span
            className={`text-2xl font-bold font-mono ${
              currentScenario.years[2].operatingProfitLoss >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatCurrency(currentScenario.years[2].operatingProfitLoss)}
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            {currentScenario.breakevenStatus}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase text-neutral-400 block">Peak Funding Need</span>
          <span className="text-2xl font-bold font-mono text-amber-400">
            {formatCurrency(currentScenario.peakFundingNeed)}
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Cumulative 3-Yr: {formatCurrency(currentScenario.threeYearCumulativeLossOrGain)}
          </span>
        </div>
      </div>

      {/* TAB 1: FULL 3-YEAR P&L TABLE (§14.1) */}
      {activeTab === "pnl" && (
        <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between border-b border-[#202330] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Detailed Three-Year P&L Statement ({currentScenario.name})
              </h3>
              <p className="text-xs text-neutral-400">
                Direct reproduction of the financial build contract from §14.1
              </p>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Values in USD</span>
          </div>

          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-[#242838] text-neutral-400 text-[11px]">
                <th className="py-2.5 pr-4 font-semibold text-neutral-300">Financial Line Item</th>
                <th className="py-2.5 px-4 text-right">Year 1</th>
                <th className="py-2.5 px-4 text-right">Year 2</th>
                <th className="py-2.5 pl-4 text-right">Year 3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2130]">
              <tr className="text-neutral-300">
                <td className="py-2 pr-4 font-sans font-medium">Paying Consumers (Year-End)</td>
                <td className="py-2 px-4 text-right">{currentScenario.years[0].payingConsumersYearEnd.toLocaleString()}</td>
                <td className="py-2 px-4 text-right">{currentScenario.years[1].payingConsumersYearEnd.toLocaleString()}</td>
                <td className="py-2 pl-4 text-right font-bold text-white">{currentScenario.years[2].payingConsumersYearEnd.toLocaleString()}</td>
              </tr>
              <tr className="text-neutral-300">
                <td className="py-2 pr-4 font-sans font-medium">Business Workspaces (Year-End)</td>
                <td className="py-2 px-4 text-right">{currentScenario.years[0].businessWorkspacesYearEnd}</td>
                <td className="py-2 px-4 text-right">{currentScenario.years[1].businessWorkspacesYearEnd}</td>
                <td className="py-2 pl-4 text-right font-bold text-amber-400">{currentScenario.years[2].businessWorkspacesYearEnd}</td>
              </tr>
              <tr className="text-neutral-300">
                <td className="py-2 pr-4 font-sans font-medium">Enterprise Accounts (Year-End)</td>
                <td className="py-2 px-4 text-right">{currentScenario.years[0].enterpriseAccountsYearEnd}</td>
                <td className="py-2 px-4 text-right">{currentScenario.years[1].enterpriseAccountsYearEnd}</td>
                <td className="py-2 pl-4 text-right font-bold text-indigo-400">{currentScenario.years[2].enterpriseAccountsYearEnd}</td>
              </tr>
              <tr className="text-emerald-400 bg-emerald-950/10 font-bold">
                <td className="py-2 pr-4 font-sans">ARR Exiting the Year</td>
                <td className="py-2 px-4 text-right">{formatCurrency(currentScenario.years[0].arrExitingYear)}</td>
                <td className="py-2 px-4 text-right">{formatCurrency(currentScenario.years[1].arrExitingYear)}</td>
                <td className="py-2 pl-4 text-right">{formatCurrency(currentScenario.years[2].arrExitingYear)}</td>
              </tr>

              {/* REVENUE BREAKDOWN */}
              <tr className="text-neutral-400 pt-2 font-sans font-semibold text-[11px] uppercase tracking-wider">
                <td colSpan={4} className="py-2">Revenue Breakdown</td>
              </tr>
              <tr className="text-neutral-300">
                <td className="py-1.5 pr-4 pl-3 font-sans">Consumer Subscription Revenue</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[0].consumerSubscriptionRevenue)}</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[1].consumerSubscriptionRevenue)}</td>
                <td className="py-1.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].consumerSubscriptionRevenue)}</td>
              </tr>
              <tr className="text-neutral-300">
                <td className="py-1.5 pr-4 pl-3 font-sans">Business Subscription Revenue</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[0].businessSubscriptionRevenue)}</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[1].businessSubscriptionRevenue)}</td>
                <td className="py-1.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].businessSubscriptionRevenue)}</td>
              </tr>
              <tr className="text-neutral-300">
                <td className="py-1.5 pr-4 pl-3 font-sans">Enterprise Subscription Revenue</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[0].enterpriseSubscriptionRevenue)}</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[1].enterpriseSubscriptionRevenue)}</td>
                <td className="py-1.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].enterpriseSubscriptionRevenue)}</td>
              </tr>
              <tr className="text-neutral-300">
                <td className="py-1.5 pr-4 pl-3 font-sans">Enterprise Onboarding (One-Off)</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[0].enterpriseOnboardingRevenue)}</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[1].enterpriseOnboardingRevenue)}</td>
                <td className="py-1.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].enterpriseOnboardingRevenue)}</td>
              </tr>
              <tr className="text-neutral-300">
                <td className="py-1.5 pr-4 pl-3 font-sans">Add-ons, Credits & Reviewer Fees</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[0].addonsReviewerFeeRevenue)}</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[1].addonsReviewerFeeRevenue)}</td>
                <td className="py-1.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].addonsReviewerFeeRevenue)}</td>
              </tr>
              <tr className="text-white font-bold bg-[#171B2A] text-sm">
                <td className="py-2.5 pr-4 font-sans">Total Revenue</td>
                <td className="py-2.5 px-4 text-right">{formatCurrency(currentScenario.years[0].totalRevenue)}</td>
                <td className="py-2.5 px-4 text-right">{formatCurrency(currentScenario.years[1].totalRevenue)}</td>
                <td className="py-2.5 pl-4 text-right text-emerald-400">{formatCurrency(currentScenario.years[2].totalRevenue)}</td>
              </tr>

              {/* VARIABLE COSTS & GROSS PROFIT */}
              <tr className="text-neutral-400 pt-2 font-sans font-semibold text-[11px] uppercase tracking-wider">
                <td colSpan={4} className="py-2">Cost of Goods Sold (COGS)</td>
              </tr>
              <tr className="text-neutral-400">
                <td className="py-1.5 pr-4 pl-3 font-sans">Inference + Storage ($0.33 / session)</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[0].variableInferenceStorageCost)}</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[1].variableInferenceStorageCost)}</td>
                <td className="py-1.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].variableInferenceStorageCost)}</td>
              </tr>
              <tr className="text-neutral-400">
                <td className="py-1.5 pr-4 pl-3 font-sans">Human Reviewer Sign-Off (8% @ $10/review)</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[0].variableHumanReviewCost)}</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[1].variableHumanReviewCost)}</td>
                <td className="py-1.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].variableHumanReviewCost)}</td>
              </tr>
              <tr className="text-neutral-400">
                <td className="py-1.5 pr-4 pl-3 font-sans">Store (15–30%) + Payment Fees (3%)</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[0].storeAndPaymentFees)}</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[1].storeAndPaymentFees)}</td>
                <td className="py-1.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].storeAndPaymentFees)}</td>
              </tr>
              <tr className="text-emerald-300 font-bold bg-[#151926]">
                <td className="py-2 pr-4 font-sans">Gross Profit (Gross Margin %)</td>
                <td className="py-2 px-4 text-right">{formatCurrency(currentScenario.years[0].grossProfit)} ({currentScenario.years[0].grossMarginPercent}%)</td>
                <td className="py-2 px-4 text-right">{formatCurrency(currentScenario.years[1].grossProfit)} ({currentScenario.years[1].grossMarginPercent}%)</td>
                <td className="py-2 pl-4 text-right">{formatCurrency(currentScenario.years[2].grossProfit)} ({currentScenario.years[2].grossMarginPercent}%)</td>
              </tr>

              {/* OPEX & NET OPERATING PROFIT */}
              <tr className="text-neutral-400 pt-2 font-sans font-semibold text-[11px] uppercase tracking-wider">
                <td colSpan={4} className="py-2">Operating Expenses</td>
              </tr>
              <tr className="text-neutral-400">
                <td className="py-1.5 pr-4 pl-3 font-sans">Marketing / Customer Acquisition (CAC)</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[0].marketingAcquisitionCost)}</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[1].marketingAcquisitionCost)}</td>
                <td className="py-1.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].marketingAcquisitionCost)}</td>
              </tr>
              <tr className="text-neutral-400">
                <td className="py-1.5 pr-4 pl-3 font-sans">Fixed Opex (Eng, Security, Compliance, Ins.)</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[0].fixedOperatingCost)}</td>
                <td className="py-1.5 px-4 text-right">{formatCurrency(currentScenario.years[1].fixedOperatingCost)}</td>
                <td className="py-1.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].fixedOperatingCost)}</td>
              </tr>
              <tr className={`font-bold text-sm ${currentScenario.years[2].operatingProfitLoss >= 0 ? "bg-emerald-950/20 text-emerald-400" : "bg-rose-950/20 text-rose-400"}`}>
                <td className="py-2.5 pr-4 font-sans">Operating Profit / (Loss)</td>
                <td className="py-2.5 px-4 text-right">{formatCurrency(currentScenario.years[0].operatingProfitLoss)}</td>
                <td className="py-2.5 px-4 text-right">{formatCurrency(currentScenario.years[1].operatingProfitLoss)}</td>
                <td className="py-2.5 pl-4 text-right">{formatCurrency(currentScenario.years[2].operatingProfitLoss)}</td>
              </tr>
              <tr className="text-neutral-300 font-bold bg-[#161824]">
                <td className="py-2 pr-4 font-sans">Cumulative Operating Profit / (Loss)</td>
                <td className="py-2 px-4 text-right">{formatCurrency(currentScenario.years[0].cumulativeOperatingProfitLoss)}</td>
                <td className="py-2 px-4 text-right">{formatCurrency(currentScenario.years[1].cumulativeOperatingProfitLoss)}</td>
                <td className="py-2 pl-4 text-right text-amber-400">{formatCurrency(currentScenario.years[2].cumulativeOperatingProfitLoss)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: UNIT ECONOMICS TABLE (§2.1) */}
      {activeTab === "unit_economics" && (
        <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#202330] pb-3">
            <h3 className="text-sm font-semibold text-white">Unit Economics per Tier (§2.1)</h3>
            <p className="text-xs text-neutral-400">
              Notice the contrast: Consumer keeps only 51.2% after store fees & human review, while Business workspaces keep 74.3%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {UNIT_ECONOMICS.map((tier) => (
              <div
                key={tier.tierName}
                className="bg-[#161824] border border-[#262A3C] rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#222534] pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{tier.tierName}</h4>
                    <span className="text-[11px] text-neutral-400 font-mono">${tier.listPriceMonthly}/month</span>
                  </div>
                  <div className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {tier.contributionMarginPercent}% Margin
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono divide-y divide-[#222534]">
                  <div className="flex justify-between py-1 text-neutral-300">
                    <span>Net After Store/Fee ({tier.feePercentage}%):</span>
                    <span className="font-semibold">${tier.netPriceAfterFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-neutral-400">
                    <span>Inference & Storage Cost:</span>
                    <span>-${tier.inferenceStorageCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-neutral-400">
                    <span>Human Review Share Cost:</span>
                    <span>-${tier.humanReviewShareCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-emerald-400 font-bold bg-emerald-950/20 px-2 rounded">
                    <span>Monthly Contribution:</span>
                    <span>${tier.contributionMarginDollars.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-neutral-300">
                    <span>Estimated Lifetime Value (LTV):</span>
                    <span className="font-bold text-white">${tier.ltvDollars.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-neutral-400">
                    <span>Customer Acquisition Cost (CAC):</span>
                    <span>${tier.cacDollars.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-amber-400 font-bold">
                    <span>LTV / CAC Ratio:</span>
                    <span>{tier.ltvToCacRatio}x</span>
                  </div>
                  <div className="flex justify-between py-1 text-neutral-300">
                    <span>CAC Payback Period:</span>
                    <span>{tier.paybackMonths} months</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 12 REVENUE STREAMS (§2 Table) */}
      {activeTab === "streams" && (
        <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#202330] pb-3">
            <h3 className="text-sm font-semibold text-white">12 Monetization Streams (§2)</h3>
            <p className="text-xs text-neutral-400">
              Ordered by speed of implementation and margin contribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MONETIZATION_STREAMS.map((stream) => (
              <div
                key={stream.id}
                className="p-4 rounded-xl bg-[#161824] border border-[#262A3C] space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 block">STREAM #{stream.id}</span>
                    <h4 className="text-sm font-bold text-white">{stream.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-amber-400 block">{stream.proposedPrice}</span>
                    <span className="text-[10px] font-mono text-neutral-400">TTM: {stream.timeToFirstRevenue}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#202434] text-neutral-300">
                    Buyer: {stream.targetBuyer}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#202434] text-emerald-400 font-semibold">
                    {stream.marginProfile}
                  </span>
                </div>

                <p className="text-neutral-300 text-[11px] leading-relaxed font-sans pt-1">
                  {stream.strategicRole}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: THE 5 STRATEGIC LESSONS (§14.4) */}
      {activeTab === "strategy" && (
        <div className="bg-[#12141D] border border-[#232636] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#202330] pb-3">
            <h3 className="text-sm font-semibold text-white">
              How to Read This Without Fooling Yourself (§14.4)
            </h3>
            <p className="text-xs text-neutral-400">
              The 5 strategic insights directly from the VeriCue blueprint:
            </p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-4 rounded-xl bg-[#161824] border border-[#262A3C] space-y-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono">1</span>
                Gross margin is fine; the operating line is what kills.
              </h4>
              <p className="text-neutral-300 pl-7">
                Contribution margin per tier runs 51% (consumer), 74% (business), 78% (enterprise) — but fixed opex (engineering, compliance, SOC2 certification, insurance) requires ~$5.0M of funding before reaching breakeven. This is a normal SaaS shape requiring capital before price increases.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161824] border border-[#262A3C] space-y-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono">2</span>
                The consumer app store fee is a structural tax.
              </h4>
              <p className="text-neutral-300 pl-7">
                Moving consumer billing to web checkout, or pushing customers into B2B workspaces, is worth more than any feature you could ship. Gross margin drops from 74.7% to 65.4% as consumer revenue passes $1M and Apple/Google take 30%.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161824] border border-[#262A3C] space-y-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono">3</span>
                The reviewer requirement is the sneaky cost.
              </h4>
              <p className="text-neutral-300 pl-7">
                In the base case, human sign-off consumes $848,640 in Year 3 — 13% of revenue and 37% of all variable cost. Reduce it with AI-assisted review tooling (reviewer sees pre-filled highlights, not raw tape); every point of review share you shave is pure profit.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161824] border border-[#262A3C] space-y-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono">4</span>
                Beachhead math beats TAM math.
              </h4>
              <p className="text-neutral-300 pl-7">
                The plan does not require winning the speculative $11B pre-employment market (which has high legal exposure). It requires winning a few hundred workspaces in insurance claims triage (SIU) and corporate audit, where one avoided fraudulent claim pays for the entire year's contract.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161824] border border-[#262A3C] space-y-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono">5</span>
                Sensitivity: B2B workspace count is the master lever.
              </h4>
              <p className="text-neutral-300 pl-7">
                Each B2B workspace carries 70× the ARPU of a consumer subscriber at a fraction of the acquisition cost. Tripling consumer count changes the base case far less than tripling workspaces. Focus product engineering on team audit trails and reviewer workflows.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
