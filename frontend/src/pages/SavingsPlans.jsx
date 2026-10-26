import React, { useState, useEffect } from 'react';
import { PiggyBank, ArrowRight, ShieldCheck, Info, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import API from '../services/api';

const SavingsPlans = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    currentMonthlySaving: 35000,
    targetSavings: 45000,
    savingsGap: 10000,
    disclaimer: 'Example planning option / Possible allocation based on user financial profile. Not guaranteed financial advice.',
    recommendations: [],
  });

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await API.get('/recommendations');
        if (res.data.success) {
          setData({
            currentMonthlySaving: res.data.currentMonthlySaving || 35000,
            targetSavings: res.data.targetSavings || 45000,
            savingsGap: res.data.savingsGap || 10000,
            disclaimer: res.data.disclaimer,
            recommendations: res.data.recommendations || [],
          });
        }
      } catch (err) {
        console.warn('Using default sample recommendations');
        setData((prev) => ({
          ...prev,
          recommendations: [
            {
              _id: '1',
              title: 'Public Provident Fund (PPF)',
              category: 'PPF',
              description: 'Government-backed 15-year tax-free savings instrument under Sec 80C.',
              riskLevel: 'Low',
              minimumAmount: 500,
              expectedReturn: '7.1% p.a. tax-free',
            },
            {
              _id: '2',
              title: 'Sovereign Gold Bonds (SGB)',
              category: 'Other',
              description: 'RBI issued bonds with 2.5% p.a. fixed interest plus capital appreciation in gold.',
              riskLevel: 'Low',
              minimumAmount: 6000,
              expectedReturn: '2.5% + Gold Appreciation',
            },
            {
              _id: '3',
              title: 'Low-Cost Nifty 50 Index Fund',
              category: 'Mutual Funds',
              description: 'Passive equity index investment to outperform long-term CPI inflation.',
              riskLevel: 'Moderate',
              minimumAmount: 1000,
              expectedReturn: '12% - 14% p.a. projected',
            },
            {
              _id: '4',
              title: 'High-Yield Bank Fixed Deposit',
              category: 'Fixed Deposit',
              description: 'Guaranteed tenure returns for short-to-medium term goal capital protection.',
              riskLevel: 'Low',
              minimumAmount: 5000,
              expectedReturn: '7.2% - 7.5% p.a.',
            },
          ],
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="page-title">Saving & Investment Plan</h1>
        <p className="section-subtitle">Goal-based savings requirement analysis and example asset allocation options.</p>
      </div>

      {/* Mandatory Regulatory Disclaimer Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 text-xs text-amber-800">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900">Disclaimer & Disclaimer Notice</p>
          <p className="mt-0.5 leading-relaxed">
            Options displayed below are for <strong>example planning purposes</strong> and represent possible allocations based on general financial benchmarks. They do <strong>not</strong> constitute guaranteed financial or investment advice.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Current Monthly Saving"
          value={formatINR(data.currentMonthlySaving)}
          subtitle="Net monthly cash surplus"
          icon={PiggyBank}
          accentColor="emerald"
        />
        <StatCard
          title="Monthly Saving Required"
          value={formatINR(data.targetSavings)}
          subtitle="To reach all goals on time"
          icon={TrendingUp}
          accentColor="blue"
        />
        <StatCard
          title="Monthly Savings Gap"
          value={formatINR(data.savingsGap)}
          subtitle={data.savingsGap === 0 ? 'Surplus target met!' : 'Surplus needed'}
          icon={Info}
          accentColor={data.savingsGap > 0 ? 'red' : 'emerald'}
        />
        <StatCard
          title="Target Duration"
          value="5 - 10 Yrs"
          subtitle="Average goal horizon"
          icon={Sparkles}
          accentColor="purple"
        />
      </div>

      {/* Sample Investment Categories & Admin Loaded Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title">Example Planning Options</h3>
            <p className="section-subtitle">Information curated by platform administrators</p>
          </div>
          <span className="badge badge-blue">Admin Managed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.recommendations.map((rec) => (
            <div key={rec._id} className="card p-6 flex flex-col justify-between space-y-4 hover-lift">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="badge badge-blue">{rec.category}</span>
                  <span className={`badge ${rec.riskLevel === 'High' ? 'badge-red' : rec.riskLevel === 'Moderate' ? 'badge-orange' : 'badge-emerald'}`}>
                    Risk: {rec.riskLevel}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#10233F]" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                  {rec.title}
                </h4>
                <p className="text-xs text-[#6B7A90] leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expected Return</span>
                  <span className="font-bold text-[#2478E8] text-sm">{rec.expectedReturn}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Min SIP / Deposit</span>
                  <span className="font-bold text-[#10233F]">{formatINR(rec.minimumAmount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavingsPlans;
