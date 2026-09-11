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
  res.sendStatus(200);

  let phone;
  let session;

  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return;

    phone = message.from;
    session = await getSession(phone);

    const text       = message.text?.body?.trim() ?? '';
    const isGreeting = /^(hi|hello|hey|start|नमस्ते|হ্যালো|வணக்கம்|ನಮಸ್ಕಾರ|హలో)/i.test(text);
    const isNfmReply = message.type === 'interactive' && message.interactive?.type === 'nfm_reply';
    const isListReply= message.type === 'interactive' && message.interactive?.type === 'list_reply';
    const isButtonReply = message.type === 'interactive' && message.interactive?.type === 'button_reply';
    const isLocation = message.type === 'location';

    if (session.state === 'INIT' || isGreeting)                      await onGreeting(phone, session, message);
    else if (session.state === 'LANG_SENT'     && isNfmReply)        await onLangSelected(phone, session, message);
    else if (session.state === 'MENU_SENT'     && isListReply)       await onMenuSelected(phone, session, message);
    else if (session.state === 'MENU_SENT'     && isButtonReply)     await onMenuSelected(phone, session, message);
    else if (session.state === 'CROP_SENT'     && isNfmReply)        await onCropSelected(phone, session, message);
    else if (session.state === 'LOCATION_SENT' && isLocation)        await onLocation(phone, session, message);
  } catch (err) {
    logger.error('handlePost routing failed', err);
    try {
      const lang = session?.lang || 'en';
      if (phone) await sendText(phone, await t(S.ERROR, lang));
    } catch (sendErr) {
      logger.error('Failed to send apology', sendErr.message);
    }
  }
}
