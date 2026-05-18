import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, ShieldCheck, Truck, Sprout, ChevronRight, MoveRight } from "lucide-react";
import hero from "@/assets/hero-plants.jpg";
import { Button } from "@/components/ui/button";
import { categories, products } from "@/data/catalog";
import ProductCard from "@/components/ProductCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import DeliveredWithCare from "@/components/DeliveredWithCare";

import { useProducts } from "@/hooks/useProducts";

export default function Home() {
  const { products, loading } = useProducts();
  const featured = (products || []).filter(p => p.featured).slice(0, 5);
  const bestsellers = (products || []).filter(p => p.bestSeller).slice(0, 5);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroImages = [
    hero,
    "/hero_plants_2.png",
    "/hero_plants_3.png"
  ];

  const extendedHeroImages = [...heroImages, heroImages[0]];
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const words = ["home.", "office.", "bedroom.", "balcony.", "garden."];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setHeroIndex((prev) => {
        const next = prev + 1;
        if (next === extendedHeroImages.length) {
          return prev;
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [extendedHeroImages.length]);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const typingSpeed = isDeleting ? 50 : 150;
    const delay = isDeleting ? 50 : (displayedText === currentWord ? 2000 : typingSpeed);

    const timer = setTimeout(() => {
      if (!isDeleting && displayedText !== currentWord) {
        setDisplayedText(currentWord.substring(0, displayedText.length + 1));
      } else if (isDeleting && displayedText !== "") {
        setDisplayedText(currentWord.substring(0, displayedText.length - 1));
      } else if (displayedText === currentWord) {
        setIsDeleting(true);
      } else if (displayedText === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, wordIndex]);

  // Jump back logic
  useEffect(() => {
    if (heroIndex === extendedHeroImages.length - 1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setHeroIndex(0);
      }, 1000); // Wait for transition to complete
      return () => clearTimeout(timer);
    }
  }, [heroIndex, extendedHeroImages.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden h-[600px] md:h-[700px]">
        <div
          className="absolute inset-0 flex"
          style={{
            transform: `translateX(-${heroIndex * 100}%)`,
            transition: isTransitioning ? "transform 1000ms ease-in-out" : "none"
          }}
        >
          {extendedHeroImages.map((src, i) => (
            <div key={i} className="relative flex-none w-full h-full">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
            </div>
          ))}
        </div>
        <div className="container relative z-10 grid gap-6 py-20 md:py-32 max-w-3xl h-full flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-background/80 backdrop-blur px-3 py-1.5 text-xs font-medium text-primary shadow-soft animate-fade-up">
            <Sprout className="h-3.5 w-3.5" /> Fresh from our nursery
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] text-balance animate-fade-up" style={{ animationDelay: "60ms" }}>
            Bring nature <em className="italic text-primary inline-block min-w-[180px] md:min-w-[300px] text-left transition-all duration-500 transform overflow-hidden relative">
              {displayedText}
              <span className="inline-block w-[3px] h-[0.8em] bg-primary animate-pulse ml-1 align-middle" />
            </em>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl animate-fade-up" style={{ animationDelay: "120ms" }}>
            A curated collection of indoor jungles, sun-loving outdoor stunners, succulents, planters and everything you need to keep them thriving.
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "180ms" }}>
            <Button asChild size="lg" className="rounded-full">
              <Link to="/category/plants">Shop the collection <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/category/indoor-plants">Explore Indoor Plants</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 py-6 text-sm">
          {[
            { icon: Truck, t: "Free Delivery", s: "On orders above ₹549" },
            { icon: ShieldCheck, t: "7-Day Replacement", s: "If unboxing video sent" },
            { icon: Leaf, t: "Nursery Fresh", s: "Hand-picked & packed" },
            { icon: Sprout, t: "Plant Doctor", s: "Free care advice" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-background text-primary"><f.icon className="h-5 w-5" /></span>
              <div>
                <div className="font-semibold">{f.t}</div>
                <div className="text-xs text-muted-foreground">{f.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container py-16 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Browse</p>
            <h2 className="font-display text-3xl md:text-4xl">Shop by Category</h2>
          </div>
          <div className="flex items-center text-muted-foreground/60" aria-hidden="true">
            <MoveRight className="h-5 w-5" />
          </div>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-6 sm:gap-10 scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {categories
            .filter(c => [
              "plants", "indoor-plants", "outdoor-plants", "seeds",
              "pots-planters", "accessories", "gifts", "bulk-order"
            ].includes(c.slug))
            .map((c, i) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                className="group flex flex-col items-center text-center animate-fade-up min-w-[85px] sm:min-w-[150px] snap-center"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="relative grid place-items-center aspect-square w-full rounded-full bg-secondary/20 overflow-hidden shadow-soft border border-primary/20 p-0 transition-smooth">
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover rounded-full" />
                </div>
                <h3 className="mt-3 text-[10px] sm:text-sm font-semibold leading-tight whitespace-nowrap">{c.name}</h3>
              </Link>
            ))
          }
        </div>
      </section>

      {/* FEATURED */}
      <section className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Curated picks</p>
            <h2 className="font-display text-3xl md:text-4xl">Featured Plants</h2>
          </div>
          <Link to="/category/plants" className="text-sm font-medium text-primary hover:underline hidden sm:inline">View all →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] rounded-3xl bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* OFFERS */}
      <section className="container py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-leaf p-10 md:p-14 text-primary-foreground shadow-card">
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">Limited offer</p>
            <h3 className="mt-2 font-display text-3xl md:text-5xl leading-tight">10% off your first order</h3>
            <p className="mt-3 opacity-90 max-w-md">Use code <strong className="font-bold">NEW01</strong> at checkout.</p>
            <Button asChild variant="secondary" className="mt-6 rounded-full"><Link to="/category/plants">Shop now</Link></Button>
            <div className="absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-accent p-10 md:p-14 text-accent-foreground shadow-card">
            <p className="text-xs uppercase tracking-[0.2em] opacity-70">Combo deal</p>
            <h3 className="mt-2 font-display text-3xl md:text-5xl leading-tight">Plant + Pot bundles from ₹699</h3>
            <p className="mt-3 opacity-80 max-w-md">Beautifully matched, ready to gift.</p>
            <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"><Link to="/category/pots-planters">Explore bundles</Link></Button>
            <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Customer favourites</p>
            <h2 className="font-display text-3xl md:text-4xl">Best Sellers</h2>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] rounded-3xl bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {bestsellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>



      {/* PLANT CARE TIPS */}
      <section className="bg-secondary/20 py-20 md:py-32 overflow-hidden border-t border-border">
        <div className="container px-2 sm:px-6 md:px-12">
          {/* Centered Header */}
          <div className="text-center mb-16 md:mb-24 space-y-4 animate-fade-up">
            <span className="text-primary font-semibold tracking-[0.3em] uppercase text-xs">Care & Nurture</span>
            <h2 className="font-display text-4xl md:text-7xl leading-tight">🌿 Plant Care Tips</h2>
            <div className="h-1 w-20 bg-accent mx-auto rounded-full" />
          </div>

          <div className="grid lg:grid-cols-[0.8fr,1.2fr] gap-12 lg:gap-20 items-center">
            {/* Left: Image */}
            <div className="relative group animate-fade-up">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] shadow-card transition-smooth group-hover:shadow-glow">
                <img
                  src="/C:/Users/amitk/.gemini/antigravity/brain/b87fd7eb-04a5-4dce-bf1e-bfeb839ead58/plant_care_nurture_1778007107023.png"
                  alt="Nurturing plants"
                  className="h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[3rem]" />
              </div>
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-primary/5 blur-3xl -z-10" />
            </div>

            {/* Right: Content - Compacted to match image height */}
            <div className="space-y-8 md:space-y-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <div className="grid gap-6 md:gap-8">
                <div className="space-y-2 border-l-2 border-primary/10 pl-8 py-1">
                  <h3 className="font-display text-2xl text-primary/90">Unbox with Care</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg max-w-xl">
                    Upon arrival, gently remove your plant from its packaging and allow it to breathe. A moment of fresh air helps it transition beautifully.
                  </p>
                </div>

                <div className="space-y-2 border-l-2 border-primary/10 pl-8 py-1">
                  <h3 className="font-display text-2xl text-primary/90">Let It Settle</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg max-w-xl">
                    Before planting, allow your succulent to rest in a well-ventilated space for a few hours. This ensures a smooth, stress-free adjustment.
                  </p>
                </div>

                <div className="space-y-4 border-l-2 border-accent pl-8 py-2 bg-background/40 rounded-r-[2rem] p-8 shadow-soft border-y border-r border-border/50">
                  <h3 className="font-display text-2xl text-primary/90">The Perfect Foundation</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg max-w-xl">
                    A refined soil blend is essential for long-term vitality:
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-primary">
                    <span className="flex items-center gap-2.5"><div className="h-2 w-2 rounded-full bg-accent shadow-sm" /> Sand (30%)</span>
                    <span className="flex items-center gap-2.5"><div className="h-2 w-2 rounded-full bg-accent shadow-sm" /> Soil (30%)</span>
                    <span className="flex items-center gap-2.5"><div className="h-2 w-2 rounded-full bg-accent shadow-sm" /> Vermicompost (20%)</span>
                    <span className="flex items-center gap-2.5"><div className="h-2 w-2 rounded-full bg-accent shadow-sm" /> Perlite (20%)</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic font-medium">This balance promotes optimal drainage, aeration, and nourishment.</p>
                </div>

                <div className="space-y-2 border-l-2 border-primary/10 pl-8 py-1">
                  <h3 className="font-display text-2xl text-primary/90">Water, Thoughtfully</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg max-w-xl">
                    Delay watering for 2–3 days after planting. Introduce sunlight gradually — avoid direct exposure for the first 7–10 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERED WITH CARE (INSTAGRAM STYLE) */}
      <DeliveredWithCare />

      {/* FAQs */}
      <section className="bg-secondary/10 py-20 md:py-32">
        <div className="container max-w-4xl px-2 sm:px-6">
          <div className="text-center mb-12 md:mb-16 space-y-4 animate-fade-up">
            <h2 className="font-display text-4xl md:text-5xl">Frequently Asked Questions (FAQ's)</h2>
            <p className="text-muted-foreground text-lg italic">Everything you need to know about plant care</p>
          </div>

          <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
            {[
              {
                q: "How often should I water my plants?",
                a: "Water only when the top layer of soil feels dry. Overwatering can harm the roots, especially for succulents."
              },
              {
                q: "Do plants need direct sunlight?",
                a: "Not all plants require direct sunlight. Some thrive in indirect light. Always check your plant’s specific needs."
              },
              {
                q: "What is the best soil for plants?",
                a: "A well-drained soil mix is ideal. For succulents, a mix of sand, soil, vermicompost, and perlite works best."
              },
              {
                q: "Why are my plant leaves turning yellow?",
                a: "Yellow leaves are often a sign of overwatering or poor drainage. Adjust watering and check soil quality."
              },
              {
                q: "How do I know if my plant is healthy?",
                a: "Healthy plants have firm leaves, steady growth, and vibrant color. Wilting or discoloration may indicate issues."
              },
              {
                q: "Can I keep plants indoors?",
                a: "Yes, many plants grow well indoors with proper light, ventilation, and occasional sunlight exposure."
              },
              {
                q: "How long does it take for plants to grow?",
                a: "Growth depends on the plant type, care, and environment. Some plants grow quickly, while others take time."
              }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-background rounded-2xl border px-6 shadow-soft hover:shadow-card transition-smooth">
                <AccordionTrigger className="text-left font-display text-lg md:text-xl py-6 hover:no-underline hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
