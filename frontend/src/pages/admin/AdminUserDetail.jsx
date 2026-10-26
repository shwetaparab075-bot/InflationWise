import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import { formatINR, formatPercent } from '../../utils/currency';
import { PageHeader, Spinner } from '../../components/ui';
import DataTable from '../../components/admin/DataTable';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get(`/admin/users/${id}`).then((response) => setData(response.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!data) return null;
  const { user, financial } = data;

  return (
    <div>
      <PageHeader title={user.name} subtitle="User profile and planning records." />
      <section className="card mb-6 p-6">
        <h3 className="font-display text-lg font-bold text-[#20205A]">Basic Information</h3>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <p>Name<br /><strong>{user.name}</strong></p>
          <p>Email<br /><strong>{user.email}</strong></p>
          <p>Mobile<br /><strong>{user.mobile}</strong></p>
        </div>
      </section>
      <section className="card mb-6 p-6">
        <h3 className="font-display text-lg font-bold text-[#20205A]">Financial Details</h3>
        {financial ? (
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <p>Monthly Income<br /><strong>{formatINR(financial.monthlyIncome)}</strong></p>
            <p>Monthly Expenses<br /><strong>{formatINR(financial.monthlyExpenses)}</strong></p>
            <p>Current Savings<br /><strong>{formatINR(financial.currentSavings)}</strong></p>
            <p>Monthly Savings<br /><strong>{formatINR(financial.monthlySavings)}</strong></p>
          </div>
        ) : <p className="mt-3 text-sm text-[#6B7280]">No financial details submitted.</p>}
      </section>
      <h3 className="mb-3 font-display text-lg font-bold text-[#20205A]">Expenses</h3>
      <DataTable
        headers={['Expense Name', 'Amount', 'Category', 'Type', 'Notes']}
        empty="No expenses."
        rows={data.expenses.map((row) => [row.expenseName, formatINR(row.amount), row.category, row.expenseType, row.notes || '—'])}
      />
      <h3 className="mb-3 mt-6 font-display text-lg font-bold text-[#20205A]">Financial Goals</h3>
      <DataTable
        headers={['Goal', 'Category', 'Future Cost', 'Monthly Target', 'Progress']}
        empty="No goals."
        rows={data.goals.map((row) => [row.goalName, row.goalCategory, formatINR(row.futureCost), formatINR(row.requiredMonthlySaving), formatPercent(row.progress)])}
      />
      <h3 className="mb-3 mt-6 font-display text-lg font-bold text-[#20205A]">Savings</h3>
      <DataTable
        headers={['Name', 'Type', 'Amount', 'Monthly Saving', 'Linked Goal']}
        empty="No savings."
        rows={data.savings.map((row) => [row.savingName, row.savingType, formatINR(row.amount), formatINR(row.monthlyContribution), row.linkedGoal])}
      />
    </div>
  );
}
