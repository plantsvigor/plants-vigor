import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import { Button } from "./ui/button";

interface Reel {
  _id: string;
  videoUrl: string;
  instagramId: string;
  avatarUrl: string;
  profileUrl: string;
}

export default function DeliveredWithCare() {
  const [reels, setReels] = useState<Reel[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reels`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setReels(data);
        setError(false);
      } catch (error) {
        console.error("Error fetching reels:", error);
        setReels([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handlePlay = (id: string) => {
    setPlayingId(id);
    const videoElements = document.querySelectorAll("video.reel-video");
    videoElements.forEach((video: any) => {
      if (video.id !== `video-${id}`) {
        video.pause();
      }
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            // Find which video is most "centered" or just play the first one that intersects
            // For simplicity, we'll just play the one that entered the view
            // and the handlePlay logic will pause others.
            video.play().catch(() => {}); // Play might fail if not interacted with
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 } // Trigger when 70% of the video is visible
    );

    const videoElements = document.querySelectorAll("video.reel-video");
    videoElements.forEach((video) => observer.observe(video));

    return () => {
      videoElements.forEach((video) => observer.unobserve(video));
    };
  }, [reels]);

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between mb-12 animate-fade-up">
          <div>
            <span className="text-primary font-semibold tracking-[0.3em] uppercase text-xs">Our Community</span>
            <h2 className="font-display text-4xl md:text-5xl mt-2">Delivered with care</h2>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full shadow-soft hover:shadow-glow transition-all"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full shadow-soft hover:shadow-glow transition-all"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 md:gap-6 pb-8 scrollbar-hide snap-x snap-mandatory scroll-smooth min-h-[300px]"
        >
          {loading ? (
            <div className="flex w-full items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : reels.map((reel) => (
            <div 
              key={reel._id} 
              className="flex-none w-[calc(50%-8px)] md:w-[calc(20%-19.2px)] snap-start group animate-fade-up"
            >
              <div className="relative aspect-[9/16] rounded-[2rem] overflow-hidden shadow-card group-hover:shadow-glow transition-all duration-500 bg-secondary/20">
                <video 
                  id={`video-${reel._id}`}
                  className="reel-video absolute inset-0 w-full h-full object-cover"
                  src={reel.videoUrl}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onPlay={() => handlePlay(reel._id)}
                  onClick={(e) => {
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
              
              <div className="mt-4 flex flex-col items-center text-center space-y-3">
                <div className="flex items-center gap-2">
                  <img 
                    src={reel.avatarUrl} 
                    alt={reel.instagramId} 
                    className="h-8 w-8 rounded-full border-2 border-primary/20"
                  />
                  <span className="text-sm font-semibold text-primary truncate max-w-[120px]">@{reel.instagramId}</span>
                </div>
                <Button 
                  asChild
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-[10px] uppercase tracking-wider font-bold h-8 px-4 hover:bg-primary hover:text-white transition-all"
                >
                  <a href={reel.profileUrl} target="_blank" rel="noopener noreferrer">
                    View Profile
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
