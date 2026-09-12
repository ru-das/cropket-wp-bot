import { setSession } from '../session.js';
import { sendList } from '../services/whatsapp.js';
import { t } from '../services/translate.js';
import { S, CROPS } from '../utils/strings.js';
import { logger } from '../utils/logger.js';

export async function onMenuSelected(phone, session, message) {
  try {
    const replyId = message.interactive?.list_reply?.id
      ?? message.interactive?.button_reply?.id
      ?? '';
    logger.info('onMenuSelected called', { phone, replyId });

    if (replyId !== 'CROP_PRICES') {
      logger.info('unknown menu option', { replyId });
      return;
    }

    const lang = session.lang ?? 'en';

    // Translate crop labels
    const translatedCrops = await Promise.all(
      CROPS.map(async (c) => ({
        id: `CROP_${c.id}`,
        title: await t(c.label, lang),
      }))
    );

    const chooseText = await t(S.CHOOSE_CROP, lang);
    await sendList(
      phone,
      'AgriBot',
      chooseText,
      'Select',
      [{
        title: await t('Crops', lang),
        rows: translatedCrops,
      }]
    );

    await setSession(phone, { state: 'CROP_SENT' });
    logger.info('crop list sent', { phone });
  } catch (err) {
    logger.error('onMenuSelected failed', { phone, error: err.message });
    throw err;
  }
}
