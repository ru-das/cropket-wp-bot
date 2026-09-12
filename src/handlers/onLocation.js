import { setSession } from '../session.js';
import { sendText, sendButtons } from '../services/whatsapp.js';
import { t } from '../services/translate.js';
import { fetchMandiPrices } from '../services/agmarket.js';
import { reverseGeocodeToState, scoreAndSortMandis } from '../services/geo.js';
import { S, CROPS } from '../utils/strings.js';
import { logger } from '../utils/logger.js';

async function buildPriceMessage(mandis, cropId, lang) {
  try {
    const crop = CROPS.find((c) => c.id === cropId);
    const cropName = await t(crop.label, lang);

    const header   = (await t(S.PRICE_HEADER,   lang)).replace('{cropName}', cropName);
    const entryTpl = await t(S.MANDI_ENTRY,  lang);
    const contactTpl = await t(S.CONTACT_LINE, lang);
    const recTpl   = await t(S.RECOMMENDATION, lang);

    const lines = mandis.map((m, i) => {
      const contact = m.phone ? contactTpl.replace('{phone}', m.phone) : '';
      return entryTpl
        .replace('{rank}',     i + 1)
        .replace('{market}',   m.market)
        .replace('{district}', m.district)
        .replace('{dist}',     m.distKm.toFixed(1))
        .replace('{modal}',    Math.round(m.modal_price))
        .replace('{net}',      Math.round(m.netPrice))
        .replace('{contact}',  contact);
    });

    const best = mandis[0];
    const rec  = recTpl
      .replace('{market}', best.market)
      .replace('{dist}',   best.distKm.toFixed(1))
      .replace('{net}',    Math.round(best.netPrice));

    return `*${header}*\n\n${lines.join('\n\n')}\n\n${rec}`;
  } catch (err) {
    logger.error('buildPriceMessage failed', err.message);
    throw err;
  }
}

export async function onLocation(phone, session, message) {
  try {
    const { latitude: lat, longitude: lon } = message.location;
    const stateName = await reverseGeocodeToState(lat, lon);
    await setSession(phone, { location: { lat, lon, state: stateName } });

    const lang = session.lang;
    await sendText(phone, await t(S.FETCHING, lang));

    const crop = CROPS.find((c) => c.id === session.crop);
    const agmarketName = crop?.agmarketName ?? session.crop;
    const records = await fetchMandiPrices(stateName, agmarketName);

    if (!records.length) {
      const cropName = await t(crop?.label ?? String(session.crop), lang);
      const noData = (await t(S.NO_DATA, lang)).replace('{cropName}', cropName);
      await sendText(phone, noData);
      await setSession(phone, { state: 'MENU_SENT' });
      return;
    }

    const mandis = await scoreAndSortMandis(lat, lon, records);
    if (!mandis.length) {
      const cropName = await t(crop?.label ?? String(session.crop), lang);
      const noData = (await t(S.NO_DATA, lang)).replace('{cropName}', cropName);
      await sendText(phone, noData);
      await setSession(phone, { state: 'MENU_SENT' });
      return;
    }

    const priceMessage = await buildPriceMessage(mandis, session.crop, lang);
    await sendText(phone, priceMessage);

    await sendButtons(phone, await t(S.ANOTHER_CROP, lang), [
      { id: 'YES_CROP', title: await t(S.YES, lang) },
      { id: 'NO_CROP',  title: await t(S.NO, lang)  },
    ]);

    await setSession(phone, { state: 'MENU_SENT' });
  } catch (err) {
    logger.error('onLocation failed', { phone, error: err.message });
    throw err;
  }
}
