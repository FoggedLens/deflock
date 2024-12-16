import axios from "axios";

export interface Cluster {
  id: string;
  lat: number;
  lon: number;
}

export interface BoundingBoxLiteral {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export class BoundingBox implements BoundingBoxLiteral {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;

  constructor({minLat, maxLat, minLng, maxLng}: BoundingBoxLiteral) {
    this.minLat = minLat;
    this.maxLat = maxLat;
    this.minLng = minLng;
    this.maxLng = maxLng;
  }

  containsPoint(lat: number, lng: number) {
    return lat >= this.minLat && lat <= this.maxLat && lng >= this.minLng && lng <= this.maxLng;
  }

  updateFromOther(boundingBoxLiteral: BoundingBoxLiteral) {
    this.minLat = boundingBoxLiteral.minLat;
    this.maxLat = boundingBoxLiteral.maxLat;
    this.minLng = boundingBoxLiteral.minLng;
    this.maxLng = boundingBoxLiteral.maxLng;
  }

  isSubsetOf(other: BoundingBoxLiteral) {
    return (
      this.minLat >= other.minLat &&
      this.maxLat <= other.maxLat &&
      this.minLng >= other.minLng &&
      this.maxLng <= other.maxLng
    );
  }
}

const apiService = axios.create({
  baseURL: window.location.hostname === "localhost" ? "http://localhost:8080/api" : "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getALPRs = async (boundingBox: BoundingBox) => {
  const queryParams = new URLSearchParams({
    minLat: boundingBox.minLat.toString(),
    maxLat: boundingBox.maxLat.toString(),
    minLng: boundingBox.minLng.toString(),
    maxLng: boundingBox.maxLng.toString(),
  });
  const response = await apiService.get(`/alpr?${queryParams.toString()}`);
  return response.data;
}

export const getSponsors = async () => {
  const response = await apiService.get("/sponsors/github");
  return response.data;
}

export const getALPRCounts = async () => {
  const s3Url = "https://deflock-clusters.s3.us-east-1.amazonaws.com/alpr-counts.json";
  const response = await apiService.get(s3Url);
  return response.data;
}

export const getClusters = async () => {
  const s3Url = "https://deflock-clusters.s3.us-east-1.amazonaws.com/alpr_clusters.json";
  const response = await apiService.get(s3Url);
  return response.data;
}

export const getCities = async () => {
  const s3Url = "https://deflock-clusters.s3.us-east-1.amazonaws.com/flock_cameras_null.json";
  const response = await apiService.get(s3Url);
  return response.data;
}

export const geocodeQuery = async (query: string, currentLocation: any) => {
  const encodedQuery = encodeURIComponent(query);
  const results = (await apiService.get(`/geocode?query=${encodedQuery}`)).data;

  function findNearestResult(results: any, currentLocation: any) {
    let nearestResult = results[0];
    let nearestDistance = Number.MAX_VALUE;
    for (const result of results) {
      const distance = Math.sqrt(
        Math.pow(result.lat - currentLocation.lat, 2) +
        Math.pow(result.lon - currentLocation.lng, 2)
      );
      if (distance < nearestDistance) {
        nearestResult = result;
        nearestDistance = distance;
      }
    }
    return nearestResult;
  }

  if (!results.length) return null;

  const cityStatePattern = /(.+),\s*(\w{2})/;
  const postalCodePattern = /\d{5}/;

  if (cityStatePattern.test(query)) {
    console.debug("cityStatePattern");
    const cityStateResults = results.filter((result: any) => 
      ["city", "town", "village", "hamlet", "suburb", "quarter", "neighbourhood", "borough"].includes(result.addresstype)
    );
    if (cityStateResults.length) {
      return findNearestResult(cityStateResults, currentLocation);
    }
  }

  if (postalCodePattern.test(query)) {
    console.debug("postalCodePattern");
    const postalCodeResults = results.filter((result: any) => result.addresstype === "postcode");
    if (postalCodeResults.length) {
      return findNearestResult(postalCodeResults, currentLocation);
    }
  }

  console.debug("defaultPattern");
  return findNearestResult(results, currentLocation);
}
