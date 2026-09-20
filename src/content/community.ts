export interface CommunityLocation {
  id: string;
  city: string;
  country: string;
  continent: string;
  latitude: number;
  longitude: number;
  description?: string;
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
];

export const communityLocations: CommunityLocation[] = locations.map(([city, country, continent, latitude, longitude]) => ({ id: city.toLowerCase().replace(/[^a-z]+/g, "-"), city, country, continent, latitude, longitude }));

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
