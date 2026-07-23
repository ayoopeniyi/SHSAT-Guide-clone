const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      quote:
        "The SHSAT workbook gave my daughter clarity and structure. She got into Stuyvesant thanks to the focused practice!",
      name: "Sarah M.",
      role: "Parent of Stuyvesant Student",
    },
    {
      id: 2,
      quote:
        "I was overwhelmed by the SHSAT changes, but the workbook broke everything down. My son improved 130 points from his diagnostic!",
      name: "Michael T.",
      role: "Parent of Bronx Science Student",
    },
    {
      id: 3,
      quote:
        "As an educator, I've tried many SHSAT materials. Bell Curves' workbook is by far the most comprehensive and well-aligned to the exam.",
      name: "Lisa C.",
      role: "Middle School Teacher",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <h2 className="section-title">What Our Families Say</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="card">
              <svg
                className="w-10 h-10 text-brand-blue opacity-20 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              <p className="text-gray-700 mb-6">"{testimonial.quote}"</p>

              <div className="flex items-center mt-auto">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-medium">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
