import { useState, useEffect, useRef } from "react";

const ComparisonSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const othersProvide = [
    "Outdated practice questions and old paper tests",
    "Generic strategies not built for digital testing",
    "AI-generated content with unreliable answers",
    "One-size-fits-all approach with no personalization",
    "Limited explanations that don't build understanding",
  ];

  const weProvide = [
    "Up-to-date digital SHSAT-aligned practice questions",
    "Digital-specific strategies for the new testing format",
    "Expert-written content by experienced educators",
    "Personalized study path based on diagnostic results",
    "Detailed explanations that build concept mastery",
  ];

  return (
    <section ref={sectionRef} className="py-16 bg-gray-50">

      <div className="container-custom mx-auto px-4 text-center">
        {/* Title */}
        <h2
          className={`section-title text-2xl sm:text-[30px] md:text-[43px] font-bold leading-tight md:leading-[55px] text-[#373536] mb-8 md:mb-12 transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Why Choose{" "}
          <span className="text-[#377E9A] relative">
            SHSATGuide.com?
            <span
              className={`absolute bottom-0 left-0 h-1 bg-[#377E9A] transition-all duration-1000 ${
                isVisible ? "w-full delay-700" : "w-0"
              }`}
            ></span>
          </span>
        </h2>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start max-w-6xl mx-auto">
          {/* Left Card - Others */}
          <fieldset
            className={`rounded-xl shadow-md p-6 md:p-8 border-2 border-gray-200 order-1 md:order-1 transform transition-all duration-1000 hover:scale-105 hover:shadow-lg ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "0.3s" }}
          >
            <legend
              className={`bg-[#FF4D48] w-[260px] h-[60px] text-white font-semibold text-[20px] leading-[60px] text-left rounded-lg mb-4 md:mx-0 transform transition-all duration-800 ${
                isVisible ? "scale-100 rotate-0" : "scale-95 rotate-1"
              }`}
              style={{ transitionDelay: "0.5s" }}
            >
              <h2 className="text-center">What Others Provide</h2>
            </legend>

            <ul className="space-y-4 md:space-y-6 ml-6 text-left">
              {othersProvide.map((item, index) => (
                <li
                  key={index}
                  className={`flex items-start text-gray-600 text-sm md:text-base transform transition-all duration-700 hover:translate-x-2 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${0.6 + index * 0.1}s` }}
                >
                  <svg
                    className="w-5 h-5 text-red-500 mt-1 mr-2 transform transition-all duration-300 hover:scale-110 hover:rotate-12"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="hover:text-gray-800 transition-colors duration-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </fieldset>

          {/* VS Circle - Mobile */}
          <div
            className={`flex justify-center md:hidden order-2 transform transition-all duration-1000 ${
              isVisible ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-180 opacity-0"
            }`}
            style={{ transitionDelay: "0.8s" }}
          >
            <div className="w-16 h-16 rounded-full bg-[#377E9A] text-white flex items-center justify-center font-bold text-xl shadow-lg hover:scale-110 transition-all duration-300">
              VS
            </div>
          </div>

          {/* Right Card - We Provide */}
          <fieldset
            className={`rounded-xl shadow-md p-6 md:p-8 border border-gray-200 order-3 md:order-3 transform transition-all duration-1000 hover:scale-105 hover:shadow-lg ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            <legend
              className={`bg-[#377E9A] w-[260px] h-[60px] text-white font-semibold text-[20px] leading-[60px] text-left rounded-lg mb-4 md:mx-0 transform transition-all duration-800 ${
                isVisible ? "scale-100 rotate-0" : "scale-95 -rotate-1"
              }`}
              style={{ transitionDelay: "0.6s" }}
            >
              <h2 className="text-center">What We Provide</h2>
            </legend>

            <ul className="space-y-4 md:space-y-6 ml-6 text-left">
              {weProvide.map((item, index) => (
                <li
                  key={index}
                  className={`flex items-start text-gray-600 text-sm md:text-base transform transition-all duration-700 hover:translate-x-2 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${0.7 + index * 0.1}s` }}
                >
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-[#377e9a] inline-block mr-1 transform transition-all duration-300 hover:scale-110 hover:rotate-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="hover:text-gray-800 transition-colors duration-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </fieldset>

          {/* VS Circle - Desktop */}
          <div
            className={`hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ${
              isVisible ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-180 opacity-0"
            }`}
            style={{ transitionDelay: "0.9s" }}
          >
            <div className="w-20 h-20 rounded-full bg-[#377E9A] text-white flex items-center justify-center font-bold text-2xl shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer">
              VS
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;