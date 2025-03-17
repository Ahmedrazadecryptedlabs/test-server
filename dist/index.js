"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.frontend_url = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/Authentication/authRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/Wallet/walletRoutes"));
const dexRoutes_1 = __importDefault(require("./routes/Dex/dexRoutes"));
const userRoutes_1 = __importDefault(require("./routes/User/userRoutes"));
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const constants_1 = require("./constants");
const axios_1 = __importDefault(require("axios"));
exports.frontend_url = "https://hedge-ai-sandy.vercel.app";
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// app.use(cors({ credentials: true, origin: "https://hedge-ai.vercel.app/" }));
const corsOptions = {
    origin: [
        "https://hedge-ai.vercel.app", // Production URL
        "https://hedgeai-webapp.vercel.app", // Production URL
        "https://hedge-ai-frontend.vercel.app", // Production URL
        "https://test.annologic.com",
        exports.frontend_url, //Latest url for frontend
        "http://localhost:8000", // Local development
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
// Database Connection
(0, db_1.default)();
// Routes
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/wallet", walletRoutes_1.default);
app.use("/api/v1/dex", dexRoutes_1.default);
app.use("/api/v1/user", userRoutes_1.default);
// Global Error Handling Middleware
app.use(errorHandler_1.default);
app.get("/", (_, res) => {
    res.status(200);
    console.log("🚀 ~ app.get ~ Backend is running fine here:");
    res.send(`Backend is running fine here ............`);
});
axios_1.default.defaults.timeout = 20000;
const port = constants_1.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
