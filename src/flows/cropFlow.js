import { CROPS } from '../utils/strings.js';
import { tBatch } from '../services/translate.js';
import { logger } from '../utils/logger.js';

export async function buildCropFlowJson(targetLang) {
  try {
    const labels = await tBatch(CROPS.map((c) => c.label), targetLang);
    return {
      version: '3.0',
      screens: [{
        id: 'CROP_SELECT',
        title: 'Crop / फसल',
        layout: {
          type: 'SingleSelectGroup',
          children: [{
            type: 'SingleSelect',
            name: 'crop',
            label: 'Select crop',
            options: CROPS.map((c, i) => ({ id: c.id, title: labels[i] })),
          }],
          'on-click-action': {
            name: 'data_exchange',
            payload: { crop: '${form.crop}' },
          },
        },
      }],
    };
  } catch (err) {
    logger.error('buildCropFlowJson failed', err.message);
    throw err;
  }
}
