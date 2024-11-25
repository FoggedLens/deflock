import boto3
import requests
import json
from sklearn.cluster import DBSCAN
import numpy as np

def get_clusters():
    # Set up the Overpass API query
    query = """
    [out:json];
    node["man_made"="surveillance"]["surveillance:type"="ALPR"];
    out body;
    """

    # Request data from Overpass API
    print("Requesting data from Overpass API.")
    url = "http://overpass-api.de/api/interpreter"
    response = requests.get(url, params={'data': query}, headers={'User-Agent': 'DeFlock/1.0'})
    data = response.json()
    print("Data received. Parsing nodes...")

    # Parse nodes and extract lat/lon for clustering
    coordinates = []
    node_ids = []
    for element in data['elements']:
        if element['type'] == 'node':
            coordinates.append([element['lat'], element['lon']])
            node_ids.append(element['id'])

    # Convert coordinates to NumPy array for DBSCAN
    coordinates = np.array(coordinates)

    # Define the clustering radius (10 miles in meters)
    radius_miles = 50
    radius_km = radius_miles * 1.60934  # 1 mile = 1.60934 km
    radius_in_radians = radius_km / 6371.0  # Earth's radius in km

    # Perform DBSCAN clustering
    db = DBSCAN(eps=radius_in_radians, min_samples=1, algorithm='ball_tree', metric='haversine').fit(np.radians(coordinates))
    labels = db.labels_

    # Prepare clusters and calculate centroids
    clusters = {}
    for label in set(labels):
        cluster_points = coordinates[labels == label]
        centroid = np.mean(cluster_points, axis=0)
        first_node_id = node_ids[labels.tolist().index(label)]
        
        # Store in clusters dict with centroid and first node ID
        clusters[label] = {
            "lat": centroid[0],
            "lon": centroid[1],
            "id": first_node_id
        }

    output = {"clusters": list(clusters.values())}
    print("Clustering complete.")
    return output


def lambda_handler(event, context):
  alpr_clusters = get_clusters()

  s3 = boto3.client('s3')
  bucket = 'deflock-clusters'
  key = 'alpr_clusters.json'

  s3.put_object(
    Bucket=bucket,
    Key=key,
    Body=json.dumps(alpr_clusters),
    ContentType='application/json'
  )

  return {
    'statusCode': 200,
    'body': 'Successfully fetched ALPR counts.',
  }
