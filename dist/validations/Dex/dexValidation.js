"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unstakeRaydiumSchema = exports.decreaseLiquiditySchema = exports.closePositionSchema = exports.addLiquiditySchema = exports.getPoolsSchema = exports.getQuotationSchema = exports.tokenAddressSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../constants");
const tokenAddressSchema = joi_1.default.object({
    tokenAddress: joi_1.default.string().required().messages({
        "string.empty": "Token address is required.",
    }),
});
exports.tokenAddressSchema = tokenAddressSchema;
const getQuotationSchema = joi_1.default.object({
    tokenIn: joi_1.default.string().required().messages({
        "string.empty": "TokenIn address is required.",
    }),
    tokenOut: joi_1.default.string().required().messages({
        "string.empty": "TokenOut address is required.",
    }),
    amount: joi_1.default.string().required().messages({
        "string.empty": "Amount is required.",
    }),
    slippageBps: joi_1.default.number().min(0).max(100).required().messages({
        "number.base": "Slippage must be a number between 0 and 100.",
        "number.empty": "Slippage is required.",
    }),
    exchangeName: joi_1.default.string()
        .valid(...constants_1.validExchanges)
        .required()
        .messages({
        "any.only": `Exchange name must be one of the following: ${constants_1.validExchanges.join(", ")}.`,
        "string.empty": "Exchange name is required.",
    }),
});
exports.getQuotationSchema = getQuotationSchema;
const addLiquiditySchema = joi_1.default.object({
    tokenAddress: joi_1.default.string().required().messages({
        "string.empty": "Token address is required.",
    }),
    poolId: joi_1.default.string().required().messages({
        "string.empty": "Pool ID is required.",
    }),
    amount: joi_1.default.string().required().messages({
        "string.empty": "Amount is required.",
    }),
});
exports.addLiquiditySchema = addLiquiditySchema;
const decreaseLiquiditySchema = joi_1.default.object({
    poolId: joi_1.default.string().required().messages({
        "string.empty": "Pool ID is required.",
    }),
    percentage: joi_1.default.number().greater(0).max(100).required().messages({
        "number.base": "Percentage must be a number.",
        "number.greater": "Percentage must be greater than 0.",
        "number.max": "Percentage must not be greater than 100.",
        "any.required": "Percentage is required.",
    }),
});
exports.decreaseLiquiditySchema = decreaseLiquiditySchema;
const unstakeRaydiumSchema = joi_1.default.object({
    unstakeAmount: joi_1.default.number().required().messages({
        "number.base": "Percentage must be a number.",
        "any.required": "Percentage is required."
    }),
});
exports.unstakeRaydiumSchema = unstakeRaydiumSchema;
const closePositionSchema = joi_1.default.object({
    poolId: joi_1.default.string().required().messages({
        "string.empty": "Pool ID is required.",
    })
});
exports.closePositionSchema = closePositionSchema;
const getPoolsSchema = joi_1.default.object({
    poolType: joi_1.default.string()
        .valid("concentrated", "standard", "all")
        .default("all")
        .messages({
        "any.only": "PoolType must be one of: concentrated, standard, all.",
    }),
    poolSortField: joi_1.default.string()
        .valid("default", "apr24h", "apr30d", "apr7d")
        .default("default")
        .messages({
        "any.only": "PoolSortField must be one of: default, apr24h, apr30d, apr7d.",
    }),
    pageSize: joi_1.default.number()
        .greater(0)
        .max(1000) // Correctly uses .max() to limit to 1000
        .default(10)
        .messages({
        "number.base": "Page size must be a number.",
        "number.greater": "Page size must be greater than 0.",
        "number.max": "Page size must be less than or equal to 1000.",
        "number.integer": "Page size must be an integer.",
    }),
    page: joi_1.default.number().greater(0).integer().default(1).messages({
        "number.base": "Page must be a number.",
        "number.greater": "Page must be greater than 0.",
        "number.integer": "Page must be an integer.",
    }),
});
exports.getPoolsSchema = getPoolsSchema;
