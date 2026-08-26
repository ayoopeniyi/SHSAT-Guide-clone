import React, { useEffect } from "react";
import { CheckCircleIcon, ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const PartnerShipPage: React.FC = () => {
  const navigate = useNavigate();


  const benefits = [
    "White-Label Materials: Workbook, Test Pack, Question Bank, and Digital Course branded with your logo and colors.",
    "Digital Hosting & LMS: We handle hosting, delivery, and updates. You focus on instruction.",
    "Co-Branding Options: “Powered by Bell Curves” credibility while keeping your identity front and center.",
    "Flexible Licensing: Options for single-school, multi-site, or city-wide use.",
    "Analytics & Reporting: Track student progress with dashboards and exportable reports.",
  ];

  return (
    <section className="bg-bc-blue min-h-screen flex items-center justify-center text-white py-16 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer hover:text-warm-gold transition-colors duration-150 mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftCircle className="w-6 h-6" aria-hidden="true" />
          <span>Back</span>
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
          Power Your SHSAT Program with Bell Curves Expertise
        </h1>

        <p className="text-lg max-w-3xl mx-auto mb-10">
          Whether you're a school, community organization, or private tutoring
          company, you can bring fully updated, digital-ready SHSAT prep to your
          students, under your own brand. Bell Curves provides the content,
          technology, and support; you provide the connection to your learners.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 text-left max-w-4xl mx-auto mb-10">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-warm-gold flex-shrink-0" />
              <p className="text-base">{benefit}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to={"/partnership-call"}>
            <button className="bg-warm-gold text-deep-navy px-4 py-2 rounded-sm transition-opacity duration-150 hover:opacity-90 active:scale-[0.97]">
              Schedule a Call
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PartnerShipPage;