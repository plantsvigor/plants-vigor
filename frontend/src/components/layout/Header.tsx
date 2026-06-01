import { Link, NavLink } from "react-router-dom";
import { Heart, Leaf, LogOut, Menu, Package, Search, ShoppingBag, User, ChevronDown, X } from "lucide-react";
import logo from "@/assets/logo/plants-vigor-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";
import { categories } from "@/data/catalog";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { formatINR } from "@/data/catalog";

const useTypewriterPlaceholder = (phrases: string[], typingSpeed = 100, deletingSpeed = 50, delay = 1500) => {
  const [placeholder, setPlaceholder] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentPhrase = phrases[phraseIdx];

    if (isDeleting) {
      timer = setTimeout(() => {
        setPlaceholder(currentPhrase.substring(0, placeholder.length - 1));
      }, deletingSpeed);
    } else {
      timer = setTimeout(() => {
        setPlaceholder(currentPhrase.substring(0, placeholder.length + 1));
      }, typingSpeed);
    }

    if (!isDeleting && placeholder === currentPhrase) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && placeholder === "") {
      setIsDeleting(false);
      setPhraseIdx((phraseIdx + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, phraseIdx, phrases, typingSpeed, deletingSpeed, delay]);

  return placeholder;
};

const navLinks = [
  {
    label: "Plants",
    to: "/category/plants",
    items: [
      { label: "All Plants", to: "/category/plants" },
      { label: "Indoor Plants", to: "/category/indoor-plants" },
      { label: "Succulent Plants", to: "/category/succulent-plants" },
      { label: "Cactus", to: "/category/cactus" },
      { label: "Air Purifying Plants", to: "/category/air-purifying-plants" },
      { label: "Hardy Plants", to: "/category/hardy-plants" },
      { label: "Adenium Plants", to: "/category/adenium-plants" },
      { label: "Vastu Plants", to: "/category/vastu-plants" },
      { label: "Medicinal Plants", to: "/category/medicinal-plants" },
      { label: "House Plants", to: "/category/house-plants" },
      { label: "Outdoor Plants", to: "/category/outdoor-plants" },
      { label: "Flowering Plants", to: "/category/flowering-plants" },
      { label: "Summer Plants", to: "/category/summer-plants" },
      { label: "Hanging Plants", to: "/category/hanging-plants" },
      { label: "Plants for Bathroom", to: "/category/plants-for-bathroom" },
    ]
  },
  {
    label: "Seeds",
    to: "/category/seeds",
    items: [
      { label: "All Seeds", to: "/category/seeds" },
      { label: "Summer Seeds", to: "/category/summer-seeds" },
      { label: "Winter Flower Seeds", to: "/category/winter-flower-seeds" },
      { label: "Fruit Seeds", to: "/category/fruit-seeds" },
      { label: "Herbs Seeds", to: "/category/herbs-seeds" },
      { label: "Flower Seeds", to: "/category/flower-seeds" },
      { label: "Tree & Grass seeds", to: "/category/tree-grass-seeds" },
    ]
  },
  {
    label: "Pots & Planters",
    to: "/category/pots-planters",
    items: [
      { label: "All Pots & Planters", to: "/category/pots-planters" },
      { label: "Resin Pots", to: "/category/resin-pots" },
      { label: "Metal Pots", to: "/category/metal-pots" },
      { label: "Coir Pots", to: "/category/coir-pots" },
      { label: "Self Watering Pots", to: "/category/self-watering-pots" },
      { label: "Plastic Pots", to: "/category/plastic-pots" },
      { label: "Net Pots", to: "/category/net-pots" },
      { label: "Ceramic Pots", to: "/category/ceramic-pots" },
      { label: "Basket Planters", to: "/category/basket-planters" },
      { label: "Hanging Planters", to: "/category/hanging-planters" },
    ]
  },
  {
    label: "Plant Care",
    to: "/category/plant-care",
    items: [
      { label: "Fertilizers", to: "/category/fertilizers" },
      { label: "Soil & Media", to: "/category/soil-media" },
      { label: "Pest Control", to: "/category/pest-control" },
    ]
  },
  {
    label: "Accessories",
    to: "/category/accessories",
    items: [
      { label: "Watering Cans", to: "/category/watering-cans" },
      { label: "Decorative Stones", to: "/category/decorative-stones" },
      { label: "Garden Decor", to: "/category/garden-decor" },
    ]
  },
  { label: "Gifts", to: "/category/gifts" },
];

export default function Header() {
  const { count, setOpen } = useCart();
  const { ids: wishIds } = useWishlist();
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const { products: allProducts, loading: productsLoading } = useProducts();

  const animatedNoun = useTypewriterPlaceholder([
    "plants…",
    "pots…",
    "seeds…",
    "plant care…",
    "accessories…"
  ]);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/category/plants?q=${encodeURIComponent(q.trim())}`);
      setShowSearch(false);
      setIsFocused(false);
    }
  };

  const filteredProducts = allProducts
    .filter(p => {
      const nameMatch = p.name.toLowerCase().includes(debouncedQ.toLowerCase());
      const catMatch = Array.isArray(p.category)
        ? p.category.some(c => c.toLowerCase().includes(debouncedQ.toLowerCase()))
        : p.category.toLowerCase().includes(debouncedQ.toLowerCase());
      return nameMatch || catMatch;
    })
    .sort((a, b) => {
      const query = debouncedQ.toLowerCase();
      const aStarts = a.name.toLowerCase().startsWith(query);
      const bStarts = b.name.toLowerCase().startsWith(query);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedNav, setExpandedNav] = useState<string | null>(null);

  const toggleNav = (label: string) => {
    setExpandedNav(expandedNav === label ? null : label);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      {/* Announcement bar */}


      <div className="container flex items-center gap-4 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 mr-auto lg:mr-0">
          <img
            src={logo}
            alt="Plants Vigor"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 ml-6">
          {navLinks.map((l, i) => (
            l.items ? (
              <DropdownMenu key={i}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm font-medium transition-smooth hover:text-primary text-foreground/70 outline-none">
                    {l.label}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-1 max-h-[80vh] overflow-y-auto">
                  {l.items.map((item, j) => (
                    <DropdownMenuItem key={j} asChild>
                      <Link to={item.to} className="w-full cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-secondary">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <NavLink
                key={i}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-smooth hover:text-primary ${isActive ? "text-primary" : "text-foreground/70"}`}
              >
                {l.label}
              </NavLink>
            )
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={submit} className="hidden md:flex flex-1 max-w-md ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={`Search ${animatedNoun}`} 
            className="pl-9 rounded-full bg-secondary/50 border-transparent focus-visible:bg-background" 
          />
          {isFocused && debouncedQ.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/80 rounded-2xl shadow-xl max-h-[380px] overflow-y-auto z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {productsLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No products found</div>
              ) : (
                <div className="space-y-1">
                  {filteredProducts
                    .slice(0, 6)
                    .map(p => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        onClick={() => {
                          setQ("");
                          setIsFocused(false);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-secondary rounded-xl transition-colors text-left"
                      >
                        <img 
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1545239351-ef35f43d514b"} 
                          alt={p.name} 
                          className="h-10 w-10 object-cover rounded-lg bg-secondary shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate text-foreground">{p.name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">
                            {Array.isArray(p.category)
                              ? p.category.map(c => c.replace("-", " ")).join(", ")
                              : p.category.replace("-", " ")}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-[#008744] shrink-0">
                          {formatINR(p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price)}
                        </div>
                      </Link>
                    ))
                  }
                </div>
              )}
            </div>
          )}
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-1 ml-auto md:ml-0">
          <Button asChild variant="ghost" size="icon" className="relative hover:bg-transparent hover:scale-[1.2] transition-smooth" aria-label="Wishlist">
            <Link to="/wishlist">
              <Heart className="h-5 w-5" />
              {wishIds.length > 0 && <Badge>{wishIds.length}</Badge>}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-transparent hover:scale-[1.2] transition-smooth"
            onClick={() => setShowSearch(true)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-transparent hover:scale-[1.2] transition-smooth" aria-label="Account">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <DropdownMenuLabel>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/profile">My profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/orders">My orders</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/track-order">Track order</Link></DropdownMenuItem>
                  {user.role === "admin" && <DropdownMenuItem asChild><Link to="/admin">Admin panel</Link></DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild><Link to="/login">Login</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/signup">Create account</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/track-order"><Package className="mr-2 h-4 w-4" />Track an order</Link></DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="relative hover:bg-transparent hover:scale-[1.2] transition-smooth" aria-label="Cart" onClick={() => setOpen(true)}>
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && <Badge>{count}</Badge>}
          </Button>

          {/* Mobile menu (Moved to right) */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden hover:bg-transparent hover:scale-[1.2] transition-smooth" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl pt-2">
                  <img
                    src={logo}
                    alt="Plants Vigor"
                    className="h-10 w-auto object-contain"
                  />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1 pb-20">
                {navLinks.map((l, i) => (
                  <div key={i} className="flex flex-col border-b border-border/50 last:border-0">
                    {l.items ? (
                      <>
                        <button
                          onClick={() => toggleNav(l.label)}
                          className="flex items-center justify-between px-3 py-3 text-sm font-medium hover:bg-secondary rounded-md text-left transition-colors"
                        >
                          {l.label}
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expandedNav === l.label ? "rotate-180" : ""}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-200 ${expandedNav === l.label ? "max-h-[500px] py-1" : "max-h-0"}`}>
                          <div className="flex flex-col pl-4 gap-0.5">
                            {l.items.map((item, j) => (
                              <NavLink
                                key={j}
                                to={item.to}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                  `rounded-md px-4 py-2 text-sm transition-colors hover:bg-secondary ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`
                                }
                              >
                                {item.label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <NavLink
                        to={l.to}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-3 text-sm font-medium hover:bg-secondary rounded-md transition-colors ${isActive ? "text-primary bg-primary/5" : ""}`
                        }
                      >
                        {l.label}
                      </NavLink>
                    )}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Full-width Mobile Search Overlay */}
      {showSearch && (
        <div className="absolute inset-0 z-50 flex flex-col bg-background px-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <form onSubmit={submit} className="flex items-center gap-3 py-4 border-b">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={`Search ${animatedNoun}`}
              className="flex-1 h-10 border-none bg-transparent focus-visible:ring-0 text-base"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => { setShowSearch(false); setQ(""); }}
              className="shrink-0 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </form>

          {debouncedQ.trim().length > 0 && (
            <div className="flex-1 overflow-y-auto py-4">
              {productsLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No products found</div>
              ) : (
                <div className="space-y-1">
                  {filteredProducts
                    .slice(0, 10)
                    .map(p => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        onClick={() => {
                          setQ("");
                          setShowSearch(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-colors text-left"
                      >
                        <img 
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1545239351-ef35f43d514b"} 
                          alt={p.name} 
                          className="h-12 w-12 object-cover rounded-lg bg-secondary shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate text-foreground">{p.name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">
                            {Array.isArray(p.category)
                              ? p.category.map(c => c.replace("-", " ")).join(", ")
                              : p.category.replace("-", " ")}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-[#008744] shrink-0">
                          {formatINR(p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price)}
                        </div>
                      </Link>
                    ))
                  }
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
      {children}
    </span>
  );
}
