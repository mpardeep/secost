import { useEffect, useRef } from 'react';
import { calculateApartmentCosts, formatCurrency, getMunicipalityTaxRate } from '../calculator';

export default function ApartmentDetail({ apt, monthlyIncome, baselineMunicipality, globalInterestRate, onClose, onEdit, onDelete }) {
  const costs = calculateApartmentCosts(apt, monthlyIncome, baselineMunicipality, globalInterestRate);
  const baselineRate = getMunicipalityTaxRate(baselineMunicipality) || getMunicipalityTaxRate('Solna') || 29.7;
  const modalRef = useRef(null);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const housingRows = [
    { label: 'Market Value', value: costs.marketValue },
    { label: 'Down Payment', value: costs.downPayment },
    { label: 'Extra Payment', value: costs.extraPayment },
    { label: 'Total Down Payment', value: costs.totalDownPayment },
    { label: 'Loan Amount', value: costs.loan },
  ];

  const interestRows = [
    { label: 'Yearly Interest', value: costs.yearlyInterest },
    { label: 'Monthly Interest', value: costs.monthlyInterest },
    { label: 'Monthly Principal (Amortization)', value: costs.monthlyPrincipal },
    { label: 'Avgift / Monthly Fee', value: costs.avgift },
    { label: 'Other Operating Costs', value: costs.otherCosts },
  ];

  const ib = costs.interestBenefit;
  const over100k = ib.tier2Amount > 0;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-semibold text-white">{apt.name}</h2>
            {apt.address && (
              <p className="text-sm text-slate-400">{apt.address}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {/* Housing Cost Card */}
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-xl p-5 mb-6">
            <p className="text-sm text-indigo-300 font-medium mb-1">Actual Housing Cost</p>
            <p className="text-3xl font-bold text-indigo-400">
              {formatCurrency(costs.actualCost)}
            </p>
            <p className="text-xs text-indigo-400/60 mt-1">
              After principal & interest refund deductions
            </p>
          </div>

          {/* Interest & Refund Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Interest Refund (Ränteavdrag)
            </h3>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Yearly Interest</span>
                <span className="text-sm font-medium text-slate-200">{formatCurrency(costs.yearlyInterest)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">
                  30% on first {formatCurrency(100000)}
                </span>
                <span className="text-sm font-medium text-emerald-400">
                  −{formatCurrency(ib.tier1Benefit)}/yr
                </span>
              </div>

              {over100k && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">
                    20% on {formatCurrency(ib.tier2Amount)} above limit
                  </span>
                  <span className="text-sm font-medium text-emerald-400">
                    −{formatCurrency(ib.tier2Benefit)}/yr
                  </span>
                </div>
              )}

              <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Total Yearly Refund</span>
                <span className="text-sm font-bold text-emerald-400">
                  {formatCurrency(ib.totalYearlyBenefit)}/yr
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Monthly Refund</span>
                <span className="text-sm font-bold text-emerald-400">
                  {formatCurrency(ib.totalMonthlyBenefit)}/mo
                </span>
              </div>
            </div>

            {over100k && (
              <p className="text-xs text-amber-400/80 bg-amber-500/10 rounded-lg px-3 py-2">
                Your yearly interest exceeds 100,000 kr, so the refund drops to 20% on the amount above.
              </p>
            )}
          </div>

          {/* Municipality Tax Section */}
          {monthlyIncome > 0 && costs.municipalityRate && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Extra Income Tax Cost ({apt.municipality} vs {baselineMunicipality})
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                This is the additional tax you pay by living in {apt.municipality} instead of {baselineMunicipality}. Housing cost is shown separately above.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{apt.municipality} rate</span>
                  <span className="text-sm font-medium text-slate-200">{costs.municipalityRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{baselineMunicipality} rate (baseline)</span>
                  <span className="text-sm font-medium text-slate-200">{baselineRate}%</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-300">Extra cost vs baseline</span>
                  <span className={`text-sm font-bold ${costs.taxDifferenceVsBaseline > 0 ? 'text-red-400' : costs.taxDifferenceVsBaseline < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {costs.taxDifferenceVsBaseline > 0 ? '+' : ''}{formatCurrency(costs.taxDifferenceVsBaseline)}/mo
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Out-of-Pocket Total */}
          {monthlyIncome > 0 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-700/50 border border-slate-600 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-white mb-3">Out-of-Pocket Total</h3>
              <p className="text-xs text-slate-500 mb-3">
                Housing cost plus the extra tax (or savings) from living in {apt.municipality || 'this municipality'} vs {baselineMunicipality}.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Housing cost</span>
                  <span className="text-sm font-medium text-slate-200">{formatCurrency(costs.actualCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Extra tax vs {baselineMunicipality}</span>
                  <span className={`text-sm font-medium ${costs.taxDifferenceVsBaseline > 0 ? 'text-red-400' : costs.taxDifferenceVsBaseline < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {costs.taxDifferenceVsBaseline > 0 ? '+' : ''}{formatCurrency(costs.taxDifferenceVsBaseline)}
                  </span>
                </div>
                <div className="border-t border-slate-600 pt-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-white">= Out-of-Pocket Total</span>
                  <span className="text-xl font-bold text-white">{formatCurrency(costs.outOfPocket)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Loan & Purchase Details */}
          <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">
            Purchase Details
          </h3>
          <div className="space-y-3 mb-6">
            {housingRows.map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0"
              >
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="text-sm font-medium text-slate-200">
                  {formatCurrency(row.value)}
                </span>
              </div>
            ))}
          </div>

          {/* Interest & Fees Details */}
          <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">
            Interest & Fees
          </h3>
          <div className="space-y-3 mb-6">
            {interestRows.map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0"
              >
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="text-sm font-medium text-slate-200">
                  {formatCurrency(row.value)}
                </span>
              </div>
            ))}
          </div>

          {/* Bank Deduction Breakdown */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Monthly Bank Deduction</span>
              <span className="text-sm font-semibold text-slate-200">
                {formatCurrency(costs.monthlyDeduction)}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span className="text-sm">− Principal (your money)</span>
              <span className="text-sm font-medium">
                −{formatCurrency(costs.monthlyPrincipal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span className="text-sm">− Interest Refund</span>
              <span className="text-sm font-medium">
                −{formatCurrency(costs.taxBenefit)}
              </span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-300">= Actual Housing Cost</span>
              <span className="text-base font-bold text-indigo-400">
                {formatCurrency(costs.actualCost)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose();
                onEdit(apt);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this accommodation?')) {
                  onDelete(apt.id);
                  onClose();
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
