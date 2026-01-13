import { useState, useEffect } from "react";
import AppLayout from "@/layouts/AppLayout";
import {
  getIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  Integration,
  IntegrationType,
} from "@/api/integrations";
import { WhatsAppLogo, TelegramLogo, SlackLogo, SMSLogo, ChatGPTLogo } from "@/components/ChannelLogos";

const INTEGRATION_CONFIGS: Record<
  IntegrationType,
  {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    fields: Array<{ 
      key: string; 
      label: string; 
      type: string; 
      placeholder: string; 
      required?: boolean;
      help?: string;
      example?: string;
    }>;
  }
> = {
  WHATSAPP: {
    name: "WhatsApp",
    icon: WhatsAppLogo,
    description: "Send WhatsApp messages via Meta WhatsApp Business API. Get your credentials from Meta Business Suite > WhatsApp Manager.",
    fields: [
      {
        key: "accessToken",
        label: "Access Token",
        type: "password",
        placeholder: "EAAVkoZCaSqs8BQWvkh7cXMtANNFPFGYZBXw...",
        required: true,
        help: "Generate from Meta Developers > Your App > WhatsApp > API Setup > Access Token. Click 'Generate access token' and select your WhatsApp Business account.",
        example: "EAAVkoZCaSqs8BQWvkh7cXMtANNFPFGYZBXw8618PKK0ZAkXHBXjyaPh5duW3iw6fEWwnGQzjZB0qA0vX8JZCH6ziCZAZCJdZCvZAWJ7X3cj9mMmL9E2aqDOtSX3W9TyQNViZCuDNy3GC4x7KhbjEqArI2WaGFXsRAnt8av7ZCF0yRRKFfpgehaNZAnIftEbZAivT0XZA4p9XVgayDAkkveXQk1RXXjxZAADreEawOencQqTkSZByJnoajc3cavw8FAst1rHkzAivtnqPXfQDv6ZCLRa70kERimohn"
      },
      {
        key: "phoneNumberId",
        label: "Phone Number ID",
        type: "text",
        placeholder: "890306300839946",
        required: true,
        help: "NOT your phone number! This is a Meta-assigned numeric ID. Find it in Meta Business Suite > WhatsApp Manager > Phone Numbers > Your number > Details, or in the API Setup page under 'From' section.",
        example: "890306300839946"
      },
      {
        key: "businessAccountId",
        label: "WhatsApp Business Account ID",
        type: "text",
        placeholder: "877118511632210",
        required: false,
        help: "Your WhatsApp Business Account ID. Find it in Meta Business Suite > WhatsApp Manager > Settings > Business Settings, or in the API Setup page.",
        example: "877118511632210"
      },
      {
        key: "apiVersion",
        label: "Graph API Version",
        type: "text",
        placeholder: "v22.0",
        required: false,
        help: "Meta Graph API version. Default is v22.0. Check Meta Developers documentation for the latest version.",
        example: "v22.0"
      },
    ],
  },
  TELEGRAM: {
    name: "Telegram",
    icon: TelegramLogo,
    description: "Send messages via Telegram Bot",
    fields: [
      { key: "botToken", label: "Bot Token", type: "password", placeholder: "123456:ABC...", required: true },
    ],
  },
  SLACK: {
    name: "Slack",
    icon: SlackLogo,
    description: "Send messages to Slack channels",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", type: "text", placeholder: "https://hooks.slack.com/services/...", required: true },
    ],
  },
  SMS: {
    name: "SMS",
    icon: SMSLogo,
    description: "Send SMS messages via Twilio or other providers",
    fields: [
      { key: "provider", label: "Provider", type: "select", placeholder: "Select provider", required: true },
      { key: "accountSid", label: "Account SID", type: "text", placeholder: "AC...", required: true },
      { key: "authToken", label: "Auth Token", type: "password", placeholder: "Your auth token", required: true },
      { key: "fromNumber", label: "From Number", type: "text", placeholder: "+1234567890", required: true },
    ],
  },
  CHATGPT: {
    name: "ChatGPT",
    icon: ChatGPTLogo,
    description: "Use OpenAI's ChatGPT API",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-...", required: true },
    ],
  },
  OPENAI: {
    name: "OpenAI",
    icon: ChatGPTLogo,
    description: "Use OpenAI API",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-...", required: true },
    ],
  },
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"integrations">("integrations");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<IntegrationType | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    try {
      const data = await getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error("Failed to load integrations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(type: IntegrationType) {
    setEditing(type);
    try {
      const integration = await getIntegration(type);
      if (integration?.config) {
        // Migrate old field names to new field names for WhatsApp
        const config = integration.config as any;
        const migratedConfig: any = { ...config };
        
        if (type === "WHATSAPP") {
          // Map old Twilio fields to new Meta API fields
          if (config.authToken && !config.accessToken) {
            migratedConfig.accessToken = config.authToken;
          }
          // Don't migrate fromNumber to phoneNumberId - they're different things
          // phoneNumberId must be set manually by the user
          // Remove old Twilio-specific fields from display
          delete migratedConfig.provider;
          delete migratedConfig.accountSid;
          delete migratedConfig.fromNumber;
          // Keep authToken for backward compatibility but don't show it
        }
        
        setFormData(migratedConfig);
      } else {
        setFormData({});
      }
    } catch (error) {
      console.error("Failed to load integration:", error);
      setFormData({});
    }
  }

  async function handleSave(type: IntegrationType) {
    setSaving(true);
    try {
      const config = INTEGRATION_CONFIGS[type];
      const integration = integrations.find((i) => i.type === type);

      if (integration) {
        await updateIntegration(type, {
          config: formData,
          enabled: true,
        });
      } else {
        await createIntegration(type, config.name, formData, true);
      }

      await loadIntegrations();
      setEditing(null);
      setFormData({});
    } catch (error: any) {
      alert(`Failed to save integration: ${error?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(type: IntegrationType) {
    if (!confirm("Are you sure you want to delete this integration?")) return;

    try {
      await deleteIntegration(type);
      await loadIntegrations();
    } catch (error: any) {
      alert(`Failed to delete integration: ${error?.message || "Unknown error"}`);
    }
  }

  async function handleToggle(type: IntegrationType, enabled: boolean) {
    try {
      await updateIntegration(type, { enabled });
      await loadIntegrations();
    } catch (error: any) {
      alert(`Failed to update integration: ${error?.message || "Unknown error"}`);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("integrations")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "integrations"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Integrations
          </button>
        </div>

        {/* Integrations Tab */}
        {activeTab === "integrations" && (
          <div className="space-y-4">
            <p className="text-slate-600 mb-6">
              Configure API credentials for workflow channels. These credentials are encrypted and stored securely.
            </p>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Loading integrations...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {(Object.keys(INTEGRATION_CONFIGS) as IntegrationType[]).map((type) => {
                  const config = INTEGRATION_CONFIGS[type];
                  const Icon = config.icon;
                  const integration = integrations.find((i) => i.type === type);
                  const isEditing = editing === type;

                  return (
                    <div
                      key={type}
                      className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Icon className="w-6 h-6 text-slate-700" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{config.name}</h3>
                              <p className="text-sm text-slate-600">{config.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {integration && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={integration.enabled}
                                  onChange={(e) => handleToggle(type, e.target.checked)}
                                  className="cursor-pointer"
                                />
                                <span className="text-sm text-slate-600">
                                  {integration.enabled ? "Enabled" : "Disabled"}
                                </span>
                              </label>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                            {config.fields.map((field) => (
                              <div key={field.key} className="space-y-1">
                                <label className="block text-sm font-medium text-slate-700">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {field.help && (
                                  <p className="text-xs text-slate-500 mb-1">{field.help}</p>
                                )}
                                {field.example && (
                                  <div className="mb-2 p-2 bg-slate-50 rounded border border-slate-200">
                                    <p className="text-xs text-slate-600 font-medium mb-1">Example:</p>
                                    <code className="text-xs text-slate-700 break-all">{field.example}</code>
                                  </div>
                                )}
                                {field.type === "select" ? (
                                  <select
                                    value={formData[field.key] || ""}
                                    onChange={(e) =>
                                      setFormData({ ...formData, [field.key]: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="">Select provider</option>
                                    {field.key === "provider" && (
                                      <>
                                        <option value="twilio">Twilio</option>
                                        <option value="webhook">Webhook</option>
                                      </>
                                    )}
                                  </select>
                                ) : (
                                  <input
                                    type={field.type}
                                    value={formData[field.key] || ""}
                                    onChange={(e) =>
                                      setFormData({ ...formData, [field.key]: e.target.value })
                                    }
                                    placeholder={field.placeholder}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                )}
                              </div>
                            ))}
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleSave(type)}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                              >
                                {saving ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={() => {
                                  setEditing(null);
                                  setFormData({});
                                }}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                              >
                                Cancel
                              </button>
                              {integration && (
                                <button
                                  onClick={() => handleDelete(type)}
                                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium ml-auto"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4">
                            {integration ? (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Configured
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                Not configured
                              </div>
                            )}
                            <button
                              onClick={() => handleEdit(type)}
                              className="mt-3 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm"
                            >
                              {integration ? "Edit Configuration" : "Configure"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
