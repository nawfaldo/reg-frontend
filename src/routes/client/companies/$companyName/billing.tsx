import { createFileRoute, useSearch, redirect, useParams } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../../lib/api";
import { Check, Calendar, CalendarRange, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/client/companies/$companyName/billing")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      reason: search.reason as string | undefined,
      success: search.success as string | undefined,
      canceled: search.canceled as string | undefined,
    };
  },
  beforeLoad: async ({ params }) => {
    // Check if company exists and user has access
    const { data: companiesData, error: companiesError } = await api.api.company.get();
    
    if (companiesError || !companiesData || 'error' in companiesData || !companiesData.companies) {
      throw redirect({
        to: "/client/companies",
      });
    }

    const company = companiesData.companies.find(
      (c: any) => c.name === params.companyName
    );

    if (!company) {
      throw redirect({
        to: "/client/companies",
      });
    }

    // Check if company already has active subscription
    if (company.hasActiveSubscription === true) {
      throw redirect({
        to: "/client/companies/$companyName",
        params: { companyName: params.companyName },
        search: {
          success: undefined,
        },
      });
    }
  },
  component: BillingPage,
});

const plans = [
  {
    id: "monthly",
    name: "Bulanan",
    description: "Bayar setiap bulan",
    priceLabel: "Rp100.000",
    period: "/bulan",
    priceId: "price_1SeWfDKftJncEW1qTQs0RT4y", 
    features: ["Akses penuh", "Support prioritas", "Cancel kapan saja"],
    icon: Calendar,
    popular: false,
  },
  {
    id: "yearly",
    name: "Tahunan",
    description: "Hemat lebih banyak",
    priceLabel: "Rp1.000.000",
    period: "/tahun",
    priceId: "price_1SeX1eKftJncEW1qCjX0C7xv",
    features: ["Semua fitur bulanan", "Hemat 17%", "Prioritas utama"],
    icon: CalendarRange,
    popular: true,
    savings: "Hemat 17%",
  },
];

function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { companyName } = useParams({ from: "/client/companies/$companyName/billing" });
  const search = useSearch({ from: "/client/companies/$companyName/billing" });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data, error } = await api.api.me.get();
      if (error) throw error;
      return data;
    },
  });

  const isSubscribed = userData?.subscription?.isActive;

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      // Get company ID
      const { data: companiesData } = await api.api.company.get();
      if (!companiesData?.companies) throw new Error("Failed to fetch companies");
      
      const company = companiesData.companies.find((c: any) => c.name === companyName);
      if (!company) throw new Error("Company not found");

      const response = await fetch(
        "http://localhost:3000/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ priceId, companyId: company.id }),
        }
      );
      if (!response.ok) throw new Error("Gagal membuat sesi checkout");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => {
      console.error(err);
      setLoadingPlan(null);
      alert("Terjadi kesalahan saat memproses pembayaran.");
    },
  });

  const handleSubscribe = (priceId: string, planId: string) => {
    setLoadingPlan(planId);
    checkoutMutation.mutate(priceId);
  };

  if (userLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  const currentPriceId = userData?.subscription?.priceId; 

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {search.reason === "subscription_required" && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-amber-800">
            Anda perlu berlangganan untuk mengakses Dashboard. Pilih paket di bawah untuk melanjutkan.
          </p>
        </div>
      )}

      {search.success === "true" && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-800">
            Pembayaran berhasil! Langganan Anda sekarang aktif.
          </p>
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Pilih Paket Langganan</h1>
        <p className="text-gray-500 mt-2">Upgrade akun Anda untuk fitur premium.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPriceId === plan.priceId;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-6 border-2 transition-all ${
                isCurrentPlan 
                  ? "border-green-500 shadow-lg ring-1 ring-green-500" 
                  : plan.popular 
                    ? "border-gray-900 shadow-xl" 
                    : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {plan.savings && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                  {plan.savings}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isCurrentPlan ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.priceLabel}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((ft, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 shrink-0" /> {ft}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId, plan.id)}
                disabled={isSubscribed || isCurrentPlan || isLoading}
                className={`w-full py-3 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors ${
                  isSubscribed || isCurrentPlan
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                }`}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubscribed || isCurrentPlan ? "Paket Aktif ✅" : "Pilih Paket Ini"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}