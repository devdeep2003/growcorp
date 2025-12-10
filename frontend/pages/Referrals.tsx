
import React, { useEffect, useState } from 'react';
import { User, Wallet } from '../types';
import { store } from '../services/store';
import { Card, Button } from '../components/ui';
import { Copy, Users, Crown, ChevronRight, TrendingUp, Award } from 'lucide-react';

interface ReferralsProps {
  user: User;
}

const formatINR = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export const Referrals: React.FC<ReferralsProps> = ({ user }) => {
  const [referrals, setReferrals] = useState<User[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    const load = async () => {
        const refs = await store.getReferrals(user.referralCode);
        const w = await store.getWallet(user.id);
        setReferrals(refs);
        setWallet(w);
    };
    load();
  }, [user]);

  const copyToClipboard = () => {
      navigator.clipboard.writeText(user.referralCode);
      alert('Code copied!');
  };

  // Tier Logic Calculation
  const getTierInfo = (count: number) => {
      if (count >= 10) return { name: 'Director', share: '50%', color: 'from-amber-400 to-amber-600', next: null, required: 0 };
      if (count >= 5) return { name: 'Executive', share: '40%', color: 'from-slate-400 to-slate-600', next: 'Director', required: 10 - count };
      return { name: 'Associate', share: '30%', color: 'from-emerald-600 to-teal-700', next: 'Executive', required: 5 - count };
  };

  const tier = getTierInfo(referrals.length);

  return (
    <div className="space-y-6">
       {/* Earnings Card */}
       <div className={`bg-gradient-to-r ${tier.color} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-500`}>
           <div className="absolute top-0 right-0 p-4 opacity-10">
               <Crown className="w-32 h-32" />
           </div>
           <div className="relative z-10">
               <div className="flex justify-between items-start">
                   <div>
                       <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Total Partner Earnings</p>
                       <h1 className="text-4xl font-bold">{formatINR(wallet?.totalPartnershipBonus || 0)}</h1>
                   </div>
                   <div className="text-right">
                       <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-sm border border-white/30">
                           {tier.name}
                       </span>
                   </div>
               </div>
               
               <div className="mt-6 p-3 bg-black/20 rounded-xl backdrop-blur-md border border-white/10">
                   <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-medium text-white/90">Revenue Share</span>
                       <span className="text-lg font-bold text-white">{tier.share}</span>
                   </div>
                   {tier.next && (
                       <div className="text-xs text-white/70">
                           Refer <span className="text-white font-bold">{tier.required} more</span> to unlock <span className="font-bold text-white">{tier.next}</span> status.
                       </div>
                   )}
                   {/* Simple Progress Bar */}
                   {tier.next && (
                       <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                           <div 
                                className="bg-white h-full rounded-full" 
                                style={{ width: `${(referrals.length % 5) * 20}%` }} // Simplified visual progress
                           ></div>
                       </div>
                   )}
               </div>
           </div>
       </div>

       {/* Invite Code */}
       <div className="bg-white p-6 rounded-xl border border-slate-100 text-center shadow-sm">
            <h3 className="text-slate-800 font-bold mb-4">Grow Your Network</h3>
            <p className="text-xs text-slate-500 mb-4 px-4">
                Share your corporate access code. The more partners you add, the higher your revenue share becomes.
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-4 mb-4 font-mono text-2xl font-bold tracking-widest text-slate-700 select-all">
                {user.referralCode}
            </div>
            <Button onClick={copyToClipboard} variant="outline" icon={Copy} className="w-full">Copy Access Code</Button>
       </div>

       {/* Network List */}
       <div>
           <div className="flex justify-between items-center mb-4 px-1">
               <h3 className="font-bold text-slate-800">Your Network</h3>
               <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">{referrals.length} Partners</span>
           </div>
           
           <div className="space-y-2">
               {referrals.length === 0 ? (
                   <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                       <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                       <p className="text-slate-500 text-sm font-medium">No partners yet.</p>
                       <p className="text-slate-400 text-xs mt-1">Start sharing to maximize your portfolio.</p>
                   </div>
               ) : (
                   referrals.map(ref => (
                       <div key={ref.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm border border-slate-200">
                                   {ref.name.charAt(0)}
                               </div>
                               <div>
                                   <p className="font-bold text-slate-900 text-sm">{ref.name}</p>
                                   <p className="text-xs text-slate-400">Joined {new Date(ref.joinedAt).toLocaleDateString()}</p>
                               </div>
                           </div>
                           <div className="text-right">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ref.kycStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                   {ref.kycStatus}
                               </span>
                           </div>
                       </div>
                   ))
               )}
           </div>
       </div>
    </div>
  );
};
