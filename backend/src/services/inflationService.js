/**
 * Inflation Rate Service - Tailored for India (RBI CPI Indices)
 */

const getNationalInflationData = async () => {
  return {
    country: 'India',
    nationalAverageRate: 6.0, // RBI Target ~6.0% CPI Average
    lastUpdated: new Date().toISOString().split('T')[0],
    categoryRates: {
      Housing: 7.5,
      Food: 6.8,
      Transportation: 5.5,
      Healthcare: 10.5, // Indian medical inflation
      Education: 11.0, // Indian higher ed inflation
      Utilities: 6.2,
      Entertainment: 5.0,
      Insurance: 8.0,
      Shopping: 5.5,
      Travel: 7.0,
      'Personal Care': 5.5,
      Other: 6.0
    },
    historicalData: [
      { year: 2020, rate: 6.6 },
      { year: 2021, rate: 5.1 },
      { year: 2022, rate: 6.7 },
      { year: 2023, rate: 5.7 },
      { year: 2024, rate: 4.8 },
      { year: 2025, rate: 5.4 },
      { year: 2026, rate: 6.0 }
    ]
  };
};

module.exports = {
  getNationalInflationData
};
