import { useCallback, useState } from "react";
import styled from 'styled-components';
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
  Zoom,
} from "@material-ui/core";
import NewReleases from "@material-ui/icons/NewReleases";
import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import TabPanel from "../../components/TabPanel";
import { trim } from "../../helpers";
import { changeApproval, changeStake } from "../../slices/StakeThunk";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./stake.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import { error } from "../../slices/MessagesSlice";
import { ethers, BigNumber } from "ethers";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function Stake() {
  const dispatch = useDispatch();
  const { provider, address, connected, connect, chainID } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const view1 = 0;
  const [quantity, setQuantity] = useState("");

  const isAppLoading = useSelector(state => state.app.loading);
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });
  const fiveDayRate = useSelector(state => {
    return state.app.fiveDayRate;
  });
  const glaBalance = useSelector(state => {
    return state.account.balances && state.account.balances.gla;
  });
  const sglaBalance = useSelector(state => {
    return state.account.balances && state.account.balances.sgla;
  });
  const stakeAllowance = useSelector(state => {
    return state.account.staking && state.account.staking.glaStake;
  });
  const unstakeAllowance = useSelector(state => {
    return state.account.staking && state.account.staking.glaUnstake;
  });
  const stakingRebase = useSelector(state => {
    return state.app.stakingRebase;
  });
  const stakingAPY = useSelector(state => {
    return state.app.stakingAPY;
  });
  const stakingTVL = useSelector(state => {
    return state.app.stakingTVL;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(glaBalance);
    } else {
      setQuantity(sglaBalance);
    }
  };

  const onSeekApproval = async token => {
    await dispatch(changeApproval({ address, token, provider, networkID: chainID }));
  };

  const onChangeStake = async (action) => {
    // eslint-disable-next-line no-restricted-globals
    let value, unstakedVal;
    value = quantity;
    unstakedVal = sglaBalance;
    if (isNaN(value) || value === 0 || value === "") {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }

    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(value, "gwei");
    if (action === "stake" && gweiValue.gt(ethers.utils.parseUnits(glaBalance, "gwei"))) {
      return dispatch(error("You cannot stake more than your SDD balance."));
    }

    if (action === "unstake" && gweiValue.gt(ethers.utils.parseUnits(unstakedVal, "gwei"))) {
      return dispatch(error("You cannot unstake more than your sSDD balance."));
    }
    await dispatch(
      changeStake({
        address,
        action,
        value: value.toString(),
        provider,
        networkID: chainID,
        callback: () => (setQuantity("")),
      }),
    );
  };

  const hasAllowance = useCallback(
    token => {
      if (token === "gla") return stakeAllowance > 0;
      if (token === "sgla") return unstakeAllowance > 0;
      return 0;
    },
    [stakeAllowance, unstakeAllowance],
  );

  const isAllowanceDataLoading = (stakeAllowance == null && view === 0) || (unstakeAllowance == null && view === 1);

  let modalButton = [];

  modalButton.push(
    <Button variant="contained"  className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  );

  const changeView = (event, newView) => {
    setView(newView);
  };

  const trimmedBalance = Number(
    [sglaBalance]
      .filter(Boolean)
      .map(balance => Number(balance))
      .reduce((a, b) => a + b, 0)
      .toFixed(4),
  );
  const trimmedStakingAPY = trim(stakingAPY * 100, 1);
  const stakingRebasePercentage = trim(stakingRebase * 100, 4);
  const nextRewardValue = trim((stakingRebasePercentage / 100) * trimmedBalance, 4);

  
  const CustomBox = styled.div`    
    border: 1.6px solid #bd8d14;
    border-radius: 16px;
    padding: 20px 0px;
    font-weight: 500;
    text-align:center;
  `;

  
  const CustomTypography = styled(Typography)`
    color:#ffb700;
    font-size: 24px;
  `

  const CustomTab = styled(Tab)`
    border-radius: 16px;
    background: #ff0000
  `

  const CustomHeader = styled(Typography)`
    color: #5df8ac;
    padding-bottom: 20px;
  `


  return (
    <>
      <div id="stake-view">
        <div style={{width: "100%"}} className={`gla-card`} align="left">
        <CustomHeader variant="h2" >
          <li>Staking</li> 
        </CustomHeader>
         
        </div>
        <Zoom in={true} onEntered={() => setZoomed(true)}>
          <Paper className={`gla-card`}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <div className="card-header">
                  
                  <RebaseTimer />
                </div>
              </Grid>

              <Grid item>
                <div className="stake-top-metrics">
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={4} md={4} lg={4}>
                      <CustomBox className="stake-apy">
                        <Typography variant="h5" color="textSecondary">
                          APY
                        </Typography>
                        <CustomTypography variant="h4">
                          {/* {stakingAPY ? (
                            <>{new Intl.NumberFormat("en-US").format(trimmedStakingAPY)}%</>
                          ) : (
                            <Skeleton width="150px" />
                          )} */}
                          <>{new Intl.NumberFormat("en-US").format(123456789)}%</>
                        </CustomTypography>
                      </CustomBox>
                    </Grid>

                    <Grid item xs={12} sm={4} md={4} lg={4}>
                      <CustomBox className="stake-tvl">
                        <Typography variant="h5" color="textSecondary">
                          Total Value Deposited
                        </Typography>
                        <CustomTypography variant="h4">
                          {/* {stakingTVL ? (
                            new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                              minimumFractionDigits: 0,
                            }).format(stakingTVL)
                          ) : (
                            <Skeleton width="150px" />
                          )} */}
                          {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                              minimumFractionDigits: 0,
                            }).format(123456789)
                          }
                        </CustomTypography>
                      </CustomBox>
                    </Grid>

                    <Grid item xs={12} sm={4} md={4} lg={4}>
                      <CustomBox className="stake-index">
                        <Typography variant="h5" color="textSecondary">
                          Current Index
                        </Typography>
                        <CustomTypography variant="h3">
                          {currentIndex ? <>{trim(currentIndex, 2)} SDD</> : <Skeleton width="150px" />}
                        </CustomTypography>
                      </CustomBox>
                    </Grid>
                  </Grid>
                </div>
              </Grid>

              <div className="staking-area">
                {!address ? (
                  <div className="stake-wallet-notification">
                    <div className="wallet-menu" id="wallet-menu">
                      {modalButton}
                    </div>
                    <Typography variant="h6">Connect your wallet to stake SDD</Typography>
                  </div>
                ) : (
                  <>
                    <Box className="stake-action-area">
                      <Tabs
                        key={String(zoomed)}
                        centered
                        value={view}
                        textColor="primary"
                        backgroundColor="primary"
                        indicatorColor="primary"
                        className="stake-tab-buttons"
                        onChange={changeView}
                        aria-label="stake tabs"
                      >
                        
                        <CustomTab label="Stake"  {...a11yProps(0)} />
                        <CustomTab label="Unstake" {...a11yProps(1)} />
                      </Tabs>

                      <Box className="stake-action-row" display="flex" flexDirection={"column"} >
                        {address && !isAllowanceDataLoading ? (
                          (!hasAllowance("gla") && view === 0) || (!hasAllowance("sgla") && view === 1) ? (
                            <Box className="help-text">
                              <Typography variant="body1" className="stake-note" color="white" style={{"font-size":"16px"}}>
                                {view === 0 ? (
                                  <>
                                    First time staking <b>SDD</b>?
                                    <br />
                                    Please approve Gla Dao to use your <b>SDD</b> for staking.
                                  </>
                                ) : (
                                  <>
                                    First time unstaking <b>sSDD</b>?
                                    <br />
                                    Please approve Gla Dao to use your <b>sSDD</b> for unstaking.
                                  </>
                                )}
                              </Typography>
                            </Box>
                          ) : (
                            <FormControl className="gla-input" variant="outlined" color="primary">
                              <InputLabel htmlFor="amount-input"></InputLabel>
                              <OutlinedInput
                                id="amount-input"
                                type="number"
                                placeholder="Enter an amount"
                                className="stake-input"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                labelWidth={0}
                                endAdornment={
                                  <InputAdornment position="end">
                                    <Button variant="text" onClick={setMax} color="inherit">
                                      Max
                                    </Button>
                                  </InputAdornment>
                                }
                              />
                            </FormControl>
                          )
                        ) : (
                          <Skeleton width="150px" />
                        )}

                        <TabPanel value={view} index={0} className="stake-tab-panel">
                          {isAllowanceDataLoading ? (
                            <Skeleton />
                          ) : address && hasAllowance("gla") ? (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "staking")}
                              onClick={() => {
                                onChangeStake("stake", false);
                              }}
                            >
                              {txnButtonText(pendingTransactions, "staking", "Stake SDD")}
                            </Button>
                          ) : (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "approve_staking")}
                              onClick={() => {
                                onSeekApproval("gla");
                              }}
                            >
                              {txnButtonText(pendingTransactions, "approve_staking", "Approve")}
                            </Button>
                          )}
                        </TabPanel>
                        <TabPanel value={view} index={1} className="stake-tab-panel">
                          {isAllowanceDataLoading ? (
                            <Skeleton />
                          ) : address && hasAllowance("sgla") ? (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "unstaking")}
                              onClick={() => {
                                onChangeStake("unstake", false);
                              }}
                            >
                              {txnButtonText(pendingTransactions, "unstaking", "Unstake SDD")}
                            </Button>
                          ) : (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "approve_unstaking")}
                              onClick={() => {
                                onSeekApproval("sgla");
                              }}
                            >
                              {txnButtonText(pendingTransactions, "approve_unstaking", "Approve")}
                            </Button>
                          )}
                        </TabPanel>
                      </Box>
                    </Box>

                    <div className={`stake-user-data`}>
                      <div className="data-row">
                        <Typography variant="body1">Your Balance</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trim(glaBalance, 4)} SDD</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">Your Staked Balance</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trimmedBalance} sSDD</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">Next Reward Amount</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{nextRewardValue} sSDD</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">Next Reward Yield</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{stakingRebasePercentage}%</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">ROI (5-Day Rate)</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trim(fiveDayRate * 100, 4)}%</>}
                        </Typography>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Grid>
          </Paper>
        </Zoom>
      </div>
    </>
  );
}

export default Stake;
