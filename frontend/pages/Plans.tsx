
import React, { useEffect, useState } from 'react';
import { User, ProjectPlan, Wallet } from '../types';
import { store } from '../services/store';
import { Button, Badge, Modal } from '../components/ui';
import { Zap, Globe, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlansProps {
  user: User;
}

const formatINR = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export const Plans: React.FC<PlansProps> = ({ user }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Modal State
  const [selectedPlan, setSelectedPlan] = useState<ProjectPlan | null>(null);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    const p = await store.getPlans();
    const w = await store.getWallet(user.id);
    setPlans(p.filter(plan => plan.isActive));
    setWallet(w);
  };

  const handleInvestClick = (plan: ProjectPlan) => {
      // 1. Check Balance immediately
      if (wallet && wallet.balanceINR < plan.amount) {
          if (confirm(`Insufficient INR Balance (₹${wallet.balanceINR}). Required: ${formatINR(plan.amount)}.\n\nProceed to Add Funds?`)) {
              navigate('/wallet');
          }
          return;
      }
      setSelectedPlan(plan);
  };

  const confirmPayment = async () => {
    if (!selectedPlan) return;
    setProcessingId(selectedPlan.id);
    try {
        // Process Payment
        await store.buyPlan(user.id, selectedPlan.id);
        
        // Success
        alert("Payment successful! Investment contract created.");
        
        // Reload Data immediately
        await loadData();
        setSelectedPlan(null);
        navigate('/dashboard');
        
    } catch (error: any) {
        alert("Transaction Failed: " + error.message);
    } finally {
        setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end px-1">
           <div>
               <h1 className="text-2xl font-bold text-slate-900">Explore Funds</h1>
               <p className="text-slate-500 text-sm">Curated corporate growth opportunities</p>
           </div>
           {wallet && (
               <div className="text-right">
                   <p className="text-xs text-slate-500 uppercase">Available Capital</p>
                   <p className="font-bold text-emerald-600">{formatINR(wallet.balanceINR)}</p>
               </div>
           )}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {plans.map((plan) => (
               <div key={plan.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-md">
                   {/* Top Tags */}
                   <div className="flex gap-2 mb-4">
                       <Badge variant={plan.risk === 'Low' ? 'success' : plan.risk === 'Medium' ? 'warning' : 'danger'}>{plan.risk}</Badge>
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                           {plan.region === 'Global' ? <Globe className="w-3 h-3 mr-1"/> : <Zap className="w-3 h-3 mr-1"/>}
                           {plan.region}
                       </span>
                   </div>

                   <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{plan.ticker}</h3>
                            <p className="text-sm text-slate-500">{plan.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase font-bold">Target CAGR</p>
                            <p className="text-emerald-600 font-bold">{plan.targetGrowth}</p>
                        </div>
                   </div>

                   <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{plan.description}</p>

                   <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Min Investment</p>
                            <p className="font-bold text-slate-800">{formatINR(plan.amount)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Lock-in</p>
                            <p className="font-bold text-slate-800">{plan.durationWeeks} Weeks</p>
                        </div>
                   </div>

                   <Button 
                        onClick={() => handleInvestClick(plan)} 
                        isLoading={processingId === plan.id}
                        variant={wallet && wallet.balanceINR >= plan.amount ? 'primary' : 'outline'}
                        className="w-full mt-auto"
                   >
                       {wallet && wallet.balanceINR >= plan.amount ? 'Invest Now' : 'Add Funds'}
                   </Button>
               </div>
           ))}
       </div>

       {/* Payment Confirmation Modal */}
       <Modal isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} title="Confirm Investment">
           {selectedPlan && (
               <div className="space-y-4">
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                           {selectedPlan.ticker.substring(0, 2)}
                       </div>
                       <div>
                           <h3 className="font-bold text-slate-900">{selectedPlan.name}</h3>
                           <p className="text-xs text-slate-500">{selectedPlan.ticker}</p>
                       </div>
                   </div>

                   <div className="space-y-3 py-2">
                       <div className="flex justify-between text-sm">
                           <span className="text-slate-500">Investment Amount</span>
                           <span className="font-bold text-slate-900">{formatINR(selectedPlan.amount)}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                           <span className="text-slate-500">Lock-in Period</span>
                           <span className="font-bold text-slate-900">{selectedPlan.durationWeeks} Weeks</span>
                       </div>
                       <div className="flex justify-between text-sm">
                           <span className="text-slate-500">Platform Fee</span>
                           <span className="font-bold text-slate-900">{selectedPlan.feePercentage}% Included</span>
                       </div>
                       <div className="h-px bg-slate-100 my-2"></div>
                       <div className="flex justify-between text-base">
                           <span className="font-bold text-slate-800">Total Deduction</span>
                           <span className="font-bold text-emerald-600">{formatINR(selectedPlan.amount)}</span>
                       </div>
                   </div>

                   <div className="bg-amber-50 p-3 rounded-lg flex gap-3 items-start">
                       <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                       <p className="text-xs text-amber-800 leading-relaxed">
                           By confirming, you agree to the lock-in period. Early withdrawal is not permitted for corporate growth funds.
                       </p>
                   </div>

                   <div className="pt-2">
                       <Button onClick={confirmPayment} isLoading={!!processingId} className="w-full h-12 text-lg">
                           Pay {formatINR(selectedPlan.amount)}
                       </Button>
                   </div>
               </div>
           )}
       </Modal>
    </div>
  );
};
