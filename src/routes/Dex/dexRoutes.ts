// import express from "express";
// import { protect } from "../../middlewares/authMiddleware";
// import {
//   claimLiquidityRewards,
//   claimStakedRaydiumReward,
//   closePosition,
//   createPosition,
//   decreaseLiquidity,
//   executeSwap,
//   getAllPositions,
//   getPools,
//   getQuotation,
//   getTokenList,
//   getTokenPrice,
//   increaseLiquidity,
//   stakeRaydium,
//   unstakeRaydium,
// } from "../../controllers/Dex/dexController";

// const router = express.Router();

// router.get("/tokens", protect, getTokenList);
// router.get("/token/price/:tokenAddress", protect, getTokenPrice);
// router.get("/pools", protect, getPools);
// router.get("/quotation", protect, getQuotation);
// router.get("/positions", protect, getAllPositions);
// router.post("/swap", protect, executeSwap);
// router.post("/create-position", protect, createPosition);
// router.post("/increase-liquidity", protect, increaseLiquidity);
// router.post("/decrease-liquidity", protect, decreaseLiquidity);
// router.post("/close-position", protect, closePosition);
// router.post("/claim-liquidity-rewards", protect, claimLiquidityRewards);
// router.post("/stake-raydium", protect, stakeRaydium);
// router.post("/unstake-raydium", protect, unstakeRaydium);
// router.post("/claim-stake-raydium-rewards", protect, claimStakedRaydiumReward);

// export default router;
