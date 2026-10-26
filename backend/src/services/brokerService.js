/**
 * Brokerage / Investment API Service - India (Zerodha / Groww / ICICI Direct)
 */

const getInvestmentOptions = async () => {
  return [
    {
      id: 'inv_01',
      name: 'Nifty 50 Index Mutual Fund',
      type: 'Equity Index',
      expectedReturnPct: 12.5,
      riskLevel: 'Moderate-High',
      description: 'Top 50 Indian bluechip companies with 12.5% historical CAGR beating CPI inflation.'
    },
    {
      id: 'inv_02',
      name: 'Sovereign Gold Bonds (SGB) & PPF',
      type: 'Government Debt / Gold',
      expectedReturnPct: 8.2,
      riskLevel: 'Very Low',
      description: 'Sovereign backed 2.5% fixed coupon + capital appreciation tracking physical gold.'
    },
    {
      id: 'inv_03',
      name: 'Indian REITs (Real Estate Investment Trust)',
      type: 'Real Estate',
      expectedReturnPct: 10.0,
      riskLevel: 'Moderate',
      description: 'Commercial real estate portfolio in Bengaluru/Mumbai providing quarterly rental yields.'
    },
    {
      id: 'inv_04',
      name: 'High-Yield Bank Fixed Deposit (FD)',
      type: 'Bank Savings',
      expectedReturnPct: 7.1,
      riskLevel: 'Very Low',
      description: 'DICGC insured up to ₹5 Lakhs, guaranteed capital protection.'
    }
  ];
};

module.exports = {
  getInvestmentOptions
};
