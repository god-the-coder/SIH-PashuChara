/**
 * Offline & dictionary-based question translator for agricultural assessment questions.
 * Handles common AI inspection phrasing across Hindi, Marathi, Tamil, Gujarati, and Kannada.
 */

const PHRASE_PATTERNS = [
  {
    regex: /(sour|vinegar|acidic|pungent).*smell|odor|odour/i,
    translations: {
      hi: "क्या चारे या साइलेज से खट्टी, तीखी या सिरके जैसी महक आ रही है?",
      mr: "चाऱ्यातून किंवा सायलेजमधून आंबट, उग्र किंवा व्हिनेगरसारखा वास येत आहे का?",
      ta: "தீவனத்தில் புளிப்பு, வினிகர் போன்ற துர்நாற்றம் வீசுகிறதா?",
      gu: "શું ચારામાંથી ખાટી કે તીખી વાસ આવી રહી છે?",
      kn: "ಮೇವು ಅಥವಾ ಸೈಲೇಜ್‌ನಿಂದ ಹುಳಿ ಅಥವಾ ವಿನೆಗರ್ ತರಹದ ವಾಸನೆ ಬರುತ್ತಿದೆಯೇ?",
    },
  },
  {
    regex: /(mold|mould|fungus|white.*patch|rot)/i,
    translations: {
      hi: "क्या चारे पर सफेद फफूंद, फंगस या सड़न दिखाई दे रही है?",
      mr: "चाऱ्यावर पांढरी बुरशी किंवा कुजलेला भाग दिसत आहे का?",
      ta: "தீவனத்தில் வெள்ளை பூஞ்சை அல்லது அழுகல் தெரிகிறதா?",
      gu: "શું ચારા પર સફેદ ફૂગ અથવા સડો દેખાય છે?",
      kn: "ಮೇವು ಮೇಲೆ ಬಿಳಿ ಶಿಲೀಂಧ್ರ ಅಥವಾ ಕೊಳೆತ ಕಲೆಗಳು ಕಾಣಿಸುತ್ತಿವೆಯೇ?",
    },
  },
  {
    regex: /(heat|hot|warm|temperature|steam)/i,
    translations: {
      hi: "क्या चारा अंदर से छूने पर असामान्य रूप से गर्म लग रहा है?",
      mr: "चारा आतून स्पर्श केल्यावर जास्त गरम लागत आहे का?",
      ta: "தீவனத்தை தொடும்போது வழக்கத்திற்கு மாறாக சூடாக இருக்கிறதா?",
      gu: "શું ચારો અંદરથી અડતાં અસામાન્ય રીતે ગરમ લાગે છે?",
      kn: "ಮೇವನ್ನು ಸ್ಪರ್ಶಿಸಿದಾಗ ಅತಿಯಾದ ಬಿಸಿ ಅನಿಸುತ್ತಿದೆಯೇ?",
    },
  },
  {
    regex: /(rain|moisture|water|leak|damp|wet)/i,
    translations: {
      hi: "क्या हाल ही में चारे में बारिश का पानी या अतिरिक्त नमी घुसी है?",
      mr: "नुकतेच चाऱ्यामध्ये पावसाचे पाणी किंवा अतिरिक्त ओलावा शिरला आहे का?",
      ta: "சமீபத்தில் தீவனத்தில் மழைநீர் அல்லது அதிகப்படியான ஈரம் புகுந்துள்ளதா?",
      gu: "શું તાજેતરમાં ચારામાં વરસાદનું પાણી કે ભેજ લાગ્યો છે?",
      kn: "ಇತ್ತೀಚೆಗೆ ಮೇವಿಗೆ ಮಳೆ ನೀರು ಅಥವಾ ಅತಿಯಾದ ತೇವಾಂಶ ತಗುಲಿದೆಯೇ?",
    },
  },
  {
    regex: /(animal|eat|cattle|cow|refuse|appetite|intake)/i,
    translations: {
      hi: "क्या पशु यह चारा खाने में हिचकिचा रहे हैं या मना कर रहे हैं?",
      mr: "जनावरे हा चारा खाण्यास नकार किंवा संकोच करत आहेत का?",
      ta: "கால்நடைகள் இந்தத் தீவனத்தை சாப்பிட தயங்குகின்றனவா அல்லது மறுக்கின்றனவா?",
      gu: "શું પશુઓ આ ચારો ખાવામાં આનાકાની કરે છે?",
      kn: "ದನಗಳು ಈ ಮೇವನ್ನು ತಿನ್ನಲು ಹಿಂಜರಿಯುತ್ತಿವೆಯೇ ಅಥವಾ ನಿರಾಕರಿಸುತ್ತಿವೆಯೇ?",
    },
  },
  {
    regex: /(color|colour|dark|black|yellow|brown)/i,
    translations: {
      hi: "क्या चारे का रंग सामान्य से ज्यादा काला या गहरा भूरा हो गया है?",
      mr: "चाऱ्याचा रंग नेहमीपेक्षा जास्त काळा किंवा गडद तपकिरी झाला आहे का?",
      ta: "தீவனத்தின் நிறம் வழக்கத்தை விட கருப்பாகவோ அல்லது அடர் பழுப்பாகவோ மாறியுள்ளதா?",
      gu: "શું ચારાનો રંગ સામાન્ય કરતાં વધુ કાળો કે ઘેરો કથ્થઈ થઈ ગયો છે?",
      kn: "ಮೇವಿನ ಬಣ್ಣ ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಕಪ್ಪು ಅಥವಾ ಕಂದು ಬಣ್ಣಕ್ಕೆ ಬದಲಾಗಿದೆಯೇ?",
    },
  },
];

export function translateQuestion(questionText, targetLang = "hi") {
  if (!questionText || targetLang === "en") {
    return questionText;
  }

  for (const pattern of PHRASE_PATTERNS) {
    if (pattern.regex.test(questionText)) {
      if (pattern.translations[targetLang]) {
        return pattern.translations[targetLang];
      }
    }
  }

  return questionText;
}

export default translateQuestion;
