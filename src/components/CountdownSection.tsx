import { useEffect, useState } from "react";

const SHSAT_TEST_DATE = new Date("2025-10-26T00:00:00");

const CountdownSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = SHSAT_TEST_DATE.getTime() - now.getTime();

      if (difference > 0) {
        const weeks = Math.floor(difference / (1000 * 60 * 60 * 24 * 7));
        const days = Math.floor(
          (difference % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24),
        );
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );

        setTimeLeft({ weeks, days, hours, minutes });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every minute
    const timer = setInterval(calculateTimeLeft, 60000);

    // Cleanup
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 bg-brand-blue text-white">
      <div className="container-custom text-center">
        <h2 className="text-3xl font-bold mb-4">
          {timeLeft.weeks} Weeks to Prepare - You've Got This!
        </h2>
        <p className="text-xl mb-6">SHSAT Test Day: October 26, 2025</p>
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{timeLeft.weeks}</div>
            <div className="text-sm">Weeks</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{timeLeft.days}</div>
            <div className="text-sm">Days</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{timeLeft.hours}</div>
            <div className="text-sm">Hours</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">{timeLeft.minutes}</div>
            <div className="text-sm">Minutes</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountdownSection;
