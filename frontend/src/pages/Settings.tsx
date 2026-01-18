import { useState, useEffect } from "react";
import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/auth/AuthContext";
import {
  getIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  Integration,
  IntegrationType,
} from "@/api/integrations";
import {
  getEmailIntegration,
  updateEmailIntegration,
  testEmailConfiguration,
  EmailIntegration,
} from "@/api/email-integration";
import { apiFetch } from "@/api/apiFetch";
import { WhatsAppLogo, TelegramLogo, SlackLogo, SMSLogo, ChatGPTLogo } from "@/components/ChannelLogos";
import { useToastContext } from "@/contexts/ToastContext";
import { useDialogContext } from "@/contexts/DialogContext";

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
  const { isSuperAdmin, role } = useAuth();
  const [activeTab, setActiveTab] = useState<"integrations" | "email" | "audit-logs">("integrations");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToastContext();
  const dialog = useDialogContext();
  const [editing, setEditing] = useState<IntegrationType | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditView, setAuditView] = useState<"logs" | "sessions">("logs");
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    from: "",
    to: "",
    action: "",
    actor: "",
    resource: "",
  });
  
  // Email integration state
  const [emailIntegration, setEmailIntegration] = useState<EmailIntegration | null>(null);
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailFormData, setEmailFormData] = useState<EmailIntegration>({
    provider: 'LITE_CRM',
  });
  const [emailSaving, setEmailSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const testEmailValid = !testEmail || emailRegex.test(testEmail);

  useEffect(() => {
    loadIntegrations();
    loadEmailIntegration();
  }, []);

  async function loadEmailIntegration() {
    try {
      const data = await getEmailIntegration();
      setEmailIntegration(data);
      setEmailFormData(data);
    } catch (error) {
      console.error("Failed to load email integration:", error);
    } finally {
      setEmailLoading(false);
    }
  }

  async function loadAuditLogs(page = 1) {
    if (!isSuperAdmin && role !== "ADMIN") return;
    try {
      setAuditLoading(true);
      const params = new URLSearchParams();
      if (auditFilters.from) params.set("from", auditFilters.from);
      if (auditFilters.to) params.set("to", auditFilters.to);
      if (auditFilters.action) params.set("action", auditFilters.action);
      if (auditFilters.actor) params.set("actor", auditFilters.actor);
      if (auditFilters.resource) params.set("resource", auditFilters.resource);
      params.set("page", String(page));
      params.set("limit", "50");
      const endpoint = isSuperAdmin ? "/admin/audit-logs" : "/workspace-admin/audit-logs";
      const data = await apiFetch(`${endpoint}?${params.toString()}`);
      setAuditLogs(data.items || []);
      setAuditPage(data.pagination?.page || page);
      setAuditTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      toast.error(`Failed to load audit logs: ${error?.message || "Unknown error"}`);
    } finally {
      setAuditLoading(false);
    }
  }

  async function loadAuditSessions() {
    if (!isSuperAdmin && role !== "ADMIN") return;
    try {
      setSessionLoading(true);
      const params = new URLSearchParams();
      if (auditFilters.from) params.set("from", auditFilters.from);
      if (auditFilters.to) params.set("to", auditFilters.to);
      if (auditFilters.actor) params.set("actor", auditFilters.actor);
      const endpoint = isSuperAdmin ? "/admin/audit-sessions" : "/workspace-admin/audit-sessions";
      const data = await apiFetch(`${endpoint}?${params.toString()}`);
      setSessionLogs(data || []);
    } catch (error: any) {
      toast.error(`Failed to load session analytics: ${error?.message || "Unknown error"}`);
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleEmailEdit() {
    setEmailEditing(true);
    if (emailIntegration) {
      setEmailFormData(emailIntegration);
    }
  }

  async function handleEmailSave() {
    try {
      setEmailSaving(true);
      await updateEmailIntegration(emailFormData);
      await loadEmailIntegration();
      setEmailEditing(false);
      toast.success("Email integration updated successfully!");
    } catch (error: any) {
      toast.error(`Failed to save email integration: ${error?.message || "Unknown error"}`);
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleEmailTest() {
    if (!testEmail.trim()) {
      toast.warning("Enter a test email address");
      return;
    }
    if (!testEmailValid) {
      toast.warning("Enter a valid test email address");
      return;
    }
    try {
      await testEmailConfiguration(testEmail.trim());
      toast.success("Test email sent successfully! Check your inbox.");
    } catch (error: any) {
      toast.error(`Failed to send test email: ${error?.message || "Unknown error"}`);
    }
  }

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
      toast.error(`Failed to save integration: ${error?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(type: IntegrationType) {
    const confirmed = await dialog.confirm({
      title: "Delete Integration",
      message: "Are you sure you want to delete this integration?",
      confirmText: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteIntegration(type);
      await loadIntegrations();
    } catch (error: any) {
      toast.error(`Failed to delete integration: ${error?.message || "Unknown error"}`);
    }
  }

  async function handleToggle(type: IntegrationType, enabled: boolean) {
    try {
      await updateIntegration(type, { enabled });
      await loadIntegrations();
    } catch (error: any) {
      toast.error(`Failed to update integration: ${error?.message || "Unknown error"}`);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6 flex gap-4">
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
          <button
            onClick={() => setActiveTab("email")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "email"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Email Integration
          </button>
          {(isSuperAdmin || role === "ADMIN") && (
            <button
              onClick={() => {
                setActiveTab("audit-logs");
                loadAuditLogs(1);
              }}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "audit-logs"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Audit Logs
            </button>
          )}
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

        {/* Email Integration Tab */}
        {activeTab === "email" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Email Integration</h2>
            <p className="text-sm text-slate-600 mb-6">
              Configure how emails are sent from workflows. You can use Lite CRM's mail service or set up your own SMTP.
            </p>

            {emailLoading ? (
              <p className="text-slate-500">Loading email configuration...</p>
            ) : emailEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Provider</label>
                  <select
                    value={emailFormData.provider}
                    onChange={(e) =>
                      setEmailFormData({ ...emailFormData, provider: e.target.value as 'LITE_CRM' | 'CUSTOM_SMTP' })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="LITE_CRM">Use Lite CRM Mail</option>
                    <option value="CUSTOM_SMTP">Use Custom SMTP</option>
                  </select>
                </div>

                {emailFormData.provider === 'CUSTOM_SMTP' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Host</label>
                      <input
                        type="text"
                        value={emailFormData.smtpHost || ""}
                        onChange={(e) => setEmailFormData({ ...emailFormData, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Port</label>
                      <input
                        type="number"
                        value={emailFormData.smtpPort || ""}
                        onChange={(e) => setEmailFormData({ ...emailFormData, smtpPort: parseInt(e.target.value) || undefined })}
                        placeholder="587"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SMTP User</label>
                      <input
                        type="text"
                        value={emailFormData.smtpUser || ""}
                        onChange={(e) => setEmailFormData({ ...emailFormData, smtpUser: e.target.value })}
                        placeholder="your-email@example.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Password</label>
                      <input
                        type="password"
                        value={emailFormData.smtpPass || ""}
                        onChange={(e) => setEmailFormData({ ...emailFormData, smtpPass: e.target.value })}
                        placeholder="Your SMTP password or app password"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={emailFormData.smtpSecure || false}
                        onChange={(e) => setEmailFormData({ ...emailFormData, smtpSecure: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-slate-700">Use SSL/TLS (secure connection)</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">From Email</label>
                      <input
                        type="email"
                        value={emailFormData.fromEmail || ""}
                        onChange={(e) => setEmailFormData({ ...emailFormData, fromEmail: e.target.value })}
                        placeholder="no-reply@example.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">From Name</label>
                      <input
                        type="text"
                        value={emailFormData.fromName || ""}
                        onChange={(e) => setEmailFormData({ ...emailFormData, fromName: e.target.value })}
                        placeholder="Lite CRM"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEmailSave}
                    disabled={emailSaving}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 font-medium"
                  >
                    {emailSaving ? "Saving..." : "Save Configuration"}
                  </button>
                  <button
                    onClick={() => {
                      setEmailEditing(false);
                      loadEmailIntegration();
                    }}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        testEmail && !testEmailValid ? "border-red-300" : "border-slate-300"
                      }`}
                    />
                    <button
                      onClick={handleEmailTest}
                      className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                    >
                      Test Email
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Current Provider:</strong> {emailIntegration?.provider === 'CUSTOM_SMTP' ? 'Custom SMTP' : 'Lite CRM Mail'}
                  </p>
                  {emailIntegration?.provider === 'CUSTOM_SMTP' && (
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><strong>SMTP Host:</strong> {emailIntegration.smtpHost || 'Not set'}</p>
                      <p><strong>SMTP Port:</strong> {emailIntegration.smtpPort || 'Not set'}</p>
                      <p><strong>SMTP User:</strong> {emailIntegration.smtpUser || 'Not set'}</p>
                      <p><strong>From Email:</strong> {emailIntegration.fromEmail || 'Not set'}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleEmailEdit}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm"
                >
                  {emailIntegration ? "Edit Configuration" : "Configure Email Integration"}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "audit-logs" && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Audit Logs</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAuditView("logs");
                      loadAuditLogs(1);
                    }}
                    className={`px-3 py-1.5 rounded text-sm ${
                      auditView === "logs"
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300 text-slate-700"
                    }`}
                  >
                    Logs
                  </button>
                  <button
                    onClick={() => {
                      setAuditView("sessions");
                      loadAuditSessions();
                    }}
                    className={`px-3 py-1.5 rounded text-sm ${
                      auditView === "sessions"
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300 text-slate-700"
                    }`}
                  >
                    Sessions
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs text-slate-500">From</label>
                  <input
                    type="date"
                    value={auditFilters.from}
                    onChange={(e) => setAuditFilters((prev) => ({ ...prev, from: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">To</label>
                  <input
                    type="date"
                    value={auditFilters.to}
                    onChange={(e) => setAuditFilters((prev) => ({ ...prev, to: e.target.value }))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Action</label>
                  <input
                    type="text"
                    value={auditFilters.action}
                    onChange={(e) => setAuditFilters((prev) => ({ ...prev, action: e.target.value }))}
                    placeholder="workspace.update"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Actor</label>
                  <input
                    type="text"
                    value={auditFilters.actor}
                    onChange={(e) => setAuditFilters((prev) => ({ ...prev, actor: e.target.value }))}
                    placeholder="name or email"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Resource</label>
                  <input
                    type="text"
                    value={auditFilters.resource}
                    onChange={(e) => setAuditFilters((prev) => ({ ...prev, resource: e.target.value }))}
                    placeholder="workflow"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setAuditFilters({ from: "", to: "", action: "", actor: "", resource: "" });
                    if (auditView === "sessions") {
                      loadAuditSessions();
                    } else {
                      loadAuditLogs(1);
                    }
                  }}
                  className="px-3 py-2 border border-slate-300 rounded text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    if (auditView === "sessions") {
                      loadAuditSessions();
                    } else {
                      loadAuditLogs(1);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {auditView === "logs" ? (
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {auditLoading ? (
                  <div className="text-center py-10 text-slate-500">Loading audit logs...</div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">No audit logs found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="text-left px-4 py-3">Time</th>
                          <th className="text-left px-4 py-3">Action</th>
                          <th className="text-left px-4 py-3">Resource</th>
                          <th className="text-left px-4 py-3">Actor</th>
                          <th className="text-left px-4 py-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {auditLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="px-4 py-3 text-slate-700">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                            </td>
                            <td className="px-4 py-3 text-slate-800 font-medium">{log.action}</td>
                            <td className="px-4 py-3 text-slate-700">
                              {log.resource}
                              {log.resourceId ? ` • ${log.resourceId}` : ""}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {log.actor?.name || "Unknown"}
                              {log.actor?.email ? ` (${log.actor.email})` : ""}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {log.metadata ? JSON.stringify(log.metadata) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {sessionLoading ? (
                  <div className="text-center py-10 text-slate-500">Loading sessions...</div>
                ) : sessionLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">No sessions found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="text-left px-4 py-3">User</th>
                          <th className="text-left px-4 py-3">Session Start</th>
                          <th className="text-left px-4 py-3">Last Activity</th>
                          <th className="text-left px-4 py-3">Session End</th>
                          <th className="text-left px-4 py-3">Duration</th>
                          <th className="text-left px-4 py-3">Active (min)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {sessionLogs.map((session) => (
                          <tr key={session.sessionId}>
                            <td className="px-4 py-3 text-slate-700">
                              {session.actor?.name || "Unknown"}
                              {session.actor?.email ? ` (${session.actor.email})` : ""}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {session.startAt ? new Date(session.startAt).toLocaleString() : "-"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {session.lastActivityAt ? new Date(session.lastActivityAt).toLocaleString() : "-"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {session.endAt ? new Date(session.endAt).toLocaleString() : "-"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {session.durationSeconds ? `${Math.round(session.durationSeconds / 60)} min` : "-"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {session.activeMinutes ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {auditView === "logs" && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Page {auditPage} of {auditTotalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadAuditLogs(Math.max(1, auditPage - 1))}
                    disabled={auditPage <= 1}
                    className="px-3 py-2 border border-slate-300 rounded text-sm disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => loadAuditLogs(Math.min(auditTotalPages, auditPage + 1))}
                    disabled={auditPage >= auditTotalPages}
                    className="px-3 py-2 border border-slate-300 rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
