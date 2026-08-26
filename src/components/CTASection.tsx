import { Link } from "react-router-dom";
import background from "./images/cta-background.png";
import icon1 from "./images/cta-1.png";
import icon2 from "./images/cta-2.png";

import { useState, useEffect, useRef } from "react";

const CTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  const features = [
    "White-label and license SHSAT prep materials",
    "Tests, Workbook, Q-Bank, and Course, all co-branded",
    "Your logo, colors, and domain",
    "LMS dashboard and analytics",
    "Apply now, even before your full program is ready"
  ];

  return (
    <section 
      ref={sectionRef}
      id="partners" 
      className="relative w-full py-16 overflow-hidden scroll-mt-24"
      aria-label="SHSAT Program Partnership Opportunities"
    >
      {/* Background image */}
      <img
        src={background}
        alt="Abstract SHSAT partnership background" // descriptive alt
        className={`absolute inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          
          {/* Left Image Section */}
          <div className={`relative order-2 md:order-1 flex justify-center transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '0.3s' }}>
            <div className="relative w-full max-w-xs md:max-w-sm">
              <img
                src={icon1}
                alt="SHSAT Program Icon"
                className="w-full h-auto object-contain"
              />
              <img
                src={icon2}
                alt="Stack of co-branded SHSAT books"
                className="absolute -bottom-6 left-0 w-16 md:w-20 h-auto object-contain transform transition-transform duration-500 hover:scale-110 hover:rotate-6"
              />
            </div>
          </div>

          {/* Right Text Content */}
          <div className={`order-1 md:order-2 text-white space-y-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '0.2s' }}>
            
            {/* Title and Description */}
            <h2 className="text-2xl md:text-3xl font-bold">
              Power Your SHSAT Program
            </h2>
            <p className="text-sm md:text-base font-medium">
              Serve your students with trusted, co-branded content powered by Bell Curves.
            </p>

            {/* Features List */}
            <ul className="text-sm md:text-base space-y-2" aria-label="Partnership features list">
              {features.map((feature, index) => (
                <li 
                  key={index}
                  className="flex items-start transition-transform duration-500 hover:translate-x-2 hover:bg-white/10 rounded-lg p-2 -ml-2"
                >
                  <span className="group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-white inline-block mr-1 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="hover:text-gray-200 transition-colors duration-300">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Button Group */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Link to="/partnership">
                <button className="bg-white text-bc-blue px-5 py-2 rounded-md border border-white hover:bg-clarity-off-white transition-colors duration-150 active:scale-[0.97]">
                  See Partnership Options
                </button>
              </Link>
              <Link to="/partnership-call">
                <button className="bg-transparent text-white px-5 py-2 rounded-md border border-white hover:bg-white/10 transition-colors duration-150 active:scale-[0.97]">
                  Schedule a Call
                </button>
              </Link>
            </div>

            <div>
              <Link to="/apply">
                <button className="mt-4 bg-challenger-orange text-white px-5 py-2 rounded-md w-fit transition-opacity duration-150 hover:opacity-90 active:scale-[0.97]">
                  Apply to Power Your SHSAT Program
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
	// );