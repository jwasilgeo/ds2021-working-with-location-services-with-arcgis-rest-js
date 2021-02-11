import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { IDataCollection } from "@esri/arcgis-rest-demographics";
import { loadModules } from "esri-loader";
import {
  Table,
  TableCell,
  TableRow,
  List,
  ListItem,
  TableBody,
} from "@material-ui/core";
import { queryData } from "./utils/query-data";
import { getDataCollections } from "./utils/get-collections";

function App() {
  const mapViewRef = useRef<__esri.MapView>();
  const [collections, setCollections] = useState<IDataCollection[]>([]);
  const [activePoint, setActivePoint] = useState<{ x: number; y: number }>();
  const [activeCollection, setActiveCollection] = useState<string>("");
  const [activeData, setActiveData] = useState<
    { label: string; value: string }[]
  >();

  async function getCollections() {
    const response = await getDataCollections();
    setCollections(response);
  }

  // Set up the map view
  async function loadMap() {
    const [Map, MapView] = await loadModules(
      ["esri/Map", "esri/views/MapView"],
      { css: true }
    );
    const map = new Map({
      basemap: "gray-vector",
    });
    mapViewRef.current = new MapView({
      container: "map",
      map,
      zoom: 6,
      center: { x: -120.5, y: 44 },
    });

    // Whenever the user click on the map, update the active point
    mapViewRef.current?.on("click", (event) => {
      setActivePoint({
        y: event.mapPoint.latitude,
        x: event.mapPoint.longitude,
      });
    });
  }

  async function query(point: { x: number; y: number }, id: string) {
    const { attributes, geometry, data } = await queryData(point, id);

    if (!attributes || !geometry || !data) {
      return;
    }

    setActiveData(data);

    // Add the geometry of the returned county to the map as a graphic
    // after removing the existing graphic.
    const [Graphic] = await loadModules(["esri/Graphic"]);
    mapViewRef.current?.graphics.removeAll();
    mapViewRef.current?.graphics.add(
      new Graphic({
        attributes,
        geometry: {
          ...geometry,
          type: "polygon",
        },
        symbol: {
          type: "simple-fill",
          color: [1, 133, 212, 0.25],
        },
      })
    );
  }

  // Whenever the user changes clicks on the map or changes
  // the data collection, run another query
  useEffect(() => {
    if (activePoint) {
      query(activePoint, activeCollection);
    }
  }, [activePoint, activeCollection]);

  // When the app loads, query all the data collection and
  // set up the map view
  useEffect(() => {
    getCollections();
    loadMap();
  }, []);

  return (
    <>
      <div className="view">
        <List className="collection" disablePadding>
          <ListItem
            button
            selected={!activeCollection}
            onClick={() => setActiveCollection("")}
          >
            Default
          </ListItem>
          {collections.map((collection) => (
            <ListItem
              button
              key={collection.dataCollectionID}
              selected={activeCollection === collection.dataCollectionID}
              onClick={() => setActiveCollection(collection.dataCollectionID)}
            >
              {collection.metadata.title}
            </ListItem>
          ))}
        </List>
        <div id="map" className="map"></div>
        <div className="data">
          {activeData ? (
            <Table>
              <TableBody>
                {activeData.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell component="th" scope="row">
                      {row.label}
                    </TableCell>
                    <TableCell align="right">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="placeholder">
              Click on the map to select a US county. You can select different
              data collections in the left-side panel. The data will display
              here.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
