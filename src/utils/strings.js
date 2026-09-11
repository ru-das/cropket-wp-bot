export const SUPPORTED_LANGUAGES = [
  { id: 'en', title: 'English'    },
  { id: 'hi', title: 'हिन्दी'      },
  { id: 'bn', title: 'বাংলা'       },
  { id: 'te', title: 'తెలుగు'      },
  { id: 'mr', title: 'मराठी'       },
  { id: 'ta', title: 'தமிழ்'       },
  { id: 'gu', title: 'ગુજરાતી'     },
  { id: 'kn', title: 'ಕನ್ನಡ'       },
  { id: 'ml', title: 'മലയാളം'      },
  { id: 'pa', title: 'ਪੰਜਾਬੀ'      },
  { id: 'or', title: 'ଓଡ଼ିଆ'       },
];

// All user-facing strings in English — always passed through t() before sending
export const S = {
  GREETING:          "Hello! I'm AgriBot. I help farmers check crop prices at nearby mandis.",
  CHOOSE_LANG:       "Please choose your language to continue.",
  LANG_CONFIRMED:    "Got it! I'll reply in your language.",
  HOW_CAN_I_HELP:    "How can I help you today?",
  CROP_PRICES_OPTION:"🌾 Crop Prices",
  CHOOSE_CROP:       "Which crop do you want to check prices for?",
  SHARE_LOCATION:    "Please share your location so I can find mandis near you.",
  FETCHING:          "Fetching prices for you... 🔍",
  PRICE_HEADER:      "🌾 {cropName} — Mandi Prices Near You",
  MANDI_ENTRY:       "{rank}. *{market}*, {district}\n   📍 {dist} km away\n   💰 Modal Price: ₹{modal}/quintal\n   🚚 Net after transport: ₹{net}/quintal{contact}",
  CONTACT_LINE:      "\n   📞 {phone}",
  RECOMMENDATION:    "✅ *Best choice:* {market} ({dist} km) — highest net return at ₹{net}/quintal.",
  NO_DATA:           "Sorry, no price data found for {cropName} in your area today. Try again tomorrow.",
  ANOTHER_CROP:      "Would you like to check another crop?",
  YES:               "Yes",
  NO:                "No, thanks",
  ERROR:             "Something went wrong. Please try again.",
};

export const CROPS = [
  { id: 'wheat',  label: 'Wheat',  agmarketName: 'Wheat'  },
  { id: 'rice',   label: 'Rice',   agmarketName: 'Rice'   },
  { id: 'onion',  label: 'Onion',  agmarketName: 'Onion'  },
  { id: 'tomato', label: 'Tomato', agmarketName: 'Tomato' },
  { id: 'maize',  label: 'Maize',  agmarketName: 'Maize'  },
];
