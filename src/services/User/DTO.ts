export interface UserDetailsResponse {
  message: string;
  user: {
    name: string;
    email: string;
    walletAddress: string | null;
  };
}
export interface UserPortfolioResponse {
  message: string;
  assets: {
    symbol: string;
    balance: string;
  }[];
}
