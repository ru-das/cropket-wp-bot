import { setSession } from '../session.js';
import { sendText, requestLocation } from '../services/whatsapp.js';
import { t } from '../services/translate.js';
import { S } from '../utils/strings.js';
import { logger } from '../utils/logger.js';

export async function onCropSelected(phone, session, message) {
  try {
    const parsed = JSON.parse(message.interactive.nfm_reply.response_json);
    const crop = parsed.crop;
    await setSession(phone, { crop });
    const bodyText = await t(S.SHARE_LOCATION, session.lang);
    await sendText(phone, bodyText);
    await requestLocation(phone, bodyText);
    await setSession(phone, { state: 'LOCATION_SENT' });
  } catch (err) {
    logger.error('onCropSelected failed', { phone, error: err.message });
    throw err;
  }
}
