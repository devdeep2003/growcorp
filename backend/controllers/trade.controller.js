import db from "../lib/mockDb.js";

export const GetUserTradesController = async (req, res) => {
    try {
        const { userId } = req.params;
        const trades = db.trades.filter(t => t.userId === userId);
        return res.status(200).json(trades);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
