import { useState, useEffect, useRef } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
  isVisible: boolean;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick, index, isVisible }) => {
  return (
    <div 
      className={`border-b border-gray-200 py-4 transform transition-all duration-700 hover:bg-white/30 rounded-lg ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
      style={{ transitionDelay: `${0.3 + index * 0.1}s` }}
    >
      <button
        className="flex justify-between items-center w-full text-left focus:outline-none group"
        onClick={onClick}
      >
        <h3 className="font-medium text-gray-900 pr-4 group-hover:text-[#377e9a] transition-colors duration-300">
          {question}
        </h3>
        <span className="ml-6 flex-shrink-0">
          <div className={`transform transition-all duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} group-hover:scale-110`}>
            {isOpen ? (
              <svg className="h-5 w-5 text-brand-blue transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-brand-blue transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            )}
          </div>
        </span>
      </button>

      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`mt-2 pr-12 transform transition-all duration-300 ${isOpen ? 'translate-y-0' : '-translate-y-2'}`}>
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  const faqs = [
    {
      id: 1,
      question: "How is the SHSAT workbook delivered?",
      answer: "The SHSAT workbook is delivered instantly via email as a secured PDF after purchase. You'll also get access to our digital portal where you can access the workbook and supplemental materials online.",
    },
    {
      id: 2,
      question: "Is this aligned with the 2025 digital SHSAT?",
      answer: "Yes! Our workbook is fully updated for the digital SHSAT format. We've analyzed the DOE's digital sample materials and created content that mimics the new testing experience, including digital-specific strategies.",
    },
    {
      id: 3,
      question: "Can I get a refund if I'm not satisfied?",
      answer: "We offer a 14-day money-back guarantee. If you're not satisfied with the workbook, simply email us within 14 days of purchase for a full refund, no questions asked.",
    },
    {
      id: 4,
      question: "What's included in the workbook?",
      answer: "The workbook includes 250+ pages of content with section-by-section strategies, targeted practice questions, complete practice tests, detailed explanations, and a personalized study plan framework.",
    },
  ];

  return (
    <section ref={sectionRef} id="faq" className="py-16 bg-gray-100 scroll-mt-24">

      <div className="container-custom px-4 max-w-3xl mx-auto">
        <h2 className={`section-title text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}>
          Frequently Asked <span className="text-[#377e9a] relative">
            Questions
            <span className={`absolute bottom-0 left-0 h-1 bg-[#377e9a] transition-all duration-1000 ${
              isVisible ? 'w-full delay-700' : 'w-0'
            }`}></span>
          </span>
        </h2>

        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`} style={{ transitionDelay: '0.2s' }}>
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;