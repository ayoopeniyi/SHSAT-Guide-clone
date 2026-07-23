import bannerImg from "./images/herobanner.png";
import bannerbackgroun from "./images/hero-background.png";
import bannerUn from "./images/hero-backgroung-miscellaneous.png";
import { useState, useEffect } from "react";
import ParentguidePdf from "./ParentguidePdf";

const HeroSection = () => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isVisible, setIsVisible] = useState<boolean>(false);

	const openModal = (): void => setIsModalOpen(true);
	const closeModal = (): void => setIsModalOpen(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 100);
		return () => clearTimeout(timer);
	}, []);

	return (
		<section
			id="home"
			className="relative bg-[#fff5f6] py-12 px-4 md:px-16 overflow-hidden scroll-mt-24"
			role="banner"
		>


			{/* Background with fade-in */}
			<img
				src={bannerUn}
				alt=""
				className={`absolute top-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
					isVisible ? "opacity-100" : "opacity-0"
				}`}
				loading="lazy"
				role="presentation"
				aria-hidden="true"
			/>

			<div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
				{/* Left Content */}
				<div
					className={`w-full md:w-[50%] text-center md:text-left space-y-6 transform transition-all duration-800 ${
						isVisible
							? "translate-x-0 opacity-100"
							: "-translate-x-10 opacity-0"
					}`}
				>
					<h1
						className={`text-3xl sm:text-4xl md:text-[50px] lg-text-[60px] font-bold lg:leading-tight md:leading-[1.2] text-gray-900 transform transition-all duration-1000 delay-200 ${
							isVisible
								? "translate-y-0 opacity-100"
								: "translate-y-6 opacity-0"
						}`}
						itemProp="headline"
					>
						Help Your Child Succeed On The{" "}
						<span className="text-[#1d99c6] relative inline-block">
							First-Ever Digital SHSAT
							<span
								className={`absolute bottom-0 left-0 h-1 bg-[#1d99c6] transition-all duration-1000 delay-700 ${
									isVisible ? "w-full" : "w-0"
								}`}
							></span>
						</span>
					</h1>

					<p
						className={`mt-5 text-gray-700 text-base md:text-lg max-w-md mx-auto md:mx-0 transform transition-all duration-800 delay-400 ${
							isVisible
								? "translate-y-0 opacity-100"
								: "translate-y-4 opacity-0"
						}`}
						itemProp="description"
					>
						2025 is the first year the Specialized High Schools Admissions Test
						(SHSAT) is fully computer-based. Download the free{" "}
						<strong>Parent Guide</strong> for expert strategies, real sample
						questions, and tips tailored for NYC families.
					</p>

					<div
						className={`transform transition-all duration-800 delay-600 ${
							isVisible
								? "translate-y-0 opacity-100 scale-100"
								: "translate-y-6 opacity-0 scale-95"
						}`}
					>
						<button
							onClick={openModal}
							className="group relative mt-6 px-8 py-4 bg-[#1d99c6] text-white rounded-md font-semibold transition-all duration-300 transform hover:bg-[#1782a7] hover:scale-105 hover:shadow-lg active:scale-95 overflow-hidden"
							aria-label="Download Free Digital SHSAT Parent Guide"
							title="Get Free SHSAT Parent Guide for Digital Test 2025"
						>
							<span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>

							<span className="relative z-10 flex items-center gap-2">
								Email Parent Guide
								<svg
									className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</span>
						</button>
					</div>


				</div>

				<ParentguidePdf isOpen={isModalOpen} onClose={closeModal} />

				{/* Right Image Section */}
				<div
					className={`w-full md:w-[50%] relative flex justify-center items-center transform transition-all duration-1000 delay-300 ${
						isVisible
							? "translate-x-0 opacity-100 scale-100"
							: "translate-x-10 opacity-0 scale-95"
					}`}
				>
					<img
						src={bannerbackgroun}
						alt=""
						className="absolute w-full h-full object-contain opacity-60 pointer-events-none transition-all duration-1000 delay-500"
						loading="lazy"
						role="presentation"
						aria-hidden="true"
					/>

					<div className="relative w-full max-w-md mx-auto md:max-w-[80%] z-10">
						<img
							src={bannerImg}
							alt="Student preparing for digital SHSAT test with Bell Curves guide"
							className={`relative w-full transform transition-all duration-1000 delay-400 ${
								isVisible
									? "translate-y-0 opacity-100 scale-100"
									: "translate-y-8 opacity-0 scale-90"
							}`}
							loading="eager"
							width="600"
							height="400"
							itemProp="image"
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;




// const { segment } = useSegment();

	// Define segment-specific hero content
	// const heroContent = {
	//   default: {
	//     heroAddOn: "",
	//     primaryCTA: "Take the Free Readiness Quiz",
	//     primaryCTALink: "/readiness-quiz",
	//     secondaryCTA: "Download Free Parent Guide",
	//     secondaryCTALink: "/parent-guide",
	//   },
	//   student: {
	//     heroAddOn:
	//       "Practice with real digital-format questions that match what you'll see on test day. Score higher by training smarter.",
	//     primaryCTA: "Start Practicing Now",
	//     primaryCTALink: "/question-bank",
	//     secondaryCTA: "Take the 10-Minute Readiness Quiz",
	//     secondaryCTALink: "/readiness-quiz",
	//   },
	//   parent: {
	//     heroAddOn:
	//       "Help your child prepare for the new digital SHSAT — with structure, guidance, and credible practice tools created by real educators.",
	//     primaryCTA: "Download the Free Parent Guide",
	//     primaryCTALink: "/parent-guide",
	//     secondaryCTA: "Take the Readiness Quiz Together",
	//     secondaryCTALink: "/readiness-quiz",
	//   },
	//   educator: {
	//     heroAddOn:
	//       "Launch a complete SHSAT prep program with digital and print tools built for DOE-aligned classrooms and after-school programs.",
	//     primaryCTA: "Apply to Use Bell Curves in Your Program",
	//     primaryCTALink: "/white-label",
	//     secondaryCTA: "Request a Walkthrough or Demo",
	//     secondaryCTALink: "/demo",
	//   },
	//   tutor: {
	//     heroAddOn:
	//       "Use Bell Curves SHSAT materials under your own brand. Save time and deliver high-quality prep to students immediately.",
	//     primaryCTA: "Apply to Use Bell Curves Materials",
	//     primaryCTALink: "/white-label",
	//     secondaryCTA: "Preview the Partner Tools",
	//     secondaryCTALink: "/partner-tools",
	//   },
	// };

	// Get content for current segment
	// const content = heroContent[segment] || heroContent.default;

	// return (
	//   <section className="bg-brand-blue py-12 md:py-16 lg:py-24">
	//     <div className="container-custom">
	//       <div className="grid md:grid-cols-2 gap-8 items-center">
	//         <div className="text-white">
	//           <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
	//             Welcome to the SHSAT Info Center
	//           </h1>
	//           <h2 className="text-xl md:text-2xl mb-6 font-light">
	//             Your Home for the 2025 Digital SHSAT
	//           </h2>
	//           <p className="text-base md:text-lg mb-6 md:mb-8">
	//             Practice, plan, and succeed on the new SHSAT with trusted tools,
	//             expert guidance, and proven results — all in one place.
	//           </p>

	//           {/* Show segment-specific add-on text if available */}
	//           {content.heroAddOn && (
	//             <p className="text-base md:text-lg mb-6 md:mb-8 font-medium bg-gray-800/20 p-3 rounded-lg">
	//               {content.heroAddOn}
	//             </p>
	//           )}

	//           {/* Digital SHSAT banner (for all segments) */}
	//           {segment !== "default" && (
	//             <div className="mb-6 py-2 px-4 bg-brand-yellow text-black rounded-md">
	//               <p className="text-sm font-medium">
	//                 The SHSAT is now fully computer-based. Practicing the new
	//                 digital question types is essential.
	//               </p>
	//             </div>
	//           )}

	//           <div className="flex flex-col sm:flex-row gap-4">
	//             <Link
	//               to={content.primaryCTALink}
	//               className="btn-yellow w-full sm:w-auto"
	//             >
	//               {content.primaryCTA}
	//             </Link>
	//             <Link
	//               to={content.secondaryCTALink}
	//               className="btn-secondary w-full sm:w-auto"
	//             >
	//               {content.secondaryCTA}
	//             </Link>
	//           </div>
	//           <div className="mt-4 md:mt-6">
	//             <Link
	//               to="/buy-workbook"
	//               className="btn-primary inline-flex items-center w-full sm:w-auto justify-center"
	//             >
	//               Buy the SHSAT Workbook
	//               <span className="ml-2">→</span>
	//             </Link>
	//           </div>

	//           <p className="mt-6 md:mt-8 text-sm opacity-80">
	//             Trusted by over 75,000 NYC students and 30+ Partner Organizations
	//           </p>
	//         </div>

	//         {!isMobile && (
	//           <div className="hidden md:block">
	//             <div className="relative">
	//               <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-yellow rounded-full opacity-20"></div>
	//               <div className="bg-white p-8 rounded-lg shadow-lg relative">
	//                 <img
	//                   src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
	//                   alt="SHSAT Preparation"
	//                   className="rounded-md w-full h-auto"
	//                 />
	//                 <div className="mt-4 text-center">
	//                   <h3 className="text-gray-800 font-bold text-lg">
	//                     SHSAT Workbook 2025
	//                   </h3>
	//                   <p className="text-gray-600">
	//                     Strategy lessons + targeted practice
	//                   </p>
	//                 </div>
	//               </div>
	//             </div>
	//           </div>
	//         )}
	//       </div>
	//     </div>
	//   </section>
	// );