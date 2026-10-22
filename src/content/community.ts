export const chapterStatuses = {
  expansion_interest: "Expansion interest",
  application_received: "Application received",
  lead_screening: "Lead screening",
  pre_launch: "Pre-launch chapter",
  approved: "Approved chapter",
  active_verified: "Active verified chapter",
  inactive: "Inactive / archived",
  unverified: "Operating status not verified",
} as const;
export type ChapterStatus = keyof typeof chapterStatuses;

export interface CommunityLocation {
  id: string;
  city: string;
  country: string;
  continent: string;
  latitude: number;
  longitude: number;
  description?: string;
  status?: ChapterStatus;
  sourceUrl?: string;
  verifiedAt?: string;
}

// Community locations supplied by the founder; these are not a register of operating chapters.
const locations: [string, string, string, number, number][] = [
  ["New York", "United States", "North America", 40.713, -74.006],
  ["Newark, New Jersey", "United States", "North America", 40.735, -74.172],
  ["Austin, Texas", "United States", "North America", 30.267, -97.743],
  ["Dallas, Texas", "United States", "North America", 32.777, -96.797],
  ["Tampa, Florida", "United States", "North America", 27.951, -82.457],
  ["Orlando, Florida", "United States", "North America", 28.538, -81.379],
  ["Los Angeles", "United States", "North America", 34.052, -118.244],
  ["Las Vegas, Nevada", "United States", "North America", 36.17, -115.14],
  ["Portland, Oregon", "United States", "North America", 45.515, -122.678],
  ["Chicago", "United States", "North America", 41.878, -87.63],
  ["Detroit", "United States", "North America", 42.331, -83.046],
  ["Brasília", "Brazil", "South America", -15.794, -47.882],
  ["Buenos Aires", "Argentina", "South America", -34.604, -58.382],
  ["Paris", "France", "Europe", 48.857, 2.352],
  ["London", "United Kingdom", "Europe", 51.507, -.128],
  ["Bern", "Switzerland", "Europe", 46.948, 7.447],
  ["Stockholm", "Sweden", "Europe", 59.329, 18.069],
  ["Cairo", "Egypt", "Africa", 30.044, 31.236],
  ["Pretoria", "South Africa", "Africa", -25.747, 28.229],
  ["Nairobi", "Kenya", "Africa", -1.292, 36.822],
  ["Dubai", "United Arab Emirates", "Asia", 25.205, 55.271],
  ["Riyadh", "Saudi Arabia", "Asia", 24.714, 46.675],
  ["Bengaluru", "India", "Asia", 12.972, 77.595],
  ["Mumbai", "India", "Asia", 19.076, 72.878],
  ["New Delhi", "India", "Asia", 28.614, 77.209],
  ["Beijing", "China", "Asia", 39.904, 116.407],
  ["Shanghai", "China", "Asia", 31.23, 121.474],
  ["Tokyo", "Japan", "Asia", 35.676, 139.65],
  ["Canberra", "Australia", "Oceania", -35.28, 149.13],
  ["Sydney", "Australia", "Oceania", -33.869, 151.209],
  // Requested expansion candidates; coordinates: Natural Earth populated places (public domain).
  ["Milan", "Italy", "Europe", 45.471921, 9.203063],
  ["Rome", "Italy", "Europe", 41.897902, 12.481313],
  ["Turin", "Italy", "Europe", 45.072333, 7.668015],
  ["Bologna", "Italy", "Europe", 44.500422, 11.340021],
  ["Florence", "Italy", "Europe", 43.780001, 11.250000],
  ["Naples", "Italy", "Europe", 40.841971, 14.243066],
  ["Berlin", "Germany", "Europe", 52.523764, 13.399603],
  ["Munich", "Germany", "Europe", 48.131888, 11.573048],
  ["Amsterdam", "Netherlands", "Europe", 52.351914, 4.914694],
  ["Madrid", "Spain", "Europe", 40.401972, -3.685297],
  ["Barcelona", "Spain", "Europe", 41.385245, 2.181424],
  ["Lisbon", "Portugal", "Europe", 38.724669, -9.146812],
  ["Vienna", "Austria", "Europe", 48.201961, 16.364693],
  ["Prague", "Czechia", "Europe", 50.086967, 14.422939],
  ["Warsaw", "Poland", "Europe", 52.230872, 21.005347],
  ["Copenhagen", "Denmark", "Europe", 55.680510, 12.561540],
  ["Zurich", "Switzerland", "Europe", 47.381934, 8.548064],
  ["Geneva", "Switzerland", "Europe", 46.210008, 6.140028],
  ["Dublin", "Ireland", "Europe", 53.346731, -6.256980],
  ["Oslo", "Norway", "Europe", 59.918636, 10.748033],
  ["Helsinki", "Finland", "Europe", 60.163804, 24.932457],
  ["Brussels", "Belgium", "Europe", 50.835263, 4.331371],
  ["Toronto", "Canada", "North America", 43.664645, -79.389459],
  ["Vancouver", "Canada", "North America", 49.275362, -123.123590],
  ["Montreal", "Canada", "North America", 45.501945, -73.585243],
  ["San Francisco", "United States", "North America", 37.784263, -122.399600],
  ["Boston", "United States", "North America", 42.331906, -71.071960],
  ["Seattle", "United States", "North America", 47.600423, -122.315322],
  ["Mexico City", "Mexico", "North America", 19.444388, -99.132934],
  ["São Paulo", "Brazil", "South America", -23.556734, -46.626966],
  ["Santiago", "Chile", "South America", -33.440205, -70.650504],
  ["Lima", "Peru", "South America", -12.046067, -77.052008],
  ["Bogotá", "Colombia", "South America", 4.598369, -74.085290],
  ["Singapore", "Singapore", "Asia", 1.294979, 103.853875],
  ["Seoul", "South Korea", "Asia", 37.568295, 126.997785],
  ["Kuala Lumpur", "Malaysia", "Asia", 3.139797, 101.688699],
  ["Jakarta", "Indonesia", "Asia", -6.172472, 106.827492],
  ["Bangkok", "Thailand", "Asia", 13.751945, 100.514699],
  ["Manila", "Philippines", "Asia", 14.606105, 120.980271],
  ["Hong Kong", "Hong Kong", "Asia", 22.306927, 114.183064],
  ["Taipei", "Taiwan", "Asia", 25.035833, 121.568333],
  ["Dhaka", "Bangladesh", "Asia", 23.725006, 90.406634],
  ["Lagos", "Nigeria", "Africa", 6.445208, 3.389585],
  ["Accra", "Ghana", "Africa", 5.551980, -0.218662],
  ["Cape Town", "South Africa", "Africa", -33.918065, 18.433042],
  ["Johannesburg", "South Africa", "Africa", -26.168099, 28.028064],
  ["Casablanca", "Morocco", "Africa", 33.601922, -7.618313],
  ["Melbourne", "Australia", "Oceania", -37.818086, 144.973070],
  ["Auckland", "New Zealand", "Oceania", -36.848055, 174.763027],
];

export const communityLocations: CommunityLocation[] = locations.map(([city, country, continent, latitude, longitude]) => ({ id: city === "Brasília" ? "bras-lia" : city.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, ""), city, country, continent, latitude, longitude, status: "expansion_interest", description: "Proposed community location. An operating chapter has not been verified.", sourceUrl: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/", verifiedAt: "2026-10-16" }));

export const affiliations = ["Stanford", "MIT", "UChicago", "NYU", "J.P. Morgan", "BlackRock", "Citi", "Jane Street", "Hillhouse Capital", "The Wall Street Journal"];

export const plannedPrograms = [
  { title: "Student cost-of-living observatory", detail: "Compare the everyday cost of being a student across cities, with transparent price baskets and local context." },
  { title: "Digital payments field lab", detail: "Study what makes payments genuinely useful: access, reliability, fees, and consumer confidence." },
  { title: "Youth economic outlook", detail: "Explore how young people think about work, education, inflation, and their financial futures." },
  { title: "Open company research studio", detail: "Learn to read filings, understand business models, and build thoughtful company and sector analyses." },
  { title: "Public policy explainers", detail: "Turn economic policy into clear, approachable guides that connect decisions to everyday life." },
  { title: "Financial education translations", detail: "Help bring practical lessons to more learners in the languages they use at home." },
  { title: "Community teaching fellowship", detail: "Support student educators as they design, deliver, and reflect on local learning sessions." },
  { title: "Climate & transition economics", detail: "Investigate the economics of energy, adaptation, and the costs and benefits of a changing economy." },
  { title: "Open economics data studio", detail: "Create readable charts, reusable datasets, and small tools for asking better economic questions." },
];

// This consolidated published intake accepts chapter interest; it does not confer leadership or chapter status.
export const chapterInterestUrl = "https://tally.so/r/kbayyj";
