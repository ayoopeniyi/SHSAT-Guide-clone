import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
// import { useIsMobile } from "@/hooks/use-mobile";
import { useActionTracking } from "../lib/action-tracking";
import { useAuthStore } from "../stores/authStore";
import { TrackedButton } from "./TrackedButton";
import { useNavigationFlags } from "../hooks/useFeatureFlags";
import bellCurvers from "./images/bellcurves.png"
import posthog from "posthog-js";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const isMobile = useIsMobile();
  const { trackNavigation, trackButtonClick } = useActionTracking();
  const getUserName = useAuthStore((state) => state.getUserName);
  const user = useAuthStore((state) => state.user);
  const {
    questionsEnabled,
    howItWorksEnabled,
    whyBellCurvesEnabled,
    faqEnabled,
    takeQuizEnabled,
    teacherPortalEnabled,
    buyWorkbookEnabled,
  } = useNavigationFlags();

  const handleNavClick = (sectionId: string) => {
    // Enhanced action tracking with proper user details
    trackNavigation('navigation_click', {
      from_page: 'home',
      to_page: sectionId,
      button_name: `nav_${sectionId}_button`,
      section_id: sectionId
    });
    
    setIsMenuOpen(false);
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
  
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 h-[100px]">
      <div className="container-custom flex justify-between items-center py-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-brand-blue">
              {/* SHSAT Info Center */}
              <img src={bellCurvers} alt="bellcurves" className="w-15 h-15" />
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {questionsEnabled && (
            <Link
              to="/questions"
              onClick={() => {
                const userName = getUserName();
                /* console.log('PostHog tracking - Questions Nav Button:', {
                  userName,
                  user,
                  userEmail: user?.email,
                  userNameFromUser: user?.name
                }); */
                
                posthog.capture('nav_button_clicked', {
                  button_name: 'nav_questions_button',
                  user_name: userName,
                  user_email: user?.email || 'unknown',
                  user_id: user?.id || 'unknown',
                  user_role: user?.role || 'unknown',
                  section_id: 'questions',
                  timestamp: new Date().toISOString()
                });
              }}
              className="text-gray-600 hover:text-brand-blue transition-colors"
            >
              Questions
            </Link>
          )}
          {howItWorksEnabled && (
            <TrackedButton
              trackingName="nav_how_it_works_button"
              trackingContext={{
                page: 'header',
                action: 'navigation_click',
                section: 'how-it-works'
              }}
              variant="ghost"
              className="text-gray-600 hover:text-brand-blue transition-colors"
              onClick={() => handleNavClick("how-it-works")}
            >
              How It Works
            </TrackedButton>
          )}
          {whyBellCurvesEnabled && (
            <TrackedButton
              trackingName="nav_why_bell_curves_button"
              trackingContext={{
                page: 'header',
                action: 'navigation_click',
                section: 'why-bell-curves'
              }}
              variant="ghost"
              className="text-gray-600 hover:text-brand-blue transition-colors"
              onClick={() => handleNavClick("why-bell-curves")}
            >
              Why Bell Curves
            </TrackedButton>
          )}
          {faqEnabled && (
            <TrackedButton
              trackingName="nav_faq_button"
              trackingContext={{
                page: 'header',
                action: 'navigation_click',
                section: 'faq'
              }}
              variant="ghost"
              className="text-gray-600 hover:text-brand-blue transition-colors"
              onClick={() => handleNavClick("faq")}
            >
              FAQ
            </TrackedButton>
          )}
          {takeQuizEnabled && (
            <Link
              to="/start"
              onClick={() => {
                const userName = getUserName();
                /* console.log('PostHog tracking - Take Quiz Nav Button:', {
                  userName,
                  user,
                  userEmail: user?.email,
                  userNameFromUser: user?.name
                }); */
                
                posthog.capture('nav_button_clicked', {
                  button_name: 'nav_take_quiz_button',
                  user_name: userName,
                  user_email: user?.email || 'unknown',
                  user_id: user?.id || 'unknown',
                  user_role: user?.role || 'unknown',
                  section_id: 'take_quiz',
                  timestamp: new Date().toISOString()
                });
              }}
              className="text-brand-blue hover:text-brand-blue-dark font-medium"
            >
              Take Quiz
            </Link>
          )}
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
                
                posthog.capture('nav_button_clicked', {
                  button_name: 'nav_teacher_portal_button',
                  user_name: userName,
                  user_email: user?.email || 'unknown',
                  user_id: user?.id || 'unknown',
                  user_role: user?.role || 'unknown',
                  section_id: 'teacher_portal',
                  timestamp: new Date().toISOString()
                });
              }}
              className="text-gray-600 hover:text-brand-blue transition-colors"
            >
              Teacher Portal
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {buyWorkbookEnabled && (
            <Link
              to="/buy-workbook"
              onClick={() => {
                const userName = getUserName();
                /* console.log('PostHog tracking - Buy Workbook Nav Button:', {
                  userName,
                  user,
                  userEmail: user?.email,
                  userNameFromUser: user?.name
                }); */
                
                posthog.capture('nav_button_clicked', {
                  button_name: 'nav_buy_workbook_button',
                  user_name: userName,
                  user_email: user?.email || 'unknown',
                  user_id: user?.id || 'unknown',
                  user_role: user?.role || 'unknown',
                  section_id: 'buy_workbook',
                  timestamp: new Date().toISOString()
                });
              }}
              className="btn-primary hidden md:inline-flex"
            >
              Buy Workbook
            </Link>
          )}

          {/* Mobile menu button */}
          <TrackedButton
            trackingName="mobile_menu_toggle_button"
            trackingContext={{
              page: 'header',
              action: 'toggle_menu',
              current_state: isMenuOpen ? 'open' : 'closed'
            }}
            variant="ghost"
            className="md:hidden text-gray-600 hover:text-brand-blue"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </TrackedButton>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="container-custom py-4 space-y-4">
            {questionsEnabled && (
              <Link
                to="/questions"
                className="block w-full text-left text-gray-600 hover:text-brand-blue transition-colors"
              >
                Questions
              </Link>
            )}
            {howItWorksEnabled && (
              <TrackedButton
                trackingName="mobile_nav_how_it_works_button"
                trackingContext={{
                  page: 'header_mobile',
                  action: 'navigation_click',
                  section: 'how-it-works'
                }}
                variant="ghost"
                className="block w-full text-left text-gray-600 hover:text-brand-blue transition-colors"
                onClick={() => handleNavClick("how-it-works")}
              >
                How It Works
              </TrackedButton>
            )}
            {whyBellCurvesEnabled && (
              <TrackedButton
                trackingName="mobile_nav_why_bell_curves_button"
                trackingContext={{
                  page: 'header_mobile',
                  action: 'navigation_click',
                  section: 'why-bell-curves'
                }}
                variant="ghost"
                className="block w-full text-left text-gray-600 hover:text-brand-blue transition-colors"
                onClick={() => handleNavClick("why-bell-curves")}
              >
                Why Bell Curves
              </TrackedButton>
            )}
            {faqEnabled && (
              <TrackedButton
                trackingName="mobile_nav_faq_button"
                trackingContext={{
                  page: 'header_mobile',
                  action: 'navigation_click',
                  section: 'faq'
                }}
                variant="ghost"
                className="block w-full text-left text-gray-600 hover:text-brand-blue transition-colors"
                onClick={() => handleNavClick("faq")}
              >
                FAQ
              </TrackedButton>
            )}
            {takeQuizEnabled && (
              <Link
                to="/start"
                className="block w-full text-left text-brand-blue hover:text-brand-blue-dark font-medium"
              >
                Take Quiz
              </Link>
            )}
            {teacherPortalEnabled && (
              <Link
                to="/teachers"
                className="block w-full text-left text-gray-600 hover:text-brand-blue transition-colors"
              >
                Teacher Portal
              </Link>
            )}
            {buyWorkbookEnabled && (
              <Link
                to="/buy-workbook"
                className="block w-full text-left text-brand-blue hover:text-brand-blue-dark font-medium"
              >
                Buy Workbook
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
