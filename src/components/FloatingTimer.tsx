// FloatingTimer.tsx
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface PlanMetrics {
  weeklyHours: string;
  questionsPerWeek: string;
  testPlan: string;
  testsRemaining: string;
  planCopy: string;
  urgencyLevel: string;
}

const FloatingTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(true); // Default to minimized

  const getAdjustedTargetDate = (): number => {
    const now = new Date();
    // Start with October 18, 2025
    let targetDate = new Date(now.getFullYear(), 9, 18); // Month is 0-indexed, so 9 = October
    
    // If the target date has passed, move to next year
    while (targetDate.getTime() <= now.getTime()) {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    }
    
    return targetDate.getTime();
  };

  const getWeeksRemaining = (): number => {
    const now = new Date().getTime();
    const adjustedTarget = getAdjustedTargetDate();
    const difference = adjustedTarget - now;
    return Math.floor(difference / (1000 * 60 * 60 * 24 * 7));
  };

  const getPlanMetrics = (weeksLeft: number): PlanMetrics => {
    if (weeksLeft >= 20) {
      return {
        weeklyHours: "2–3 hrs/week",
        questionsPerWeek: "24–30 each",
        testPlan: "1 test every 3–4 weeks",
        testsRemaining: "6–7",
        planCopy: "You've got time to build mastery step-by-step.",
        urgencyLevel: "low",
      };
    } else if (weeksLeft >= 15) {
      return {
        weeklyHours: "3–4 hrs/week",
        questionsPerWeek: "30–35 each",
        testPlan: "1 test every 3 weeks",
        testsRemaining: "4–5",
        planCopy: "Pick up the pace a bit to stay ahead.",
        urgencyLevel: "medium",
      };
    } else if (weeksLeft >= 10) {
      return {
        weeklyHours: "4–5 hrs/week",
        questionsPerWeek: "40+ each",
        testPlan: "1 test every 2–3 weeks",
        testsRemaining: "3–4",
        planCopy: "Focus on weak spots and build test stamina.",
        urgencyLevel: "medium-high",
      };
    } else if (weeksLeft >= 5) {
      return {
        weeklyHours: "5–6 hrs/week",
        questionsPerWeek: "50–60 each",
        testPlan: "1 test every 2 weeks",
        testsRemaining: "2–3",
        planCopy: "Time for full-length tests and high-impact review.",
        urgencyLevel: "high",
      };
    } else if (weeksLeft >= 1) {
      return {
        weeklyHours: "6–8 hrs/week",
        questionsPerWeek: "Review sets only",
        testPlan: "Final test or rest",
        testsRemaining: "1–2",
        planCopy: "Focus on timing, test-taking strategy, and rest.",
        urgencyLevel: "critical",
      };
    } else {
      return {
        weeklyHours: "1–2 hrs/week",
        questionsPerWeek: "Light review only",
        testPlan: "Rest and review",
        testsRemaining: "0–1",
        planCopy: "Review lightly. Sleep well. You're ready!",
        urgencyLevel: "final",
      };
    }
  };

  const weeksRemaining = getWeeksRemaining();
  const planMetrics = getPlanMetrics(weeksRemaining);

  const getUrgencyLevelColor = (urgencyLevel: string): string => {
    switch (urgencyLevel) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-blue-600";
      case "medium-high":
        return "text-orange-500";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-500";
      case "final":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  useEffect(() => {
    const calculateTimeLeft = (): void => {
      const now = Date.now();
      const adjustedTarget = getAdjustedTargetDate();
      const diff = adjustedTarget - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const id = window.setInterval(calculateTimeLeft, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = (): void => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const adjustedTarget = getAdjustedTargetDate();
  const dateObj = new Date(adjustedTarget);
  const options = { year: "numeric", month: "long", day: "numeric" } as const;
  const formatedDate = dateObj.toLocaleDateString(undefined, options);

  // Handle click on minimized timer to open medium view
  const handleMinimizedClick = () => {
    setIsMinimized(false);
    setDrawerOpen(false); // Start with drawer closed in medium view
  };

  // Handle click on X button to minimize from medium/full view
  const handleMinimize = () => {
    setIsMinimized(true);
    setDrawerOpen(false);
  };

  // Handle click on the main timer area in medium view
  const handleTimerClick = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  if (isMinimized) {
    return (
      <div className={`fixed right-6 z-50 transition-all duration-300 ${isScrolled ? "top-20" : "top-60"}`}>
        <button
          onClick={handleMinimizedClick}
          aria-label="Open countdown timer"
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:scale-105"
        >
          <span className="flex items-center gap-1">
            <span>⏳</span>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed right-6 z-50 transition-all duration-300 ${isScrolled ? "top-20" : "top-32"}`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-sm">

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-6 relative">
          <button
            onClick={handleMinimize}
            aria-label="Minimize countdown"
            className="absolute top-2 right-2 text-red-200 hover:text-white text-lg w-6 h-6 flex items-center justify-center transition-colors hover:bg-red-500 rounded"
          >
            <X size={16} />
          </button>

          <h3 className="text-sm font-bold uppercase tracking-wide text-center">⏳ SHSAT Countdown Clock</h3>
          <p className="text-xs text-red-100 text-center mt-1">Digital SHSAT - {formatedDate}</p>
        </div>

        {/* Timer Display - Clickable to toggle drawer */}
        <div 
          className="p-6 bg-white cursor-pointer transition-colors hover:bg-gray-50"
          onClick={handleTimerClick}
        >
          <div className={`text-center mb-4 font-mono text-2xl font-bold ${getUrgencyLevelColor(planMetrics.urgencyLevel)} transition-colors duration-500`}>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </div>

          <div className="w-full flex items-center justify-center gap-2 text-blue-600 font-medium py-2 text-sm border-t border-gray-100 pt-4">
            {isDrawerOpen ? (
              <>
                Hide your study plan
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                Show your study plan
                <ChevronDown size={16} />
              </>
            )}
          </div>
        </div>

        {/* Expandable Drawer */}
        {isDrawerOpen && (
          <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-6">
            <div className="text-center">
              <h4 className="font-bold text-gray-900 mb-2">{weeksRemaining} Weeks to Go</h4>
              <p className="text-sm text-gray-600 italic">{planMetrics.planCopy}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">Study Time</span>
                </div>
                <p className="text-sm text-gray-700">
                  Suggested: <span className="font-semibold">{planMetrics.weeklyHours}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">(~20–30 mins/day, 5 days/week)</p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">Question Practice</span>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{planMetrics.questionsPerWeek}</span> Math & Verbal per week
                </p>
                <p className="text-xs text-gray-500 mt-1">Focus on accuracy and review, not speed</p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">Full-Length Tests</span>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{planMetrics.testPlan}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">(~{planMetrics.testsRemaining} total tests recommended)</p>
              </div>
            </div>

            <a href="/#resources"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              Try Your First Practice Set
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingTimer;