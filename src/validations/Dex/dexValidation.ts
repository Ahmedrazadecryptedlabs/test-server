import Joi from "joi";
import { validExchanges } from "../../constants";

const tokenAddressSchema = Joi.object({
  tokenAddress: Joi.string().required().messages({
    "string.empty": "Token address is required.",
  }),
});

const getQuotationSchema = Joi.object({
  tokenIn: Joi.string().required().messages({
    "string.empty": "TokenIn address is required.",
  }),
  tokenOut: Joi.string().required().messages({
    "string.empty": "TokenOut address is required.",
  }),
  amount: Joi.string().required().messages({
    "string.empty": "Amount is required.",
  }),
  slippageBps: Joi.number().min(0).max(100).required().messages({
    "number.base": "Slippage must be a number between 0 and 100.",
    "number.empty": "Slippage is required.",
  }),
  exchangeName: Joi.string()
    .valid(...validExchanges)
    .required()
    .messages({
      "any.only": `Exchange name must be one of the following: ${validExchanges.join(
        ", "
      )}.`,
      "string.empty": "Exchange name is required.",
    }),
});

const addLiquiditySchema = Joi.object({
  tokenAddress: Joi.string().required().messages({
    "string.empty": "Token address is required.",
  }),
  poolId: Joi.string().required().messages({
    "string.empty": "Pool ID is required.",
  }),
  amount: Joi.string().required().messages({
    "string.empty": "Amount is required.",
  }),
});


const decreaseLiquiditySchema = Joi.object({
  poolId: Joi.string().required().messages({
    "string.empty": "Pool ID is required.",
  }),
  percentage: Joi.number().greater(0).max(100).required().messages({
    "number.base": "Percentage must be a number.",
    "number.greater": "Percentage must be greater than 0.",
    "number.max": "Percentage must not be greater than 100.",
    "any.required": "Percentage is required.",
  }),
});

const unstakeRaydiumSchema = Joi.object({
  unstakeAmount: Joi.number().required().messages({
    "number.base": "Percentage must be a number.",
    "any.required": "Percentage is required."
  }),
});

const closePositionSchema = Joi.object({
  poolId: Joi.string().required().messages({
    "string.empty": "Pool ID is required.",
  })
});

const getPoolsSchema = Joi.object({
  poolType: Joi.string()
    .valid("concentrated", "standard", "all")
    .default("all")
    .messages({
      "any.only": "PoolType must be one of: concentrated, standard, all.",
    }),
  poolSortField: Joi.string()
    .valid("default", "apr24h", "apr30d", "apr7d")
    .default("default")
    .messages({
      "any.only":
        "PoolSortField must be one of: default, apr24h, apr30d, apr7d.",
    }),
  pageSize: Joi.number()
    .greater(0)
    .max(1000) // Correctly uses .max() to limit to 1000
    .default(10)
    .messages({
      "number.base": "Page size must be a number.",
      "number.greater": "Page size must be greater than 0.",
      "number.max": "Page size must be less than or equal to 1000.",
      "number.integer": "Page size must be an integer.",
    }),
  page: Joi.number().greater(0).integer().default(1).messages({
    "number.base": "Page must be a number.",
    "number.greater": "Page must be greater than 0.",
    "number.integer": "Page must be an integer.",
  }),
});

export {
  tokenAddressSchema,
  getQuotationSchema,
  getPoolsSchema,
  addLiquiditySchema,
  closePositionSchema,
  decreaseLiquiditySchema,
  unstakeRaydiumSchema
};
