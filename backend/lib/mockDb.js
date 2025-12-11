
// Initial Mock Data derived from frontend/services/store.ts

const MOCK_USERS = [
  { id: 'u1', email: 'partner@growcorp.in', name: 'Arjun Mehta', password: 'password', role: 'user', referralCode: 'ARJ123', joinedAt: '2023-10-01T10:00:00Z', isBlocked: false, kycStatus: 'verified', phone: '9876543210' },
  { id: 'u2', email: 'admin@growcorp.in', name: 'System Admin', password: 'password', role: 'admin', referralCode: 'ADMIN00', joinedAt: '2023-09-01T10:00:00Z', isBlocked: false, kycStatus: 'verified' },
  { id: 'u3', email: 'sarah.j@example.com', name: 'Priya Sharma', password: 'password', role: 'user', referralCode: 'PRI999', referredBy: 'ARJ123', joinedAt: '2023-11-15T14:30:00Z', isBlocked: false, kycStatus: 'verified', phone: '9876543211' },
  { id: 'u4', email: 'rahul.v@example.com', name: 'Rahul Verma', password: 'password', role: 'user', referralCode: 'RAH888', referredBy: 'ARJ123', joinedAt: '2023-12-05T09:15:00Z', isBlocked: false, kycStatus: 'pending', phone: '9876543212' },
];

const MOCK_WALLETS = [
  { userId: 'u1', balanceINR: 125000, totalProfit: 12500, totalPartnershipBonus: 2450 },
  { userId: 'u2', balanceINR: 10000000, totalProfit: 0, totalPartnershipBonus: 0 },
  { userId: 'u3', balanceINR: 15000, totalProfit: 1200, totalPartnershipBonus: 0 },
  { userId: 'u4', balanceINR: 5000, totalProfit: 0, totalPartnershipBonus: 0 },
];

const MOCK_PLANS = [
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

const MOCK_TRADES = [
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

// In-memory store
const db = {
    users: [...MOCK_USERS],
    wallets: [...MOCK_WALLETS],
    plans: [...MOCK_PLANS],
    trades: [...MOCK_TRADES],
    transactions: [],
    notifications: [],
    adminLogs: [],
    growthLogs: []
};

export default db;
