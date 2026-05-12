import { useState, useEffect, useRef } from 'react';
import ApartmentCard from './components/ApartmentCard';
import ApartmentForm from './components/ApartmentForm';
import ApartmentDetail from './components/ApartmentDetail';
import { calculateApartmentCosts, formatCurrency, getMunicipalityTaxRate, TAX_RATES } from './calculator';

const defaultApartments = [
  {
    id: '1',
    name: 'Stockholm 3.9M',
    address: 'Stockholm',
    rooms: '2 ROK',
    municipality: 'Stockholm',
    marketValue: 3900000,
    downPaymentPercent: 10,
    extraPayment: 0,
    interestRate: 2.7,
    amortizationPercent: 2,
    avgift: 4200,
    otherCosts: 600,
    taxDeductionRate: 30,
  },
];

function MunicipalitySearch({ value, onChange, placeholder, label }) {
  const [search, setSearch] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = search
    ? TAX_RATES.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      )}
      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowDropdown(true);
          onChange('');
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder-slate-500"
      />
      {showDropdown && filtered.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filtered.map((m) => (
            <button
              key={m.name}
              type="button"
              onClick={() => {
                setSearch(m.name);
                onChange(m.name);
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {m.name} ({m.total}%)
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HouseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 21V10.8284C19 10.298 18.7893 9.78929 18.4142 9.41421L12 3L5.58579 9.41421C5.21071 9.78929 5 10.298 5 10.8284V21C5 21.5523 5.44772 22 6 22H9C9.55228 22 10 21.5523 10 21V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V21C14 21.5523 14.4477 22 15 22H18C18.5523 22 19 21.5523 19 21Z" />
    </svg>
  );
}

function MenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function App() {
  const [apartments, setApartments] = useState(() => {
    const saved = localStorage.getItem('apartments');
    return saved ? JSON.parse(saved) : defaultApartments;
  });
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    const saved = localStorage.getItem('monthlyIncome');
    return saved ? Number(saved) : 50000;
  });
  const [baselineMunicipality, setBaselineMunicipality] = useState(() => {
    const saved = localStorage.getItem('baselineMunicipality');
    return saved || 'Solna';
  });
  const [globalInterestRate, setGlobalInterestRate] = useState(() => {
    const saved = localStorage.getItem('globalInterestRate');
    return saved != null ? Number(saved) : 2.7;
  });
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [sortBy, setSortBy] = useState('outOfPocket');
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    localStorage.setItem('apartments', JSON.stringify(apartments));
  }, [apartments]);

  useEffect(() => {
    localStorage.setItem('monthlyIncome', String(monthlyIncome));
  }, [monthlyIncome]);

  useEffect(() => {
    localStorage.setItem('baselineMunicipality', baselineMunicipality);
  }, [baselineMunicipality]);

  useEffect(() => {
    localStorage.setItem('globalInterestRate', String(globalInterestRate));
  }, [globalInterestRate]);

  // Close popups on ESC key
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') {
        if (showForm) {
          setShowForm(false);
          setEditingApartment(null);
        } else if (selectedApartment) {
          setSelectedApartment(null);
        }
      }
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showForm, selectedApartment]);

  const handleSave = (apt) => {
    if (editingApartment) {
      setApartments((prev) => prev.map((a) => (a.id === apt.id ? apt : a)));
      setEditingApartment(null);
    } else {
      setApartments((prev) => [...prev, apt]);
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setApartments((prev) => prev.filter((a) => a.id !== id));
    setSelectedApartment(null);
  };

  const handleReset = () => {
    if (confirm('Reset everything? This will delete all accommodations and restore default settings.')) {
      localStorage.removeItem('apartments');
      localStorage.removeItem('monthlyIncome');
      localStorage.removeItem('baselineMunicipality');
      localStorage.removeItem('globalInterestRate');
      setApartments(defaultApartments);
      setMonthlyIncome(50000);
      setBaselineMunicipality('Solna');
      setGlobalInterestRate(2.7);
      setSortBy('outOfPocket');
    }
  };

  const sortedApartments = [...apartments].sort((a, b) => {
    const aCosts = calculateApartmentCosts(a, monthlyIncome, baselineMunicipality, globalInterestRate);
    const bCosts = calculateApartmentCosts(b, monthlyIncome, baselineMunicipality, globalInterestRate);
    if (sortBy === 'outOfPocket') return aCosts.outOfPocket - bCosts.outOfPocket;
    if (sortBy === 'actualCost') return aCosts.actualCost - bCosts.actualCost;
    if (sortBy === 'marketValue') return aCosts.marketValue - bCosts.marketValue;
    if (sortBy === 'monthlyDeduction') return aCosts.monthlyDeduction - bCosts.monthlyDeduction;
    if (sortBy === 'taxDifferenceVsBaseline') return aCosts.taxDifferenceVsBaseline - bCosts.taxDifferenceVsBaseline;
    return 0;
  });

  const hasIncome = monthlyIncome > 0;
  const baselineRate = getMunicipalityTaxRate(baselineMunicipality) || getMunicipalityTaxRate('Solna') || 29.7;

  return (
    <div className="min-h-screen bg-black text-slate-200">
      {/* App Name Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <HouseIcon className="w-6 h-6" />
              </div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl font-bold text-white leading-tight">
                  SeCost
                </h1>
                <p className="text-xs text-slate-500 italic">check and compare your accommodation cost</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-500 hidden sm:block">
                {apartments.length} accommodation{apartments.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => setShowSettings((s) => !s)}
                className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                aria-label="Toggle settings"
                title="Toggle settings"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Bar */}
      {showSettings && (
        <div className="bg-slate-900/80 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Monthly Salary */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Monthly Salary (gross)</label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder-slate-500"
                    placeholder="50000"
                  />
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Interest Rate % (all)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={globalInterestRate}
                    onChange={(e) => setGlobalInterestRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder-slate-500"
                    placeholder="2.7"
                  />
                </div>

                {/* Baseline Municipality */}
                <MunicipalitySearch
                  value={baselineMunicipality}
                  onChange={setBaselineMunicipality}
                  placeholder="Search baseline..."
                  label={`Baseline Municipality (${baselineRate}%)`}
                />

                {/* Sort */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="outOfPocket">Out-of-Pocket Total</option>
                    <option value="actualCost">Housing Cost</option>
                    <option value="marketValue">Market Value</option>
                    <option value="monthlyDeduction">Bank Payment</option>
                    <option value="taxDifferenceVsBaseline">Extra Tax vs Baseline</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-slate-200 transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {apartments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-4xl border border-slate-700">
              🏠
            </div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">
              No accommodations yet
            </h2>
            <p className="text-slate-500 mb-6">
              Add your first accommodation to start comparing monthly costs
            </p>
            <button
              onClick={() => {
                setEditingApartment(null);
                setShowForm(true);
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Add Accommodation
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedApartments.map((apt) => (
                <ApartmentCard
                  key={apt.id}
                  apt={apt}
                  monthlyIncome={monthlyIncome}
                  baselineMunicipality={baselineMunicipality}
                  globalInterestRate={globalInterestRate}
                  onClick={() => setSelectedApartment(apt)}
                  onDelete={handleDelete}
                />
              ))}
              {/* Add New Tile */}
              <button
                onClick={() => {
                  setEditingApartment(null);
                  setShowForm(true);
                }}
                className="bg-slate-800/40 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center min-h-[320px] hover:bg-slate-800/60 hover:border-indigo-500/50 transition-all group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-indigo-600/20 group-hover:scale-110 transition-all">
                  <span className="text-4xl text-slate-500 group-hover:text-indigo-400 transition-colors">+</span>
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-300 transition-colors">Add Accommodation</span>
              </button>
            </div>

            {/* Comparison Table */}
            <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              {hasIncome && (
                <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                  <span>Baseline: {baselineMunicipality} ({baselineRate}%)</span>
                  <span>·</span>
                  <span>Interest: {globalInterestRate}%</span>
                  <span>·</span>
                  <span>Salary: {formatCurrency(monthlyIncome)}/mo</span>
                </div>
              )}
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
                Comparison Overview
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Accommodation</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Municipality</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Tax Rate</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Yearly Interest</th>
                      <th className="text-right py-3 px-4 font-medium text-indigo-400">Housing Cost</th>
                      {hasIncome && (
                        <>
                          <th className="text-right py-3 px-4 font-medium text-amber-400">Extra Tax vs {baselineMunicipality}</th>
                          <th className="text-right py-3 px-4 font-medium text-white">Out-of-Pocket</th>
                        </>
                      )}
                      {!hasIncome && (
                        <th className="text-right py-3 px-4 font-medium text-slate-500">Bank Payment</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedApartments.map((apt) => {
                      const costs = calculateApartmentCosts(apt, monthlyIncome, baselineMunicipality, globalInterestRate);
                      return (
                        <tr
                          key={apt.id}
                          className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedApartment(apt)}
                        >
                          <td className="py-3 px-4 font-medium text-slate-200">
                            {apt.name}
                            <span className="block text-xs text-slate-500 font-normal">
                              {apt.rooms}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {apt.municipality || '-'}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-400">
                            {costs.municipalityRate ? `${costs.municipalityRate}%` : '-'}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-300">
                            {formatCurrency(costs.yearlyInterest)}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-indigo-400">
                            {formatCurrency(costs.actualCost)}
                          </td>
                          {hasIncome && (
                            <>
                              <td className={`text-right py-3 px-4 font-medium ${costs.taxDifferenceVsBaseline > 0 ? 'text-red-400' : costs.taxDifferenceVsBaseline < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {costs.taxDifferenceVsBaseline > 0 ? '+' : ''}{formatCurrency(costs.taxDifferenceVsBaseline)}/mo
                              </td>
                              <td className="text-right py-3 px-4 font-bold text-white">
                                {formatCurrency(costs.outOfPocket)}
                              </td>
                            </>
                          )}
                          {!hasIncome && (
                            <td className="text-right py-3 px-4 text-slate-300">
                              {formatCurrency(costs.monthlyDeduction)}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {showForm && (
        <ApartmentForm
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingApartment(null);
          }}
          initialData={editingApartment}
        />
      )}

      {selectedApartment && (
        <ApartmentDetail
          apt={selectedApartment}
          monthlyIncome={monthlyIncome}
          baselineMunicipality={baselineMunicipality}
          globalInterestRate={globalInterestRate}
          onClose={() => setSelectedApartment(null)}
          onEdit={(apt) => {
            setEditingApartment(apt);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-slate-500">
            Made with <span className="text-red-500">♥</span> by PM
          </p>
        </div>
      </footer>
    </div>
  );
}
