"use client";

import { useEffect, useState } from "react";
import { Phone, Play, Clock, CheckCircle, XCircle } from "lucide-react";

interface Call {
  id: string;
  lead_name: string;
  lead_phone: string;
  status: string;
  started_at: string | null;
  duration_seconds: number | null;
  recording_url: string | null;
  summary: string | null;
  qualification: Record<string, any> | null;
}

const statusConfig: Record<string, { icon: any; color: string }> = {
  completed: { icon: CheckCircle, color: "text-green-400" },
  "in-progress": { icon: Phone, color: "text-yellow-400" },
  queued: { icon: Clock, color: "text-neutral-400" },
  initiated: { icon: Phone, color: "text-blue-400" },
  failed: { icon: XCircle, color: "text-red-400" },
};

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${API}/api/calls`)
      .then((r) => r.json())
      .then((d) => setCalls(d.calls || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Call History</h1>
      <p className="text-neutral-500 mb-8">All outbound calls and their results.</p>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : calls.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <Phone className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400">No calls yet. Upload leads and start calling.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-neutral-500">
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Recording</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => {
                const sc = statusConfig[call.status] || statusConfig.queued;
                const Icon = sc.icon;
                return (
                  <tr key={call.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">{call.lead_name}</td>
                    <td className="px-4 py-3 text-neutral-400">{call.lead_phone}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 ${sc.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {call.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}:${String(call.duration_seconds % 60).padStart(2, "0")}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {call.started_at ? new Date(call.started_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {call.recording_url ? (
                        <a href={call.recording_url} target="_blank" className="text-accent hover:text-accent-hover flex items-center gap-1">
                          <Play className="w-3.5 h-3.5" /> Play
                        </a>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
