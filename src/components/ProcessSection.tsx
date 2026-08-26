import { useSegment } from "@/lib/segment-context";

const ProcessSection = () => {
  const { segment } = useSegment();   

  // Define segment-specific process steps
  const segmentSteps = {
    default: [
      {
        id: 1,
        icon: "📚",
        title: "Step 1 - Learn",
        description:
          "Start with a Readiness Quiz or Parent Guide to understand what's ahead.",
      },
      {
        id: 2,
        icon: "✏️",
        title: "Step 2 - Practice",
        description:
          "Use the Workbook, Question Bank, and Digital Tools to advance your skills.",
      },
      {
        id: 3,
        icon: "📊",
        title: "Step 3 - Track & Improve",
        description:
          "Get feedback, track insights, and know exactly where you're ready.",
      },
    ],
    student: [
      {
        id: 1,
        icon: "🎯",
        title: "Step 1 - Assess",
        description:
          "Take the Readiness Quiz to identify your strengths and weaknesses.",
      },
      {
        id: 2,
        icon: "🏃",
        title: "Step 2 - Train",
        description:
          "Practice with digital questions sorted by topic and difficulty level.",
      },
      {
        id: 3,
        icon: "📈",
        title: "Step 3 - Master",
        description:
          "Complete timed practice tests and track your improvement over time.",
      },
    ],
    parent: [
      {
        id: 1,
        icon: "📋",
        title: "Step 1 - Plan",
        description:
          "Download the Parent Guide to create a structured preparation timeline.",
      },
      {
        id: 2,
        icon: "🧩",
        title: "Step 2 - Support",
        description:
          "Help your child use our tools consistently, building confidence step-by-step.",
      },
      {
        id: 3,
        icon: "📊",
        title: "Step 3 - Monitor",
        description:
          "Track progress with reports that highlight strengths and improvement areas.",
      },
    ],
    educator: [
      {
        id: 1,
        icon: "📝",
        title: "Step 1 - Apply",
        description:
          "Request access to our institutional materials and content platform.",
      },
      {
        id: 2,
        icon: "🛠️",
        title: "Step 2 - Setup",
        description: "Receive branded materials and training for your staff.",
      },
      {
        id: 3,
        icon: "🚀",
        title: "Step 3 - Launch",
        description:
          "Start your program with our full curriculum and student tracking tools.",
      },
    ],
    tutor: [
      {
        id: 1,
        icon: "📝",
        title: "Step 1 - Apply",
        description:
          "Apply to license Bell Curves materials under your own brand.",
      },
      {
        id: 2,
        icon: "🔄",
        title: "Step 2 - Receive",
        description:
          "Get your branded content, question bank, and assessment tools.",
      },
      {
        id: 3,
        icon: "📱",
        title: "Step 3 - Launch",
        description: "Start using materials with your students immediately.",
      },
    ],
  };

  // Get steps for current segment
  const steps = segmentSteps[segment] || segmentSteps.default;
  // Get section title based on segment
  const sectionTitles = {
    default: "How It Works",
    student: "Your Path to Success",
    parent: "Supporting Your Child's SHSAT Journey",
    educator: "Setting Up Your SHSAT Program",
    tutor: "Launching Your Branded SHSAT Prep",
  };

  const sectionTitle = sectionTitles[segment] || sectionTitles.default;

  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="container-custom">
        <h2 className="section-title">{sectionTitle}</h2>

        {/* Digital Test Banner for segments except default */}
        {segment !== "default" && (
          <div className="mb-10 p-4 bg-gray-100 border border-gray-200 rounded-lg">
            <p className="text-center font-medium">
              The SHSAT now includes grid-in, drag-and-drop, and multi-select
              questions, designed to match the DOE's digital format.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className="card flex flex-col items-center text-center"
            >
              <div className="bg-brand-lightBlue w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">{step.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Contrast with market banner for segments except default */}
        {segment !== "default" && (
          <div className="mt-10 p-4 bg-brand-lightBlue/20 border border-brand-lightBlue/30 rounded-lg">
            <p className="text-center text-gray-700">
              Most SHSAT prep materials are outdated or AI-generated. Bell
              Curves content is written by experienced educators who've helped
              thousands of NYC students succeed, and built specifically for the
              current SHSAT format.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProcessSection;
