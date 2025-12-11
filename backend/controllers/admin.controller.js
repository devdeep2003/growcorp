import db from "../lib/mockDb.js";

// --- Transactions ---

export const UpdateTransactionStatus = async (req, res) => {
    try {
        const { txId } = req.params;
        const { status, adminId } = req.body; // adminId for logging

        const tx = db.transactions.find(t => t.id === txId);
        if (!tx) return res.status(404).json({ error: "Transaction not found" });

        if (tx.status !== 'pending') {
            return res.status(400).json({ error: "Transaction is already processed" });
        }

        const wallet = db.wallets.find(w => w.userId === tx.userId);
        if (!wallet) return res.status(404).json({ error: "User wallet not found" });

        // Logic based on type
        if (tx.type === 'deposit') {
            if (status === 'approved') {
                wallet.balanceINR += tx.amount;
                
                // --- Referral Bonus Logic (5% on First Deposit) ---
                const user = db.users.find(u => u.id === tx.userId);
                if (user && user.referredBy) {
                    // Check if this is the FIRST approved deposit
                    const previousDeposits = db.transactions.filter(t => t.userId === tx.userId && t.type === 'deposit' && t.status === 'approved' && t.id !== txId);
                    
                    if (previousDeposits.length === 0) {
                        const referrer = db.users.find(u => u.referralCode === user.referredBy);
                        if (referrer) {
                            const refWallet = db.wallets.find(w => w.userId === referrer.id);
                            if (refWallet) {
                                const bonus = tx.amount * 0.05; // 5%
                                refWallet.balanceINR += bonus;
                                refWallet.totalPartnershipBonus += bonus;
                                
                                db.transactions.push({
                                    id: `tx_bonus_${Date.now()}`,
                                    status: 'approved',
                                    date: new Date().toISOString(),
                                    userId: referrer.id,
                                    type: 'deposit', // or special type 'bonus'
                                    amount: bonus,
                                    method: 'System',
                                    walletAddress: 'Referral Bonus'
                                });
                                
                                db.adminLogs.push({
                                    id: `log_bonus_${Date.now()}`,
                                    date: new Date().toISOString(),
                                    adminId: 'system',
                                    action: 'Referral Bonus',
                                    details: `Paid ${bonus} to ${referrer.name} for ${user.name}`
                                });
                            }
                        }
                    }
                }
            }
            // If rejected, nothing happens (money never arrived)
        } else if (tx.type === 'withdrawal') {
            if (status === 'rejected') {
                // Refund the locked amount
                wallet.balanceINR += tx.amount;
            }
            // If approved, money is gone (already deducted on request)
        }

        tx.status = status;
        
        // Log it
        db.adminLogs.push({
            id: `log${Date.now()}`,
            date: new Date().toISOString(),
            adminId: adminId || 'admin',
            action: `Transcation ${status}`,
            details: `Tx ${txId} (${tx.type}) of ${tx.amount}`
        });

        return res.status(200).json({ success: true, transaction: tx });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const GetAllTransactions = async (req, res) => {
    try {
        const txs = db.transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.status(200).json(txs);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// --- Users ---

export const GetUsers = async (req, res) => {
    try {
        // Return sensitive info?
        return res.status(200).json(db.users);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const UpdateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isBlocked } = req.body;

        const user = db.users.find(u => u.id === userId);
        if(!user) return res.status(404).json({ error: "User not found" });

        user.isBlocked = isBlocked;
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const UpdateKYCStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // verified, rejected

        const user = db.users.find(u => u.id === userId);
        if(!user) return res.status(404).json({ error: "User not found" });

        user.kycStatus = status;
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// --- Plans ---

export const CreatePlan = async (req, res) => {
     try {
        const plan = req.body;
        const newPlan = {
            ...plan,
            id: `plan${Date.now()}`,
            isActive: true
        };
        db.plans.push(newPlan);
        return res.status(200).json(newPlan);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const UpdatePlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const updates = req.body;
        
        const index = db.plans.findIndex(p => p.id === planId);
        if (index === -1) return res.status(404).json({ error: "Plan not found" });

        db.plans[index] = { ...db.plans[index], ...updates };
        return res.status(200).json(db.plans[index]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const TogglePlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const plan = db.plans.find(p => p.id === planId);
        if (!plan) return res.status(404).json({ error: "Plan not found" });

        plan.isActive = !plan.isActive;
        return res.status(200).json(plan);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// --- Wallet Adjust ---

export const AdjustWallet = async (req, res) => {
    try {
        const { userId, amount, type, reason, adminId } = req.body;
        const wallet = db.wallets.find(w => w.userId === userId);
        if (!wallet) return res.status(404).json({ error: "User wallet not found" });

        const val = Number(amount);
        if (type === 'credit') {
            wallet.balanceINR += val;
            if (reason.toLowerCase().includes('bonus')) {
                wallet.totalPartnershipBonus += val; // Optional tracking
            }
        } else {
            wallet.balanceINR -= val;
        }

        db.adminLogs.push({
            id: `log${Date.now()}`,
            date: new Date().toISOString(),
            adminId: adminId || 'admin',
            action: `Wallet Adjusted (${type})`,
            details: `${type} ${val} for ${userId}: ${reason}`
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const GetLogs = async (req, res) => {
    try {
        return res.status(200).json(db.adminLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// --- Broadcast ---
export const Broadcast = async (req, res) => {
    // Just mock logging for now as we don't have real push notifications
    try {
        const { title, message } = req.body;
        console.log("BROADCAST:", title, message);
        // In a real app we would create notification records for all users
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
