import { useState, useEffect } from "react";
// import { useSegment } from "@/lib/segment-context";
// import { Link } from "react-router-dom";
// import { downloadParentGuide } from "@/lib/api";
// import { useToast } from "@/components/ui/use-toast";
import background from "./images/counterbackgroung.png"

const CountdownTimer = () => {
  // const { segment } = useSegment();
  // const { toast } = useToast();
  // const [isDownloading, setIsDownloading] = useState(false);
  const targetDate = new Date("October 18, 2025").getTime();
  const [timeLeft, setTimeLeft] = useState({
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds:0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const weeks = Math.floor(difference / (1000 * 60 * 60 * 24 * 7));
      // const days = Math.floor(
      //   (difference % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)
      // );
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor(
          (difference % (1000 * 60  )) / 1000
        )

        setTimeLeft({ weeks, days, hours, minutes ,seconds});
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000); // Update every minute

    return () => clearInterval(timer);
  }, [targetDate]);

  // Segment-specific titles and CTAs
  // const segmentContent = {
  //   default: {
  //     title: `${timeLeft.weeks} Weeks Until the October SHSAT`,
  //     subtitle: "Target: October 26, 2025",
  //     cta: "Here's your plan if you start now:",
  //     ctaLink: "/timeline",
  //   },
  //   student: {
  //     title: `${timeLeft.weeks} Weeks to Prepare - You've Got This!`,
  //     subtitle: "SHSAT Test Day: October 26, 2025",
  //     cta: "See your week-by-week study plan:",
  //     ctaLink: "/student-timeline",
  //   },
  //   parent: {
  //     title: `${timeLeft.weeks} Weeks to Help Your Child Prepare`,
  //     subtitle: "SHSAT Test Day: October 26, 2025",
  //     cta: "Download our parent preparation calendar:",
  //     ctaLink: "/parent-timeline",
  //   },
  // };

  // Get content for current segment (only for default, student and parent)
  // const content = segmentContent[segment] || segmentContent.default;

  // const handleDownload = async () => {
  //   try {
  //     setIsDownloading(true);
  //     await downloadParentGuide();
  //     toast({
  //       title: "Download Started",
  //       description: "Your SHSAT Parent Guide is downloading.",
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Download Failed",
  //       description: "Please try again later.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  // return (

  //   <section className="py-10 bg-gray-50">
  //     <div className="container-custom">
  //       <div className="text-center mb-2">
  //         <span className="inline-flex items-center">
  //           <svg
  //             className="w-5 h-5 mr-2 text-brand-blue"
  //             xmlns="http://www.w3.org/2000/svg"
  //             viewBox="0 0 24 24"
  //             fill="none"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           >
  //             <circle cx="12" cy="12" r="10"></circle>
  //             <polyline points="12 6 12 12 16 14"></polyline>
  //           </svg>
  //           <h2 className="font-bold text-xl md:text-2xl text-gray-800">
  //             {content.title}
  //           </h2>
  //         </span>
  //         <p className="text-gray-600 text-sm">{content.subtitle}</p>
  //       </div>

  //       <div className="grid grid-cols-3 gap-4 mt-8">
  //         <div className="card">
  //           <div className="flex items-start mb-3">
  //             <svg
  //               className="w-5 h-5 mt-1 mr-2 text-brand-blue"
  //               xmlns="http://www.w3.org/2000/svg"
  //               viewBox="0 0 24 24"
  //               fill="none"
  //               stroke="currentColor"
  //               strokeWidth="2"
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //             >
  //               <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
  //               <line x1="16" y1="2" x2="16" y2="6"></line>
  //               <line x1="8" y1="2" x2="8" y2="6"></line>
  //               <line x1="3" y1="10" x2="21" y2="10"></line>
  //             </svg>
  //             <h3 className="font-bold">⌛ {timeLeft.weeks} Weeks Remaining</h3>
  //           </div>
  //           <p className="text-gray-600 text-sm">Time to prepare effectively</p>
  //         </div>

  //         <div className="card">
  //           <div className="flex items-start mb-3">
  //             <svg
  //               className="w-5 h-5 mt-1 mr-2 text-brand-blue"
  //               xmlns="http://www.w3.org/2000/svg"
  //               viewBox="0 0 24 24"
  //               fill="none"
  //               stroke="currentColor"
  //               strokeWidth="2"
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //             >
  //               <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
  //               <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  //             </svg>
  //             <h3 className="font-bold">
  //               📚 ~24 Math / 24 ELA Questions per Week
  //             </h3>
  //           </div>
  //           <p className="text-gray-600 text-sm">To complete the full Q-Bank</p>
  //         </div>

  //         <div className="card">
  //           <div className="flex items-start mb-3">
  //             <svg
  //               className="w-5 h-5 mt-1 mr-2 text-brand-blue"
  //               xmlns="http://www.w3.org/2000/svg"
  //               viewBox="0 0 24 24"
  //               fill="none"
  //               stroke="currentColor"
  //               strokeWidth="2"
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //             >
  //               <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
  //               <polyline points="22 4 12 14.01 9 11.01"></polyline>
  //             </svg>
  //             <h3 className="font-bold">🦩 1 Practice Test Every 3 Weeks</h3>
  //           </div>
  //           <p className="text-gray-600 text-sm">
  //             Pace like the real exam before test day
  //           </p>
  //         </div>
  //       </div>

  //       <div className="text-center mt-6 space-y-4">
  //         <Link
  //           to={content.ctaLink}
  //           className="text-brand-blue inline-flex items-center hover:underline font-medium"
  //         >
  //           {content.cta}
  //           <svg
  //             className="ml-1 w-4 h-4"
  //             xmlns="http://www.w3.org/2000/svg"
  //             viewBox="0 0 24 24"
  //             fill="none"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           >
  //             <line x1="5" y1="12" x2="19" y2="12"></line>
  //             <polyline points="12 5 19 12 12 19"></polyline>
  //           </svg>
  //         </Link>

  //         {/* Add download button for parent segment */}
  //         {segment === "parent" && (
  //           <div>
  //             <button
  //               onClick={handleDownload}
  //               disabled={isDownloading}
  //               className="btn-primary inline-flex items-center"
  //             >
  //               {isDownloading ? (
  //                 <>
  //                   <svg
  //                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
  //                     xmlns="http://www.w3.org/2000/svg"
  //                     fill="none"
  //                     viewBox="0 0 24 24"
  //                   >
  //                     <circle
  //                       className="opacity-25"
  //                       cx="12"
  //                       cy="12"
  //                       r="10"
  //                       stroke="currentColor"
  //                       strokeWidth="4"
  //                     ></circle>
  //                     <path
  //                       className="opacity-75"
  //                       fill="currentColor"
  //                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //                     ></path>
  //                   </svg>
  //                   Downloading...
  //                 </>
  //               ) : (
  //                 <>
  //                   <svg
  //                     className="w-5 h-5 mr-2"
  //                     xmlns="http://www.w3.org/2000/svg"
  //                     viewBox="0 0 24 24"
  //                     fill="none"
  //                     stroke="currentColor"
  //                     strokeWidth="2"
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                   >
  //                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  //                     <polyline points="7 10 12 15 17 10"></polyline>
  //                     <line x1="12" y1="15" x2="12" y2="3"></line>
  //                   </svg>
  //                   Download Parent Guide
  //                 </>
  //               )}
  //             </button>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   </section>
  // );

  return(
    <section className="relative py-10 px-4 md:px-10 lg:px-16 overflow-hidden">
      <img src={background} alt=""  className="absolute top-0 left-0 w-full h-full object-cover z-0"/>
      <div className="absolute top-0 left-0 w-full h-full  bg-opacity-50 z-10"></div>
      <div className="relative z-20 max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="max-w-xl text-gray-200  sm:text-left">
          <h2 className="text-xl sm:text-2xl font-semibold  ">Countdown To The Digital SHSAT</h2>
          <p>Stay on track with a countdown to test day!Here's how many weeks and months remain before the next SHSAT-and a basic action plan for families starting now</p>

        </div>
        <div className="bg-white rounded-lg shadow-md">
        <div className="bg-red-500 text-white rounded-xl m-2  px-6 py-6  text-center">
          <h3 className="text-sm uppercase tracking-wide font-semibold mb-4">Bell Curves Countdown</h3>
          <div className="flex justify-center gap-4 mb-4">
            <div className="bg-white text-black rounded-md px-4 py-2 text-center">
              <p className="text-lg font-bold">{timeLeft.days}</p>
              <p className="text-xs uppercase">Days</p>

            </div>
                        <div className="bg-white text-black rounded-md px-4 py-2 text-center">
              <p className="text-lg font-bold">{timeLeft.hours}</p>
              <p className="text-xs uppercase">Hours</p>

            </div>
                        <div className="bg-white text-black rounded-md px-4 py-2 text-center">
              <p className="text-lg font-bold">{timeLeft.minutes}</p>
              <p className="text-xs uppercase">Mins</p>

            </div>
                        <div className="bg-white text-black rounded-md px-4 py-2 text-center">
              <p className="text-lg font-bold">{timeLeft.seconds}</p>
              <p className="text-xs uppercase">Sec</p>

            </div>
          </div>
          <button className="bg-red-500 text-white border border-gray-100 font-medium px-4 py-2 rounded-md text-sm hover:bg-gray-100 hover:text-red-500">
            Here's your plan if you start now

          </button>

        </div>
        </div>


      </div>

    </section>
  )
};


export default CountdownTimer;
