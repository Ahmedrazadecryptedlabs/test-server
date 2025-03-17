"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const userController_1 = require("../../controllers/User/userController");
const router = express_1.default.Router();
router.get("/details", authMiddleware_1.protect, userController_1.getUserDetails);
router.get("/portfolio", authMiddleware_1.protect, userController_1.getUserPortfolio);
exports.default = router;
