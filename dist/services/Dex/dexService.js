"use strict";
// import axios from "axios";
// import {
//   QuotationResponse,
//   ExecuteSwapResponse,
//   TokenListResponse,
//   TokenPriceResponse,
//   PoolsResponse,
//   LiquidityResponse,
//   ClaimLiquidityResponse,
// } from "./DTO";
// import {
//   BadGateWayError,
//   NotFoundError,
//   ValidationError,
// } from "../../utils/AppError";
// import { Keypair, VersionedTransaction, PublicKey } from "@solana/web3.js";
// import {
//   APP_CONNECTION,
//   ONE_WEEK_DURATION,
//   RAYDIUM_ADDRESS,
//   RAYDIUM_STAKE_ADDRESS,
//   RAY_SOL_FARM_ADDRESS,
// } from "../../constants";
// import { Wallet } from "@project-serum/anchor";
// import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
// import User from "../../models/userModel";
// import { decryptPrivateKey } from "../../utils/encryption";
// import {
//   parseTokenAccountResp,
//   API_URLS,
//   Raydium,
//   ApiV3PoolInfoStandardItemCpmm,
//   ApiV3PoolInfoConcentratedItem,
//   ClmmKeys,
//   TickUtils,
//   PoolUtils,
//   CLMM_PROGRAM_ID,
//   ClmmPositionLayout,
// } from "@raydium-io/raydium-sdk-v2";
// import {
//   TOKEN_PROGRAM_ID,
//   TOKEN_2022_PROGRAM_ID,
//   NATIVE_MINT,
// } from "@solana/spl-token";
// import { initSdk, txVersion } from "../../utils/raydiumUtils";
// import { BN } from "bn.js";
// import Decimal from "decimal.js";
// interface RaydiumSwapResponse {
//   success: boolean;
//   // other fields you need from the response...
// }
// // ✅ Get Token List Service
// export const getTokenListService = async (): Promise<TokenListResponse> => {
//   const response = await axios.get(
//     "https://tokens.jup.ag/tokens?tags=lst,community"
//   );
//   // Map the response data to the required structure
//   const tokens = response.data.map((token: any) => ({
//     symbol: token.symbol,
//     address: token.address,
//   }));
//   return {
//     message: "Token list fetched successfully",
//     tokens,
//   };
// };
// // ✅ Get Token Price Service
// export const getTokenPriceService = async (
//   tokenAddress: string
// ): Promise<TokenPriceResponse> => {
//   // Fetch token price from Raydium API
//   const response = await axios.get(
//     `https://api-v3.raydium.io/mint/price?mints=${tokenAddress}` // Convert address to lowercase
//   );
//   // Check if the response is successful
//   if (!response.data.success) {
//     throw new BadGateWayError("Failed to fetch token price.");
//   }
//   // Map the data keys to lowercase
//   const lowerCaseData = Object.keys(response.data.data).reduce(
//     (acc: any, key: string) => {
//       acc[key.toLowerCase()] = response.data.data[key];
//       return acc;
//     },
//     {}
//   );
//   // Check if the token price exists in the data
//   const price = lowerCaseData[tokenAddress.toLowerCase()];
//   if (!price) {
//     throw new BadGateWayError("Token price not found.");
//   }
//   return {
//     message: "Token price fetched successfully",
//     price: price,
//   };
// };
// // Main function to get the quotation based on the exchange name
// export const getQuotationService = async (
//   tokenIn: string,
//   tokenOut: string,
//   amount: string,
//   slippageBps: number,
//   exchangeName: string
// ): Promise<QuotationResponse> => {
//   const _exchangeName = exchangeName.toLowerCase();
//   let response;
//   // Handle different exchanges using if-else or switch-case
//   if (_exchangeName === "raydium") {
//     response = await _getRaydiumQuotation(
//       tokenIn,
//       tokenOut,
//       amount,
//       slippageBps
//     );
//   } else {
//     response = await _getJupiterQuotation(
//       tokenIn,
//       tokenOut,
//       amount,
//       slippageBps
//     );
//   }
//   return response;
// };
// export const getPoolsService = async (
//   poolType: string = "all", // Default value of 'all'
//   poolSortField: string = "default", // Default value of 'default'
//   pageSize: number,
//   page: number
// ): Promise<PoolsResponse> => {
//   pageSize = Number(pageSize) || 10; // Default to 10 if pageSize is not a valid number
//   page = Number(page) || 1; // Default to 1 if page is not a valid number or less than 1
//   // Prepare the URL with query parameters and default values
//   const url = `https://api-v3.raydium.io/pools/info/list?poolType=${poolType}&poolSortField=${poolSortField}&sortType=desc&pageSize=${pageSize}&page=${page}`;
//   // Fetch the data from Raydium API
//   const response = await axios.get(url);
//   if (!response.data) {
//     throw new BadGateWayError(
//       "Failed to fetch the liquidity pools from Raydium."
//     );
//   }
//   // Extract pools data from the API response
//   const pools = response.data.data.data;
//   // Process the pools to match the required format
//   const farms = pools.map((pool: any) => {
//     // Calculate the reward tokens for each pool
//     const rewardTokens = pool.rewardDefaultInfos.map((reward: any) => {
//       // Format perSecond value according to the token's decimals
//       const formattedPerSecond =
//         parseFloat(reward.perSecond) / Math.pow(10, reward.mint.decimals);
//       // Calculate weekly rewards
//       const weeklyRewards = Math.ceil(formattedPerSecond * ONE_WEEK_DURATION); // Weekly reward = perSecond * weekSeconds
//       return {
//         rewardToken: reward.mint.symbol, // Token symbol
//         weeklyRewards: weeklyRewards, // Weekly reward formatted to 2 decimals
//       };
//     });
//     // Determine which APR value to return based on poolSortField
//     let apr: number;
//     if (poolSortField === "apr7d") {
//       apr = pool.week.apr; // Return the week APR
//     } else if (poolSortField === "apr30d") {
//       apr = pool.month.apr; // Return the month APR
//     } else {
//       apr = pool.day.apr; // Default: Return all APRs (day APR)
//     }
//     return {
//       type: pool.type, // Pool type (e.g. "Concentrated")
//       poolId: pool.id, // Pool ID
//       mintA: {
//         address: pool.mintA.address,
//         symbol: pool.mintA.symbol,
//       },
//       mintB: {
//         address: pool.mintB.address,
//         symbol: pool.mintB.symbol,
//       },
//       tvl: pool.tvl, // Total Value Locked
//       feeRate: pool.feeRate * 100, // Fee rate as percentage
//       weeklyRewards: rewardTokens, // Weekly rewards information
//       apr: apr.toFixed(2), // Return the specific APR based on poolSortField
//     };
//   });
//   // Return the farms data
//   return {
//     success: true,
//     data: farms,
//     count: farms.length,
//     hasNextPage: response.data.data.hasNextPage,
//   };
// };
// export const executeSwapService = async (
//   userId: string,
//   tokenIn: string,
//   tokenOut: string,
//   amount: string,
//   slippageBps: number,
//   exchangeName: string
// ): Promise<ExecuteSwapResponse> => {
//   const _exchangeName = exchangeName.toLowerCase();
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");
//   if (!user.solanaWallet?.address) {
//     throw new NotFoundError("Wallet not exists.");
//   }
//   const decrpyedPrivateKey = decryptPrivateKey(
//     user.solanaWallet.encryptedPrivateKey
//   );
//   let response;
//   // Handle different exchanges using if-else or switch-case
//   if (_exchangeName === "raydium") {
//     response = await _executeRaydiumSwap(
//       tokenIn,
//       tokenOut,
//       amount,
//       slippageBps,
//       decrpyedPrivateKey
//     );
//   } else {
//     response = await _executeJupiterSwap(
//       tokenIn,
//       tokenOut,
//       amount,
//       slippageBps,
//       decrpyedPrivateKey
//     );
//   }
//   return response;
// };
// export const getAllPositionsService = async (
//   userId: string
// ): Promise<any[]> => {
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");
//   if (!user.solanaWallet?.address) {
//     throw new NotFoundError("Wallet not exists.");
//   }
//   const decrpyedPrivateKey = decryptPrivateKey(
//     user.solanaWallet.encryptedPrivateKey
//   );
//   const wallet: Keypair = Keypair.fromSecretKey(
//     bs58.decode(decrpyedPrivateKey)
//   );
//   const raydium = await initSdk(wallet);
//   const allPosition = await raydium.clmm.getOwnerPositionInfo({
//     programId: CLMM_PROGRAM_ID,
//   });
//   if (!allPosition.length)
//     throw new NotFoundError("user do not have any positions");
//   //TODO: to retrive the pool info from the pool id
//   return allPosition;
// };
// export const createPositionService = async (
//   userId: string,
//   tokenAddress: string,
//   poolId: string,
//   amount: string
// ): Promise<LiquidityResponse> => {
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");
//   if (!user.solanaWallet?.address) {
//     throw new NotFoundError("Wallet not exists.");
//   }
//   const decrpyedPrivateKey = decryptPrivateKey(
//     user.solanaWallet.encryptedPrivateKey
//   );
//   const wallet: Keypair = Keypair.fromSecretKey(
//     bs58.decode(decrpyedPrivateKey)
//   );
//   const raydium = await initSdk(wallet);
//   let poolInfo: ApiV3PoolInfoConcentratedItem;
//   const data = await raydium.api.fetchPoolById({ ids: poolId });
//   poolInfo = data[0] as ApiV3PoolInfoConcentratedItem;
//   const response = _createPositionConcentratedClmm(
//     tokenAddress.toLowerCase(),
//     poolInfo as ApiV3PoolInfoConcentratedItem,
//     amount,
//     raydium
//   );
//   return response;
// };
// export const closePositionService = async (
//   userId: string,
//   poolId: string
// ): Promise<LiquidityResponse> => {
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");
//   if (!user.solanaWallet?.address) {
//     throw new NotFoundError("Wallet not exists.");
//   }
//   const decrpyedPrivateKey = decryptPrivateKey(
//     user.solanaWallet.encryptedPrivateKey
//   );
//   const wallet: Keypair = Keypair.fromSecretKey(
//     bs58.decode(decrpyedPrivateKey)
//   );
//   const raydium = await initSdk(wallet);
//   let poolInfo: ApiV3PoolInfoConcentratedItem;
//   const data = await raydium.api.fetchPoolById({ ids: poolId });
//   poolInfo = data[0] as ApiV3PoolInfoConcentratedItem;
//   const response = _closePositionConcentratedClmm(
//     poolInfo as ApiV3PoolInfoConcentratedItem,
//     raydium
//   );
//   return response;
// };
// export const claimLiquidityRewardsService = async (
//   userId: string
// ): Promise<ClaimLiquidityResponse> => {
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");
//   if (!user.solanaWallet?.address) {
//     throw new NotFoundError("Wallet not exists.");
//   }
//   const decrpyedPrivateKey = decryptPrivateKey(
//     user.solanaWallet.encryptedPrivateKey
//   );
//   const wallet: Keypair = Keypair.fromSecretKey(
//     bs58.decode(decrpyedPrivateKey)
//   );
//   const raydium = await initSdk(wallet);
//   const allPosition = await raydium.clmm.getOwnerPositionInfo({
//     programId: CLMM_PROGRAM_ID,
//   });
//   const nonZeroPosition = allPosition.filter((p) => !p.liquidity.isZero());
//   if (!nonZeroPosition.length)
//     throw new Error(
//       `user do not have any non zero positions, total positions: ${allPosition.length}`
//     );
//   const positionPoolInfoList = (await raydium.api.fetchPoolById({
//     ids: nonZeroPosition.map((p) => p.poolId.toBase58()).join(","),
//   })) as ApiV3PoolInfoConcentratedItem[];
//   const allPositions = nonZeroPosition.reduce(
//     (acc, cur) => ({
//       ...acc,
//       [cur.poolId.toBase58()]: acc[cur.poolId.toBase58()]
//         ? acc[cur.poolId.toBase58()].concat(cur)
//         : [cur],
//     }),
//     {} as Record<string, ClmmPositionLayout[]>
//   );
//   const { execute } = await raydium.clmm.harvestAllRewards({
//     allPoolInfo: positionPoolInfoList.reduce(
//       (acc, cur) => ({
//         ...acc,
//         [cur.id]: cur,
//       }),
//       {}
//     ),
//     allPositions,
//     ownerInfo: {
//       useSOLBalance: true,
//     },
//     programId: CLMM_PROGRAM_ID,
//     txVersion,
//   });
//   const { txIds } = await execute({ sequentially: true });
//   txIds.map((tx) => {
//     console.log(`https://solscan.io/tx/${tx}`);
//   });
//   return {
//     message: "Liquidity rewards claimed successfully",
//     txHashes: txIds,
//   };
// };
// export const increaseLiquidityService = async (
//   userId: string,
//   tokenAddress: string,
//   poolId: string,
//   amount: string
// ): Promise<LiquidityResponse> => {
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");
//   if (!user.solanaWallet?.address) {
//     throw new NotFoundError("Wallet not exists.");
//   }
//   const decrpyedPrivateKey = decryptPrivateKey(
//     user.solanaWallet.encryptedPrivateKey
//   );
//   const wallet: Keypair = Keypair.fromSecretKey(
//     bs58.decode(decrpyedPrivateKey)
//   );
//   const raydium = await initSdk(wallet);
//   let poolInfo: ApiV3PoolInfoConcentratedItem;
//   const data = await raydium.api.fetchPoolById({ ids: poolId });
//   poolInfo = data[0] as ApiV3PoolInfoConcentratedItem;
//   const response = _increaseLiquidityConcentratedClmm(
//     tokenAddress.toLowerCase(),
//     poolInfo as ApiV3PoolInfoConcentratedItem,
//     amount,
//     raydium
//   );
//   return response;
// };
// export const decreaseLiquidityService = async (
//   userId: string,
//   poolId: string,
//   percentage: number
// ): Promise<LiquidityResponse> => {
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");
//   if (!user.solanaWallet?.address) {
//     throw new NotFoundError("Wallet not exists.");
//   }
//   const decrpyedPrivateKey = decryptPrivateKey(
//     user.solanaWallet.encryptedPrivateKey
//   );
//   const wallet: Keypair = Keypair.fromSecretKey(
//     bs58.decode(decrpyedPrivateKey)
//   );
//   const raydium = await initSdk(wallet);
//   let poolInfo: ApiV3PoolInfoConcentratedItem;
//   const data = await raydium.api.fetchPoolById({ ids: poolId });
//   poolInfo = data[0] as ApiV3PoolInfoConcentratedItem;
//   const response = _decreaseLiquidityConcentratedClmm(
//     poolInfo as ApiV3PoolInfoConcentratedItem,
//     percentage,
//     raydium
//   );
//   return response;
// };
// // Private function for Raydium Exchange
// const _createPositionConcentratedClmm = async (
//   tokenAddress: string,
//   poolInfo: ApiV3PoolInfoConcentratedItem,
//   amount: string,
//   raydium: Raydium
// ): Promise<LiquidityResponse> => {
//   let poolKeys: ClmmKeys | undefined;
//   if (
//     tokenAddress !== poolInfo.mintA.address.toLowerCase() &&
//     tokenAddress !== poolInfo.mintB.address.toLowerCase()
//   ) {
//     throw new ValidationError("Invalid token address");
//   }
//   const isMintA = poolInfo.mintA.address.toLowerCase() === tokenAddress;
//   const _price = poolInfo.price;
//   const _percentage = 10;
//   const inputAmount = amount;
//   const [startPrice, endPrice] = [
//     _price - (_price * _percentage) / 100,
//     _price + (_price * _percentage) / 100,
//   ];
//   const { tick: lowerTick } = TickUtils.getPriceAndTick({
//     poolInfo,
//     price: new Decimal(startPrice),
//     baseIn: true,
//   });
//   const { tick: upperTick } = TickUtils.getPriceAndTick({
//     poolInfo,
//     price: new Decimal(endPrice),
//     baseIn: true,
//   });
//   const epochInfo = await raydium.fetchEpochInfo();
//   const res = await PoolUtils.getLiquidityAmountOutFromAmountIn({
//     poolInfo,
//     slippage: 0,
//     inputA: isMintA,
//     tickUpper: Math.max(lowerTick, upperTick),
//     tickLower: Math.min(lowerTick, upperTick),
//     amount: new BN(
//       new Decimal(inputAmount)
//         .mul(
//           10 ** (isMintA ? poolInfo.mintA.decimals : poolInfo.mintB.decimals)
//         )
//         .toFixed(0)
//     ),
//     add: true,
//     amountHasFee: true,
//     epochInfo: epochInfo,
//   });
//   const { execute } = await raydium.clmm.openPositionFromBase({
//     poolInfo,
//     poolKeys,
//     tickUpper: Math.max(lowerTick, upperTick),
//     tickLower: Math.min(lowerTick, upperTick),
//     base: isMintA ? "MintA" : "MintB",
//     ownerInfo: {
//       useSOLBalance: true,
//     },
//     baseAmount: new BN(
//       new Decimal(inputAmount)
//         .mul(
//           10 ** (isMintA ? poolInfo.mintA.decimals : poolInfo.mintB.decimals)
//         )
//         .toFixed(0)
//     ),
//     otherAmountMax: isMintA
//       ? res.amountSlippageB.amount
//       : res.amountSlippageA.amount,
//     txVersion,
//   });
//   // console.log(
//   //   JSON.stringify({
//   //     liquidity: res.liquidity.toString(),
//   //     amountA: {
//   //       amount: res.amountA.amount.toString(),
//   //       fee: res.amountA.fee,
//   //       expirationTime: res.amountA.expirationTime,
//   //     },
//   //     amountB: {
//   //       amount: res.amountB.amount.toString(),
//   //       fee: res.amountB.fee,
//   //       expirationTime: res.amountB.expirationTime,
//   //     },
//   //     amountSlippageA: {
//   //       amount: res.amountSlippageA.amount.toString(),
//   //       fee: res.amountSlippageA.fee,
//   //       expirationTime: res.amountSlippageA.expirationTime,
//   //     },
//   //     amountSlippageB: {
//   //       amount: res.amountSlippageB.amount.toString(),
//   //       fee: res.amountSlippageB.fee,
//   //       expirationTime: res.amountSlippageB.expirationTime,
//   //     },
//   //     expirationTime: res.expirationTime,
//   //   }),
//   //   "==================================="
//   // );
//   const { txId } = await execute({ sendAndConfirm: true });
//   console.log(`https://solscan.io/tx/${txId}`);
//   // console.log("clmm position opened:", extInfo.nftMint.toBase58());
//   return {
//     message: "CLMM position opened successfully",
//     txHash: txId,
//   };
// };
// const _closePositionConcentratedClmm = async (
//   poolInfo: ApiV3PoolInfoConcentratedItem,
//   raydium: Raydium
// ): Promise<LiquidityResponse> => {
//   let poolKeys: ClmmKeys | undefined;
//   const allPosition = await raydium.clmm.getOwnerPositionInfo({
//     programId: poolInfo.programId,
//   });
//   if (!allPosition.length)
//     throw new NotFoundError("user do not have any positions");
//   const position = allPosition.find((p) => p.poolId.toBase58() === poolInfo.id);
//   if (!position)
//     throw new NotFoundError(
//       `user do not have position in pool: ${poolInfo.id}`
//     );
//   if (!position.liquidity.isZero())
//     throw new ValidationError("Position liquidity is not zero");
//   const { execute } = await raydium.clmm.closePosition({
//     poolInfo,
//     poolKeys,
//     ownerPosition: position,
//     txVersion,
//   });
//   // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
//   const { txId } = await execute({ sendAndConfirm: false });
//   console.log(`https://solscan.io/tx/${txId}`);
//   return {
//     message: "Liquidity position closed successfully",
//     txHash: txId,
//   };
// };
// const _increaseLiquidityConcentratedClmm = async (
//   tokenAddress: string,
//   poolInfo: ApiV3PoolInfoConcentratedItem,
//   amount: string,
//   raydium: Raydium
// ): Promise<LiquidityResponse> => {
//   let poolKeys: ClmmKeys | undefined;
//   if (
//     tokenAddress !== poolInfo.mintA.address.toLowerCase() &&
//     tokenAddress !== poolInfo.mintB.address.toLowerCase()
//   ) {
//     throw new ValidationError("Invalid token address");
//   }
//   const allPosition = await raydium.clmm.getOwnerPositionInfo({
//     programId: poolInfo.programId,
//   });
//   if (!allPosition.length)
//     throw new NotFoundError("user do not have any positions");
//   const position = allPosition.find((p) => p.poolId.toBase58() === poolInfo.id);
//   if (!position)
//     throw new NotFoundError(
//       `user do not have position in pool: ${poolInfo.id}`
//     );
//   const isMintA = poolInfo.mintA.address.toLowerCase() === tokenAddress;
//   const inputAmount = amount;
//   const slippage = 0.05;
//   const epochInfo = await raydium.fetchEpochInfo();
//   const res = await PoolUtils.getLiquidityAmountOutFromAmountIn({
//     poolInfo,
//     slippage: 0,
//     inputA: isMintA,
//     tickUpper: Math.max(position.tickLower, position.tickUpper),
//     tickLower: Math.min(position.tickLower, position.tickUpper),
//     amount: new BN(
//       new Decimal(inputAmount)
//         .mul(
//           10 ** (isMintA ? poolInfo.mintA.decimals : poolInfo.mintB.decimals)
//         )
//         .toFixed(0)
//     ),
//     add: true,
//     amountHasFee: true,
//     epochInfo: epochInfo,
//   });
//   const { execute } = await raydium.clmm.increasePositionFromLiquidity({
//     poolInfo,
//     poolKeys,
//     ownerPosition: position,
//     ownerInfo: {
//       useSOLBalance: true,
//     },
//     liquidity: new BN(
//       new Decimal(res.liquidity.toString()).mul(1 - slippage).toFixed(0)
//     ),
//     amountMaxA: new BN(
//       new Decimal(isMintA ? inputAmount : res.amountSlippageA.amount.toString())
//         .mul(isMintA ? 10 ** poolInfo.mintA.decimals : 1 + slippage)
//         .toFixed(0)
//     ),
//     amountMaxB: new BN(
//       new Decimal(isMintA ? res.amountSlippageB.amount.toString() : inputAmount)
//         .mul(isMintA ? 1 + slippage : 10 ** poolInfo.mintB.decimals)
//         .toFixed(0)
//     ),
//     checkCreateATAOwner: true,
//     txVersion,
//   });
//   const { txId } = await execute({ sendAndConfirm: true });
//   console.log(`https://solscan.io/tx/${txId}`);
//   return {
//     message: "Liquidity increased successfully",
//     txHash: txId,
//   };
// };
// const _decreaseLiquidityConcentratedClmm = async (
//   poolInfo: ApiV3PoolInfoConcentratedItem,
//   percentageToDecrease: number,
//   raydium: Raydium
// ): Promise<LiquidityResponse> => {
//   let poolKeys: ClmmKeys | undefined;
//   const allPosition = await raydium.clmm.getOwnerPositionInfo({
//     programId: poolInfo.programId,
//   });
//   if (!allPosition.length)
//     throw new NotFoundError("user do not have any positions");
//   const position = allPosition.find((p) => p.poolId.toBase58() === poolInfo.id);
//   if (!position)
//     throw new NotFoundError(
//       `user do not have position in pool: ${poolInfo.id}`
//     );
//   const liquidityToDecrease = new BN(
//     new Decimal(position.liquidity.toString())
//       .mul(percentageToDecrease)
//       .div(100)
//       .toFixed(0)
//   );
//   const { execute } = await raydium.clmm.decreaseLiquidity({
//     poolInfo,
//     poolKeys,
//     ownerPosition: position,
//     ownerInfo: {
//       useSOLBalance: true,
//       // if liquidity wants to decrease doesn't equal to position liquidity, set closePosition to false
//       closePosition: Number(position.liquidity) === Number(liquidityToDecrease),
//     },
//     liquidity: liquidityToDecrease,
//     amountMinA: new BN(0), // Minimum amount of A token to withdraw
//     amountMinB: new BN(0), // Minimum amount of B token to withdraw
//     txVersion,
//   });
//   const { txId } = await execute({ sendAndConfirm: true });
//   console.log(`https://solscan.io/tx/${txId}`);
//   return {
//     message: "Liquidity decreased successfully",
//     txHash: txId,
//   };
// };
// const _getRaydiumQuotation = async (
//   tokenIn: string,
//   tokenOut: string,
//   amount: string,
//   slippageBps: number
// ): Promise<QuotationResponse> => {
//   const quoteResponse = await _fetchRaydiumQuotation(
//     tokenIn,
//     tokenOut,
//     amount,
//     slippageBps
//   );
//   return {
//     message: "Quotation fetched successfully from Raydium.",
//     outputAmount: quoteResponse.data.outputAmount,
//     outputAmountMin: quoteResponse.data.otherAmountThreshold,
//   };
// };
// // Private function for Jupiter Exchange
// const _getJupiterQuotation = async (
//   tokenIn: string,
//   tokenOut: string,
//   amount: string,
//   slippageBps: number
// ): Promise<QuotationResponse> => {
//   const response = await axios.get(
//     `https://quote-api.jup.ag/v6/quote?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amount}&slippageBps=${slippageBps}&swapMode=ExactIn`
//   );
//   if (!response.data) {
//     throw new BadGateWayError("Failed to fetch the quotation from Jupiter.");
//   }
//   const quoteResponse = await _fetchJupiterQuotation(
//     tokenIn,
//     tokenOut,
//     amount,
//     slippageBps
//   );
//   return {
//     message: "Quotation fetched successfully from Jupiter.",
//     outputAmount: quoteResponse.outAmount,
//     outputAmountMin: quoteResponse.otherAmountThreshold,
//   };
// };
// const _executeRaydiumSwap = async (
//   tokenIn: string,
//   tokenOut: string,
//   amount: string,
//   slippageBps: number,
//   decrpyedPrivateKey: string
// ): Promise<ExecuteSwapResponse> => {
//   const wallet: Keypair = Keypair.fromSecretKey(
//     bs58.decode(decrpyedPrivateKey)
//   );
//   const [isInputSol, isOutputSol] = [
//     tokenIn === NATIVE_MINT.toBase58(),
//     tokenOut === NATIVE_MINT.toBase58(),
//   ];
//   const { tokenAccounts } = await _fetchTokenAccountData(wallet.publicKey);
//   const inputTokenAcc = tokenAccounts.find(
//     (a: any) => a.mint.toBase58() === tokenIn
//   )?.publicKey;
//   const outputTokenAcc = tokenAccounts.find(
//     (a: any) => a.mint.toBase58() === tokenOut
//   )?.publicKey;
//   const feeData = await axios.get(
//     `${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`
//   );
//   const quoteResponse = await _fetchRaydiumQuotation(
//     tokenIn,
//     tokenOut,
//     amount,
//     slippageBps
//   );
//   const swapTransactions = await axios.post(
//     `${API_URLS.SWAP_HOST}/transaction/swap-base-in`,
//     {
//       computeUnitPriceMicroLamports: String(feeData.data.data.default.h),
//       swapResponse: quoteResponse,
//       txVersion: "V0",
//       wallet: wallet.publicKey.toBase58(),
//       wrapSol: isInputSol,
//       unwrapSol: isOutputSol, // true means output mint receive sol, false means output mint received wsol
//       inputAccount: isInputSol ? undefined : inputTokenAcc?.toBase58(),
//       outputAccount: isOutputSol ? undefined : outputTokenAcc?.toBase58(),
//     }
//   );
//   if (!swapTransactions.data.success) {
//     throw new BadGateWayError("Failed to execute the swapping from Raydium.");
//   }
//   const allTxBuf = swapTransactions.data.data.map((tx: any) =>
//     Buffer.from(tx.transaction, "base64")
//   );
//   const allTransactions = allTxBuf.map((txBuf: any) =>
//     VersionedTransaction.deserialize(txBuf)
//   );
//   let allTx = []; // store all txIds
//   for (const tx of allTransactions) {
//     // sign the transaction
//     tx.sign([wallet]);
//     // get the latest block hash
//     const latestBlockHash = await APP_CONNECTION.getLatestBlockhash();
//     // Execute the transaction
//     const rawTransaction = tx.serialize();
//     const txId = await APP_CONNECTION.sendRawTransaction(rawTransaction, {
//       skipPreflight: true,
//       maxRetries: 2,
//     });
//     await APP_CONNECTION.confirmTransaction({
//       blockhash: latestBlockHash.blockhash,
//       lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//       signature: txId,
//     });
//     console.log(`https://solscan.io/tx/${txId}`);
//     allTx.push(txId);
//   }
//   return {
//     message: "Swap executed successfully on Raydium",
//     txHash: allTx,
//   };
// };
// const _executeJupiterSwap = async (
//   tokenIn: string,
//   tokenOut: string,
//   amount: string,
//   slippageBps: number,
//   decrpyedPrivateKey: string
// ): Promise<ExecuteSwapResponse> => {
//   const wallet = new Wallet(
//     Keypair.fromSecretKey(bs58.decode(decrpyedPrivateKey))
//   );
//   const quoteResponse = await _fetchJupiterQuotation(
//     tokenIn,
//     tokenOut,
//     amount,
//     slippageBps
//   );
//   // get serialized transactions for the swap
//   const swapTransaction = await axios.post(
//     "https://quote-api.jup.ag/v6/swap",
//     {
//       quoteResponse,
//       userPublicKey: wallet.publicKey.toString(),
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   // deserialize the transaction
//   const swapTransactionBuf = Buffer.from(
//     swapTransaction.data.swapTransaction,
//     "base64"
//   );
//   var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
//   // sign the transaction
//   transaction.sign([wallet.payer]);
//   // get the latest block hash
//   const latestBlockHash = await APP_CONNECTION.getLatestBlockhash();
//   // Execute the transaction
//   const rawTransaction = transaction.serialize();
//   const txId = await APP_CONNECTION.sendRawTransaction(rawTransaction, {
//     skipPreflight: true,
//     maxRetries: 2,
//   });
//   await APP_CONNECTION.confirmTransaction({
//     blockhash: latestBlockHash.blockhash,
//     lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//     signature: txId,
//   });
//   console.log(`https://solscan.io/tx/${txId}`);
//   return {
//     message: "Swap executed successfully",
//     txHash: txId,
//   };
// };
// const _fetchTokenAccountData = async (userPublicKey: PublicKey) => {
//   const solAccountResp = await APP_CONNECTION.getAccountInfo(userPublicKey);
//   const tokenAccountResp = await APP_CONNECTION.getTokenAccountsByOwner(
//     userPublicKey,
//     { programId: TOKEN_PROGRAM_ID }
//   );
//   const token2022Req = await APP_CONNECTION.getTokenAccountsByOwner(
//     userPublicKey,
//     { programId: TOKEN_2022_PROGRAM_ID }
//   );
//   const tokenAccountData = parseTokenAccountResp({
//     owner: userPublicKey,
//     solAccountResp,
//     tokenAccountResp: {
//       context: tokenAccountResp.context,
//       value: [...tokenAccountResp.value, ...token2022Req.value],
//     },
//   });
//   return tokenAccountData;
// };
// const _fetchJupiterQuotation = async (
//   tokenIn: string,
//   tokenOut: string,
//   amount: string,
//   slippageBps: number
// ) => {
//   const response = await axios.get(
//     `https://quote-api.jup.ag/v6/quote?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amount}&slippageBps=${slippageBps}&swapMode=ExactIn`
//   );
//   if (!response.data) {
//     throw new BadGateWayError("Failed to fetch the quotation from Jupiter.");
//   }
//   const quoteResponse = response.data;
//   return quoteResponse;
// };
// const _fetchRaydiumQuotation = async (
//   tokenIn: string,
//   tokenOut: string,
//   amount: string,
//   slippageBps: number
// ) => {
//   const response = await axios.get<RaydiumSwapResponse>(
//     `https://transaction-v1.raydium.io/compute/swap-base-in?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amount}&slippageBps=${slippageBps}&txVersion=V0`
//   );
//   if (!response.data.success) {
//     throw new BadGateWayError("Failed to fetch the quotation from Raydium.");
//   }
//   const quoteResponse = response.data;
//   return quoteResponse;
// };
// export const stakeRaydiumService = async (
//   userId: string
// ): Promise<LiquidityResponse> => {
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");
//   if (!user.solanaWallet?.address) {
//     throw new NotFoundError("Wallet not exists.");
//   }
//   const decrpyedPrivateKey = decryptPrivateKey(
//     user.solanaWallet.encryptedPrivateKey
//   );
//   const wallet: Keypair = Keypair.fromSecretKey(
//     bs58.decode(decrpyedPrivateKey)
//   );
//   const raydium = await initSdk(wallet);
//   // note: api doesn't support get devnet farm info
//   const farmInfo = (
//     await raydium.api.fetchFarmInfoById({ ids: RAY_SOL_FARM_ADDRESS })
//   )[0];
//   // const amount = raydium.account.tokenAccountRawInfos.find(
//   //   (a) => a.accountInfo.mint.toBase58() === farmInfo.lpMint.address
//   // )?.accountInfo.amount;
//   const amount = new BN(1);
//   console.log("amount", Number(amount));
//   console.log("farmInfo", farmInfo);
//   console.log("tokenAccountRawInfos", raydium.account.tokenAccountRawInfos);
//   if (!amount || amount.isZero())
//     throw new ValidationError("user do not have lp amount");
//   const { execute } = await raydium.farm.deposit({
//     farmInfo,
//     amount,
//     txVersion,
//   });
//   // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
//   const { txId } = await execute({ sendAndConfirm: true });
//   console.log(`https://solscan.io/tx/${txId}`);
//   return {
//     message: "Raydium tokens staked successfully",
//     txHash: "txId",
//   };
// };
// export const unstakeRaydiumService = async (
//   userId: string,
//   unstakeAmount: number
// ): Promise<LiquidityResponse> => {
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");
//   const userWalletAddress = user.solanaWallet?.address;
//   const userWalletPK = user.solanaWallet?.encryptedPrivateKey;
//   if (!userWalletAddress || !userWalletPK) {
//     throw new NotFoundError("Wallet not exists.");
//   }
//   const decrpyedPrivateKey = decryptPrivateKey(userWalletPK);
//   const wallet: Keypair = Keypair.fromSecretKey(
//     bs58.decode(decrpyedPrivateKey)
//   );
//   const raydium = await initSdk(wallet);
//   // note: api doesn't support get devnet farm info
//   const farmInfo = (
//     await raydium.api.fetchFarmInfoById({ ids: RAY_SOL_FARM_ADDRESS })
//   )[0];
//   const stakedLp = await _getLpAmount(
//     userWalletAddress,
//     RAYDIUM_ADDRESS,
//     RAY_SOL_FARM_ADDRESS,
//     RAYDIUM_STAKE_ADDRESS
//   );
//   const readyUnStakeAmount = new BN(
//     new Decimal(unstakeAmount).mul(10 ** farmInfo.lpMint.decimals).toFixed(0)
//   );
//   if (Number(readyUnStakeAmount) > stakedLp)
//     throw new ValidationError("unstake amount is greater than staked amount");
//   const { execute } = await raydium.farm.withdraw({
//     farmInfo,
//     amount: readyUnStakeAmount,
//     txVersion,
//   });
//   // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
//   const { txId } = await execute({ sendAndConfirm: true });
//   console.log(`https://solscan.io/tx/${txId}`);
//   return {
//     message: "Raydium tokens unstaked successfully",
//     txHash: txId,
//   };
// };
// export const claimStakedRaydiumRewardService = async (
//   userId: string
// ): Promise<LiquidityResponse> => {
//   const user = await User.findById(userId);
//   if (!user) throw new NotFoundError("User not found.");
//   if (!user.solanaWallet?.address) {
//     throw new NotFoundError("Wallet not exists.");
//   }
//   const decrpyedPrivateKey = decryptPrivateKey(
//     user.solanaWallet.encryptedPrivateKey
//   );
//   const wallet: Keypair = Keypair.fromSecretKey(
//     bs58.decode(decrpyedPrivateKey)
//   );
//   const raydium = await initSdk(wallet);
//   const farmInfo = (
//     await raydium.api.fetchFarmInfoById({ ids: RAY_SOL_FARM_ADDRESS })
//   )[0];
//   const { execute } = await raydium.farm.withdraw({
//     farmInfo,
//     amount: new BN(0),
//     txVersion,
//   });
//   // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
//   const { txId } = await execute({ sendAndConfirm: true });
//   console.log(`https://solscan.io/tx/${txId}`);
//   return {
//     message: "Staked raydium rewards claimed successfully",
//     txHash: txId,
//   };
// };
// export const _getLpAmount = async (
//   userWalletAddress: string,
//   raydiumAddress: string,
//   farmAddress: string,
//   stakeAddress: string
// ): Promise<number> => {
//   try {
//     const url = `https://owner-v1.raydium.io/position/stake/${userWalletAddress}`;
//     const response = await axios.get(url);
//     // Parse the JSON response
//     const data = response.data;
//     // Extract the lpAmount from the response
//     const lpAmount =
//       (data as any)?.data?.[raydiumAddress]?.[farmAddress]?.[stakeAddress]?.lpAmount ?? null;
//     if (!lpAmount) {
//       throw new ValidationError("Can not retrieve staked lp amount");
//     }
//     return Number(lpAmount);
//   } catch (error) {
//     throw error;
//   }
// };
