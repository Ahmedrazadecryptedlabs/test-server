import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/Authentication/authRoutes";
import walletRoutes from "./routes/Wallet/walletRoutes";
// import dexRoutes from "./routes/Dex/dexRoutes";
import userRoutes from "./routes/User/userRoutes";
import connectDB from "./config/db";
import errorHandler from "./middlewares/errorHandler";
import { PORT } from "./constants";
import axios from "axios";


export const frontend_url = "https://hedge-ai-sandy.vercel.app"
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
// app.use(cors({ credentials: true, origin: "https://hedge-ai.vercel.app/" }));
const corsOptions = {
  origin: [
    "https://hedge-ai.vercel.app", // Production URL
    "https://hedgeai-webapp.vercel.app",    // Production URL
    "https://hedge-ai-frontend.vercel.app",    // Production URL
    "https://test.annologic.com",
    frontend_url, //Latest url for frontend
    "http://localhost:8000",            // Local development
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// Database Connection
connectDB();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wallet", walletRoutes);
// app.use("/api/v1/dex", dexRoutes);
app.use("/api/v1/user", userRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

app.get("/", (_, res) => {
  res.status(200);
  console.log("🚀 ~ app.get ~ Backend is running fine here:");
  res.send(`Backend is running fine here ............`);
});
axios.defaults.timeout = 20000;
const port = PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
