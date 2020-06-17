// https://github.com/mui-org/material-ui/tree/master/docs/src/pages/getting-started/templates/dashboard

import React from "react";
import { Switch, Route, Link } from "react-router-dom";

import Typography from "@material-ui/core/Typography";

import clsx from "clsx";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import CardMedia from "@material-ui/core/CardMedia";

import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import HomeIcon from "@material-ui/icons/Home";
import RepeatIcon from "@material-ui/icons/Repeat";
import DirectionsBusIcon from "@material-ui/icons/DirectionsBus";

import FizzBuzz from "./containers/fizzBuzz/index";
import GtfsShst from "./containers/gtfsShst/index";

import useStyles from "./useStyles";

import logo from "./images/avail.png";

const navListItems = (
  <div>
    <ListItem button component={Link} to="/">
      <ListItemIcon>
        <HomeIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>

    <ListItem button component={Link} to="/fizz-buzz">
      <ListItemIcon>
        <RepeatIcon />
      </ListItemIcon>
      <ListItemText primary="FizzBuzz Demo" />
    </ListItem>

    <ListItem button component={Link} to="/gtfs-sharedstreets-conflation">
      <ListItemIcon>
        <DirectionsBusIcon />
      </ListItemIcon>
      <ListItemText primary="GTFS/Shst" />
    </ListItem>
  </div>
);

function Home() {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.container}>
      <CardMedia image={logo} style={{ height: 500, width: 1000 }} />
    </Container>
  );
}

function Dashboard() {
  const [open, setOpen] = React.useState(true);

  const classes = useStyles();

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(
              classes.menuButton,
              open && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            AVAIL REVL Prototype
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <Divider />
        <List>{navListItems}</List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/fizz-buzz" component={FizzBuzz} />
          <Route
            exact
            path="/gtfs-sharedstreets-conflation"
            component={GtfsShst}
          />
        </Switch>
      </main>
    </div>
  );
}

export default function App() {
  return (
    // https://material-ui.com/api/container/#main-content
    <Dashboard />
  );
}
// export default function App() {
// return (
// // https://material-ui.com/api/container/#main-content
// <Container maxWidth={false}>
// <Box my={4}>
// <Typography variant="h4" component="h1" gutterBottom>
// Foo AVAIL REVL Prototype
// </Typography>
// <div>
// <nav>
// <ul>
// <li>
// <Link to="/">Home</Link>
// </li>
// <li>
// <Link to="/websocket-demo">WebSocket Demo</Link>
// </li>
// <li>
// <Link to="/gtfs-shst">GTFS SharedStreets Matching</Link>
// </li>
// </ul>
// </nav>

// {[> A <Switch> looks through its children <Route>s and
// renders the first one that matches the current URL. */}
// <Switch>
// <Route exact path="/" component={Dashboard} />
// <Route exact path="/websocket-demo" component={FizzBuzz} />
// <Route exact path="/gtfs-shst" component={GtfsShst} />
// </Switch>
// </div>
// </Box>
// </Container>
// );
// }
