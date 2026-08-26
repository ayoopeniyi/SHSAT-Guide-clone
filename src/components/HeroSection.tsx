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
			className="relative bg-clarity-off-white py-12 px-4 md:px-16 overflow-hidden scroll-mt-24"
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
						<span className="text-bc-blue relative inline-block">
							First-Ever Digital SHSAT
							<span
								className={`absolute bottom-0 left-0 h-1 bg-bc-blue transition-all duration-1000 delay-700 ${
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
							className="mt-6 px-8 py-4 bg-bc-blue text-white rounded-md font-semibold transition-colors duration-150 hover:bg-deep-navy active:scale-[0.97]"
							aria-label="Download Free Digital SHSAT Parent Guide"
						>
							Email Parent Guide
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

