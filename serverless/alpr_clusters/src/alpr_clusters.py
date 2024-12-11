import json
from collections import defaultdict
from typing import Any

import boto3
import numpy as np
import requests
from sklearn.cluster import DBSCAN


def get_all_nodes():
    # Set up the Overpass API query
    query = """
    [out:json];
    node["man_made"="surveillance"]["surveillance:type"="ALPR"];
    out body;
    """

    url = "http://overpass-api.de/api/interpreter"
    response = requests.get(
        url, params={"data": query}, headers={"User-Agent": "DeFlock/1.0"}
    )
    response.raise_for_status()
    return response.json()["elements"]


def get_clusters(nodes: list[Any]):
    # Request data from Overpass API
    print("Requesting data from Overpass API.")

    print("Data received. Parsing nodes...")

    # Parse nodes and extract lat/lon for clustering
    coordinates = []
    node_ids = []
    for element in nodes:
        if element["type"] == "node":
            coordinates.append([element["lat"], element["lon"]])
            node_ids.append(element["id"])

    # Convert coordinates to NumPy array for DBSCAN
    coordinates = np.array(coordinates)

    # Define the clustering radius (50 miles in meters)
    radius_miles = 50
    radius_km = radius_miles * 1.60934  # 1 mile = 1.60934 km
    radius_in_radians = radius_km / 6371.0  # Earth's radius in km

    # Perform DBSCAN clustering
    db = DBSCAN(
        eps=radius_in_radians, min_samples=1, algorithm="ball_tree", metric="haversine"
    ).fit(np.radians(coordinates))
    labels = db.labels_

    # Prepare clusters and calculate centroids
    clusters = {}
    for label in set(labels):
        cluster_points = coordinates[labels == label]
        centroid = np.mean(cluster_points, axis=0)
        first_node_id = node_ids[labels.tolist().index(label)]

        # Store in clusters dict with centroid and first node ID
        clusters[label] = {"lat": centroid[0], "lon": centroid[1], "id": first_node_id}

    output = {"clusters": list(clusters.values())}
    print("Clustering complete.")
    return output


def segment_regions(nodes: Any, tile_size_degrees: int) -> list[dict[str, Any]]:
    tile_dict = defaultdict(list)
    for node in nodes["elements"]:
        lat, lon = node["lat"], node["lon"]
        tile_lat = int(np.floor(lat / tile_size_degrees)) * tile_size_degrees
        tile_lon = int(np.floor(lon / tile_size_degrees)) * tile_size_degrees
        tile_dict[(tile_lat, tile_lon)].append(node)

    tile_list = []
    for region, nodes in tile_dict.items():
        tile_list.append({"lat": region[0], "lon": region[1], "nodes": nodes})

    return tile_list


def lambda_handler(event, context):
    nodes = get_all_nodes()
    alpr_clusters = get_clusters(nodes)
    regions = segment_regions(nodes=nodes, tile_size_degrees=5)

    s3 = boto3.client("s3")
    bucket = "deflock-clusters"
    key = "alpr_clusters.json"

    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(alpr_clusters),
        ContentType="application/json",
    )

    for region in regions:
        lat, lon = region["lat"], region["lon"]
        s3.put_object(
            Bucket=bucket,
            Key=f"regions/{lat}/{lon}.json",
            Body=json.dumps(region["nodes"]),
            ContentType="application/json",
        )

    return {
        "statusCode": 200,
        "body": "Successfully fetched ALPR counts.",
    }


if __name__ == "__main__":
    from pathlib import Path

    nodes_file_path = Path("nodes.json")
    if nodes_file_path.exists():
        nodes = json.load(nodes_file_path.open())
    else:
        nodes = get_all_nodes()
        with nodes_file_path.open("w") as f:
            json.dump(nodes, f)

    regions = segment_regions(nodes=nodes, tile_size_degrees=5)
    with open("regions.json", "w") as f:
        json.dump(regions, f)
