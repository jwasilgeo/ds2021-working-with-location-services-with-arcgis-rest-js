import {
  IQueryDemographicDataOptions,
  queryDemographicData,
} from "@esri/arcgis-rest-demographics";
import { ApiKey } from "@esri/arcgis-rest-auth";

/**
 * Given a point and a data collection, return the intersecting county and the data about it
 * @param point latitude (y) and longitude (x)
 * @param id data collection id
 */
export async function queryData(
  point: { x: number; y: number },
  id: string
) {
  const params: IQueryDemographicDataOptions = {
    endpoint:
      "https://geoenrichdev.arcgis.com/arcgis/rest/services/World/geoenrichmentserver/Geoenrichment",

    // The study area gives us the US county that intersects the point that was clicked
    studyAreas: [
      {
        geometry: point,
        areaType: "StandardGeography",
        intersectingGeographies: [
          { sourceCountry: "US", layer: "US.Counties" },
        ],
      },
    ],

    // Return the shape of the county so we can display it on the map
    returnGeometry: true,

    // This service requires authentication
    // Create the authentication object using the ApiKey constructor and our api key
    authentication: new ApiKey({
      key:
        "AAPK417a9d5e05744be7a15d991386e6fe27ang2GdR4fHMqWpTqth9GDXWbsET4-VBWZhfQvJ6wVOJroHUPHBLv_rYVwaPYb40m",
    }),
  };

  // If a data collection is specified, add it to the query parameters
  if (id) {
    params.dataCollections = [id];
  }

  const response = await queryDemographicData(params);

  // Extract out feature data and field labels
  const feature = response?.results?.[0].value.FeatureSet[0].features[0];
  const fields = response?.results?.[0].value.FeatureSet[0].fields;
  if (!feature || !fields) {
    return {};
  }

  const attributes = feature?.attributes;
  const geometry = feature?.geometry

  // Filter out unneeded fields and format them for displaying
  const data = Object.keys(attributes)
    .filter((key, index) => key === "StdGeographyName" || index >= 10)
    .map((key) => {
      const field = fields.find((field) => field.name === key);
      const isNumber =
        field?.type === "esriFieldTypeDouble" ||
        field?.type === "esriFieldTypeInteger";
      const value = feature.attributes[key];
      const formattedValue = isNumber
        ? new Intl.NumberFormat("en-US").format(feature.attributes[key])
        : value;
      return {
        label: field?.alias || "",
        value: formattedValue,
      };
    });

  return { attributes, geometry, data };
}
