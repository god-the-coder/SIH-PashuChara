import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { QRCodeSVG } from "qrcode.react";
import { getBatchAgeDays, getBatchById, getBatchReport } from "../utils/batchStore";
import { CloseIcon } from "../components/common/Icons";

/* ─── Static baseline scan records (Professional Lab Data) ─── */
const SCAN_DATA = {
  "PC-9482": {
    id: "PC-9482",
    batchNumber: "BN-2026-001",
    lotType: { en: "Corn Silage", hi: "मक्का साइलेज" },
    location: { en: "Pit Bunker – North Field", hi: "पिट बंकर – उत्तरी खेत" },
    date: "11 Sep 2026",
    time: "11:30 AM",
    isSafe: true,
    nutritional: {
      assessment: { en: "OPTIMAL", hi: "उत्कृष्ट" },
      crudeProtein: "8.5–9.8%*",
      crudeFiber: "26.0–28.0%*",
      energyValue: "9.2–9.8 MJ/kg*",
      mineralProfile: { en: "Reference Estimate (Ca 0.34%, P 0.22%)*", hi: "संदर्भ अनुमान (Ca 0.34%, P 0.22%)*" },
      moistureCondition: { en: "62.4% (Normal Fermentation Range)", hi: "62.4% (सामान्य किण्वन सीमा)", status: "normal" },
    },
    contamination: {
      fungalIndicators: { en: "NOT DETECTED", hi: "नहीं पाया गया", status: "normal" },
      mouldGrowth: { en: "NOT DETECTED", hi: "नहीं पाया गया", status: "normal" },
      waterDamage: { en: "NONE", hi: "शून्य", status: "normal" },
      foreignMaterial: { en: "NOT DETECTED", hi: "शून्य", status: "normal" },
      sandSilica: { en: "NOT DETECTED", hi: "नहीं पाया गया", status: "normal" },
    },
    silageQuality: {
      fermentation: { en: "STABLE", hi: "स्थिर", status: "normal" },
      moisture: { en: "62.4% (NORMAL)", hi: "62.4% (सामान्य)", status: "normal" },
      spoilage: { en: "LOW / NONE", hi: "न्यूनतम", status: "normal" },
      mould: { en: "NONE", hi: "कोई नहीं", status: "normal" },
      ph: { value: "4.1 (Reference: 3.8–4.5)", status: "normal" },
    },
    storageEnvironment: {
      storageCondition: { en: "COMPLIANT (Airtight Bunker)", hi: "अनुकूल (वायुरोधी बंकर)", status: "normal" },
      moistureExposure: { en: "PROTECTED (Covered)", hi: "सुरक्षित (ढका हुआ)", status: "normal" },
      sealingCondition: { en: "OPTIMAL / TIGHT", hi: "वायुरोधी सील", status: "normal" },
      temp: "31°C",
      humidity: "74%",
    },
    farmerInfoDefault: {
      feedType: "Corn Silage (मक्का साइलेज)",
      storageDuration: "42 days (42 दिन)",
      storageCondition: "Covered with Weighted Tarpaulin",
      moistureExposure: "Protected from precipitation",
      farmerObservation: "Normal lactic fermentation odor",
    },
    actionProtocol: {
      immediate: {
        en: [
          "1. Batch is approved for standard dairy ration allocation (8–10 kg/cow).",
          "2. Uncover only the exact face quota required per feeding cycle.",
          "3. Re-seal bunker immediately after extraction with edge weights.",
        ],
        hi: [
          "1. यह बैच सामान्य दुग्धाहार आवंटन (8–10 कि.ग्रा./गाय) के लिए स्वीकृत है।",
          "2. प्रति आहार चक्र केवल आवश्यक मात्रा के लिए ही पिट खोलें।",
          "3. चारा निकालने के उपरांत गड्ढे को तुरंत किनारे के वजन से पुनः सील करें।",
        ],
      },
      corrective: {
        en: [
          "4. Maintain airtight edge compression across the pit face.",
          "5. Perform routine visual checks after high moisture or weather events.",
          "6. Re-evaluate quality parameters every 14 days.",
        ],
        hi: [
          "4. पिट के किनारों पर वायुरोधी दबाव बनाए रखें।",
          "5. मौसम या नमी में परिवर्तन के बाद नियमित निरीक्षण करें।",
          "6. प्रत्येक 14 दिवस पर गुणवत्ता मापदंडों का पुनः मूल्यांकन करें।",
        ],
      },
      verification: {
        en: "7. Periodic quantitative laboratory / NIR analysis is recommended for absolute dry matter and mycotoxin verification.",
        hi: "7. पूर्ण शुष्क पदार्थ एवं मायकोटॉक्सिन सत्यापन हेतु आवधिक प्रयोगशाला / NIR परीक्षण अनुशंसित है।",
      },
    },
    wasteUtilization: {
      isSafe: true,
      title: { en: "FEED APPROVED — COMPLIANT FOR ANIMAL CONSUMPTION", hi: "आहार स्वीकृत — पशु उपभोग हेतु मानक अनुरूप" },
      detail: {
        en: "Material meets feed safety criteria. Outer degraded edge crust may be routed to organic farm compost.",
        hi: "सामग्री पशु आहार सुरक्षा मानकों के अनुरूप है। बाहरी पपड़ी को जैविक खाद हेतु उपयोग किया जा सकता है।",
      },
    },
    metrics: [
      { param: { en: "Moisture", hi: "नमी" }, target: "60–65%", measured: "62.4%", status: "Normal" },
      { param: { en: "pH Level", hi: "pH स्तर" }, target: "3.8–4.5", measured: "4.1", status: "Normal" },
      { param: { en: "Fermentation Index", hi: "किण्वन सूचकांक" }, target: ">0.75", measured: "0.88", status: "Normal" },
      { param: { en: "Lactic:Butyric Ratio", hi: "लैक्टिक:ब्यूटिरिक" }, target: ">5:1", measured: "8.2:1", status: "Normal" },
      { param: { en: "Temperature (°C)", hi: "तापमान (°C)" }, target: "22–28", measured: "24.5", status: "Normal" },
      { param: { en: "Dry Matter %", hi: "शुष्क पदार्थ %" }, target: "30–38", measured: "33.7%", status: "Normal" },
    ],
    scanHistory: [
      { date: "02 Sep 2026", moisture: "63.1%", ph: "4.3", qualityScore: "GRADE B+", notes: { en: "Early stabilization phase", hi: "प्रारंभिक स्थिरता चरण" } },
      { date: "11 Sep 2026", moisture: "62.4%", ph: "4.1", qualityScore: "GRADE A", notes: { en: "Mature fermentation — ready for feeding", hi: "पूर्ण किण्वन — आहार योग्य" } },
    ],
    signature: { en: "Simple AI Model Analytic Report", hi: "सरल AI मॉडल विश्लेषणात्मक रिपोर्ट" },
  },

  "PC-9411": {
    id: "PC-9411",
    batchNumber: "BN-2026-002",
    lotType: { en: "Berseem Green Fodder", hi: "बरसीम हरा चारा" },
    location: { en: "Covered Shed – East Block", hi: "ढका हुआ शेड – पूर्वी खंड" },
    date: "07 Sep 2026",
    time: "04:15 PM",
    isSafe: false,
    nutritional: {
      assessment: { en: "ELEVATED RISK / DEVIATION", hi: "उच्च जोखिम / विचलन" },
      crudeProtein: "8.0–10.0%*",
      crudeFiber: "25.0–30.0%*",
      energyValue: "7.2–8.4 MJ/kg*",
      mineralProfile: { en: "Reference Estimate (Nutritional Leaching Suspected)*", hi: "संदर्भ अनुमान (पोषक तत्वों का रिसाव संभावित)*" },
      moistureCondition: { en: "78.2% (Above Recommended Limit)", hi: "78.2% (अनुशंसित सीमा से अधिक)", status: "concern" },
    },
    contamination: {
      fungalIndicators: { en: "ELEVATED", hi: "उच्च", status: "high" },
      mouldGrowth: { en: "PRESENT", hi: "उपस्थित", status: "high" },
      waterDamage: { en: "EXTENSIVE", hi: "व्यापक", status: "high" },
      foreignMaterial: { en: "MODERATE", hi: "मध्यम", status: "medium" },
      sandSilica: { en: "DETECTED", hi: "पाया गया", status: "medium" },
    },
    silageQuality: {
      fermentation: { en: "DEVIATION", hi: "विचलन", status: "concern" },
      moisture: { en: "78.2% (NON-COMPLIANT)", hi: "78.2% (मानक से बाहर)", status: "concern" },
      spoilage: { en: "ELEVATED", hi: "उच्च", status: "high" },
      mould: { en: "DETECTED", hi: "पाया गया", status: "high" },
      ph: { value: "6.9 (Estimated - Out of Target)", status: "concern" },
    },
    storageEnvironment: {
      storageCondition: { en: "DEFICIENT (Open / Exposed Shed)", hi: "अपूर्ण (खुला / असुरक्षित शेड)", status: "concern" },
      moistureExposure: { en: "CONFIRMED (Rain / Moisture Seepage)", hi: "पुष्ट (वर्षा / नमी रिसाव)", status: "concern" },
      sealingCondition: { en: "NON-AIRTIGHT / ATTENTION REQUIRED", hi: "वायुरोधी नहीं / सुधार आवश्यक", status: "concern" },
      temp: "31°C",
      humidity: "74%",
    },
    farmerInfoDefault: {
      feedType: "Berseem Green Fodder (बरसीम)",
      storageDuration: "42 days (42 दिन)",
      storageCondition: "Open storage / partial shed cover",
      moistureExposure: "Exposed to ambient precipitation",
      farmerObservation: "Damp, non-characteristic odor observed",
    },
    actionProtocol: {
      immediate: {
        en: [
          "1. Discontinue livestock feeding from this lot immediately.",
          "2. Physically segregate affected material to eliminate cross-contamination risk.",
          "3. Mitigate external moisture ingress by reinforcing shed barrier and drainage.",
        ],
        hi: [
          "1. इस लॉट से पशुओं को चारा खिलाना तत्काल प्रभाव से रोकें।",
          "2. अन्य चारे में संक्रमण रोकने हेतु प्रभावित हिस्से को भौतिक रूप से अलग करें।",
          "3. शेड की मरम्मत एवं जल निकासी दुरुस्त कर बाहरी नमी का संपर्क रोकें।",
        ],
      },
      corrective: {
        en: [
          "4. Rectify storage ventilation and replace compromised tarpaulins.",
          "5. Audit adjacent stored batches for secondary moisture degradation.",
          "6. Maintain quarantine and continuous lot monitoring over 48 hours.",
        ],
        hi: [
          "4. शेड वेंटिलेशन में सुधार करें तथा क्षतिग्रस्त तिरपाल बदलें।",
          "5. समीपस्थ रखे अन्य बैचों की नमी व क्षरण की विस्तृत जांच करें।",
          "6. अगले 48 घंटों तक बैच को अलग रखकर निरंतर निगरानी रखें।",
        ],
      },
      verification: {
        en: "7. Mandatory laboratory chemical and mycotoxin quantification is required prior to any secondary feed consideration.",
        hi: "7. किसी भी आहार पुनरावलोकन से पूर्व अनिवार्य प्रयोगशाला रासायनिक एवं मायकोटॉक्सिन परीक्षण आवश्यक है।",
      },
    },
    wasteUtilization: {
      isSafe: false,
      title: { en: "NON-FEED RATING — INDUSTRIAL RECOVERY REQUIRED", hi: "आहार अयोग्य — औद्योगिक अपशिष्ट प्रबंधन आवश्यक" },
      detail: {
        en: "Material is non-compliant for livestock consumption. Direct to bio-methanation (biogas) feedstock or anaerobic composting.",
        hi: "यह सामग्री पशु आहार के अयोग्य है। इसे बायोगैस संयंत्र फीडस्टॉक अथवा जैविक कम्पोस्टिंग हेतु हस्तांतरित करें।",
      },
    },
    metrics: [
      { param: { en: "Moisture", hi: "नमी" }, target: "65–75%", measured: "78.2%", status: "Deviation" },
      { param: { en: "pH Level", hi: "pH स्तर" }, target: "5.0–6.5", measured: "6.9", status: "Deviation" },
      { param: { en: "Fermentation Index", hi: "किण्वन सूचकांक" }, target: ">0.75", measured: "0.54", status: "Deviation" },
      { param: { en: "Lactic:Butyric Ratio", hi: "लैक्टिक:ब्यूटिरिक" }, target: ">5:1", measured: "3.1:1", status: "Deviation" },
      { param: { en: "Temperature (°C)", hi: "तापमान (°C)" }, target: "22–28", measured: "27.8", status: "Normal" },
      { param: { en: "Dry Matter %", hi: "शुष्क पदार्थ %" }, target: "20–30", measured: "18.4%", status: "Deviation" },
    ],
    scanHistory: [
      { date: "03 Sep 2026", moisture: "71.0%", ph: "5.8", qualityScore: "GRADE B", notes: { en: "Acceptable — monitor weekly", hi: "स्वीकार्य — साप्ताहिक निरीक्षण करें" } },
      { date: "07 Sep 2026", moisture: "78.2%", ph: "6.9", qualityScore: "GRADE C", notes: { en: "Moisture spike detected — quarantined", hi: "अत्यधिक नमी दर्ज — अलग रखा गया" } },
    ],
    signature: { en: "Simple AI Model Analytic Report", hi: "सरल AI मॉडल विश्लेषणात्मक रिपोर्ट" },
  },

  "PC-9380": {
    id: "PC-9380",
    batchNumber: "BN-2026-003",
    lotType: { en: "Corn Silage #1", hi: "मक्का साइलेज #1" },
    location: { en: "Airtight Pit – South Farm", hi: "वायुरोधी पिट – दक्षिण खेत" },
    date: "02 Sep 2026",
    time: "09:00 AM",
    isSafe: true,
    nutritional: {
      assessment: { en: "OPTIMAL / GRADE A", hi: "उत्कृष्ट / ग्रेड A" },
      crudeProtein: "9.0–10.2%*",
      crudeFiber: "24.0–27.0%*",
      energyValue: "9.5–10.1 MJ/kg*",
      mineralProfile: { en: "Reference Estimate (Ca 0.36%, P 0.24%)*", hi: "संदर्भ अनुमान (Ca 0.36%, P 0.24%)*" },
      moistureCondition: { en: "62.0% (Compliant)", hi: "62.0% (मानक अनुरूप)", status: "normal" },
    },
    contamination: {
      fungalIndicators: { en: "NOT DETECTED", hi: "नहीं पाया गया", status: "normal" },
      mouldGrowth: { en: "NOT DETECTED", hi: "नहीं पाया गया", status: "normal" },
      waterDamage: { en: "NONE", hi: "शून्य", status: "normal" },
      foreignMaterial: { en: "NOT DETECTED", hi: "शून्य", status: "normal" },
      sandSilica: { en: "NOT DETECTED", hi: "नहीं पाया गया", status: "normal" },
    },
    silageQuality: {
      fermentation: { en: "OPTIMAL", hi: "उत्कृष्ट", status: "normal" },
      moisture: { en: "62.0% (OPTIMAL)", hi: "62.0% (अनुकूल)", status: "normal" },
      spoilage: { en: "NONE DETECTED", hi: "शून्य", status: "normal" },
      mould: { en: "NONE DETECTED", hi: "शून्य", status: "normal" },
      ph: { value: "3.9 (Compliant)", status: "normal" },
    },
    storageEnvironment: {
      storageCondition: { en: "COMPLIANT (Hermetic Pit)", hi: "मानक अनुरूप (वायुरोधी गड्ढा)", status: "normal" },
      moistureExposure: { en: "PROTECTED", hi: "पूर्ण सुरक्षित", status: "normal" },
      sealingCondition: { en: "OPTIMAL HERMETIC SEAL", hi: "वायुरोधी सील", status: "normal" },
      temp: "29°C",
      humidity: "68%",
    },
    farmerInfoDefault: {
      feedType: "Corn Silage #1 (मक्का साइलेज)",
      storageDuration: "60 days (60 दिन)",
      storageCondition: "Airtight underground pit bunker",
      moistureExposure: "Hermetically sealed",
      farmerObservation: "Characteristic aromatic lactic profile",
    },
    actionProtocol: {
      immediate: {
        en: [
          "1. Batch is approved for high-lactation milking ration (10–12 kg/cow).",
          "2. Blend with dry fodder (1:1 ratio) to ensure effective rumen fiber mat.",
          "3. Restrict face exposure time to under 2 hours daily.",
        ],
        hi: [
          "1. उच्च दुग्ध उत्पादन वाले पशुओं (10–12 कि.ग्रा./गाय) हेतु आहार अनुमोदित।",
          "2. रूमेन पाचन संतुलन हेतु सूखे चारे के साथ 1:1 अनुपात में मिलाएं।",
          "3. पिट के अग्रभाग को प्रतिदिन 2 घंटे से अधिक खुला न रखें।",
        ],
      },
      corrective: {
        en: [
          "4. Maintain hermetic seal after extraction of daily allotment.",
          "5. Audit anaerobic pit edges following significant precipitation.",
          "6. Routine re-assessment scheduled at 14-day intervals.",
        ],
        hi: [
          "4. दैनिक आहार निकालने के पश्चात वायुरोधी सील तुरंत दुरुस्त करें।",
          "5. भारी वर्षा के पश्चात पिट के किनारों की वायुरोधकता की जांच करें।",
          "6. 14 दिवस के अंतराल पर नियमित पुनः मूल्यांकन निर्धारित करें।",
        ],
      },
      verification: {
        en: "7. Periodic NIR dry-matter verification recommended at 30-day calibration cycles.",
        hi: "7. 30 दिवस के चक्र पर आवधिक NIR शुष्क पदार्थ जांच अनुशंसित है।",
      },
    },
    wasteUtilization: {
      isSafe: true,
      title: { en: "PREMIUM FEED RATING — FULL LIVESTOCK UTILIZATION", hi: "प्रीमियम आहार रेटिंग — पूर्ण पशु उपभोग अनुमोदित" },
      detail: {
        en: "High nutritional integrity confirmed. Approved for primary lactation feed stock.",
        hi: "उच्च पोषण गुणवत्ता पुष्ट। प्राथमिक दुग्धाहार हेतु स्वीकृत।",
      },
    },
    metrics: [
      { param: { en: "Moisture", hi: "नमी" }, target: "60–65%", measured: "62.0%", status: "Normal" },
      { param: { en: "pH Level", hi: "pH स्तर" }, target: "3.8–4.5", measured: "3.9", status: "Normal" },
      { param: { en: "Fermentation Index", hi: "किण्वन सूचकांक" }, target: ">0.75", measured: "0.91", status: "Normal" },
      { param: { en: "Lactic:Butyric Ratio", hi: "लैक्टिक:ब्यूटिरिक" }, target: ">5:1", measured: "10.5:1", status: "Normal" },
      { param: { en: "Temperature (°C)", hi: "तापमान (°C)" }, target: "22–28", measured: "23.1", status: "Normal" },
      { param: { en: "Dry Matter %", hi: "शुष्क पदार्थ %" }, target: "30–38", measured: "35.2%", status: "Normal" },
    ],
    scanHistory: [
      { date: "27 Aug 2026", moisture: "63.5%", ph: "4.2", qualityScore: "GRADE A-", notes: { en: "Sealed — anaerobic preservation started", hi: "वायुरोधी सील — किण्वन आरंभ" } },
      { date: "02 Sep 2026", moisture: "62.0%", ph: "3.9", qualityScore: "GRADE A+", notes: { en: "Optimal preservation verified", hi: "उत्कृष्ट संरक्षण प्रमाणित" } },
    ],
    signature: { en: "Simple AI Model Analytic Report", hi: "सरल AI मॉडल विश्लेषणात्मक रिपोर्ट" },
  },
};

/* Add 14 days to a date string */
function addDays(dateStr, days) {
  const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const parts = dateStr.split(" ");
  if (parts.length < 3) return "25 Sep 2026";
  const [d, m, y] = parts;
  const dt = new Date(Number(y), months[m] || 8, Number(d) || 11);
  dt.setDate(dt.getDate() + days);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function LabReportPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lang, showToast } = useDashboard();

  /* Language toggle EN / HI */
  const [reportLang, setReportLang] = useState(lang === "hi" ? "hi" : "en");
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);

  const batch = getBatchById(id);
  const savedReport = getBatchReport(id);

  const baseScan = SCAN_DATA[id] || {
    ...SCAN_DATA["PC-9482"],
    id: id || "PC-9482",
    batchNumber: `BN-2026-${(id || "001").slice(-3)}`,
  };

  const scan = {
    ...baseScan,
    id: batch?.id || baseScan.id,
    batchNumber: batch?.batchNumber || baseScan.batchNumber,
    lotType: batch ? { en: batch.typeLabel || batch.typeKey, hi: batch.typeLabel || batch.typeKey } : baseScan.lotType,
    date: savedReport?.analyzedAt || baseScan.date,
    time: savedReport?.analyzedTime || baseScan.time,
    farmerInfoDefault: savedReport ? {
      ...baseScan.farmerInfoDefault,
      feedType: batch?.typeLabel || savedReport.answers?.fodderType || baseScan.farmerInfoDefault.feedType,
      storageDuration: `${getBatchAgeDays(batch)} days`,
      farmerObservation: savedReport.answers?.badSmell || baseScan.farmerInfoDefault.farmerObservation,
    } : baseScan.farmerInfoDefault,
  };

  const isHi = reportLang === "hi";
  const L = (en, hi) => (isHi ? hi : en);

  // Stored user questionnaire history
  const [farmerHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(`pashuchaara_farmer_history_${id}`) ||
                    localStorage.getItem("pashuchaara_latest_farmer_history");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });

  const reportURL = `${window.location.origin}/history/${id}/report`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: L("Simple AI Model Analytic Report", "सरल AI मॉडल विश्लेषणात्मक रिपोर्ट"),
          text: L(`Diagnostic Screening Report – Batch ${scan.id}`, `डायग्नोस्टिक स्क्रीनिंग रिपोर्ट – बैच ${scan.id}`),
          url: reportURL,
        });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(reportURL).catch(() => {});
      showToast(L("Report link copied.", "रिपोर्ट लिंक कॉपी हो गया।"));
    }
  };

  const handlePrint = () => window.print();

  const validUntil = addDays(scan.date, 14);

  const displayFarmerInfo = {
    feedType: farmerHistory?.feedType || scan.farmerInfoDefault.feedType,
    storageDuration: farmerHistory?.storageDuration || scan.farmerInfoDefault.storageDuration,
    storageCondition: farmerHistory?.storageCondition || scan.farmerInfoDefault.storageCondition,
    moistureExposure: farmerHistory?.moistureExposure || scan.farmerInfoDefault.moistureExposure,
    farmerObservation: farmerHistory?.farmerObservation || scan.farmerInfoDefault.farmerObservation,
    recordedAt: farmerHistory?.recordedAt || `${scan.date}, ${scan.time}`,
  };

  return (
    <>
      {/* ─── Formal Monochrome Print Stylesheet ─── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          body { background: #ffffff !important; }
          @page { size: A4; margin: 10mm 12mm; }
        }
      `}</style>

      <div className="relative min-h-screen w-full overflow-x-hidden flex justify-center bg-slate-100 dark:bg-slate-950 antialiased print-page font-sans">
        <div className="relative z-10 w-full max-w-[480px] min-h-screen flex flex-col bg-white dark:bg-slate-900 border-x border-slate-300 dark:border-slate-800 print:bg-white print:border-none print:max-w-full">

          {/* ══════════════ TOP ACTION BAR (Screen only) ══════════════ */}
          <div className="no-print sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-3.5 py-2.5 flex items-center gap-2">
            <button
              onClick={() => navigate(`/history/${id}/info`)}
              className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold cursor-pointer hover:bg-slate-700 shrink-0 text-slate-200"
              aria-label="Back"
            >
              ←
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold tracking-tight truncate leading-tight text-white">
                {L("Analytical Report", "विश्लेषणात्मक रिपोर्ट")} | {scan.id}
              </p>
              <p className="text-[9px] text-slate-400 font-mono">
                REF: {scan.batchNumber}
              </p>
            </div>

            {/* Language Toggle EN | HI */}
            <div className="flex rounded border border-slate-700 overflow-hidden shrink-0">
              {["en", "hi"].map((l) => (
                <button
                  key={l}
                  onClick={() => setReportLang(l)}
                  className={`px-2 py-0.5 text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                    reportLang === l
                      ? "bg-white text-slate-900 font-black"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs cursor-pointer hover:bg-slate-700 shrink-0 text-slate-200"
              aria-label="Share"
              title="Share"
            >
              ↗
            </button>

            {/* Print / Download */}
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-white text-slate-900 text-[10px] font-bold cursor-pointer transition-colors shrink-0"
            >
              {L("Print / PDF", "प्रिंट / PDF")}
            </button>
          </div>

          {/* ══════════════ PROFESSIONAL LAB REPORT BODY ══════════════ */}
          <div className="p-4 space-y-3.5 flex-1 print:p-0 print:space-y-3 text-slate-900 dark:text-slate-100 print:text-black">

            {/* ── 1. Formal Institutional Header ── */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[8.5px] font-bold tracking-widest text-slate-500 uppercase">
                    {L("ANALYTICAL DIAGNOSTIC SCREENING REPORT", "विश्लेषणात्मक डायग्नोस्टिक स्क्रीनिंग रिपोर्ट")}
                  </p>
                  <h1 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                    {L("Simple AI Model Analytic Report", "सरल AI मॉडल विश्लेषणात्मक रिपोर्ट")}
                  </h1>
                  <p className="text-[9px] text-slate-600 dark:text-slate-400">
                    {L("Fodder & Silage Quality Diagnostic Assessment System", "चारा व साइलेज गुणवत्ता परीक्षण एवं विश्लेषण प्रणाली")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="border border-slate-900 dark:border-slate-300 px-2 py-0.5 text-[8px] font-black tracking-wider uppercase bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {scan.isSafe ? L("STATUS: NORMAL", "स्थिति: सामान्य") : L("STATUS: ATTENTION", "स्थिति: ध्यान दें")}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-[8.5px] text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 font-semibold">{L("Analysis Date / Time", "विश्लेषण दिनांक / समय")}:</span>
                  <span className="ml-1 font-mono font-bold text-slate-900 dark:text-slate-100">{scan.date}, {scan.time}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">{L("Validity Period", "वैधता अवधि")}:</span>
                  <span className="ml-1 font-mono font-bold text-slate-900 dark:text-slate-100">{validUntil}</span>
                </div>
              </div>
            </div>

            {/* ── 2. Batch Identifiers Table ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 1: Sample & Batch Identification", "भाग 1: नमूना एवं बैच पहचान विवरण")}
                </h2>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 dark:divide-slate-800 text-[8.5px]">
                <div className="p-2">
                  <span className="text-slate-500 block text-[7.5px] uppercase">{L("Batch Identifier", "बैच आईडी")}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{scan.id}</span>
                </div>
                <div className="p-2">
                  <span className="text-slate-500 block text-[7.5px] uppercase">{L("Lot / Batch Number", "बैच संख्या")}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{scan.batchNumber}</span>
                </div>
                <div className="p-2">
                  <span className="text-slate-500 block text-[7.5px] uppercase">{L("Sample Type", "चारा प्रकार")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{isHi ? scan.lotType.hi : scan.lotType.en}</span>
                </div>
                <div className="p-2">
                  <span className="text-slate-500 block text-[7.5px] uppercase">{L("Storage Age", "भंडारण आयु")}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{getBatchAgeDays(batch)} {L("Days", "दिन")}</span>
                </div>
                <div className="p-2 col-span-2">
                  <span className="text-slate-500 block text-[7.5px] uppercase">{L("Storage Facility", "भंडारण स्थान")}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{isHi ? scan.location.hi : scan.location.en}</span>
                </div>
              </div>
            </div>

            {/* ── 3. Nutritional Quality (Per 100g DM) ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 2: Nutritional Quality (Per 100g Dry Matter)", "भाग 2: पोषण गुणवत्ता विश्लेषण (प्रति 100 ग्राम DM)")}
                </h2>
                <span className="text-[8px] font-mono uppercase font-bold text-slate-700 dark:text-slate-300">
                  {isHi ? scan.nutritional.assessment.hi : scan.nutritional.assessment.en}
                </span>
              </div>

              <div className="p-2 space-y-2 text-[8.5px]">
                <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[8px] uppercase text-slate-600 dark:text-slate-400">
                      <th className="p-1.5 font-bold">{L("Nutritional Parameter", "पोषण मापदण्ड")}</th>
                      <th className="p-1.5 font-bold font-mono text-right">{L("Estimated Value", "अनुमानित मान")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr>
                      <td className="p-1.5 text-slate-700 dark:text-slate-300">{L("Crude Protein", "क्रूड प्रोटीन")}</td>
                      <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">{scan.nutritional.crudeProtein}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-slate-700 dark:text-slate-300">{L("Crude Fiber", "क्रूड फाइबर")}</td>
                      <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">{scan.nutritional.crudeFiber}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-slate-700 dark:text-slate-300">{L("Net Energy Value", "शुद्ध ऊर्जा मान")}</td>
                      <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">{scan.nutritional.energyValue}</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-slate-700 dark:text-slate-300">{L("Moisture Condition", "नमी स्तर")}</td>
                      <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                        {isHi ? scan.nutritional.moistureCondition.hi : scan.nutritional.moistureCondition.en}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-slate-700 dark:text-slate-300">{L("Mineral Profile", "खनिज संरचना")}</td>
                      <td className="p-1.5 font-mono text-right text-slate-900 dark:text-slate-100">
                        {isHi ? scan.nutritional.mineralProfile.hi : scan.nutritional.mineralProfile.en}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-[7.5px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  <p>* {L("Approximate reference-based values per 100g dry matter. Not direct laboratory measurements.", "प्रति 100 ग्राम शुष्क पदार्थ संदर्भ-आधारित अनुमानित मान। प्रत्यक्ष लैब माप नहीं।")}</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    {L("Notice: Quantitative laboratory / NIR testing is recommended for certified nutritional profiling.", "सूचना: प्रमाणित पोषण विश्लेषण हेतु प्रयोगशाला / NIR परीक्षण अनुशंसित है।")}
                  </p>
                </div>
              </div>
            </div>

            {/* ── 4. Contamination & Physical Screening ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 3: Contamination & Physical Screening", "भाग 3: संदूषण एवं भौतिक स्क्रीनिंग परीक्षण")}
                </h2>
              </div>

              <div className="p-2">
                <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 text-[8.5px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[8px] uppercase text-slate-600 dark:text-slate-400">
                      <th className="p-1.5 font-bold">{L("Screening Assay", "परीक्षण मद")}</th>
                      <th className="p-1.5 font-bold text-right">{L("Observation", "परीक्षण परिणाम")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {[
                      { label: L("Fungal Spoilage Indicators", "फंगल / कवक क्षरण संकेतक"), val: isHi ? scan.contamination.fungalIndicators.hi : scan.contamination.fungalIndicators.en },
                      { label: L("Mould Colony Growth", "फफूंद कॉलोनी विकास"), val: isHi ? scan.contamination.mouldGrowth.hi : scan.contamination.mouldGrowth.en },
                      { label: L("Water Damage / Moisture Ingress", "जल क्षति / नमी रिसाव"), val: isHi ? scan.contamination.waterDamage.hi : scan.contamination.waterDamage.en },
                      { label: L("Foreign Inert Material", "अक्रिय अपशिष्ट पदार्थ"), val: isHi ? scan.contamination.foreignMaterial.hi : scan.contamination.foreignMaterial.en },
                      { label: L("Sand / Silica Particulates", "बालू / सिलिका कण"), val: isHi ? scan.contamination.sandSilica.hi : scan.contamination.sandSilica.en },
                    ].map((row) => (
                      <tr key={row.label}>
                        <td className="p-1.5 text-slate-700 dark:text-slate-300 font-medium">{row.label}</td>
                        <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">{row.val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[7.5px] text-slate-500 mt-1">
                  {L("Screening based on visual diagnostic indices. Chemical & toxin assays require dedicated laboratory testing.", "दृश्य डायग्नोस्टिक सूचकांकों पर आधारित। रासायनिक एवं विषैले तत्वों हेतु समर्पित लैब परीक्षण आवश्यक है।")}
                </p>
              </div>
            </div>

            {/* ── 5. Silage Quality Profile ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 4: Silage & Fodder Quality Metrics", "भाग 4: साइलेज व चारा गुणवत्ता मापदण्ड")}
                </h2>
              </div>

              <div className="p-2 space-y-1.5 text-[8.5px]">
                <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[8px] uppercase text-slate-600 dark:text-slate-400">
                      <th className="p-1.5 font-bold">{L("Diagnostic Parameter", "मापदण्ड")}</th>
                      <th className="p-1.5 font-bold font-mono">{L("Target", "मानक")}</th>
                      <th className="p-1.5 font-bold font-mono text-right">{L("Measured", "मापा गया")}</th>
                      <th className="p-1.5 font-bold text-right">{L("Evaluation", "स्थिति")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {scan.metrics.map((m, i) => (
                      <tr key={i}>
                        <td className="p-1.5 text-slate-700 dark:text-slate-300 font-medium">{isHi ? m.param.hi : m.param.en}</td>
                        <td className="p-1.5 font-mono text-slate-500">{m.target}</td>
                        <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">{m.measured}</td>
                        <td className="p-1.5 text-right font-mono font-bold text-[8px] text-slate-800 dark:text-slate-200">
                          {m.status === "Normal" ? L("NORMAL", "सामान्य") : L("DEVIATION", "विचलन")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 6. Storage & Environmental Telemetry ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 5: Storage Facility & Ambient Telemetry", "भाग 5: भंडारण स्थिति एवं वातावरणीय डेटा")}
                </h2>
                <span className="text-[8px] font-mono text-slate-600 dark:text-slate-400">
                  TEMP: {scan.storageEnvironment.temp} | RH: {scan.storageEnvironment.humidity}
                </span>
              </div>

              <div className="p-2 text-[8.5px] space-y-1">
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">{L("Facility Structural Condition", "भंडारण संरचना स्थिति")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{isHi ? scan.storageEnvironment.storageCondition.hi : scan.storageEnvironment.storageCondition.en}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">{L("Precipitation / Moisture Exposure", "नमी जोखिम स्थिति")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{isHi ? scan.storageEnvironment.moistureExposure.hi : scan.storageEnvironment.moistureExposure.en}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-600 dark:text-slate-400">{L("Hermetic Sealing Integrity", "वायुरोधी सील स्थिति")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{isHi ? scan.storageEnvironment.sealingCondition.hi : scan.storageEnvironment.sealingCondition.en}</span>
                </div>
              </div>
            </div>

            {/* ── 7. Farmer Declared Lot History ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 6: Farmer Declared Lot History", "भाग 6: किसान द्वारा दर्ज लॉट इतिहास")}
                </h2>
                <span className="text-[7.5px] font-mono uppercase text-slate-500 font-bold">
                  {farmerHistory ? L("VERIFIED RECORD", "सत्यापित रिकॉर्ड") : L("DEFAULT RECORD", "डिफ़ॉल्ट रिकॉर्ड")}
                </span>
              </div>

              <div className="p-2 text-[8.5px] space-y-1">
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">{L("Fodder Type", "चारे का प्रकार")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{displayFarmerInfo.feedType}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">{L("Storage Duration", "भंडारण अवधि")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{displayFarmerInfo.storageDuration}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">{L("Storage Condition", "सुरक्षा स्थिति")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{displayFarmerInfo.storageCondition}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">{L("Moisture Exposure", "नमी संपर्क")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{displayFarmerInfo.moistureExposure}</span>
                </div>
                <div className="pt-0.5">
                  <span className="text-slate-500 text-[7.5px] block uppercase">{L("Farmer Sensory Observation", "किसान का संवेदी अवलोकन")}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{displayFarmerInfo.farmerObservation}</span>
                </div>
              </div>
            </div>

            {/* ── 8. Standard Action Protocols ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 7: Standard Operating Directives & Protocols", "भाग 7: मानक संचालन निर्देश एवं प्रोटोकॉल")}
                </h2>
              </div>

              <div className="p-2 space-y-2 text-[8.5px]">
                <div>
                  <p className="font-black uppercase text-[8px] text-slate-800 dark:text-slate-200 tracking-wider">
                    {L("1. Immediate Directives", "1. तत्काल निर्देश")}
                  </p>
                  <div className="pl-2 border-l-2 border-slate-800 dark:border-slate-400 space-y-0.5 mt-0.5">
                    {(isHi ? scan.actionProtocol.immediate.hi : scan.actionProtocol.immediate.en).map((act, i) => (
                      <p key={i} className="text-slate-800 dark:text-slate-200">{act}</p>
                    ))}
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                  <p className="font-black uppercase text-[8px] text-slate-800 dark:text-slate-200 tracking-wider">
                    {L("2. Corrective Directives", "2. सुधारात्मक निर्देश")}
                  </p>
                  <div className="pl-2 border-l-2 border-slate-500 space-y-0.5 mt-0.5">
                    {(isHi ? scan.actionProtocol.corrective.hi : scan.actionProtocol.corrective.en).map((act, i) => (
                      <p key={i} className="text-slate-800 dark:text-slate-200">{act}</p>
                    ))}
                  </div>
                </div>

                <div className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="font-bold text-[8px] uppercase text-slate-700 dark:text-slate-300">
                    {L("3. Quantitative Verification Requirement", "3. मात्रात्मक सत्यापन आवश्यकता")}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                    {isHi ? scan.actionProtocol.verification.hi : scan.actionProtocol.verification.en}
                  </p>
                </div>
              </div>
            </div>

            {/* ── 9. Feed Safety & Material Utilization ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 8: Feed Safety & Material Utilization", "भाग 8: आहार सुरक्षा एवं सामग्री उपयोग")}
                </h2>
              </div>

              <div className="p-2 space-y-1.5 text-[8.5px]">
                <p className="font-black uppercase text-slate-900 dark:text-white">
                  {isHi ? scan.wasteUtilization.title.hi : scan.wasteUtilization.title.en}
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isHi ? scan.wasteUtilization.detail.hi : scan.wasteUtilization.detail.en}
                </p>
                <div className="pt-1 flex justify-end no-print">
                  <button
                    type="button"
                    onClick={() => setPartnerModalOpen(true)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[8.5px] font-bold rounded cursor-pointer transition-colors"
                  >
                    {L("Partner Recovery Directory →", "पार्टनर डायरेक्टरी देखें →")}
                  </button>
                </div>
              </div>
            </div>

            {/* ── 10. Inspection History (Latest 2 Scans) ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 9: Longitudinal Inspection History", "भाग 9: कालानुक्रमिक निरीक्षण इतिहास")}
                </h2>
              </div>

              <div className="p-2">
                <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 text-[8px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 uppercase text-slate-600 dark:text-slate-400">
                      <th className="p-1 font-bold">{L("Date", "दिनांक")}</th>
                      <th className="p-1 font-bold font-mono">{L("Moisture", "नमी")}</th>
                      <th className="p-1 font-bold font-mono">{L("pH", "pH")}</th>
                      <th className="p-1 font-bold font-mono">{L("Grade", "ग्रेड")}</th>
                      <th className="p-1 font-bold">{L("Notes", "टिप्पणी")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {[...scan.scanHistory].reverse().map((s, i) => (
                      <tr key={i}>
                        <td className="p-1 font-medium whitespace-nowrap">{s.date}</td>
                        <td className="p-1 font-mono">{s.moisture}</td>
                        <td className="p-1 font-mono">{s.ph}</td>
                        <td className="p-1 font-mono font-bold text-slate-900 dark:text-slate-100">{s.qualityScore}</td>
                        <td className="p-1 text-slate-600 dark:text-slate-400">{isHi ? s.notes.hi : s.notes.en}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 11. QR Code & Authority Sign-off ── */}
            <div className="border border-slate-400 dark:border-slate-600 p-2.5 flex items-center gap-3">
              <div className="shrink-0 flex flex-col items-center gap-0.5">
                <div className="p-1 bg-white border border-slate-300">
                  <QRCodeSVG value={reportURL} size={58} fgColor="#0f172a" bgColor="#ffffff" level="M" />
                </div>
                <span className="text-[6.5px] font-mono text-slate-500 uppercase">{L("Verify QR", "सत्यापन QR")}</span>
              </div>
              <div className="flex-1 space-y-0.5 text-[8px]">
                <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider">
                  {L("Diagnostic Sign-off & Electronic Endorsement", "डायग्नोस्टिक हस्ताक्षर एवं इलेक्ट्रॉनिक प्रमाणीकरण")}
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {isHi ? scan.signature.hi : scan.signature.en}
                </p>
                <p className="text-[7px] text-slate-500 dark:text-slate-400 leading-tight">
                  {L(
                    "Official Simple AI Model Analytic Report. Valid for 14 calendar days from date of issuance. Electronic verification enabled.",
                    "आधिकारिक सरल AI मॉडल विश्लेषणात्मक रिपोर्ट। जारी होने की तिथि से 14 कैलेंडर दिवस तक मान्य।"
                  )}
                </p>
              </div>
            </div>

            {/* Screen-only bottom spacer */}
            <div className="h-12 no-print" />
          </div>
        </div>
      </div>

      {/* ── Partner Recovery Modal ── */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-sm w-full p-4 border border-slate-300 dark:border-slate-700 space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                {L("Organic Waste Utilization Directory", "जैविक अपशिष्ट उपयोग डायरेक्टरी")}
              </h3>
              <button
                onClick={() => setPartnerModalOpen(false)}
                aria-label="Close"
                className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {L(
                "Authorized regional facilities for anaerobic bio-methanation and industrial organic composting.",
                "बायोगैस एवं जैविक कम्पोस्टिंग हेतु अधिकृत क्षेत्रीय संयंत्र केंद्र।"
              )}
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2 border border-slate-300 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">Karnal Bio-Gas Cooperative</div>
                <div className="text-[10px] text-slate-500">Anaerobic wet digester intake • Direct pickup</div>
              </div>
              <div className="p-2 border border-slate-300 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">Haryana Organic Compost Cluster</div>
                <div className="text-[10px] text-slate-500">Bulk biomass processing & recovery</div>
              </div>
            </div>
            <button
              onClick={() => {
                setPartnerModalOpen(false);
                showToast(L("Inquiry registered.", "पूछताछ दर्ज की गई।"));
              }}
              className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800"
            >
              {L("Contact Nearest Facility", "निकटतम केंद्र से संपर्क करें")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
