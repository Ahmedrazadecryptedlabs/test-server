import express from "express";
import { protect } from "../../middlewares/authMiddleware";
import { getUserDetails, getUserPortfolio } from "../../controllers/User/userController";

const router = express.Router();

router.get("/details", protect, getUserDetails);
router.get("/portfolio", protect, getUserPortfolio);

export default router;
