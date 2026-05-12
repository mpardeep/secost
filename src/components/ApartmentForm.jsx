import { useState } from 'react';
import { TAX_RATES } from '../calculator';

const initialForm = {
  name: '',
  address: '',
  rooms: '2 ROK',
  municipality: '',
  marketValue: '',
  downPaymentPercent: '10',
  extraPayment: '0',
  amortizationPercent: '2',
  avgift: '',
  otherCosts: '0',
};

export default function ApartmentForm({ onSave, onCancel, initialData = null }) {
  const [form, setForm] = useState(initialData || initialForm);
  const [errors, setErrors] = useState({});
  const [muniSearch, setMuniSearch] = useState(initialData?.municipality || '');
  const [showMuniDropdown, setShowMuniDropdown] = useState(false);

  const filteredMunicipalities = muniSearch
    ? TAX_RATES.filter((m) =>
        m.name.toLowerCase().includes(muniSearch.toLowerCase())
      ).slice(0, 10)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.marketValue || Number(form.marketValue) <= 0)
      newErrors.marketValue = 'Valid market value is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      id: initialData?.id || crypto.randomUUID(),
    });
  };

  const inputClass = (name) =>
    `w-full px-3 py-2 rounded-lg border ${
      errors[name]
        ? 'border-red-500 focus:ring-red-500/30'
        : 'border-slate-700 bg-slate-800 text-slate-100 focus:ring-indigo-500/30 focus:border-indigo-500'
    } bg-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all placeholder-slate-500`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 rounded-t-2xl z-10">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Accommodation' : 'Add New Accommodation'}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Accommodation Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Stockholm 3.9M"
                className={inputClass('name')}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. Storgatan 1, Stockholm"
                className={inputClass('address')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Rooms
              </label>
              <input
                name="rooms"
                value={form.rooms}
                onChange={handleChange}
                placeholder="e.g. 2 ROK"
                className={inputClass('rooms')}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Municipality
              </label>
              <input
                value={muniSearch}
                onChange={(e) => {
                  setMuniSearch(e.target.value);
                  setShowMuniDropdown(true);
                  setForm((prev) => ({ ...prev, municipality: '' }));
                }}
                onFocus={() => setShowMuniDropdown(true)}
                placeholder="Search municipality..."
                className={inputClass('municipality')}
              />
              {showMuniDropdown && filteredMunicipalities.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {filteredMunicipalities.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => {
                        setMuniSearch(m.name);
                        setForm((prev) => ({ ...prev, municipality: m.name }));
                        setShowMuniDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      {m.name} ({m.total}%)
                    </button>
                  ))}
                </div>
              )}
              {showMuniDropdown && muniSearch && filteredMunicipalities.length === 0 && (
                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 text-sm text-slate-400">
                  No municipality found
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Market Value (kr) *
              </label>
              <input
                name="marketValue"
                type="number"
                value={form.marketValue}
                onChange={handleChange}
                placeholder="3900000"
                className={inputClass('marketValue')}
              />
              {errors.marketValue && (
                <p className="text-red-400 text-xs mt-1">{errors.marketValue}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Down Payment %
              </label>
              <input
                name="downPaymentPercent"
                type="number"
                step="0.1"
                value={form.downPaymentPercent}
                onChange={handleChange}
                placeholder="10"
                className={inputClass('downPaymentPercent')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Extra Payment (kr)
              </label>
              <input
                name="extraPayment"
                type="number"
                value={form.extraPayment}
                onChange={handleChange}
                placeholder="0"
                className={inputClass('extraPayment')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Amortization %/year
              </label>
              <input
                name="amortizationPercent"
                type="number"
                step="0.1"
                value={form.amortizationPercent}
                onChange={handleChange}
                placeholder="2"
                className={inputClass('amortizationPercent')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Avgift / Monthly Fee (kr)
              </label>
              <input
                name="avgift"
                type="number"
                value={form.avgift}
                onChange={handleChange}
                placeholder="4200"
                className={inputClass('avgift')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Other Operating Costs (kr)
              </label>
              <input
                name="otherCosts"
                type="number"
                value={form.otherCosts}
                onChange={handleChange}
                placeholder="600"
                className={inputClass('otherCosts')}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/50"
            >
              {initialData ? 'Save Changes' : 'Add Accommodation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
