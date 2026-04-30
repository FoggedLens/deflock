/**
 * Classifies a geocoding query string into a common geographic query type.
 */

export type GeoQueryType =
  | 'zip_code'     // 5-digit US ZIP, e.g. "90210"
  | 'coordinates'  // lat/lon pair, e.g. "34.0522, -118.2437"
  | 'address'      // street address, e.g. "123 Main St, Springfield, IL"
  | 'city_state'   // city + 2-letter state, e.g. "Portland, OR"
  | 'city'         // bare city name, e.g. "Portland"
  | 'state'        // US state name or abbreviation, e.g. "Oregon" or "OR"
  | 'other';

const ZIP_RE = /^\d{5}$/;
const COORDS_RE = /^-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?$/;
// Street address: starts with a number followed by a street name fragment
const ADDRESS_RE = /^\d+\s+\w/;
// "City, ST" — word(s), comma, exactly 2 uppercase letters
const CITY_STATE_RE = /^[\w\s.''-]+,\s*[A-Z]{2}$/;

const US_STATES = new Set([
  'alabama','alaska','arizona','arkansas','california','colorado','connecticut',
  'delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa',
  'kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan',
  'minnesota','mississippi','missouri','montana','nebraska','nevada',
  'new hampshire','new jersey','new mexico','new york','north carolina',
  'north dakota','ohio','oklahoma','oregon','pennsylvania','rhode island',
  'south carolina','south dakota','tennessee','texas','utah','vermont',
  'virginia','washington','west virginia','wisconsin','wyoming',
  'district of columbia',
  // Abbreviations
  'al','ak','az','ar','ca','co','ct','de','fl','ga','hi','id','il','in','ia',
  'ks','ky','la','me','md','ma','mi','mn','ms','mo','mt','ne','nv','nh','nj',
  'nm','ny','nc','nd','oh','ok','or','pa','ri','sc','sd','tn','tx','ut','vt',
  'va','wa','wv','wi','wy','dc',
]);

export function classifyGeoQuery(query: string): GeoQueryType {
  const q = query.trim();

  if (ZIP_RE.test(q)) return 'zip_code';
  if (COORDS_RE.test(q)) return 'coordinates';
  if (ADDRESS_RE.test(q)) return 'address';
  if (CITY_STATE_RE.test(q)) return 'city_state';
  if (US_STATES.has(q.toLowerCase())) return 'state';
  // Single word or short multi-word without punctuation — treat as city
  if (/^[\w\s.'']+$/.test(q) && q.length >= 2) return 'city';

  return 'other';
}
