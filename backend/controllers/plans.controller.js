import db from "../lib/mockDb.js";

export const GetPlansController = async (req, res) => {
    try {
        return res.status(200).json(db.plans);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const BuyPlanController = async (req, res) => {
    try {
        const { userId, planId } = req.body;

        const plan = db.plans.find(p => p.id === planId);
        if (!plan) return res.status(404).json({ error: "Project not found" });
        if (!plan.isActive) return res.status(400).json({ error: "Project is closed" });

        const wallet = db.wallets.find(w => w.userId === userId);
        if (!wallet) return res.status(404).json({ error: "Wallet not initialized" });

        const planCost = Number(plan.amount);
        if (wallet.balanceINR < planCost) {
            return res.status(400).json({ error: `Insufficient INR Balance. Required: ₹${planCost}` });
        }

        // Deduct
        wallet.balanceINR -= planCost;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + (plan.durationWeeks * 7));

        const newTrade = {
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

        db.trades.push(newTrade);

        // --- REFERRAL LOGIC LATER ---
        // For simplicity in this mock, skipping complex referral bonus logic or implemented simply if needed.
        
        return res.status(200).json({ success: true, trade: newTrade });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
