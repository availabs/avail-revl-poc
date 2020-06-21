// https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
// https://docs.mapbox.com/mapbox-gl-js/example/live-update-feature/
// https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions
// https://docs.mapbox.com/help/glossary/data-driven-styling/

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

// https://stackoverflow.com/q/50909438/3970755
import "mapbox-gl/dist/mapbox-gl.css";

import * as turf from "@turf/turf";

import { gtfsShapesSelected, gtfsShapesSelectedReset } from "../actions";
import {
  selectGtfsNetworkEdges,
  getSelectedGtfsShapes,
  getShstMatches,
} from "../selectors";

import { MAPBOX_ACCESS_TOKEN } from "../../../secrets";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const AVAIL_LAT = 42.676631;
const AVAIL_LON = -73.821632;
const ZOOM = 14;

const target_map_lines = "target_map_lines";
const shst_matches = "shst_matches";

const shstMatchesLayer = {
  id: shst_matches,
  type: "line",
  source: shst_matches,
  paint: {
    "line-color": "blue",
    "line-opacity": 0.75,
    "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 3],
    // https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#camera-expressions
    // TODO:
    //   Data driven style, offset increases by pp_match_index
    //   https://stackoverflow.com/a/56376824/3970755
    "line-offset": ["interpolate", ["linear"], ["zoom"], 8, 0, 14, 3],
  },
};

// https://docs.mapbox.com/api/maps/#mapbox-styles
// const style = "mapbox://styles/mapbox/satellite-streets-v11";
const style = "mapbox://styles/mapbox/dark-v10";

export default function MapboxMap() {
  const [map, setMap]: [any, Dispatch<SetStateAction<null>>] = useState(null);

  const dispatch = useDispatch();

  const gtfsNetworkEdges = useSelector(selectGtfsNetworkEdges);
  const selectedGtfsShapes: string[] | null = useSelector(
    getSelectedGtfsShapes
  );

  const shstMatches = useSelector(getShstMatches);

  // https://reactjs.org/docs/hooks-reference.html#useref
  const mapEl = useRef(null);

  // Initialize the target_map_lines layer. Fired once, on component mount.
  useEffect(() => {
    console.log("target_map_lines initialization");

    const _map: any = new mapboxgl.Map({
      // Happens after render, and therefore after React has
      //   set mapEl.current to the corresponding DOM node.
      // The empty string is just for passing the typechecker.
      container: mapEl.current || "",
      style,
      center: [AVAIL_LON, AVAIL_LAT],
      zoom: ZOOM,
    });

    // https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/#set-the-apps-default-state
    _map.on("load", () => {
      _map.addSource(target_map_lines, { type: "geojson", data: null });

      // const foo = [
      // "case",
      // [
      // "all",
      // ["==", ["get", "matched"], "True"],
      // ["!=", ["get", "vehicle"], ["get", "standstill_vehicle"]],
      // ],
      // "orangemarker",
      // ["==", ["get", "matched"], "True"],
      // "greenmarker",
      // "redmarker",
      // ];

      _map.addLayer({
        id: target_map_lines,
        type: "line",
        source: target_map_lines,
        paint: {
          "line-color": "red",
          "line-opacity": 0.75,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 3],
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#camera-expressions
          "line-offset": ["interpolate", ["linear"], ["zoom"], 8, 0, 14, 3],
        },
      });

      // https://docs.mapbox.com/mapbox-gl-js/example/popup-on-hover/
      // Create a popup, but don't add it to the map yet.
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      _map.on("mouseenter", target_map_lines, (e: any) => {
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

      _map.on("mouseleave", target_map_lines, () => {
        _map.getCanvas().style.cursor = "";
        popup.remove();
      });

      // https://docs.mapbox.com/mapbox-gl-js/example/polygon-popup-on-click/
      // https://docs.mapbox.com/mapbox-gl-js/example/queryrenderedfeatures-around-point/
      _map.on("click", (e: any) => {
        const bbox = [e.point.x, e.point.y, e.point.x, e.point.y];
        // https://docs.mapbox.com/mapbox-gl-js/api/map/#map#queryrenderedfeatures
        const features = _map.queryRenderedFeatures(bbox, {
          layers: [target_map_lines],
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

  // update the map's target_map_lines source layer when a new gtfsNetwork is provided.
  useEffect(() => {
    if (
      map !== null &&
      Array.isArray(gtfsNetworkEdges) &&
      gtfsNetworkEdges.length
    ) {
      console.log("target_map_lines source layer update");

      const featureCollection = turf.featureCollection(gtfsNetworkEdges);

      map.getSource(target_map_lines).setData(featureCollection);
    }
  }, [map, gtfsNetworkEdges]);

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
                ["id", "pp_id", "pp_shape_id"]
              ),
              { id: feature.id }
            )
          );

        const featureCollection = turf.featureCollection(shstFeatures);

        // // If performance becomes an issue, there are remedies.
        // //   https://docs.mapbox.com/help/troubleshooting/working-with-large-geojson-data/
        // //   http://bl.ocks.org/ryanbaumann/04c442906638e27db9da243f29195592
        map.addSource(shst_matches, {
          type: "geojson",
          data: featureCollection,
        });
        map.addLayer(shstMatchesLayer);
      } else if (map.style.getLayer(shst_matches)) {
        // https://github.com/visgl/react-map-gl/issues/474#issuecomment-371471634
        map.removeLayer(shst_matches);
        map.removeSource(shst_matches);
      }
    }
  }, [map, selectedGtfsShapes, shstMatches]);

  // update the map's target_map_lines filter when new selectedGtfsShapes
  // https://docs.mapbox.com/help/tutorials/create-interactive-hover-effects-with-mapbox-gl-js/
  // https://github.com/mapbox/mapbox-gl-js/issues/6876#issuecomment-401136352
  // https://docs.mapbox.com/mapbox-gl-js/api/map/#map#setfilter
  useEffect(() => {
    if (map !== null && Array.isArray(gtfsNetworkEdges)) {
      console.log("target_map_lines filters update");

      // Set the filter
      const shapeIds = selectedGtfsShapes || [];

      // https://github.com/mapbox/mapbox-gl-js/issues/7759#issuecomment-453034895
      const filter = shapeIds.length
        ? ["in", "shape_id"].concat(shapeIds)
        : false;

      map.setFilter(target_map_lines, filter);

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
  }, [map, gtfsNetworkEdges, selectedGtfsShapes]);

  return <div ref={mapEl} style={{ height: "97%", width: "100%" }} />;
}
