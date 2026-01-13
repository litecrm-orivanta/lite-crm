import { useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import LiteCRMLogo, { LiteCRMLogoIcon } from "@/components/LiteCRMLogo";
import { ZohoLogo, HubSpotLogo, PipedriveLogo, SalesforceLogo } from "@/components/CompanyLogos";

type BillingPeriod = "monthly" | "quarterly" | "yearly";
type PlanType = "individual" | "organization";

// Plan pricing (original monthly prices)
const PLAN_PRICES = {
  individual: {
    starter: 899,
    professional: 1599,
    business: 4999, // Not used in individual, but keeping for consistency
  },
  organization: {
    starter: 1999,
    professional: 3999,
    business: 7999,
  },
};

// Discount rates
const DISCOUNTS = {
  monthly: 0.05,    // 5% off
  quarterly: 0.10,  // 10% off
  yearly: 0.20,     // 20% off
};

const INDIVIDUAL_FEATURES = [
  { label: "Unlimited Leads", starter: true, professional: true, business: true },
  { label: "Users", starter: "1", professional: "1", business: "1" },
  { label: "Lead Assignment", starter: true, professional: true, business: true },
  { label: "Tasks & Follow-ups", starter: true, professional: true, business: true },
  { label: "Notes & Activity Timeline", starter: true, professional: true, business: true },
  { label: "Native Workflow Automation", starter: true, professional: true, business: true },
  { label: "Unlimited Custom Workflows", starter: true, professional: true, business: true },
  { label: "Multi-Channel Messaging", starter: true, professional: true, business: true },
  { label: "Email Templates", starter: true, professional: true, business: true },
  { label: "CSV Export & Bulk Operations", starter: true, professional: true, business: true },
  { label: "Kanban Board & Calendar View", starter: true, professional: true, business: true },
  { label: "Reports & Analytics", starter: true, professional: true, business: true },
  { label: "Email Support", starter: "48h response", professional: "24h response", business: "4h response" },
  { label: "Priority Support", starter: false, professional: false, business: true },
];

const ORGANIZATION_FEATURES = [
  { label: "Unlimited Leads", starter: true, professional: true, business: true },
  { label: "Users", starter: "1", professional: "Up to 5", business: "Unlimited" },
  { label: "Lead Assignment", starter: true, professional: true, business: true },
  { label: "Tasks & Follow-ups", starter: true, professional: true, business: true },
  { label: "Notes & Activity Timeline", starter: true, professional: true, business: true },
  { label: "Native Workflow Automation", starter: true, professional: true, business: true },
  { label: "Unlimited Custom Workflows", starter: true, professional: true, business: true },
  { label: "Multi-Channel Messaging", starter: true, professional: true, business: true },
  { label: "Team Collaboration", starter: false, professional: true, business: true },
  { label: "Team Invites & Management", starter: false, professional: true, business: true },
  { label: "Email Templates", starter: true, professional: true, business: true },
  { label: "CSV Export & Bulk Operations", starter: true, professional: true, business: true },
  { label: "Kanban Board & Calendar View", starter: true, professional: true, business: true },
  { label: "Reports & Analytics", starter: true, professional: true, business: true },
  { label: "Email Support", starter: "48h response", professional: "24h response", business: "4h response" },
  { label: "Dedicated Workflow Instance", starter: false, professional: false, business: true },
  { label: "Priority Support", starter: false, professional: false, business: true },
];

const COMPETITOR_COMPARISON = [
  {
    feature: "Pricing (Entry)",
    liteCRM: { value: "₹899/month", highlight: true, badge: "Best Value" },
    zoho: "₹1,400/month",
    hubspot: "Free (limited)",
    pipedrive: "₹1,200/month",
    salesforce: "₹2,000/month",
  },
  {
    feature: "Pricing (Mid-Tier)",
    liteCRM: { value: "₹1,599/month", highlight: true },
    zoho: "₹2,800/month",
    hubspot: "₹8,000/month",
    pipedrive: "₹2,000/month",
    salesforce: "₹6,000/month",
  },
  {
    feature: "Pricing (Team)",
    liteCRM: { value: "₹3,999/month", highlight: true },
    zoho: "₹5,600/month",
    hubspot: "₹24,000/month",
    pipedrive: "₹2,500/month",
    salesforce: "₹15,000+/month",
  },
  {
    feature: "Unlimited Leads",
    liteCRM: { value: "Yes", highlight: true },
    zoho: "Limited",
    hubspot: "Limited",
    pipedrive: "Limited",
    salesforce: "Limited",
  },
  {
    feature: "Native Workflow Automation",
    liteCRM: { value: "Built-in", highlight: true },
    zoho: "Via Zapier",
    hubspot: "Native",
    pipedrive: "Limited",
    salesforce: "Advanced",
  },
  {
    feature: "Unlimited Workflows",
    liteCRM: { value: "Yes", highlight: true },
    zoho: "Templates only",
    hubspot: "Yes",
    pipedrive: "Basic only",
    salesforce: "Yes",
  },
  {
    feature: "WhatsApp Integration",
    liteCRM: { value: "Native", highlight: true },
    zoho: "Third-party",
    hubspot: "Third-party",
    pipedrive: "Third-party",
    salesforce: "Third-party",
  },
  {
    feature: "Telegram Integration",
    liteCRM: { value: "Native", highlight: true },
    zoho: "No",
    hubspot: "No",
    pipedrive: "No",
    salesforce: "No",
  },
  {
    feature: "SMS Integration",
    liteCRM: { value: "Native", highlight: true },
    zoho: "Third-party",
    hubspot: "Third-party",
    pipedrive: "Third-party",
    salesforce: "Third-party",
  },
  {
    feature: "ChatGPT Integration",
    liteCRM: { value: "Native", highlight: true },
    zoho: "No",
    hubspot: "Limited",
    pipedrive: "No",
    salesforce: "Limited",
  },
  {
    feature: "Self-Hosted Option",
    liteCRM: { value: "Available", highlight: true },
    zoho: "No",
    hubspot: "No",
    pipedrive: "No",
    salesforce: "No",
  },
  {
    feature: "Open Source",
    liteCRM: { value: "Yes", highlight: true },
    zoho: "No",
    hubspot: "No",
    pipedrive: "No",
    salesforce: "No",
  },
  {
    feature: "Setup Time",
    liteCRM: { value: "Minutes", highlight: true },
    zoho: "Hours",
    hubspot: "Hours to days",
    pipedrive: "Hours",
    salesforce: "Days to weeks",
  },
  {
    feature: "Data Ownership",
    liteCRM: { value: "Full control", highlight: true },
    zoho: "Vendor controlled",
    hubspot: "Vendor controlled",
    pipedrive: "Vendor controlled",
    salesforce: "Vendor controlled",
  },
  {
    feature: "Free Trial",
    liteCRM: "3 days",
    zoho: "15 days",
    hubspot: "Free tier available",
    pipedrive: "14 days",
    salesforce: "30 days",
  },
];

export default function Upgrade() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Premium Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <LiteCRMLogo size="lg" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-slate-600 mb-4 max-w-2xl mx-auto">
              The most affordable CRM with unlimited leads, native automation, and self-hosted option
            </p>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              All plans include workflow automation, unlimited leads, and multi-channel messaging
            </p>
          </div>

          {/* Billing Period Selector */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-xl border-2 border-slate-200 bg-white p-1.5 shadow-lg">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  billingPeriod === "monthly"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  5% OFF
                </span>
              </button>
              <button
                onClick={() => setBillingPeriod("quarterly")}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  billingPeriod === "quarterly"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Quarterly
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  10% OFF
                </span>
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  billingPeriod === "yearly"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Individual Plans Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Individual Plans</h2>
              <p className="text-lg text-slate-600">Perfect for solo entrepreneurs and freelancers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              <PlanCard
                name="Starter"
                originalPrice={PLAN_PRICES.individual.starter}
                billingPeriod={billingPeriod}
                subtitle="Perfect for individuals getting started"
                features={[
                  "Unlimited leads",
                  "1 user",
                  "Native workflow automation",
                  "Multi-channel messaging",
                  "Tasks & follow-ups",
                  "CSV export & bulk operations",
                  "Email support (48h)",
                ]}
                cta="Get Started"
                highlight={false}
                planType="individual"
              />

              <PlanCard
                name="Professional"
                originalPrice={PLAN_PRICES.individual.professional}
                billingPeriod={billingPeriod}
                subtitle="Enhanced features for professionals"
                badge="Most Popular"
                features={[
                  "Everything in Starter",
                  "1 user",
                  "Advanced workflow features",
                  "Priority support (24h)",
                  "Custom workflow templates",
                  "Advanced analytics",
                  "Email templates",
                ]}
                cta="Get Started"
                highlight={true}
                planType="individual"
              />
            </div>
          </div>

          {/* Organization Plans Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Organization Plans</h2>
              <p className="text-lg text-slate-600">Built for teams that need collaboration and scale</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <PlanCard
                name="Starter Team"
                originalPrice={PLAN_PRICES.organization.starter}
                billingPeriod={billingPeriod}
                subtitle="Perfect for small businesses"
                features={[
                  "Unlimited leads",
                  "1 user",
                  "Native workflow automation",
                  "Multi-channel messaging",
                  "Tasks & follow-ups",
                  "CSV export & bulk operations",
                  "Email support (48h)",
                ]}
                cta="Get Started"
                highlight={false}
                planType="organization"
              />

              <PlanCard
                name="Professional Team"
                originalPrice={PLAN_PRICES.organization.professional}
                billingPeriod={billingPeriod}
                subtitle="Best for growing teams"
                badge="Most Popular"
                features={[
                  "Everything in Starter Team",
                  "Up to 5 users",
                  "Team collaboration",
                  "Team invites & management",
                  "Priority support (24h)",
                  "Shared workflows",
                  "Advanced analytics",
                ]}
                cta="Get Started"
                highlight={true}
                planType="organization"
              />

              <PlanCard
                name="Business"
                originalPrice={PLAN_PRICES.organization.business}
                billingPeriod={billingPeriod}
                subtitle="For serious sales teams"
                features={[
                  "Everything in Professional Team",
                  "Unlimited users",
                  "Dedicated workflow instance",
                  "Priority support (4h)",
                  "Custom integrations",
                  "Advanced analytics",
                  "API access",
                ]}
                cta="Get Started"
                highlight={false}
                planType="organization"
              />
            </div>
          </div>

          {/* Premium Competitor Comparison */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                How We Compare to Competitors
              </h2>
              <p className="text-lg text-slate-600">
                See why Lite CRM is the best value in the market
              </p>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
                      <th className="px-8 py-6 text-left">
                        <span className="text-white font-bold text-lg">Feature</span>
                      </th>
                      <th className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <LiteCRMLogoIcon size="md" />
                          <span className="text-white font-bold">Lite CRM</span>
                        </div>
                      </th>
                      <th className="px-8 py-6 text-center bg-slate-50">
                        <div className="flex flex-col items-center gap-2">
                          <ZohoLogo />
                        </div>
                      </th>
                      <th className="px-8 py-6 text-center bg-slate-50">
                        <div className="flex flex-col items-center gap-2">
                          <HubSpotLogo />
                        </div>
                      </th>
                      <th className="px-8 py-6 text-center bg-slate-50">
                        <div className="flex flex-col items-center gap-2">
                          <PipedriveLogo />
                        </div>
                      </th>
                      <th className="px-8 py-6 text-center bg-slate-50">
                        <div className="flex flex-col items-center gap-2">
                          <SalesforceLogo />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {COMPETITOR_COMPARISON.map((row, idx) => (
                      <tr
                        key={row.feature}
                        className={`transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        } hover:bg-blue-50/50`}
                      >
                        <td className="px-8 py-5">
                          <span className="font-semibold text-slate-900">{row.feature}</span>
                        </td>
                        <td className="px-8 py-5 text-center bg-blue-50/50">
                          {typeof row.liteCRM === "object" ? (
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`font-bold ${
                                  row.liteCRM.highlight
                                    ? "text-green-600 text-base"
                                    : "text-slate-700"
                                }`}
                              >
                                {row.liteCRM.value}
                              </span>
                              {row.liteCRM.badge && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                  {row.liteCRM.badge}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="font-medium text-slate-700">{row.liteCRM}</span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-center text-slate-600">{row.zoho}</td>
                        <td className="px-8 py-5 text-center text-slate-600">{row.hubspot}</td>
                        <td className="px-8 py-5 text-center text-slate-600">{row.pipedrive}</td>
                        <td className="px-8 py-5 text-center text-slate-600">{row.salesforce}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Feature Comparison Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Individual Features */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Individual Plans Features</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-900">Feature</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-900">Starter</th>
                      <th className="px-6 py-4 text-center font-semibold text-blue-600">Professional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {INDIVIDUAL_FEATURES.map((f, idx) => (
                      <tr key={f.label} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                        <td className="px-6 py-3 text-slate-700 font-medium">{f.label}</td>
                        <FeatureCell value={f.starter} />
                        <FeatureCell value={f.professional} highlight />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Organization Features */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Organization Plans Features</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-900">Feature</th>
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ---------- COMPONENTS ---------- */

function PlanCard({
  name,
  originalPrice,
  billingPeriod,
  subtitle,
  badge,
  features,
  cta,
  highlight,
  planType,
}: {
  name: string;
  originalPrice: number;
  billingPeriod: BillingPeriod;
  subtitle: string;
  badge?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  planType: PlanType;
}) {
  const discount = DISCOUNTS[billingPeriod];
  let discountedPrice: number;
  let totalPrice: number;
  let monthlyEquivalent: number;
  let savings: number;
  let originalTotal: number;

  if (billingPeriod === "monthly") {
    discountedPrice = originalPrice * (1 - discount);
    totalPrice = discountedPrice;
    monthlyEquivalent = discountedPrice;
    savings = originalPrice - discountedPrice;
    originalTotal = originalPrice;
  } else if (billingPeriod === "quarterly") {
    originalTotal = originalPrice * 3;
    totalPrice = originalTotal * (1 - discount);
    monthlyEquivalent = totalPrice / 3;
    savings = originalTotal - totalPrice;
  } else {
    // yearly
    originalTotal = originalPrice * 12;
    totalPrice = originalTotal * (1 - discount);
    monthlyEquivalent = totalPrice / 12;
    savings = originalTotal - totalPrice;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={`relative rounded-xl border-2 p-6 bg-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        highlight
          ? "border-blue-500 shadow-blue-100 scale-[1.02] ring-2 ring-blue-100"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg">
            {badge}
          </span>
        </div>
      )}

      {/* Discount Badge */}
      {billingPeriod !== "monthly" && (
        <div className="absolute -top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
            {billingPeriod === "quarterly" ? "10% OFF" : "20% OFF"}
          </span>
        </div>
      )}

      <div className="text-center mb-5">
        <h3 className="text-2xl font-bold text-slate-900 mb-1.5">{name}</h3>
        <p className="text-xs text-slate-500 mb-4">{subtitle}</p>

        {/* Pricing Display */}
        <div className="mb-4">
          {billingPeriod === "monthly" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-baseline justify-center gap-3">
                <span className="text-2xl text-slate-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
                <span className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {formatPrice(discountedPrice)}
                </span>
              </div>
              <span className="text-slate-500 text-sm">/month</span>
              <span className="text-green-600 text-sm font-semibold">
                Save {formatPrice(savings)}/month
              </span>
            </div>
          ) : billingPeriod === "quarterly" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-baseline justify-center gap-3">
                <span className="text-xl text-slate-400 line-through">
                  {formatPrice(originalTotal)}
                </span>
                <span className="text-5xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <span className="text-slate-700 text-lg font-semibold">
                {formatPrice(monthlyEquivalent)}/month
              </span>
              <span className="text-slate-500 text-xs">
                Billed quarterly • Save {formatPrice(savings)}
              </span>
            </div>
          ) : (
            // yearly
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-baseline justify-center gap-3">
                <span className="text-xl text-slate-400 line-through">
                  {formatPrice(originalTotal)}
                </span>
                <span className="text-5xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <span className="text-slate-700 text-lg font-semibold">
                {formatPrice(monthlyEquivalent)}/month
              </span>
              <span className="text-slate-500 text-xs">
                Billed annually • Save {formatPrice(savings)}
              </span>
            </div>
          )}
        </div>
      </div>

      <ul className="space-y-2.5 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <svg
              className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-slate-700 leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          // Redirect to payment gateway - integrate with Razorpay/Stripe/etc
          // For now, show alert
          alert(`Redirecting to payment gateway for ${name} plan (${billingPeriod})...`);
        }}
        className={`block w-full text-center py-3 px-4 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
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

function FeatureCell({
  value,
  highlight,
}: {
  value?: boolean | string;
  highlight?: boolean;
}) {
  const baseClasses = `px-6 py-3 text-center ${highlight ? "bg-blue-50" : ""}`;

  if (value === true) {
    return (
      <td className={baseClasses}>
        <svg
          className="w-6 h-6 text-green-500 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </td>
    );
  }
  if (value === false) {
    return (
      <td className={baseClasses}>
        <span className="text-slate-300 text-xl">—</span>
      </td>
    );
  }
  return (
    <td className={`${baseClasses} font-semibold text-slate-700`}>{value}</td>
  );
}
