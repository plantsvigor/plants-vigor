const plantInfoDataset = [
  {
    name: "Snake Plant",
    category: "Indoor",
    sunlight: "Low to bright indirect light; extremely adaptable.",
    watering: "Water only when the soil is completely dry, every 3-4 weeks.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A rugged, air-purifying plant with architectural upright leaves.",
    careTips: [
      "Avoid getting water in the center of the leaves.",
      "Use extremely well-draining cactus soil.",
      "Thrives when rootbound; don't repot too often."
    ]
  },
  {
    name: "Aloe Vera",
    category: "Succulents",
    sunlight: "Bright, direct to indirect sunlight.",
    watering: "Allow soil to dry out fully between waterings, about every 2-3 weeks.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A famous succulent known for its soothing gel and plump, spiky leaves.",
    careTips: [
      "Harvest gel from mature outer leaves.",
      "Provide excellent drainage to avoid root rot.",
      "Protect from freezing temperatures."
    ]
  },
  {
    name: "Peace Lily",
    category: "Indoor",
    sunlight: "Low to medium indirect light; sensitive to direct sun.",
    watering: "Keep soil consistently moist; leaves will droop when thirsty.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "An elegant plant with glossy leaves and beautiful white spoon-like flowers.",
    careTips: [
      "Wipe leaves with a damp cloth to remove dust.",
      "Use filtered water to prevent brown tips.",
      "Keep away from cold drafty windows."
    ]
  },
  {
    name: "Monstera Deliciosa",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Water when the top 2 inches of soil are dry, about every 1-2 weeks.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "The iconic split-leaf philodendron, famous for its tropical look.",
    careTips: [
      "Provide a moss pole or trellis for support.",
      "Clean leaves regularly to assist photosynthesis.",
      "Rotate the plant occasionally for balanced growth."
    ]
  },
  {
    name: "Spider Plant",
    category: "Indoor",
    sunlight: "Bright, indirect light; can tolerate low light.",
    watering: "Keep soil lightly moist; water when the top inch dries.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A fast-growing plant with slender arched leaves and cascading spiderettes.",
    careTips: [
      "Propagate the plantlets by potting them in soil.",
      "Avoid fluoride in water to prevent leaf tip browning.",
      "Perfect for hanging baskets or tall stands."
    ]
  },
  {
    name: "ZZ Plant",
    category: "Indoor",
    sunlight: "Low to bright indirect light; tolerates low-light office conditions.",
    watering: "Very drought-tolerant; water once a month or when soil is dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A highly resilient plant with shiny, dark green waxy leaflets.",
    careTips: [
      "Do not overwater; it is highly susceptible to root rot.",
      "Wipe off dust to keep its beautiful waxy shine.",
      "Requires very little fertilization."
    ]
  },
  {
    name: "Boston Fern",
    category: "Ferns",
    sunlight: "Bright, filtered indirect light.",
    watering: "Consistently moist soil; do not let the soil dry out.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A classic fern with rich feathery fronds that loves high humidity.",
    careTips: [
      "Mist leaves daily or use a humidifier.",
      "Place on a tray of wet pebbles to raise humidity.",
      "Keep away from hot air vents."
    ]
  },
  {
    name: "Golden Pothos",
    category: "Indoor",
    sunlight: "Low to bright indirect light; variegation fades in low light.",
    watering: "Water when the top 2 inches of soil feel dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A popular, trailing vine with heart-shaped leaves variegated in yellow.",
    careTips: [
      "Trim vines to encourage a bushier growth pattern.",
      "Can grow in soil or directly in water containers.",
      "Extremely easy to propagate from stem cuttings."
    ]
  },
  {
    name: "Fiddle Leaf Fig",
    category: "Indoor",
    sunlight: "Consistent bright, indirect light.",
    watering: "Water thoroughly when the top inch of soil is dry.",
    petSafe: false,
    difficulty: "Hard",
    shortDescription: "A stunning statement plant with large, violin-shaped glossy leaves.",
    careTips: [
      "Keep in one stable spot; it dislikes being moved.",
      "Shake the trunk gently to simulate wind and strengthen it.",
      "Clean leaves regularly to maximize light absorption."
    ]
  },
  {
    name: "Jade Plant",
    category: "Succulents",
    sunlight: "Direct sun to bright indirect light.",
    watering: "Water thoroughly when the soil is completely dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A popular succulent shrub with thick woody stems and oval jade green leaves.",
    careTips: [
      "Needs at least 4 hours of bright light daily.",
      "Prune regularly to maintain a compact, tree-like shape.",
      "Symbolizes good luck and prosperity in many cultures."
    ]
  },
  {
    name: "Cast Iron Plant",
    category: "Indoor",
    sunlight: "Low light to shade; very tolerant.",
    watering: "Allow soil to dry out significantly between waterings.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "An incredibly tough plant with dark green, lance-shaped leaves.",
    careTips: [
      "Virtually indestructible; thrives on neglect.",
      "Dust leaves regularly to keep them looking green.",
      "Avoid direct hot sun which will scorch the leaves."
    ]
  },
  {
    name: "English Ivy",
    category: "Indoor",
    sunlight: "Medium to bright indirect light.",
    watering: "Keep soil evenly moist but not soggy.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "A classic climbing or trailing evergreen vine with lobed leaves.",
    careTips: [
      "Appreciates cooler temperatures and good airflow.",
      "Wash leaves occasionally to prevent spider mites.",
      "Provide a trellis or let it cascade down."
    ]
  },
  {
    name: "Rubber Plant",
    category: "Indoor",
    sunlight: "Bright, indirect light.",
    watering: "Water when the top 2 inches of soil dry out.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "A striking tree with large, thick, leathery leaves of dark burgundy.",
    careTips: [
      "Be careful of the sticky white sap when pruning.",
      "Wipe leaves with a soft rag to keep them shiny.",
      "Reduce watering significantly during the winter."
    ]
  },
  {
    name: "Zebra Haworthia",
    category: "Succulents",
    sunlight: "Bright indirect to partial direct sunlight.",
    watering: "Water only when soil is completely dry, every 3 weeks.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A small, sturdy succulent with white-striped horizontal bands.",
    careTips: [
      "Excellent plant for windowsills and small desks.",
      "Use well-draining succulent or cactus potting mix.",
      "Do not water the center rosette directly."
    ]
  },
  {
    name: "Chinese Evergreen",
    category: "Indoor",
    sunlight: "Low to medium indirect light.",
    watering: "Water when the top 2 inches of soil dry completely.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "An adaptable plant with beautifully patterned green and silver leaves.",
    careTips: [
      "Extremely tolerant of low-light and fluorescent office bulbs.",
      "Keep away from cold drafty areas.",
      "Avoid over-fertilizing."
    ]
  },
  {
    name: "Areca Palm",
    category: "Palms",
    sunlight: "Bright, filtered indirect light.",
    watering: "Keep soil lightly moist, but not saturated.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A feathery, air-purifying palm that adds a lush tropical feel.",
    careTips: [
      "Thrives in warm, humid rooms.",
      "Sensitive to mineral buildup in tap water; use filtered.",
      "Feed monthly during spring and summer."
    ]
  },
  {
    name: "Parlor Palm",
    category: "Palms",
    sunlight: "Low to bright indirect light.",
    watering: "Water when the top inch of soil is dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A compact palm with delicate fronds, popular since Victorian times.",
    careTips: [
      "Tolerates low light and dry indoor air well.",
      "Prune only dead lower leaves; do not trim the top.",
      "Repot only when absolutely necessary."
    ]
  },
  {
    name: "Bird of Paradise",
    category: "Flowering",
    sunlight: "Bright direct to indirect sunlight.",
    watering: "Water when the top 2 inches of soil are dry.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "A majestic plant with massive banana-like leaves and orange bird-like flowers.",
    careTips: [
      "Needs at least 5-6 hours of bright light to bloom.",
      "Leaves naturally split as they age to allow wind passage.",
      "Clean leaves regularly to maximize growth."
    ]
  },
  {
    name: "Swiss Cheese Vine",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Water when the top inch of soil dries.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "A trailing cousin of the Monstera with smaller, fenestrated leaves.",
    careTips: [
      "Provide a pole or let it trail elegantly.",
      "Appreciates warm environments and moderate humidity.",
      "Highly suitable for compact shelves."
    ]
  },
  {
    name: "Pilea Peperomioides",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Water when the soil is mostly dry; leaves droop slightly.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "Also called the UFO or Chinese Money Plant, with round pancake leaves.",
    careTips: [
      "Rotate 90 degrees weekly to keep growth symmetric.",
      "Propagate the small 'pups' that grow in the soil.",
      "Use well-aerated, sandy soil mix."
    ]
  },
  {
    name: "String of Pearls",
    category: "Succulents",
    sunlight: "Bright indirect light; morning direct sun.",
    watering: "Water only when the green peas look slightly puckered.",
    petSafe: false,
    difficulty: "Hard",
    shortDescription: "A delicate hanging succulent with trailing bead-like green spheres.",
    careTips: [
      "Extremely sensitive to overwatering; use terracotta pots.",
      "Keep the top of the pot flat to receive overhead light.",
      "Handle gently as the pearls detach easily."
    ]
  },
  {
    name: "Croton",
    category: "Outdoor",
    sunlight: "Bright, direct light to bring out vibrant colors.",
    watering: "Keep soil evenly moist; dislikes drying out.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "A stunning outdoor shrub with bold leaves colored in red, yellow, and orange.",
    careTips: [
      "Loses colorful variegation and turns green in low light.",
      "Drafts and sudden moves cause leaf drop.",
      "Wear gloves, as the sap can irritate skin."
    ]
  },
  {
    name: "Calathea Orbifolia",
    category: "Indoor",
    sunlight: "Medium, filtered indirect light.",
    watering: "Keep soil consistently moist but never waterlogged.",
    petSafe: true,
    difficulty: "Hard",
    shortDescription: "An exquisite foliage plant with large round leaves striped in silver.",
    careTips: [
      "Must have high humidity; use a humidifier.",
      "Use distilled or rainwater only to avoid leaf crispy edges.",
      "Dislikes sudden temperature drops."
    ]
  },
  {
    name: "Prayer Plant",
    category: "Indoor",
    sunlight: "Bright, filtered indirect light.",
    watering: "Keep soil moist; water when the surface dries.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A beautiful low-growing plant whose leaves fold upward at night.",
    careTips: [
      "Keep humidity high through regular misting.",
      "Place in warm locations away from heaters.",
      "Prune in spring to encourage new dense growth."
    ]
  },
  {
    name: "Majesty Palm",
    category: "Palms",
    sunlight: "Bright indirect light.",
    watering: "Keep soil consistently moist; requires regular watering.",
    petSafe: true,
    difficulty: "Hard",
    shortDescription: "A stately palm tree with grand upward arching green fronds.",
    careTips: [
      "Needs high humidity and plenty of warm air.",
      "Check weekly for spider mites on frond undersides.",
      "Feed regularly with palm fertilizer in summer."
    ]
  },
  {
    name: "Air Plants",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Soak in water for 20-30 minutes once a week.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "Unique epiphytes that grow completely without soil, absorbing water from air.",
    careTips: [
      "Shake off excess water and dry upside down after soaking.",
      "Provide good air circulation.",
      "Mist occasionally in between soakings."
    ]
  },
  {
    name: "Ponytail Palm",
    category: "Palms",
    sunlight: "Bright direct to indirect light.",
    watering: "Extremely drought-tolerant; water once every 3 weeks.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A slow-growing palm-like plant with a bulbous trunk and curly ribbon leaves.",
    careTips: [
      "The swollen trunk stores water; do not overwater.",
      "Perfect choice for travelers or busy plant owners.",
      "Provide a sandy cactus soil mix."
    ]
  },
  {
    name: "Anthurium",
    category: "Flowering",
    sunlight: "Bright indirect light.",
    watering: "Water when the top inch of soil is dry.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "Exotic plant with glossy heart-shaped leaves and bright red waxy spathes.",
    careTips: [
      "Waxy flowers can bloom all year in ideal bright conditions.",
      "High humidity keeps the leaves vibrant and glossy.",
      "Avoid cold drafts and direct burning sun."
    ]
  },
  {
    name: "Bromeliad",
    category: "Flowering",
    sunlight: "Bright indirect light.",
    watering: "Keep water in the central urn or cup of the plant.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A colorful tropical epiphyte with a central rosette cup and bright bloom spike.",
    careTips: [
      "Flush the central water cup weekly to prevent stagnation.",
      "Use well-draining orchid bark or fast-draining soil.",
      "After the flower dies, propagate the offsets or pups."
    ]
  },
  {
    name: "African Violet",
    category: "Flowering",
    sunlight: "Bright, indirect light; sensitive to sunburn.",
    watering: "Water from the bottom to avoid getting the leaves wet.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A charming compact plant with velvety leaves and clusters of purple flowers.",
    careTips: [
      "Cold water on leaves causes permanent brown spots.",
      "Keep in small pots to encourage heavier blooming.",
      "Deadhead spent flowers to stimulate new buds."
    ]
  },
  {
    name: "Polka Dot Plant",
    category: "Indoor",
    sunlight: "Bright, indirect light.",
    watering: "Keep soil evenly moist; will droop heavily when dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A small, colorful foliage plant spotted with pink, red, or white splashes.",
    careTips: [
      "Pinch back active stems to prevent it from getting leggy.",
      "High light makes the colorful spots look much brighter.",
      "Propagates easily in water."
    ]
  },
  {
    name: "Nerve Plant",
    category: "Indoor",
    sunlight: "Low to medium indirect light.",
    watering: "Keep soil damp; collapses instantly when dry but revives quickly.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A beautiful low-growing creeper with deep green leaves and neon veins.",
    careTips: [
      "Thrives in terrariums due to high humidity needs.",
      "Mist leaves daily or cover with a glass dome.",
      "Sensitive to soggy, waterlogged soil."
    ]
  },
  {
    name: "Peperomia Obtusifolia",
    category: "Indoor",
    sunlight: "Medium to bright indirect light.",
    watering: "Allow soil to dry out almost completely between waterings.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A compact plant with fleshy, spoon-shaped waxy green leaves.",
    careTips: [
      "Behaves like a succulent; store water in its thick leaves.",
      "Resilient to pests and low household humidity.",
      "Great for offices and small bookshelves."
    ]
  },
  {
    name: "Watermelon Peperomia",
    category: "Indoor",
    sunlight: "Medium to bright indirect light.",
    watering: "Water when the top inch of soil is dry.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A beautiful plant with leaves that look exactly like watermelon skin.",
    careTips: [
      "Sensitive to overwatering; check the roots regularly.",
      "Avoid direct hot sun which will fade the patterns.",
      "Propagates easily from a single leaf cut in half."
    ]
  },
  {
    name: "Zebra Plant",
    category: "Indoor",
    sunlight: "Bright, indirect light.",
    watering: "Keep soil consistently moist but never soggy.",
    petSafe: true,
    difficulty: "Hard",
    shortDescription: "A tropical plant with glossy dark leaves marked by bold white veins.",
    careTips: [
      "Requires constant high humidity and warm air.",
      "Dislikes drying out; leaves will drop quickly.",
      "Feed every 2 weeks during spring/summer growth."
    ]
  },
  {
    name: "Burro's Tail",
    category: "Succulents",
    sunlight: "Bright direct to indirect sunlight.",
    watering: "Water deeply only when the soil is fully dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A striking hanging succulent with long braided tails of plump blue-green leaves.",
    careTips: [
      "Touch very gently; leaves fall off at the slightest bump.",
      "Hang in a secure, sunny location.",
      "Grow new plants by laying fallen leaves on soil."
    ]
  },
  {
    name: "Christmas Cactus",
    category: "Succulents",
    sunlight: "Bright indirect light.",
    watering: "Water when the top half of the soil is dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A popular holiday cactus with flat segments that produces bright winter flowers.",
    careTips: [
      "Prefers more moisture and humidity than desert cacti.",
      "To prompt winter blooms, give it cool nights and dark days in autumn.",
      "Use well-draining potting soil with pumice."
    ]
  },
  {
    name: "Dumb Cane",
    category: "Indoor",
    sunlight: "Medium to bright indirect light.",
    watering: "Water when the top 2 inches of soil are dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "Also called Dieffenbachia, featuring large green leaves with creamy centers.",
    careTips: [
      "Keep away from children and pets; sap is highly toxic.",
      "Rotate regularly to ensure upright trunk growth.",
      "Dislikes cold drafts and wet feet."
    ]
  },
  {
    name: "Arrowhead Vine",
    category: "Indoor",
    sunlight: "Low to bright indirect light.",
    watering: "Allow the top inch of soil to dry out between waterings.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A versatile trailing or climbing houseplant with arrow-shaped variegated leaves.",
    careTips: [
      "Pinch back trailing stems to keep it bushy.",
      "Grows beautifully on a trellis or trailing from shelves.",
      "Easily propagated in jars of clean water."
    ]
  },
  {
    name: "Sago Palm",
    category: "Palms",
    sunlight: "Bright, direct to indirect sunlight.",
    watering: "Water when the soil is completely dry; highly drought-resistant.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A slow-growing ancient cycad with a rugged trunk and stiff feather fronds.",
    careTips: [
      "Extremely toxic to pets; do not keep near animals.",
      "Use a heavy clay pot with sandy potting mix.",
      "Needs very little fertilizer."
    ]
  },
  {
    name: "Norfolk Island Pine",
    category: "Indoor",
    sunlight: "Bright direct to indirect light.",
    watering: "Water when the top inch of soil is dry.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A beautiful miniature evergreen tree that is popular for indoor holiday decor.",
    careTips: [
      "Must have high humidity; dry air causes needle drop.",
      "Turn weekly to keep the main trunk perfectly straight.",
      "Keep soil evenly moist, not soggy."
    ]
  },
  {
    name: "Schefflera Umbrella Tree",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Water when the top 2 inches of soil are dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A popular indoor tree with glossy leaflets arranged in circular umbrella clusters.",
    careTips: [
      "Prune leggy stems to encourage a bushy, dense form.",
      "Watch out for scale insects and wipe them off.",
      "Vars require more light than solid green trees."
    ]
  },
  {
    name: "Money Tree",
    category: "Indoor",
    sunlight: "Bright indirect light; tolerates medium light.",
    watering: "Water thoroughly when the top 2 inches of soil are dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "Features a braided trunk and hand-shaped leaves, believed to bring wealth.",
    careTips: [
      "Avoid standing water in the drainage tray.",
      "Thrives in high-humidity rooms like kitchens.",
      "Rotate 180 degrees monthly to prevent leaning."
    ]
  },
  {
    name: "Lucky Bamboo",
    category: "Indoor",
    sunlight: "Moderate to low indirect light.",
    watering: "Keep roots submerged in water; change water weekly.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A popular houseplant grown in water and pebbles, trained into spirals.",
    careTips: [
      "Use filtered or bottled water to avoid chemical burn.",
      "If grown in soil, keep it constantly damp.",
      "Protect from direct cold drafts."
    ]
  },
  {
    name: "Philodendron Birkin",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Water when the top 50% of the soil is dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A self-heading compact philodendron with stunning white pinstriped leaves.",
    careTips: [
      "Pinstripes become more distinct in bright indirect light.",
      "Wipe the large glossy leaves weekly.",
      "Requires minimal fertilization in winter."
    ]
  },
  {
    name: "Heartleaf Philodendron",
    category: "Indoor",
    sunlight: "Low to bright indirect light.",
    watering: "Water when the top 2 inches of soil are dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "An incredibly resilient vining houseplant with graceful green heart leaves.",
    careTips: [
      "Excellent plant for beginners; very forgiving of missed watering.",
      "Let it cascade from bookshelves or mount on moss poles.",
      "Trim the vines regularly to stimulate a thicker base."
    ]
  },
  {
    name: "Crocodile Fern",
    category: "Ferns",
    sunlight: "Medium to low indirect light.",
    watering: "Keep soil lightly moist; do not let it dry out fully.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A unique fern with long, flat fronds patterned like crocodile skin.",
    careTips: [
      "Needs high humidity; mist leaves often.",
      "Plant in rich, well-aerated organic soil.",
      "Water from the side of the pot to protect the crown."
    ]
  },
  {
    name: "String of Hearts",
    category: "Succulents",
    sunlight: "Bright indirect light; tolerates morning sun.",
    watering: "Water only when the heart leaves feel soft to squeeze.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A gorgeous trailing vine with delicate purple stems and marbled heart leaves.",
    careTips: [
      "Use terracotta pots with fast-draining cactus mix.",
      "Can grow incredibly long; wrap vines over the soil to propagate.",
      "Requires very little watering during winter."
    ]
  },
  {
    name: "Kalanchoe",
    category: "Succulents",
    sunlight: "Bright direct to indirect sunlight.",
    watering: "Water deeply when the soil is completely dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A flowering succulent with large leaves and clusters of long-lasting colorful blooms.",
    careTips: [
      "Cut away spent flower stems to prompt secondary blooms.",
      "Needs plenty of light to flower again next year.",
      "Very drought-tolerant."
    ]
  },
  {
    name: "Echeveria Elegans",
    category: "Succulents",
    sunlight: "Direct sunlight; needs a very sunny window.",
    watering: "Water only when soil is dry to the bottom.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A beautiful rose-shaped succulent with icy blue-green leaves.",
    careTips: [
      "Will stretch out and lose shape if kept in low light.",
      "Keep dry during cold winter months.",
      "Avoid pooling water inside the rosette."
    ]
  },
  {
    name: "Crown of Thorns",
    category: "Succulents",
    sunlight: "Direct sun to bright light.",
    watering: "Drought-tolerant; water when top 2 inches dry out.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A spiny succulent shrub that blooms almost continuously with red bracts.",
    careTips: [
      "Handles dry indoor air and hot sunny windows very well.",
      "Watch out for the sharp thorns and toxic white sap.",
      "Fertilize occasionally in summer."
    ]
  },
  {
    name: "Fishbone Cactus",
    category: "Succulents",
    sunlight: "Bright filtered indirect light.",
    watering: "Water when the top half of the soil is dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A unique tropical cactus with jagged trailing stems like a fish skeleton.",
    careTips: [
      "Prefers slightly more moisture than desert desert cacti.",
      "Use a hanging basket to show off trailing zig-zag stems.",
      "Repot once every 2 years in organic cactus mix."
    ]
  },
  {
    name: "Maidenhair Fern",
    category: "Ferns",
    sunlight: "Consistent filtered shade; absolutely no direct sun.",
    watering: "Keep soil consistently damp; do not let it dry out even once.",
    petSafe: true,
    difficulty: "Hard",
    shortDescription: "Features delicate fan-shaped leaflets on thin black wire-like stems.",
    careTips: [
      "Must have constant moisture and very high humidity.",
      "Place on a water pebble tray or grow in terrariums.",
      "If it dries out completely, cut back fronds; new ones will emerge."
    ]
  },
  {
    name: "Bird's Nest Fern",
    category: "Ferns",
    sunlight: "Medium to low indirect light.",
    watering: "Water around the edges, keeping the center rosette dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "An elegant fern with large wavy, light green fronds growing in a nest shape.",
    careTips: [
      "Tolerates drier air much better than other fern varieties.",
      "Keep away from hot radiator registers.",
      "Wipe leaves gently with a damp cloth."
    ]
  },
  {
    name: "Rabbit's Foot Fern",
    category: "Ferns",
    sunlight: "Bright indirect light.",
    watering: "Keep soil lightly moist; spray the fuzzy surface roots.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "Famous for the fuzzy, brown rhizomes that creep over the edge of the pot.",
    careTips: [
      "Mist the fuzzy creeping roots daily.",
      "Grows best in shallow pots with plenty of leaf mold.",
      "Protect from cold drafts."
    ]
  },
  {
    name: "Asparagus Fern",
    category: "Ferns",
    sunlight: "Bright indirect light; can tolerate partial shade.",
    watering: "Water when the top inch of soil is dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "Actually a member of the lily family, with needle-like lace foliage.",
    careTips: [
      "Extremely fast grower; prune regularly.",
      "Watch out for small, hidden thorns on older vines.",
      "Keep out of reach of pets; produces toxic berries."
    ]
  },
  {
    name: "Sweet Basil",
    category: "Herbs",
    sunlight: "At least 6 hours of direct hot sunlight daily.",
    watering: "Keep soil moist; water whenever the top surface is dry.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A fragrant, essential culinary herb with lush, tender green leaves.",
    careTips: [
      "Pinch off flower spikes instantly to keep leaves tasting sweet.",
      "Harvest leaves from the top down to promote branching.",
      "Thrives on warm, bright kitchen windowsills."
    ]
  },
  {
    name: "English Lavender",
    category: "Herbs",
    sunlight: "Full, hot direct sun; 6-8 hours daily.",
    watering: "Drought-tolerant; water only when soil is 100% dry.",
    petSafe: false,
    difficulty: "Hard",
    shortDescription: "A famous aromatic herb with silver-green leaves and soothing purple flowers.",
    careTips: [
      "Needs extremely dry, sandy soil with high drainage.",
      "Dislikes high humidity and wet soil.",
      "Prune back after blooming to keep stems sturdy."
    ]
  },
  {
    name: "Rosemary",
    category: "Herbs",
    sunlight: "Full direct sun.",
    watering: "Allow soil to dry out completely before watering.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A hardy, aromatic woody herb with pine-like needle leaves.",
    careTips: [
      "Highly drought-tolerant once established.",
      "Prefers porous terracotta pots with sandy mix.",
      "Excellent patio or balcony container herb."
    ]
  },
  {
    name: "Peppermint",
    category: "Herbs",
    sunlight: "Partial sun to indirect light.",
    watering: "Keep soil consistently damp; loves moisture.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A fast-growing, highly aromatic herb known for its refreshing mint flavor.",
    careTips: [
      "Always grow in a separate pot; highly invasive in garden beds.",
      "Pinch tips weekly to promote dense, leafy growth.",
      "Enjoys moist, organic potting soils."
    ]
  },
  {
    name: "Oregano",
    category: "Herbs",
    sunlight: "Full direct sun.",
    watering: "Water only when the top inch of soil is completely dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A low-growing Mediterranean herb with tiny flavor-packed leaves.",
    careTips: [
      "Flavor is much stronger when grown in full direct sun.",
      "Extremely easy to care for and highly drought-resistant.",
      "Prune stems occasionally to prevent woodiness."
    ]
  },
  {
    name: "Ficus Audrey",
    category: "Indoor",
    sunlight: "Bright, indirect light.",
    watering: "Water when the top 2 inches of soil are dry.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "The cousin of the fiddle leaf fig, with velvety green leaves and a pale trunk.",
    careTips: [
      "Easier to care for than the Fiddle Leaf Fig.",
      "Rotate weekly to keep the white trunk growing straight.",
      "Wipe dust off the velvety leaves with a damp sponge."
    ]
  },
  {
    name: "Weeping Fig",
    category: "Indoor",
    sunlight: "Bright, consistent indirect light.",
    watering: "Water when the top inch of soil is dry.",
    petSafe: false,
    difficulty: "Hard",
    shortDescription: "A classic indoor tree with elegant woody branches and weeping teardrop leaves.",
    careTips: [
      "Will drop leaves dramatically if moved or exposed to drafts.",
      "Prune in winter to maintain desired shape.",
      "Avoid standing water in the tray."
    ]
  },
  {
    name: "String of Bananas",
    category: "Succulents",
    sunlight: "Bright indirect to direct sunlight.",
    watering: "Water thoroughly when the soil is completely dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A trailing succulent with thick leaves shaped like miniature green bananas.",
    careTips: [
      "Fast grower; vines cascade beautifully down hangers.",
      "Use well-aerated sandy cactus potting mix.",
      "Propagates extremely easily from cuttings."
    ]
  },
  {
    name: "Maidenhair Vine",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Keep soil lightly moist; do not let it dry out.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A delicate trailing plant with tiny green leaves on wiry dark stems.",
    careTips: [
      "Thrives in humid environments like bathrooms.",
      "Trim vines occasionally to keep it full and bushy.",
      "Great for small shelves or mini pots."
    ]
  },
  {
    name: "Watermelon Begonia",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Water when the top inch of soil is dry.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A cute trailing plant with round silver-patterned leaves.",
    careTips: [
      "Avoid getting water directly on the leaves to prevent rot.",
      "Enjoys warm environments and moderate humidity.",
      "Use lightweight, porous potting mix."
    ]
  },
  {
    name: "Polka Dot Begonia",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Water when the top inch of soil dries.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "A striking plant with wing-shaped leaves marked by silver polka dots and red backs.",
    careTips: [
      "Provide a support stake as it grows taller.",
      "Keep humidity high but maintain good airflow.",
      "Deadhead spent blooms to encourage new growth."
    ]
  },
  {
    name: "Neon Pothos",
    category: "Indoor",
    sunlight: "Low to bright indirect light.",
    watering: "Water when the top 2 inches of soil are dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A beautiful pothos variety with glowing chartreuse-green heart leaves.",
    careTips: [
      "Bright indirect light keeps the neon color vibrant.",
      "Extremely hardy and resistant to pests.",
      "Prune vines to keep it thick and bushy."
    ]
  },
  {
    name: "Satin Pothos",
    category: "Indoor",
    sunlight: "Medium to bright indirect light.",
    watering: "Water when the top 50% of the soil is dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A gorgeous climber with thick dark green leaves splashed in silver metallic.",
    careTips: [
      "Leaves curl slightly when thirsty, giving an easy signal.",
      "Sensitive to soggy soil; ensure great drainage.",
      "Highly adaptable to hanging or climbing."
    ]
  },
  {
    name: "Creeping Fig",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Keep soil consistently moist.",
    petSafe: false,
    difficulty: "Medium",
    shortDescription: "A fast-growing climbing vine with tiny, paper-thin crinkly green leaves.",
    careTips: [
      "Will quickly climb up brick walls or moss poles.",
      "Never let the soil dry out fully.",
      "Mist regularly to maintain high humidity."
    ]
  },
  {
    name: "String of Turtles",
    category: "Indoor",
    sunlight: "Bright, filtered indirect light.",
    watering: "Water only when the soil is completely dry.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A tiny hanging succulent vine with leaves patterned like turtle shells.",
    careTips: [
      "Extremely delicate; handle as little as possible.",
      "Water from the bottom to prevent top vine rot.",
      "Enjoys a shallow clay container."
    ]
  },
  {
    name: "Cast Iron Variegated",
    category: "Indoor",
    sunlight: "Low light to shade.",
    watering: "Drought-tolerant; water when soil dries out.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "The rare variegated version of the cast iron plant with white leaf stripes.",
    careTips: [
      "Maintains stripes better in slightly brighter indirect light.",
      "Extremely slow grower; do not over-fertilize.",
      "Practically bulletproof."
    ]
  },
  {
    name: "Zebra Cactus",
    category: "Succulents",
    sunlight: "Bright indirect to direct sunlight.",
    watering: "Water deeply every 3 weeks when soil is dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A small rosette succulent with dark leaves covered in white bumps.",
    careTips: [
      "Perfect desk plant; stays small.",
      "Use well-draining cactus sand mix.",
      "Protect from frost."
    ]
  },
  {
    name: "Staghorn Fern",
    category: "Ferns",
    sunlight: "Bright, filtered indirect light.",
    watering: "Soak the entire mount or pot weekly.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "An unusual fern with large fronds shaped like deer antlers, often grown on wood.",
    careTips: [
      "Great for mounting on wood panels in bathrooms.",
      "Mist the fuzzy shield fronds frequently.",
      "Use rainwater or distilled water."
    ]
  },
  {
    name: "Aluminium Plant",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Keep soil evenly moist.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A small bushy plant with leaves painted in metallic silver splashes.",
    careTips: [
      "Pinch active tips to prevent leggy growth.",
      "Keep away from dry drafts or heaters.",
      "High humidity keeps the silver vibrant."
    ]
  },
  {
    name: "Waffle Plant",
    category: "Indoor",
    sunlight: "Medium to bright indirect light.",
    watering: "Keep soil consistently damp.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "Features highly textured puckered leaves with a metallic purple underside.",
    careTips: [
      "Fabulous for terrariums and warm areas.",
      "Will dramatic collapse when thirsty and bounce back after watering.",
      "Needs high humidity."
    ]
  },
  {
    name: "String of Buttons",
    category: "Succulents",
    sunlight: "Full sun to bright indirect light.",
    watering: "Water thoroughly when soil is fully dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A stacked succulent with stems threaded through triangular blue-green leaves.",
    careTips: [
      "Stems can turn beautiful red along margins in direct sun.",
      "Extremely drought-resistant.",
      "Use clay pots to assist soil drying."
    ]
  },
  {
    name: "Donkey Tail",
    category: "Succulents",
    sunlight: "Bright direct to indirect sunlight.",
    watering: "Water deeply when soil is fully dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A gorgeous trailing succulent with heavy braided tails of teardrop leaves.",
    careTips: [
      "Hang in a permanent spot to avoid leaf drop.",
      "Use porous cactus compost.",
      "Propagates easily from fallen leaves."
    ]
  },
  {
    name: "Blue Star Fern",
    category: "Ferns",
    sunlight: "Low to bright indirect light.",
    watering: "Water when the top inch of soil is dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "An adaptable fern with elongated, wavy fronds of a dusty blue-green color.",
    careTips: [
      "Much easier to care for than the Maidenhair Fern.",
      "Avoid watering the center rosette directly.",
      "Handles lower indoor humidity well."
    ]
  },
  {
    name: "Foxtail Fern",
    category: "Ferns",
    sunlight: "Bright indirect light.",
    watering: "Water when the top inch of soil is dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "An evergreen plant with bushy, plume-like stalks resembling a fox's tail.",
    careTips: [
      "Highly drought-tolerant due to tuberous roots.",
      "Prune outer brown stems at the base.",
      "Keep away from dogs and cats."
    ]
  },
  {
    name: "Thai Basil",
    category: "Herbs",
    sunlight: "At least 6 hours of direct hot sun.",
    watering: "Keep soil moist; water daily in hot weather.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A sturdy culinary herb with purple stems and sweet anise-flavored leaves.",
    careTips: [
      "Harvest leaves from the top down.",
      "Pinch off flower spikes instantly.",
      "Thrives in warm environments."
    ]
  },
  {
    name: "Thyme",
    category: "Herbs",
    sunlight: "Full hot direct sun.",
    watering: "Drought-tolerant; water only when soil is dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A low-growing woody herb with tiny green leaves packed with intense flavor.",
    careTips: [
      "Thrives in dry, sandy rocky soils.",
      "Prune back after flowering to keep it compact.",
      "Excellent container herb."
    ]
  },
  {
    name: "Cilantro",
    category: "Herbs",
    sunlight: "Morning sun with afternoon shade.",
    watering: "Keep soil consistently damp.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A cool-weather culinary herb with highly aromatic tender green leaves.",
    careTips: [
      "Bolts and flowers quickly in hot summer weather.",
      "Grow in deep pots to allow for its taproot.",
      "Sow seeds every 2 weeks for continuous harvest."
    ]
  },
  {
    name: "French Parsley",
    category: "Herbs",
    sunlight: "Bright indirect to direct sun.",
    watering: "Keep soil lightly moist.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A nutritious herb with curled, deeply cut bright green leaves.",
    careTips: [
      "Thrives on kitchen windowsills.",
      "Harvest outer leaves as needed.",
      "Prefers moisture-retaining organic soil."
    ]
  },
  {
    name: "Garden Sage",
    category: "Herbs",
    sunlight: "Full direct sun.",
    watering: "Water deeply when the top inch of soil is dry.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A perennial herb with woody stems and fuzzy, dusty grey-green leaves.",
    careTips: [
      "Avoid overwatering; highly susceptible to mildew.",
      "Excellent companion plant for outdoor garden beds.",
      "Prune woody stems in spring."
    ]
  },
  {
    name: "Spearmint",
    category: "Herbs",
    sunlight: "Partial shade to indirect sun.",
    watering: "Keep soil consistently damp.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A vigorously growing herb that is highly fragrant and great for teas.",
    careTips: [
      "Keep in a separate pot to contain aggressive root runners.",
      "Harvest frequently to promote new leafy shoots.",
      "Dislikes drying out."
    ]
  },
  {
    name: "Dill",
    category: "Herbs",
    sunlight: "Full direct sun.",
    watering: "Water when the top inch of soil is dry.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "A tall herb with feathery, thread-like leaves and bright yellow flower clusters.",
    careTips: [
      "Grows a deep taproot; needs deep containers.",
      "Provide stakes to prevent tall stems from falling.",
      "Sow seeds directly in the pot."
    ]
  },
  {
    name: "Chives",
    category: "Herbs",
    sunlight: "Full sun to partial shade.",
    watering: "Keep soil evenly moist.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A hardy onion family herb with hollow grass-like leaves and purple flowers.",
    careTips: [
      "Edible flowers taste like mild onions.",
      "Cut leaves at the base to harvest.",
      "Grows back rapidly."
    ]
  },
  {
    name: "Lemongrass",
    category: "Herbs",
    sunlight: "Full direct sun.",
    watering: "Water frequently; keep soil moist.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A tall tropical grass with intense citrus-scented stalks, great for tea.",
    careTips: [
      "Needs a large container to spread its roots.",
      "Requires high watering and heat.",
      "Prune old outer leaves to clean up the plant."
    ]
  },
  {
    name: "Calathea Zebra",
    category: "Indoor",
    sunlight: "Filtered, medium indirect shade.",
    watering: "Keep soil evenly moist.",
    petSafe: true,
    difficulty: "Hard",
    shortDescription: "Stunning leaves with dark green tiger stripes and bright purple backs.",
    careTips: [
      "Must have high humidity; dry air causes crispy edges.",
      "Use filtered, room-temperature water only.",
      "Keep in warm, stable draft-free rooms."
    ]
  },
  {
    name: "Calathea Medallion",
    category: "Indoor",
    sunlight: "Consistent indirect light; no sun.",
    watering: "Keep soil damp; sensitive to dry soil.",
    petSafe: true,
    difficulty: "Hard",
    shortDescription: "Stunning round leaves featuring deep emerald green medallions and maroon backs.",
    careTips: [
      "Leaves fold up at night, displaying their dark red back.",
      "Keep away from dry heating units.",
      "Use distilled or rainwater."
    ]
  },
  {
    name: "Velvet Calathea",
    category: "Indoor",
    sunlight: "Medium indirect light.",
    watering: "Keep soil damp; sensitive to drying.",
    petSafe: true,
    difficulty: "Hard",
    shortDescription: "A tall Calathea variety with velvety dark green lanceolate leaves.",
    careTips: [
      "Mist leaves daily or use pebble trays.",
      "Keep in warm rooms above 60F.",
      "Ensure pot has active drainage."
    ]
  },
  {
    name: "String of Bananas Gold",
    category: "Succulents",
    sunlight: "Bright direct to indirect sunlight.",
    watering: "Water thoroughly when soil is dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "The variegated yellow and green string of bananas succulent.",
    careTips: [
      "Needs bright indirect light to maintain yellow variegation.",
      "Allow soil to dry completely.",
      "Easy to propagate in soil."
    ]
  },
  {
    name: "Ric Rac Cactus",
    category: "Succulents",
    sunlight: "Bright indirect light.",
    watering: "Water when the top half of soil dries.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A unique tropical cactus with deep zig-zag stems resembling rick-rack trim.",
    careTips: [
      "Enjoys more humidity than typical desert cacti.",
      "Produces gorgeous pink or white overnight blooms.",
      "Use organic, fast-draining potting soil."
    ]
  },
  {
    name: "Philodendron Heartleaf",
    category: "Indoor",
    sunlight: "Low to bright indirect light.",
    watering: "Water when the top 2 inches dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A beautiful, easy-to-grow trailing vine with emerald green heart leaves.",
    careTips: [
      "Extremely forgiving of low light and dry environments.",
      "Cut vines to propagate easily.",
      "Keep out of reach of pets."
    ]
  },
  {
    name: "Philodendron Brasil",
    category: "Indoor",
    sunlight: "Medium to bright indirect light.",
    watering: "Water when top 2 inches of soil dry out.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A gorgeous vining plant with heart leaves painted with lime and gold stripes.",
    careTips: [
      "Variegation will stay brighter in higher light.",
      "Prune back long stems to keep it bushy.",
      "Highly adaptable to climbing poles."
    ]
  },
  {
    name: "Peperomia Caperata",
    category: "Indoor",
    sunlight: "Medium to low indirect light.",
    watering: "Allow top half of soil to dry before watering.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "Features deeply crinkled, heart-shaped emerald green leaves.",
    careTips: [
      "Extremely sensitive to soggy, heavy soils.",
      "Produces unique mouse-tail like flower spikes.",
      "Stays small and compact."
    ]
  },
  {
    name: "Peperomia Ripple Red",
    category: "Indoor",
    sunlight: "Medium to bright indirect light.",
    watering: "Allow soil to dry out well between waterings.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "A gorgeous compact peperomia with deeply ridged burgundy-red leaves.",
    careTips: [
      "Perfect desk plant; fits in tiny pots.",
      "Does not require high room humidity.",
      "Use porous potting compost."
    ]
  },
  {
    name: "Panda Plant",
    category: "Succulents",
    sunlight: "Bright direct to indirect light.",
    watering: "Water deeply when soil is fully dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A unique succulent with fuzzy, velvet leaves tipped in dark brown spots.",
    careTips: [
      "Excellent plant for kids due to its soft fuzzy leaves.",
      "Do not mist the fuzzy leaves directly.",
      "Provide excellent clay pot drainage."
    ]
  },
  {
    name: "Pencil Cactus",
    category: "Succulents",
    sunlight: "Full hot direct sun.",
    watering: "Extremely drought-tolerant; water once every 4 weeks.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "A large succulent shrub with slender green pencil-like branches.",
    careTips: [
      "Beware: The milky white sap is highly toxic and irritates skin.",
      "Grow in full sun to get bright orange tips ('firesticks').",
      "Needs extremely minimal care."
    ]
  },
  {
    name: "Blue Stars Fern",
    category: "Ferns",
    sunlight: "Medium indirect light.",
    watering: "Keep soil lightly damp.",
    petSafe: true,
    difficulty: "Easy",
    shortDescription: "Dusty blue-green fern with long lobed fronds that is highly resilient.",
    careTips: [
      "Avoid direct noon sun.",
      "Wipe leaves to keep their beautiful blue sheen.",
      "Handles dry air well."
    ]
  },
  {
    name: "Foxtails Fern",
    category: "Ferns",
    sunlight: "Bright, indirect light.",
    watering: "Water when top half dries.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "Stately evergreen with fluffy tail-like branches of light green.",
    careTips: [
      "Highly adaptable to indoor/outdoor spaces.",
      "Requires large pots due to heavy bulbous roots.",
      "Prune dead stems."
    ]
  },
  {
    name: "Basil Genovese",
    category: "Herbs",
    sunlight: "Full direct sun.",
    watering: "Keep soil moist.",
    petSafe: true,
    difficulty: "Medium",
    shortDescription: "The classic large-leaf Italian sweet basil, perfect for pestos.",
    careTips: [
      "Harvest leaves from the top down.",
      "Pinch off flowers instantly.",
      "Keep in bright sunny window."
    ]
  },
  {
    name: "Sweet Mint",
    category: "Herbs",
    sunlight: "Partial shade to full sun.",
    watering: "Water frequently; keep soil damp.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "An incredibly fast-growing herb with crisp green leaves and classic mint aroma.",
    careTips: [
      "Grow in a separate container to contain root spread.",
      "Dislikes drying out.",
      "Pinch back active stems."
    ]
  },
  {
    name: "Ficus Rubber Burgundy",
    category: "Indoor",
    sunlight: "Bright indirect light.",
    watering: "Water when top 2 inches dry.",
    petSafe: false,
    difficulty: "Easy",
    shortDescription: "Burgundy version of the rubber tree with thick, dark leathery leaves.",
    careTips: [
      "Keep away from direct draft vents.",
      "Clean leaves regularly to assist light absorption.",
      "Use well-draining soil."
    ]
  }
];

module.exports = { plantInfoDataset };
