import axios from 'axios';
import { logger } from '../utils/logger.js';

const cache = new Map(); // key: "${lang}:${text}"

const GEMINI_URL = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

function extractText(res) {
  return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

export async function t(text, targetLang) {
  if (!targetLang || targetLang === 'en') return text;

  const key = `${targetLang}:${text}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const prompt = `Translate the following text to the language with BCP-47 code "${targetLang}". Reply with ONLY the translated text — no explanation, no quotes, no preamble.\n\n${text}`;

    const res = await axios.post(GEMINI_URL(), {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const translation = extractText(res) || text;
    cache.set(key, translation);
    return translation;
  } catch (err) {
    logger.error('Translation failed, returning English', { targetLang, error: err.message });
    return text;
  }
}

export async function tBatch(texts, targetLang) {
  try {
    return await Promise.all(texts.map((text) => t(text, targetLang)));
  } catch (err) {
    logger.error('tBatch failed', err.message);
    return texts;
  }
}

export async function detectLang(text) {
  if (!text?.trim()) return 'en';

  try {
    const prompt = `Detect the language of this text and reply with ONLY its BCP-47 language code (e.g. "hi", "bn", "en"). No explanation.\n\n${text}`;

    const res = await axios.post(GEMINI_URL(), {
      contents: [{ parts: [{ text: prompt }] }],
    });

    return extractText(res).toLowerCase() || 'en';
  } catch (err) {
    logger.error('detectLang failed, defaulting to en', err.message);
    return 'en';
  }
}
