import { Link } from "react-router-dom";
import { useSegment } from "@/lib/segment-context";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileStickyFooter = () => {
  const { segment } = useSegment();
  const isMobile = useIsMobile();

  // Only show on mobile devices
  if (!isMobile) return null;

  // Define segment-specific CTAs
  const segmentCTAs = {
    default: [
      { label: "Take Quiz", path: "/readiness-quiz", primary: true },
      { label: "Get Guide", path: "/parent-guide", primary: false },
    ],
    student: [
      { label: "Practice", path: "/question-bank", primary: true },
      { label: "Test Pack", path: "/test-pack", primary: false },
    ],
    parent: [
      { label: "Get Guide", path: "/parent-guide", primary: true },
      { label: "Resources", path: "/local-resources", primary: false },
    ],
    educator: [
      { label: "Apply", path: "/white-label", primary: true },
      { label: "Get Demo", path: "/demo", primary: false },
    ],
    tutor: [
      { label: "Apply", path: "/white-label", primary: true },
      { label: "Preview", path: "/partner-tools", primary: false },
    ],
  };

  // Get CTAs for current segment
  const ctas = segmentCTAs[segment] || segmentCTAs.default;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 py-2 px-4 flex justify-around md:hidden">
      {ctas.map((cta, index) => (
        <Link
          key={index}
          to={cta.path}
          className={`${
            cta.primary
              ? "bg-brand-yellow text-black font-medium"
              : "bg-gray-100 text-gray-800"
          } rounded-md py-2 px-4 text-sm flex-1 mx-1 text-center`}
        >
          {cta.label}
        </Link>
      ))}
    </div>
  );
};

export default MobileStickyFooter;
