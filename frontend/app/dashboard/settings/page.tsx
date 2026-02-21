"use client";

import { useState } from "react";
import { Settings, Key, Calendar, Mic } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    agent_name: "",
    brokerage: "",
    twilio_phone: "",
    deepgram_key: "",
    anthropic_key: "",
    elevenlabs_key: "",
    elevenlabs_voice: "",
    google_calendar_id: "",
  });

  const update = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  const sections = [
    {
      title: "Agent Info",
      icon: Settings,
      fields: [
        { key: "agent_name", label: "Agent Name", placeholder: "Jane Smith" },
        { key: "brokerage", label: "Brokerage", placeholder: "Harvey Realty" },
      ],
    },
    {
      title: "API Keys",
      icon: Key,
      fields: [
        { key: "twilio_phone", label: "Twilio Phone Number", placeholder: "+1..." },
        { key: "deepgram_key", label: "Deepgram API Key", placeholder: "dg_...", secret: true },
        { key: "anthropic_key", label: "Anthropic API Key", placeholder: "sk-ant-...", secret: true },
        { key: "elevenlabs_key", label: "ElevenLabs API Key", placeholder: "el_...", secret: true },
      ],
    },
    {
      title: "Voice Settings",
      icon: Mic,
      fields: [
        { key: "elevenlabs_voice", label: "ElevenLabs Voice ID", placeholder: "pNInz6obpgDQGcFmaJgB" },
      ],
    },
    {
      title: "Calendar",
      icon: Calendar,
      fields: [
        { key: "google_calendar_id", label: "Google Calendar ID", placeholder: "your@gmail.com" },
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
      <p className="text-neutral-500 mb-8">Configure your API keys, voice, and calendar.</p>

      <div className="space-y-6 max-w-2xl">
        {sections.map((section) => (
          <div key={section.title} className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <section.icon className="w-5 h-5 text-accent" />
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.fields.map((field: any) => (
                <div key={field.key}>
                  <label className="block text-sm text-neutral-400 mb-1.5">{field.label}</label>
                  <input
                    type={field.secret ? "password" : "text"}
                    value={(settings as any)[field.key]}
                    onChange={(e) => update(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}
