import axios from "axios";

const apiService = axios.create({
  baseURL: window.location.hostname === "localhost" ? "http://localhost:3000" : "https://api.deflock.org",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getSponsors = async () => {
  const response = await apiService.get("/sponsors/github");
  return response.data;
}

export const getALPRCounts = async () => {
  const s3Url = "https://cdn.deflock.me/alpr-counts.json";
  const response = await apiService.get(s3Url);
  return response.data;
}

export const getCities = async () => {
  const s3Url = "https://cdn.deflock.me/flock_cameras_null.json";
  const response = await apiService.get(s3Url);
  return response.data;
}

export const geocodeQuery = async (query: string) => {
  const encodedQuery = encodeURIComponent(query);
  const result = (await apiService.get(`/geocode?query=${encodedQuery}`)).data;
  return result;
}
