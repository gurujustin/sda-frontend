export const THE_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/wkich/gla-subgraph";
export const EPOCH_INTERVAL = 9600;

// NOTE could get this from an outside source since it changes slightly over time
export const BLOCK_RATE_SECONDS = 13.4;

export const TOKEN_DECIMALS = 9;

export const MAINNET = 1;

interface IAddresses {
  [key: number]: { [key: string]: string };
}

export const addresses: IAddresses = {
  1: {
    USDT_ADDRESS: "0xdac17f958d2ee523a2206206994597c13d831ec7", // duplicate
    DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
    USDC_ADDRESS: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    SDA_ADDRESS: "0xa634fd53f1129a410a3da6df586d2ee02541d749",
    STAKING_ADDRESS: "0x46f4aacc606080b6f106cf8e55a2b77582498990", // The new staking contract
    STAKING_HELPER_ADDRESS: "0x7BB2bA76307A51Cad6d762942edacD0dc55D9bbE", // Helper contract used for Staking only
    sSDA_ADDRESS: "0x1113320c50ab4eba3cfe7a396d9c1bdb6b8c2f60",
    DISTRIBUTOR_ADDRESS: "0x41c7F2Dcc3d3DAAF2144398FCbEE4c3cBB5f2144",
    BONDINGCALC_ADDRESS: "0xc8a8b690edd9c9b524d5a1882860abd47980b3c7",
    TREASURY_ADDRESS: "0x6f788a46abd6827f84b096f7dff516eb4172b448",
    REDEEM_HELPER_ADDRESS: "0xa47fcD74a11bcd94f5F132aA66D3fCb3c67997fF",
  },
};
