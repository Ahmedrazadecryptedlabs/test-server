"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getLpAmount = exports.claimStakedRaydiumRewardService = exports.unstakeRaydiumService = exports.stakeRaydiumService = exports.decreaseLiquidityService = exports.increaseLiquidityService = exports.claimLiquidityRewardsService = exports.closePositionService = exports.createPositionService = exports.getAllPositionsService = exports.executeSwapService = exports.getPoolsService = exports.getQuotationService = exports.getTokenPriceService = exports.getTokenListService = void 0;
const axios_1 = __importDefault(require("axios"));
const AppError_1 = require("../../utils/AppError");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../../constants");
const anchor_1 = require("@project-serum/anchor");
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
const userModel_1 = __importDefault(require("../../models/userModel"));
const encryption_1 = require("../../utils/encryption");
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const spl_token_1 = require("@solana/spl-token");
const raydiumUtils_1 = require("../../utils/raydiumUtils");
const bn_js_1 = require("bn.js");
const decimal_js_1 = __importDefault(require("decimal.js"));
// ✅ Get Token List Service
const getTokenListService = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get("https://tokens.jup.ag/tokens?tags=lst,community");
    // Map the response data to the required structure
    const tokens = response.data.map((token) => ({
        symbol: token.symbol,
        address: token.address,
    }));
    return {
        message: "Token list fetched successfully",
        tokens,
    };
});
exports.getTokenListService = getTokenListService;
// ✅ Get Token Price Service
const getTokenPriceService = (tokenAddress) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch token price from Raydium API
    const response = yield axios_1.default.get(`https://api-v3.raydium.io/mint/price?mints=${tokenAddress}` // Convert address to lowercase
    );
    // Check if the response is successful
    if (!response.data.success) {
        throw new AppError_1.BadGateWayError("Failed to fetch token price.");
    }
    // Map the data keys to lowercase
    const lowerCaseData = Object.keys(response.data.data).reduce((acc, key) => {
        acc[key.toLowerCase()] = response.data.data[key];
        return acc;
    }, {});
    // Check if the token price exists in the data
    const price = lowerCaseData[tokenAddress.toLowerCase()];
    if (!price) {
        throw new AppError_1.BadGateWayError("Token price not found.");
    }
    return {
        message: "Token price fetched successfully",
        price: price,
    };
});
exports.getTokenPriceService = getTokenPriceService;
// Main function to get the quotation based on the exchange name
const getQuotationService = (tokenIn, tokenOut, amount, slippageBps, exchangeName) => __awaiter(void 0, void 0, void 0, function* () {
    const _exchangeName = exchangeName.toLowerCase();
    let response;
    // Handle different exchanges using if-else or switch-case
    if (_exchangeName === "raydium") {
        response = yield _getRaydiumQuotation(tokenIn, tokenOut, amount, slippageBps);
    }
    else {
        response = yield _getJupiterQuotation(tokenIn, tokenOut, amount, slippageBps);
    }
    return response;
});
exports.getQuotationService = getQuotationService;
const getPoolsService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (poolType = "all", // Default value of 'all'
poolSortField = "default", // Default value of 'default'
pageSize, page) {
    pageSize = Number(pageSize) || 10; // Default to 10 if pageSize is not a valid number
    page = Number(page) || 1; // Default to 1 if page is not a valid number or less than 1
    // Prepare the URL with query parameters and default values
    const url = `https://api-v3.raydium.io/pools/info/list?poolType=${poolType}&poolSortField=${poolSortField}&sortType=desc&pageSize=${pageSize}&page=${page}`;
    // Fetch the data from Raydium API
    const response = yield axios_1.default.get(url);
    if (!response.data) {
        throw new AppError_1.BadGateWayError("Failed to fetch the liquidity pools from Raydium.");
    }
    // Extract pools data from the API response
    const pools = response.data.data.data;
    // Process the pools to match the required format
    const farms = pools.map((pool) => {
        // Calculate the reward tokens for each pool
        const rewardTokens = pool.rewardDefaultInfos.map((reward) => {
            // Format perSecond value according to the token's decimals
            const formattedPerSecond = parseFloat(reward.perSecond) / Math.pow(10, reward.mint.decimals);
            // Calculate weekly rewards
            const weeklyRewards = Math.ceil(formattedPerSecond * constants_1.ONE_WEEK_DURATION); // Weekly reward = perSecond * weekSeconds
            return {
                rewardToken: reward.mint.symbol, // Token symbol
                weeklyRewards: weeklyRewards, // Weekly reward formatted to 2 decimals
            };
        });
        // Determine which APR value to return based on poolSortField
        let apr;
        if (poolSortField === "apr7d") {
            apr = pool.week.apr; // Return the week APR
        }
        else if (poolSortField === "apr30d") {
            apr = pool.month.apr; // Return the month APR
        }
        else {
            apr = pool.day.apr; // Default: Return all APRs (day APR)
        }
        return {
            type: pool.type, // Pool type (e.g. "Concentrated")
            poolId: pool.id, // Pool ID
            mintA: {
                address: pool.mintA.address,
                symbol: pool.mintA.symbol,
            },
            mintB: {
                address: pool.mintB.address,
                symbol: pool.mintB.symbol,
            },
            tvl: pool.tvl, // Total Value Locked
            feeRate: pool.feeRate * 100, // Fee rate as percentage
            weeklyRewards: rewardTokens, // Weekly rewards information
            apr: apr.toFixed(2), // Return the specific APR based on poolSortField
        };
    });
    // Return the farms data
    return {
        success: true,
        data: farms,
        count: farms.length,
        hasNextPage: response.data.data.hasNextPage,
    };
});
exports.getPoolsService = getPoolsService;
const executeSwapService = (userId, tokenIn, tokenOut, amount, slippageBps, exchangeName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _exchangeName = exchangeName.toLowerCase();
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (!((_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address)) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const decrpyedPrivateKey = (0, encryption_1.decryptPrivateKey)(user.solanaWallet.encryptedPrivateKey);
    let response;
    // Handle different exchanges using if-else or switch-case
    if (_exchangeName === "raydium") {
        response = yield _executeRaydiumSwap(tokenIn, tokenOut, amount, slippageBps, decrpyedPrivateKey);
    }
    else {
        response = yield _executeJupiterSwap(tokenIn, tokenOut, amount, slippageBps, decrpyedPrivateKey);
    }
    return response;
});
exports.executeSwapService = executeSwapService;
const getAllPositionsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (!((_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address)) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const decrpyedPrivateKey = (0, encryption_1.decryptPrivateKey)(user.solanaWallet.encryptedPrivateKey);
    const wallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey));
    const raydium = yield (0, raydiumUtils_1.initSdk)(wallet);
    const allPosition = yield raydium.clmm.getOwnerPositionInfo({
        programId: raydium_sdk_v2_1.CLMM_PROGRAM_ID,
    });
    if (!allPosition.length)
        throw new AppError_1.NotFoundError("user do not have any positions");
    //TODO: to retrive the pool info from the pool id
    return allPosition;
});
exports.getAllPositionsService = getAllPositionsService;
const createPositionService = (userId, tokenAddress, poolId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (!((_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address)) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const decrpyedPrivateKey = (0, encryption_1.decryptPrivateKey)(user.solanaWallet.encryptedPrivateKey);
    const wallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey));
    const raydium = yield (0, raydiumUtils_1.initSdk)(wallet);
    let poolInfo;
    const data = yield raydium.api.fetchPoolById({ ids: poolId });
    poolInfo = data[0];
    const response = _createPositionConcentratedClmm(tokenAddress.toLowerCase(), poolInfo, amount, raydium);
    return response;
});
exports.createPositionService = createPositionService;
const closePositionService = (userId, poolId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (!((_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address)) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const decrpyedPrivateKey = (0, encryption_1.decryptPrivateKey)(user.solanaWallet.encryptedPrivateKey);
    const wallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey));
    const raydium = yield (0, raydiumUtils_1.initSdk)(wallet);
    let poolInfo;
    const data = yield raydium.api.fetchPoolById({ ids: poolId });
    poolInfo = data[0];
    const response = _closePositionConcentratedClmm(poolInfo, raydium);
    return response;
});
exports.closePositionService = closePositionService;
const claimLiquidityRewardsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (!((_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address)) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const decrpyedPrivateKey = (0, encryption_1.decryptPrivateKey)(user.solanaWallet.encryptedPrivateKey);
    const wallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey));
    const raydium = yield (0, raydiumUtils_1.initSdk)(wallet);
    const allPosition = yield raydium.clmm.getOwnerPositionInfo({
        programId: raydium_sdk_v2_1.CLMM_PROGRAM_ID,
    });
    const nonZeroPosition = allPosition.filter((p) => !p.liquidity.isZero());
    if (!nonZeroPosition.length)
        throw new Error(`user do not have any non zero positions, total positions: ${allPosition.length}`);
    const positionPoolInfoList = (yield raydium.api.fetchPoolById({
        ids: nonZeroPosition.map((p) => p.poolId.toBase58()).join(","),
    }));
    const allPositions = nonZeroPosition.reduce((acc, cur) => (Object.assign(Object.assign({}, acc), { [cur.poolId.toBase58()]: acc[cur.poolId.toBase58()]
            ? acc[cur.poolId.toBase58()].concat(cur)
            : [cur] })), {});
    const { execute } = yield raydium.clmm.harvestAllRewards({
        allPoolInfo: positionPoolInfoList.reduce((acc, cur) => (Object.assign(Object.assign({}, acc), { [cur.id]: cur })), {}),
        allPositions,
        ownerInfo: {
            useSOLBalance: true,
        },
        programId: raydium_sdk_v2_1.CLMM_PROGRAM_ID,
        txVersion: raydiumUtils_1.txVersion,
    });
    const { txIds } = yield execute({ sequentially: true });
    txIds.map((tx) => {
        console.log(`https://solscan.io/tx/${tx}`);
    });
    return {
        message: "Liquidity rewards claimed successfully",
        txHashes: txIds,
    };
});
exports.claimLiquidityRewardsService = claimLiquidityRewardsService;
const increaseLiquidityService = (userId, tokenAddress, poolId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (!((_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address)) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const decrpyedPrivateKey = (0, encryption_1.decryptPrivateKey)(user.solanaWallet.encryptedPrivateKey);
    const wallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey));
    const raydium = yield (0, raydiumUtils_1.initSdk)(wallet);
    let poolInfo;
    const data = yield raydium.api.fetchPoolById({ ids: poolId });
    poolInfo = data[0];
    const response = _increaseLiquidityConcentratedClmm(tokenAddress.toLowerCase(), poolInfo, amount, raydium);
    return response;
});
exports.increaseLiquidityService = increaseLiquidityService;
const decreaseLiquidityService = (userId, poolId, percentage) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (!((_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address)) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const decrpyedPrivateKey = (0, encryption_1.decryptPrivateKey)(user.solanaWallet.encryptedPrivateKey);
    const wallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey));
    const raydium = yield (0, raydiumUtils_1.initSdk)(wallet);
    let poolInfo;
    const data = yield raydium.api.fetchPoolById({ ids: poolId });
    poolInfo = data[0];
    const response = _decreaseLiquidityConcentratedClmm(poolInfo, percentage, raydium);
    return response;
});
exports.decreaseLiquidityService = decreaseLiquidityService;
// Private function for Raydium Exchange
const _createPositionConcentratedClmm = (tokenAddress, poolInfo, amount, raydium) => __awaiter(void 0, void 0, void 0, function* () {
    let poolKeys;
    if (tokenAddress !== poolInfo.mintA.address.toLowerCase() &&
        tokenAddress !== poolInfo.mintB.address.toLowerCase()) {
        throw new AppError_1.ValidationError("Invalid token address");
    }
    const isMintA = poolInfo.mintA.address.toLowerCase() === tokenAddress;
    const _price = poolInfo.price;
    const _percentage = 10;
    const inputAmount = amount;
    const [startPrice, endPrice] = [
        _price - (_price * _percentage) / 100,
        _price + (_price * _percentage) / 100,
    ];
    const { tick: lowerTick } = raydium_sdk_v2_1.TickUtils.getPriceAndTick({
        poolInfo,
        price: new decimal_js_1.default(startPrice),
        baseIn: true,
    });
    const { tick: upperTick } = raydium_sdk_v2_1.TickUtils.getPriceAndTick({
        poolInfo,
        price: new decimal_js_1.default(endPrice),
        baseIn: true,
    });
    const epochInfo = yield raydium.fetchEpochInfo();
    const res = yield raydium_sdk_v2_1.PoolUtils.getLiquidityAmountOutFromAmountIn({
        poolInfo,
        slippage: 0,
        inputA: isMintA,
        tickUpper: Math.max(lowerTick, upperTick),
        tickLower: Math.min(lowerTick, upperTick),
        amount: new bn_js_1.BN(new decimal_js_1.default(inputAmount)
            .mul(Math.pow(10, (isMintA ? poolInfo.mintA.decimals : poolInfo.mintB.decimals)))
            .toFixed(0)),
        add: true,
        amountHasFee: true,
        epochInfo: epochInfo,
    });
    const { execute } = yield raydium.clmm.openPositionFromBase({
        poolInfo,
        poolKeys,
        tickUpper: Math.max(lowerTick, upperTick),
        tickLower: Math.min(lowerTick, upperTick),
        base: isMintA ? "MintA" : "MintB",
        ownerInfo: {
            useSOLBalance: true,
        },
        baseAmount: new bn_js_1.BN(new decimal_js_1.default(inputAmount)
            .mul(Math.pow(10, (isMintA ? poolInfo.mintA.decimals : poolInfo.mintB.decimals)))
            .toFixed(0)),
        otherAmountMax: isMintA
            ? res.amountSlippageB.amount
            : res.amountSlippageA.amount,
        txVersion: raydiumUtils_1.txVersion,
    });
    // console.log(
    //   JSON.stringify({
    //     liquidity: res.liquidity.toString(),
    //     amountA: {
    //       amount: res.amountA.amount.toString(),
    //       fee: res.amountA.fee,
    //       expirationTime: res.amountA.expirationTime,
    //     },
    //     amountB: {
    //       amount: res.amountB.amount.toString(),
    //       fee: res.amountB.fee,
    //       expirationTime: res.amountB.expirationTime,
    //     },
    //     amountSlippageA: {
    //       amount: res.amountSlippageA.amount.toString(),
    //       fee: res.amountSlippageA.fee,
    //       expirationTime: res.amountSlippageA.expirationTime,
    //     },
    //     amountSlippageB: {
    //       amount: res.amountSlippageB.amount.toString(),
    //       fee: res.amountSlippageB.fee,
    //       expirationTime: res.amountSlippageB.expirationTime,
    //     },
    //     expirationTime: res.expirationTime,
    //   }),
    //   "==================================="
    // );
    const { txId } = yield execute({ sendAndConfirm: true });
    console.log(`https://solscan.io/tx/${txId}`);
    // console.log("clmm position opened:", extInfo.nftMint.toBase58());
    return {
        message: "CLMM position opened successfully",
        txHash: txId,
    };
});
const _closePositionConcentratedClmm = (poolInfo, raydium) => __awaiter(void 0, void 0, void 0, function* () {
    let poolKeys;
    const allPosition = yield raydium.clmm.getOwnerPositionInfo({
        programId: poolInfo.programId,
    });
    if (!allPosition.length)
        throw new AppError_1.NotFoundError("user do not have any positions");
    const position = allPosition.find((p) => p.poolId.toBase58() === poolInfo.id);
    if (!position)
        throw new AppError_1.NotFoundError(`user do not have position in pool: ${poolInfo.id}`);
    if (!position.liquidity.isZero())
        throw new AppError_1.ValidationError("Position liquidity is not zero");
    const { execute } = yield raydium.clmm.closePosition({
        poolInfo,
        poolKeys,
        ownerPosition: position,
        txVersion: raydiumUtils_1.txVersion,
    });
    // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
    const { txId } = yield execute({ sendAndConfirm: false });
    console.log(`https://solscan.io/tx/${txId}`);
    return {
        message: "Liquidity position closed successfully",
        txHash: txId,
    };
});
const _increaseLiquidityConcentratedClmm = (tokenAddress, poolInfo, amount, raydium) => __awaiter(void 0, void 0, void 0, function* () {
    let poolKeys;
    if (tokenAddress !== poolInfo.mintA.address.toLowerCase() &&
        tokenAddress !== poolInfo.mintB.address.toLowerCase()) {
        throw new AppError_1.ValidationError("Invalid token address");
    }
    const allPosition = yield raydium.clmm.getOwnerPositionInfo({
        programId: poolInfo.programId,
    });
    if (!allPosition.length)
        throw new AppError_1.NotFoundError("user do not have any positions");
    const position = allPosition.find((p) => p.poolId.toBase58() === poolInfo.id);
    if (!position)
        throw new AppError_1.NotFoundError(`user do not have position in pool: ${poolInfo.id}`);
    const isMintA = poolInfo.mintA.address.toLowerCase() === tokenAddress;
    const inputAmount = amount;
    const slippage = 0.05;
    const epochInfo = yield raydium.fetchEpochInfo();
    const res = yield raydium_sdk_v2_1.PoolUtils.getLiquidityAmountOutFromAmountIn({
        poolInfo,
        slippage: 0,
        inputA: isMintA,
        tickUpper: Math.max(position.tickLower, position.tickUpper),
        tickLower: Math.min(position.tickLower, position.tickUpper),
        amount: new bn_js_1.BN(new decimal_js_1.default(inputAmount)
            .mul(Math.pow(10, (isMintA ? poolInfo.mintA.decimals : poolInfo.mintB.decimals)))
            .toFixed(0)),
        add: true,
        amountHasFee: true,
        epochInfo: epochInfo,
    });
    const { execute } = yield raydium.clmm.increasePositionFromLiquidity({
        poolInfo,
        poolKeys,
        ownerPosition: position,
        ownerInfo: {
            useSOLBalance: true,
        },
        liquidity: new bn_js_1.BN(new decimal_js_1.default(res.liquidity.toString()).mul(1 - slippage).toFixed(0)),
        amountMaxA: new bn_js_1.BN(new decimal_js_1.default(isMintA ? inputAmount : res.amountSlippageA.amount.toString())
            .mul(isMintA ? Math.pow(10, poolInfo.mintA.decimals) : 1 + slippage)
            .toFixed(0)),
        amountMaxB: new bn_js_1.BN(new decimal_js_1.default(isMintA ? res.amountSlippageB.amount.toString() : inputAmount)
            .mul(isMintA ? 1 + slippage : Math.pow(10, poolInfo.mintB.decimals))
            .toFixed(0)),
        checkCreateATAOwner: true,
        txVersion: raydiumUtils_1.txVersion,
    });
    const { txId } = yield execute({ sendAndConfirm: true });
    console.log(`https://solscan.io/tx/${txId}`);
    return {
        message: "Liquidity increased successfully",
        txHash: txId,
    };
});
const _decreaseLiquidityConcentratedClmm = (poolInfo, percentageToDecrease, raydium) => __awaiter(void 0, void 0, void 0, function* () {
    let poolKeys;
    const allPosition = yield raydium.clmm.getOwnerPositionInfo({
        programId: poolInfo.programId,
    });
    if (!allPosition.length)
        throw new AppError_1.NotFoundError("user do not have any positions");
    const position = allPosition.find((p) => p.poolId.toBase58() === poolInfo.id);
    if (!position)
        throw new AppError_1.NotFoundError(`user do not have position in pool: ${poolInfo.id}`);
    const liquidityToDecrease = new bn_js_1.BN(new decimal_js_1.default(position.liquidity.toString())
        .mul(percentageToDecrease)
        .div(100)
        .toFixed(0));
    const { execute } = yield raydium.clmm.decreaseLiquidity({
        poolInfo,
        poolKeys,
        ownerPosition: position,
        ownerInfo: {
            useSOLBalance: true,
            // if liquidity wants to decrease doesn't equal to position liquidity, set closePosition to false
            closePosition: Number(position.liquidity) === Number(liquidityToDecrease),
        },
        liquidity: liquidityToDecrease,
        amountMinA: new bn_js_1.BN(0), // Minimum amount of A token to withdraw
        amountMinB: new bn_js_1.BN(0), // Minimum amount of B token to withdraw
        txVersion: // Minimum amount of B token to withdraw
        raydiumUtils_1.txVersion,
    });
    const { txId } = yield execute({ sendAndConfirm: true });
    console.log(`https://solscan.io/tx/${txId}`);
    return {
        message: "Liquidity decreased successfully",
        txHash: txId,
    };
});
const _getRaydiumQuotation = (tokenIn, tokenOut, amount, slippageBps) => __awaiter(void 0, void 0, void 0, function* () {
    const quoteResponse = yield _fetchRaydiumQuotation(tokenIn, tokenOut, amount, slippageBps);
    return {
        message: "Quotation fetched successfully from Raydium.",
        outputAmount: quoteResponse.data.outputAmount,
        outputAmountMin: quoteResponse.data.otherAmountThreshold,
    };
});
// Private function for Jupiter Exchange
const _getJupiterQuotation = (tokenIn, tokenOut, amount, slippageBps) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(`https://quote-api.jup.ag/v6/quote?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amount}&slippageBps=${slippageBps}&swapMode=ExactIn`);
    if (!response.data) {
        throw new AppError_1.BadGateWayError("Failed to fetch the quotation from Jupiter.");
    }
    const quoteResponse = yield _fetchJupiterQuotation(tokenIn, tokenOut, amount, slippageBps);
    return {
        message: "Quotation fetched successfully from Jupiter.",
        outputAmount: quoteResponse.outAmount,
        outputAmountMin: quoteResponse.otherAmountThreshold,
    };
});
const _executeRaydiumSwap = (tokenIn, tokenOut, amount, slippageBps, decrpyedPrivateKey) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const wallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey));
    const [isInputSol, isOutputSol] = [
        tokenIn === spl_token_1.NATIVE_MINT.toBase58(),
        tokenOut === spl_token_1.NATIVE_MINT.toBase58(),
    ];
    const { tokenAccounts } = yield _fetchTokenAccountData(wallet.publicKey);
    const inputTokenAcc = (_a = tokenAccounts.find((a) => a.mint.toBase58() === tokenIn)) === null || _a === void 0 ? void 0 : _a.publicKey;
    const outputTokenAcc = (_b = tokenAccounts.find((a) => a.mint.toBase58() === tokenOut)) === null || _b === void 0 ? void 0 : _b.publicKey;
    const feeData = yield axios_1.default.get(`${raydium_sdk_v2_1.API_URLS.BASE_HOST}${raydium_sdk_v2_1.API_URLS.PRIORITY_FEE}`);
    const quoteResponse = yield _fetchRaydiumQuotation(tokenIn, tokenOut, amount, slippageBps);
    const swapTransactions = yield axios_1.default.post(`${raydium_sdk_v2_1.API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
        computeUnitPriceMicroLamports: String(feeData.data.data.default.h),
        swapResponse: quoteResponse,
        txVersion: "V0",
        wallet: wallet.publicKey.toBase58(),
        wrapSol: isInputSol,
        unwrapSol: isOutputSol, // true means output mint receive sol, false means output mint received wsol
        inputAccount: isInputSol ? undefined : inputTokenAcc === null || inputTokenAcc === void 0 ? void 0 : inputTokenAcc.toBase58(),
        outputAccount: isOutputSol ? undefined : outputTokenAcc === null || outputTokenAcc === void 0 ? void 0 : outputTokenAcc.toBase58(),
    });
    if (!swapTransactions.data.success) {
        throw new AppError_1.BadGateWayError("Failed to execute the swapping from Raydium.");
    }
    const allTxBuf = swapTransactions.data.data.map((tx) => Buffer.from(tx.transaction, "base64"));
    const allTransactions = allTxBuf.map((txBuf) => web3_js_1.VersionedTransaction.deserialize(txBuf));
    let allTx = []; // store all txIds
    for (const tx of allTransactions) {
        // sign the transaction
        tx.sign([wallet]);
        // get the latest block hash
        const latestBlockHash = yield constants_1.APP_CONNECTION.getLatestBlockhash();
        // Execute the transaction
        const rawTransaction = tx.serialize();
        const txId = yield constants_1.APP_CONNECTION.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 2,
        });
        yield constants_1.APP_CONNECTION.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: txId,
        });
        console.log(`https://solscan.io/tx/${txId}`);
        allTx.push(txId);
    }
    return {
        message: "Swap executed successfully on Raydium",
        txHash: allTx,
    };
});
const _executeJupiterSwap = (tokenIn, tokenOut, amount, slippageBps, decrpyedPrivateKey) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = new anchor_1.Wallet(web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey)));
    const quoteResponse = yield _fetchJupiterQuotation(tokenIn, tokenOut, amount, slippageBps);
    // get serialized transactions for the swap
    const swapTransaction = yield axios_1.default.post("https://quote-api.jup.ag/v6/swap", {
        quoteResponse,
        userPublicKey: wallet.publicKey.toString(),
    }, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    // deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction.data.swapTransaction, "base64");
    var transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
    // sign the transaction
    transaction.sign([wallet.payer]);
    // get the latest block hash
    const latestBlockHash = yield constants_1.APP_CONNECTION.getLatestBlockhash();
    // Execute the transaction
    const rawTransaction = transaction.serialize();
    const txId = yield constants_1.APP_CONNECTION.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
    });
    yield constants_1.APP_CONNECTION.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txId,
    });
    console.log(`https://solscan.io/tx/${txId}`);
    return {
        message: "Swap executed successfully",
        txHash: txId,
    };
});
const _fetchTokenAccountData = (userPublicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const solAccountResp = yield constants_1.APP_CONNECTION.getAccountInfo(userPublicKey);
    const tokenAccountResp = yield constants_1.APP_CONNECTION.getTokenAccountsByOwner(userPublicKey, { programId: spl_token_1.TOKEN_PROGRAM_ID });
    const token2022Req = yield constants_1.APP_CONNECTION.getTokenAccountsByOwner(userPublicKey, { programId: spl_token_1.TOKEN_2022_PROGRAM_ID });
    const tokenAccountData = (0, raydium_sdk_v2_1.parseTokenAccountResp)({
        owner: userPublicKey,
        solAccountResp,
        tokenAccountResp: {
            context: tokenAccountResp.context,
            value: [...tokenAccountResp.value, ...token2022Req.value],
        },
    });
    return tokenAccountData;
});
const _fetchJupiterQuotation = (tokenIn, tokenOut, amount, slippageBps) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(`https://quote-api.jup.ag/v6/quote?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amount}&slippageBps=${slippageBps}&swapMode=ExactIn`);
    if (!response.data) {
        throw new AppError_1.BadGateWayError("Failed to fetch the quotation from Jupiter.");
    }
    const quoteResponse = response.data;
    return quoteResponse;
});
const _fetchRaydiumQuotation = (tokenIn, tokenOut, amount, slippageBps) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(`https://transaction-v1.raydium.io/compute/swap-base-in?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amount}&slippageBps=${slippageBps}&txVersion=V0`);
    if (!response.data.success) {
        throw new AppError_1.BadGateWayError("Failed to fetch the quotation from Raydium.");
    }
    const quoteResponse = response.data;
    return quoteResponse;
});
const stakeRaydiumService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (!((_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address)) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const decrpyedPrivateKey = (0, encryption_1.decryptPrivateKey)(user.solanaWallet.encryptedPrivateKey);
    const wallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey));
    const raydium = yield (0, raydiumUtils_1.initSdk)(wallet);
    // note: api doesn't support get devnet farm info
    const farmInfo = (yield raydium.api.fetchFarmInfoById({ ids: constants_1.RAY_SOL_FARM_ADDRESS }))[0];
    // const amount = raydium.account.tokenAccountRawInfos.find(
    //   (a) => a.accountInfo.mint.toBase58() === farmInfo.lpMint.address
    // )?.accountInfo.amount;
    const amount = new bn_js_1.BN(1);
    console.log("amount", Number(amount));
    console.log("farmInfo", farmInfo);
    console.log("tokenAccountRawInfos", raydium.account.tokenAccountRawInfos);
    if (!amount || amount.isZero())
        throw new AppError_1.ValidationError("user do not have lp amount");
    const { execute } = yield raydium.farm.deposit({
        farmInfo,
        amount,
        txVersion: raydiumUtils_1.txVersion,
    });
    // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
    const { txId } = yield execute({ sendAndConfirm: true });
    console.log(`https://solscan.io/tx/${txId}`);
    return {
        message: "Raydium tokens staked successfully",
        txHash: "txId",
    };
});
exports.stakeRaydiumService = stakeRaydiumService;
const unstakeRaydiumService = (userId, unstakeAmount) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    const userWalletAddress = (_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address;
    const userWalletPK = (_b = user.solanaWallet) === null || _b === void 0 ? void 0 : _b.encryptedPrivateKey;
    if (!userWalletAddress || !userWalletPK) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const decrpyedPrivateKey = (0, encryption_1.decryptPrivateKey)(userWalletPK);
    const wallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey));
    const raydium = yield (0, raydiumUtils_1.initSdk)(wallet);
    // note: api doesn't support get devnet farm info
    const farmInfo = (yield raydium.api.fetchFarmInfoById({ ids: constants_1.RAY_SOL_FARM_ADDRESS }))[0];
    const stakedLp = yield (0, exports._getLpAmount)(userWalletAddress, constants_1.RAYDIUM_ADDRESS, constants_1.RAY_SOL_FARM_ADDRESS, constants_1.RAYDIUM_STAKE_ADDRESS);
    const readyUnStakeAmount = new bn_js_1.BN(new decimal_js_1.default(unstakeAmount).mul(Math.pow(10, farmInfo.lpMint.decimals)).toFixed(0));
    if (Number(readyUnStakeAmount) > stakedLp)
        throw new AppError_1.ValidationError("unstake amount is greater than staked amount");
    const { execute } = yield raydium.farm.withdraw({
        farmInfo,
        amount: readyUnStakeAmount,
        txVersion: raydiumUtils_1.txVersion,
    });
    // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
    const { txId } = yield execute({ sendAndConfirm: true });
    console.log(`https://solscan.io/tx/${txId}`);
    return {
        message: "Raydium tokens unstaked successfully",
        txHash: txId,
    };
});
exports.unstakeRaydiumService = unstakeRaydiumService;
const claimStakedRaydiumRewardService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield userModel_1.default.findById(userId);
    if (!user)
        throw new AppError_1.NotFoundError("User not found.");
    if (!((_a = user.solanaWallet) === null || _a === void 0 ? void 0 : _a.address)) {
        throw new AppError_1.NotFoundError("Wallet not exists.");
    }
    const decrpyedPrivateKey = (0, encryption_1.decryptPrivateKey)(user.solanaWallet.encryptedPrivateKey);
    const wallet = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(decrpyedPrivateKey));
    const raydium = yield (0, raydiumUtils_1.initSdk)(wallet);
    const farmInfo = (yield raydium.api.fetchFarmInfoById({ ids: constants_1.RAY_SOL_FARM_ADDRESS }))[0];
    const { execute } = yield raydium.farm.withdraw({
        farmInfo,
        amount: new bn_js_1.BN(0),
        txVersion: raydiumUtils_1.txVersion,
    });
    // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
    const { txId } = yield execute({ sendAndConfirm: true });
    console.log(`https://solscan.io/tx/${txId}`);
    return {
        message: "Staked raydium rewards claimed successfully",
        txHash: txId,
    };
});
exports.claimStakedRaydiumRewardService = claimStakedRaydiumRewardService;
const _getLpAmount = (userWalletAddress, raydiumAddress, farmAddress, stakeAddress) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const url = `https://owner-v1.raydium.io/position/stake/${userWalletAddress}`;
        const response = yield axios_1.default.get(url);
        // Parse the JSON response
        const data = response.data;
        // Extract the lpAmount from the response
        const lpAmount = (_e = (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a[raydiumAddress]) === null || _b === void 0 ? void 0 : _b[farmAddress]) === null || _c === void 0 ? void 0 : _c[stakeAddress]) === null || _d === void 0 ? void 0 : _d.lpAmount) !== null && _e !== void 0 ? _e : null;
        if (!lpAmount) {
            throw new AppError_1.ValidationError("Can not retrieve staked lp amount");
        }
        return Number(lpAmount);
    }
    catch (error) {
        throw error;
    }
});
exports._getLpAmount = _getLpAmount;
