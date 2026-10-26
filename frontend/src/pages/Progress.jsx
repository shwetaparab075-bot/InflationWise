import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { formatDate, formatINR, formatPercent } from '../utils/currency';
import { Disclaimer, EmptyState, PageHeader, ProgressBar, Spinner, StatusBadge } from '../components/ui';
import { ChartCard, PlannedActualChart } from '../components/charts';

export default function Progress() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/reports').then((response) => setGoals(response.data.data.goalProgress)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Goal Progress" subtitle="Saved amounts include the goal balance plus linked savings accounts." />
      {goals.length === 0 ? <EmptyState title="No financial goals created yet." text="Start by creating your first financial goal." /> : (
        <div className="grid gap-4">
          {goals.map((goal) => {
            const short = goal.difference > 0;
            return (
              <article key={goal.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#16C7D9]">{goal.goalCategory}</p>
                    <h3 className="font-display text-xl font-bold">{goal.goalName}</h3>
                  </div>
                  <StatusBadge status={goal.status} />
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <p>Current goal cost<br /><strong>{formatINR(goal.currentCost)}</strong></p>
                  <p>Future goal cost<br /><strong>{formatINR(goal.futureCost)}</strong></p>
                  <p>Current saved amount<br /><strong>{formatINR(goal.saved)}</strong></p>
                  <p>Target date<br /><strong>{formatDate(goal.targetDate)}</strong></p>
                  <p>Required monthly saving<br /><strong>{formatINR(goal.planned)}</strong></p>
                  <p>Actual monthly saving<br /><strong>{formatINR(goal.actual)}</strong></p>
                  <p>Progress<br /><strong>{formatPercent(goal.progress)}</strong></p>
                </div>
                <div className="mt-4"><ProgressBar value={goal.progress} /></div>
                <div className="mt-4 rounded-xl bg-[#DDF8FB] p-4 text-sm">
                  <p>Planned Monthly Saving: <strong>{formatINR(goal.planned)}</strong></p>
                  <p>Actual Monthly Saving: <strong>{formatINR(goal.actual)}</strong></p>
                  <p>Difference: <strong>{formatINR(Math.abs(goal.difference))} {short ? 'Short' : goal.difference < 0 ? 'Extra' : ''}</strong></p>
                  <p className="mt-1">Status: {goal.status}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <div className="mt-6">
        <ChartCard title="Planned vs actual" empty={!goals.length ? 'No goals yet.' : ''}><PlannedActualChart data={goals.map((goal) => ({ name: goal.goalName, planned: goal.planned, actual: goal.actual }))} /></ChartCard>
      </div>
      <div className="mt-4"><Disclaimer /></div>
    </div>
  );
}
