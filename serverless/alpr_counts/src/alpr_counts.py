import json
import requests
import boto3
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_alpr_surveillance_nodes(usOnly=True):
  overpass_url = "http://overpass-api.de/api/interpreter"
  overpass_query = """
  [out:json][timeout:180];
  area["ISO3166-1"="US"]->.searchArea;
  node["man_made"="surveillance"]["surveillance:type"="ALPR"](area.searchArea);
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

def fetch_wins_count():
  cms_url = "https://cms.deflock.me/items/flockWins"
  headers = {'User-Agent': 'deflock-alpr-counts/1.0'}
  
  response = requests.get(cms_url, headers=headers)
  
  if response.status_code == 200:
    response_json = response.json()
    try:
      return len(response_json['data'])
    except (KeyError, TypeError) as e:
      raise RuntimeError("Could not find 'data' array in the response.")
  else:
    raise RuntimeError(f"Failed to fetch data from CMS. Status code: {response.status_code}")

def lambda_handler(event, context):
  us_alprs = None
  wins_count = None
  errors = []
  
  with ThreadPoolExecutor(max_workers=2) as executor:
    future_to_task = {
      executor.submit(fetch_alpr_surveillance_nodes): 'us_alprs',
      executor.submit(fetch_wins_count): 'wins'
    }
    
    for future in as_completed(future_to_task):
      task_name = future_to_task[future]
      try:
        result = future.result()
        if task_name == 'us_alprs':
          us_alprs = result
        elif task_name == 'wins':
          wins_count = result
      except Exception as e:
        errors.append(f"{task_name}: {str(e)}")
  
  if errors:
    return {
      'statusCode': 500,
      'body': f"Failed to fetch data: {'; '.join(errors)}",
    }

  all_alprs = {
    'us': us_alprs, # remove me soon
    'worldwide': us_alprs, # keep this as worldwide while we deploy, change eventually
    'wins': wins_count
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

if __name__ == "__main__":
  result = lambda_handler({}, {})
  print(result)