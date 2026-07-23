import { useIsMobile } from "@/hooks/use-mobile";
import { Star } from "lucide-react";

const SocialProof = () => {
  const isMobile = useIsMobile();

  const partnerLogos = [
    { id: 1, name: "NYC DOE" },
    { id: 2, name: "Bronx Science" },
    { id: 3, name: "Stuyvesant HS" },
    { id: 4, name: "Brooklyn Tech" },
    { id: 5, name: "Queens HS" },
  ];

  const displayLogos = isMobile ? partnerLogos : partnerLogos;

  // const displayLogos = isMobile ? partnerLogos.slice(0, 3) : partnerLogos;

  return (
    <section className="bg-white py-8 px-4 rounded-lg shadow-sm border border-gray-200 max-w-sm md:max-w-5xl mx-auto p-4 md:p-6 text-center">
      
      <div className="flex justify-center items-center gap-2 mb-3">
        <Star className="text-yellow-500 fill-yellow-500 w-4 h-4 md:w-5 md:h-5" />
        <h2 className="text-sm md:text-lg font-semibold text-gray-800 ">
          Trusted by <span className="font-bold">75,000+ NYC families</span> and{" "}
          <span className="font-bold">30+ schools</span>
        </h2>
      </div>

      
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 opacity-80">
        {displayLogos.map((logo) => (
          <div
            key={logo.id}
            className="text-gray-500 font-medium text-xs md:text-sm"
          >
            {logo.name}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SocialProof;
