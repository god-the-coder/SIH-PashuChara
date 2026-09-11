import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SubPageHeader from "../components/layout/SubPageHeader";
import batchService from "../services/batches/batchService";

const labelize = (value = "") => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function CloudBatchReportPage() {
  const { batchCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(state?.batch ?? null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (batch) return;
    batchService.resolveByCode(batchCode).then(setBatch).catch((requestError) => setError(requestError?.message || "Saved report not found."));
  }, [batch, batchCode]);

  if (error) return <div className="grid min-h-screen place-items-center p-6 text-center text-sm text-gray-600">{error}</div>;
  if (!batch) return <div className="grid min-h-screen place-items-center text-sm text-gray-500">Loading saved report…</div>;

  const result = batch.latest_result;
  return (
    <div className="min-h-screen bg-[#faf7f0] text-[#1a1c18] print:bg-white">
      <style>{`@media print { .no-print { display: none !important; } @page { size: A4; margin: 18mm; } }`}</style>
      <div className="mx-auto min-h-screen max-w-[680px] bg-[#faf7f0] shadow-2xl print:max-w-none print:shadow-none">
        <div className="no-print"><SubPageHeader title="Saved QR report" subtitle={batch.batch_code} backTo="/qr-report" /></div>
        <main className="space-y-5 p-5 sm:p-8">
          <header className="border-b-2 border-[#064d2c] pb-4">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">PashuChaara AI</p>
            <h1 className="mt-1 text-2xl font-black text-[#064d2c]">Batch quality report</h1>
            <p className="mt-2 text-sm text-gray-600">{batch.batch_label || "Unnamed batch"} · {batch.batch_code}</p>
          </header>

          {result ? <>
            <section className="rounded-2xl border border-[#ded5c2] bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase text-gray-500">Assessment</p>
              <h2 className="mt-1 text-xl font-black text-[#064d2c]">{result.headline || labelize(result.risk_category)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{result.summary}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-emerald-50 p-2"><b>{labelize(result.risk_category)}</b><br />Risk</div>
                <div className="rounded-xl bg-emerald-50 p-2"><b>{result.risk_score ?? "—"}</b><br />Score</div>
                <div className="rounded-xl bg-emerald-50 p-2"><b>{result.confidence ?? "—"}</b><br />Confidence</div>
              </div>
            </section>
            {result.recommendations?.length > 0 && <section className="rounded-2xl border border-[#ded5c2] bg-white p-4"><h2 className="font-black text-[#064d2c]">Recommendations</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">{result.recommendations.map((item) => <li key={item.id || item.text}>{item.text || item.recommendation || String(item)}</li>)}</ul></section>}
          </> : <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">Batch found. No saved inspection report yet.</section>}

          <section className="grid grid-cols-2 gap-3 text-sm"><div><b>Material</b><br />{labelize(batch.material_type)}</div><div><b>Quantity</b><br />{batch.quantity_kg ?? "—"} kg</div><div><b>Inspection type</b><br />{labelize(batch.inspection_type)}</div><div><b>Updated</b><br />{batch.updated_at ? new Date(batch.updated_at).toLocaleDateString() : "—"}</div></section>
          <button onClick={() => window.print()} className="no-print w-full rounded-2xl bg-[#059652] py-3.5 text-sm font-black text-white">Download PDF</button>
          <button onClick={() => navigate("/qr-report")} className="no-print w-full text-sm font-bold text-emerald-800">Scan another QR</button>
        </main>
      </div>
    </div>
  );
}
