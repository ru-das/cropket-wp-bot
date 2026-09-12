import { setSession } from '../session.js';
import { sendText, sendButtons } from '../services/whatsapp.js';
import { fetchMandiPrices } from '../services/agmarket.js';
import { reverseGeocodeToState, scoreAndSortMandis } from '../services/geo.js';
import { getString, getCropName, CROPS } from '../utils/strings.js';
import { logger } from '../utils/logger.js';

function buildPriceMessage(mandis, cropId, lang) {
  const cropName = getCropName(cropId, lang);
  const header = getString('PRICE_HEADER', lang).replace('{cropName}', cropName);
  const entryTpl = getString('MANDI_ENTRY', lang);
  const recTpl = getString('RECOMMENDATION', lang);

  const lines = mandis.map((m, i) =>
    entryTpl
      .replace('{rank}', i + 1)
      .replace('{market}', m.market)
      .replace('{district}', m.district)
      .replace('{dist}', m.distKm.toFixed(1))
      .replace('{modal}', Math.round(m.modal_price))
      .replace('{net}', Math.round(m.netPrice))
  );

  const best = mandis[0];
  const rec = recTpl
    .replace('{market}', best.market)
    .replace('{dist}', best.distKm.toFixed(1))
    .replace('{net}', Math.round(best.netPrice));

  return `*${header}*\n\n${lines.join('\n\n')}\n\n${rec}`;
}

export async function onLocation(phone, session, message) {
  try {
    const { latitude: lat, longitude: lon } = message.location;
    const stateName = await reverseGeocodeToState(lat, lon);
    await setSession(phone, { location: { lat, lon, state: stateName } });

    const lang = session.lang;
    await sendText(phone, getString('FETCHING', lang));

    const crop = CROPS.find((c) => c.id === session.crop);
    const agmarketName = crop?.agmarketName ?? session.crop;
    const records = await fetchMandiPrices(stateName, agmarketName);

    if (!records.length) {
      const cropName = getCropName(crop?.id ?? String(session.crop), lang);
      const noData = getString('NO_DATA', lang).replace('{cropName}', cropName);
      await sendText(phone, noData);
      await setSession(phone, { state: 'MENU_SENT' });
      return;
    }

    const mandis = await scoreAndSortMandis(lat, lon, records);
    if (!mandis.length) {
      const cropName = getCropName(crop?.id ?? String(session.crop), lang);
      const noData = getString('NO_DATA', lang).replace('{cropName}', cropName);
      await sendText(phone, noData);
      await setSession(phone, { state: 'MENU_SENT' });
      return;
    }

    const priceMessage = buildPriceMessage(mandis, session.crop, lang);
    await sendText(phone, priceMessage);

    await sendButtons(phone, getString('ANOTHER_CROP', lang), [
      { id: 'YES_CROP', title: getString('YES', lang) },
      { id: 'NO_CROP', title: getString('NO', lang) },
    ]);

    await setSession(phone, { state: 'MENU_SENT' });
  } catch (err) {
    logger.error('onLocation failed', { phone, error: err.message });
    throw err;
  }
}
