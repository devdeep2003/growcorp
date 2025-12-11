import db from "../lib/mockDb.js";

export const GetWalletController = async (req, res) => {
    try {
        const { userId } = req.params;
        const wallet = db.wallets.find(w => w.userId === userId);
        
        if (!wallet) {
            // Should verify user exists first but for now just return empty wallet
            return res.status(200).json({ userId, balanceINR: 0, totalProfit: 0, totalPartnershipBonus: 0 });
        }
        
        return res.status(200).json(wallet);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const GetTransactionsController = async (req, res) => {
    try {
        const { userId } = req.params;
        const txs = db.transactions.filter(t => t.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.status(200).json(txs);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export const DepositController = async (req, res) => {
    try {
        const { userId, amount, method, proofUrl, txHash } = req.body;
        
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ error: "Invalid amount" });

        const newTx = {
            id: `tx${Date.now()}`,
            status: 'pending',
            date: new Date().toISOString(),
            userId,
            type: 'deposit',
            amount: numAmount,
            method,
            proofUrl,
            txHash
        };

        db.transactions.push(newTx);
        return res.status(200).json({ success: true, transaction: newTx });
        
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const WithdrawController = async (req, res) => {
    try {
        const { userId, amount, method, walletAddress } = req.body;
        
        const numAmount = Number(amount);
        if (numAmount < 500) return res.status(400).json({ error: "Minimum withdrawal amount is ₹500" });

        const wallet = db.wallets.find(w => w.userId === userId);
        if (!wallet) return res.status(404).json({ error: "Wallet not found" });

        if (wallet.balanceINR < numAmount) return res.status(400).json({ error: "Insufficient INR Balance" });

        // Lock funds
        wallet.balanceINR -= numAmount;

        const newTx = {
            id: `tx${Date.now()}`,
            status: 'pending',
            date: new Date().toISOString(),
            userId,
            type: 'withdrawal',
            amount: numAmount,
            method,
            walletAddress
        };

        db.transactions.push(newTx);
        return res.status(200).json({ success: true, transaction: newTx });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
