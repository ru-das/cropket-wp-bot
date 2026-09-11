import { v4 as uuidv4 } from 'uuid';
import { setSession } from '../session.js';
import { sendText, sendFlow } from '../services/whatsapp.js';
import { t } from '../services/translate.js';
import { S } from '../utils/strings.js';
import { logger } from '../utils/logger.js';

export async function onMenuSelected(phone, session, message) {
  try {
    const listId = message.interactive?.list_reply?.id;
    const buttonId = message.interactive?.button_reply?.id;
    const selected = listId || buttonId;

    if (selected === 'NO') {
      return;
    }

    if (selected !== 'CROP_PRICES' && selected !== 'YES') return;

    const bodyText = await t(S.CHOOSE_CROP, session.lang);
    await sendText(phone, bodyText);
    await sendFlow(
      phone,
      process.env.CROP_FLOW_ID,
      uuidv4(),
      'CROP_SELECT',
      bodyText
    );
    await setSession(phone, { state: 'CROP_SENT' });
  } catch (err) {
    logger.error('onMenuSelected failed', { phone, error: err.message });
    throw err;
  }
}
