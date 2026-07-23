import { Link } from "react-router-dom";
import { useSegment, UserSegment } from "@/lib/segment-context";

const UserTypeSection = () => {
  const { setSegment } = useSegment();

  const userTypes = [
    {
      id: 1,
      icon: "👨‍🎓",  
      title: "I'm a Student",
      path: "/students",
      segment: "student" as UserSegment,
    },
    {
      id: 2,
      icon: "👩‍👦",
      title: "I'm a Parent or Guardian",
      path: "/parents",
      segment: "parent" as UserSegment,
    },
    {
      id: 3,
      icon: "👩‍🏫",
      title: "I'm a School or Educator",
      path: "/educators",
      segment: "educator" as UserSegment,
    },
    {
      id: 4,
      icon: "👨‍🏫",
      title: "I'm a Tutor or Partner",
      path: "/tutors",
      segment: "tutor" as UserSegment,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <h2 className="section-title mb-10">Who are you here for?</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userTypes.map((type) => (
            <Link
              key={type.id}
              to={type.path}
              className="card flex flex-col items-center justify-center p-6 h-full text-center hover:border-brand-blue hover:border transition-all duration-200"
              onClick={() => setSegment(type.segment)}
            >
              <span className="text-4xl mb-4">{type.icon}</span>
              <h3 className="font-medium text-gray-800">{type.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserTypeSection;
