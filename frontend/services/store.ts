import { User, Wallet, Transaction, ProjectPlan, InvestmentContract, GrowthLog, Notification, AdminLog, RiskLevel, Region } from '../types';

const API_URL = "http://localhost:5000/api";

const getHeaders = () => {
    return {
        "Content-Type": "application/json",
        // Add auth token if we implement JWT later
    };
};

export const store = {
    // --- Auth ---
    login: async (identifier: string): Promise<User | null> => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ phoneorEmail: identifier })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data.data;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    },

    register: async (name: string, email: string, phone: string, referralCode?: string): Promise<User> => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ fullName: name, email, phone, referralCode })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data.data;
        } catch (error) {
            console.error("Register Error:", error);
            throw error;
        }
    },

    // --- Wallet ---
    getWallet: async (userId: string): Promise<Wallet> => {
        // NOTE: processExpiredTrades logic should ideally move to backend or triggered here via API
        // For now, we assume backend handles it or we just fetch current state
        try {
            const response = await fetch(`${API_URL}/wallet/${userId}`);

            // Handle 404/Empty
            if (response.status === 404) {
                return { userId, balanceINR: 0, totalProfit: 0, totalPartnershipBonus: 0 };
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error("Get Wallet Error:", error);
            throw error;
        }
    },

    getAllWallets: async (): Promise<Wallet[]> => {
        // Only for admin usually, not implementing API yet unless needed
        return [];
    },

    getTransactions: async (userId?: string): Promise<Transaction[]> => {
        try {
            const url = userId ? `${API_URL}/transactions/${userId}` : `${API_URL}/admin/transactions`;
            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error("Get Transactions Error:", error);
            return [];
        }
    },

    createTransaction: async (tx: Partial<Transaction>) => {
        try {
            const endpoint = tx.type === 'deposit' ? '/wallet/deposit' : '/wallet/withdraw';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(tx)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
        } catch (error) {
            console.error("Create Transaction Error:", error);
            throw error;
        }
    },

    updateTransactionStatus: async (adminId: string, txId: string, status: 'approved' | 'rejected') => {
        try {
            const response = await fetch(`${API_URL}/admin/transactions/${txId}/status`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ status, adminId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
        } catch (error) {
            console.error("Update Transaction Status Error:", error);
            throw error;
        }
    },

    // --- Plans ---
    getPlans: async (): Promise<ProjectPlan[]> => {
        try {
            const response = await fetch(`${API_URL}/plans`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Get Plans Error:", error);
            return [];
        }
    },

    createPlan: async (adminId: string, plan: Partial<ProjectPlan>) => {
        try {
            const response = await fetch(`${API_URL}/admin/plans`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(plan)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
        } catch (error) {
            console.error("Create Plan Error:", error);
            throw error;
        }
    },

    updatePlan: async (adminId: string, plan: ProjectPlan) => {
        try {
            const response = await fetch(`${API_URL}/admin/plans/${plan.id}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(plan)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
        } catch (error) {
            console.error("Update Plan Error:", error);
            throw error;
        }
    },

    togglePlan: async (adminId: string, planId: string) => {
        try {
            const response = await fetch(`${API_URL}/admin/plans/${planId}/toggle`, {
                method: "POST",
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
        } catch (error) {
            console.error("Toggle Plan Error:", error);
            throw error;
        }
    },

    getUserTrades: async (userId?: string): Promise<InvestmentContract[]> => {
        if (!userId) return [];
        try {
            const response = await fetch(`${API_URL}/trades/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Get User Trades Error:", error);
            return [];
        }
    },

    buyPlan: async (userId: string, planId: string) => {
        try {
            const response = await fetch(`${API_URL}/plans/buy`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ userId, planId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
        } catch (error) {
            console.error("Buy Plan Error:", error);
            throw error;
        }
    },

    updateGrowth: async (adminId: string, tradeId: string, percentage: number) => {
        // Not implemented in backend yet, keeping stub or implement if needed
        console.warn("Update Growth endpoints not fully implemented in this iteration");
    },

    processExpiredTrades: async (userId: string) => {
        // Backend should handle this cron/trigger. 
        // Current structure has explicit endpoint for fetching wallet which serves the purpose of 'refresh'
    },

    getReferrals: async (referralCode: string): Promise<User[]> => {
        try {
            const response = await fetch(`${API_URL}/auth/referrals/${referralCode}`);
            const data = await response.json();
            if (!response.ok) return [];
            return data;
        } catch (error) {
            console.error("Get Referrals Error:", error);
            return [];
        }
    },

    // Log helpers - purely frontend or need backend log endpoint
    logAdminAction: (adminId: string, action: string, targetId: string, details: string) => { },
    getAdminLogs: async () => {
        try {
            const response = await fetch(`${API_URL}/admin/logs`);
            return await response.json();
        } catch (error) {
            return [];
        }
    },

    createNotification: (userId: string | null, title: string, message: string) => { },
    getNotifications: async (userId: string) => { return [] },
    markRead: (id: string) => { },
    broadcastAnnouncement: async (adminId: string, title: string, message: string) => {
        try {
            const response = await fetch(`${API_URL}/admin/broadcast`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ title, message })
            });
            if (!response.ok) throw new Error("Failed");
        } catch (error) {
            console.error("Broadcast Error:", error);
            throw error;
        }
    },

    getUsers: async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users`);
            return await response.json();
        } catch (error) {
            return [];
        }
    },

    updateUserStatus: async (adminId: string, userId: string, isBlocked: boolean) => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ isBlocked })
            });
            if (!response.ok) throw new Error("Failed");
        } catch (error) {
            throw error;
        }
    },

    submitKYC: async (userId: string, data: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/kyc`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ userId, kycUrl: data })
            });
            const res = await response.json();
            if (!response.ok) throw new Error(res.error);
        } catch (error) {
            throw error;
        }
    },

    updateKYCStatus: async (adminId: string, userId: string, status: 'verified' | 'rejected') => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/kyc`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            if (!response.ok) throw new Error("Failed");
        } catch (error) {
            throw error;
        }
    },

    adjustWallet: async (adminId: string, userId: string, amount: number, type: 'credit' | 'debit', reason: string) => {
        try {
            const response = await fetch(`${API_URL}/admin/wallet/adjust`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ adminId, userId, amount, type, reason })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
        } catch (error) {
            throw error;
        }
    }
};
