
import { User, Wallet, Transaction, ProjectPlan, InvestmentContract, GrowthLog, Notification, AdminLog, RiskLevel, Region } from '../types';

// Initial Mock Data
const MOCK_USERS: User[] = [
  { id: 'u1', email: 'partner@growcorp.in', name: 'Arjun Mehta', role: 'user', referralCode: 'ARJ123', joinedAt: '2023-10-01T10:00:00Z', isBlocked: false, kycStatus: 'verified', phone: '9876543210' },
  { id: 'u2', email: 'admin@growcorp.in', name: 'System Admin', role: 'admin', referralCode: 'ADMIN00', joinedAt: '2023-09-01T10:00:00Z', isBlocked: false, kycStatus: 'verified' },
  { id: 'u3', email: 'sarah.j@example.com', name: 'Priya Sharma', role: 'user', referralCode: 'PRI999', referredBy: 'ARJ123', joinedAt: '2023-11-15T14:30:00Z', isBlocked: false, kycStatus: 'verified', phone: '9876543211' },
  { id: 'u4', email: 'rahul.v@example.com', name: 'Rahul Verma', role: 'user', referralCode: 'RAH888', referredBy: 'ARJ123', joinedAt: '2023-12-05T09:15:00Z', isBlocked: false, kycStatus: 'pending', phone: '9876543212' },
];

const MOCK_WALLETS: Wallet[] = [
  // Demo user has healthy INR balance
  { userId: 'u1', balanceINR: 125000, totalProfit: 12500, totalPartnershipBonus: 2450 },
  { userId: 'u2', balanceINR: 10000000, totalProfit: 0, totalPartnershipBonus: 0 },
  { userId: 'u3', balanceINR: 15000, totalProfit: 1200, totalPartnershipBonus: 0 },
  { userId: 'u4', balanceINR: 5000, totalProfit: 0, totalPartnershipBonus: 0 },
];

// REAL WORLD INDIAN FUNDS
const MOCK_PLANS: ProjectPlan[] = [
  { 
    id: 'p1', 
    name: 'Tata Power Renewable', 
    ticker: 'TATA.PWR',
    amount: 10000, 
    durationWeeks: 4, 
    description: 'Invest in India\'s largest integrated power company with a focus on solar and wind energy expansion.', 
    isActive: true, 
    targetGrowth: '1.8% weekly', 
    feePercentage: 5,
    risk: 'Low',
    region: 'India'
  },
  { 
    id: 'p2', 
    name: 'Reliance Digital', 
    ticker: 'RELIANCE',
    amount: 50000, 
    durationWeeks: 8, 
    description: 'Capitalize on the rapid 5G rollout and digital ecosystem dominance in the Indian market.', 
    isActive: true, 
    targetGrowth: '3.5% weekly', 
    feePercentage: 8,
    risk: 'Medium',
    region: 'India'
  },
  { 
    id: 'p3', 
    name: 'Tesla AI & Robotics', 
    ticker: 'TSLA.US',
    amount: 100000, 
    durationWeeks: 12, 
    description: 'International exposure to autonomous technology and global robotics infrastructure.', 
    isActive: true, 
    targetGrowth: '5.2% weekly', 
    feePercentage: 10,
    risk: 'High',
    region: 'Global'
  },
  { 
    id: 'p4', 
    name: 'Nifty 50 Index', 
    ticker: 'NIFTY50',
    amount: 5000, 
    durationWeeks: 4, 
    description: 'Diversified exposure to the top 50 blue-chip companies listed on the NSE.', 
    isActive: true, 
    targetGrowth: '1.2% weekly', 
    feePercentage: 3,
    risk: 'Low',
    region: 'India'
  }
];

// MOCK HISTORY for Demo User
const MOCK_TRADES: InvestmentContract[] = [
    {
        id: 'tr_demo_1',
        userId: 'u1',
        planId: 'p1',
        planName: 'Tata Power Renewable',
        planTicker: 'TATA.PWR',
        investedAmount: 10000,
        startDate: '2023-11-01T10:00:00Z',
        endDate: '2023-11-29T10:00:00Z',
        currentProfit: 850,
        status: 'completed'
    },
    {
        id: 'tr_demo_2',
        userId: 'u1',
        planId: 'p3',
        planName: 'Tesla AI & Robotics',
        planTicker: 'TSLA.US',
        investedAmount: 100000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
        currentProfit: 5200, 
        status: 'active'
    }
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
const load = (key: string) => {
  const d = localStorage.getItem(key);
  return d ? JSON.parse(d) : null;
};

// Initialize Data if empty
if (!load('users')) save('users', MOCK_USERS);
if (!load('wallets')) save('wallets', MOCK_WALLETS);
if (!load('plans')) save('plans', MOCK_PLANS);
if (!load('trades')) save('trades', MOCK_TRADES);

const checkBlocked = (userId: string) => {
    const users = load('users') as User[];
    const user = users.find(u => u.id === userId);
    if (user && user.isBlocked) {
        throw new Error("Account restricted. Please contact support.");
    }
};

export const store = {
  // --- Auth ---
  login: async (identifier: string): Promise<User | null> => {
    await delay(500);
    const users = load('users') as User[];
    const user = users.find(u => 
        u.email.toLowerCase() === identifier.toLowerCase() || 
        u.phone === identifier
    );
    if (!user) return null;
    if (user.isBlocked) throw new Error("Account is blocked by administration.");
    return user;
  },

  register: async (name: string, email: string, phone: string, referralCode?: string): Promise<User> => {
    await delay(800);
    const users = load('users') as User[];
    
    if (users.find(u => u.email === email)) throw new Error("Email already registered");
    if (users.find(u => u.phone === phone)) throw new Error("Phone number already registered");

    const newId = `u${users.length + 1}`;
    const myReferralCode = name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

    if (referralCode && referralCode === myReferralCode) throw new Error("Cannot refer yourself");

    const newUser: User = {
      id: newId,
      email,
      phone,
      name,
      role: 'user',
      referralCode: myReferralCode,
      referredBy: referralCode,
      joinedAt: new Date().toISOString(),
      isBlocked: false,
      kycStatus: 'none'
    };

    users.push(newUser);
    save('users', users);

    const wallets = load('wallets') as Wallet[];
    wallets.push({ userId: newId, balanceINR: 0, totalProfit: 0, totalPartnershipBonus: 0 });
    save('wallets', wallets);

    return newUser;
  },

  // --- Wallet ---
  getWallet: async (userId: string): Promise<Wallet> => {
    await store.processExpiredTrades(userId);
    const wallets = load('wallets') as Wallet[];
    return wallets.find(w => w.userId === userId) || { userId, balanceINR: 0, totalProfit: 0, totalPartnershipBonus: 0 };
  },

  getAllWallets: async (): Promise<Wallet[]> => {
    return load('wallets') as Wallet[];
  },

  getTransactions: async (userId?: string): Promise<Transaction[]> => {
    const txs = (load('transactions') || []) as Transaction[];
    if (userId) return txs.filter(t => t.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return txs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createTransaction: async (tx: Partial<Transaction>) => {
    await delay(500);
    checkBlocked(tx.userId!);
    const txs = (load('transactions') || []) as Transaction[];
    
    const amount = Number(tx.amount!);
    if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

    // Withdrawal Limit and Balance Check
    if (tx.type === 'withdrawal') {
        // Enforce 500 minimum limit
        if (amount < 500) {
            throw new Error("Minimum withdrawal amount is ₹500");
        }

        const wallets = load('wallets') as Wallet[];
        const wIndex = wallets.findIndex(w => w.userId === tx.userId);
        if (wIndex === -1) throw new Error("Wallet not found");
        
        const w = wallets[wIndex];
        const currentBalance = Number(w.balanceINR || 0);
        
        if (currentBalance < amount) throw new Error("Insufficient INR Balance");
        
        wallets[wIndex] = { ...w, balanceINR: currentBalance - amount }; // Lock funds strictly
        save('wallets', wallets);
    }

    const newTx: Transaction = {
      id: `tx${Date.now()}`,
      status: 'pending',
      date: new Date().toISOString(),
      userId: tx.userId!,
      type: tx.type!,
      amount: amount, // INR Amount
      method: tx.method!,
      proofUrl: tx.proofUrl,
      txHash: tx.txHash,
      walletAddress: tx.walletAddress
    };
    txs.push(newTx);
    save('transactions', txs);
  },

  updateTransactionStatus: async (adminId: string, txId: string, status: 'approved' | 'rejected') => {
    const txs = (load('transactions') || []) as Transaction[];
    const txIndex = txs.findIndex(t => t.id === txId);
    if (txIndex === -1) throw new Error("Transaction not found");
    
    const tx = txs[txIndex];
    if (tx.status !== 'pending') throw new Error("Transaction already processed");

    const wallets = load('wallets') as Wallet[];
    const wIndex = wallets.findIndex(w => w.userId === tx.userId);
    const wallet = wallets[wIndex];
    const txAmount = Number(tx.amount);

    if (status === 'approved') {
        if (tx.type === 'deposit') {
            wallet.balanceINR = Number(wallet.balanceINR || 0) + txAmount; // Credit INR
        }
    } else {
        // Rejected
        if (tx.type === 'withdrawal') {
            wallet.balanceINR = Number(wallet.balanceINR || 0) + txAmount; // Refund INR
        }
    }

    tx.status = status;
    txs[txIndex] = tx;
    wallets[wIndex] = wallet;
    
    save('transactions', txs);
    save('wallets', wallets);
    
    store.logAdminAction(adminId, `Transaction ${status}`, txId, `${tx.type} of ₹${tx.amount} via ${tx.method}`);
    store.createNotification(tx.userId, "Capital Update", `Your ${tx.type} request of ₹${tx.amount} was ${status}.`);
  },

  // --- Plans ---
  getPlans: async (): Promise<ProjectPlan[]> => {
    return load('plans') as ProjectPlan[];
  },

  createPlan: async (adminId: string, plan: Partial<ProjectPlan>) => {
      const plans = load('plans') as ProjectPlan[];
      const newPlan: ProjectPlan = {
          id: `p${Date.now()}`,
          isActive: true,
          ...plan as any
      };
      plans.push(newPlan);
      save('plans', plans);
      store.logAdminAction(adminId, "Create Project", newPlan.id, newPlan.name);
  },

  updatePlan: async (adminId: string, plan: ProjectPlan) => {
      const plans = load('plans') as ProjectPlan[];
      const index = plans.findIndex(p => p.id === plan.id);
      if (index !== -1) {
          plans[index] = plan;
          save('plans', plans);
          store.logAdminAction(adminId, "Update Project", plan.id, "Updated plan details");
      }
  },

  togglePlan: async (adminId: string, planId: string) => {
      const plans = load('plans') as ProjectPlan[];
      const p = plans.find(x => x.id === planId);
      if(p) {
          p.isActive = !p.isActive;
          save('plans', plans);
      }
  },

  getUserTrades: async (userId?: string): Promise<InvestmentContract[]> => {
    const trades = (load('trades') || []) as InvestmentContract[];
    if (userId) return trades.filter(t => t.userId === userId);
    return trades;
  },

  buyPlan: async (userId: string, planId: string) => {
    await delay(800);
    checkBlocked(userId);
    
    // Load fresh data
    const plans = load('plans') as ProjectPlan[];
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) throw new Error("Project not found");
    if (!plan.isActive) throw new Error("Project is closed");

    const wallets = load('wallets') as Wallet[];
    const wIndex = wallets.findIndex(w => w.userId === userId);
    
    if (wIndex === -1) throw new Error("Wallet not initialized");
    
    // Explicit Number casting to avoid string issues
    const wallet = wallets[wIndex];
    const planCost = Number(plan.amount);
    const currentBalance = Number(wallet.balanceINR || 0);

    if (currentBalance < planCost) {
        throw new Error(`Insufficient INR Balance. Required: ₹${planCost}, Available: ₹${currentBalance}`);
    }

    // DEDUCT BALANCE STRICTLY
    const newBalance = currentBalance - planCost;
    
    // UPDATE WALLET IN ARRAY AND SAVE IMMEDIATELY
    wallets[wIndex] = { ...wallet, balanceINR: newBalance };
    save('wallets', wallets);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (plan.durationWeeks * 7));

    const trades = (load('trades') || []) as InvestmentContract[];
    const newTrade: InvestmentContract = {
      id: `tr${Date.now()}`,
      userId,
      planId,
      planName: plan.name,
      planTicker: plan.ticker,
      investedAmount: planCost,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      currentProfit: 0,
      status: 'active'
    };
    trades.push(newTrade);
    save('trades', trades);

    // --- TIERED REFERRAL LOGIC ---
    const allUsers = load('users') as User[];
    const currentUser = allUsers.find(u => u.id === userId);
    
    if (currentUser && currentUser.referredBy) {
        const referrer = allUsers.find(u => u.referralCode === currentUser.referredBy);
        if (referrer) {
            // 1. Determine Referrer Tier based on their network size
            const referrerNetwork = allUsers.filter(u => u.referredBy === referrer.referralCode);
            const networkSize = referrerNetwork.length;

            let tierMultiplier = 0.30; // STANDARD: 30% of platform fee
            let tierName = "Associate";

            if (networkSize >= 10) {
                tierMultiplier = 0.50; // DIRECTOR: 50% of platform fee
                tierName = "Director";
            } else if (networkSize >= 5) {
                tierMultiplier = 0.40; // EXECUTIVE: 40% of platform fee
                tierName = "Executive";
            }

            // 2. Calculate Bonus
            const platformFee = (planCost * plan.feePercentage) / 100;
            const bonus = Math.floor(platformFee * tierMultiplier); 
            
            // 3. Credit Bonus
            const updatedWallets = load('wallets') as Wallet[];
            const rWalletIndex = updatedWallets.findIndex(w => w.userId === referrer.id);
            if (rWalletIndex !== -1) {
                updatedWallets[rWalletIndex].balanceINR = Number(updatedWallets[rWalletIndex].balanceINR || 0) + Number(bonus); 
                updatedWallets[rWalletIndex].totalPartnershipBonus = Number(updatedWallets[rWalletIndex].totalPartnershipBonus || 0) + Number(bonus);
                save('wallets', updatedWallets);
                
                store.createNotification(
                    referrer.id, 
                    `${tierName} Bonus`, 
                    `Network Boost: You earned ₹${bonus.toFixed(0)} (${tierMultiplier*100}% share) from a new investment in ${plan.ticker}.`
                );
            }
        }
    }
  },

  updateGrowth: async (adminId: string, tradeId: string, percentage: number) => {
      const trades = load('trades') as InvestmentContract[];
      const trade = trades.find(t => t.id === tradeId);
      if (!trade || trade.status !== 'active') throw new Error("Contract not active");

      const profitAdded = (Number(trade.investedAmount) * percentage) / 100;
      trade.currentProfit = Number(trade.currentProfit) + profitAdded;
      trade.lastGrowthUpdate = new Date().toISOString();
      
      save('trades', trades);
      
      const logs = (load('growth_logs') || []) as GrowthLog[];
      logs.push({
          id: `gl${Date.now()}`,
          tradeId,
          userId: trade.userId,
          date: new Date().toISOString(),
          percentage,
          profitAdded
      });
      save('growth_logs', logs);

      store.logAdminAction(adminId, "Growth Update", tradeId, `${percentage}% added`);
      store.createNotification(trade.userId, "Yield Update", `Your holding in ${trade.planTicker} grew by ${percentage}%. +₹${profitAdded.toFixed(2)} added.`);
  },

  processExpiredTrades: async (userId: string) => {
      const trades = (load('trades') || []) as InvestmentContract[];
      const userTrades = trades.filter(t => t.userId === userId && t.status === 'active');
      const now = new Date();
      let changed = false;

      const wallets = load('wallets') as Wallet[];
      const wIndex = wallets.findIndex(w => w.userId === userId);
      if (wIndex === -1) return;
      const wallet = wallets[wIndex];

      for (const trade of userTrades) {
          if (new Date(trade.endDate) <= now) {
              trade.status = 'completed';
              const payout = Number(trade.investedAmount) + Number(trade.currentProfit);
              wallet.balanceINR = Number(wallet.balanceINR || 0) + payout;
              wallet.totalProfit = Number(wallet.totalProfit || 0) + Number(trade.currentProfit);
              
              store.createNotification(userId, "Maturity Payout", `Your investment in ${trade.planName} has matured. ₹${payout.toFixed(2)} credited to balance.`);
              changed = true;
          }
      }

      if (changed) {
          save('trades', trades);
          wallets[wIndex] = wallet;
          save('wallets', wallets);
      }
  },

  getReferrals: async (referralCode: string): Promise<User[]> => {
      const users = load('users') as User[];
      return users.filter(u => u.referredBy === referralCode);
  },

  logAdminAction: (adminId: string, action: string, targetId: string, details: string) => {
      const logs = (load('admin_logs') || []) as AdminLog[];
      logs.unshift({
          id: `al${Date.now()}`,
          adminId,
          action,
          targetId,
          details,
          date: new Date().toISOString()
      });
      save('admin_logs', logs.slice(0, 100));
  },
  getAdminLogs: async () => load('admin_logs') || [],

  createNotification: (userId: string | null, title: string, message: string) => {
      const notifs = (load('notifications') || []) as Notification[];
      notifs.unshift({
          id: `n${Date.now()}`,
          userId: userId || undefined,
          title,
          message,
          date: new Date().toISOString(),
          read: false
      });
      save('notifications', notifs);
  },
  getNotifications: async (userId: string) => {
      const notifs = (load('notifications') || []) as Notification[];
      return notifs.filter(n => n.userId === userId || !n.userId);
  },
  markRead: (id: string) => {
      const notifs = (load('notifications') || []) as Notification[];
      const n = notifs.find(x => x.id === id);
      if(n) { n.read = true; save('notifications', notifs); }
  },
  broadcastAnnouncement: async (adminId: string, title: string, message: string) => {
      store.createNotification(null, title, message);
      store.logAdminAction(adminId, "Broadcast", "All", title);
  },

  getUsers: async () => load('users') || [],
  
  updateUserStatus: async (adminId: string, userId: string, isBlocked: boolean) => {
      const users = load('users') as User[];
      const u = users.find(x => x.id === userId);
      if(u) {
          u.isBlocked = isBlocked;
          save('users', users);
          store.logAdminAction(adminId, isBlocked ? "Block User" : "Unblock User", userId, "");
      }
  },

  submitKYC: async (userId: string, data: string) => {
      const users = load('users') as User[];
      const u = users.find(x => x.id === userId);
      if(u) { u.kycStatus = 'pending'; u.kycData = data; save('users', users); }
  },

  updateKYCStatus: async (adminId: string, userId: string, status: 'verified' | 'rejected') => {
      const users = load('users') as User[];
      const u = users.find(x => x.id === userId);
      if(u) {
          u.kycStatus = status;
          save('users', users);
          store.createNotification(userId, "KYC Update", `Your identity verification was ${status}.`);
          store.logAdminAction(adminId, "KYC Update", userId, status);
      }
  },

  adjustWallet: async (adminId: string, userId: string, amount: number, type: 'credit' | 'debit', reason: string) => {
      const wallets = load('wallets') as Wallet[];
      const wIndex = wallets.findIndex(w => w.userId === userId);
      if (wIndex === -1) throw new Error("Wallet not found");
      
      const w = wallets[wIndex];
      const val = Number(amount);

      if (type === 'debit') {
          const current = Number(w.balanceINR || 0);
          if (current < val) throw new Error("Insufficient funds to debit");
          w.balanceINR = current - val;
      } else {
          w.balanceINR = Number(w.balanceINR || 0) + val;
      }

      wallets[wIndex] = w;
      save('wallets', wallets);

      store.logAdminAction(adminId, "Manual Adjust", userId, `${type.toUpperCase()} ₹${val} - ${reason}`);
      store.createNotification(userId, "Admin Adjustment", `Your wallet was ${type === 'credit' ? 'credited' : 'debited'} by ₹${val}. Reason: ${reason}`);
  }
};
