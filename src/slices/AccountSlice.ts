import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sGLA } from "../abi/sGla.json";
import { setAll } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, ICalcUserBondDetailsAsyncThunk } from "./interfaces";

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    const glaContract = new ethers.Contract(addresses[networkID].SDA_ADDRESS as string, ierc20Abi, provider);
    const glaBalance = await glaContract.balanceOf(address);
    const sglaContract = new ethers.Contract(addresses[networkID].sSDA_ADDRESS as string, ierc20Abi, provider);
    const sglaBalance = await sglaContract.balanceOf(address);

    return {
      balances: {
        gla: ethers.utils.formatUnits(glaBalance, "gwei"),
        sgla: ethers.utils.formatUnits(sglaBalance, "gwei"),
      },
    };
  },
);

export const loadAccountDetails = createAsyncThunk(
  "account/loadAccountDetails",
  async ({ networkID, provider, address }: IBaseAddressAsyncThunk) => {
    let glaBalance = 0;
    let sglaBalance = 0;
    let stakeAllowance = 0;
    let unstakeAllowance = 0;
    let daiBondAllowance = 0;

    const daiContract = new ethers.Contract(addresses[networkID].USDT_ADDRESS as string, ierc20Abi, provider);
    const usdtBalance = await daiContract.balanceOf(address);

    const glaContract = new ethers.Contract(addresses[networkID].SDA_ADDRESS as string, ierc20Abi, provider);
    glaBalance = await glaContract.balanceOf(address);
    stakeAllowance = await glaContract.allowance(address, addresses[networkID].STAKING_HELPER_ADDRESS);

    const sglaContract = new ethers.Contract(addresses[networkID].sSDA_ADDRESS as string, sGLA, provider);
    sglaBalance = await sglaContract.balanceOf(address);
    unstakeAllowance = await sglaContract.allowance(address, addresses[networkID].STAKING_ADDRESS);

    return {
      balances: {
        usdt: ethers.utils.formatEther(usdtBalance),
        gla: ethers.utils.formatUnits(glaBalance, "gwei"),
        sgla: ethers.utils.formatUnits(sglaBalance, "gwei"),
      },
      staking: {
        glaStake: +stakeAllowance,
        glaUnstake: +unstakeAllowance,
      },
      bonding: {
        daiAllowance: daiBondAllowance,
      },
    };
  },
);

export interface IUserBondDetails {
  allowance: number;
  interestDue: number;
  bondMaturationBlock: number;
  pendingPayout: string; //Payout formatted in gwei.
}
export const calculateUserBondDetails = createAsyncThunk(
  "account/calculateUserBondDetails",
  async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk) => {
    if (!address) {
      return {
        bond: "",
        displayName: "",
        bondIconSvg: "",
        isLP: false,
        isFour: false,
        allowance: 0,
        balance: "0",
        interestDue: 0,
        bondMaturationBlock: 0,
        pendingPayout: "",
      };
    }
    // dispatch(fetchBondInProgress());

    // Calculate bond details.
    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = await bondContract.bondInfo(address);
    interestDue = bondDetails.payout / Math.pow(10, 9);
    bondMaturationBlock = +bondDetails.vesting + +bondDetails.lastBlock;
    pendingPayout = await bondContract.pendingPayoutFor(address);

    let allowance,
      balance = 0;
    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    // formatEthers takes BigNumber => String
    // let balanceVal = ethers.utils.formatEther(balance);
    // balanceVal should NOT be converted to a number. it loses decimal precision
    let deciamls = 18;
    let balanceVal;
    if (bond.decimals) {
      deciamls = bond.decimals;
      balanceVal = ethers.utils.formatUnits(balance, "mwei");
    }
    if (bond.isLP) {
      deciamls = 18;
    }
    balanceVal = ethers.utils.formatEther(balance);
    return {
      bond: bond.name,
      displayName: bond.displayName,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      isFour: bond.isFour,
      allowance: Number(allowance),
      balance: balanceVal.toString(),
      interestDue,
      bondMaturationBlock,
      pendingPayout: ethers.utils.formatUnits(pendingPayout, "gwei"),
    };
  },
);

interface IAccountSlice {
  bonds: { [key: string]: IUserBondDetails };
  balances: {
    gla: string;
    sgla: string;
    dai: string;
  };
  loading: boolean;
}
const initialState: IAccountSlice = {
  loading: false,
  bonds: {},
  balances: { gla: "", sgla: "", dai: "" },
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.loading = true;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(calculateUserBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
        if (!action.payload) return;
        const bond = action.payload.bond;
        state.bonds[bond] = action.payload;
        state.loading = false;
      })
      .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
