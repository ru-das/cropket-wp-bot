import { v4 as uuidv4 } from 'uuid';
import { setSession } from '../session.js';
import { sendText, sendList, sendFlow } from '../services/whatsapp.js';
import { t, detectLang } from '../services/translate.js';
import { S, SUPPORTED_LANGUAGES } from '../utils/strings.js';
import { logger } from '../utils/logger.js';

export async function greetingComplete(phone, session) {
  try {
    const lang = session.lang;
    const menuText = await t(S.HOW_CAN_I_HELP, lang);
    const optionText = await t(S.CROP_PRICES_OPTION, lang);
    await sendList(phone, 'AgriBot', menuText, 'Menu', [{
      title: 'Options',
      rows: [{ id: 'CROP_PRICES', title: optionText }],
    }]);
    await setSession(phone, { state: 'MENU_SENT' });
  } catch (err) {
    logger.error('greetingComplete failed', { phone, error: err.message });
    throw err;
  }
}

export async function onGreeting(phone, session, message) {
  try {
    const detectedLang = await detectLang(message.text?.body ?? '');
    const isSupported = SUPPORTED_LANGUAGES.some((l) => l.id === detectedLang);

    if (isSupported) {
      const updated = await setSession(phone, { lang: detectedLang });
      await sendText(phone, await t(S.LANG_CONFIRMED, detectedLang));
      await greetingComplete(phone, updated);
      return;
    }

    await sendText(phone, `${S.GREETING}\n\n${S.CHOOSE_LANG}`);
    await sendFlow(
      phone,
      process.env.LANG_FLOW_ID,
      uuidv4(),
      'LANG_SELECT',
      S.CHOOSE_LANG
    );
    await setSession(phone, { state: 'LANG_SENT' });
  } catch (err) {
    logger.error('onGreeting failed', { phone, error: err.message });
    throw err;
  }
}
