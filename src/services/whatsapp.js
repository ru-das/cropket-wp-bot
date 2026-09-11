import axios from 'axios';
import { logger } from '../utils/logger.js';

function messagesUrl() {
  return `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
}

async function send(payload) {
  logger.info('WhatsApp outgoing payload', JSON.stringify(payload));
  try {
    const res = await axios.post(messagesUrl(), payload, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    logger.debug('WhatsApp response', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    const body = err.response?.data ?? err.message;
    logger.error('WhatsApp API error', JSON.stringify(body));
    throw err;
  }
}

export async function sendText(to, body) {
  try {
    return await send({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    });
  } catch (err) {
    logger.error('sendText failed', { to, error: err.message });
  }
}

export async function sendList(to, headerText, bodyText, buttonLabel, sections) {
  try {
    return await send({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: headerText },
        body: { text: bodyText },
        action: {
          button: buttonLabel,
          sections,
        },
      },
    });
  } catch (err) {
    logger.error('sendList failed', { to, error: err.message });
  }
}

export async function sendFlow(to, flowId, flowToken, screenId, bodyText) {
  try {
    return await send({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: { type: 'text', text: 'AgriBot' },
        body: { text: bodyText },
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token: flowToken,
            flow_id: flowId,
            flow_cta: 'Open',
            flow_action: 'navigate',
            flow_action_payload: { screen: screenId },
          },
        },
      },
    });
  } catch (err) {
    logger.error('sendFlow failed', { to, flowId, error: err.message });
  }
}

export async function requestLocation(to, bodyText) {
  try {
    return await send({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'location_request_message',
        body: { text: bodyText },
        action: { name: 'send_location' },
      },
    });
  } catch (err) {
    logger.error('requestLocation failed', { to, error: err.message });
  }
}

export async function sendButtons(to, bodyText, buttons) {
  try {
    return await send({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map((b) => ({
            type: 'reply',
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    });
  } catch (err) {
    logger.error('sendButtons failed', { to, error: err.message });
  }
}
