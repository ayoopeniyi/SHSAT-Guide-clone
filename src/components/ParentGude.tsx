import background from "./images/parent-guide-bg.png"
import parent from "./images/praentguide.png"
import icon1 from "./images/parent-i.png"
import icon2 from "./images/parent-2.png"
import icon3 from "./images/parent-3.png"
import icon4 from "./images/parent-4.png"
import { useState, useEffect, useRef } from "react"
import ParentguidePdf from "./ParentguidePdf"

const ParentGuide = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [activeIcon, setActiveIcon] = useState<number | null>(null);
    const sectionRef = useRef<HTMLElement>(null);

    const openModal = (): void => setIsModalOpen(true);
    const closeModal = (): void => setIsModalOpen(false);

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
        { icon: icon1, title: "Exclusive preview", description: "of digital SHSAT question types: drag-and-drop, grid-in, multi-select, and more" },
        { icon: icon2, title: "Practical tips", description: "for parents and students navigating the digital exam" },
        { icon: icon3, title: "Links to official", description: "and hard-to-find DOE resources for further support" },
        { icon: icon4, title: "Honest answers", description: "to the most common NYC parent questions" },
    ];

    return (
        <section 
            ref={sectionRef}
            className='relative py-16 px-4 md:px-8 overflow-hidden'
        >

            {/* Background */}
            <img 
                src={background} 
                alt="" 
                className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                }`}
            />
            
            <div className='relative z-10 max-w-7xl mx-auto'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                    
                    {/* Image Section */}
                    <div className={`relative flex justify-center order-2 lg:order-1 transform transition-all duration-1000 ${
                        isVisible ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-10 opacity-0 scale-95'
                    }`} style={{ transitionDelay: '0.2s' }}>
                        <div className='relative'>
                            <img 
                                src={parent} 
                                alt="Family learning with Parent Guide" 
                                className='w-full max-w-md h-auto object-contain drop-shadow-2xl' 
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className={`space-y-8 order-1 lg:order-2 transform transition-all duration-1000 ${
                        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                    }`} style={{ transitionDelay: '0.1s' }}>
                        
                        {/* Title */}
                        <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 text-center lg:text-left transform transition-all duration-800 ${
                            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                        }`} style={{ transitionDelay: '0.3s' }}>
                            What's Inside The Parent Guide?
                        </h2>
                        
                        {/* Features Grid */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className={`text-center space-y-3 transform transition-all duration-800 hover:scale-105 hover:shadow-lg rounded-lg p-4 cursor-pointer ${
                                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}
                                    style={{ transitionDelay: `${0.4 + index * 0.1}s` }}
                                    onClick={() => setActiveIcon(activeIcon === index ? null : index)}
                                >
                                    <div className={`w-16 h-16 bg-[#377e9a] rounded-lg flex items-center justify-center mx-auto transition-transform duration-500 ${
                                        activeIcon === index ? "animate-wiggle" : ""
                                    }`}>
                                        <img 
                                            src={feature.icon} 
                                            alt={feature.title} 
                                            className="w-8 h-8" 
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 transition-colors duration-300 hover:text-[#377e9a]">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <div className={`text-center lg:text-left pt-4 transform transition-all duration-800 ${
                            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                        }`} style={{ transitionDelay: '0.8s' }}>
                            <button 
                                onClick={openModal} 
                                className="group relative bg-[#377e9a] hover:bg-[#2db9f0] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 overflow-hidden"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Email Parent Guide
                                    <svg 
                                        className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2 2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                       
                    </div>
                </div>
            </div>
             <ParentguidePdf isOpen={isModalOpen} onClose={closeModal} />

            {/* Custom CSS */}
            <style>{`
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-10deg); }
                    75% { transform: rotate(10deg); }
                }
                .animate-wiggle {
                    animation: wiggle 0.5s ease-in-out;
                }
            `}</style>
        </section>
    )
}

export default ParentGuide