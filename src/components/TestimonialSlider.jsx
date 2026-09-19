import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    schoolName: "Mwandet Secondary School",
    logo: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80",
    message: "E-Taaluma has helped us streamline academic report publishing each term without errors. The system is remarkably fast!",
    location: "Arusha, Tanzania"
  },
  {
    id: 2,
    schoolName: "Mpwayungu Secondary School",
    logo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80",
    message: "E-Taaluma has improved our academic reporting process significantly. It's both accurate and efficient.",
    location: "Dodoma, Tanzania"
  },
  {
    id: 3,
    schoolName: "St. Joseph Secondary School",
    logo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
    message: "The interface is very easy to use, allowing fast entry for Mid-Term and Terminal examination results.",
    location: "Tanzania"
  }
];

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 max-w-3xl mx-auto my-10 text-center relative overflow-hidden">
      <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2">School Testimonials</div>
      <h3 className="text-xl font-bold text-slate-800 mb-6">What Partner Schools Say About Us</h3>

      <div className="flex flex-col items-center gap-4 transition-all duration-500">
        <img 
          src={current.logo} 
          alt={current.schoolName} 
          className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-md"
        />
        <p className="text-slate-600 italic text-base max-w-xl">"{current.message}"</p>
        <div>
          <h4 className="font-bold text-slate-800">{current.schoolName}</h4>
          <span className="text-xs text-slate-400">{current.location}</span>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-emerald-600' : 'w-2.5 bg-slate-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;
