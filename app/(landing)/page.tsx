import { LandingHero } from "@/components/landing/LandingHero";
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
import { LandingPricing } from "@/components/landing/LandingPricing";

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <LandingProblem />
      <LandingSolution />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingBenefits />
      <LandingFinalCta />
    </>
  );
}