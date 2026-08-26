import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import explore1 from "./images/explore-1.png";
import explore2 from "./images/explore-2.png";
import explore3 from "./images/explore-3.png";
import explore4 from "./images/explore-4.png";
import explore5 from "./images/explore-5.png";
import ServiceSectionBtns from "./ServiceSectionBtns";

interface ProductCardProps {
	badge: string;
	title: string;
	description: string;
	image: string;
	imageAlt: string;
	ctaLabel: string;
	onCtaClick: () => void;
	ariaLabel: string;
}

const ProductCard = ({
	badge,
	title,
	description,
	image,
	imageAlt,
	ctaLabel,
	onCtaClick,
	ariaLabel,
}: ProductCardProps) => (
	<article
		className="bg-white border border-neutral-light rounded-md p-8 flex flex-col justify-between min-h-[400px]"
		role="listitem"
		itemProp="itemListElement"
		itemScope
		itemType="https://schema.org/ListItem"
	>
		<div className="text-center flex-grow flex flex-col justify-between">
			<div>
				<h3 className="text-lg font-bold text-deep-navy mb-4 leading-tight" itemProp="name">
					{title}
				</h3>
				<p className="text-sm text-neutral-slate leading-relaxed mb-6" itemProp="description">
					{description}
				</p>
			</div>

			<figure className="relative w-32 h-32 mx-auto mb-6">
				<img
					src={image}
					alt={imageAlt}
					className="relative z-10 w-full h-full object-contain p-3"
					loading="lazy"
					width="128"
					height="128"
					itemProp="image"
				/>
			</figure>

			<div className="text-center mb-6">
				<span className="inline-block bg-clarity-off-white text-bc-blue text-xs font-semibold px-4 py-2 rounded-sm border border-neutral-light">
					{badge}
				</span>
			</div>

			<button
				className="mt-auto bg-white text-bc-blue font-semibold py-3 px-6 rounded-sm border border-bc-blue hover:bg-bc-blue hover:text-white transition-colors duration-150 text-sm active:scale-[0.97]"
				onClick={onCtaClick}
				aria-label={ariaLabel}
			>
				{ctaLabel}
			</button>
		</div>
	</article>
);

const ServicesSection = () => {
	const navigate = useNavigate();
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedTool, setSelectedTool] = useState<string | null>(null);

	const availableTools = [
		{ id: "ai-toolkit", name: "AI Test Prep Toolkit" },
		{ id: "digital-course", name: "SHSAT Digital Course" },
	];

	const handleWaitlistClick = (toolName: string) => {
		setSelectedTool(toolName);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
	};

	return (
		<section
			id="resources"
			className="max-w-screen-xl mx-auto px-4 py-8 scroll-mt-24"
			aria-labelledby="services-heading"
			role="region"
		>
			<header className="text-center mb-12">
				<h2 id="services-heading" className="text-2xl md:text-3xl font-bold" itemProp="name">
					Explore Our Most Popular{" "}
					<span className="text-bc-blue">SHSAT Prep Tools & Resources</span>
				</h2>
				<p className="sr-only">
					Comprehensive SHSAT test preparation products including digital practice tests, question
					banks, AI tools, and courses for NYC specialized high schools admission
				</p>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
				<ProductCard
					badge="Available Now"
					title="Digital SHSAT Test Pack"
					description="New question types, fully updated for the digital format, 5 full-length practice tests with scoring and review."
					image={explore1}
					imageAlt="Digital SHSAT Test Pack with 5 full-length practice tests for the computer-based exam"
					ctaLabel="Shop Test Packs"
					ariaLabel="Shop the Digital SHSAT Test Pack"
					onCtaClick={() => navigate("/test-packs")}
				/>

				<ProductCard
					badge="Available Now"
					title="SHSAT Question Bank"
					description="Over 1,500 questions, timed or topic-and-difficulty mode, built for targeted score improvement."
					image={explore2}
					imageAlt="SHSAT Question Bank with 1,500+ practice questions and timed test mode"
					ctaLabel="Explore Question Bank"
					ariaLabel="Explore the SHSAT Question Bank"
					onCtaClick={() => navigate("/question-bank")}
				/>

				<ProductCard
					badge="Early Access"
					title="AI Test Prep Toolkit"
					description="AI strategies for students, prompt templates, and guidance on when to use free versus paid AI tools for SHSAT prep."
					image={explore3}
					imageAlt="AI Test Prep Toolkit with SHSAT strategies and prompt templates"
					ctaLabel="Join Early Access"
					ariaLabel="Join early access for the AI Test Prep Toolkit"
					onCtaClick={() => handleWaitlistClick("AI Test Prep Toolkit")}
				/>

				<ProductCard
					badge="Coming Soon"
					title="SHSAT Digital Course"
					description="Self-paced lessons, quizzes, and instructor support, built to complement the Test Packs and Question Bank."
					image={explore5}
					imageAlt="SHSAT Digital Course with self-paced lessons and instructor support"
					ctaLabel="Get Notified"
					ariaLabel="Get notified when the SHSAT Digital Course launches"
					onCtaClick={() => handleWaitlistClick("SHSAT Digital Course")}
				/>
			</div>

			{/*
				Print Workbook: this card previously had a "Buy Now" button with no onClick handler at all,
				meaning it did nothing when clicked. Routed here to the main Bell Curves site as a placeholder;
				confirm the real live purchase URL for the print workbook before shipping.
			*/}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6" role="list">
				<article className="bg-white border border-neutral-light rounded-md p-8 flex flex-col md:flex-row items-center gap-6">
					<figure className="relative w-32 h-32 flex-shrink-0">
						<img
							src={explore4}
							alt="SHSAT Print Workbook with 450+ pages of test preparation"
							className="w-full h-full object-contain p-3"
							loading="lazy"
							width="128"
							height="128"
						/>
					</figure>

					<div className="flex-1 text-center md:text-left">
						<h3 className="text-lg font-bold text-deep-navy mb-3 leading-tight">
							Print Workbook
						</h3>
						<p className="text-sm text-neutral-slate leading-relaxed mb-4">
							450+ pages of strategies and practice, aligned to the current SHSAT format.
						</p>
						<button
							className="bg-white text-challenger-orange font-semibold py-3 px-6 rounded-sm border border-challenger-orange hover:bg-challenger-orange hover:text-white transition-colors duration-150 text-sm active:scale-[0.97]"
							aria-label="Buy the SHSAT Print Workbook"
							onClick={() => window.open("https://www.bellcurves.com", "_blank", "noopener")}
						>
							Buy Now
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
		</section>
	);
};

export default ServicesSection;
