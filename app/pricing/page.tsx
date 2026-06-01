import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

const plans = [
    {
        name: "Basic",
        price: "$49",
        description: "Perfect for solo sales professionals starting their AI journey.",
        features: [
            "Up to 50 calls analyzed per month",
            "Basic real-time AI suggestions",
            "Post-call summaries",
            "Email support"
        ],
        buttonText: "Get Started",
        isPopular: false,
    },
    {
        name: "Professional",
        price: "$149",
        description: "Ideal for growing teams needing deep insights and coaching.",
        features: [
            "Unlimited calls analyzed",
            "Advanced real-time AI suggestions",
            "Full call transcripts",
            "Custom AI objection handling",
            "Priority 24/7 support"
        ],
        buttonText: "Start Free Trial",
        isPopular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For large organizations with complex sales processes.",
        features: [
            "Everything in Professional",
            "Custom AI model training",
            "CRM Integration (Salesforce, HubSpot)",
            "Dedicated account manager",
            "SLA guarantee"
        ],
        buttonText: "Contact Sales",
        isPopular: false,
    }
];

export default function PricingPage() {
    return (
        <div className="h-full relative bg-slate-50">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72 pb-10">
                <Navbar />
                
                <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                            Pricing that scales with your team
                        </h1>
                        <p className="mt-4 text-xl text-slate-600">
                            Choose the perfect plan to supercharge your sales team with AI coaching.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {plans.map((plan) => (
                            <div key={plan.name} className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${plan.isPopular ? 'ring-2 ring-indigo-600 shadow-xl scale-105' : 'border-slate-200'}`}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-6 transform -translate-y-1/2">
                                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                                    <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
                                </div>
                                
                                <div className="mb-6">
                                    <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
                                    {plan.price !== "Custom" && <span className="text-slate-500 font-medium">/month</span>}
                                </div>
                                
                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <Check className="h-5 w-5 text-indigo-600 shrink-0 mr-3" />
                                            <span className="text-slate-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                
                                <Button 
                                    className={`w-full py-6 text-lg font-semibold rounded-xl ${plan.isPopular ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                                >
                                    {plan.buttonText}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
