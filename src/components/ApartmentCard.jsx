import { calculateApartmentCosts, formatCurrency } from '../calculator';

function TrashIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default function ApartmentCard({ apt, monthlyIncome, baselineMunicipality, globalInterestRate, onClick, onDelete }) {
  const costs = calculateApartmentCosts(apt, monthlyIncome, baselineMunicipality, globalInterestRate);

  const taxDiffColor =
    costs.taxDifferenceVsBaseline > 0
      ? 'text-red-400 bg-red-400/10'
      : costs.taxDifferenceVsBaseline < 0
      ? 'text-emerald-400 bg-emerald-400/10'
      : 'text-slate-400 bg-slate-700/50';

  return (
    <div
      onClick={onClick}
      className="bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer border border-slate-700 overflow-hidden group flex flex-col relative"
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Delete "${apt.name || 'this accommodation'}"?`)) {
            onDelete(apt.id);
          }
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-slate-700/80 text-slate-400 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Delete"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4 pr-8">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
              {apt.name || 'Unnamed Accommodation'}
            </h3>
            {apt.address && (
              <p className="text-sm text-slate-400 mt-0.5">{apt.address}</p>
            )}
          </div>
          <div className="bg-slate-700 px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-slate-300">
              {apt.rooms || '-'}
            </span>
          </div>
        </div>

        {apt.municipality && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-400">{apt.municipality}</span>
            {costs.municipalityRate && (
              <span className="text-xs text-slate-500">{costs.municipalityRate}% tax</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-slate-700/50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Market Value</p>
            <p className="text-sm font-semibold text-slate-200">
              {formatCurrency(costs.marketValue)}
            </p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Loan</p>
            <p className="text-sm font-semibold text-slate-200">
              {formatCurrency(costs.loan)}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Monthly Housing Cost</p>
              <p className="text-2xl font-bold text-indigo-400">
                {formatCurrency(costs.actualCost)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">Monthly Bank Deduction</p>
              <p className="text-2xl font-bold text-slate-400">
                {formatCurrency(costs.monthlyDeduction)}
              </p>
            </div>
          </div>
        </div>

        {monthlyIncome > 0 && costs.municipalityRate && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Extra tax vs {baselineMunicipality}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${taxDiffColor}`}>
                {costs.taxDifferenceVsBaseline > 0 ? '+' : ''}
                {formatCurrency(costs.taxDifferenceVsBaseline)}/mo
              </span>
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-700">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Out-of-Pocket Total (housing + tax delta)</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(costs.outOfPocket)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400">
            Interest Refund {formatCurrency(costs.taxBenefit)}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400">
            Avgift {formatCurrency(costs.avgift)}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400">
            Interest {formatCurrency(costs.monthlyInterest)}/mo
          </span>
        </div>
      </div>
    </div>
  );
}
