
import React, { useEffect, useState } from 'react';
import { User, Wallet as WalletType, Transaction, PaymentMethod } from '../types';
import { store } from '../services/store';
import { Card, Button, Input, Badge, Select } from '../components/ui';
import { ArrowDownLeft, ArrowUpRight, Smartphone, Globe, CreditCard } from 'lucide-react';

interface WalletProps {
  user: User;
}

const formatINR = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export const Wallet: React.FC<WalletProps> = ({ user }) => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [proofUrl, setProofUrl] = useState(''); 
  const [txDetails, setTxDetails] = useState(''); // UTR or Address

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const w = await store.getWallet(user.id);
    const txs = await store.getTransactions(user.id);
    setWallet(w);
    setTransactions(txs);
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // UI Validation for Withdrawal Limit
    if (activeTab === 'withdraw' && Number(amount) < 500) {
        alert("Minimum withdrawal amount is ₹500.");
        setLoading(false);
        return;
    }

    try {
        await store.createTransaction({
            userId: user.id,
            type: activeTab,
            amount: Number(amount),
            method: method,
            proofUrl: activeTab === 'deposit' ? proofUrl : undefined,
            txHash: activeTab === 'deposit' ? txDetails : undefined,
            walletAddress: activeTab === 'withdraw' ? txDetails : undefined
        });
        setAmount('');
        setProofUrl('');
        setTxDetails('');
        alert(activeTab === 'deposit' ? "Deposit request submitted!" : "Withdrawal requested!");
        loadData();
    } catch (error: any) {
        alert(error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card className="bg-slate-900 text-white border-none text-center py-8">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
            <h1 className="text-4xl font-bold tracking-tight">{formatINR(wallet?.balanceINR || 0)}</h1>
      </Card>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setActiveTab('deposit')} 
                className={`flex-1 py-4 text-sm font-bold text-center ${activeTab === 'deposit' ? 'text-emerald-600 bg-emerald-50/50 border-b-2 border-emerald-600' : 'text-slate-500'}`}
              >
                  Add Funds
              </button>
              <button 
                onClick={() => setActiveTab('withdraw')} 
                className={`flex-1 py-4 text-sm font-bold text-center ${activeTab === 'withdraw' ? 'text-red-600 bg-red-50/50 border-b-2 border-red-600' : 'text-slate-500'}`}
              >
                  Withdraw
              </button>
          </div>
          
          <div className="p-6">
             <form onSubmit={handleTransaction} className="space-y-5">
                 <Input 
                    label="Amount (₹)" 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder="Enter amount"
                    required 
                    min={activeTab === 'withdraw' ? "500" : "100"}
                 />
                 {activeTab === 'withdraw' && (
                     <div className="bg-red-50 border border-red-100 text-red-600 p-2 rounded text-xs mt-[-10px] mb-2 flex items-center">
                         <span className="font-bold mr-1">Note:</span> Minimum withdrawal amount is ₹500.
                     </div>
                 )}
                 
                 <div>
                     <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Payment Method</label>
                     <div className="grid grid-cols-3 gap-2">
                         {['UPI', 'USDT', 'CBDC'].map((m) => (
                             <button
                                key={m}
                                type="button"
                                onClick={() => setMethod(m as PaymentMethod)}
                                className={`py-3 rounded-lg border text-xs font-bold transition-all ${method === m ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}
                             >
                                 {m}
                             </button>
                         ))}
                     </div>
                 </div>

                 {activeTab === 'deposit' && (
                     <div className="p-4 bg-slate-50 rounded-lg text-xs space-y-2 text-slate-600 border border-slate-200">
                         <p className="font-bold text-slate-800">Transfer Instructions:</p>
                         {method === 'UPI' && <p>Send to UPI ID: <span className="font-mono bg-white px-1 border rounded">corp@bank</span></p>}
                         {method === 'USDT' && <p>Send USDT (TRC20) to: <span className="font-mono bg-white px-1 border rounded break-all">T9x...CorpWallet</span> (1 USDT = ₹90)</p>}
                         {method === 'CBDC' && <p>Scan QR code in your e-Rupee app.</p>}
                     </div>
                 )}

                 <Input 
                    label={activeTab === 'deposit' ? (method === 'UPI' ? "UTR Number" : "Transaction Hash") : (method === 'UPI' ? "Your UPI ID" : "Wallet Address")}
                    placeholder={activeTab === 'deposit' ? "Enter transaction reference" : "Enter receiving address/ID"}
                    value={txDetails}
                    onChange={e => setTxDetails(e.target.value)}
                    required
                 />

                 {activeTab === 'deposit' && (
                     <Input 
                        label="Proof Screenshot URL"
                        placeholder="https://..."
                        value={proofUrl}
                        onChange={e => setProofUrl(e.target.value)}
                     />
                 )}

                 <Button type="submit" className="w-full h-12 text-lg" disabled={activeTab === 'withdraw' && Number(amount) < 500}>
                     {activeTab === 'deposit' ? 'Proceed to Add' : 'Request Withdrawal'}
                 </Button>
             </form>
          </div>
      </div>

      <div className="space-y-3">
         <h3 className="font-bold text-slate-800 px-1">Recent Transactions</h3>
         {transactions.slice(0, 5).map(tx => (
             <div key={tx.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                         {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                     </div>
                     <div>
                         <p className="text-sm font-bold text-slate-800">{tx.type === 'deposit' ? 'Added Funds' : 'Withdrawal'}</p>
                         <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                     </div>
                 </div>
                 <div className="text-right">
                     <p className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                         {tx.type === 'deposit' ? '+' : '-'}{formatINR(tx.amount)}
                     </p>
                     <Badge variant={tx.status === 'approved' ? 'success' : tx.status === 'rejected' ? 'danger' : 'warning'}>{tx.status}</Badge>
                 </div>
             </div>
         ))}
      </div>
    </div>
  );
};
