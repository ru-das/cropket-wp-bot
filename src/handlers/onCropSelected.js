import { setSession } from '../session.js';
import { requestLocation } from '../services/whatsapp.js';
import { t } from '../services/translate.js';
import { S } from '../utils/strings.js';
import { logger } from '../utils/logger.js';

export async function onCropSelected(phone, session, message) {
  try {
    // list_reply id format: "CROP_wheat", "CROP_rice", etc.
    const rawId = message.interactive?.list_reply?.id ?? '';
    logger.info('onCropSelected called', { phone, rawId });

    const crop = rawId.replace('CROP_', '');
    if (!crop) {
      logger.error('Could not extract crop from list_reply', { rawId });
      return;
    }

    await setSession(phone, { crop });

    const lang = session.lang ?? 'en';
    const locationText = await t(S.SHARE_LOCATION, lang);
    await requestLocation(phone, locationText);

    await setSession(phone, { state: 'LOCATION_SENT' });
    logger.info('location requested', { phone, crop });
  } catch (err) {
    logger.error('onCropSelected failed', { phone, error: err.message });
    throw err;
  }
}
