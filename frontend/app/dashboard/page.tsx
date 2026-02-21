"use client";

import { useState } from "react";
import { Upload, Phone, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [callStatus, setCallStatus] = useState<Record<string, string>>({});

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/api/leads/upload`, { method: "POST", body: form });
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (e) {
      alert("Upload failed");
    }
    setUploading(false);
  }

  async function startCall(lead: any) {
    setCallStatus((s) => ({ ...s, [lead.id]: "calling" }));
    try {
      const res = await fetch(`${API}/api/calls/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_phone: lead.phone,
          lead_name: lead.name,
          agent_name: "Agent",
          brokerage: "Harvey Realty",
          area: lead.area || "the area",
        }),
      });
      const data = await res.json();
      setCallStatus((s) => ({ ...s, [lead.id]: data.status || "initiated" }));
    } catch {
      setCallStatus((s) => ({ ...s, [lead.id]: "failed" }));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-neutral-500 mb-8">Upload leads and start calling.</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Leads", value: leads.length },
          { label: "Calls Today", value: Object.keys(callStatus).length },
          { label: "Showings Booked", value: 0 },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-5">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-neutral-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upload */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-accent" /> Upload Leads CSV
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          CSV columns: <code className="text-neutral-400">name, phone, email, area, notes</code>
        </p>
        <div className="flex gap-3 items-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-white file:font-medium file:cursor-pointer hover:file:bg-accent-hover"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            Upload
          </button>
        </div>
      </div>

      {/* Leads table */}
      {leads.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-neutral-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Area</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">{lead.name}</td>
                  <td className="px-4 py-3 text-neutral-400">{lead.phone}</td>
                  <td className="px-4 py-3 text-neutral-400">{lead.area || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      callStatus[lead.id] === "initiated" ? "bg-green-500/10 text-green-400" :
                      callStatus[lead.id] === "calling" ? "bg-yellow-500/10 text-yellow-400" :
                      callStatus[lead.id] === "failed" ? "bg-red-500/10 text-red-400" :
                      "bg-neutral-500/10 text-neutral-400"
                    }`}>
                      {callStatus[lead.id] || "new"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => startCall(lead)}
                      disabled={callStatus[lead.id] === "calling"}
                      className="text-accent hover:text-accent-hover text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
