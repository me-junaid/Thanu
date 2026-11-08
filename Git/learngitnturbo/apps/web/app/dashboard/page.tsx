import { DashboardOverviewView } from "../../components/dashboard/dashboard-overview-view";

interface PageProps {
  searchParams: Promise<{ onboarding?: string }>;
}

export default async function DashboardOverviewPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const showOnboardingSuccess = searchParams.onboarding === "complete";

  return <DashboardOverviewView onboardingSuccess={showOnboardingSuccess} />;
}
