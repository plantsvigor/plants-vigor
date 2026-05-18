// Dummy product catalog for the Plants Vigor-inspired storefront.
// In production, replace with fetches from /api/products.

export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;        // INR
  discountPrice?: number;
  images: string[];
  category: CategorySlug;
  description: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  bestSeller?: boolean;
  featured?: boolean;
  tags?: string[];
}

export const categories: Category[] = [
  // Plants
  { slug: "plants", name: "All Plants", tagline: "Browse all plants", image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800" },
  { slug: "indoor-plants", name: "Indoor Plants", tagline: "Bring nature inside", image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800" },
  { slug: "succulent-plants", name: "Succulent Plants", tagline: "Low maintenance beauties", image: "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&q=80&w=800" },
  { slug: "cactus", name: "Cactus", tagline: "Desert dwellers", image: "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&q=80&w=800" },
  { slug: "air-purifying-plants", name: "Air Purifying Plants", tagline: "Cleaner air, calmer home", image: "https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&q=80&w=800" },
  { slug: "hardy-plants", name: "Hardy Plants", tagline: "Tough and durable", image: "https://images.unsplash.com/photo-1591873105748-03203c9c9b46?auto=format&fit=crop&q=80&w=800" },
  { slug: "adenium-plants", name: "Adenium Plants", tagline: "Desert rose", image: "https://images.unsplash.com/photo-1597055181300-e36caf3b2696?auto=format&fit=crop&q=80&w=800" },
  { slug: "vastu-plants", name: "Vastu Plants", tagline: "Positive energy", image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800" },
  { slug: "medicinal-plants", name: "Medicinal Plants", tagline: "Natural healing", image: "https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&q=80&w=800" },
  { slug: "house-plants", name: "House Plants", tagline: "Perfect for indoors", image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800" },
  { slug: "outdoor-plants", name: "Outdoor Plants", tagline: "Garden favourites", image: "https://images.unsplash.com/photo-1591873105748-03203c9c9b46?auto=format&fit=crop&q=80&w=800" },
  { slug: "flowering-plants", name: "Flowering Plants", tagline: "Colour all year", image: "https://images.unsplash.com/photo-1597055181300-e36caf3b2696?auto=format&fit=crop&q=80&w=800" },
  { slug: "summer-plants", name: "Summer Plants", tagline: "Heat lovers", image: "https://images.unsplash.com/photo-1591873105748-03203c9c9b46?auto=format&fit=crop&q=80&w=800" },
  { slug: "hanging-plants", name: "Hanging Plants", tagline: "Cascading beauty", image: "https://images.unsplash.com/photo-1590113521340-08f328a47514?auto=format&fit=crop&q=80&w=800" },
  { slug: "plants-for-bathroom", name: "Plants for Bathroom", tagline: "Humidity lovers", image: "https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&q=80&w=800" },
  
  // Seeds
  { slug: "seeds", name: "All Seeds", tagline: "Grow from scratch", image: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf4?auto=format&fit=crop&q=80&w=800" },
  { slug: "summer-seeds", name: "Summer Seeds", tagline: "Warm season growth", image: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf4?auto=format&fit=crop&q=80&w=800" },
  { slug: "winter-flower-seeds", name: "Winter Flower Seeds", tagline: "Cool season blooms", image: "https://images.unsplash.com/photo-1597055181300-e36caf3b2696?auto=format&fit=crop&q=80&w=800" },
  { slug: "fruit-seeds", name: "Fruit Seeds", tagline: "Homegrown sweetness", image: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf4?auto=format&fit=crop&q=80&w=800" },
  { slug: "herbs-seeds", name: "Herbs Seeds", tagline: "Culinary essentials", image: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf4?auto=format&fit=crop&q=80&w=800" },
  { slug: "flower-seeds", name: "Flower Seeds", tagline: "Grow a colourful garden", image: "https://images.unsplash.com/photo-1597055181300-e36caf3b2696?auto=format&fit=crop&q=80&w=800" },
  { slug: "tree-grass-seeds", name: "Tree & Grass seeds", tagline: "Foundational greens", image: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf4?auto=format&fit=crop&q=80&w=800" },

  // Pots & Planters
  { slug: "pots-planters", name: "All Pots & Planters", tagline: "Home for your plants", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "resin-pots", name: "Resin Pots", tagline: "Lightweight and durable", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "metal-pots", name: "Metal Pots", tagline: "Modern shine", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "coir-pots", name: "Coir Pots", tagline: "Eco-friendly natural pots", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "self-watering-pots", name: "Self Watering Pots", tagline: "Low maintenance care", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "plastic-pots", name: "Plastic Pots", tagline: "Versatile and light", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "net-pots", name: "Net Pots", tagline: "For hydroponics", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "ceramic-pots", name: "Ceramic Pots", tagline: "Classic elegance", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "basket-planters", name: "Basket Planters", tagline: "Rustic woven charm", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "hanging-planters", name: "Hanging Planters", tagline: "Suspend your greenery", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  
  // Gifts & Others
  { slug: "gifts", name: "Gifts", tagline: "Perfect for plant lovers", image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800" },
  { slug: "plant-care", name: "Plant Care", tagline: "Everything they need", image: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf4?auto=format&fit=crop&q=80&w=800" },
  { slug: "fertilizers", name: "Fertilizers", tagline: "Plant food", image: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf4?auto=format&fit=crop&q=80&w=800" },
  { slug: "soil-media", name: "Soil & Media", tagline: "The right foundation", image: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf4?auto=format&fit=crop&q=80&w=800" },
  { slug: "pest-control", name: "Pest Control", tagline: "Keep bugs away", image: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf4?auto=format&fit=crop&q=80&w=800" },
  { slug: "accessories", name: "Accessories", tagline: "Tools of the trade", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "watering-cans", name: "Watering Cans", tagline: "Hydrate in style", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "decorative-stones", name: "Decorative Stones", tagline: "Top dressing", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "garden-decor", name: "Garden Decor", tagline: "Beautify your space", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800" },
  { slug: "bulk-order", name: "Bulk Order", tagline: "Orders for events & business", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800" },
];

export const products: Product[] = [];

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const getProductById = (id: string) => products.find(p => p.id === id);
export const getProductBySlug = (slug: string) => products.find(p => p.slug === slug);
export const getCategory = (slug: CategorySlug) => categories.find(c => c.slug === slug);
