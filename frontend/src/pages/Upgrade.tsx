import AppLayout from "@/layouts/AppLayout";
import { Link } from "react-router-dom";
import LiteCRMLogo from "@/components/LiteCRMLogo";
import { ZohoLogo, HubSpotLogo, PipedriveLogo, SalesforceLogo } from "@/components/CompanyLogos";

type Feature = {
  label: string;
  starter?: boolean | string;
  professional?: boolean | string;
  business?: boolean | string;
};

const INDIVIDUAL_FEATURES: Feature[] = [
  { label: "Leads", starter: "Unlimited", professional: "Unlimited", business: "Unlimited" },
  { label: "Users", starter: "1", professional: "1", business: "1" },
  { label: "Lead assignment", starter: true, professional: true, business: true },
  { label: "Tasks & follow-ups", starter: true, professional: true, business: true },
  { label: "Notes & activity timeline", starter: true, professional: true, business: true },
  { label: "Workflow automation (n8n)", starter: true, professional: true, business: true },
  { label: "Custom workflows", starter: true, professional: true, business: true },
  { label: "Email support", starter: true, professional: true, business: true },
  { label: "Priority support", starter: false, professional: false, business: true },
];

const ORGANIZATION_FEATURES: Feature[] = [
  { label: "Leads", starter: "Unlimited", professional: "Unlimited", business: "Unlimited" },
  { label: "Users", starter: "1", professional: "Up to 5", business: "Unlimited" },
  { label: "Lead assignment", starter: true, professional: true, business: true },
  { label: "Tasks & follow-ups", starter: true, professional: true, business: true },
  { label: "Notes & activity timeline", starter: true, professional: true, business: true },
  { label: "Workflow automation (n8n)", starter: true, professional: true, business: true },
  { label: "Custom workflows", starter: true, professional: true, business: true },
  { label: "Team invites", starter: false, professional: true, business: true },
  { label: "Team collaboration", starter: false, professional: true, business: true },
  { label: "Email support", starter: true, professional: true, business: true },
  { label: "Priority support", starter: false, professional: false, business: true },
  { label: "Dedicated n8n instance", starter: false, professional: false, business: true },
];

const CRM_COMPARISON = [
  {
    feature: "Pricing",
    liteCRM: "₹1,499 - ₹7,999/month",
    zoho: "₹1,400 - ₹5,600/month",
    hubspot: "$0 - $1,200/month",
    pipedrive: "₹1,200 - ₹2,500/month",
    salesforce: "$25 - $300+/month",
  },
  {
    feature: "Free Trial",
    liteCRM: "3 days",
    zoho: "15 days",
    hubspot: "Free tier available",
    pipedrive: "14 days",
    salesforce: "30 days",
  },
  {
    feature: "Workflow Automation",
    liteCRM: "Built-in (n8n)",
    zoho: "Via Zapier integration",
    hubspot: "Native automation",
    pipedrive: "Limited automation",
    salesforce: "Advanced automation",
  },
  {
    feature: "Custom Workflows",
    liteCRM: "Unlimited",
    zoho: "Limited templates",
    hubspot: "Advanced workflows",
    pipedrive: "Basic workflows",
    salesforce: "Enterprise workflows",
  },
  {
    feature: "Self-Hosted",
    liteCRM: "Available",
    zoho: "Not available",
    hubspot: "Not available",
    pipedrive: "Not available",
    salesforce: "Not available",
  },
  {
    feature: "Open Source",
    liteCRM: "Yes",
    zoho: "No",
    hubspot: "No",
    pipedrive: "No",
    salesforce: "No",
  },
  {
    feature: "Setup Time",
    liteCRM: "Minutes",
    zoho: "Hours",
    hubspot: "Hours to days",
    pipedrive: "Hours",
    salesforce: "Days to weeks",
  },
  {
    feature: "Data Control",
    liteCRM: "Full ownership",
    zoho: "Vendor controlled",
    hubspot: "Vendor controlled",
    pipedrive: "Vendor controlled",
    salesforce: "Vendor controlled",
  },
];

export default function Upgrade() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <LiteCRMLogo size="lg" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-600 mb-2">
            Select a plan to continue using Lite CRM
          </p>
          <p className="text-sm text-slate-500">
            All plans include workflow automation and unlimited leads
          </p>
        </div>

        {/* Individual Plans Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Individual Plans</h2>
            <p className="text-slate-600">Perfect for solo entrepreneurs and freelancers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <PlanCard
              name="Starter"
              price="₹1,499"
              period="per month"
              subtitle="Perfect for individuals getting started"
              features={[
                "Unlimited leads",
                "1 user",
                "Workflow automation",
                "Tasks & follow-ups",
                "Activity timeline",
                "Email support",
              ]}
              cta="Make Payment"
              highlight={false}
              planType="individual"
            />

            <PlanCard
              name="Professional"
              price="₹2,999"
              period="per month"
              subtitle="Enhanced features for professionals"
              badge="Most Popular"
              features={[
                "Everything in Starter",
                "1 user",
                "Advanced workflows",
                "Priority email support",
                "Custom integrations",
              ]}
              cta="Make Payment"
              highlight={true}
              planType="individual"
            />

            <PlanCard
              name="Business"
              price="₹4,999"
              period="per month"
              subtitle="Maximum productivity for professionals"
              features={[
                "Everything in Professional",
                "1 user",
                "Priority support",
                "Dedicated n8n instance",
                "Advanced features",
              ]}
              cta="Make Payment"
              highlight={false}
              planType="individual"
            />
          </div>

          {/* Individual Feature Comparison */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Features</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-900">Starter</th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-600">Professional</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-900">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INDIVIDUAL_FEATURES.map((f, idx) => (
                  <tr key={f.label} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-6 py-3 text-slate-700 font-medium">{f.label}</td>
                    <FeatureCell value={f.starter} />
                    <FeatureCell value={f.professional} highlight />
                    <FeatureCell value={f.business} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Organization Plans Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Organization Plans</h2>
            <p className="text-slate-600">Built for teams that need collaboration and scale</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <PlanCard
              name="Starter"
              price="₹1,499"
              period="per month"
              subtitle="Perfect for small businesses"
              features={[
                "Unlimited leads",
                "1 user",
                "Workflow automation",
                "Tasks & follow-ups",
                "Activity timeline",
                "Email support",
              ]}
              cta="Make Payment"
              highlight={false}
              planType="organization"
            />

            <PlanCard
              name="Professional"
              price="₹3,999"
              period="per month"
              subtitle="Best for growing teams"
              badge="Most Popular"
              features={[
                "Everything in Starter",
                "Up to 5 users",
                "Team collaboration",
                "Team invites",
                "Priority email support",
                "Custom workflows",
              ]}
              cta="Make Payment"
              highlight={true}
              planType="organization"
            />

            <PlanCard
              name="Business"
              price="₹7,999"
              period="per month"
              subtitle="For serious sales teams"
              features={[
                "Everything in Professional",
                "Unlimited users",
                "Dedicated n8n instance",
                "Priority support",
                "Advanced features",
                "Custom integrations",
              ]}
              cta="Make Payment"
              highlight={false}
              planType="organization"
            />
          </div>

          {/* Organization Feature Comparison */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Features</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-900">Starter</th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-600">Professional</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-900">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ORGANIZATION_FEATURES.map((f, idx) => (
                  <tr key={f.label} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-6 py-3 text-slate-700 font-medium">{f.label}</td>
                    <FeatureCell value={f.starter} />
                    <FeatureCell value={f.professional} highlight />
                    <FeatureCell value={f.business} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CRM Comparison */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Comparison with Other CRMs
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-900">
                    <div className="flex items-center justify-center gap-2">
                      <LiteCRMLogo size="sm" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-700">
                    <ZohoLogo />
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-700">
                    <HubSpotLogo />
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-700">
                    <PipedriveLogo />
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-700">
                    <SalesforceLogo />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CRM_COMPARISON.map((row, idx) => (
                  <tr key={row.feature} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-6 py-3 text-slate-700 font-medium">{row.feature}</td>
                    <td className="px-6 py-3 text-center text-slate-600">
                      <span className="font-medium">{row.liteCRM}</span>
                    </td>
                    <td className="px-6 py-3 text-center text-slate-600">{row.zoho}</td>
                    <td className="px-6 py-3 text-center text-slate-600">{row.hubspot}</td>
                    <td className="px-6 py-3 text-center text-slate-600">{row.pipedrive}</td>
                    <td className="px-6 py-3 text-center text-slate-600">{row.salesforce}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ---------- COMPONENTS ---------- */

function PlanCard({
  name,
  price,
  period,
  subtitle,
  badge,
  features,
  cta,
  highlight,
  planType,
}: {
  name: string;
  price: string;
  period: string;
  subtitle: string;
  badge?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  planType: "individual" | "organization";
}) {
  return (
    <div
      className={`relative rounded-2xl border-2 p-6 bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        highlight
          ? "border-blue-500 shadow-blue-100 scale-105"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
            {badge}
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{name}</h3>
        <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
        
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{price}</span>
          <span className="text-slate-500 text-sm">/{period}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-slate-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          // Handle payment - can integrate with payment gateway later
          alert(`Payment integration for ${name} plan coming soon!`);
        }}
        className={`block w-full text-center py-3 px-4 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg ${
          highlight
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            : "bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

function FeatureCell({ value, highlight }: { value?: boolean | string; highlight?: boolean }) {
  const baseClasses = `px-6 py-3 text-center ${highlight ? "bg-blue-50" : ""}`;
  
  if (value === true) {
    return (
      <td className={baseClasses}>
        <svg
          className="w-5 h-5 text-green-500 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </td>
    );
  }
  if (value === false) {
    return (
      <td className={baseClasses}>
        <span className="text-slate-300">—</span>
      </td>
    );
  }
  return <td className={`${baseClasses} font-medium text-slate-700`}>{value}</td>;
}
