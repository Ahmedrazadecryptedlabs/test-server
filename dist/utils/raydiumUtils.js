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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenAccountData = exports.initSdk = exports.txVersion = void 0;
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const spl_token_1 = require("@solana/spl-token");
const constants_1 = require("../constants");
exports.txVersion = raydium_sdk_v2_1.TxVersion.V0; // or TxVersion.LEGACY
const cluster = "mainnet"; // 'mainnet' | 'devnet'
const initSdk = (owner, params) => __awaiter(void 0, void 0, void 0, function* () {
    const raydium = yield raydium_sdk_v2_1.Raydium.load({
        owner,
        connection: constants_1.APP_CONNECTION,
        cluster,
        disableFeatureCheck: true,
        disableLoadToken: !(params === null || params === void 0 ? void 0 : params.loadToken),
        blockhashCommitment: "finalized",
    });
    /**
     * By default: sdk will automatically fetch token account data when need it or any sol balace changed.
     * if you want to handle token account by yourself, set token account data after init sdk
     * code below shows how to do it.
     * note: after call raydium.account.updateTokenAccount, raydium will not automatically fetch token account
     */
    /*
    raydium.account.updateTokenAccount(await fetchTokenAccountData())
    APP_CONNECTION.onAccountChange(owner.publicKey, async () => {
      raydium!.account.updateTokenAccount(await fetchTokenAccountData())
    })
    */
    return raydium;
});
exports.initSdk = initSdk;
const fetchTokenAccountData = (owner) => __awaiter(void 0, void 0, void 0, function* () {
    const solAccountResp = yield constants_1.APP_CONNECTION.getAccountInfo(owner);
    const tokenAccountResp = yield constants_1.APP_CONNECTION.getTokenAccountsByOwner(owner, {
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    });
    const token2022Req = yield constants_1.APP_CONNECTION.getTokenAccountsByOwner(owner, {
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
    });
    const tokenAccountData = (0, raydium_sdk_v2_1.parseTokenAccountResp)({
        owner: owner,
        solAccountResp,
        tokenAccountResp: {
            context: tokenAccountResp.context,
            value: [...tokenAccountResp.value, ...token2022Req.value],
        },
    });
    return tokenAccountData;
});
exports.fetchTokenAccountData = fetchTokenAccountData;
