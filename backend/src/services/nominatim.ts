import axios from 'axios';
import { LRUCache } from 'lru-cache';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  geojson?: any;
  [key: string]: any;
}

export class NominatimClient {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';
  private cache: LRUCache<string, NominatimResult[]>;

  constructor() {
    // LRU cache with max 300 entries and no TTL
    // This keeps memory usage reasonable while caching frequent queries
    this.cache = new LRUCache<string, NominatimResult[]>({
      max: 300,
      // Optional: add TTL if you want cache entries to expire
      // ttl: 1000 * 60 * 60 * 24, // 24 hours
    });
  }

  async geocodePhrase(query: string): Promise<NominatimResult[]> {
    // Check cache first
    const cached = this.cache.get(query);
    if (cached) {
      console.log(`Cache hit for: ${query}`);
      return cached;
    }

    console.log(`Cache miss for: ${query}`);
    
    try {
      const response = await axios.get<NominatimResult[]>(this.baseUrl, {
        params: {
          q: query,
          polygon_geojson: 1,
          format: 'json'
        },
        headers: {
          'User-Agent': 'DeFlock/1.0'
        }
      });

      // Store in cache before returning
      this.cache.set(query, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to geocode phrase:', error);
      throw new Error('Failed to geocode phrase');
    }
  }
}
