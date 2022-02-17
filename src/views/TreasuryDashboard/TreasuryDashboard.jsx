import { useEffect, useState } from "react";
import styled from 'styled-components';
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useSelector } from "react-redux";
import Chart from "../../components/Chart/Chart.jsx";
import { trim, formatCurrency } from "../../helpers";
import {
  treasuryDataQuery,
  rebasesV1DataQuery,
  rebasesV2DataQuery,
  bulletpoints,
  tooltipItems,
  tooltipInfoMessages,
  itemType,
} from "./treasuryData.js";
import { useTheme } from "@material-ui/core/styles";
import "./treasury-dashboard.scss";
import apollo from "../../lib/apolloClient";
import InfoTooltip from "src/components/InfoTooltip/InfoTooltip.jsx";
import { allBondsMap } from "src/helpers/AllBonds";

function TreasuryDashboard() {
  const [data, setData] = useState(null);
  const [apy, setApy] = useState([]);
  const [runway, setRunway] = useState(null);
  const [staked, setStaked] = useState(null);
  const theme = useTheme();
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });
  const circSupply = useSelector(state => {
    return state.app.circSupply;
  });
  const totalSupply = useSelector(state => {
    return state.app.totalSupply;
  });
  const marketCap = useSelector(state => {
    return state.app.marketCap;
  });
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });
  const rebase = useSelector(state => {
    return state.app.stakingRebase;
  });
  const backingPerGla = useSelector(state => {
    if (state.bonding.loading === false) {
      let tokenBalances = 0;
      for (const bond in allBondsMap) {
        if (state.bonding[bond]) {
          tokenBalances += state.bonding[bond].purchased;
        }
      }
      return tokenBalances / state.app.circSupply;
    }
  });

  const wsGlaPrice = useSelector(state => {
    return state.app.marketPrice * state.app.currentIndex;
  });

  const CustomBox = styled(Box)`    
    border: 1.6px solid #bd8d14;
    border-radius: 16px;
    margin-top: 30px !important;
    min-height: 100px;
    font-weight: 500;
    width:100%;
  `;

  const CustomTypography = styled(Typography)`
    color:#ffb700;
  `

  const CustomSkeleton = styled(Skeleton)`
    width: 80%;
    margin: auto;
  `

  return (
    <div id="treasury-dashboard-view" className={`${smallerScreen && "smaller"} ${verySmallScreen && "very-small"}`}>
      <Container
        style={{
          paddingLeft: smallerScreen || verySmallScreen ? "0" : "3.3rem",
          paddingRight: smallerScreen || verySmallScreen ? "0" : "3.3rem",
        }}
      >
        
        <Typography variant="h2" style={{"color":"#5df8ac", "padding-bottom":"20px"}} >
         <li>Dashboard</li> 
        </Typography>
        <Box className={`hero-metrics`}>
          <Paper className="gla-card">
            <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center">
              <CustomBox className="metric market">
                <Typography variant="h6" color="white">
                  Market Cap
                </Typography>
                <CustomTypography variant="h3">
                  {marketCap && formatCurrency(marketCap, 0)}
                  {/* {!marketCap && <Skeleton type="text" />} */}
                </CustomTypography>
              </CustomBox>

              <CustomBox className="metric price">
                <Typography variant="h6" color="white">
                  SDD Price
                </Typography>
                <CustomTypography variant="h3">
                  {/* appleseed-fix */}
                  {marketPrice ? formatCurrency(marketPrice, 2) : <CustomSkeleton type="text"  />}
                </CustomTypography>
              </CustomBox>

              <CustomBox className="metric wsoprice">
                <Typography variant="h6" color="white">
                  wsSDD Price
                  <InfoTooltip
                    message={
                      "wsSDD = sSDD * index\n\nThe price of wsSDD is equal to the price of SDD multiplied by the current index"
                    }
                  />
                </Typography>

                <CustomTypography variant="h3">
                  {wsGlaPrice ? formatCurrency(wsGlaPrice, 2) : <CustomSkeleton type="text" />}
                </CustomTypography>
              </CustomBox>

              <CustomBox className="metric circ">
                <Typography variant="h6" color="white">
                  Circulating Supply (total)
                </Typography>
                <CustomTypography variant="h3">
                  {/* {circSupply && totalSupply ? (
                    parseInt(circSupply) + " / " + parseInt(totalSupply)
                  ) : (
                    <CustomSkeleton type="text" />
                  )} */}
                  {parseInt(1000) + " / " + new Intl.NumberFormat("en-US").format(1000000)}
                </CustomTypography>
              </CustomBox>

              <CustomBox className="metric bpo">
                <Typography variant="h6" color="white">
                  Backing per SDD
                </Typography>
                <CustomTypography variant="h3">
                  {backingPerGla ? formatCurrency(backingPerGla, 2) : <CustomSkeleton type="text"  width="80%" style={{"margin":"auto"}} />}
                </CustomTypography>
              </CustomBox>

              <CustomBox className="metric index">
                <Typography variant="h6" color="white">
                  Current Index
                  <InfoTooltip
                    message={
                      "The current index tracks the amount of sSDD accumulated since the beginning of staking. Basically, how much sSDD one would have if they staked and held a single SDD from day 1."
                    }
                  />
                </Typography>
                <CustomTypography variant="h3">
                  {currentIndex ? trim(currentIndex, 2) + " sSDD" : <CustomSkeleton type="text" />}
                </CustomTypography>
              </CustomBox>
            </Box>
          </Paper>
        </Box>
      </Container>
    </div>
  );
}

export default TreasuryDashboard;
