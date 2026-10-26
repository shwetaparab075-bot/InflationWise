import React, { useEffect, useState } from 'react';
import { PiggyBank, Receipt, Target, Users } from 'lucide-react';
import adminApi from '../../services/adminApi';
import { Spinner, StatCard } from '../../components/ui';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/admin/overview').then((response) => setData(response.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Users" value={String(data.totalUsers)} tone="deep" icon={<Users size={18} />} />
      <StatCard label="Total Financial Goals" value={String(data.totalGoals)} tone="blue" icon={<Target size={18} />} />
      <StatCard label="Total Expense Records" value={String(data.totalExpenses)} tone="cyan" icon={<Receipt size={18} />} />
      <StatCard label="Total Savings Records" value={String(data.totalSavings)} tone="sky" icon={<PiggyBank size={18} />} />
    </div>
  );
}
