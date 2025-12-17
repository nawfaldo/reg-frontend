import { createFileRoute, redirect } from "@tanstack/react-router";
import { api } from "../../../lib/api";

export const Route = createFileRoute("/client/company/$companyName/dashboard")({
  beforeLoad: async ({ params }) => {
    // Fetch companies to check if this company has active subscription
    const { data: companiesData, error: companiesError } = await api.api.company.get();
    
    if (companiesError || !companiesData || 'error' in companiesData || !companiesData.companies) {
      throw redirect({
        to: "/client/companies",
      });
    }

    // Find the company by name
    const company = companiesData.companies.find(
      (c: any) => c.name === params.companyName
    );

    if (!company) {
      throw redirect({
        to: "/client/companies",
      });
    }

    // Check if company has active subscription
    // hasActiveSubscription can be boolean | "" | null
    const hasActive = company.hasActiveSubscription;
    if (hasActive !== true) {
      throw redirect({
        to: "/client/companies",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Selamat datang di dashboard! Anda memiliki akses penuh.</p>
    </div>
  );
}
