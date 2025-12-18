import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../../lib/api'

export const Route = createFileRoute('/client/company/$companyName/billing')({
  component: RouteComponent,
})

const plans = [
  {
    id: "yearly",
    name: "Tahunan",
    priceLabel: "Rp.1.000.000",
    priceId: "price_1SeX1eKftJncEW1qCjX0C7xv",
  },
  {
    id: "monthly",
    name: "Bulanan",
    priceLabel: "Rp.100.000",
    priceId: "price_1SeWfDKftJncEW1qTQs0RT4y",
  },
];

function RouteComponent() {
  const navigate = useNavigate();
  const { companyName } = useParams({ from: '/client/company/$companyName/billing' })
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data, error } = await api.api.me.get();
      if (error) throw error;
      return data;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      // Get company ID
      const { data: companiesData } = await api.api.company.get();
      if (!companiesData?.companies) throw new Error("Failed to fetch companies");
      
      const company = companiesData.companies.find((c: any) => c.name === companyName);
      if (!company) throw new Error("Company not found");

      const response = await fetch(
        "https://reg-backend-psi.vercel.app/api/payment/create-checkout-session",
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

  const handleBack = () => {
    navigate({ to: '..' });
  };

  if (userLoading) {
    return (
      <div className="p-6 h-full bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="px-6 pt-1 h-full bg-white">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-black hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-black">Beli Layanan</h1>
        </div>
      </div>

      {plans.map((plan, index) => {
        const isLoading = loadingPlan === plan.id;
        const isCurrentPlan = userData?.subscription?.priceId === plan.priceId;

        return (
          <div
            key={plan.id}
            className={`bg-gray-100 border border-gray-200 p-3 max-w-sm ${index === 0 ? `mb-3` : ``}`}
          >
            <div className="mb-3 space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-700">
                {plan.priceLabel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSubscribe(plan.priceId, plan.id)}
                disabled={isCurrentPlan || isLoading}
                className="inline-flex items-center justify-center gap-1 w-[130px] py-2 text-sm font-medium text-black bg-white border border-gray-300 border-b-7 hover:bg-gray-50 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : isCurrentPlan ? (
                  'Aktif'
                ) : (
                  <>
                    Pilih & Bayar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  )
}
