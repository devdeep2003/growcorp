
import React, { useEffect, useState } from 'react';
import { User, Wallet, InvestmentContract } from '../types';
import { store } from '../services/store';
import { getMarketInsights } from '../services/gemini';
import { Card, Button, Trend } from '../components/ui';
import { TrendingUp, Sparkles, Briefcase, Plus, ChevronRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardProps {
  user: User;
}

const formatINR = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [trades, setTrades] = useState<InvestmentContract[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    loadData();
    fetchInsight();
  }, [user.id]);

  const loadData = async () => {
    const w = await store.getWallet(user.id);
    const t = await store.getUserTrades(user.id);
    setWallet(w);
    setTrades(t);
  };

  const fetchInsight = async () => {
    setLoadingInsight(true);
    const text = await getMarketInsights();
    setInsight(text);
    setLoadingInsight(false);
  };

  const activeTrades = trades.filter(t => t.status === 'active');
  const investedVal = activeTrades.reduce((acc, t) => acc + t.investedAmount + t.currentProfit, 0);
  const totalAssetValue = (wallet?.balanceINR || 0) + investedVal;

  const chartData = React.useMemo(() => {
    if (activeTrades.length === 0) return [{ name: 'Start', value: 0 }, { name: 'Now', value: 0 }];
    let currentTotal = 0;
    const data = activeTrades.map((t, index) => {
        currentTotal += t.currentProfit;
        return { name: `Pos ${index + 1}`, value: currentTotal };
    });
    return [{ name: 'Start', value: 0 }, ...data];
  }, [activeTrades]);

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="bg-white md:rounded-2xl md:shadow-sm md:border md:border-slate-100 p-6 -mx-4 md:mx-0">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Portfolio Value</p>
          <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{formatINR(totalAssetValue)}</h1>
              <span className="text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                  +{formatINR(wallet?.totalProfit || 0)} All Time
              </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Invested</p>
                  <p className="text-lg font-bold text-slate-800">{formatINR(investedVal)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Available Cash</p>
                  <p className="text-lg font-bold text-slate-800">{formatINR(wallet?.balanceINR || 0)}</p>
              </div>
          </div>

          <div className="mt-6 flex gap-3">
              <Button className="flex-1" icon={Plus} onClick={() => navigate('/wallet')}>Add Funds</Button>
              <Button className="flex-1" variant="outline" icon={TrendingUp} onClick={() => navigate('/plans')}>Invest</Button>
          </div>
      </div>

      {/* Main Chart */}
      <Card>
          <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800">Performance</h3>
               <div className="flex gap-2 text-xs font-medium">
                   <span className="text-slate-400">1D</span>
                   <span className="text-emerald-600 bg-emerald-50 px-2 rounded">1W</span>
                   <span className="text-slate-400">1M</span>
               </div>
          </div>
          <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} formatter={(val:number) => [`₹${val}`, 'Growth']} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#colorProfit)" />
                    </AreaChart>
                </ResponsiveContainer>
          </div>
      </Card>

      {/* Network Yield Banner */}
      <div onClick={() => navigate('/referrals')} className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white flex justify-between items-center shadow-lg cursor-pointer">
          <div>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-0.5">Partner Program</p>
              <p className="font-bold text-lg">Earned {formatINR(wallet?.totalPartnershipBonus || 0)}</p>
          </div>
          <div className="bg-white/10 p-2 rounded-lg">
              <UserPlus className="w-5 h-5 text-white"/>
          </div>
      </div>

      {/* Market Insights */}
      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-bold text-purple-900">Market Pulse</h3>
            </div>
            <p className="text-xs text-purple-800 leading-relaxed">
                {loadingInsight ? "Analyzing market trends..." : insight}
            </p>
      </div>

      {/* Holdings List */}
      <div>
          <h2 className="text-lg font-bold text-slate-800 mb-3 px-1">Your Holdings</h2>
          <div className="space-y-3">
            {activeTrades.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No active investments.</p>
                </div>
            ) : (
                activeTrades.map(trade => (
                    <div key={trade.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                                {trade.planTicker.substring(0,2)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{trade.planTicker}</h4>
                                <p className="text-xs text-slate-500">{trade.planName}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800 text-sm">{formatINR(trade.investedAmount + trade.currentProfit)}</p>
                            <Trend value={trade.currentProfit} isCurrency />
                        </div>
                    </div>
                ))
            )}
          </div>
      </div>
    </div>
  );
};
