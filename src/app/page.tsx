import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FooterSection } from "@/components/landing/footer-section";

// Root page: redirect authenticated users to dashboard, show landing to guests
export default async function RootPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
}
