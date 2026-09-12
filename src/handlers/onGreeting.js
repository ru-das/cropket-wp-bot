import { setSession, clearSession } from '../session.js';
import { sendText, sendList } from '../services/whatsapp.js';
import { getString, SUPPORTED_LANGUAGES } from '../utils/strings.js';
import { logger } from '../utils/logger.js';

export async function greetingComplete(phone, session) {
  try {
    const lang = session.lang;
    const menuText = getString('HOW_CAN_I_HELP', lang);
    const optionText = getString('CROP_PRICES_OPTION', lang);
    await sendList(phone, 'Cropket Whatsapp Bot', menuText, 'Menu', [{
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
    logger.info('onGreeting called', { phone });
    await clearSession(phone);
    await sendText(phone, getString('GREETING', 'en'));
    await sendList(phone, 'Cropket WhatsApp Bot', getString('CHOOSE_LANG', 'en'), 'Choose', [{
      title: 'Languages',
      rows: SUPPORTED_LANGUAGES.map((l) => ({ id: `LANG_${l.id}`, title: l.title })),
    }]);
    await setSession(phone, { state: 'LANG_SENT' });
  } catch (err) {
    logger.error('onGreeting failed', { phone, error: err.message });
    throw err;
  }
}
