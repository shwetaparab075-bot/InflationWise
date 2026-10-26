/**
 * Bank / Account Aggregator API Integration Service - India (Sahamati Open Banking Framework)
 */

const syncBankAccounts = async (userId) => {
  return {
    status: 'CONNECTED',
    institution: 'RBI Sahamati Account Aggregator (HDFC / SBI / ICICI Sync)',
    accounts: [
      { id: 'acc_01', type: 'Savings Account', name: 'HDFC Salary Account (3.5% APY)', balance: 45000.00 },
      { id: 'acc_02', type: 'High Yield Savings/FD', name: 'SBI High-Yield FD (7.1% APY)', balance: 205000.00 }
    ],
    lastSynced: new Date().toISOString()
  };
};

const getRecentTransactions = async (userId) => {
  return [
    { id: 'tx_101', category: 'Housing', amount: 25000, date: '2026-08-01', description: 'Apartment Rent (UPI)' },
    { id: 'tx_102', category: 'Food', amount: 12500, date: '2026-08-05', description: 'Supermarket & Fresh Groceries' },
    { id: 'tx_103', category: 'Healthcare', amount: 4500, date: '2026-08-10', description: 'Apollo Pharmacy & Diagnostics' },
    { id: 'tx_104', category: 'Utilities', amount: 4800, date: '2026-08-12', description: 'Electricity & Fiber Broadband' },
    { id: 'tx_105', category: 'Entertainment', amount: 3500, date: '2026-08-14', description: 'BookMyShow & Streaming Subscriptions' }
  ];
};

module.exports = {
  syncBankAccounts,
  getRecentTransactions
};
