import { getSession } from './session.js';
import { onGreeting } from './handlers/onGreeting.js';
import { onLangSelected } from './handlers/onLangSelected.js';
import { onMenuSelected } from './handlers/onMenuSelected.js';
import { onCropSelected } from './handlers/onCropSelected.js';
import { onLocation } from './handlers/onLocation.js';
import { sendText } from './services/whatsapp.js';
import { t } from './services/translate.js';
import { S } from './utils/strings.js';
import { logger } from './utils/logger.js';

export async function handleGet(req, res) {
  try {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    res.status(403).end('Forbidden');
  } catch (err) {
    logger.error('handleGet failed', err.message);
    res.status(500).end('Internal Server Error');
  }
}

export async function handlePost(req, res) {
  let phone;
  let session;

  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    
    if (!message) {
      res.status(200).end();
      return;
    }

    phone = message.from;
    session = await getSession(phone);

    const text          = message.text?.body?.trim() ?? '';
    const isGreeting    = /^(hi|hello|hey|start|नमस्ते|नमस्कार|हेलो|हैलो|হ্যালো|নমস্কার|আসসালামু\s*আলাইকুম|வணக்கம்|ನಮಸ್ಕಾರ|హలో)/i.test(text);
    const isListReply   = message.type === 'interactive' && message.interactive?.type === 'list_reply';
    const isButtonReply = message.type === 'interactive' && message.interactive?.type === 'button_reply';
    const isLocation    = message.type === 'location';

    logger.info('incoming', { phone, state: session.state, type: message.type, text });

    if (session.state === 'INIT' || isGreeting)                                   await onGreeting(phone, session, message);
    else if (session.state === 'LANG_SENT'     && isListReply)                    await onLangSelected(phone, session, message);
    else if (session.state === 'MENU_SENT'     && isButtonReply) {
      const buttonId = message.interactive?.button_reply?.id;
      if (buttonId === 'YES_CROP') await onMenuSelected(phone, session, message);
      else if (buttonId === 'NO_CROP') await sendText(phone, await t('Thank you for using Cropket Whatsapp Bot! Come back anytime. 🌾', session.lang ?? 'en'));
    }
    else if (session.state === 'MENU_SENT'     && isListReply)                    await onMenuSelected(phone, session, message);
    else if (session.state === 'CROP_SENT'     && isListReply)                    await onCropSelected(phone, session, message);
    else if (session.state === 'LOCATION_SENT' && isLocation)                     await onLocation(phone, session, message);
    else logger.info('unhandled', { state: session.state, type: message.type });

  } catch (err) {
    logger.error('handlePost failed', err.message);
    try {
      const lang = session?.lang || 'en';
      if (phone) await sendText(phone, await t(S.ERROR, lang));
    } catch (e) {
      logger.error('failed to send error message', e.message);
    }
  } finally {
    // Always respond AFTER all async work is done
    res.status(200).end();
  }
}
