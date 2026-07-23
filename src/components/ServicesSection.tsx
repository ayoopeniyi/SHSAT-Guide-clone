import React, { useState } from "react";
import explore1 from "./images/explore-1.png";
import explore2 from "./images/explore-2.png";
import explore3 from "./images/explore-3.png";
import explore4 from "./images/explore-4.png";
import explore5 from "./images/explore-5.png";
import ServiceSectionBtns from "./ServiceSectionBtns";

const ServicesSection = () => {
	const [modalOpen, setModalOpen] = React.useState(false);
	const [selectedTool, setSelectedTool] = useState<string | null>(null);

	const availableTools = [
		{ id: 'test-pack', name: 'Digital SHSAT Test Pack' },
		{ id: 'question-bank', name: 'SHSAT Question Bank' },
		{ id: 'ai-toolkit', name: 'AI Test Prep Toolkit' },
		{ id: 'digital-course', name: 'SHSAT Digital Course' },
	]

	const handleButtonClick = (toolName: string) => {
		setSelectedTool(toolName);
		setModalOpen(true);
	}

	const handleCloseModal = () => {
		setModalOpen(false);
	}

	return (
		<section 
			id="resources" 
			className="max-w-screen-xl mx-auto px-4 py-8 scroll-mt-24"
			aria-labelledby="services-heading"
			role="region"
		>

			<header className="text-center mb-12">
				<h2 
					id="services-heading" 
					className="text-2xl md:text-3xl font-bold animate-fade-in"
					itemProp="name"
				>
					Explore Our Most Popular{" "}
					<span className="text-[#377E9A]">SHSAT Prep Tools & Resources</span>
				</h2>
				<p className="sr-only">
					Comprehensive SHSAT test preparation products including digital practice tests, question banks, AI tools, and courses for NYC specialized high schools admission
				</p>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8" role="list">
				{/* Digital SHSAT Test Pack */}
				<article 
					className="bg-[#E1FAE5] p-8 rounded-xl shadow-md flex flex-col justify-between min-h-[400px] transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up" 
					style={{ animationDelay: '0.1s' }}
					role="listitem"
					itemProp="itemListElement"
					itemScope
					itemType="https://schema.org/ListItem"
				>
					<meta itemProp="position" content="1" />
					<div className="text-center flex-grow flex flex-col justify-between">
						<div>
							<h3 className="text-lg font-bold text-gray-800 mb-4 leading-tight" itemProp="name">
								Digital SHSAT Test Pack (Pre-Release - Launching Sept 1)
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed mb-6" itemProp="description">
								New question types, fully updated for digital format, 5
								full-length tests. Pre-purchase by 9/1 for 25% off.
							</p>
						</div>

						<figure className="relative w-32 h-32 mx-auto mb-6 transform transition-transform duration-300 hover:scale-110">
							<div className="absolute inset-0 rounded-full bg-gradient-to-b from-green-200 to-green-100 opacity-50" />
							<img
								src={explore1}
								alt="Digital SHSAT Test Pack with 5 full-length practice tests for computer-based exam"
								className="relative z-10 w-full h-full object-contain p-3"
								loading="lazy"
								width="128"
								height="128"
								itemProp="image"
							/>
							<figcaption className="sr-only">Digital SHSAT Practice Tests</figcaption>
						</figure>

						<div className="text-center mb-6">
							<span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-4 py-2 rounded-full border border-green-200 animate-pulse">
								Pre-Purchase Available
							</span>
						</div>

						<button
							className="mt-auto bg-white text-green-600 font-semibold py-3 px-6 rounded-lg border border-green-200 hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm text-sm transform hover:scale-105 active:scale-95"
							onClick={() => handleButtonClick('Digital SHSAT Test Pack')}
							aria-label="Get notified when Digital SHSAT Test Pack launches September 1st"
							title="Pre-order Digital SHSAT Practice Tests"
						>
							Get Notified at Launch
						</button>
					</div>
				</article>

				{/* SHSAT Question Bank */}
				<article 
					className="bg-[#F8F2Dc] p-8 rounded-xl shadow-md flex flex-col justify-between min-h-[400px] transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up" 
					style={{ animationDelay: '0.2s' }}
					role="listitem"
					itemProp="itemListElement"
					itemScope
					itemType="https://schema.org/ListItem"
				>
					<meta itemProp="position" content="2" />
					<div className="text-center flex-grow flex flex-col justify-between">
						<div>
							<h3 className="text-lg font-bold text-gray-800 mb-4 leading-tight" itemProp="name">
								SHSAT Question Bank (Pre-Release - Launching Sept 15)
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed mb-6" itemProp="description">
								Over 1,500 questions, timed or topic/group mode, targeted score
								improvement. Launch 9/15 with 25% pre-purchase discount.
							</p>
						</div>

						<figure className="relative w-32 h-32 mx-auto mb-6 transform transition-transform duration-300 hover:scale-110">
							<div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#fcda62] to-green-100 opacity-50" />
							<img
								src={explore2}
								alt="SHSAT Question Bank with 1,500+ practice questions and timed tests"
								className="relative z-10 w-full h-full object-contain p-3"
								loading="lazy"
								width="128"
								height="128"
								itemProp="image"
							/>
							<figcaption className="sr-only">SHSAT Practice Question Bank</figcaption>
						</figure>

						<div className="text-center mb-6">
							<span className="inline-block bg-[#f8f2dc] text-[#fcda62] text-xs font-semibold px-4 py-2 rounded-full border border-[#fcda62] animate-pulse">
								Waitlist Available
							</span>
						</div>

						<button
							onClick={() => handleButtonClick('SHSAT Question Bank')}
							className="mt-auto bg-white text-[#fcda62] font-semibold py-3 px-6 rounded-lg border border-[#fcda62] hover:bg-[#fcda62] hover:text-white transition-all duration-300 shadow-sm text-sm transform hover:scale-105 active:scale-95"
							aria-label="Join waitlist for SHSAT Question Bank launching September 15th"
							title="Join SHSAT Question Bank Waitlist"
						>
							Join Waitlist
						</button>
					</div>
				</article>

				{/* AI Test Prep Toolkit */}
				<article 
					className="bg-[#daeff7] p-8 rounded-xl shadow-md flex flex-col justify-between min-h-[400px] transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up" 
					style={{ animationDelay: '0.3s' }}
					role="listitem"
					itemProp="itemListElement"
					itemScope
					itemType="https://schema.org/ListItem"
				>
					<meta itemProp="position" content="3" />
					<div className="text-center flex-grow flex flex-col justify-between">
						<div>
							<h3 className="text-lg font-bold text-gray-800 mb-4 leading-tight" itemProp="name">
								AI Test Prep Toolkit (eBook) (Pre-Release - Launching Oct 1)
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed mb-6" itemProp="description">
								AI strategies for students, prompt templates, when to use free vs.
								paid AI services. Launch 10/1 at 25% off pre-order.
							</p>
						</div>

						<figure className="relative w-32 h-32 mx-auto mb-6 transform transition-transform duration-300 hover:scale-110">
							<img
								src={explore3}
								alt="AI Test Prep Toolkit eBook with SHSAT strategies and prompt templates"
								className="relative z-10 w-full h-full object-contain p-3"
								loading="lazy"
								width="128"
								height="128"
								itemProp="image"
							/>
							<figcaption className="sr-only">AI SHSAT Preparation Toolkit</figcaption>
						</figure>

						<div className="text-center mb-6">
							<span className="inline-block bg-[#daeff7] text-[#377e9a] text-xs font-semibold px-4 py-2 rounded-full border border-[#377e9a] animate-pulse">
								Pre-Order Now
							</span>
						</div>

						<button
							onClick={() => handleButtonClick('AI Test Prep Toolkit')}
							className="mt-auto bg-white text-[#377e9a] font-semibold py-3 px-6 rounded-lg border border-[#377e9a] hover:bg-[#377e9a] hover:text-white transition-all duration-300 shadow-sm text-sm transform hover:scale-105 active:scale-95"
							aria-label="Pre-order AI Test Prep Toolkit eBook launching October 1st"
							title="Pre-order AI SHSAT Toolkit"
						>
							Get Notified
						</button>
					</div>
				</article>

				{/* Mobile-only cards */}
				<article className="md:hidden bg-[#fbefe5] p-8 rounded-xl shadow-md flex flex-col items-center min-h-[400px] transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
					<div className="flex-1 text-center flex flex-col justify-between w-full">
						<div>
							<h3 className="text-lg font-bold text-gray-800 mb-4 leading-tight">
								Print Workbook (Available Now)
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed mb-6">
								450+ pages, strategies + practice, aligns to current SHSAT until
								DOE changes in March 2025. Currently available — direct to BC
								store.
							</p>
						</div>

						<figure className="relative w-32 h-32 mx-auto mb-6 transform transition-transform duration-300 hover:scale-110">
							<img
								src={explore4}
								alt="SHSAT Print Workbook with 450+ pages of strategies and practice"
								className="relative z-10 w-full h-full object-contain p-3"
								loading="lazy"
								width="128"
								height="128"
							/>
						</figure>

						<button className="bg-white mt-auto w-full text-[#ef8734] font-semibold py-3 px-6 rounded-lg border border-[#ef8734] hover:bg-[#ef8734] hover:text-white transition-all duration-300 shadow-sm text-sm transform hover:scale-105 active:scale-95"
							aria-label="Purchase SHSAT Print Workbook available now"
							title="Buy SHSAT Workbook">
							Buy Now
						</button>
					</div>
				</article>

				<article className="md:hidden bg-[#e9e1f9] p-8 rounded-xl shadow-md flex flex-col items-center min-h-[400px] transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up" style={{ animationDelay: '0.5s' }}>
					<div className="flex-1 text-center flex flex-col justify-between w-full">
						<div>
							<h3 className="text-lg font-bold text-gray-800 mb-4 leading-tight">
								SHSAT Digital Course
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed mb-6">
								Self-paced lessons, quizzes, instructor support; complements Test
								Packs and Q-Bank. Launch later this year.
							</p>
						</div>

						<figure className="relative w-32 h-32 mx-auto mb-6 transform transition-transform duration-300 hover:scale-110">
							<img
								src={explore5}
								alt="SHSAT Digital Course with self-paced lessons and instructor support"
								className="relative z-10 w-full h-full object-contain p-3"
								loading="lazy"
								width="128"
								height="128"
							/>
						</figure>

						<div className="text-center mb-6">
							<span className="inline-block bg-[#e9e1f9] text-[#9563f6] text-xs font-semibold px-4 py-2 rounded-full border border-[#9563f6] animate-pulse">
								Pre-Register
							</span>
						</div>

						<button
							onClick={() => handleButtonClick('SHSAT Digital Course')}
							className="bg-white text-[#9563f6] mt-auto w-full font-semibold py-3 px-6 rounded-lg border border-[#9563f6] hover:bg-[#9563f6] hover:text-white transition-all duration-300 shadow-sm text-sm transform hover:scale-105 active:scale-95"
							aria-label="Pre-register for SHSAT Digital Course launching later this year"
							title="Pre-register for SHSAT Course">
							Get Notified
						</button>
					</div>
				</article>
			</div>

			{/* Desktop horizontal cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8" role="list">
				<article className="bg-[#fbefe5] p-8 rounded-xl shadow-md md:flex flex-col md:flex-row items-center h-full hidden transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
					<figure className="relative w-32 h-32 mx-auto mb-6 transform transition-transform duration-300 hover:scale-110">
						<img
							src={explore4}
							alt="SHSAT Print Workbook available now with 450+ pages of test preparation"
							className="relative z-10 w-full h-full object-contain p-3"
							loading="lazy"
							width="128"
							height="128"
						/>
					</figure>

					<div className="flex-1 text-center md:text-left flex flex-col justify-between min-h-[140px]">
						<div>
							<h3 className="text-lg font-bold text-gray-800 mb-3 leading-tight">
								Print Workbook (Available Now)
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed mb-4">
								450+ pages, strategies + practice, aligns to current SHSAT until
								DOE changes in March 2025. Currently available — direct to BC
								store.
							</p>
						</div>
						<button className="bg-white mt-auto w-full text-[#ef8734] font-semibold py-3 px-6 rounded-lg border border-[#ef8734] hover:bg-[#ef8734] hover:text-white transition-all duration-300 shadow-sm text-sm transform hover:scale-105 active:scale-95"
							aria-label="Purchase SHSAT Print Workbook - available immediately"
							title="Buy SHSAT Workbook Now">
							Buy Now
						</button>
					</div>
				</article>

				<article className="bg-[#e9e1f9] p-8 rounded-xl shadow-md md:flex flex-col md:flex-row items-center h-full hidden transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-up" style={{ animationDelay: '0.5s' }}>
					<figure className="relative w-32 h-32 mx-auto mb-6 transform transition-transform duration-300 hover:scale-110">
						<img
							src={explore5}
							alt="SHSAT Digital Course with self-paced online lessons"
							className="relative z-10 w-full h-full object-contain p-3"
							loading="lazy"
							width="128"
							height="128"
						/>
					</figure>

					<div className="flex-1 text-center md:text-left flex flex-col justify-between min-h-[140px]">
						<div>
							<h3 className="text-lg font-bold text-gray-800 mb-3 leading-tight">
								SHSAT Digital Course
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed mb-4">
								Self-paced lessons, quizzes, instructor support; complements Test
								Packs and Q-Bank. Launch later this year.
							</p>
							<div className="text-center md:text-left mb-4">
								<span className="inline-block bg-[#e9e1f9] text-[#9563f6] text-xs font-semibold px-4 py-2 rounded-full border border-[#9563f6] animate-pulse">
									Pre-Register Now
								</span>
							</div>
						</div>
						<button
							onClick={() => handleButtonClick('SHSAT Digital Course')}
							className="bg-white text-[#9563f6] mt-auto w-full font-semibold py-3 px-6 rounded-lg border border-[#9563f6] hover:bg-[#9563f6] hover:text-white transition-all duration-300 shadow-sm text-sm transform hover:scale-105 active:scale-95"
							aria-label="Pre-register for SHSAT Digital Course with self-paced lessons"
							title="Pre-register for SHSAT Course">
							Get Notified
						</button>
					</div>
				</article>
			</div>


			<ServiceSectionBtns
				isOpen={modalOpen}
				onClose={handleCloseModal}
				selectedTool={selectedTool}
				availableTools={availableTools}
			/>

			<style>{`
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}

				@keyframes slideUp {
					from { opacity: 0; transform: translateY(40px); }
					to { opacity: 1; transform: translateY(0); }
				}

				.animate-fade-in {
					animation: fadeIn 0.8s ease-out;
				}

				.animate-slide-up {
					animation: slideUp 0.6s ease-out both;
				}
			`}</style>
		</section>
	);
};

export default ServicesSection;

// interface Tool {
//   id: number;
//   icon: string;
//   title: string;
//   description: string;
//   action: string;
//   path: string;
//   highlight: boolean;
//   bestseller?: boolean;
//   comingSoon?: boolean;
//   requiresLogin?: boolean;
// }

// const { segment } = useSegment();

// const handleImageError = (
//   e: React.SyntheticEvent<HTMLImageElement, Event>,
// ) => {
//   console.error("Image failed to load:", e.currentTarget.src);
//   // Optionally set a fallback image
//   e.currentTarget.src = "/placeholder.svg";
// };

// Define segment-specific tools/products
// const segmentTools: Record<string, Tool[]> = {
//   default: [
//     {
//       id: 1,
//       icon: "/svg_images/undraw_youtube-tutorial_xgp1.svg",
//       title: "Readiness Quiz",
//       description: "10-minute diagnostic to help you know where to start",
//       action: "Coming Soon",
//       path: "#",
//       highlight: false,
//       comingSoon: true,
//     },
//     {
//       id: 2,
//       icon: "/svg_images/undraw_teaching_58yg.svg",
//       title: "Parent Guide",
//       description:
//         "Free SHSAT roadmap for 2025 — timelines, tips, strategies",
//       action: "Coming Soon",
//       path: "#",
//       highlight: false,
//       comingSoon: true,
//     },
//     {
//       id: 3,
//       icon: "/svg_images/undraw_book-writer_ri5u.svg",
//       title: "Workbook",
//       description: "Strategy-packed lessons + targeted practice",
//       action: "Preview Book",
//       path: "/workbook",
//       highlight: true,
//       bestseller: true,
//     },
//     {
//       id: 4,
//       icon: "/svg_images/undraw_correct-answer_vjt7.svg",
//       title: "Question Bank",
//       description: "500+ tagged questions by topic and difficulty",
//       action: "Login Required",
//       path: "/login",
//       highlight: false,
//       requiresLogin: true,
//     },
//   ],
//   student: [
//     {
//       id: 1,
//       icon: "/svg_images/undraw_correct-answer_vjt7.svg",
//       title: "Question Bank",
//       description: "500+ questions with digital format practice",
//       action: "Start Practice",
//       path: "/question-bank",
//       highlight: true,
//     },
//     {
//       id: 2,
//       icon: "/svg_images/undraw_data-analysis_b7cp.svg",
//       title: "Digital Test Pack",
//       description: "Timed, scored practice tests with analysis",
//       action: "Take a Test",
//       path: "/test-pack",
//       highlight: false,
//     },
//     {
//       id: 3,
//       icon: "/svg_images/undraw_creative-flow_t3kz.svg",
//       title: "Challenge Mode",
//       description: "Gamified practice with streaks and duels",
//       action: "Start Challenge",
//       path: "/challenges",
//       highlight: false,
//     },
//     {
//       id: 4,
//       icon: "/svg_images/undraw_learning_qt7d.svg",
//       title: "Progress Tracker",
//       description: "See your improvement over time",
//       action: "View Stats",
//       path: "/progress",
//       highlight: false,
//     },
//   ],
//   parent: [
//     {
//       id: 1,
//       icon: "/svg_images/undraw_teaching_58yg.svg",
//       title: "Parent Guide",
//       description: "Free SHSAT roadmap with timelines and strategies",
//       action: "Download Guide",
//       path: "/parent-guide",
//       highlight: true,
//     },
//     {
//       id: 2,
//       icon: "/svg_images/undraw_book-writer_ri5u.svg",
//       title: "Workbook",
//       description: "Complete strategy guide with practice questions",
//       action: "Preview Book",
//       path: "/workbook",
//       highlight: false,
//     },
//     {
//       id: 3,
//       icon: "/svg_images/undraw_online-learning_tgmv.svg",
//       title: "Local Resources",
//       description: "Find free prep programs in your borough",
//       action: "Find Resources",
//       path: "/local-resources",
//       highlight: false,
//     },
//     {
//       id: 4,
//       icon: "/svg_images/undraw_teacher_s628.svg",
//       title: "Email Series",
//       description: "Weekly SHSAT updates and deadline reminders",
//       action: "Subscribe",
//       path: "/email-series",
//       highlight: false,
//     },
//   ],
//   educator: [
//     {
//       id: 1,
//       icon: "/svg_images/undraw_professor_xcrw.svg",
//       title: "Institutional License",
//       description: "Complete SHSAT prep program for your school",
//       action: "Apply Now",
//       path: "/institutional-license",
//       highlight: true,
//     },
//     {
//       id: 2,
//       icon: "/svg_images/undraw_data-analysis_b7cp.svg",
//       title: "Class Dashboard",
//       description: "Track student progress and identify gaps",
//       action: "View Demo",
//       path: "/dashboard-demo",
//       highlight: false,
//     },
//     {
//       id: 3,
//       icon: "/svg_images/undraw_teaching_58yg.svg",
//       title: "Instructor Guides",
//       description: "Lesson plans and teaching materials",
//       action: "Preview",
//       path: "/instructor-guides",
//       highlight: false,
//     },
//     {
//       id: 4,
//       icon: "/svg_images/undraw_building-a-website_1wrp.svg",
//       title: "Training Support",
//       description: "Implementation help for your staff",
//       action: "Learn More",
//       path: "/training-support",
//       highlight: false,
//     },
//   ],
//   tutor: [
//     {
//       id: 1,
//       icon: "/svg_images/undraw_building-a-website_1wrp.svg",
//       title: "White Label Access",
//       description: "Use Bell Curves materials under your brand",
//       action: "Apply Now",
//       path: "/white-label",
//       highlight: true,
//     },
//     {
//       id: 2,
//       icon: "/svg_images/undraw_online-learning_tgmv.svg",
//       title: "Co-Branded Site",
//       description: "Custom hosted platform with your branding",
//       action: "See Example",
//       path: "/branded-example",
//       highlight: false,
//     },
//     {
//       id: 3,
//       icon: "/svg_images/undraw_correct-answer_vjt7.svg",
//       title: "Licensed Q-Bank",
//       description: "500+ questions for your students",
//       action: "Preview",
//       path: "/licensed-qbank",
//       highlight: false,
//     },
//     {
//       id: 4,
//       icon: "/svg_images/undraw_creative-flow_t3kz.svg",
//       title: "Affiliate Program",
//       description: "Earn by referring students to Bell Curves",
//       action: "Join Now",
//       path: "/affiliate",
//       highlight: false,
//     },
//   ],
// };

// Get tools for current segment
// const tools = segmentTools[segment] || segmentTools.default;

// Get section title based on segment
// const sectionTitles = {
//   default: "Start with One of Our Most Popular Tools",
//   student: "Tools to Help You Score Higher",
//   parent: "Resources for Supporting Your Child",
//   educator: "Build Your School's SHSAT Program",
//   tutor: "Grow Your Tutoring Business",
// };

// const sectionTitle = sectionTitles[segment] || sectionTitles.default;

// return (
//   <section id="features" className="py-16 bg-white">
//     <div className="container-custom">
//       <h2 className="section-title mb-10">{sectionTitle}</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {tools.map((tool) => (
//           <Link
//             key={tool.id}
//             to={tool.path}
//             className={`card group relative ${
//               tool.highlight ? "border-brand-blue" : ""
//             }`}
//           >
//             {tool.bestseller && (
//               <div className="absolute -top-3 -right-3 bg-brand-yellow text-black px-3 py-1 rounded-full text-sm font-medium flex items-center">
//                 <Star className="w-4 h-4 mr-1" />
//                 Bestseller
//               </div>
//             )}

//             <div className="mb-4 h-32 flex items-center justify-center">
//               <img
//                 src={tool.icon}
//                 alt={tool.title}
//                 className="w-24 h-24 object-contain transition-transform group-hover:scale-110"
//                 onError={handleImageError}
//               />
//             </div>

//             <h3 className="font-bold mb-2">{tool.title}</h3>
//             <p className="text-gray-600 text-sm mb-4">{tool.description}</p>

//             <div
//               className={`inline-flex items-center text-sm font-medium ${
//                 tool.highlight ? "text-brand-blue" : "text-gray-600"
//               }`}
//             >
//               {tool.action}
//               <svg
//                 className="w-4 h-4 ml-1"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <line x1="5" y1="12" x2="19" y2="12"></line>
//                 <polyline points="12 5 19 12 12 19"></polyline>
//               </svg>
//             </div>
//           </Link>
//         ))}
//       </div>

//       <div className="mt-10 text-center">
//         <Link
//           to="/all-tools"
//           className="inline-flex items-center text-brand-blue hover:text-blue-700 font-medium"
//         >
//           See All SHSAT Tools
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
//       </div>
//     </div>
//   </section>
// );
