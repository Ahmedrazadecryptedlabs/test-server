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
exports.claimStakedRaydiumReward = exports.unstakeRaydium = exports.stakeRaydium = exports.decreaseLiquidity = exports.increaseLiquidity = exports.claimLiquidityRewards = exports.closePosition = exports.createPosition = exports.getAllPositions = exports.executeSwap = exports.getPools = exports.getQuotation = exports.getTokenPrice = exports.getTokenList = void 0;
const dexService_1 = require("../../services/Dex/dexService");
const logger_1 = __importDefault(require("../../utils/logger"));
const AppError_1 = require("../../utils/AppError");
const validatePayload_1 = __importDefault(require("../../utils/validatePayload"));
const dexValidation_1 = require("../../validations/Dex/dexValidation");
const getTokenList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Call the service to fetch token list
        const response = yield (0, dexService_1.getTokenListService)();
        // Send the response with the token list
        logger_1.default.info("GET /api/tokens - Success");
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`GET /api/tokens - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.getTokenList = getTokenList;
const getTokenPrice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenAddress } = req.params;
        // Validate the tokenAddress by passing it as part of an object
        (0, validatePayload_1.default)(dexValidation_1.tokenAddressSchema, { tokenAddress });
        // Fetch the token price from the service
        const response = yield (0, dexService_1.getTokenPriceService)(tokenAddress);
        // Return the price in the response
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`GET /api/token/price/${req.params.tokenAddress} - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.getTokenPrice = getTokenPrice;
const getQuotation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenIn, tokenOut, amount, slippageBps, exchangeName } = req.query;
        // Validate the incoming parameters using Joi schema
        (0, validatePayload_1.default)(dexValidation_1.getQuotationSchema, {
            tokenIn,
            tokenOut,
            amount,
            slippageBps,
            exchangeName,
        });
        // Fetch the quotation from the service
        const response = yield (0, dexService_1.getQuotationService)(tokenIn, tokenOut, amount, Number(slippageBps), exchangeName);
        // Return the response with the outputAmount and otherAmountThreshold
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`GET /api/quotation - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.getQuotation = getQuotation;
const getPools = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { poolType, poolSortField, pageSize, page } = req.query;
        // Validate the incoming parameters using Joi schema
        (0, validatePayload_1.default)(dexValidation_1.getPoolsSchema, {
            poolType,
            poolSortField,
            page,
            pageSize,
        });
        // Fetch the farms from the service
        const response = yield (0, dexService_1.getPoolsService)(poolType, poolSortField, Number(pageSize), Number(page));
        // Return the response
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`GET /api/farms - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.getPools = getPools;
const executeSwap = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenIn, tokenOut, amount, slippageBps, exchangeName } = req.body;
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        // Validate the incoming parameters using Joi schema
        (0, validatePayload_1.default)(dexValidation_1.getQuotationSchema, {
            tokenIn,
            tokenOut,
            amount,
            slippageBps,
            exchangeName,
        });
        // Fetch the quotation from the service
        const response = yield (0, dexService_1.executeSwapService)(userId, tokenIn, tokenOut, amount, Number(slippageBps), exchangeName);
        // Return the response with the outputAmount and otherAmountThreshold
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`GET /api/swap - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.executeSwap = executeSwap;
const getAllPositions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        // Fetch the quotation from the service
        const response = yield (0, dexService_1.getAllPositionsService)(userId);
        // Return the response with the outputAmount and otherAmountThreshold
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`GET /api/create-position - Error: ${error}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.getAllPositions = getAllPositions;
const createPosition = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenAddress, poolId, amount } = req.body;
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        // Validate the incoming parameters using Joi schema
        (0, validatePayload_1.default)(dexValidation_1.addLiquiditySchema, {
            tokenAddress,
            poolId,
            amount,
        });
        // Fetch the quotation from the service
        const response = yield (0, dexService_1.createPositionService)(userId, tokenAddress, poolId, amount);
        // Return the response with the outputAmount and otherAmountThreshold
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`GET /api/create-position - Error: ${error}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.createPosition = createPosition;
const closePosition = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { poolId } = req.body;
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        // Validate the incoming parameters using Joi schema
        (0, validatePayload_1.default)(dexValidation_1.closePositionSchema, {
            poolId,
        });
        // Fetch the quotation from the service
        const response = yield (0, dexService_1.closePositionService)(userId, poolId);
        // Return the response with the outputAmount and otherAmountThreshold
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /api/close-position - Error: ${error.message}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.closePosition = closePosition;
const claimLiquidityRewards = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const {} = req.body;
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        // Fetch the quotation from the service
        const response = yield (0, dexService_1.claimLiquidityRewardsService)(userId);
        // Return the response with the outputAmount and otherAmountThreshold
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /api/claim-liquidity-rewards - Error: ${error}`);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.claimLiquidityRewards = claimLiquidityRewards;
const increaseLiquidity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenAddress, poolId, amount } = req.body;
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        // Validate the incoming parameters using Joi schema
        (0, validatePayload_1.default)(dexValidation_1.addLiquiditySchema, {
            tokenAddress,
            poolId,
            amount,
        });
        // Fetch the quotation from the service
        const response = yield (0, dexService_1.increaseLiquidityService)(userId, tokenAddress, poolId, amount);
        // Return the response with the outputAmount and otherAmountThreshold
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`GET /api/increase-liquidity - Error: ${error}`);
        console.log(error);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.increaseLiquidity = increaseLiquidity;
const decreaseLiquidity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { poolId, percentage } = req.body;
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        // Validate the incoming parameters using Joi schema
        (0, validatePayload_1.default)(dexValidation_1.decreaseLiquiditySchema, {
            poolId,
            percentage,
        });
        // Fetch the quotation from the service
        const response = yield (0, dexService_1.decreaseLiquidityService)(userId, poolId, percentage);
        // Return the response with the outputAmount and otherAmountThreshold
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`GET /api/decrease-liquidity - Error: ${error}`);
        console.log(error.message);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.decreaseLiquidity = decreaseLiquidity;
const stakeRaydium = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        const response = yield (0, dexService_1.stakeRaydiumService)(userId);
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /stake-raydium - Error: ${error}`);
        console.log(error.message);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.stakeRaydium = stakeRaydium;
const unstakeRaydium = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { unstakeAmount } = req.body;
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        // Validate the incoming parameters using Joi schema
        (0, validatePayload_1.default)(dexValidation_1.unstakeRaydiumSchema, {
            unstakeAmount
        });
        const response = yield (0, dexService_1.unstakeRaydiumService)(userId, unstakeAmount);
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /unstake-raydium - Error: ${error}`);
        console.log(error.message);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.unstakeRaydium = unstakeRaydium;
const claimStakedRaydiumReward = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new AppError_1.ValidationError("User not authenticated");
        }
        const userId = req.user.id;
        const response = yield (0, dexService_1.claimStakedRaydiumRewardService)(userId);
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error(`POST /claim-stake-raydium-rewards- Error: ${error}`);
        console.log(error.message);
        next(new AppError_1.AppError(error.message, error.status || 500));
    }
});
exports.claimStakedRaydiumReward = claimStakedRaydiumReward;
