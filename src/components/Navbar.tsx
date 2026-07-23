import { useState, useEffect } from "react";
import logo from "./images/bellcurves.png";
import { Link } from "react-router-dom";
import { useActionTracking } from "../lib/action-tracking";
import { useAuthStore } from "../stores/authStore";
import { useNavigationFlags } from "../hooks/useFeatureFlags";
import posthog from 'posthog-js';
import Schedule_calls from './Schedule_calls'; 

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false); 
  const [isVisible, setIsVisible] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // const isMobile = useIsMobile();
  const { trackNavigation, trackButtonClick } = useActionTracking();
  const getUserName = useAuthStore((state) => state.getUserName);
  const user = useAuthStore((state) => state.user);
  const { teacherPortalEnabled } = useNavigationFlags();

  // Added missing scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Added missing visibility handler
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNavClick = (sectionId: string) => {
    trackNavigation("navigation_click", {
      from_page: "home",
      to_page: sectionId,
      button_name: `nav_${sectionId}_button`,
      section_id: sectionId,
    });

    closeMenu();
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        const headerOffset = 80;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  // Added missing handleLinkClick function
  const handleLinkClick = () => {
    trackNavigation('navigation_click', {
      from_page: 'current',
      to_page: 'home',
      button_name: 'logo_button',
      section_id: 'home'
    });
    closeMenu();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Added missing closeMenu function
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  const handleMiniTestClick = () => {
    trackButtonClick('mini_test_click', {
      section: 'header',
      target_id: user?.id
    });
    window.open('https://prep.shsatguide.com/free-test-taker/46', '_blank', 'noopener,noreferrer');
    closeMenu();
  };

  // Added missing modal functions
  const openModal = () => {
    trackButtonClick('schedule_call_click', {
      section: 'header',
      target_id: user?.id
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const navItems = [
    { href: "#home", label: "Home", section: "home"},
    { href: "#about", label: "About Us", section: "about"},
    { href: "#resources", label: "Resources", section: "resources"},
    { href: "#faq", label: "FAQ", section: "faq"},
    { href: "#contact", label: "Contact", section: "footer"},
    { href: "#partners", label: "Partners", section: "partners"},
  ];

  return (
    <>
      <nav
        className={`bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm transition-all duration-500 ${
          isScrolled ? "shadow-lg bg-white/95 backdrop-blur-sm" : ""
        }`}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-24">
            {/* Logo */}
            <Link
              to="/"
              onClick={handleLinkClick}
              aria-label="SHSATGuide.com Homepage"
            >
              <div className={`flex-shrink-0 transform transition-all duration-800 hover:scale-105 ${
                isVisible ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-4 opacity-0 scale-95'
              }`} style={{ transitionDelay: '0.2s' }}>
                <img
                  src={logo}
                  alt="Bell Curves Logo - SHSAT Test Preparation Experts"
                  className="h-12 sm:h-16 object-contain w-auto"
                  width="120"
                  height="64"
                  loading="eager"
                />
              </div>
            </Link>

            {/* Desktop Navigation - Only show on lg and above */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navItems.map((item, index) => (
                <a
                  key={item.section}
                  href={item.href}
                  onClick={() => handleNavClick(item.section)}
                  className={`text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-all duration-300 relative group ${
                    isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                  }`}
                  style={{ transitionDelay: `${0.3 + index * 0.1}s` }}
                  
                  aria-label={`Navigate to ${item.label} section`}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#377e9a] group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}

              {/* Products Link */}
              <Link
                to="/products"
                className={`text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-all duration-300 relative group ${
                  isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                }`}
                style={{ transitionDelay: '0.8s' }}
                title="SHSAT Practice Tests and Study Materials"
                aria-label="View SHSAT preparation products and practice tests"
              >
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#377e9a] group-hover:w-full transition-all duration-300"></span>
              </Link>

              {/* Teacher Portal */}
              {teacherPortalEnabled && (
                <Link
                  to="/teachers"
                  onClick={() => {
                    const userName = getUserName();
                    /* console.log('PostHog tracking - Teacher Portal Nav Button:', {
                      userName,
                      user,
                      userEmail: user?.email,
                      userNameFromUser: user?.name
                    }); */
                  }}
                  className={`text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-all duration-300 relative group ${
                    isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                  }`}
                  style={{ transitionDelay: '0.9s' }}
                  title="Teacher Portal for SHSAT Resources"
                  aria-label="Access Teacher Portal for SHSAT materials"
                >
                  Teacher Portal
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#377e9a] group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
            </div>

            {/* Desktop CTA Buttons - Only show on lg and above */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={handleMiniTestClick}
                className={`group relative bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg transform active:scale-95 overflow-hidden ${
                  isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"
                }`}
                style={{ transitionDelay: "1.2s" }}
                aria-label="Take a quick mini-test"
                title="Quick SHSAT Mini-Test"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative z-10 font-medium">Mini-Test</span>
              </button>

              <button
                onClick={openModal}
                className={`group relative bg-[#1094c9] text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#34afec] hover:scale-105 hover:shadow-md transform active:scale-95 overflow-hidden ${
                  isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"
                }`}
                style={{ transitionDelay: "1.3s" }}
                aria-label="Schedule a free SHSAT consultation call"
                title="Schedule Free SHSAT Consultation"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative z-10 font-medium">Schedule a Call</span>
              </button>
            </div>

            {/* Mobile & Tablet Menu Button - Show on md and below (hidden on lg+) */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Show only Mini-Test button on md screens, hide on sm */}
              <div className="hidden md:block">
                <button
                  onClick={handleMiniTestClick}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-2 rounded-lg transition-all duration-300 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 text-sm font-medium min-w-[90px]"
                  aria-label="Take a quick mini-test"
                >
                  Mini-Test
                </button>
              </div>
              <div className="hidden md:block">
                <button
                  onClick={openModal}
                  className="bg-[#1094c9] text-white px-3 py-2 rounded-lg transition-all duration-300 hover:bg-[#34afec] hover:scale-105 text-sm font-medium min-w-[120px]"
                  aria-label="Schedule a free SHSAT consultation call"
                >
                  Schedule Call
                </button>
              </div>

              <button
                onClick={toggleMenu}
                className={`text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2 transform transition-all duration-300 hover:scale-110 ${
                  isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-4 opacity-0 scale-95'
                }`}
                style={{ transitionDelay: '0.5s' }}
                aria-label="Toggle navigation menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg
                  className={`h-6 w-6 transform transition-all duration-300 ${
                    isMenuOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
                  }`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {isMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Navigation Menu - Show on md and below */}
          <div
            id="mobile-menu"
            className={`lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 z-40 transform transition-all duration-300 ease-in-out overflow-hidden ${
              isMenuOpen 
                ? 'max-h-[80vh] opacity-100 translate-y-0 shadow-lg' 
                : 'max-h-0 opacity-0 -translate-y-4'
            }`}
            role="menu"
            aria-hidden={!isMenuOpen}
          >
            <div className="px-4 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Navigation Links */}
              <div className="grid gap-2">
                {navItems.map((item, index) => (
                  <a
                    key={item.section}
                    href={item.href}
                    onClick={() => handleNavClick(item.section)}
                    className="text-gray-700 hover:text-gray-900 block px-4 py-3 text-base font-medium transition-all duration-300 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200"
                    role="menuitem"
                    
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    {item.label}
                  </a>
                ))}

                <Link
                  to="/products"
                  className="text-gray-700 hover:text-gray-900 block px-4 py-3 text-base font-medium transition-all duration-300 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200"
                  role="menuitem"
                  title="SHSAT Study Materials and Practice Tests"
                >
                  Products
                </Link>

                {teacherPortalEnabled && (
                  <Link
                    to="/teachers"
                    onClick={() => {
                      const userName = getUserName();
                      posthog.capture("nav_button_clicked", {
                        button_name: "nav_teacher_portal_button",
                        user_name: userName,
                        user_email: user?.email || "unknown",
                        user_id: user?.id || "unknown",
                        user_role: user?.role || "unknown",
                        section_id: "teacher_portal",
                        timestamp: new Date().toISOString(),
                      });
                      handleLinkClick();
                    }}
                    className="text-gray-700 hover:text-gray-900 block px-4 py-3 text-base font-medium transition-all duration-300 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200"
                    role="menuitem"
                    title="Teacher Resources for SHSAT Preparation"
                  >
                    Teacher Portal
                  </Link>
                )}
              </div>

              {/* Mobile CTA Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {/* Show Schedule Call button for all mobile/tablet sizes */}
                {/* Show Mini-Test button only on sm screens (hidden on md since it's in header) */}
                <div className="md:hidden mb-3 space-y-3">
                  <button
                    onClick={openModal}
                    className="w-full bg-[#1094c9] text-white px-4 py-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#34afec] hover:scale-105 active:scale-95 font-medium text-base shadow-md"
                    role="menuitem"
                    aria-label="Schedule SHSAT consultation call"
                  >
                    Schedule Free Call
                  </button>
                  <button
                    onClick={handleMiniTestClick}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-lg transition-all duration-300 ease-in-out hover:from-emerald-600 hover:to-teal-700 hover:scale-105 active:scale-95 font-medium text-base shadow-md"
                    aria-label="Take a quick mini-test"
                  >
                    Mini-Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal Backdrop */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="absolute inset-0 bg-black bg-opacity-70 transition-opacity duration-300"
            aria-hidden="true"
          ></div>
          <div 
            className="relative z-10 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Schedule_calls isOpen={isModalOpen} onClose={closeModal} />
          </div>
        </div>
      )}

      {/* Enhanced Custom CSS */}
      <style>{`
        /* Smooth animations for mobile menu */
        #mobile-menu {
          transform-origin: top;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        /* Improved scrollbar for mobile menu */
        #mobile-menu > div {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 transparent;
        }

        #mobile-menu > div::-webkit-scrollbar {
          width: 4px;
        }

        #mobile-menu > div::-webkit-scrollbar-track {
          background: transparent;
        }

        #mobile-menu > div::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 20px;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;