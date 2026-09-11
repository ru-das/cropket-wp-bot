import { setSession } from '../session.js';
import { greetingComplete } from './onGreeting.js';
import { logger } from '../utils/logger.js';

export async function onLangSelected(phone, session, message) {
  try {
    const parsed = JSON.parse(message.interactive.nfm_reply.response_json);
    const language = parsed.language;
    await setSession(phone, { lang: language });
    await greetingComplete(phone, { ...session, lang: language });
  } catch (err) {
    logger.error('onLangSelected failed', { phone, error: err.message });
    throw err;
  }
}
