'use client';

import { useEffect, useState } from 'react';

const testimonials = [
  {
    quote: "Cognihire transformed our recruitment process. The cognitive assessments provide deeper insights than traditional interviews alone.",
    author: "Sarah Johnson",
    role: "HR Director, TechCorp",
    avatar: "SJ",
    gradient: "from-blue-500 to-purple-500"
  },
  {
    quote: "The analytics dashboard is incredible. We can now identify top performers and predict job success with unprecedented accuracy.",
    author: "Michael Rodriguez",
    role: "CEO, InnovateLabs",
    avatar: "MR",
    gradient: "from-green-500 to-teal-500"
  },
  {
    quote: "Security and compliance were our top concerns. Cognihire exceeded our expectations with enterprise-grade protection and detailed audit trails.",
    author: "Amanda Liu",
    role: "CTO, SecureTech",
    avatar: "AL",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    quote: "The cognitive games are engaging and scientifically validated. Our candidates actually enjoy taking the assessments.",
    author: "David Chen",
    role: "VP of Talent, FutureWorks",
    avatar: "DC",
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    quote: "Implementation was seamless and the support team is exceptional. We've seen a 40% improvement in hiring quality.",
    author: "Rachel Thompson",
    role: "Head of HR, GlobalTech",
    avatar: "RT",
    gradient: "from-orange-500 to-red-500"
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToTestimonial = (index: number) => {
    if (index !== currentIndex) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            See what organizations say about Cognihire
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main testimonial display */}
          <div className="relative overflow-hidden">
            <div
              className={`transition-all duration-500 ease-in-out transform ${
                isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="bg-slate-800/50 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-600 shadow-2xl">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl text-slate-200 mb-8 italic leading-relaxed">
                  "{testimonials[currentIndex].quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${testimonials[currentIndex].gradient} rounded-full flex items-center justify-center text-white font-bold text-xl mr-6 shadow-lg`}>
                    {testimonials[currentIndex].avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-lg">{testimonials[currentIndex].author}</div>
                    <div className="text-slate-400">{testimonials[currentIndex].role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-blue-500 scale-125 shadow-lg shadow-blue-500/50'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Floating animation elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce opacity-25"></div>
        </div>
      </div>
    </section>
  );
}