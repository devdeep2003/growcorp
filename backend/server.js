import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors"


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));


// Routes
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server connected on port 5000");
});
