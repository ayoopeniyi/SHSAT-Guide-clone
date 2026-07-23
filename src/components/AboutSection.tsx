import about from "./images/about.png";
import icon1 from "./images/about-1.png";
import icon2 from "./images/about-2.png";
import icon3 from "./images/about-3.png";
import icon4 from "./images/about-4.png";
import icon5 from "./images/about-5.png";
import icon6 from "./images/about-6.png";
import { useState, useEffect, useRef } from "react";

const AboutSection = () => {
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const sectionRef = useRef<HTMLDivElement>(null);

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
		{ id: 1, icon: icon1, title: "20+ years helping students", desc: "excel on the SHSAT, SAT, ACT, SSAT, and more" },
		{ id: 2, icon: icon2, title: "Over 75,000 students served", desc: "nationwide" },
		{ id: 3, icon: icon3, title: "Proven strategies", desc: "average 15-point raw score improvement on the SHSAT over 16 years" },
		{ id: 4, icon: icon4, title: "Trusted by", desc: "three generations of test takers" },
		{ id: 5, icon: icon5, title: "First fully online", desc: "updated practice test for the new digital SHSAT" },
		{ id: 6, icon: icon6, title: "Updated materials", desc: "for DOE changes and latest digital test formats" },
	];

	return (
		<section
			ref={sectionRef}
			id="about"
			aria-labelledby="about-heading"
			className={`rounded-lg p-8 bg-gray-100 max-w-7xl mx-auto scroll-mt-24 transform transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
		>


			<div className="flex flex-col md:flex-row items-start justify-between gap-8">
				{/* Left Column */}
				<div className={`flex-1 transform transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`} style={{ transitionDelay: "0.2s" }}>
					<header className={`transform transition-all duration-800 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`} style={{ transitionDelay: "0.3s" }}>
						<h2 id="about-heading" className="text-3xl font-bold text-gray-800 mb-2">
							Why Trust <span className="text-[#377e9a] relative">SHSATGuide.com?<span className={`absolute bottom-0 left-0 h-1 bg-[#377e9a] transition-all duration-1000 ${isVisible ? "w-full delay-700" : "w-0"}`}></span></span>
						</h2>
						<p className="text-gray-600 mb-8">
							Powered by the experienced test prep experts at Bell Curves.
						</p>
					</header>

					<ul className="space-y-6" role="list">
						{features.map((item, index) => (
							<li
								key={item.id}
								className={`flex items-start space-x-4 transform transition-all duration-800 hover:translate-x-2 hover:shadow-lg rounded-lg p-3 hover:bg-white/60 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
								style={{ transitionDelay: `${0.4 + index * 0.1}s` }}
							>
								<div className="relative group">
									<img
										src={item.icon}
										alt={`Icon for ${item.title}`}
										className="w-10 h-10 object-contain flex-shrink-0 bg-[#377e9a] rounded-full p-2 transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110"
										loading="lazy"
										width="40"
										height="40"
									/>
									<div className={`absolute inset-0 bg-[#377e9a] rounded-full animate-ping opacity-20 transition-opacity duration-1000 ${isVisible ? "opacity-20" : "opacity-0"}`} style={{ animationDelay: `${1 + index * 0.2}s` }}></div>
								</div>
								<div className="flex-1">
									<h3 className="font-semibold text-gray-800 mb-1 transition-colors duration-300 group-hover:text-[#377e9a]" itemProp="name">
										{item.title}
									</h3>
									<p className="text-gray-600 text-sm leading-relaxed" itemProp="description">
										{item.desc}
									</p>
								</div>
							</li>
						))}
					</ul>

				</div>

				{/* Right Column */}
				<figure className={`flex-1 transform transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-10 opacity-0 scale-95"}`} style={{ transitionDelay: "0.5s" }}>
					<img
						src={about}
						alt="SHSAT test preparation and tutoring services by Bell Curves"
						className="w-full h-auto object-contain mx-auto drop-shadow-lg"
						loading="lazy"
						width="600"
						height="400"
					/>
					<figcaption className="sr-only">
						SHSATGuide.com professional test preparation services
					</figcaption>
				</figure>
			</div>
		</section>
	);
};

export default AboutSection;


// const stats = [
//   {
//     id: 1,
//     value: "75k+",
//     label: "Students",
//   },
//   {
//     id: 2,
//     value: "30+",
//     label: "Partners",
//   },
//   {
//     id: 3,
//     value: "20+",
//     label: "Years Experience",
//   },
// ];



// return (
//   <section id="why-bell-curves" className="py-16 bg-gray-50">
//     <div className="container-custom">
//       <div className="grid md:grid-cols-2 gap-12 items-center">
//         <div>
//           <h2 className="text-3xl font-bold mb-6">Why Bell Curves?</h2>

//           <ul className="space-y-4">
//             <li className="flex items-start">
//               <svg
//                 className="w-6 h-6 text-green-500 mr-2 flex-shrink-0"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//                 <polyline points="22 4 12 14.01 9 11.01"></polyline>
//               </svg>
//               <div>
//                 <span className="font-medium block">
//                   Trusted by over 75,000 NYC students and families
//                 </span>
//               </div>
//             </li>
//             <li className="flex items-start">
//               <svg
//                 className="w-6 h-6 text-green-500 mr-2 flex-shrink-0"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//                 <polyline points="22 4 12 14.01 9 11.01"></polyline>
//               </svg>
//               <div>
//                 <span className="font-medium block">
//                   Used by 30+ schools and educational nonprofits
//                 </span>
//               </div>
//             </li>
//             <li className="flex items-start">
//               <svg
//                 className="w-6 h-6 text-green-500 mr-2 flex-shrink-0"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//                 <polyline points="22 4 12 14.01 9 11.01"></polyline>
//               </svg>
//               <div>
//                 <span className="font-medium block">
//                   Aligned to the 2025 Digital SHSAT
//                 </span>
//               </div>
//             </li>
//             <li className="flex items-start">
//               <svg
//                 className="w-6 h-6 text-green-500 mr-2 flex-shrink-0"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//                 <polyline points="22 4 12 14.01 9 11.01"></polyline>
//               </svg>
//               <div>
//                 <span className="font-medium block">
//                   Designed by real educators, not AI-generated questions
//                 </span>
//               </div>
//             </li>
//             <li className="flex items-start">
//               <svg
//                 className="w-6 h-6 text-green-500 mr-2 flex-shrink-0"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//                 <polyline points="22 4 12 14.01 9 11.01"></polyline>
//               </svg>
//               <div>
//                 <span className="font-medium block">
//                   20+ years supporting NYC's best-testers
//                 </span>
//               </div>
//             </li>
//           </ul>
//         </div>

//         <div className="grid grid-cols-3 gap-4">
//           {stats.map((stat) => (
//             <div
//               key={stat.id}
//               className="card flex flex-col items-center justify-center py-8"
//             >
//               <div className="text-3xl font-bold text-brand-blue mb-1">
//                 {stat.value}
//               </div>
//               <div className="text-gray-600">{stat.label}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   </section>
// );