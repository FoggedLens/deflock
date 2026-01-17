import json
import requests
import boto3

def fetch_alpr_surveillance_nodes(usOnly=True):
  overpass_url = "http://overpass-api.de/api/interpreter"
  overpass_query = f"""
  [out:json][timeout:180];
  {'area["ISO3166-1"="US"]->.searchArea;' if usOnly else ''}
  node["man_made"="surveillance"]["surveillance:type"="ALPR"]{f'(area.searchArea)' if usOnly else ''};
  out count;
  """

  response = requests.get(overpass_url, params={'data': overpass_query})

  if response.status_code == 200:
    response_json = response.json()
    try:
      return response_json['elements'][0]['tags']['nodes']
    except (IndexError, KeyError) as e:
      raise RuntimeError("Could not find 'elements[0].tags.nodes' in the response.")
  else:
    raise RuntimeError(f"Failed to fetch data from Overpass API. Status code: {response.status_code}")

def lambda_handler(event, context):
  # us_alprs = fetch_alpr_surveillance_nodes('(area["ISO3166-1"="US"])')
  try:
    worldwide_alprs = fetch_alpr_surveillance_nodes()
  except Exception as e:
    return {
      'statusCode': 500,
      'body': f"Failed to fetch ALPR counts: {str(e)}",
    }

  all_alprs = {
    # 'us': us_alprs,
    'worldwide': worldwide_alprs # keep this as worldwide while we deploy, change eventually
  }

  s3 = boto3.client('s3')
  bucket = 'cdn.deflock.me'
  key = 'alpr-counts.json'

  s3.put_object(
    Bucket=bucket,
    Key=key,
    Body=json.dumps(all_alprs),
    ContentType='application/json'
  )

  return {
    'statusCode': 200,
    'body': 'Successfully fetched ALPR counts.',
  }
