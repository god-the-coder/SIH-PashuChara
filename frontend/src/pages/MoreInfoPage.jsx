import { useNavigate, useParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";
import { getBatchById, getBatchReport } from "../utils/batchStore";
import {
  ClipboardIcon,
  MicroscopeIcon,
  LightbulbIcon,
  DocumentIcon,
  CheckIcon,
  AlertTriangleIcon,
} from "../components/common/Icons";

// Multi-language content keyed by scan id, then by lang code
const SCAN_DATA = {
  "PC-9482": {
    id: "PC-9482",
    batchNumber: "BN-2026-001",
    type: {
      en: "Corn Silage", hi: "मक्का साइलेज",
      mr: "मक्का सायलेज", gu: "મકાઈ સાઇલેજ",
      kn: "ಮೆಕ್ಕೆ ಸೈಲೇಜ್", ta: "சோள சைலேஜ்",
    },
    date: "11 Sep 2026",
    time: "11:30 AM",
    isSafe: true,
    safeLabel: {
      en: "SAFE TO FEED", hi: "खिलाने योग्य",
      mr: "खाण्यास सुरक्षित", gu: "ખવડાવવા સલામત",
      kn: "ತಿನ್ನಿಸಲು ಸುರಕ್ಷಿತ", ta: "உணவளிக்க பாதுகாப்பானது",
    },
    safeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    insights: {
      en: [
        "Moisture content is within optimal range (60–65%). Fermentation appears stable with a pleasant acidic aroma.",
        "No visible mold colonies or dark discolouration detected. Butyric-acid spoilage risk is LOW.",
      ],
      hi: [
        "नमी का स्तर अनुकूल सीमा (60–65%) के भीतर है। किण्वन स्थिर और सुगंध सामान्य है।",
        "कोई फफूंद या काले धब्बे नहीं मिले। ब्यूटिरिक एसिड सड़न का जोखिम कम है।",
      ],
      mr: [
        "ओलावा प्रमाण इष्टतम मर्यादेत (60–65%) आहे. आंबवण स्थिर आहे आणि सुगंध सामान्य आहे.",
        "कोणतीही बुरशी किंवा काळे डाग आढळले नाहीत. ब्युटिरिक आम्ल खराब होण्याचा धोका कमी आहे.",
      ],
      gu: [
        "ભેજ ઇષ્ટ સ્તર (60–65%) ની અંદર છે. આથો સ્થિર છે અને સુગંધ સામાન્ય છે.",
        "કોઈ ફૂગ અથવા કાળા ડાઘ જોવા મળ્યા નથી. બ્યુટ્રિક એસિડ બગાડનું જોખમ ઓછું છે.",
      ],
      kn: [
        "ತೇವಾಂಶ ಸಾಂದ್ರತೆ ಅನುಕೂಲ ವ್ಯಾಪ್ತಿಯಲ್ಲಿದೆ (60–65%). ಹುದುಗಿಸುವಿಕೆ ಸ್ಥಿರವಾಗಿದ್ದು ಸುಗಂಧ ಸಾಮಾನ್ಯವಾಗಿದೆ.",
        "ಯಾವುದೇ ಶಿಲೀಂಧ್ರ ಅಥವಾ ಕಪ್ಪು ಕಲೆ ಕಂಡುಬಂದಿಲ್ಲ. ಬ್ಯುಟ್ರಿಕ್ ಆಮ್ಲ ಹಾಳಾಗುವ ಅಪಾಯ ಕಡಿಮೆ.",
      ],
      ta: [
        "ஈரப்பதம் உகந்த வரம்பில் உள்ளது (60–65%). புளித்தல் நிலையானது, வாசனை சாதாரணமாக உள்ளது.",
        "எந்த பூஞ்சை அல்லது கருப்பு திட்டும் காணப்படவில்லை. ப்யூட்ரிக் அமில சிதைவு ஆபத்து குறைவு.",
      ],
    },
    recommendations: {
      en: [
        "Re-seal the pit face tightly after each feeding session — expose only daily quota, then cover with tarpaulin weighted with tyres.",
        "Limit daily ration to 8–10 kg per milch cattle and mix with dry fodder (1:1) to maintain rumen balance.",
      ],
      hi: [
        "हर बार चारा निकालने के बाद गड्ढे का मुँह तिरपाल और टायरों से कसकर बंद करें।",
        "प्रति दुधारू पशु 8–10 कि.ग्रा. साइलेज रोज़ दें और सूखे चारे के साथ 1:1 में मिलाएँ।",
      ],
      mr: [
        "प्रत्येक चारा काढल्यानंतर खड्डा टार्पॉलिन आणि टायर्सने घट्ट बंद करा.",
        "प्रति दुधाळ जनावर 8–10 किलो सायलेज द्या आणि 1:1 प्रमाणात सुका चारा मिसळा.",
      ],
      gu: [
        "દરેક ખોરાક કાઢ્યા પછી ખાડાને ત્રિપાળ અને ટાયર વડે ચુસ્ત બંધ કરો.",
        "દૂઝણા ઢોર દીઠ 8–10 કિ.ગ્રા. સાઇલેજ આપો અને સૂકા ઘાસ સાથે 1:1 ભળાવો.",
      ],
      kn: [
        "ಪ್ರತಿ ಆಹಾರ ನೀಡಿದ ನಂತರ ತಾರ್ಪಾಲಿನ್ ಮತ್ತು ಟಯರ್‌ಗಳಿಂದ ತೊಟ್ಟನ್ನು ಭದ್ರವಾಗಿ ಮುಚ್ಚಿ.",
        "ಹಾಲಿನ ಜಾನುವಾರಿಗೆ ದಿನಕ್ಕೆ 8–10 ಕಿ.ಗ್ರಾ. ಸೈಲೇಜ್ ನೀಡಿ ಮತ್ತು ಒಣ ಮೇವಿನೊಂದಿಗೆ 1:1 ಬೆರೆಸಿ.",
      ],
      ta: [
        "ஒவ்வொரு தீவனமளித்த பிறகும் குழியை தார்பாய் மற்றும் டயர்களால் இறுக்கமாக மூடவும்.",
        "பால் கொடுக்கும் கால்நடைக்கு தினமும் 8–10 கிலோ சைலேஜ் கொடுங்கள், உலர் தீவனத்துடன் 1:1 கலக்கவும்.",
      ],
    },
  },
  "PC-9411": {
    id: "PC-9411",
    batchNumber: "BN-2026-002",
    type: {
      en: "Berseem Green Fodder", hi: "बरसीम हरा चारा",
      mr: "बरसीम हिरवा चारा", gu: "બર્સીમ લીલો ઘાસ",
      kn: "ಬರ್ಸೀಮ್ ಹಸಿ ಮೇವು", ta: "பர்சீம் பச்சை தீவனம்",
    },
    date: "07 Sep 2026",
    time: "04:15 PM",
    isSafe: false,
    safeLabel: {
      en: "ATTENTION REQUIRED", hi: "सावधानी आवश्यक",
      mr: "काळजी घ्या", gu: "ધ્યાન આપો",
      kn: "ಗಮನ ಅಗತ್ಯ", ta: "கவனம் தேவை",
    },
    safeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    insights: {
      en: [
        "Elevated moisture (>75%) detected with slight yellowing. Early secondary fermentation signs present — pH may be rising.",
        "Mild surface dampness increases mold risk to MODERATE. Butyric acid production possible within 48–72 hrs without intervention.",
      ],
      hi: [
        "अधिक नमी (>75%) और हल्का पीलापन पाया गया। द्वितीयक किण्वन के शुरुआती संकेत हैं — pH बढ़ सकता है।",
        "सतह की नमी से फफूंद जोखिम मध्यम है। हस्तक्षेप न किया जाए तो 48–72 घंटे में ब्यूटिरिक एसिड बन सकता है।",
      ],
      mr: [
        "जास्त ओलावा (>75%) आणि किंचित पिवळेपणा आढळला. दुय्यम आंबवणाची सुरुवातीची चिन्हे आहेत — pH वाढत असेल.",
        "पृष्ठभागाच्या ओलाव्यामुळे बुरशीचा धोका मध्यम आहे. हस्तक्षेप न केल्यास 48–72 तासांत ब्युटिरिक आम्ल तयार होऊ शकते.",
      ],
      gu: [
        "વધુ ભેજ (>75%) અને હળવી પીળાશ જોવા મળી. ગૌણ આથાના પ્રારંભિક ચિહ્નો — pH વધી શકે.",
        "સપાટીના ભેજથી ફૂગ ઉપદ્રવ સાધારણ. 48–72 કલાકમાં ઉપચાર ન થાય તો બ્યુટ્રિક એસિડ ઉત્પન્ન થઈ શકે.",
      ],
      kn: [
        "ಹೆಚ್ಚಿನ ತೇವಾಂಶ (>75%) ಮತ್ತು ಸ್ವಲ್ಪ ಹಳದಿ ಬಣ್ಣ ಕಂಡುಬಂತು. ದ್ವಿತೀಯ ಹುದುಗುವಿಕೆ ಪ್ರಾರಂಭಿಕ ಚಿಹ್ನೆಗಳಿವೆ.",
        "ಮೇಲ್ಮೈ ತೇವಾಂಶದಿಂದ ಶಿಲೀಂಧ್ರ ಅಪಾಯ ಮಧ್ಯಮ. 48–72 ಗಂಟೆಯಲ್ಲಿ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳದಿದ್ದರೆ ಬ್ಯುಟ್ರಿಕ್ ಆಮ್ಲ ಉತ್ಪತ್ತಿಯಾಗಬಹುದು.",
      ],
      ta: [
        "அதிக ஈரப்பதம் (>75%) மற்றும் மஞ்சள் நிறம் கண்டறியப்பட்டது. இரண்டாம் நிலை புளித்தல் தொடங்குகிறது.",
        "மேற்பரப்பு ஈரப்பதம் பூஞ்சை அபாயத்தை அதிகரிக்கிறது. தலையீடு இல்லாமல் 48–72 மணி நேரத்தில் ப்யூட்ரிக் அமிலம் உற்பத்தியாகலாம்.",
      ],
    },
    recommendations: {
      en: [
        "Aerate the top layer by loosening the cover for 1–2 hours in morning sunlight. Discard any visibly slimy or foul-smelling portions.",
        "Reduce daily ration by 20% until quality improves. Monitor cattle for bloating — consult veterinarian if symptoms appear.",
      ],
      hi: [
        "सुबह की धूप में 1–2 घंटे तिरपाल हटाकर ऊपरी परत को हवा दें। बदबूदार या चिपचिपे हिस्से निकाल कर फेंकें।",
        "गुणवत्ता सुधरने तक दैनिक मात्रा 20% कम करें। पशुओं में अफरा के लक्षण दिखें तो तुरंत पशु चिकित्सक से मिलें।",
      ],
      mr: [
        "सकाळच्या उन्हात 1–2 तास झाकण काढून वरचा थर हवेशीर करा. दुर्गंधी किंवा चिकट भाग काढून टाका.",
        "गुणवत्ता सुधारेपर्यंत दैनिक मात्रा 20% कमी करा. जनावरांत फुगी दिसल्यास पशुवैद्याकडे जा.",
      ],
      gu: [
        "સવારના તડકામાં 1–2 કલાક ઢાંકણ ખોલી ઉપરનો સ્તર હવામાં રાખો. બગડેલ ભાગ ફેંકી દો.",
        "ગુણવત્તા સુધરે ત્યાં સુધી 20% ઓછો ઘાસ આપો. ઢોરમાં પેટ ફૂલવાના ચિહ્નો દેખાય તો પશુ ડૉક્ટરને બતાવો.",
      ],
      kn: [
        "ಬೆಳಗಿನ ಬಿಸಿಲಿನಲ್ಲಿ 1–2 ಗಂಟೆ ಮುಚ್ಚಳ ತೆಗೆದು ಮೇಲಿನ ಪದರವನ್ನು ಗಾಳಿಗೆ ಒಡ್ಡಿ. ಕೆಟ್ಟ ವಾಸನೆ ಇರುವ ಭಾಗ ತೆಗೆದು ಹಾಕಿ.",
        "ಗುಣಮಟ್ಟ ಸುಧಾರಿಸುವವರೆಗೆ ದೈನಂದಿನ ಪ್ರಮಾಣವನ್ನು 20% ಕಡಿಮೆ ಮಾಡಿ. ಉಬ್ಬರ ಕಾಣಿಸಿಕೊಂಡರೆ ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      ],
      ta: [
        "காலை வெயிலில் 1–2 மணி நேரம் மூடியை திறந்து மேல் அடுக்கை காற்றில் வைக்கவும். துர்நாற்றம் உள்ள பகுதிகளை அகற்றவும்.",
        "தரம் சீராகும் வரை தினசரி அளவை 20% குறைக்கவும். வயிறு உப்புசம் தென்பட்டால் கால்நடை மருத்துவரை அணுகவும்.",
      ],
    },
  },
  "PC-9380": {
    id: "PC-9380",
    batchNumber: "BN-2026-003",
    type: {
      en: "Corn Silage #1", hi: "मक्का साइलेज #1",
      mr: "मक्का सायलेज #1", gu: "મકાઈ સાઇલેજ #1",
      kn: "ಮೆಕ್ಕೆ ಸೈಲೇಜ್ #1", ta: "சோள சைலேஜ் #1",
    },
    date: "02 Sep 2026",
    time: "09:00 AM",
    isSafe: true,
    safeLabel: {
      en: "SAFE TO FEED", hi: "खिलाने योग्य",
      mr: "खाण्यास सुरक्षित", gu: "ખવડાવવા સલામત",
      kn: "ತಿನ್ನಿಸಲು ಸುರಕ್ಷಿತ", ta: "உணவளிக்க பாதுகாப்பானது",
    },
    safeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    insights: {
      en: [
        "Premium fermentation profile — lactic acid dominant. Moisture at 62%, well within silage safety window.",
        "Pit is airtight and fully sealed. No aerobic spoilage zones detected in any sampled layer.",
      ],
      hi: [
        "उच्च गुणवत्ता किण्वन — लैक्टिक एसिड प्रमुख। नमी 62% — पूरी तरह सुरक्षित सीमा में।",
        "गड्ढा पूरी तरह वायुरोधी और सुरक्षित है। किसी भी परत में एरोबिक सड़न नहीं पाई गई।",
      ],
      mr: [
        "उत्कृष्ट आंबवण — लॅक्टिक आम्ल प्रमुख. ओलावा 62% — पूर्णपणे सुरक्षित मर्यादेत.",
        "खड्डा पूर्णपणे वायुरोधक आणि सुरक्षित. कोणत्याही थरात एरोबिक खराबी आढळली नाही.",
      ],
      gu: [
        "ઉત્તમ આથો — લૅક્ટિક ઍસિડ પ્રભાવી. ભેજ 62% — સંપૂર્ણ સલામત વ્યાપ્તિ.",
        "ખાડો સંપૂર્ણ હવાઅવરોધ. કોઈ પ્રત બગડ્યો નહીં.",
      ],
      kn: [
        "ಉತ್ಕೃಷ್ಟ ಹುದುಗುವಿಕೆ — ಲ್ಯಾಕ್ಟಿಕ್ ಆಮ್ಲ ಪ್ರಧಾನ. ತೇವಾಂಶ 62% — ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತ ವ್ಯಾಪ್ತಿ.",
        "ತೊಟ್ಟು ಸಂಪೂರ್ಣ ವಾಯುನಿರೋಧಕ. ಯಾವ ಪದರದಲ್ಲೂ ಏರೋಬಿಕ್ ಕೊಳೆತ ಕಂಡುಬಂದಿಲ್ಲ.",
      ],
      ta: [
        "சிறந்த புளித்தல் — லாக்டிக் அமிலம் முதன்மையானது. ஈரப்பதம் 62% — முழு பாதுகாப்பு வரம்பில் உள்ளது.",
        "குழி முழுவதும் காற்றடைப்பு உள்ளது. எந்த அடுக்கிலும் ஏரோபிக் சிதைவு காணப்படவில்லை.",
      ],
    },
    recommendations: {
      en: [
        "Maintain current sealing practices. Re-inspect after 10 days to verify fermentation stability.",
        "Ideal ration: 10–12 kg per milch cattle daily. This batch is fully ready for peak lactation feeding.",
      ],
      hi: [
        "मौजूदा सीलिंग तरीका जारी रखें। स्थिरता जाँचने के लिए 10 दिन बाद पुनः जाँच करें।",
        "आदर्श मात्रा: प्रति दुधारू पशु 10–12 कि.ग्रा./दिन। यह बैच दूध उत्पादन के लिए पूर्णतः तैयार है।",
      ],
      mr: [
        "सध्याची सीलिंग पद्धत सुरू ठेवा. स्थिरता तपासण्यासाठी 10 दिवसांनी पुन्हा तपासणी करा.",
        "आदर्श मात्रा: प्रति दुधाळ जनावर 10–12 किलो/दिवस. हा बॅच दूध उत्पादनासाठी पूर्णतः तयार आहे.",
      ],
      gu: [
        "વર્તમાન સીલિંગ પ્રેક્ટિસ ચાલુ રાખો. 10 દિવસ પછી ફરી તપાસ કરો.",
        "આદર્શ માત્રા: 10–12 કિ.ગ્રા. દૈનિક. આ બૅચ પ્રસૂતિ ટોચ ખોરાક માટે સંપૂર્ણ તૈયાર.",
      ],
      kn: [
        "ಪ್ರಸ್ತುತ ಮುಚ್ಚಳ ಅಭ್ಯಾಸಗಳನ್ನು ಮುಂದುವರಿಸಿ. 10 ದಿನಗಳ ನಂತರ ಮರು ತಪಾಸಣೆ ಮಾಡಿ.",
        "ಸೂಕ್ತ ಪ್ರಮಾಣ: ದಿನಕ್ಕೆ 10–12 ಕಿ.ಗ್ರಾ. ಈ ಬ್ಯಾಚ್ ಹಾಲಿನ ಉತ್ಪಾದನೆಗೆ ಸಂಪೂರ್ಣ ಸಿದ್ಧ.",
      ],
      ta: [
        "தற்போதைய சீல் முறைகளைத் தொடரவும். 10 நாட்களுக்குப் பிறகு மறுஆய்வு செய்யவும்.",
        "சிறந்த அளவு: தினமும் 10–12 கிலோ. இந்த தொகுதி பால் உற்பத்திக்கு முழுமையாக தயார்.",
      ],
    },
  },
};

// Build a fallback entry for batches not in SCAN_DATA
function buildFallbackEntry(batch, lang) {
  const isHi = lang === "hi";
  const type = batch?.typeLabel || batch?.typeKey || "Fodder";
  return {
    id: batch?.id || "—",
    batchNumber: batch?.batchNumber || "—",
    type: { en: type, hi: type, mr: type, gu: type, kn: type, ta: type },
    date: batch?.lastAnalyzedAt || "—",
    time: "—",
    isSafe: true,
    safeLabel: {
      en: "SCAN COMPLETE", hi: "जाँच पूरी",
      mr: "तपासणी पूर्ण", gu: "તપાસ પૂર્ણ",
      kn: "ಸ್ಕ್ಯಾನ್ ಮುಗಿದಿದೆ", ta: "ஸ்கேன் முடிந்தது",
    },
    safeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    insights: {
      en: [
        "Scan successfully processed. Review the full lab report for detailed metrics.",
        "Fodder stored conditions were recorded and evaluated against reference parameters.",
      ],
      hi: [
        "जाँच सफलतापूर्वक पूरी हुई। विस्तृत मेट्रिक्स के लिए पूरी लैब रिपोर्ट देखें।",
        "भंडारण की स्थितियाँ दर्ज की गई और संदर्भ मापदंडों के विरुद्ध मूल्यांकन किया गया।",
      ],
      mr: [
        "जाँच यशस्वीरित्या पूर्ण झाली. तपशीलवार मेट्रिक्ससाठी संपूर्ण लॅब रिपोर्ट पाहा.",
        "भंडारणाच्या परिस्थिती नोंदवल्या गेल्या आणि संदर्भ मापदंडांशी तुलना केली गेली.",
      ],
      gu: [
        "સ્કેન સફળ. વિગતવાર મેટ્રિક્સ માટે સંપૂર્ણ લૅબ રિપોર્ટ જુઓ.",
        "ભંડારણ સ્થિતિ નોંધવામાં આવી અને સંદર્ભ ધોરણ સામે મૂલ્યાંકન કરવામાં આવ્યું.",
      ],
      kn: [
        "ಸ್ಕ್ಯಾನ್ ಯಶಸ್ವಿ. ವಿವರವಾದ ಮೆಟ್ರಿಕ್ಸ್‌ಗಾಗಿ ಪೂರ್ಣ ಲ್ಯಾಬ್ ವರದಿ ನೋಡಿ.",
        "ಸಂಗ್ರಹ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ದಾಖಲಿಸಲಾಗಿದ್ದು ಮಾನದಂಡಗಳ ವಿರುದ್ಧ ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗಿದೆ.",
      ],
      ta: [
        "ஸ்கேன் வெற்றிகரமாக முடிந்தது. விரிவான அளவீடுகளுக்கு முழு ஆய்வக அறிக்கையைப் பாருங்கள்.",
        "சேமிப்பு நிலைமைகள் பதிவு செய்யப்பட்டு குறிப்பு அளவுருக்களுடன் மதிப்பிடப்பட்டன.",
      ],
    },
    recommendations: {
      en: [
        "Follow the action protocol in the full lab report for next steps.",
        "Schedule re-inspection every 10–14 days to monitor quality trends.",
      ],
      hi: [
        "अगले चरणों के लिए पूरी लैब रिपोर्ट में कार्य प्रोटोकॉल का पालन करें।",
        "गुणवत्ता प्रवृत्ति की निगरानी के लिए हर 10–14 दिनों में पुनः जाँच करवाएँ।",
      ],
      mr: [
        "पुढील टप्प्यांसाठी संपूर्ण लॅब रिपोर्टमधील कृती प्रोटोकॉल पाळा.",
        "गुणवत्ता ट्रेंडसाठी दर 10–14 दिवसांनी पुन्हा तपासणी करा.",
      ],
      gu: [
        "આગળના પગલાઓ માટે સંપૂર્ણ રિપોર્ટ અનુસરો.",
        "ગુણવત્તા ટ્રેન્ડ જોવા 10–14 દિવસે ફરી ચકાસો.",
      ],
      kn: [
        "ಮುಂದಿನ ಹಂತಗಳಿಗಾಗಿ ಪೂರ್ಣ ಲ್ಯಾಬ್ ವರದಿಯ ಕ್ರಿಯಾ ಪ್ರೋಟೋಕಾಲ್ ಅನುಸರಿಸಿ.",
        "ಗುಣಮಟ್ಟದ ಟ್ರೆಂಡ್ ಪರೀಕ್ಷಿಸಲು 10–14 ದಿನಗಳಿಗೊಮ್ಮೆ ಮರುತಪಾಸಣೆ ಮಾಡಿ.",
      ],
      ta: [
        "அடுத்த படிகளுக்கு முழு ஆய்வக அறிக்கையில் உள்ள நடவடிக்கை நெறிமுறையை பின்பற்றவும்.",
        "தரத்தை கண்காணிக்க 10–14 நாட்களுக்கு ஒரு முறை மறு ஸ்கேன் திட்டமிடவும்.",
      ],
    },
  };
}

export default function MoreInfoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, lang } = useDashboard();

  // Use current app lang; fall back to 'en' if not in our set
  const L = (obj) => obj[lang] ?? obj["en"] ?? "";

  const staticScan = SCAN_DATA[id];
  const liveB = getBatchById(id);
  const scan = staticScan || (liveB ? buildFallbackEntry(liveB, lang) : null);

  const hasReport = !!getBatchReport(id);

  if (!scan) {
    return (
      <div className="relative min-h-screen w-full flex justify-center bg-[#ede7db] dark:bg-[#050706]">
        <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <ClipboardIcon className="w-12 h-12 text-emerald-700/60 dark:text-emerald-400/60 mb-4" />
          <h2 className="text-sm font-black text-gray-700 dark:text-gray-200">
            {t.recordNotFound || (lang === "hi" ? "रिकॉर्ड नहीं मिला" : "Record not found")}
          </h2>
          <button
            onClick={() => navigate("/history")}
            className="mt-4 px-4 py-2 rounded-xl bg-[#2D5A3D] text-white text-xs font-bold"
          >
            ← {t.backToHistory || (lang === "hi" ? "इतिहास पर वापस" : "Back to History")}
          </button>
        </div>
      </div>
    );
  }

  const safeLabelText = L(scan.safeLabel);
  const typeName = L(scan.type);
  const insights = scan.insights[lang] ?? scan.insights["en"];
  const recommendations = scan.recommendations[lang] ?? scan.recommendations["en"];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#ede7db] dark:bg-[#050706] antialiased">
      {/* Farm BG */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="relative w-full h-full max-w-[430px] mx-auto overflow-hidden bg-[#faf7f0] dark:bg-[#0a0c0b]">
          <img
            src="/bg-farm.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: 0.28 }}
          />
          <div className="absolute inset-0 bg-[#faf7f0]/64 dark:bg-[#0a0c0b]/74 pointer-events-none" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-transparent border-x border-[#ded6c7] dark:border-[#1d221f]">
        <SubPageHeader
          title={t.moreInfoPageTitle || (lang === "hi" ? "त्वरित विवरण" : "Quick Summary")}
          subtitle={t.moreInfoPageSub || (lang === "hi" ? "AI विश्लेषण सारांश" : "AI Scan Analysis Summary")}
          backTo="/history"
          actionBtn={
            <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#191c19] border border-[#ded5c2] dark:border-[#2a3c2c] text-[10px] font-bold text-[#2D5A3D] dark:text-[#86efac]">
              {scan.id}
            </span>
          }
        />

        <main className="p-4 space-y-3 flex-1 overflow-y-auto pb-6">

          {/* ── Card 1: Batch Overview + Safety ── */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#161c18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
                {t.batchOverviewLabel || (lang === "hi" ? "बैच विवरण" : "Batch Overview")}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border flex items-center gap-1 ${scan.safeColor}`}>
                <span>{safeLabelText}</span>
                {scan.isSafe ? (
                  <CheckIcon className="w-3 h-3" />
                ) : (
                  <AlertTriangleIcon className="w-3 h-3" />
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: t.batchIdLabel || (lang === "hi" ? "बैच आईडी" : "Batch ID"), value: scan.id },
                { label: t.batchNoLabel || (lang === "hi" ? "बैच नंबर" : "Batch No."), value: scan.batchNumber },
                { label: t.fodderTypeLabel || (lang === "hi" ? "चारा प्रकार" : "Fodder Type"), value: typeName },
                { label: t.dateTimeLabel || (lang === "hi" ? "दिनांक व समय" : "Date & Time"), value: `${scan.date}, ${scan.time}` },
              ].map((row) => (
                <div
                  key={row.label}
                  className="p-2.5 rounded-xl bg-[#faf7f0] dark:bg-[#0f1411] border border-[#ded5c2] dark:border-[#242824]"
                >
                  <div className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    {row.label}
                  </div>
                  <div className="text-xs font-black text-[#064d2c] dark:text-white leading-snug">
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Card 2: AI Insights ── */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#161c18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider flex items-center gap-1.5">
              <MicroscopeIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {t.keyInsightsLabel || (lang === "hi" ? "मुख्य AI निष्कर्ष" : "Key AI Insights")}
            </h3>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed p-2.5 rounded-xl bg-[#f0f9f3] dark:bg-[#0d1c12] border border-emerald-100 dark:border-emerald-900/30"
                >
                  <span className="text-emerald-600 dark:text-emerald-400 font-black shrink-0 text-sm leading-snug">
                    {i + 1}.
                  </span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Card 3: Farmer Recommendations ── */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#161c18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider flex items-center gap-1.5">
              <LightbulbIcon className="w-4 h-4 text-amber-500" />
              {t.farmerRecsLabel || (lang === "hi" ? "किसान सुझाव" : "Farmer Recommendations")}
            </h3>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed p-2.5 rounded-xl bg-[#fffbeb] dark:bg-[#1a1507] border border-amber-100 dark:border-amber-900/30"
                >
                  <span className="text-amber-500 font-black shrink-0 text-sm leading-snug">
                    {i + 1}.
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Get Full Report CTA ── */}
          <div className="pt-1 pb-2">
            <button
              onClick={() => navigate(`/history/${id}/report`)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2D5A3D] to-[#1a4428] hover:from-[#1E442B] hover:to-[#153820] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <DocumentIcon className="w-4 h-4" />
              <span>{t.getFullReportBtn || (lang === "hi" ? "पूरी लैब रिपोर्ट देखें →" : "Get Full Lab Report →")}</span>
            </button>
          </div>
        </main>

        <BottomNavBar />
      </div>
    </div>
  );
}
