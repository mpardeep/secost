import taxRatesData from './taxRates.json';

export const TAX_RATES = taxRatesData;

export function getMunicipalityTaxRate(municipalityName) {
  if (!municipalityName) return null;
  const match = TAX_RATES.find(
    (m) => m.name.toLowerCase() === municipalityName.toLowerCase()
  );
  return match ? match.total : null;
}

// Swedish interest tax deduction:
// 30% on interest up to 100,000 SEK/year
// 20% on interest above 100,000 SEK/year
export function calculateInterestTaxBenefit(yearlyInterest) {
  const TIER_1_LIMIT = 100000;
  const TIER_1_RATE = 0.30;
  const TIER_2_RATE = 0.20;

  if (yearlyInterest <= TIER_1_LIMIT) {
    return {
      tier1Amount: yearlyInterest,
      tier1Benefit: yearlyInterest * TIER_1_RATE,
      tier2Amount: 0,
      tier2Benefit: 0,
      totalYearlyBenefit: yearlyInterest * TIER_1_RATE,
      totalMonthlyBenefit: (yearlyInterest * TIER_1_RATE) / 12,
    };
  }

  const tier1Amount = TIER_1_LIMIT;
  const tier1Benefit = TIER_1_LIMIT * TIER_1_RATE;
  const tier2Amount = yearlyInterest - TIER_1_LIMIT;
  const tier2Benefit = tier2Amount * TIER_2_RATE;
  const totalYearlyBenefit = tier1Benefit + tier2Benefit;

  return {
    tier1Amount,
    tier1Benefit,
    tier2Amount,
    tier2Benefit,
    totalYearlyBenefit,
    totalMonthlyBenefit: totalYearlyBenefit / 12,
  };
}

export function calculateApartmentCosts(apt, monthlyIncome = 0, baselineMunicipality = 'Solna', globalInterestRate = null) {
  const marketValue = Number(apt.marketValue) || 0;
  const downPaymentPercent = Number(apt.downPaymentPercent) || 15;
  const extraPayment = Number(apt.extraPayment) || 0;
  const interestRate = globalInterestRate != null ? globalInterestRate : (Number(apt.interestRate) || 2.7);
  const amortizationPercent = Number(apt.amortizationPercent) || 2;
  const avgift = Number(apt.avgift) || 0;
  const otherCosts = Number(apt.otherCosts) || 0;

  const downPayment = marketValue * (downPaymentPercent / 100);
  const totalDownPayment = downPayment + extraPayment;
  const loan = Math.max(0, marketValue - totalDownPayment);

  const monthlyInterest = loan * (interestRate / 100) / 12;
  const yearlyInterest = monthlyInterest * 12;
  const yearlyAmortization = loan * (amortizationPercent / 100);
  const monthlyPrincipal = yearlyAmortization / 12;

  const monthlyDeduction = monthlyInterest + monthlyPrincipal + avgift + otherCosts;

  // Real Swedish interest tax deduction with tiers
  const interestBenefit = calculateInterestTaxBenefit(yearlyInterest);
  const taxBenefit = interestBenefit.totalMonthlyBenefit;

  const actualCost = monthlyDeduction - monthlyPrincipal - taxBenefit;

  // Municipality tax calculation
  const municipalityRate = getMunicipalityTaxRate(apt.municipality);
  const baselineRate = getMunicipalityTaxRate(baselineMunicipality) || getMunicipalityTaxRate('Solna') || 29.7;
  const yearlyIncome = monthlyIncome * 12;
  const monthlyMunicipalTax = municipalityRate ? yearlyIncome * (municipalityRate / 100) / 12 : 0;
  const monthlyBaselineTax = yearlyIncome * (baselineRate / 100) / 12;
  const taxDifferenceVsBaseline = monthlyMunicipalTax - monthlyBaselineTax;

  return {
    marketValue,
    downPayment,
    extraPayment,
    totalDownPayment,
    loan,
    monthlyInterest,
    yearlyInterest,
    monthlyPrincipal,
    avgift,
    otherCosts,
    monthlyDeduction,
    taxBenefit,
    interestBenefit, // tier breakdown
    actualCost,
    municipalityRate,
    baselineRate,
    monthlyMunicipalTax,
    monthlyBaselineTax,
    taxDifferenceVsBaseline,
    outOfPocket: actualCost + taxDifferenceVsBaseline,
  };
}

export function formatCurrency(value) {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value, decimals = 0) {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
