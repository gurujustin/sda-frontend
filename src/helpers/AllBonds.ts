import { StableBond, LPBond, NetworkID, CustomBond, BondType } from "src/lib/Bond";
import { addresses, MAINNET } from "src/constants";

import { ReactComponent as DaiImg } from "src/assets/tokens/DAI.svg";
import { ReactComponent as GlaDaiimg } from "src/assets/tokens/GLA-DAI.svg";
import { ReactComponent as GlaUsdtimg } from "src/assets/tokens/GLA-USDT.svg";
import { ReactComponent as wFTMImg } from "src/assets/tokens/wFTM.svg";
import { ReactComponent as UsdcImg } from "src/assets/tokens/USDC.svg";
import { ReactComponent as BusdImg } from "src/assets/tokens/BUSD.svg";
import { ReactComponent as GlaUsdcImg } from "src/assets/tokens/GLA-USDC.svg";
import { ReactComponent as GlaBusdImg } from "src/assets/tokens/GLA-BUSD.svg";

import { abi as BondGlaDaiContract } from "src/abi/bonds/GlaDaiContract.json";
import { abi as GlaUsdcContract } from "src/abi/bonds/GlaUsdcContract.json";

import { abi as DaiBondContract } from "src/abi/bonds/DaiContract.json";
import { abi as MimBondContract } from "src/abi/bonds/MimContract.json";
import { abi as ReserveGlaDaiContract } from "src/abi/reserves/GlaDai.json";
import { abi as ReserveGlaUsdcContract } from "src/abi/reserves/GlaUsdc.json";

import { abi as EthBondContract } from "src/abi/bonds/FtmContract.json";

import { abi as ierc20Abi } from "src/abi/IERC20.json";

// TODO(zx): Further modularize by splitting up reserveAssets into vendor token definitions
//   and include that in the definition of a bond
export const dai = new StableBond({
  name: "dai",
  displayName: "DAI",
  bondToken: "DAI",
  bondIconSvg: DaiImg,
  bondContractABI: DaiBondContract,
  // fourAddress: "0xe8fd4630800bA4335801D1b104B07328Ae415605",
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xc5488e76eb5d4a1ac3155a8cb475c4d1e3d2dff6",
      reserveAddress: addresses[MAINNET].DAI,
    },
    [NetworkID.Testnet]: {
      bondAddress: "",
      reserveAddress: "",
    },
  },
});

export const usdc = new StableBond({
  name: "usdc",
  displayName: "USDC",
  bondToken: "USDC",
  bondIconSvg: UsdcImg,
  // fourAddress: "0x605c31dD24c71f0b732Ef33aC12CDce77fAC09B6",
  bondContractABI: DaiBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xb336df6f297ad2d24e026a7064c009a4c6f02dcf",
      reserveAddress: addresses[MAINNET].DAI,
    },
    [NetworkID.Testnet]: {
      bondAddress: "",
      reserveAddress: "",
    },
  },
});

export const dailp = new LPBond({
  name: "dai_lp",
  displayName: "SDA-DAI LP",
  bondToken: "DAI",
  bondIconSvg: GlaBusdImg,
  bondContractABI: GlaUsdcContract,
  reserveContract: ReserveGlaUsdcContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x4E815683eD404d1Afb137Da5e9926d6ED95cDFeB",
      reserveAddress: "0x7f44bc132691526c6d9bd238584a70fe3a20deed",
    },
    [NetworkID.Testnet]: {
      bondAddress: "",
      reserveAddress: "",
    },
  },
  lpUrl:
    "https://swap.spiritswap.finance/#/add/0x04068DA6C83AFCFA0e13ba15A6696662335D5B75/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0",
});

// HOW TO ADD A NEW BOND:
// Is it a stableCoin bond? use `new StableBond`
// Is it an LP Bond? use `new LPBond`
// Add new bonds to this array!!
export const allBonds = [ dailp, usdc,  dai];
export const allBondsMap = allBonds.reduce((prevVal, bond) => {
  return { ...prevVal, [bond.name]: bond };
}, {});

// Debug Log
// console.log(allBondsMap);
export default allBonds;
