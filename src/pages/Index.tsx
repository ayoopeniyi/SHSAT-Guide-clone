import { useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import HeroSection from "../components/HeroSection";
import CountdownTimer from "../components/CountdownTimer";
import SocialProof from "../components/SocialProof";
// import UserTypeSection from "../components/UserTypeSection";
// import ProcessSection from "../components/ProcessSection";
import ServicesSection from "../components/ServicesSection";
import AboutSection from "../components/AboutSection";
import TestimonialsSection from "../components/TestimonialsSection";
import ComparisonSection from "../components/ComparisonSection";
import FAQSection from "../components/FAQSection";
import CTASection from "../components/CTASection";
import FeatureFlagTest from "../components/FeatureFlagTest";
import { useSegment, UserSegment } from "../lib/segment-context";
import { Link } from "react-router-dom";
import { useNewFeature } from '../hooks/useFeatureFlags';
import ParentGuide from "../components/ParentGude";
import FloatingTimer from "../components/FloatingTimer";

interface IndexProps {
  segmentType?: UserSegment;
}

const Index = ({ segmentType = "default" }: IndexProps) => {
  const { segment, setSegment } = useSegment();
  const { isEnabled: isNewFeatureEnabled } = useNewFeature();

  // Update segment when the prop changes
  useEffect(() => {
    if (segmentType && segmentType !== segment) {
      setSegment(segmentType);
    }
  }, [segmentType, segment, setSegment]);

  // Add a title based on segment
  const getPageTitle = () => {
    switch (segment) {
      case "student":
        return "SHSAT Student Resources";
      case "parent":
        return "SHSAT Parent Resources";
      case "educator":
        return "SHSAT School & Educator Resources";
      case "tutor":
        return "SHSAT Tutor & Partner Resources";
      default:
        return "SHSAT Info Center";
    }
  };

  // Set the document title
  useEffect(() => {
    document.title = getPageTitle();
  }, [segment]);

  return (
    <PageLayout>
      <HeroSection />

      {/* Feature Flag Test Component - Always visible for testing */}
      <FeatureFlagTest />
      
      {/* Quick link to detailed feature flag testing (hidden if flag is disabled) */}
      {isNewFeatureEnabled && (
        <div className="text-center mb-8">
          <Link
            to="/feature-flag-test"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🧪 Go to Detailed Feature Flag Testing
          </Link>
        </div>
      )}

      {/* Only show countdown timer for default, student, and parent segments */}
      {/* {(segment === "default" ||
        segment === "student" ||
        segment === "parent") && <CountdownTimer />} */}

{/* 
<div className="relative">
  <fieldset className="border border-gray-400 p-4 rounded-md pb-[40px]">
    <legend className="px-4 bg-white absolute bottom-[-20px] left-1/2 -translate-x-1/2">
      <SocialProof />
    </legend>
    <ParentGuide />
  </fieldset>
</div> */}

  <FloatingTimer />
  <ParentGuide />
  <SocialProof />
      {/* Only show user type section for default segment */}
      {/* {segment === "default" && <UserTypeSection />}

      <ProcessSection /> */}
      <ServicesSection />

      {/* Show different sections based on segment */}
      {(segment === "default" ||
        segment === "student" ||
        segment === "parent") && <AboutSection />}

      {/* Testimonials with segment-specific data handled in the component */}
      {/* <TestimonialsSection /> */}

      {/* Only show comparison for default, student, and parent segments */}
      {(segment === "default" ||
        segment === "student" ||
        segment === "parent") && <ComparisonSection />}

      {/* FAQ with segment-specific questions handled in the component */}
      <FAQSection />

      {/* CTA section for all segments */}
      <CTASection />

      {/* Quiz Section */}
      {/* <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Test Your SHSAT Knowledge
            </h2>
            <p className="text-gray-600 mb-8">
              Take our quick 5-question quiz to assess your understanding of the
              SHSAT. Get immediate feedback and a detailed report sent to your
              email.
            </p>
            <Link
              to="/start"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark transition-colors"
            >
              Take the Quiz
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section> */}
    </PageLayout>
  );
};

export default Index;
