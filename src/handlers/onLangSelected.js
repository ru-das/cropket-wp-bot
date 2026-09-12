import { setSession } from '../session.js';
import { logger } from '../utils/logger.js';
import { greetingComplete } from './onGreeting.js';

export async function onLangSelected(phone, session, message) {
  try {
    // list_reply id format: "LANG_hi", "LANG_bn", etc.
    const rawId = message.interactive?.list_reply?.id ?? '';
    logger.info('onLangSelected called', { phone, rawId });

    const lang = rawId.replace('LANG_', '');
    if (!lang) {
      logger.error('Could not extract language from list_reply', { rawId });
      return;
    }

    const updated = await setSession(phone, { lang });
    await greetingComplete(phone, updated);
  } catch (err) {
    logger.error('onLangSelected failed', { phone, error: err.message });
    throw err;
  }
}
