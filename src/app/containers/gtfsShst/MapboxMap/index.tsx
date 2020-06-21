// https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
// https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/
// https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions
// https://docs.mapbox.com/help/glossary/data-driven-styling/
// https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#camera-expressions
// https://stackoverflow.com/questions/46102553/showing-direction-arrow-on-line-in-mapboxgl

import React, {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";

import { useSelector, useDispatch } from "react-redux";

import _ from "lodash";
import mapboxgl from "mapbox-gl";

import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";

// https://stackoverflow.com/q/50909438/3970755
import "mapbox-gl/dist/mapbox-gl.css";

import * as turf from "@turf/turf";
import keyboardJS from "keyboardjs";

import useStyles from "../../../styles/useStyles";
import { gtfsShapesSelected, gtfsShapesSelectedReset } from "../actions";

import {
  selectGtfsNetworkEdges,
  getSelectedGtfsShapes,
  getGtfsShapeIds,
  getShstMatches,
} from "../selectors";

import { MAPBOX_ACCESS_TOKEN } from "../../../secrets";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const AVAIL_LAT = 42.676631;
const AVAIL_LON = -73.821632;
const ZOOM = 14;

const gtfs_network_edges = "gtfs_network_edges";
const gtfs_network_nodes = "gtfs_network_nodes";
const shst_matches = "shst_matches";

const shstMatchesLayer = {
  id: shst_matches,
  type: "line",
  source: shst_matches,
  paint: {
    "line-color": "blue",
    "line-opacity": 0.75,
    "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 3],
  },
};

// https://docs.mapbox.com/api/maps/#mapbox-styles
const mapboxDarkStyle = "mapbox://styles/mapbox/dark-v10";
// Tried, but wow!  https://github.com/mapbox/mapbox-gl-js/issues/4006
// const mapboxSatelliteStyle = "mapbox://styles/mapbox/satellite-streets-v11";

function fitMapBounds(
  map: any,
  gtfsNetworkEdges: any,
  selectedGtfsShapes: any
) {
  if (map !== null && Array.isArray(gtfsNetworkEdges)) {
    // Set the filter
    const shapeIds = selectedGtfsShapes || [];

    // https://github.com/mapbox/mapbox-gl-js/issues/7759#issuecomment-453034895
    const filter = shapeIds.length
      ? ["in", "shape_id"].concat(shapeIds)
      : false;

    map.setFilter(gtfs_network_edges, filter);
    map.setFilter(gtfs_network_nodes, filter);

    if (shapeIds.length) {
      // Set the bounds
      const shapesSet = new Set(shapeIds);

      const selectedFeatureCollection = turf.featureCollection(
        gtfsNetworkEdges.filter(({ properties: { shape_id } }) =>
          shapesSet.has(shape_id)
        )
      );

      const featuresBBox = turf.bbox(selectedFeatureCollection);

      const fSW = featuresBBox.slice(0, 2);
      const fNE = featuresBBox.slice(-2);

      const lonBuffer = (fNE[0] - fSW[0]) / 33;
      const latBuffer = (fNE[1] - fSW[1]) / 33;

      const sw = [fSW[0] - lonBuffer, fSW[1] - latBuffer];
      const ne = [fNE[0] + lonBuffer, fNE[1] + latBuffer];

      map.fitBounds([sw, ne]);
    }
  }
}

export default function MapboxMap() {
  const classes = useStyles();

  const [map, setMap]: [any, Dispatch<SetStateAction<null>>] = useState(null);
  const [showShstMatches, setShowShstMatches] = useState(true);
  const [explodeShstMatches, setExplodeShstMatches] = useState(false);
  const [keyBindingsEnabled, setKeyBindingsEnabled] = useState(true);

  const dispatch = useDispatch();

  const gtfsShapeIds = useSelector(getGtfsShapeIds);
  const gtfsNetworkEdges = useSelector(selectGtfsNetworkEdges);
  const selectedGtfsShapes: string[] | null = useSelector(
    getSelectedGtfsShapes
  );

  const shstMatches = useSelector(getShstMatches);

  // https://reactjs.org/docs/hooks-reference.html#useref
  const mapEl = useRef(null);

  // Initialize the gtfs_network_edges layer. Fired once, on component mount.
  useEffect(() => {
    const _map: any = new mapboxgl.Map({
      // Happens after render, and therefore after React has
      //   set mapEl.current to the corresponding DOM node.
      // The empty string is just for passing the typechecker.
      container: mapEl.current || "",
      style: mapboxDarkStyle,
      center: [AVAIL_LON, AVAIL_LAT],
      zoom: ZOOM,
    });

    // https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/#set-the-apps-default-state
    _map.on("load", () => {
      _map.addSource(gtfs_network_edges, { type: "geojson", data: null });
      _map.addSource(gtfs_network_nodes, { type: "geojson", data: null });

      _map.addLayer({
        id: gtfs_network_edges,
        type: "line",
        source: gtfs_network_edges,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "red",
          "line-opacity": 0.75,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 3],
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#camera-expressions
          "line-offset": ["interpolate", ["linear"], ["zoom"], 8, 0, 14, 3],
        },
      });

      _map.addLayer({
        id: gtfs_network_nodes,
        type: "circle",
        source: gtfs_network_nodes,
        paint: {
          "circle-color": "red",
          "circle-radius": {
            base: 1,
            stops: [
              [8, 1],
              [14, 5],
            ],
          },
        },
      });

      // https://docs.mapbox.com/mapbox-gl-js/example/popup-on-hover/
      // Create a popup, but don't add it to the map yet.
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      _map.on("mouseenter", gtfs_network_edges, (e: any) => {
        _map.getCanvas().style.cursor = "pointer";
        if (Array.isArray(e.features) && e.features.length > 0) {
          const popupTableRows = e.features.reduce(
            (acc: string, { properties: { shape_id, shape_index } }) =>
              `${acc}<tr><td>${shape_id}</td><td>${shape_index}</td></tr>`,
            ""
          );

          const html = `
            <table style="color:blue;text-align:center;">
              <thead>
                <tr>
                  <th>Shape ID</th>
                  <th>Segment #</th>
                <tr>
              </thead>
              <tbody>
                ${popupTableRows}
              </tbody>
            </table>`;

          popup.setLngLat(e.lngLat).setHTML(html).addTo(_map);
        }
      });

      _map.on("mouseleave", gtfs_network_edges, () => {
        _map.getCanvas().style.cursor = "";
        popup.remove();
      });

      // https://docs.mapbox.com/mapbox-gl-js/example/polygon-popup-on-click/
      // https://docs.mapbox.com/mapbox-gl-js/example/queryrenderedfeatures-around-point/
      _map.on("click", (e: any) => {
        const bbox = [e.point.x, e.point.y, e.point.x, e.point.y];
        // https://docs.mapbox.com/mapbox-gl-js/api/map/#map#queryrenderedfeatures
        const features = _map.queryRenderedFeatures(bbox, {
          layers: [gtfs_network_edges],
        });

        if (features.length === 0) {
          return dispatch(gtfsShapesSelectedReset());
        }

        const clickedShapeIds = _(features)
          .map("properties.shape_id")
          .uniq()
          .value();

        return dispatch(gtfsShapesSelected(clickedShapeIds));
      });

      setMap(_map);
    });
    // https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects
  }, [dispatch]);

  // update the map's gtfs_network_edges source layer when a new gtfsNetwork is provided.
  useEffect(() => {
    if (
      map !== null &&
      Array.isArray(gtfsNetworkEdges) &&
      gtfsNetworkEdges.length
    ) {
      const edgesFeatureCollection = turf.featureCollection(gtfsNetworkEdges);

      map.getSource(gtfs_network_edges).setData(edgesFeatureCollection);

      const stopsCache = {};

      for (let i = 0; i < gtfsNetworkEdges.length; ++i) {
        const gtfsNetEdge = gtfsNetworkEdges[i];

        const {
          properties: { shape_id },
        } = gtfsNetEdge;
        const coordinates = turf.getCoords(gtfsNetEdge);

        const startPoint = JSON.stringify(
          turf.point(
            _.first(coordinates).map((c: number) => _.round(c, 6)),
            { shape_id }
          )
        );
        const endPoint = JSON.stringify(
          turf.point(
            _.last(coordinates).map((c: number) => _.round(c, 6)),
            { shape_id }
          )
        );

        stopsCache[startPoint] = 1;
        stopsCache[endPoint] = 1;
      }

      const stops = Object.keys(stopsCache).map((str) => JSON.parse(str));
      const nodesFeatureCollection = turf.featureCollection(stops);

      map.getSource(gtfs_network_nodes).setData(nodesFeatureCollection);
    }
  }, [map, gtfsNetworkEdges]);

  // when the showShstMatches boolean changes, update the shst_matches filter
  useEffect(() => {
    if (map !== null && map.style.getLayer(shst_matches)) {
      map.setFilter(shst_matches, showShstMatches);
    }
  }, [map, showShstMatches]);

  // update the map's shst_matches source layer when a new shstMatches are provided.
  useEffect(() => {
    if (map !== null) {
      const singleSelectedShape =
        Array.isArray(selectedGtfsShapes) && selectedGtfsShapes.length === 1
          ? selectedGtfsShapes[0]
          : null;

      const selectedShapeShstMatches =
        singleSelectedShape && shstMatches[singleSelectedShape];

      if (selectedShapeShstMatches) {
        // https://docs.mapbox.com/help/troubleshooting/working-with-large-geojson-data/#cleaning-up-your-data
        const shstFeatures = _.flatten(_.values(selectedShapeShstMatches))
          .filter((feature) => {
            return _.get(feature, ["geometry", "coordinates", "length"], 0) > 1;
          })
          .map((feature) =>
            turf.lineString(
              turf
                .getCoords(feature)
                .map(([lon, lat]) => [_.round(lon, 6), _.round(lat, 6)]),
              _.pick(
                feature.properties,
                // id = match_id
                // pp_id = shape segment id
                // pp_shape_id = GTFS shape id
                ["id", "pp_id", "pp_shape_id", "pp_match_index"]
              ),
              { id: feature.id }
            )
          );

        const featureCollection = turf.featureCollection(shstFeatures);

        // // If performance becomes an issue, there are remedies.
        // //   https://docs.mapbox.com/help/troubleshooting/working-with-large-geojson-data/
        // //   http://bl.ocks.org/ryanbaumann/04c442906638e27db9da243f29195592
        if (map.style.getLayer(shst_matches)) {
          map.removeLayer(shst_matches);
          map.removeSource(shst_matches);
        }

        map.addSource(shst_matches, {
          type: "geojson",
          data: featureCollection,
        });

        map.addLayer(shstMatchesLayer);
        map.setFilter(shst_matches, showShstMatches);
      } else if (map.style.getLayer(shst_matches)) {
        // https://github.com/visgl/react-map-gl/issues/474#issuecomment-371471634
        map.removeLayer(shst_matches);
        map.removeSource(shst_matches);
      }
    }
  }, [map, selectedGtfsShapes, shstMatches, showShstMatches]);

  // update the map's style
  useEffect(() => {
    if (map !== null && map.style.getLayer(shst_matches)) {
      const offsetExpression = explodeShstMatches
        ? [
            "interpolate",
            ["linear"],
            ["zoom"],
            16,
            0,
            18,
            ["+", ["get", "pp_match_index"], 1],
          ]
        : ["interpolate", ["linear"], ["zoom"], 8, 0, 14, 3];
      map.setPaintProperty(shst_matches, "line-offset", offsetExpression);
    }
  }, [map, shstMatches, explodeShstMatches]);

  // update the map's gtfs_network_edges filter when new selectedGtfsShapes
  // https://docs.mapbox.com/help/tutorials/create-interactive-hover-effects-with-mapbox-gl-js/
  // https://github.com/mapbox/mapbox-gl-js/issues/6876#issuecomment-401136352
  // https://docs.mapbox.com/mapbox-gl-js/api/map/#map#setfilter
  useEffect(() => {
    if (map !== null && Array.isArray(gtfsNetworkEdges)) {
      fitMapBounds(map, gtfsNetworkEdges, selectedGtfsShapes);
    }
  }, [map, gtfsNetworkEdges, selectedGtfsShapes]);

  useEffect(() => {
    keyboardJS.reset();
    if (keyBindingsEnabled) {
      keyboardJS.bind("h", (e) => {
        if (e) {
          e.preventRepeat();
        }

        if (_.isEmpty(gtfsShapeIds)) {
          return null;
        }

        // If there are more than one selectedGtfsShapes, take the last one.
        if (
          Array.isArray(selectedGtfsShapes) &&
          selectedGtfsShapes.length > 1
        ) {
          return dispatch(gtfsShapesSelected([_.last(selectedGtfsShapes)]));
        }

        // If there is one selectedGtfsShapes, take the next one in the gtfsShapeIds list
        if (
          Array.isArray(gtfsShapeIds) &&
          Array.isArray(selectedGtfsShapes) &&
          selectedGtfsShapes.length === 1
        ) {
          const [curSelShpId] = selectedGtfsShapes;
          const curShpIdx = gtfsShapeIds.indexOf(curSelShpId);

          const nextShpId =
            curShpIdx === 0
              ? _.last(gtfsShapeIds)
              : gtfsShapeIds[curShpIdx - 1];

          return dispatch(gtfsShapesSelected([nextShpId]));
        }

        return dispatch(gtfsShapesSelected([_.last(gtfsShapeIds)]));
      });

      keyboardJS.bind("l", (e) => {
        if (e) {
          e.preventRepeat();
        }

        if (_.isEmpty(gtfsShapeIds)) {
          return null;
        }

        // If there are more than one selectedGtfsShapes, take the last one.
        if (
          Array.isArray(selectedGtfsShapes) &&
          selectedGtfsShapes.length > 1
        ) {
          return dispatch(gtfsShapesSelected([_.first(selectedGtfsShapes)]));
        }

        // If there is one selectedGtfsShapes, take the next one in the gtfsShapeIds list
        if (
          Array.isArray(gtfsShapeIds) &&
          Array.isArray(selectedGtfsShapes) &&
          selectedGtfsShapes.length === 1
        ) {
          const [curSelShpId] = selectedGtfsShapes;
          const curShpIdx = gtfsShapeIds.indexOf(curSelShpId);

          const nextShpId =
            curShpIdx === gtfsShapeIds.length - 1
              ? _.first(gtfsShapeIds)
              : gtfsShapeIds[curShpIdx + 1];

          return dispatch(gtfsShapesSelected([nextShpId]));
        }

        return dispatch(gtfsShapesSelected([_.last(gtfsShapeIds)]));
      });

      keyboardJS.bind("n", (e) => {
        if (e) {
          e.preventRepeat();
        }

        return setShowShstMatches(!showShstMatches);
      });

      keyboardJS.bind("m", (e) => {
        if (e) {
          e.preventRepeat();
        }

        return setExplodeShstMatches(!explodeShstMatches);
      });
    }
  }, [
    dispatch,
    keyBindingsEnabled,
    gtfsShapeIds,
    selectedGtfsShapes,
    setShowShstMatches,
    showShstMatches,
    setExplodeShstMatches,
    explodeShstMatches,
  ]);

  // https://reactjs.org/docs/hooks-effect.html#example-using-hooks-1
  useEffect(() => () => keyboardJS.reset(), []);

  const shstMatchesEnabled =
    Array.isArray(selectedGtfsShapes) && selectedGtfsShapes.length === 1;
  const header = (
    <FormGroup row>
      <Tooltip
        title={
          <Typography>
            Show the output of the conflation process for the selected GTFS
            shape.
            {shstMatchesEnabled
              ? ""
              : "(SharedStreets matches render when a single GTFS Shape is selected.)"}
          </Typography>
        }
      >
        <FormControlLabel
          control={
            <Switch
              disabled={!shstMatchesEnabled}
              checked={showShstMatches}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setShowShstMatches(event.target.checked);
              }}
            />
          }
          label="Show Matches"
        />
      </Tooltip>
      <Tooltip
        title={
          <Typography>
            If explode matches is enabled, matches for a GTFS network segment
            are offset at closer zoom levels for better visibility.
          </Typography>
        }
      >
        <FormControlLabel
          control={
            <Switch
              disabled={!shstMatchesEnabled || !showShstMatches}
              checked={explodeShstMatches}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setExplodeShstMatches(event.target.checked);
              }}
            />
          }
          label="Explode Matches"
        />
      </Tooltip>
      <Tooltip
        title={
          <Typography>
            Enable the GTFS shapes iteration keybindings. Pressing &quot;h&quot;
            selects the previous GTFS shape. Pressing &quot;l&quot; selects the
            next GTFS shape. &quot;n&quot; toggles the show matches option.
            &quot;m&quot; toggles the explode matches option.
          </Typography>
        }
      >
        <FormControlLabel
          control={
            <Switch
              checked={keyBindingsEnabled}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setKeyBindingsEnabled(event.target.checked);
              }}
            />
          }
          label="Enable Key Bindings"
        />
      </Tooltip>
    </FormGroup>
  );

  // https://material-ui.com/components/switches/#customized-switches
  return (
    <Paper className={classes.paper}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {header}
          <Paper className={classes.paper} />
        </Grid>
      </Grid>
      <div ref={mapEl} style={{ height: "800px", width: "100%" }} />
    </Paper>
  );
}
