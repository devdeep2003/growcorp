
import React, { useEffect, useState } from 'react';
import { User, Transaction, InvestmentContract, ProjectPlan, AdminLog, Wallet } from '../types';
import { store } from '../services/store';
import { Button, Badge, Input, Modal, Select } from '../components/ui';
import { Users, CreditCard, TrendingUp, Check, X, FileText, Bell, Plus, Activity, Edit2, Eye } from 'lucide-react';

interface AdminDashboardProps {
    user: User;
}

const formatINR = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user: admin }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'trades' | 'plans' | 'logs'>('requests');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [trades, setTrades] = useState<InvestmentContract[]>([]);
  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [growthInput, setGrowthInput] = useState<{ [key: string]: string }>({});
  
  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);

  // Forms & Selection
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingPlan, setEditingPlan] = useState<ProjectPlan | null>(null);
  const [planForm, setPlanForm] = useState<Partial<ProjectPlan>>({ name: '', ticker: '', amount: 1000, durationWeeks: 4, targetGrowth: '', feePercentage: 10, description: '', risk: 'Medium', region: 'India' });
  
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [bonusData, setBonusData] = useState({ userId: '', amount: '', reason: '', type: 'credit' as const });

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setLoading(true);
    const txs = await store.getTransactions();
    const usrs = await store.getUsers();
    const wals = await store.getAllWallets();
    const trds = await store.getUserTrades();
    const plns = await store.getPlans();
    const lgs = await store.getAdminLogs();
    setTransactions(txs);
    setUsers(usrs);
    setWallets(wals);
    setTrades(trds);
    setPlans(plns);
    setLogs(lgs);
    setLoading(false);
  };

  const handleTxAction = async (txId: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
        await store.updateTransactionStatus(admin.id, txId, status);
        loadAllData();
    } catch (e: any) { alert(e.message); }
  };

  const handleGrowthUpdate = async (tradeId: string) => {
    const val = growthInput[tradeId];
    if(!val) return;
    try {
        await store.updateGrowth(admin.id, tradeId, parseFloat(val));
        alert("Yield updated successfully!");
        setGrowthInput(prev => { const n = {...prev}; delete n[tradeId]; return n; });
        loadAllData();
    } catch (e: any) { alert(e.message); }
  };

  const openPlanModal = (plan?: ProjectPlan) => {
      if (plan) {
          setEditingPlan(plan);
          setPlanForm({ ...plan });
      } else {
          setEditingPlan(null);
          setPlanForm({ name: '', ticker: '', amount: 1000, durationWeeks: 4, targetGrowth: '1.5% weekly', feePercentage: 5, description: '', risk: 'Medium', region: 'India' });
      }
      setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingPlan) {
              await store.updatePlan(admin.id, { ...editingPlan, ...planForm } as ProjectPlan);
          } else {
              await store.createPlan(admin.id, planForm);
          }
          setIsPlanModalOpen(false);
          loadAllData();
      } catch (e: any) { alert(e.message); }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await store.broadcastAnnouncement(admin.id, announcement.title, announcement.message);
          setIsBroadcastModalOpen(false);
          setAnnouncement({title: '', message: ''});
          loadAllData();
          alert("Broadcast sent.");
      } catch (e: any) { alert(e.message); }
  };

  const handleUserAction = async (userId: string, action: 'block' | 'unblock' | 'verify' | 'reject') => {
      if(!confirm(`Confirm ${action} for user?`)) return;
      try {
          if (action === 'block' || action === 'unblock') {
              await store.updateUserStatus(admin.id, userId, action === 'block');
          } else {
              await store.updateKYCStatus(admin.id, userId, action === 'verify' ? 'verified' : 'rejected');
          }
          loadAllData();
      } catch (e: any) { alert(e.message); }
  };

  const handleBonus = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await store.adjustWallet(admin.id, bonusData.userId, parseFloat(bonusData.amount), bonusData.type as 'credit'|'debit', bonusData.reason);
          setIsBonusModalOpen(false);
          setBonusData({userId: '', amount: '', reason: '', type: 'credit'});
          loadAllData();
          alert("Wallet adjusted successfully.");
      } catch(e: any) { alert(e.message); }
  };

  const viewUser = (u: User) => {
      setSelectedUser(u);
      setIsUserDetailOpen(true);
  };

  const getWalletBal = (uid: string) => formatINR(wallets.find(w => w.userId === uid)?.balanceINR || 0);

  // Filtered lists for modal
  const selectedUserTxs = selectedUser ? transactions.filter(t => t.userId === selectedUser.id) : [];
  const selectedUserTrades = selectedUser ? trades.filter(t => t.userId === selectedUser.id) : [];

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">Admin Console</h1>
            <Button onClick={() => setIsBroadcastModalOpen(true)} icon={Bell} size="sm">Broadcast</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Users</p>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Pending Tx</p>
                <p className="text-2xl font-bold text-amber-600">{transactions.filter(t => t.status === 'pending').length}</p>
            </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Active Trades</p>
                <p className="text-2xl font-bold text-emerald-600">{trades.filter(t => t.status === 'active').length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">System Logs</p>
                <p className="text-2xl font-bold text-slate-700">{logs.length}</p>
            </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
            {[
                {id: 'requests', label: 'Requests', icon: CreditCard},
                {id: 'users', label: 'Users', icon: Users},
                {id: 'trades', label: 'Contracts', icon: Activity},
                {id: 'plans', label: 'Funds', icon: TrendingUp},
                {id: 'logs', label: 'Audit Logs', icon: FileText},
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-white border-x border-t border-slate-200 text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 p-4 overflow-x-auto min-h-[400px]">
            {loading ? <div className="text-center py-10">Loading...</div> : (
                <>
                {activeTab === 'requests' && (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Details</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.filter(t => t.status === 'pending').length === 0 && (
                                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No pending requests</td></tr>
                            )}
                            {transactions.filter(t => t.status === 'pending').map(tx => (
                                <tr key={tx.id}>
                                    <td className="px-4 py-3 font-medium">{users.find(u => u.id === tx.userId)?.name || tx.userId}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={tx.type === 'deposit' ? 'success' : 'warning'}>{tx.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3 font-bold">{formatINR(tx.amount)}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">
                                        {tx.method}<br/>{tx.txHash || tx.walletAddress}
                                        {tx.proofUrl && (
                                            <a href={tx.proofUrl} target="_blank" rel="noreferrer" className="text-blue-500 flex items-center gap-1 mt-1 underline">
                                                <FileText className="w-3 h-3"/> View Proof
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-4 py-3"><Badge variant="warning">Pending</Badge></td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => handleTxAction(tx.id, 'approved')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Check className="w-5 h-5"/></button>
                                        <button onClick={() => handleTxAction(tx.id, 'rejected')} className="text-red-600 hover:bg-red-50 p-1 rounded"><X className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'users' && (
                    <table className="w-full text-sm text-left">
                         <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Name/Phone</th>
                                <th className="px-4 py-3">Balance</th>
                                <th className="px-4 py-3">KYC</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="px-4 py-3">
                                        <div className="font-bold">{u.name}</div>
                                        <div className="text-xs text-slate-400">{u.phone || u.email}</div>
                                    </td>
                                    <td className="px-4 py-3 font-mono">{getWalletBal(u.id)}</td>
                                    <td className="px-4 py-3">
                                        {u.kycStatus === 'pending' ? (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="warning">Pending</Badge>
                                                <a href={u.kycData} target="_blank" className="text-xs text-blue-500 underline">View</a>
                                                <button onClick={() => handleUserAction(u.id, 'verify')} className="text-emerald-600 hover:bg-emerald-50 rounded p-1"><Check className="w-4 h-4"/></button>
                                                <button onClick={() => handleUserAction(u.id, 'reject')} className="text-red-600 hover:bg-red-50 rounded p-1"><X className="w-4 h-4"/></button>
                                            </div>
                                        ) : (
                                            <Badge variant={u.kycStatus === 'verified' ? 'success' : u.kycStatus === 'rejected' ? 'danger' : 'neutral'}>{u.kycStatus}</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={u.isBlocked ? 'danger' : 'success'}>{u.isBlocked ? 'Blocked' : 'Active'}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2 flex justify-end">
                                        <Button size="sm" variant="outline" onClick={() => viewUser(u)} title="View History"><Eye className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="outline" onClick={() => { setBonusData({...bonusData, userId: u.id}); setIsBonusModalOpen(true); }} title="Adjust Balance"><CreditCard className="w-4 h-4"/></Button>
                                        {u.isBlocked ? (
                                            <Button size="sm" variant="primary" onClick={() => handleUserAction(u.id, 'unblock')}>Unblock</Button>
                                        ) : (
                                            <Button size="sm" variant="danger" onClick={() => handleUserAction(u.id, 'block')}>Block</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'trades' && (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Fund</th>
                                <th className="px-4 py-3">Invested</th>
                                <th className="px-4 py-3">Current Profit</th>
                                <th className="px-4 py-3">Weekly Growth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                             {trades.filter(t => t.status === 'active').map(t => (
                                 <tr key={t.id}>
                                     <td className="px-4 py-3 font-medium">{users.find(u => u.id === t.userId)?.name}</td>
                                     <td className="px-4 py-3 text-xs">{t.planTicker}</td>
                                     <td className="px-4 py-3">{formatINR(t.investedAmount)}</td>
                                     <td className="px-4 py-3 font-bold text-emerald-600">+{formatINR(t.currentProfit)}</td>
                                     <td className="px-4 py-3">
                                         <div className="flex gap-2">
                                             <input 
                                                type="number" 
                                                className="w-20 border rounded px-2 py-1 text-xs" 
                                                placeholder="%"
                                                value={growthInput[t.id] || ''}
                                                onChange={e => setGrowthInput({...growthInput, [t.id]: e.target.value})}
                                             />
                                             <Button size="sm" onClick={() => handleGrowthUpdate(t.id)}>Apply</Button>
                                         </div>
                                     </td>
                                 </tr>
                             ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'plans' && (
                    <div>
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold text-slate-700">Managed Funds</h3>
                            <Button onClick={() => openPlanModal()} icon={Plus} size="sm">Create Fund</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plans.map(p => (
                                <div key={p.id} className="border p-4 rounded-lg flex justify-between items-center bg-slate-50">
                                    <div>
                                        <p className="font-bold text-slate-900">{p.ticker}</p>
                                        <p className="text-xs text-slate-500">{p.name}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="neutral">{p.risk}</Badge>
                                            <Badge variant="neutral">{p.region}</Badge>
                                            <span className="text-xs text-slate-500 bg-slate-200 px-2 rounded">Fee: {p.feePercentage}%</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <p className="font-bold text-sm">{formatINR(p.amount)} Min</p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openPlanModal(p)} className="px-2 py-1 h-auto text-xs"><Edit2 className="w-3 h-3"/></Button>
                                            <button 
                                                onClick={() => store.togglePlan(admin.id, p.id).then(loadAllData)} 
                                                className={`text-xs font-bold px-2 py-1 rounded ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                                            >
                                                {p.isActive ? 'Active' : 'Hidden'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="space-y-2">
                        {logs.map(l => (
                            <div key={l.id} className="text-xs border-b border-slate-50 py-2 flex justify-between">
                                <span className="text-slate-500 font-mono">{new Date(l.date).toLocaleString()}</span>
                                <span className="font-bold text-slate-700">{l.action}</span>
                                <span className="text-slate-600 truncate max-w-[200px]">{l.details}</span>
                            </div>
                        ))}
                    </div>
                )}
                </>
            )}
        </div>

        {/* Plan Modal (Create/Edit) */}
        <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} title={editingPlan ? "Edit Fund" : "Create New Fund"}>
             <form onSubmit={handleSavePlan} className="space-y-3">
                 <Input label="Fund Name" value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} required />
                 <Input label="Ticker Symbol" value={planForm.ticker} onChange={e => setPlanForm({...planForm, ticker: e.target.value})} required />
                 <div className="grid grid-cols-2 gap-3">
                     <Input label="Min Amount" type="number" value={planForm.amount} onChange={e => setPlanForm({...planForm, amount: parseInt(e.target.value)})} required />
                     <Input label="Duration (Weeks)" type="number" value={planForm.durationWeeks} onChange={e => setPlanForm({...planForm, durationWeeks: parseInt(e.target.value)})} required />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                     <Select label="Risk Level" options={[{value:'Low', label:'Low'},{value:'Medium', label:'Medium'},{value:'High', label:'High'}]} value={planForm.risk} onChange={e => setPlanForm({...planForm, risk: e.target.value as any})} />
                     <Select label="Region" options={[{value:'India', label:'India'},{value:'Global', label:'Global'}]} value={planForm.region} onChange={e => setPlanForm({...planForm, region: e.target.value as any})} />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <Input label="Platform Fee %" type="number" value={planForm.feePercentage} onChange={e => setPlanForm({...planForm, feePercentage: parseFloat(e.target.value)})} required />
                    <Input label="Target Growth Label" value={planForm.targetGrowth} onChange={e => setPlanForm({...planForm, targetGrowth: e.target.value})} required />
                 </div>
                 <Input label="Description" value={planForm.description} onChange={e => setPlanForm({...planForm, description: e.target.value})} />
                 <Button type="submit" className="w-full">{editingPlan ? "Update Fund" : "Launch Fund"}</Button>
             </form>
        </Modal>

        {/* Broadcast Modal */}
        <Modal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} title="System Broadcast">
            <form onSubmit={handleBroadcast} className="space-y-3">
                <Input label="Title" value={announcement.title} onChange={e => setAnnouncement({...announcement, title: e.target.value})} required />
                <div className="w-full">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Message</label>
                    <textarea 
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        rows={4}
                        value={announcement.message}
                        onChange={e => setAnnouncement({...announcement, message: e.target.value})}
                        required
                    />
                </div>
                <Button type="submit" className="w-full">Send Notification</Button>
            </form>
        </Modal>

        {/* Bonus Modal */}
        <Modal isOpen={isBonusModalOpen} onClose={() => setIsBonusModalOpen(false)} title="Adjust User Wallet">
             <form onSubmit={handleBonus} className="space-y-3">
                 <div className="p-3 bg-slate-50 rounded text-sm mb-2">
                     Adjusting wallet for: <strong>{users.find(u => u.id === bonusData.userId)?.name}</strong>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                     <Select label="Type" options={[{value:'credit', label:'Credit (Bonus)'}, {value:'debit', label:'Debit (Penalty)'}]} value={bonusData.type} onChange={e => setBonusData({...bonusData, type: e.target.value as any})} />
                     <Input label="Amount" type="number" value={bonusData.amount} onChange={e => setBonusData({...bonusData, amount: e.target.value})} required />
                 </div>
                 <Input label="Reason" value={bonusData.reason} onChange={e => setBonusData({...bonusData, reason: e.target.value})} required placeholder="e.g. Goodwill bonus" />
                 <Button type="submit" className="w-full">Confirm Adjustment</Button>
             </form>
        </Modal>

        {/* User Detail Modal */}
        <Modal isOpen={isUserDetailOpen} onClose={() => setIsUserDetailOpen(false)} title="User Details">
            {selectedUser && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-lg text-slate-600">
                            {selectedUser.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                            <p className="text-sm text-slate-500">{selectedUser.email}</p>
                            <p className="text-xs text-slate-400 font-mono">{selectedUser.id} | {selectedUser.phone || 'No Phone'}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm text-slate-800 mb-2">Transaction History</h4>
                        <div className="max-h-40 overflow-y-auto border rounded-lg">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="px-2 py-1">Date</th>
                                        <th className="px-2 py-1">Type</th>
                                        <th className="px-2 py-1">Amt</th>
                                        <th className="px-2 py-1">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {selectedUserTxs.length === 0 ? <tr><td colSpan={4} className="p-2 text-center text-slate-400">No transactions</td></tr> :
                                    selectedUserTxs.map(t => (
                                        <tr key={t.id}>
                                            <td className="px-2 py-1">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="px-2 py-1 capitalize">{t.type}</td>
                                            <td className="px-2 py-1 font-bold">{formatINR(t.amount)}</td>
                                            <td className="px-2 py-1"><Badge variant={t.status === 'approved' ? 'success' : 'warning'}>{t.status}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-sm text-slate-800 mb-2">Trade History</h4>
                        <div className="max-h-40 overflow-y-auto border rounded-lg">
                             <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="px-2 py-1">Fund</th>
                                        <th className="px-2 py-1">Invested</th>
                                        <th className="px-2 py-1">Profit</th>
                                        <th className="px-2 py-1">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {selectedUserTrades.length === 0 ? <tr><td colSpan={4} className="p-2 text-center text-slate-400">No trades</td></tr> :
                                    selectedUserTrades.map(t => (
                                        <tr key={t.id}>
                                            <td className="px-2 py-1">{t.planTicker}</td>
                                            <td className="px-2 py-1">{formatINR(t.investedAmount)}</td>
                                            <td className="px-2 py-1 text-emerald-600">+{formatINR(t.currentProfit)}</td>
                                            <td className="px-2 py-1"><Badge variant="neutral">{t.status}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    </div>
  );
};
