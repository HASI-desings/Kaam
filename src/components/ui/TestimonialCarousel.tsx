import { useEffect, useState, useRef } from "react";

interface Testimonial {
  stars: number;
  comment: string;
  authorName: string;
}

export default function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      setIndex((i) => (delta < 0 ? (i + 1) % testimonials.length : (i - 1 + testimonials.length) % testimonials.length));
    }
    touchStartX.current = null;
  }

  if (testimonials.length === 0) {
    return (
      <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary text-center py-6">
        No reviews yet — this worker is still building their track record.
      </p>
    );
  }

  return (
    <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div
        className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {testimonials.map((t, i) => (
          <div key={i} className="w-full shrink-0 px-1">
            <div className="rounded-2xl bg-warmth/5 border border-warmth/20 p-5">
              <div className="flex gap-0.5 text-warmth">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg key={n} viewBox="0 0 20 20" fill={n <= t.stars ? "currentColor" : "none"} stroke="currentColor" className="w-4 h-4">
                    <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z" />
                  </svg>
                ))}
              </div>
              <p className="mt-2 text-sm text-text-light dark:text-text-dark leading-relaxed">{t.comment}</p>
              <p className="mt-2 text-xs font-medium text-warmth">{t.authorName}</p>
            </div>
          </div>
        ))}
      </div>
      {testimonials.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-warmth" : "w-1.5 bg-border-light dark:bg-border-dark"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
