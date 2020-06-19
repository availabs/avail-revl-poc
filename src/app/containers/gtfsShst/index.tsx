import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import { requestGtfsNetwork } from "./actions";

import MapboxMap from "./MapboxMap";
import ShapesSummaryTable from "./ShapesSummaryTable";

import useStyles from "../../styles/useStyles";

export default function GtfsShstView() {
  const dispatch = useDispatch();

  const classes = useStyles();

  // https://stackoverflow.com/a/57530482/3970755 (dispatch function identity is stable)
  // https://github.com/facebook/create-react-app/issues/6880#issuecomment-486636121
  useEffect(() => {
    console.log("REQUEST NETWORK SIDE EFFECT");

    dispatch(requestGtfsNetwork());
  }, [dispatch]);

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          {/* Chart */}
          <Grid item lg={12}>
            <Paper className={classes.paper} style={{ height: 800 }}>
              <MapboxMap />
            </Paper>
          </Grid>
          {/* Table */}
          <Grid item lg={12}>
            <Paper className={classes.paper}>
              <ShapesSummaryTable />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
