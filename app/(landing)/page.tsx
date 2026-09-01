import { LandingHero } from "@/components/landing/LandingHero";
import { LandingShowcase } from "@/components/landing/LandingShowcase";
import { LandingDemo } from "@/components/landing/LandingDemo";
import {
  LandingProblem,
  LandingSolution,
  LandingFeatures,
  LandingHowItWorks,
} from "@/components/landing/LandingSections";
import {
  LandingBenefits,
  LandingFinalCta,
} from "@/components/landing/LandingBenefits";
import { LandingGallery } from "@/components/landing/LandingGallery";
import { LandingPricing } from "@/components/landing/LandingPricing";

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <LandingShowcase />
      <LandingDemo />
      <LandingProblem />
      <LandingSolution />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingGallery />
      <LandingPricing />
      <LandingBenefits />
      <LandingFinalCta />
    </>
  );
}
