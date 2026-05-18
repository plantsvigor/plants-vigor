const products = [
  {
    id: "p-monstera",
    name: "Monstera Deliciosa",
    slug: "monstera-deliciosa",
    price: 899,
    discountPrice: 649,
    images: [
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1617173945092-1c6622e5b651?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800"
    ],
    category: "indoor-plants",
    description: "The iconic Swiss cheese plant with dramatic split leaves. Loves bright, indirect light and a weekly drink. A statement piece for any living space.",
    stock: 24, rating: 4.8, reviewsCount: 312, bestSeller: true, featured: true,
  },
  {
    id: "p-snake",
    name: "Snake Plant (Sansevieria)",
    slug: "snake-plant",
    price: 599,
    discountPrice: 449,
    images: [
      "https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1599591037488-dc784862b591?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1572862905000-c5b62442274b?auto=format&fit=crop&q=80&w=800"
    ],
    category: "air-purifying",
    description: "Nearly indestructible, NASA-approved air purifier. Tolerates low light and forgetful waterers. Perfect for bedrooms and offices.",
    stock: 50, rating: 4.9, reviewsCount: 540, bestSeller: true, featured: true,
  },
  {
    id: "p-succulent",
    name: "Echeveria Succulent",
    slug: "echeveria-succulent",
    price: 349,
    discountPrice: 249,
    images: [
      "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=800"
    ],
    category: "succulents",
    description: "A rosette-forming succulent with soft pastel hues. Loves bright sun and barely any water. Comes in a stone-finish ceramic pot.",
    stock: 80, rating: 4.7, reviewsCount: 198, featured: true,
  },
  {
    id: "p-peacelily",
    name: "Peace Lily",
    slug: "peace-lily",
    price: 749,
    discountPrice: 549,
    images: [
      "https://images.unsplash.com/photo-1597055181300-e36caf3b2696?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1595333555541-d603e839e061?auto=format&fit=crop&q=80&w=800"
    ],
    category: "air-purifying",
    description: "Elegant white blooms with glossy dark foliage. One of the best air purifiers and surprisingly low maintenance.",
    stock: 32, rating: 4.8, reviewsCount: 276, bestSeller: true,
  },
  {
    id: "p-pothos",
    name: "Golden Pothos",
    slug: "golden-pothos",
    price: 449,
    discountPrice: 329,
    images: [
      "https://images.unsplash.com/photo-1590113521340-08f328a47514?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1612360427561-d9e00e2768ca?auto=format&fit=crop&q=80&w=800"
    ],
    category: "indoor-plants",
    description: "Trailing heart-shaped leaves splashed with gold. Thrives almost anywhere and grows fast. Great for shelves and hanging planters.",
    stock: 60, rating: 4.9, reviewsCount: 421, featured: true,
  },
  {
    id: "p-anthurium",
    name: "Red Anthurium",
    slug: "red-anthurium",
    price: 999,
    discountPrice: 749,
    images: [
      "https://images.unsplash.com/photo-1591873105748-03203c9c9b46?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1566903223073-4ad222728954?auto=format&fit=crop&q=80&w=800"
    ],
    category: "flowering-plants",
    description: "Bold red waxy spathes that bloom for weeks. A tropical accent that brings warmth and drama indoors.",
    stock: 18, rating: 4.6, reviewsCount: 142, bestSeller: true,
  },
];

const getProductById = (id) => products.find((p) => p.id === id);

module.exports = { products, getProductById };
