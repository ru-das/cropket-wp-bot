import { setSession } from '../session.js';
import { sendList } from '../services/whatsapp.js';
import { getString, getCropName, CROPS } from '../utils/strings.js';
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

    const translatedCrops = CROPS.map((c) => ({
      id: `CROP_${c.id}`,
      title: getCropName(c.id, lang),
    }));

    const chooseText = getString('CHOOSE_CROP', lang);
    const cropsLabel = getString('CROPS_LABEL', lang);

    await sendList(phone, 'Cropket WhatsApp Bot', chooseText, getString('SELECT', lang) || 'Select', [{
      title: cropsLabel,
      rows: translatedCrops,
    }]);

    await setSession(phone, { state: 'CROP_SENT' });
    logger.info('crop list sent', { phone });
  } catch (err) {
    logger.error('onMenuSelected failed', { phone, error: err.message });
    throw err;
  }
}
