import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Target, PiggyBank, Calendar, TrendingUp } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import ProgressBar from '../components/common/ProgressBar';
import API from '../services/api';

const GoalProgress = () => {
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({
    totalGoals: 4,
    activeGoals: 3,
    completedGoals: 1,
    totalSaved: 1070000,
    totalTarget: 2850000,
    overallProgress: 38,
  });

  useEffect(() => {
    const fetchGoalProgress = async () => {
      try {
        const res = await API.get('/goals');
        if (res.data.success && res.data.goals) {
          setGoals(res.data.goals);
          if (res.data.summary) {
            setSummary(res.data.summary);
          }
        }
      } catch (err) {
        console.warn('Using default goal progress data');
        setGoals([
          { _id: '1', goalName: '6-Month Emergency Reserve', targetAmount: 300000, currentSaved: 300000, targetDate: '2026-06-30', progressPercent: 100, remaining: 0, status: 'Completed' },
          { _id: '2', goalName: 'New Electric SUV', targetAmount: 800000, currentSaved: 320000, targetDate: '2028-12-31', progressPercent: 40, remaining: 480000, status: 'Active' },
          { _id: '3', goalName: 'Children Higher Education', targetAmount: 1500000, currentSaved: 450000, targetDate: '2032-05-31', progressPercent: 30, remaining: 1050000, status: 'Active' },
        ]);
      }
    };

    fetchGoalProgress();
  }, []);

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="page-title">Goal Progress</h1>
        <p className="section-subtitle">Track completion milestones for all your financial target corpuses.</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Saved Toward Goals"
          value={formatINR(summary.totalSaved)}
          subtitle="Accumulated corpus"
          icon={PiggyBank}
          accentColor="emerald"
        />
        <StatCard
          title="Active Goals"
          value={summary.activeGoals.toString()}
          subtitle="In progress"
          icon={Target}
          accentColor="blue"
        />
        <StatCard
          title="Completed Goals"
          value={summary.completedGoals.toString()}
          subtitle="Milestones achieved"
          icon={CheckCircle2}
          accentColor="purple"
        />
        <StatCard
          title="Overall Corpus Progress"
          value={`${summary.overallProgress}%`}
          subtitle={`Target: ${formatINR(summary.totalTarget)}`}
          icon={Award}
          accentColor="orange"
        />
      </div>

      {/* Detailed Goal Progress Cards */}
      <div className="space-y-4">
        <h3 className="section-title">Goal Progress Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = goal.progressPercent !== undefined ? goal.progressPercent : Math.round((goal.currentSaved / goal.targetAmount) * 100);
            const remaining = goal.remaining !== undefined ? goal.remaining : Math.max(0, goal.targetAmount - goal.currentSaved);

            return (
              <div key={goal._id} className="card p-6 space-y-4 hover-lift">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-[#10233F]" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                      {goal.goalName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Target Date: {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`badge ${goal.status === 'Completed' ? 'badge-emerald' : 'badge-blue'}`}>
                    {goal.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7A90]">Current Saved: <strong className="text-[#10233F]">{formatINR(goal.currentSaved)}</strong></span>
                    <span className="text-[#6B7A90]">Target: <strong className="text-[#10233F]">{formatINR(goal.targetAmount)}</strong></span>
                  </div>

                  <ProgressBar percentage={progress} height="h-3.5" />

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-500 font-medium">Remaining Amount: <strong className="text-[#10233F]">{formatINR(remaining)}</strong></span>
                    <span className="font-extrabold text-[#2478E8] text-sm">{progress}% Complete</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GoalProgress;
