import {
  Raydium,
  TxVersion,
  parseTokenAccountResp,
} from "@raydium-io/raydium-sdk-v2";
import { Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { APP_CONNECTION } from "../constants";

export const txVersion = TxVersion.V0; // or TxVersion.LEGACY
const cluster = "mainnet"; // 'mainnet' | 'devnet'

export const initSdk = async (
  owner: Keypair,
  params?: { loadToken?: boolean }
): Promise<Raydium> => {
  const raydium = await Raydium.load({
    owner,
    connection: APP_CONNECTION,
    cluster,
    disableFeatureCheck: true,
    disableLoadToken: !params?.loadToken,
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
};

export const fetchTokenAccountData = async (owner: PublicKey) => {
  const solAccountResp = await APP_CONNECTION.getAccountInfo(owner);
  const tokenAccountResp = await APP_CONNECTION.getTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });
  const token2022Req = await APP_CONNECTION.getTokenAccountsByOwner(owner, {
    programId: TOKEN_2022_PROGRAM_ID,
  });
  const tokenAccountData = parseTokenAccountResp({
    owner: owner,
    solAccountResp,
    tokenAccountResp: {
      context: tokenAccountResp.context,
      value: [...tokenAccountResp.value, ...token2022Req.value],
    },
  });
  return tokenAccountData;
};
