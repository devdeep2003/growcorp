import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import planRoutes from "./routes/plan.routes.js";
import tradeRoutes from "./routes/trade.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/admin", adminRoutes);

app.listen(5000, () => {
  console.log("Server connected on port 5000");
});
