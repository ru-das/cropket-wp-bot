import axios from 'axios';
import { logger } from '../utils/logger.js';

const mandiGeoCache = new Map(); // key: "${market}|${district}|${state}"

export async function geocodeMandi(market, district, state) {
  const key = `${market}|${district}|${state}`;
  if (mandiGeoCache.has(key)) return mandiGeoCache.get(key);

  const q = encodeURIComponent(`${market} mandi, ${district}, ${state}, India`);
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${q}&key=${process.env.OPENCAGE_KEY}&limit=1`;

  try {
    const res = await axios.get(url);
    const result = res.data.results[0];
    if (!result) return null;
    const coords = { lat: result.geometry.lat, lon: result.geometry.lng };
    mandiGeoCache.set(key, coords);
    return coords;
  } catch (err) {
    logger.error('geocodeMandi failed', { market, district, state, error: err.message });
    return null;
  }
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function scoreAndSortMandis(userLat, userLon, records, topN = 5) {
  try {
    const cost = Number(process.env.TRANSPORT_COST_PER_KM) || 2;

    const scored = await Promise.all(records.map(async (m) => {
      try {
        const coords = await geocodeMandi(m.market, m.district, m.state);
        if (!coords) return null;
        const distKm  = haversineKm(userLat, userLon, coords.lat, coords.lon);
        const netPrice = Number(m.modal_price) - distKm * cost;
        return { ...m, distKm, netPrice };
      } catch (err) {
        logger.error('scoreAndSortMandis item failed', { market: m.market, error: err.message });
        return null;
      }
    }));

    return scored
      .filter(Boolean)
      .sort((a, b) => b.netPrice - a.netPrice)
      .slice(0, topN);
  } catch (err) {
    logger.error('scoreAndSortMandis failed', err.message);
    return [];
  }
}

export async function reverseGeocodeToState(lat, lon) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${process.env.OPENCAGE_KEY}&limit=1`;
  try {
    const res = await axios.get(url);
    return res.data.results[0]?.components?.state ?? '';
  } catch (err) {
    logger.error('reverseGeocodeToState failed', err.message);
    return '';
  }
}
