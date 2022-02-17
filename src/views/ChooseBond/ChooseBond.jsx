import { useSelector } from "react-redux";
import styled from 'styled-components';
import { useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Zoom,
} from "@material-ui/core";
import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import { BondDataCard, BondTableData } from "./BondRow";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { formatCurrency } from "../../helpers";
import useBonds from "../../hooks/Bonds";
import "./choosebond.scss";
import { Skeleton } from "@material-ui/lab";
import ClaimBonds from "./ClaimBonds";
import _ from "lodash";
import { allBondsMap } from "src/helpers/AllBonds";

function ChooseBond() {
  const { bonds } = useBonds();
  const isSmallScreen = useMediaQuery("(max-width: 733px)"); // change to breakpoint query
  const isVerySmallScreen = useMediaQuery("(max-width: 420px)");

  const isAppLoading = useSelector(state => state.app.loading);
  const isAccountLoading = useSelector(state => state.account.loading);

  const accountBonds = useSelector(state => {
    const withInterestDue = [];
    for (const bond in state.account.bonds) {
      if (state.account.bonds[bond].interestDue > 0) {
        withInterestDue.push(state.account.bonds[bond]);
      }
    }
    return withInterestDue;
  });

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });

  const treasuryBalance = useSelector(state => {
    if (state.bonding.loading == false) {
      let tokenBalances = 0;
      for (const bond in allBondsMap) {
        if (state.bonding[bond]) {
          tokenBalances += state.bonding[bond].purchased;
        }
      }
      return tokenBalances;
    }
  });

  const CustomHeader = styled(Typography)`
    color: #5df8ac;
    padding-bottom: 20px;
  `

  const CustomBox = styled.div`    
    border: 1.6px solid #bd8d14;
    border-radius: 16px;
    padding: 20px 0px;
    font-weight: 500;
    text-align:center;
    width: 90%;
    margin-left: 5%;
  `;  

  const CustomTypography = styled(Typography)`
    color:#ffb700;
    font-size: 24px;
  `
  return (
    <>
      <div id="choose-bond-view">
      <div style={{width: "100%"}} className={`gla-card`} align="left">
        <CustomHeader variant="h2">
          <li>Bond</li> 
        </CustomHeader>
         
        </div>
        {!isAccountLoading && !_.isEmpty(accountBonds) && <ClaimBonds activeBonds={accountBonds} />}

        <Zoom in={true}>
          <Paper className="gla-card">
            <Box className="card-header">
              <RebaseTimer />
            </Box>

            <Grid container item xs={12} style={{ margin: "10px 0px 20px" }} className="bond-hero">
              <Grid item xs={6}>
                <CustomBox textAlign={`${isVerySmallScreen ? "left" : "center"}`}>
                  <Typography variant="h5" color="white" style={{"margin-bottom":"20px"}}>
                    Treasury Balance
                  </Typography>
                  <CustomTypography variant="h2">
                    {/* {isAppLoading ? (
                      <Skeleton width="180px" />
                    ) : (
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      }).format(treasuryBalance)
                    )} */}
                    {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      }).format(123456789)}
                  </CustomTypography>
                </CustomBox>
              </Grid>

              <Grid item xs={6} className={`gla-price`}>
                <CustomBox textAlign={`${isVerySmallScreen ? "right" : "center"}`}>
                  <Typography variant="h5" color="white" style={{"margin-bottom":"20px"}}>
                    SDD Price
                  </Typography>
                  <CustomTypography variant="h2">
                    {isAppLoading ? <Skeleton width="100px" /> : formatCurrency(marketPrice, 2)}
                  </CustomTypography>
                </CustomBox>
              </Grid>
            </Grid>

            {!isSmallScreen && (
              <Grid container item>
                <TableContainer>
                  <Table aria-label="Available bonds" style={{"margin": "0px"}} >
                    <TableHead style={{background:"#21221a", "color":"#f1b90c", height:"60px"}}>
                      <TableRow>
                        <TableCell align="center">Bond</TableCell>
                        <TableCell align="left">Price</TableCell>
                        <TableCell align="left">ROI (5 days)</TableCell>
                        <TableCell align="right">Purchased</TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody >
                      {bonds
                        .filter(bond => !bond.isFour)
                        .map(bond => (
                          <BondTableData key={bond.name} bond={bond} />
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Paper>
        </Zoom>

        {isSmallScreen && (
          <Box className="gla-card-container">
            <Grid container item spacing={2}>
              {bonds
                .filter(bond => !bond.isFour)
                .map(bond => (
                  <Grid item xs={12} key={bond.name}>
                    <BondDataCard key={bond.name} bond={bond} />
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </div>
      {/* <div id="choose-bond-view">
        <Zoom in={true}>
          <Paper className="gla-card">
            <Box className="card-header">
              <Typography variant="h5">Bond (4,4)</Typography>
            </Box>

            {!isSmallScreen && (
              <Grid container item>
                <TableContainer>
                  <Table aria-label="Available bonds">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Bond</TableCell>
                        <TableCell align="left">Price</TableCell>
                        <TableCell align="left">ROI (4 days)</TableCell>
                        <TableCell align="right">Purchased</TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bonds
                        .filter(bond => bond.isFour)
                        .map(bond => (
                          <BondTableData key={bond.name} bond={bond} />
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Paper>
        </Zoom>

        {isSmallScreen && (
          <Box className="gla-card-container">
            <Grid container item spacing={2}>
              {bonds
                .filter(bond => bond.isFour)
                .map(bond => (
                  <Grid item xs={12} key={bond.name}>
                    <BondDataCard key={bond.name} bond={bond} />
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </div> */}
    </>
  );
}

export default ChooseBond;
