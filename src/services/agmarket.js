import axios from 'axios';
import { logger } from '../utils/logger.js';

const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

export async function fetchMandiPrices(stateName, commodityName) {
  try {
    const res = await axios.get(BASE_URL, {
      params: {
        'api-key': process.env.AGMARKET_KEY,
        format: 'json',
        'filters[state.keyword]': stateName,
        'filters[commodity]': commodityName,
        limit: 100,
      },
    });
    return res.data?.records ?? [];
  } catch (err) {
    logger.error('Agmarket fetch failed', err.message);
    return [];
  }
}
