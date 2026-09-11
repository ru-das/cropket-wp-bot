import { SUPPORTED_LANGUAGES } from '../utils/strings.js';

export function buildLangFlowJson() {
  return {
    version: '3.0',
    screens: [{
      id: 'LANG_SELECT',
      title: 'Language / भाषा',
      layout: {
        type: 'SingleSelectGroup',
        children: [{
          type: 'SingleSelect',
          name: 'language',
          label: 'Choose your language',
          options: SUPPORTED_LANGUAGES.map((l) => ({ id: l.id, title: l.title })),
        }],
        'on-click-action': {
          name: 'data_exchange',
          payload: { language: '${form.language}' },
        },
      },
    }],
  };
}
