import { setSession, clearSession } from '../session.js';
import { sendText, sendList } from '../services/whatsapp.js';
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
    logger.info('greetingComplete done', { phone, lang });
  } catch (err) {
    logger.error('greetingComplete failed', { phone, error: err.message });
    throw err;
  }
}

export async function onGreeting(phone, session, message) {
  try {
    await clearSession(phone);
    const messageText = message.text?.body ?? '';
    logger.info('onGreeting called', { phone, messageText });

    const detectedLang = await detectLang(messageText);
    logger.info('detected lang', { phone, detectedLang });

    const isSupported = SUPPORTED_LANGUAGES.some((l) => l.id === detectedLang);

    if (isSupported) {
      const updated = await setSession(phone, { lang: detectedLang });
      await sendText(phone, await t(S.LANG_CONFIRMED, detectedLang));
      await greetingComplete(phone, updated);
      return;
    }

    // Language unknown — send greeting then a list of languages to pick from
    await sendText(phone, `${S.GREETING}\n\n${S.CHOOSE_LANG}`);
    await sendList(
      phone,
      'AgriBot',
      S.CHOOSE_LANG,
      'Choose',
      [{
        title: 'Languages',
        rows: SUPPORTED_LANGUAGES.map((l) => ({
          id: `LANG_${l.id}`,
          title: l.title,
        })),
      }]
    );
    await setSession(phone, { state: 'LANG_SENT' });
    logger.info('language list sent', { phone });
  } catch (err) {
    logger.error('onGreeting failed', { phone, error: err.message });
    throw err;
  }
}
