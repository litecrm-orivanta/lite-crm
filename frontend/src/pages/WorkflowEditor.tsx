import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import AppLayout from "@/layouts/AppLayout";
import { getWorkflow, createWorkflow, updateWorkflow } from "@/api/workflows";
import { WhatsAppLogo, TelegramLogo, SlackLogo, SMSLogo, ChatGPTLogo } from "@/components/ChannelLogos";

// Node Types
const TRIGGER_EVENTS = [
  { value: "LEAD_CREATED", label: "Lead Created" },
  { value: "LEAD_UPDATED", label: "Lead Updated" },
  { value: "LEAD_STAGE_CHANGED", label: "Lead Stage Changed" },
  { value: "LEAD_ASSIGNED", label: "Lead Assigned" },
  { value: "TASK_CREATED", label: "Task Created" },
  { value: "TASK_COMPLETED", label: "Task Completed" },
  { value: "USER_INVITED", label: "User Invited" },
];

// Enhanced Handle Component with better styling
function EnhancedHandle({ type, position, id, style, ...props }: any) {
  return (
    <Handle
      type={type}
      position={position}
      id={id}
      style={{
        width: "12px",
        height: "12px",
        border: "2px solid white",
        backgroundColor: type === "source" ? "#3b82f6" : "#10b981",
        ...style,
      }}
      className="!bg-blue-500 hover:!bg-blue-600 transition-colors"
      {...props}
    />
  );
}

// Custom Node Components
function TriggerNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-purple-100 border-2 border-purple-500 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-shadow relative group">
      <EnhancedHandle type="source" position={Position.Bottom} />
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold"
        title="Delete node"
      >
        ×
      </button>
      <div className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
        <span>⚡</span> Trigger
      </div>
      <select
        value={data.triggerEvent || ""}
        onChange={(e) => data.onChange?.({ triggerEvent: e.target.value })}
        className="w-full text-sm border border-purple-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Select event...</option>
        {TRIGGER_EVENTS.map((evt) => (
          <option key={evt.value} value={evt.value}>
            {evt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function HttpRequestNode({ data }: any) {
  return (
    <div className="px-4 py-3 bg-blue-100 border-2 border-blue-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow">
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
        <span>🌐</span> HTTP Request
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-blue-700 mb-1">Method</label>
          <select
            value={data.config?.method || "GET"}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, method: e.target.value } })
            }
            className="w-full border border-blue-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
            <option>PATCH</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-blue-700 mb-1">URL</label>
          <input
            type="text"
            value={data.config?.url || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, url: e.target.value } })
            }
            placeholder="https://api.example.com/endpoint"
            className="w-full border border-blue-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-blue-700 mb-1">Body (JSON)</label>
          <textarea
            value={data.config?.body || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, body: e.target.value } })
            }
            placeholder='{"key": "value"}'
            className="w-full border border-blue-300 rounded px-2 py-1 text-xs bg-white h-20 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function EmailNode({ data }: any) {
  return (
    <div className="px-4 py-3 bg-green-100 border-2 border-green-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow">
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-green-900 mb-2 flex items-center gap-2">
        <span>📧</span> Send Email
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-green-700 mb-1">To</label>
          <input
            type="text"
            value={data.config?.to || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, to: e.target.value } })
            }
            placeholder="user@example.com or {{data.lead.email}}"
            className="w-full border border-green-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-xs text-green-700 mb-1">Subject</label>
          <input
            type="text"
            value={data.config?.subject || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, subject: e.target.value } })
            }
            placeholder="Email subject"
            className="w-full border border-green-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-xs text-green-700 mb-1">Body</label>
          <textarea
            value={data.config?.body || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, body: e.target.value } })
            }
            placeholder="Email body (use {{variables}} for interpolation)"
            className="w-full border border-green-300 rounded px-2 py-1 text-xs bg-white h-20 focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );
}

function DelayNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-yellow-100 border-2 border-yellow-500 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
        <span>⏱️</span> Delay
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-yellow-700 mb-1">Delay (ms)</label>
          <input
            type="number"
            value={data.config?.delayMs || 1000}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, delayMs: parseInt(e.target.value) || 1000 } })
            }
            className="w-full border border-yellow-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>
    </div>
  );
}

function ConditionNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-orange-100 border-2 border-orange-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} id="true" style={{ backgroundColor: "#10b981" }} />
      <EnhancedHandle type="source" position={Position.Right} id="false" style={{ backgroundColor: "#ef4444" }} />
      <div className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
        <span>❓</span> Condition
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-orange-700 mb-1">Left Value</label>
          <input
            type="text"
            value={data.config?.leftValue || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, leftValue: e.target.value } })
            }
            placeholder="{{data.lead.stage}}"
            className="w-full border border-orange-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-xs text-orange-700 mb-1">Operator</label>
          <select
            value={data.config?.operator || "=="}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, operator: e.target.value } })
            }
            className="w-full border border-orange-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-orange-500"
          >
            <option value="==">Equals (==)</option>
            <option value="!=">Not Equals (!=)</option>
            <option value=">">Greater Than (&gt;)</option>
            <option value="<">Less Than (&lt;)</option>
            <option value=">=">Greater or Equal (&gt;=)</option>
            <option value="<=">Less or Equal (&lt;=)</option>
            <option value="contains">Contains</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-orange-700 mb-1">Right Value</label>
          <input
            type="text"
            value={data.config?.rightValue || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, rightValue: e.target.value } })
            }
            placeholder="WON"
            className="w-full border border-orange-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
}

function SetVariableNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-indigo-100 border-2 border-indigo-500 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
        <span>📝</span> Set Variable
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-indigo-700 mb-1">Variable Name</label>
          <input
            type="text"
            value={data.config?.variableName || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, variableName: e.target.value } })
            }
            placeholder="myVar"
            className="w-full border border-indigo-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs text-indigo-700 mb-1">Value</label>
          <input
            type="text"
            value={data.config?.variableValue || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, variableValue: e.target.value } })
            }
            placeholder="{{data.lead.name}}"
            className="w-full border border-indigo-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}

function WebhookNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-pink-100 border-2 border-pink-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-pink-900 mb-2 flex items-center gap-2">
        <span>🔗</span> Webhook
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-pink-700 mb-1">URL</label>
          <input
            type="text"
            value={data.config?.url || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, url: e.target.value } })
            }
            placeholder="https://webhook.example.com"
            className="w-full border border-pink-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div>
          <label className="block text-xs text-pink-700 mb-1">Method</label>
          <select
            value={data.config?.method || "POST"}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, method: e.target.value } })
            }
            className="w-full border border-pink-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-pink-500"
          >
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// New Node Components
function ChatGPTNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-emerald-100 border-2 border-emerald-500 rounded-lg shadow-lg min-w-[280px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
        <ChatGPTLogo className="w-5 h-5" />
        <span>ChatGPT</span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-emerald-700 mb-1">API Key</label>
          <input
            type="password"
            value={data.config?.apiKey || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, apiKey: e.target.value } })
            }
            placeholder="sk-... (or use env var)"
            className="w-full border border-emerald-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs text-emerald-700 mb-1">Model</label>
          <select
            value={data.config?.model || "gpt-3.5-turbo"}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, model: e.target.value } })
            }
            className="w-full border border-emerald-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option>gpt-3.5-turbo</option>
            <option>gpt-4</option>
            <option>gpt-4-turbo</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-emerald-700 mb-1">Prompt</label>
          <textarea
            value={data.config?.prompt || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, prompt: e.target.value } })
            }
            placeholder="Enter your prompt (use {{variables}} for interpolation)"
            className="w-full border border-emerald-300 rounded px-2 py-1 text-xs bg-white h-24 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}

function WhatsAppNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-teal-100 border-2 border-teal-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
        <WhatsAppLogo className="w-5 h-5" />
        <span>WhatsApp</span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-teal-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={data.config?.phoneNumber || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, phoneNumber: e.target.value } })
            }
            placeholder="+1234567890 or {{data.lead.phone}}"
            className="w-full border border-teal-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-xs text-teal-700 mb-1">Message</label>
          <textarea
            value={data.config?.message || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, message: e.target.value } })
            }
            placeholder="Message content"
            className="w-full border border-teal-300 rounded px-2 py-1 text-xs bg-white h-20 focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <p className="text-xs text-teal-600 italic">Note: Requires WhatsApp API setup</p>
      </div>
    </div>
  );
}

function TelegramNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-cyan-100 border-2 border-cyan-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-cyan-900 mb-2 flex items-center gap-2">
        <TelegramLogo className="w-5 h-5" />
        <span>Telegram</span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-cyan-700 mb-1">Bot Token</label>
          <input
            type="password"
            value={data.config?.botToken || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, botToken: e.target.value } })
            }
            placeholder="123456:ABC..."
            className="w-full border border-cyan-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs text-cyan-700 mb-1">Chat ID</label>
          <input
            type="text"
            value={data.config?.chatId || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, chatId: e.target.value } })
            }
            placeholder="123456789 or {{data.chatId}}"
            className="w-full border border-cyan-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs text-cyan-700 mb-1">Message</label>
          <textarea
            value={data.config?.message || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, message: e.target.value } })
            }
            placeholder="Message content"
            className="w-full border border-cyan-300 rounded px-2 py-1 text-xs bg-white h-20 focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}

function SlackNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-violet-100 border-2 border-violet-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-violet-900 mb-2 flex items-center gap-2">
        <SlackLogo className="w-5 h-5" />
        <span>Slack</span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-violet-700 mb-1">Webhook URL</label>
          <input
            type="text"
            value={data.config?.webhookUrl || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, webhookUrl: e.target.value } })
            }
            placeholder="https://hooks.slack.com/services/..."
            className="w-full border border-violet-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs text-violet-700 mb-1">Channel (optional)</label>
          <input
            type="text"
            value={data.config?.channel || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, channel: e.target.value } })
            }
            placeholder="#general"
            className="w-full border border-violet-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs text-violet-700 mb-1">Message</label>
          <textarea
            value={data.config?.message || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, message: e.target.value } })
            }
            placeholder="Message content"
            className="w-full border border-violet-300 rounded px-2 py-1 text-xs bg-white h-20 focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>
    </div>
  );
}

function SMSNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-rose-100 border-2 border-rose-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-rose-900 mb-2 flex items-center gap-2">
        <SMSLogo className="w-5 h-5" />
        <span>SMS</span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-rose-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={data.config?.phoneNumber || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, phoneNumber: e.target.value } })
            }
            placeholder="+1234567890 or {{data.lead.phone}}"
            className="w-full border border-rose-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div>
          <label className="block text-xs text-rose-700 mb-1">Message</label>
          <textarea
            value={data.config?.message || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, message: e.target.value } })
            }
            placeholder="SMS content (160 chars max)"
            className="w-full border border-rose-300 rounded px-2 py-1 text-xs bg-white h-20 focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <p className="text-xs text-rose-600 italic">Note: Requires SMS API setup</p>
      </div>
    </div>
  );
}

function LogNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-gray-100 border-2 border-gray-500 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <span>📝</span> Log
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-gray-700 mb-1">Level</label>
          <select
            value={data.config?.level || "info"}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, level: e.target.value } })
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-gray-500"
          >
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">Message</label>
          <textarea
            value={data.config?.message || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, message: e.target.value } })
            }
            placeholder="Log message (use {{variables}} for interpolation)"
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white h-20 focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>
    </div>
  );
}

function TransformNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-amber-100 border-2 border-amber-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
        <span>🔄</span> Transform
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-amber-700 mb-1">Transform Type</label>
          <select
            value={data.config?.transformType || "json"}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, transformType: e.target.value } })
            }
            className="w-full border border-amber-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-amber-500"
          >
            <option value="json">Parse JSON</option>
            <option value="stringify">Stringify JSON</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="trim">Trim</option>
            <option value="replace">Replace</option>
          </select>
        </div>
        {data.config?.transformType === "replace" && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-amber-700 mb-1">Search</label>
              <input
                type="text"
                value={data.config?.search || ""}
                onChange={(e) =>
                  data.onChange?.({ config: { ...data.config, search: e.target.value } })
                }
                placeholder="Search pattern"
                className="w-full border border-amber-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-amber-700 mb-1">Replace</label>
              <input
                type="text"
                value={data.config?.replace || ""}
                onChange={(e) =>
                  data.onChange?.({ config: { ...data.config, replace: e.target.value } })
                }
                placeholder="Replace with"
                className="w-full border border-amber-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-sky-100 border-2 border-sky-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-sky-900 mb-2 flex items-center gap-2">
        <span>🔍</span> Filter
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-sky-700 mb-1">Field</label>
          <input
            type="text"
            value={data.config?.filterField || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, filterField: e.target.value } })
            }
            placeholder="fieldName or leave empty for array items"
            className="w-full border border-sky-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-xs text-sky-700 mb-1">Operator</label>
          <select
            value={data.config?.filterOperator || "=="}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, filterOperator: e.target.value } })
            }
            className="w-full border border-sky-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-sky-500"
          >
            <option value="==">Equals</option>
            <option value="!=">Not Equals</option>
            <option value=">">Greater Than</option>
            <option value="<">Less Than</option>
            <option value=">=">Greater or Equal</option>
            <option value="<=">Less or Equal</option>
            <option value="contains">Contains</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-sky-700 mb-1">Value</label>
          <input
            type="text"
            value={data.config?.filterValue || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, filterValue: e.target.value } })
            }
            placeholder="Filter value"
            className="w-full border border-sky-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>
    </div>
  );
}

function LoopNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-fuchsia-100 border-2 border-fuchsia-500 rounded-lg shadow-lg min-w-[250px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-fuchsia-900 mb-2 flex items-center gap-2">
        <span>🔁</span> Loop
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-fuchsia-700 mb-1">Loop Type</label>
          <select
            value={data.config?.loopType || "foreach"}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, loopType: e.target.value } })
            }
            className="w-full border border-fuchsia-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-fuchsia-500"
          >
            <option value="foreach">For Each</option>
            <option value="while">While</option>
          </select>
        </div>
        {data.config?.loopType === "while" && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-fuchsia-700 mb-1">Condition</label>
              <input
                type="text"
                value={data.config?.condition || ""}
                onChange={(e) =>
                  data.onChange?.({ config: { ...data.config, condition: e.target.value } })
                }
                placeholder="true or {{variable}}"
                className="w-full border border-fuchsia-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-xs text-fuchsia-700 mb-1">Max Iterations</label>
              <input
                type="number"
                value={data.config?.maxIterations || 100}
                onChange={(e) =>
                  data.onChange?.({ config: { ...data.config, maxIterations: parseInt(e.target.value) || 100 } })
                }
                className="w-full border border-fuchsia-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-fuchsia-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MergeNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-lime-100 border-2 border-lime-500 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} id="input1" />
      <EnhancedHandle type="target" position={Position.Left} id="input2" style={{ top: "50%" }} />
      <EnhancedHandle type="source" position={Position.Bottom} />
      <div className="font-semibold text-lime-900 mb-2 flex items-center gap-2">
        <span>🔀</span> Merge
      </div>
      <p className="text-xs text-lime-700">Merges data from multiple inputs</p>
    </div>
  );
}

function SplitNode({ data, id }: any) {
  return (
    <div className="px-4 py-3 bg-stone-100 border-2 border-stone-500 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-shadow relative group">
      <button
        onClick={() => data.onDelete?.(id)}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold z-10"
        title="Delete node"
      >
        ×
      </button>
      <EnhancedHandle type="target" position={Position.Top} />
      <EnhancedHandle type="source" position={Position.Bottom} id="output1" />
      <EnhancedHandle type="source" position={Position.Right} id="output2" style={{ top: "50%" }} />
      <div className="font-semibold text-stone-900 mb-2 flex items-center gap-2">
        <span>✂️</span> Split
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-xs text-stone-700 mb-1">Split Field (optional)</label>
          <input
            type="text"
            value={data.config?.splitField || ""}
            onChange={(e) =>
              data.onChange?.({ config: { ...data.config, splitField: e.target.value } })
            }
            placeholder="fieldName"
            className="w-full border border-stone-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-stone-500"
          />
        </div>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  httpRequest: HttpRequestNode,
  email: EmailNode,
  delay: DelayNode,
  condition: ConditionNode,
  setVariable: SetVariableNode,
  webhook: WebhookNode,
  chatgpt: ChatGPTNode,
  whatsapp: WhatsAppNode,
  telegram: TelegramNode,
  slack: SlackNode,
  sms: SMSNode,
  log: LogNode,
  transform: TransformNode,
  filter: FilterNode,
  loop: LoopNode,
  merge: MergeNode,
  split: SplitNode,
};

// Node categories for better organization
const NODE_CATEGORIES = [
  {
    name: "Triggers",
    nodes: [{ type: "trigger", label: "Trigger", icon: "⚡", color: "purple" }],
  },
  {
    name: "Communication",
    nodes: [
      { type: "email", label: "Email", icon: "📧", color: "green" },
      { type: "whatsapp", label: "WhatsApp", icon: WhatsAppLogo, color: "teal" },
      { type: "telegram", label: "Telegram", icon: TelegramLogo, color: "cyan" },
      { type: "slack", label: "Slack", icon: SlackLogo, color: "violet" },
      { type: "sms", label: "SMS", icon: SMSLogo, color: "rose" },
    ],
  },
  {
    name: "AI & Integration",
    nodes: [
      { type: "chatgpt", label: "ChatGPT", icon: ChatGPTLogo, color: "emerald" },
      { type: "httpRequest", label: "HTTP Request", icon: "🌐", color: "blue" },
      { type: "webhook", label: "Webhook", icon: "🔗", color: "pink" },
    ],
  },
  {
    name: "Logic & Control",
    nodes: [
      { type: "condition", label: "Condition", icon: "❓", color: "orange" },
      { type: "delay", label: "Delay", icon: "⏱️", color: "yellow" },
      { type: "loop", label: "Loop", icon: "🔁", color: "fuchsia" },
    ],
  },
  {
    name: "Data",
    nodes: [
      { type: "setVariable", label: "Set Variable", icon: "📝", color: "indigo" },
      { type: "transform", label: "Transform", icon: "🔄", color: "amber" },
      { type: "filter", label: "Filter", icon: "🔍", color: "sky" },
      { type: "merge", label: "Merge", icon: "🔀", color: "lime" },
      { type: "split", label: "Split", icon: "✂️", color: "stone" },
      { type: "log", label: "Log", icon: "📝", color: "gray" },
    ],
  },
];

export default function WorkflowEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [workflowActive, setWorkflowActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNodePalette, setShowNodePalette] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load workflow if editing
  useEffect(() => {
    if (id) {
      loadWorkflow();
    }
  }, [id]);

  async function loadWorkflow() {
    if (!id) return;
    setLoading(true);
    try {
      console.log("Loading workflow:", id);
      const workflow = await getWorkflow(id);
      console.log("Workflow loaded:", workflow);
      
      if (!workflow) {
        throw new Error("Workflow not found");
      }

      setWorkflowName(workflow.name || "");
      setWorkflowDescription(workflow.description || "");
      setWorkflowActive(workflow.active !== undefined ? workflow.active : true);

      // Convert database nodes to ReactFlow nodes
      const flowNodes: Node[] = (workflow.nodes || []).map((node: any) => {
        // Convert database type (e.g., "HTTP_REQUEST") to frontend type (e.g., "httpRequest")
        let frontendType = (node.type || "").toLowerCase();
        // Handle SNAKE_CASE to camelCase conversions
        if (frontendType === "http_request") frontendType = "httpRequest";
        if (frontendType === "set_variable") frontendType = "setVariable";
        // All other types are already in correct format (chatgpt, whatsapp, etc.)
        
        const nodeId = node.nodeId || node.id || `node-${Date.now()}-${Math.random()}`;
        
        return {
          id: nodeId,
          type: frontendType || "httpRequest",
          position: { 
            x: node.position?.x || node.positionX || 0, 
            y: node.position?.y || node.positionY || 0 
          },
          data: {
            label: node.label || node.data?.label || "",
            config: node.config || node.data?.config || {},
            triggerEvent: node.triggerEvent || node.data?.triggerEvent || null,
            onChange: (updates: any) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n
                )
              );
            },
            onDelete: (id: string) => {
              if (confirm("Are you sure you want to delete this node?")) {
                setNodes((nds) => nds.filter((n) => n.id !== id));
                setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
              }
            },
          },
        };
      });

      // Convert database edges to ReactFlow edges
      const flowEdges: Edge[] = (workflow.edges || []).map((edge: any, index: number) => {
        const source = edge.source || edge.sourceNode?.nodeId || edge.sourceNodeId || `source-${index}`;
        const target = edge.target || edge.targetNode?.nodeId || edge.targetNodeId || `target-${index}`;
        const edgeId = edge.edgeId || edge.id || `edge-${index}`;
        
        return {
          id: edgeId,
          source: source,
          target: target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
          markerEnd: { type: MarkerType.ArrowClosed },
        };
      }).filter((edge: Edge) => edge.source && edge.target);

      console.log("Converted nodes:", flowNodes.length, "edges:", flowEdges.length);
      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (err: any) {
      console.error("Failed to load workflow:", err);
      const errorMessage = err?.message || err?.toString() || "Unknown error";
      alert(`Failed to load workflow: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  const onConnect = useCallback(
    (params: Connection) => {
      // Validate connection
      if (params.source === params.target) {
        alert("Cannot connect a node to itself");
        return;
      }
      setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
    },
    [setEdges]
  );

  function addNode(type: string) {
    const viewport = { x: 0, y: 0, zoom: 1 }; // Could get from ReactFlow instance
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1"),
        config: {},
        onChange: (updates: any) => {
          setNodes((nds) =>
            nds.map((n) => (n.id === newNode.id ? { ...n, data: { ...n.data, ...updates } } : n))
          );
        },
        onDelete: (nodeId: string) => {
          if (confirm("Are you sure you want to delete this node?")) {
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
          }
        },
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }

  async function saveWorkflow() {
    if (!workflowName.trim()) {
      alert("Workflow name is required");
      return;
    }

    // Check if trigger node exists
    const triggerNode = nodes.find((n) => n.type === "trigger");
    if (!triggerNode || !triggerNode.data?.triggerEvent) {
      alert("Please add a trigger node and select an event");
      return;
    }

    setSaving(true);
    try {
      console.log("Saving workflow:", { name: workflowName, nodes: nodes.length, edges: edges.length });
      
      const workflowData = {
        name: workflowName.trim(),
        description: workflowDescription?.trim() || null,
        active: workflowActive,
        nodes: nodes.map((node) => {
          // Convert frontend type (e.g., "httpRequest") to database type (e.g., "HTTP_REQUEST")
          let dbType = (node.type || "httpRequest").toUpperCase();
          // Handle camelCase to SNAKE_CASE conversions
          if (dbType === "HTTPREQUEST") dbType = "HTTP_REQUEST";
          if (dbType === "SETVARIABLE") dbType = "SET_VARIABLE";
          // All other types are already in correct format (CHATGPT, WHATSAPP, etc.)
          
          return {
            id: node.id,
            nodeId: node.id,
            type: dbType,
            label: node.data?.label || "",
            position: node.position || { x: 0, y: 0 },
            data: {
              label: node.data?.label || "",
              config: node.data?.config || {},
              triggerEvent: node.data?.triggerEvent || null,
            },
          };
        }),
        edges: edges.map((edge, index) => ({
          id: edge.id || `edge-${index}`,
          edgeId: edge.id || `edge-${index}`,
          source: edge.source,
          target: edge.target,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
        })),
      };

      console.log("Workflow data prepared:", workflowData);

      if (id) {
        const updated = await updateWorkflow(id, workflowData);
        console.log("Workflow updated:", updated);
      } else {
        const newWorkflow = await createWorkflow(workflowData);
        console.log("Workflow created:", newWorkflow);
        navigate(`/workflows/editor/${newWorkflow.id}`);
      }
      alert("Workflow saved successfully!");
    } catch (err: any) {
      console.error("Failed to save workflow:", err);
      const errorMessage = err?.message || err?.response?.data?.message || err?.toString() || "Unknown error";
      alert(`Failed to save workflow: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p>Loading workflow...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/60 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Workflow Name"
                className="text-3xl font-bold bg-transparent border-none outline-none w-full text-slate-900 placeholder-slate-400 focus:ring-0"
              />
              <input
                type="text"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Description (optional)"
                className="text-sm text-slate-500 bg-transparent border-none outline-none w-full mt-2 placeholder-slate-400 focus:ring-0"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={workflowActive}
                  onChange={(e) => setWorkflowActive(e.target.checked)}
                  className="cursor-pointer w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Active</span>
              </label>
              <button
                onClick={saveWorkflow}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {saving ? "Saving..." : "Save Workflow"}
              </button>
            </div>
          </div>

          {/* Node Palette Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowNodePalette(!showNodePalette)}
              className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
            >
              {showNodePalette ? "▼" : "▶"} Node Palette
            </button>
                  </div>

          {/* Enhanced Node Palette */}
          {showNodePalette && (
            <div className="mt-4 space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {NODE_CATEGORIES.map((category) => (
                <div key={category.name} className="border-b border-slate-200/60 pb-3 last:border-0">
                  <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
                    {category.name}
                  </h4>
                  <div className="flex gap-2.5 flex-wrap">
                    {category.nodes.map((node) => {
                      const colorClasses: Record<string, string> = {
                        purple: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300",
                        green: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300",
                        teal: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-300",
                        cyan: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300",
                        violet: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:border-violet-300",
                        rose: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300",
                        blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300",
                        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300",
                        orange: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300",
                        yellow: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300",
                        indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300",
                        pink: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 hover:border-pink-300",
                        gray: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300",
                        amber: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300",
                        sky: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 hover:border-sky-300",
                        fuchsia: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100 hover:border-fuchsia-300",
                        lime: "bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100 hover:border-lime-300",
                        stone: "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300",
                      };
                      return (
                        <button
                          key={node.type}
                          onClick={() => addNode(node.type)}
                          className={`px-4 py-2 text-sm rounded-lg border transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${colorClasses[node.color] || colorClasses.gray}`}
                          title={`Add ${node.label} node`}
                        >
                          {typeof node.icon === 'string' ? (
                            <span>{node.icon}</span>
                          ) : (
                            <node.icon className="w-4 h-4" />
                          )}
                          <span>{node.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            connectionLineStyle={{ stroke: "#3b82f6", strokeWidth: 2 }}
            defaultEdgeOptions={{ 
              type: "smoothstep",
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed },
            }}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
          >
            <Controls />
            <Background gap={20} size={1} />
            <MiniMap 
              nodeColor={(node) => {
                const colors: Record<string, string> = {
                  trigger: "#a855f7",
                  email: "#10b981",
                  httpRequest: "#3b82f6",
                  condition: "#f97316",
                  delay: "#eab308",
                  setVariable: "#6366f1",
                  webhook: "#ec4899",
                };
                return colors[node.type || ""] || "#6b7280";
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        </div>
      </div>
    </AppLayout>
  );
}
