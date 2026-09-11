import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserQRCodeReader } from "@zxing/browser";
import SubPageHeader from "../components/layout/SubPageHeader";
import { useDashboard } from "../context/DashboardContext";
import batchService from "../services/batches/batchService";

const LOCAL_REPORT_IDS = new Set(["PC-9482", "PC-9411", "PC-9380"]);

function reportIdFromUrl(value) {
  try {
    const url = new URL(value);
    const match = url.pathname.match(/^\/history\/([^/]+)\/report\/?$/);
    return url.origin === window.location.origin && match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export default function QrReportScannerPage() {
  const navigate = useNavigate();
  const { showToast } = useDashboard();
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const readerRef = useRef(new BrowserQRCodeReader());
  const handledRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [message, setMessage] = useState("Point camera at report QR code.");

  const stopScanner = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsScanning(false);
  };

  useEffect(() => () => stopScanner(), []);

  const openReport = async (rawValue) => {
    const value = rawValue.trim();
    if (!value) return;

    const localReportId = reportIdFromUrl(value) || (LOCAL_REPORT_IDS.has(value) ? value : null);
    if (localReportId) {
      stopScanner();
      navigate(`/history/${encodeURIComponent(localReportId)}/report`);
      return;
    }

    const batchCode = value.replace(/^batch:/i, "").trim();
    setMessage("Looking up saved report…");
    try {
      const batch = await batchService.resolveByCode(batchCode);
      stopScanner();
      navigate(`/qr-report/batch/${encodeURIComponent(batch.batch_code)}`, { state: { batch } });
    } catch (error) {
      const detail = error?.message || "No saved report found for this QR code.";
      setMessage(detail);
      showToast(detail);
      handledRef.current = false;
    }
  };

  const startScanner = async () => {
    handledRef.current = false;
    setMessage("Opening camera…");
    setIsScanning(true);
    try {
      const controls = await readerRef.current.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        videoRef.current,
        (result) => {
          if (result && !handledRef.current) {
            handledRef.current = true;
            openReport(result.getText());
          }
        },
      );
      controlsRef.current = controls;
      if (handledRef.current) controls.stop();
      setMessage("Scanning QR code…");
    } catch {
      setIsScanning(false);
      setMessage("Camera unavailable. Upload QR image or enter code below.");
    }
  };

  const scanImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("Reading QR image…");
    const imageUrl = URL.createObjectURL(file);
    try {
      const result = await readerRef.current.decodeFromImageUrl(imageUrl);
      await openReport(result.getText());
    } catch {
      setMessage("QR code not readable. Try a clearer image.");
    } finally {
      URL.revokeObjectURL(imageUrl);
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f0] dark:bg-[#0a0c0b] text-[#1a1c18] dark:text-white">
      <div className="mx-auto min-h-screen max-w-[430px] bg-[#faf7f0] dark:bg-[#101210] shadow-2xl">
        <SubPageHeader title="Scan QR report" subtitle="Open saved PDF report" backTo="/dashboard" />
        <main className="p-4 space-y-5">
          <section className="overflow-hidden rounded-3xl border border-[#ded5c2] bg-black shadow-sm">
            <div className="relative aspect-square">
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
              {!isScanning && <div className="absolute inset-0 grid place-items-center text-center text-sm font-bold text-white/80 p-8">Camera off</div>}
              <div className="pointer-events-none absolute inset-[17%] rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_999px_rgba(0,0,0,.28)]" />
            </div>
          </section>

          <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">{message}</p>

          <button onClick={isScanning ? stopScanner : startScanner} className="w-full rounded-2xl bg-[#059652] px-4 py-3.5 text-sm font-black text-white shadow-md">
            {isScanning ? "Stop camera" : "Open QR camera"}
          </button>

          <label className="block w-full cursor-pointer rounded-2xl border border-emerald-700/30 bg-emerald-50 px-4 py-3.5 text-center text-sm font-bold text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            Upload QR image
            <input className="hidden" type="file" accept="image/*" onChange={scanImage} />
          </label>

          <form onSubmit={(event) => { event.preventDefault(); openReport(manualCode); }} className="space-y-2 border-t border-[#ded5c2] pt-5">
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">Or enter batch / report code</label>
            <div className="flex gap-2">
              <input value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="Example: PC-9482" className="min-w-0 flex-1 rounded-xl border border-[#ded5c2] bg-white px-3 py-2.5 text-sm outline-none dark:bg-[#161c18]" />
              <button className="rounded-xl bg-[#2d5a3d] px-4 text-sm font-bold text-white">Open</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
