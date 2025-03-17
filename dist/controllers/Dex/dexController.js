"use strict";
// import { Request, Response, NextFunction } from "express";
// import {
//   claimLiquidityRewardsService,
//   claimStakedRaydiumRewardService,
//   closePositionService,
//   createPositionService,
//   decreaseLiquidityService,
//   executeSwapService,
//   getAllPositionsService,
//   getPoolsService,
//   getQuotationService,
//   getTokenListService,
//   getTokenPriceService,
//   increaseLiquidityService,
//   stakeRaydiumService,
//   unstakeRaydiumService,
// } from "../../services/Dex/dexService";
// import logger from "../../utils/logger";
// import { AppError, ValidationError } from "../../utils/AppError";
// import validatePayload from "../../utils/validatePayload";
// import {
//   addLiquiditySchema,
//   closePositionSchema,
//   decreaseLiquiditySchema,
//   getPoolsSchema,
//   getQuotationSchema,
//   tokenAddressSchema,
//   unstakeRaydiumSchema,
// } from "../../validations/Dex/dexValidation";
// import { AuthenticatedRequest } from "../../types/express";
// export const getTokenList = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     // Call the service to fetch token list
//     const response = await getTokenListService();
//     // Send the response with the token list
//     logger.info("GET /api/tokens - Success");
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`GET /api/tokens - Error: ${error.message}`);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const getTokenPrice = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { tokenAddress } = req.params;
//     // Validate the tokenAddress by passing it as part of an object
//     validatePayload(tokenAddressSchema, { tokenAddress });
//     // Fetch the token price from the service
//     const response = await getTokenPriceService(tokenAddress);
//     // Return the price in the response
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(
//       `GET /api/token/price/${req.params.tokenAddress} - Error: ${error.message}`
//     );
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const getQuotation = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { tokenIn, tokenOut, amount, slippageBps, exchangeName } = req.query;
//     // Validate the incoming parameters using Joi schema
//     validatePayload(getQuotationSchema, {
//       tokenIn,
//       tokenOut,
//       amount,
//       slippageBps,
//       exchangeName,
//     });
//     // Fetch the quotation from the service
//     const response = await getQuotationService(
//       tokenIn as string,
//       tokenOut as string,
//       amount as string,
//       Number(slippageBps),
//       exchangeName as string
//     );
//     // Return the response with the outputAmount and otherAmountThreshold
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`GET /api/quotation - Error: ${error.message}`);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const getPools = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { poolType, poolSortField, pageSize, page } = req.query;
//     // Validate the incoming parameters using Joi schema
//     validatePayload(getPoolsSchema, {
//       poolType,
//       poolSortField,
//       page,
//       pageSize,
//     });
//     // Fetch the farms from the service
//     const response = await getPoolsService(
//       poolType as string,
//       poolSortField as string,
//       Number(pageSize),
//       Number(page)
//     );
//     // Return the response
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`GET /api/farms - Error: ${error.message}`);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const executeSwap = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { tokenIn, tokenOut, amount, slippageBps, exchangeName } = req.body;
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }
//     const userId = req.user.id;
//     // Validate the incoming parameters using Joi schema
//     validatePayload(getQuotationSchema, {
//       tokenIn,
//       tokenOut,
//       amount,
//       slippageBps,
//       exchangeName,
//     });
//     // Fetch the quotation from the service
//     const response = await executeSwapService(
//       userId,
//       tokenIn as string,
//       tokenOut as string,
//       amount as string,
//       Number(slippageBps),
//       exchangeName as string
//     );
//     // Return the response with the outputAmount and otherAmountThreshold
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`GET /api/swap - Error: ${error.message}`);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const getAllPositions = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }
//     const userId = req.user.id;
//     // Fetch the quotation from the service
//     const response = await getAllPositionsService(userId);
//     // Return the response with the outputAmount and otherAmountThreshold
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`GET /api/create-position - Error: ${error}`);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const createPosition = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { tokenAddress, poolId, amount } = req.body;
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }
//     const userId = req.user.id;
//     // Validate the incoming parameters using Joi schema
//     validatePayload(addLiquiditySchema, {
//       tokenAddress,
//       poolId,
//       amount,
//     });
//     // Fetch the quotation from the service
//     const response = await createPositionService(
//       userId,
//       tokenAddress as string,
//       poolId as string,
//       amount as string
//     );
//     // Return the response with the outputAmount and otherAmountThreshold
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`GET /api/create-position - Error: ${error}`);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const closePosition = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { poolId } = req.body;
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }
//     const userId = req.user.id;
//     // Validate the incoming parameters using Joi schema
//     validatePayload(closePositionSchema, {
//       poolId,
//     });
//     // Fetch the quotation from the service
//     const response = await closePositionService(userId, poolId as string);
//     // Return the response with the outputAmount and otherAmountThreshold
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`POST /api/close-position - Error: ${error.message}`);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const claimLiquidityRewards = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const {} = req.body;
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }
//     const userId = req.user.id;
//     // Fetch the quotation from the service
//     const response = await claimLiquidityRewardsService(userId);
//     // Return the response with the outputAmount and otherAmountThreshold
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`POST /api/claim-liquidity-rewards - Error: ${error}`);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const increaseLiquidity = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { tokenAddress, poolId, amount } = req.body;
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }
//     const userId = req.user.id;
//     // Validate the incoming parameters using Joi schema
//     validatePayload(addLiquiditySchema, {
//       tokenAddress,
//       poolId,
//       amount,
//     });
//     // Fetch the quotation from the service
//     const response = await increaseLiquidityService(
//       userId,
//       tokenAddress as string,
//       poolId as string,
//       amount as string
//     );
//     // Return the response with the outputAmount and otherAmountThreshold
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`GET /api/increase-liquidity - Error: ${error}`);
//     console.log(error);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const decreaseLiquidity = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { poolId, percentage } = req.body;
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }
//     const userId = req.user.id;
//     // Validate the incoming parameters using Joi schema
//     validatePayload(decreaseLiquiditySchema, {
//       poolId,
//       percentage,
//     });
//     // Fetch the quotation from the service
//     const response = await decreaseLiquidityService(
//       userId,
//       poolId as string,
//       percentage as number
//     );
//     // Return the response with the outputAmount and otherAmountThreshold
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`GET /api/decrease-liquidity - Error: ${error}`);
//     console.log(error.message);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const stakeRaydium = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }
//     const userId = req.user.id;
//     const response = await stakeRaydiumService(userId);
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`POST /stake-raydium - Error: ${error}`);
//     console.log(error.message);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const unstakeRaydium = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { unstakeAmount } = req.body;
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }
//     const userId = req.user.id;
//     // Validate the incoming parameters using Joi schema
//     validatePayload(unstakeRaydiumSchema, {
//       unstakeAmount
//     });
//     const response = await unstakeRaydiumService(userId,unstakeAmount);
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`POST /unstake-raydium - Error: ${error}`);
//     console.log(error.message);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
// export const claimStakedRaydiumReward = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       throw new ValidationError("User not authenticated");
//     }
//     const userId = req.user.id;
//     const response = await claimStakedRaydiumRewardService(userId);
//     res.status(200).json(response);
//   } catch (error: any) {
//     logger.error(`POST /claim-stake-raydium-rewards- Error: ${error}`);
//     console.log(error.message);
//     next(new AppError(error.message, error.status || 500));
//   }
// };
