import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GithubClient } from './services/github';
import { NominatimClient } from './services/nominatim';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const githubClient = new GithubClient();
const nominatimClient = new NominatimClient();

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://deflock.me',
  'https://www.deflock.me',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.head('/healthcheck', (req: Request, res: Response) => {
  res.status(200).end();
});

app.get('/sponsors/github', async (req: Request, res: Response) => {
  try {
    const sponsors = await githubClient.getSponsors('frillweeman');
    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching GitHub sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub sponsors' });
  }
});

app.get('/geocode', async (req: Request, res: Response) => {
  const query = req.query.query as string;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const results = await nominatimClient.geocodePhrase(query);
    res.json(results);
  } catch (error) {
    console.error('Error geocoding:', error);
    res.status(500).json({ error: 'Failed to geocode phrase' });
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'The requested resource could not be found.' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
  console.log('Press Ctrl+C to stop...');
});
