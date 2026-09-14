import { PDRR_PHOTOS } from './pdrrImages';

export interface FocusArea {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export interface ImpactMetric {
  label: string;
  value: string;
  suffix: string;
  change: string;
  color: string;
}

export interface Achievement {
  id: string;
  title: string;
  value: string;
  badge: string;
  metric: string;
  description: string;
  highlight: string;
  color: string;
}

export interface ClubInitiative {
  id: string;
  title: string;
  category: string;
  impact: string;
  date: string;
  description: string;
  beneficiaries: string;
}

export interface DistrictClub {
  id: string;
  slug?: string;
  name: string;
  shortName: string;
  zone: string;
  lat: number;
  lng: number;
  location?: string;
  address?: string;
  president: string;
  isDirector: string;
  phone: string;
  email: string;
  rotaryId: string;
  secretary: string;
  secretaryEmail: string;
  secretaryPhone: string;
  initiatives: ClubInitiative[];
  brief?: string;
  charterYear?: number | string | null;
  members?: string;
  memberCount?: number;
}

export interface PastDrr {
  id: string;
  srNo: number;
  year: string;
  tenure: string;
  name: string;
  district: string;
  districtEra: string;
  homeClub: string;
  photo: string | null;
  hasPhoto: boolean;
}

export interface DistrictLeader {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  category: string;
  photo: string;
  order: number;
}

export interface ResourceSublink {
  name: string;
  type: string;
}

export interface ResourceSubfolder {
  name: string;
  url: string;
  description: string;
}

export interface DistrictResource {
  id: string;
  title: string;
  category: string;
  description: string;
  driveUrl: string;
  badge: string;
  isRoot?: boolean;
  sublinks?: ResourceSublink[];
  subfolders?: ResourceSubfolder[];
}

export const ZONE_ID_TO_NAME: Record<string, string> = {
  'cmtn8hw19001ill1sl3gxhvjc': 'Zone Prithvi',
  'cmtn8hw0y001dll1sbp1tvm6i': 'Zone Prithvi',
  'cmtn8hw17001hll1sgpqjgrai': 'Zone Agni',
  'cmtn8hw12001ell1sdyds6zsz': 'Zone Agni',
  'cmtn8hw1b001jll1sidh151lv': 'Zone Vayu',
  'cmtn8hw14001fll1s69dnbafe': 'Zone Vayu',
  'cmtn8hw1d001kll1soabcfcmd': 'Zone Akash',
  'cmtn8hw16001gll1sqctt3qv7': 'Zone Akash',
};

export const ROTARY_FOCUS_AREAS: FocusArea[] = [
  {
    id: "peace",
    name: "Peacebuilding and conflict prevention",
    color: "#D81B60",
    icon: "ShieldCheck",
    description: "Training youth leaders and creating safe, inclusive spaces for community dialogue."
  },
  {
    id: "disease",
    name: "Disease prevention and treatment",
    color: "#D81B60",
    icon: "HeartPulse",
    description: "Free medical camps, mega blood donation drives, and pediatric health equity."
  },
  {
    id: "water",
    name: "Water, sanitation, and hygiene (WASH)",
    color: "#D81B60",
    icon: "Droplets",
    description: "Installing commercial RO plants and sanitation facilities in rural government schools."
  },
  {
    id: "maternal",
    name: "Maternal and child health",
    color: "#D81B60",
    icon: "Sparkles",
    description: "Menstrual dignity workshops, pad distribution, and pediatric health equity."
  },
  {
    id: "education",
    name: "Basic education and literacy",
    color: "#D81B60",
    icon: "BookOpen",
    description: "Setting up smart classrooms, digital tablet labs, and adult literacy drives."
  },
  {
    id: "economy",
    name: "Community economic development",
    color: "#D81B60",
    icon: "TrendingUp",
    description: "Skill development centers and micro-grants for women and youth entrepreneurs."
  },
  {
    id: "environment",
    name: "Supporting the environment",
    color: "#D81B60",
    icon: "Leaf",
    description: "Miyawaki urban micro-forest plantations, clean water care, solar panels, and e-waste recycling."
  }
];

// Only figures the district can evidence from its own roster. Anything without a
// verifiable source (money raised, lives impacted, blood units) stays off the site.
export const IMPACT_METRICS: ImpactMetric[] = [
  { label: "Active Clubs", value: "75", suffix: "Clubs", change: "RY 2026-27", color: "#123499" },
  { label: "Zones", value: "4", suffix: "Zones", change: "RY 2026-27", color: "#D81B60" },
  { label: "Clubs Chartered", value: "5", suffix: "Clubs", change: "RY 2026-27", color: "#880E4F" }
];

export const DISTRICT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    title: "Clubs Chartered During the Year",
    value: "New Clubs",
    badge: "Charter Expansion",
    metric: "Active Charters",
    description: "New community & campus Rotaract clubs chartered during the year, expanding youth leadership and service reach across Delhi NCR.",
    highlight: "Clubs Chartered During the Year",
    color: "#D81B60"
  },
  {
    id: "ach-2",
    title: "100% Attendance at DOLS",
    value: "100%",
    badge: "Leadership Milestone",
    metric: "Full Attendance",
    description: "100% attendance achieved at the District Officers Leadership Seminar (DOLS), demonstrating unwavering commitment across the district team.",
    highlight: "100% Attendance at DOLS",
    color: "#123499"
  },
  {
    id: "ach-3",
    title: "500+ Participation at District Installation",
    value: "500+",
    badge: "District Fellowship",
    metric: "Delegates & Leaders",
    description: "Over 500+ attendees celebrated the dawn of RY 2026–27 at the District Installation Ceremony, uniting clubs across all 4 zones.",
    highlight: "500+ Participation at District Installation",
    color: "#D81B60"
  },
  {
    id: "ach-4",
    title: "CLLS and PLS/SLS Conducted",
    value: "Full Slate",
    badge: "Training Excellence",
    metric: "Leadership Seminars",
    description: "Club Leaders Leadership Seminar (CLLS) and President/Secretary Leadership Seminars (PLS/SLS) successfully conducted with comprehensive training.",
    highlight: "CLLS & PLS/SLS Conducted",
    color: "#880E4F"
  }
];

export const INITIAL_CLUBS: DistrictClub[] = [
  {
    "id": "c1",
    "slug": "apeejay-stya-university",
    "name": "Rotaract Club of Apeejay Stya University",
    "shortName": "Apeejay Stya University",
    "zone": "Zone Prithvi",
    "lat": 28.257,
    "lng": 77.0673,
    "location": "Sohna, Gurugram",
    "address": "APEEJAY STYA UNIVERSITY, Palwal - Sohna Rd, Gurugram, Haryana 122103",
    "president": "Rtr. Philip J. Dolo",
    "isDirector": "",
    "phone": "",
    "email": "racasu.apeejay@gmail.com",
    "rotaryId": "8823523",
    "secretary": "Rtr. Aryan Pandey",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2021,
    "initiatives": []
  },
  {
    "id": "c2",
    "slug": "college-of-vocational-studies",
    "name": "Rotaract Club of College of Vocational Studies",
    "shortName": "College of Vocational Studies",
    "zone": "Zone Prithvi",
    "lat": 28.5372,
    "lng": 77.2285,
    "location": "Sheikh Sarai, Delhi",
    "address": "COLLEGE OF VOCATIONAL STUDIESDELHI, 110017, IndiaDelhi",
    "president": "Rtr. Jubin Sabu",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubofcvs@gmail.com",
    "rotaryId": "216041",
    "secretary": "Rtr. Mohd Arham",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2018,
    "initiatives": []
  },
  {
    "id": "c3",
    "slug": "davim",
    "name": "Rotaract Club of DAVIM",
    "shortName": "DAVIM",
    "zone": "Zone Prithvi",
    "lat": 28.3888,
    "lng": 77.2989,
    "location": "Faridabad",
    "address": "DAV institute of managementNew industrial townFaridabad, 121002, IndiaHaryana",
    "president": "Rtr. Kartik Kalra",
    "isDirector": "",
    "phone": "",
    "email": "racdavim20@gmail.com",
    "rotaryId": "215193",
    "secretary": "Rtr. Sania Khatter",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2017,
    "initiatives": []
  },
  {
    "id": "c4",
    "slug": "delhi-capital-circle",
    "name": "Rotaract Club of Delhi Capital Circle",
    "shortName": "Delhi Capital Circle",
    "zone": "Zone Vayu",
    "lat": 28.8955,
    "lng": 76.6066,
    "location": "Rohtak",
    "address": "15 Liberty Jop Square MallDelhi RoadRohtak, 124001, IndiaHaryana",
    "president": "Rtr. Arnav Jain",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubdelhicapitalcircle@gmail.com",
    "rotaryId": "8828423",
    "secretary": "Rtr. Ananya Gupta",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2026,
    "initiatives": []
  },
  {
    "id": "c5",
    "slug": "delhi-catalyst",
    "name": "Rotaract Club of Delhi Catalyst",
    "shortName": "Delhi Catalyst",
    "zone": "Zone Agni",
    "lat": 28.6562,
    "lng": 77.2307,
    "location": "Chandni Chowk, Delhi",
    "address": "Chandni ChowkDelhi, 110006, IndiaDelhi",
    "president": "Rtr. Daksh Sharma",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubofdelhicatalyst@gmail.com",
    "rotaryId": "8828587",
    "secretary": "Rtr. Tanya Tiwari",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2026,
    "initiatives": []
  },
  {
    "id": "c6",
    "slug": "delhi-dynamic-leaders",
    "name": "Rotaract Club of Delhi Dynamic Leaders",
    "shortName": "Delhi Dynamic Leaders",
    "zone": "Zone Vayu",
    "lat": 28.6852,
    "lng": 77.1352,
    "location": "Rani Bagh, Delhi",
    "address": "House No. WZ 112CStreeet No. 1, Sri NagarRani BaghNew Delhi, 110034, IndiaDelhi",
    "president": "Rtr. Tanya Khanna",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubofdynamicleaders@gmail.com",
    "rotaryId": "8825852",
    "secretary": "Rtr. Kamakshi Aggarwal",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2023,
    "initiatives": []
  },
  {
    "id": "c7",
    "slug": "delhi-elite",
    "name": "Rotaract Club of Delhi Elite",
    "shortName": "Delhi Elite",
    "zone": "Zone Agni",
    "lat": 28.6289,
    "lng": 77.2065,
    "location": "Delhi",
    "address": "delhi, India",
    "president": "Rtr. Ghazal Sapra",
    "isDirector": "",
    "phone": "",
    "email": "rotaractdelhielite@gmail.com",
    "rotaryId": "217240",
    "secretary": "Rtr. Rishabh Babber",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2019,
    "initiatives": []
  },
  {
    "id": "c8",
    "slug": "delhi-genesis",
    "name": "Rotaract Club of Delhi Genesis",
    "shortName": "Delhi Genesis",
    "zone": "Zone Vayu",
    "lat": 28.6852,
    "lng": 77.1352,
    "location": "Rani Bagh, Delhi",
    "address": "WZ 298 Street - 4 Sri Nagar, Rani baghNew Delhi, 110034, IndiaDelhi",
    "president": "Rtr. Rishi Upadhyay",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubofdelhigenesis@gmail.com",
    "rotaryId": "8827498",
    "secretary": "Rtr. Swadha Goswami",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2025,
    "initiatives": []
  },
  {
    "id": "c9",
    "slug": "delhi-genesis-midwest",
    "name": "Rotaract Club of Delhi Genesis Midwest",
    "shortName": "Delhi Genesis Midwest",
    "zone": "Zone Vayu",
    "lat": 28.6852,
    "lng": 77.1352,
    "location": "Rani Bagh, Delhi",
    "address": "5082, ATS KOCOONSector 109Near Dwarka ExpresswayGurugram, 122017, IndiaHaryana",
    "president": "Rtr. Aditi Singhal",
    "isDirector": "",
    "phone": "",
    "email": "racgenesismidwest@gmail.com",
    "rotaryId": "8826199",
    "secretary": "Rtr. Manvi Khajuria",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2024,
    "initiatives": []
  },
  {
    "id": "c10",
    "slug": "delhi-heights",
    "name": "Rotaract Club of Delhi Heights",
    "shortName": "Delhi Heights",
    "zone": "Zone Prithvi",
    "lat": 28.5726,
    "lng": 77.2223,
    "location": "Arjun Nagar, Delhi",
    "address": "825/4 Arjun NagarNew Delhi, 110003, IndiaDelhi",
    "president": "Rtr. Yash Satija",
    "isDirector": "",
    "phone": "",
    "email": "rtrdelhiheights@gmail.com",
    "rotaryId": "8826601",
    "secretary": "Rtr. Anshita Jain",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2024,
    "initiatives": []
  },
  {
    "id": "c11",
    "slug": "delhi-imperia",
    "name": "Rotaract Club of Delhi Imperia",
    "shortName": "Delhi Imperia",
    "zone": "Zone Akash",
    "lat": 28.6219,
    "lng": 77.0583,
    "location": "Uttam Nagar, Delhi",
    "address": "D38/39, Near Blues and Pinks Play Way SchoolUttam NagarDelhi, 110059, IndiaDelhi",
    "president": "Rtr. Kinjal Goyal",
    "isDirector": "",
    "phone": "",
    "email": "rotaract.imperia@gmail.com",
    "rotaryId": "8828605",
    "secretary": "Rtr. Christie Grover",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2026,
    "initiatives": []
  },
  {
    "id": "c12",
    "slug": "delhi-janak",
    "name": "Rotaract Club of Delhi Janak",
    "shortName": "Delhi Janak",
    "zone": "Zone Prithvi",
    "lat": 28.5678,
    "lng": 77.2433,
    "location": "Lajpat Nagar, Delhi",
    "address": "F 155 Lajpat Nagar 1New Delhi, 110024, IndiaDelhi",
    "president": "Rtr. Tanushka Arora",
    "isDirector": "",
    "phone": "",
    "email": "racdelhijanakrid3011@gmail.com",
    "rotaryId": "212976",
    "secretary": "Rtr. Aditya Dev",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2015,
    "initiatives": []
  },
  {
    "id": "c13",
    "slug": "delhi-maims",
    "name": "Rotaract Club of Delhi MAIMS",
    "shortName": "Delhi MAIMS",
    "zone": "Zone Vayu",
    "lat": 28.718,
    "lng": 77.068,
    "location": "Rohini, Delhi",
    "address": "Maharaja Agrasen Institute of Management Studies, Pocket 5, Sector 22, Rohini, Delhi, 110086",
    "president": "Rtr. Jagruti Dhoundiyal",
    "isDirector": "",
    "phone": "",
    "email": "rotaract@maims.ac.in",
    "rotaryId": "8825116",
    "secretary": "Rtr. Anaye Bhalla",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2022,
    "initiatives": []
  },
  {
    "id": "c14",
    "slug": "delhi-manthan",
    "name": "Rotaract Club of Delhi Manthan",
    "shortName": "Delhi Manthan",
    "zone": "Zone Agni",
    "lat": 28.6139,
    "lng": 77.209,
    "location": "Delhi",
    "address": "Delhi, India",
    "president": "Rtr. Himank Anand",
    "isDirector": "",
    "phone": "",
    "email": "rac.delhi.manthan@gmail.com",
    "rotaryId": "8828642",
    "secretary": "Rtr. Avishi Sharma",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2026,
    "initiatives": []
  },
  {
    "id": "c15",
    "slug": "delhi-midtown-maitreyi",
    "name": "Rotaract Club of Delhi Midtown Maitreyi",
    "shortName": "Delhi Midtown Maitreyi",
    "zone": "Zone Agni",
    "lat": 28.5916,
    "lng": 77.1728,
    "location": "Chanakyapuri, Delhi",
    "address": "Maitreyi CollegeJesus and Mary MargBa;pu Dham, ChanakyapuriDelhi, 110021, India",
    "president": "Rtr. Srishty Goyal",
    "isDirector": "",
    "phone": "",
    "email": "rotaractmaitreyi@gmail.com",
    "rotaryId": "8826105",
    "secretary": "Rtr. Divyanjali Rai",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2023,
    "initiatives": []
  },
  {
    "id": "c16",
    "slug": "delhi-rajdhani",
    "name": "Rotaract Club of Delhi Rajdhani",
    "shortName": "Delhi Rajdhani",
    "zone": "Zone Agni",
    "lat": 28.608,
    "lng": 77.428,
    "location": "Noida Extension",
    "address": "B1-704, Redicon Vedantam, Sector-16C,Noida Extension, 201309, IndiaUttar Pradesh",
    "president": "Rtr. Deeta Chandhok",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubofdelhirajdhani@gmail.com",
    "rotaryId": "212618",
    "secretary": "",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2015,
    "initiatives": []
  },
  {
    "id": "c17",
    "slug": "delhi-south",
    "name": "Rotaract Club of Delhi South",
    "shortName": "Delhi South",
    "zone": "Zone Prithvi",
    "lat": 28.5355,
    "lng": 77.241,
    "location": "South Delhi",
    "address": "Delhi, India",
    "president": "Rtr. Tamanna Goyal",
    "isDirector": "",
    "phone": "",
    "email": "rotaract.delhisouth@gmail.com",
    "rotaryId": "5211",
    "secretary": "Rtr. Tarika Gupta",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 1972,
    "initiatives": []
  },
  {
    "id": "c18",
    "slug": "delhi-south-central",
    "name": "Rotaract Club of Delhi South Central",
    "shortName": "Delhi South Central",
    "zone": "Zone Prithvi",
    "lat": 28.5355,
    "lng": 77.241,
    "location": "South Delhi",
    "address": "Delhi, India",
    "president": "Rtr. Yashika Kapoor",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubdelhisouthcentral@gmail.com",
    "rotaryId": "8823652",
    "secretary": "Rtr. Srishti Kekti",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2021,
    "initiatives": []
  },
  {
    "id": "c19",
    "slug": "delhi-south-east",
    "name": "Rotaract Club of Delhi South East",
    "shortName": "Delhi South East",
    "zone": "Zone Prithvi",
    "lat": 28.5355,
    "lng": 77.241,
    "location": "South Delhi",
    "address": "F-25/11, Dilshad ColonyDelhi, 110095, IndiaDelhi",
    "president": "Rtr. Gunpreet Singh",
    "isDirector": "",
    "phone": "",
    "email": "racdelhisoutheast@gmail.com",
    "rotaryId": "8826153",
    "secretary": "Rtr. Aryan Sanjeev",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2024,
    "initiatives": []
  },
  {
    "id": "c20",
    "slug": "delhi-southend-next",
    "name": "Rotaract Club of Delhi Southend Next",
    "shortName": "Delhi Southend Next",
    "zone": "Zone Prithvi",
    "lat": 28.5355,
    "lng": 77.241,
    "location": "South Delhi",
    "address": "",
    "president": "Rtr. Amritesh Pandey",
    "isDirector": "",
    "phone": "",
    "email": "",
    "rotaryId": "None",
    "secretary": "Rtr. Happy Kumar",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": None,
    "initiatives": []
  },
  {
    "id": "c21",
    "slug": "delhi-yuva",
    "name": "Rotaract Club of Delhi Yuva",
    "shortName": "Delhi Yuva",
    "zone": "Zone Akash",
    "lat": 28.5921,
    "lng": 77.046,
    "location": "Dwarka, Delhi",
    "address": "Dwarka, Delhi",
    "president": "Rtr. Lalit Panghal",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubofdelhiyuva@gmail.com",
    "rotaryId": "8825160",
    "secretary": "Rtr. Nitika Khatri",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2022,
    "initiatives": []
  },
  {
    "id": "c22",
    "slug": "dpsru",
    "name": "Rotaract Club of DPSRU",
    "shortName": "DPSRU",
    "zone": "Zone Prithvi",
    "lat": 28.5244,
    "lng": 77.242,
    "location": "Pushp Vihar, Delhi",
    "address": "Delhi Pharmaceutical Sciences and Research UniversityMehrauli-Badarpur RoadPushp Vihar, Sector-3New Delhi, 110017, India",
    "president": "Rtr. Ashif Khan",
    "isDirector": "",
    "phone": "",
    "email": "rcdpsru@gmail.com",
    "rotaryId": "217457",
    "secretary": "Rtr. Gauri Sharma",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2019,
    "initiatives": []
  },
  {
    "id": "c23",
    "slug": "dtu-regency",
    "name": "Rotaract Club of DTU Regency",
    "shortName": "DTU Regency",
    "zone": "Zone Vayu",
    "lat": 28.7499,
    "lng": 77.117,
    "location": "Bawana Road, Delhi",
    "address": "Delhi Technolgical University,Shahbad Daulatpur, Main Bawana Road, DelhiIndiaNew Delhi, 110042, India",
    "president": "Rtr. Abhinav Jha",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubdtu@gmail.com",
    "rotaryId": "89542",
    "secretary": "Rtr. Shayna Sharma",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2011,
    "initiatives": []
  },
  {
    "id": "c24",
    "slug": "dusc",
    "name": "Rotaract Club of DUSC",
    "shortName": "DUSC",
    "zone": "Zone Vayu",
    "lat": 28.69,
    "lng": 77.21,
    "location": "Delhi University, Delhi",
    "address": "Delhi, India",
    "president": "Rtr. Sehajleen Kaur",
    "isDirector": "",
    "phone": "",
    "email": "rotaractdusc@gmail.com",
    "rotaryId": "218073",
    "secretary": "Rtr. Lakshita Bansal",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2020,
    "initiatives": []
  },
  {
    "id": "c25",
    "slug": "galgotias-educational-institutions",
    "name": "Rotaract Club of Galgotias Educational Institutions",
    "shortName": "Galgotias Educational Institutions",
    "zone": "Zone Agni",
    "lat": 28.3639,
    "lng": 77.5401,
    "location": "Greater Noida",
    "address": "Galgotias UniversityPlot No. 2, Sector 17-AGautam Budha NagarGreater Noida, 203201, IndiaUttar Pradesh",
    "president": "Rtr. Kushagra Yadav",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclub.galgotiasuniversity@gmail.com",
    "rotaryId": "None",
    "secretary": "Rtr. Jahanvi Panwar",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": None,
    "initiatives": []
  },
  {
    "id": "c26",
    "slug": "ilmaura",
    "name": "Rotaract Club of Ilmaura",
    "shortName": "Ilmaura",
    "zone": "Zone Agni",
    "lat": 28.61,
    "lng": 77.23,
    "location": "Delhi",
    "address": "",
    "president": "Rtr. Mansi Mishra",
    "isDirector": "",
    "phone": "",
    "email": "",
    "rotaryId": "None",
    "secretary": "Rtr. Sai Dhinesh S",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": None,
    "initiatives": []
  },
  {
    "id": "c27",
    "slug": "indira-gandhi-delhi-technical-university-for-women",
    "name": "Rotaract Club of Indira Gandhi Delhi Technical University for Women",
    "shortName": "Indira Gandhi Delhi Technical University for Women",
    "zone": "Zone Vayu",
    "lat": 28.6653,
    "lng": 77.2325,
    "location": "Kashmere Gate, Delhi",
    "address": "Indira Gandhi Delhi Technical University for WomenKashmere GateNear St. James ChurchNew Delhi, 110006, IndiaDelhi",
    "president": "Rtr. Harshita Gupta",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubigdtuw@gmail.com",
    "rotaryId": "212955",
    "secretary": "Rtr. Khushi Yadav",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2015,
    "initiatives": []
  },
  {
    "id": "c28",
    "slug": "ingenious-minds",
    "name": "Rotaract Club of Ingenious Minds",
    "shortName": "Ingenious Minds",
    "zone": "Zone Vayu",
    "lat": 28.715,
    "lng": 77.176,
    "location": "Azadpur, Delhi",
    "address": "C-114, M2K VICTORIA GARDENSAZADPURNew Delhi, 110033, IndiaDelhi",
    "president": "Rtr. Meher Kapoor",
    "isDirector": "",
    "phone": "",
    "email": "rac.ingeniousminds@gmail.com",
    "rotaryId": "218201",
    "secretary": "",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2020,
    "initiatives": []
  },
  {
    "id": "c29",
    "slug": "kirori-mal-college",
    "name": "Rotaract Club of Kirori Mal College",
    "shortName": "Kirori Mal College",
    "zone": "Zone Vayu",
    "lat": 28.6853,
    "lng": 77.209,
    "location": "North Campus, Delhi",
    "address": "Kirori Mal College, University of Delhi, Department of CommerceDelhi, 10007, IndiaDelhi",
    "president": "Rtr. Suvanshi Deb",
    "isDirector": "",
    "phone": "",
    "email": "rotaractkmcdelhi@gmail.com",
    "rotaryId": "8828216",
    "secretary": "Rtr. Vaishnavi Mishra",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2026,
    "initiatives": []
  },
  {
    "id": "c30",
    "slug": "lakshmibai-college",
    "name": "Rotaract Club of Lakshmibai College",
    "shortName": "Lakshmibai College",
    "zone": "Zone Vayu",
    "lat": 28.689,
    "lng": 77.181,
    "location": "Ashok Vihar, Delhi",
    "address": "Lakshmibai College, Delhi UniversityAshok Vihar Phase 3Satyawati ColonyDelhi, 110052, India",
    "president": "Rtr. Garima Malviya",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubviranganas@gmail.com",
    "rotaryId": "8826646",
    "secretary": "Rtr. Krishika Bindal",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2024,
    "initiatives": []
  },
  {
    "id": "c31",
    "slug": "maharaja-agarsain",
    "name": "Rotaract Club of Maharaja Agarsain",
    "shortName": "Maharaja Agarsain",
    "zone": "Zone Agni",
    "lat": 28.57,
    "lng": 77.32,
    "location": "Noida",
    "address": "Noida, Delhi NCRncr, India",
    "president": "Rtr. Ananya Kuchhal",
    "isDirector": "",
    "phone": "",
    "email": "racma3011@gmail.com",
    "rotaryId": "216061",
    "secretary": "Rtr. Mishti Bansal",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2018,
    "initiatives": []
  },
  {
    "id": "c32",
    "slug": "meraki",
    "name": "Rotaract Club of Meraki",
    "shortName": "Meraki",
    "zone": "Zone Akash",
    "lat": 28.4595,
    "lng": 77.0266,
    "location": "Gurugram, Haryana",
    "address": "Haryana, India",
    "president": "Rtr. Dipanita Das",
    "isDirector": "",
    "phone": "",
    "email": "racmeraki@gmail.com",
    "rotaryId": "8823679",
    "secretary": "Rtr. Afifa Rubani",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2021,
    "initiatives": []
  },
  {
    "id": "c33",
    "slug": "national-association-for-blind",
    "name": "Rotaract Club of National Association for Blind",
    "shortName": "National Association for Blind",
    "zone": "Zone Prithvi",
    "lat": 28.5667,
    "lng": 77.175,
    "location": "RK Puram, Delhi",
    "address": "National Association for BlindSector 5Ramakrishna PuramNew Delhi, 110022, India",
    "president": "Rtr. Harpreet Singh Dua",
    "isDirector": "",
    "phone": "",
    "email": "rotaractnab@gmail.com",
    "rotaryId": "8827485",
    "secretary": "Rtr. Inderpreet Singh",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2025,
    "initiatives": []
  },
  {
    "id": "c34",
    "slug": "ndim",
    "name": "Rotaract Club of NDIM",
    "shortName": "NDIM",
    "zone": "Zone Prithvi",
    "lat": 28.518,
    "lng": 77.243,
    "location": "Tughlakabad / MB Road, Delhi",
    "address": "50 & 60 (B&C,Mehrauli Badarpur Rd, Batra Hospital, Vayusenabad, DelhiDelhi, 110062, India",
    "president": "Rtr. Tushar Chaudhary",
    "isDirector": "",
    "phone": "",
    "email": "ndimrotaract@gmail.com",
    "rotaryId": "216303",
    "secretary": "Rtr. Kanishka Singh",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2018,
    "initiatives": []
  },
  {
    "id": "c35",
    "slug": "new-delhi",
    "name": "Rotaract Club of New Delhi",
    "shortName": "New Delhi",
    "zone": "Zone Akash",
    "lat": 28.632,
    "lng": 77.108,
    "location": "Hari Nagar, Delhi",
    "address": "Wz-431, Nanak Pura, Hari NagarNew Delhi-110064new delhi, 110064, IndiaDelhi",
    "president": "Rtr. Ashmeet Kaur Anand",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclubofnewdelhi3011@gmail.com",
    "rotaryId": "5141",
    "secretary": "Rtr. Bhavneet Kaur",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2009,
    "initiatives": []
  },
  {
    "id": "c36",
    "slug": "nsit-regency",
    "name": "Rotaract Club of NSIT Regency",
    "shortName": "NSIT Regency",
    "zone": "Zone Akash",
    "lat": 28.609,
    "lng": 77.037,
    "location": "Dwarka Sector 3, Delhi",
    "address": "Netaji Subhas University CampusDwarka, Sector-3New Delhi, 110078, IndiaDelhi",
    "president": "Rtr. Aman Devedi",
    "isDirector": "",
    "phone": "",
    "email": "rotaract.nsit.09@gmail.com",
    "rotaryId": "84694",
    "secretary": "Rtr. Gayatri Rana",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2009,
    "initiatives": []
  },
  {
    "id": "c37",
    "slug": "resilience",
    "name": "Rotaract Club of Resilience",
    "shortName": "Resilience",
    "zone": "Zone Prithvi",
    "lat": 28.53,
    "lng": 77.21,
    "location": "Malviya Nagar, Delhi",
    "address": "Malviya NagarNew Delhi, 110017, IndiaDelhi",
    "president": "Rtr. Aditi Singhal",
    "isDirector": "",
    "phone": "",
    "email": "rac.resilience@gmail.com",
    "rotaryId": "8824372",
    "secretary": "Rtr. Shreshth Kaushik",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2021,
    "initiatives": []
  },
  {
    "id": "c38",
    "slug": "rever",
    "name": "Rotaract Club of Rever",
    "shortName": "Rever",
    "zone": "Zone Agni",
    "lat": 28.61,
    "lng": 77.2,
    "location": "Delhi",
    "address": "Delhi, India",
    "president": "Rtr. Aarshi Lohia",
    "isDirector": "",
    "phone": "",
    "email": "rotaractrever@gmail.com",
    "rotaryId": "218552",
    "secretary": "Rtr. Bhavika Ghai",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2020,
    "initiatives": []
  },
  {
    "id": "c39",
    "slug": "shri-ram-college-of-commerce",
    "name": "Rotaract Club of Shri Ram College of Commerce",
    "shortName": "Shri Ram College of Commerce",
    "zone": "Zone Vayu",
    "lat": 28.689,
    "lng": 77.205,
    "location": "Maurice Nagar, Delhi",
    "address": "Shri Ram College of CommerceMaurice Nagar, Roop NagarNew Delhi, 110007, IndiaDelhi",
    "president": "Rtr. Srishty Priya",
    "isDirector": "",
    "phone": "",
    "email": "rotaract.srccofficial@gmail.com",
    "rotaryId": "8827675",
    "secretary": "Rtr. Rishika Ranjan",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2025,
    "initiatives": []
  },
  {
    "id": "c40",
    "slug": "sri-guru-gobind-singh-college-of-commerce",
    "name": "Rotaract Club of Sri Guru Gobind Singh College of Commerce",
    "shortName": "Sri Guru Gobind Singh College of Commerce",
    "zone": "Zone Vayu",
    "lat": 28.697,
    "lng": 77.142,
    "location": "Pitampura, Delhi",
    "address": "Sri Guru Gobind Singh College Of CommercePitampuraNew delhi, 110034, IndiaDelhi",
    "president": "Rtr. Janav Panjwani",
    "isDirector": "",
    "phone": "",
    "email": "rc.sggscc@gmail.com",
    "rotaryId": "88900",
    "secretary": "Rtr. Anoushka Nayyar",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2010,
    "initiatives": []
  },
  {
    "id": "c41",
    "slug": "sri-guru-teg-bahadur-khalsa-college",
    "name": "Rotaract Club of Sri Guru Teg Bahadur Khalsa College",
    "shortName": "Sri Guru Teg Bahadur Khalsa College",
    "zone": "Zone Vayu",
    "lat": 28.693,
    "lng": 77.208,
    "location": "North Campus, Delhi",
    "address": "Sri Guru Tegh Bahadur Khalsa College, North DelhiDelhi, 110007, IndiaDelhi",
    "president": "Rtr. Anshdeep Singh",
    "isDirector": "",
    "phone": "",
    "email": "rc.sgtb@gmail.com",
    "rotaryId": "8826337",
    "secretary": "Rtr. Bhavya Singh Bhandari",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2024,
    "initiatives": []
  },
  {
    "id": "c42",
    "slug": "sushant-university",
    "name": "Rotaract Club of Sushant University",
    "shortName": "Sushant University",
    "zone": "Zone Akash",
    "lat": 28.4283,
    "lng": 77.1062,
    "location": "Gurugram",
    "address": "Sushant UniversityGolf Course RoadSector 55Gurugram, 122003, India",
    "president": "Rtr. Danish Kaul",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclub@sushantuniversity.edu.in",
    "rotaryId": "218560",
    "secretary": "Rtr. Ashutosh Bhandari",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2020,
    "initiatives": []
  },
  {
    "id": "c43",
    "slug": "the-north-cap-university",
    "name": "Rotaract Club of The North'Cap University",
    "shortName": "The North'Cap University",
    "zone": "Zone Akash",
    "lat": 28.5036,
    "lng": 77.0504,
    "location": "Gurugram",
    "address": "The NorthCap UniversityGurgaon, , IndiaHaryana",
    "president": "Rtr. Devina Sharma",
    "isDirector": "",
    "phone": "",
    "email": "racncu@gmail.com",
    "rotaryId": "214806",
    "secretary": "Rtr. Aryan Yadav",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2017,
    "initiatives": []
  },
  {
    "id": "c44",
    "slug": "trinity-institute-dwarka",
    "name": "Rotaract Club of Trinity Institute Dwarka",
    "shortName": "Trinity Institute Dwarka",
    "zone": "Zone Akash",
    "lat": 28.583,
    "lng": 77.06,
    "location": "Dwarka Sector 9, Delhi",
    "address": "Institutional Area, Dwarka Sector 9, Dwarka, New Delhi, Delhi, 110075",
    "president": "Rtr. Yogya Goyal",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclub@tips.edu.in",
    "rotaryId": "8824525",
    "secretary": "Rtr. Ashi Gupta",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2022,
    "initiatives": []
  },
  {
    "id": "c45",
    "slug": "unified-spirits",
    "name": "Rotaract Club of Unified Spirits",
    "shortName": "Unified Spirits",
    "zone": "Zone Prithvi",
    "lat": 28.56,
    "lng": 77.16,
    "location": "Vasant Vihar, Delhi",
    "address": "E 23 BasementPoorvi Marg, Vasant ViharDelhiDelhi, 110057, India",
    "president": "Rtr. Harish Seth",
    "isDirector": "",
    "phone": "",
    "email": "rotaractunifiedspirits@gmail.com",
    "rotaryId": "8823269",
    "secretary": "Rtr. Sonal Dhingra",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2021,
    "initiatives": []
  },
  {
    "id": "c46",
    "slug": "visioners-league",
    "name": "Rotaract Club of Visioners League",
    "shortName": "Visioners League",
    "zone": "Zone Akash",
    "lat": 28.62,
    "lng": 77.21,
    "location": "Delhi",
    "address": "Delhi, India",
    "president": "Rtr. Anjali Pawar",
    "isDirector": "",
    "phone": "",
    "email": "rac.visionersleague@gmail.com",
    "rotaryId": "215103",
    "secretary": "Rtr. Lakshay Nandwani",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2017,
    "initiatives": []
  },
  {
    "id": "c47",
    "slug": "world-without-childhood-blindness",
    "name": "Rotaract Club of World Without Childhood Blindness",
    "shortName": "World Without Childhood Blindness",
    "zone": "Zone Akash",
    "lat": 28.508,
    "lng": 77.042,
    "location": "Sector 23, Gurugram",
    "address": "612 P, Sector 23, GurgaonGurgaon, 122017, IndiaHaryana",
    "president": "Rtr. Priyanshi Aggarwal",
    "isDirector": "",
    "phone": "",
    "email": "rcwwcb@gmail.com",
    "rotaryId": "8826620",
    "secretary": "Rtr. Adhira Binny",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2024,
    "initiatives": []
  },
  {
    "id": "c48",
    "slug": "young-souvenirs",
    "name": "Rotaract Club of Young Souvenirs",
    "shortName": "Young Souvenirs",
    "zone": "Zone Agni",
    "lat": 28.63,
    "lng": 77.21,
    "location": "Delhi",
    "address": "DelhiDelhi, , India",
    "president": "Rtr. Tanisha Sharma",
    "isDirector": "",
    "phone": "",
    "email": "rotaractclub.youngsouvenirs@gmail.com",
    "rotaryId": "217456",
    "secretary": "Rtr. Shashwat Chauhan",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2019,
    "initiatives": []
  },
  {
    "id": "c49",
    "slug": "gd-goenka-university-sohna",
    "name": "Rotaract Club of GD Goenka University (Sohna)",
    "shortName": "GD Goenka University (Sohna)",
    "zone": "Zone Prithvi",
    "lat": 28.2831,
    "lng": 77.0782,
    "location": "Sohna Road, Gurugram",
    "address": "GD Goenka University

GD Goenka Education City
Sohna Road
Gurgaon, 122103, India",
    "president": "Rtr. Manav Bhardwaj",
    "isDirector": "",
    "phone": "",
    "email": "rotaractgdgu@gmail.com",
    "rotaryId": "8826750",
    "secretary": "Rtr. Aryan Verma",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "charterYear": 2024,
    "initiatives": []
  },
];

export const PAST_DRRS: PastDrr[] = [
  // --- DISTRICT 3011 ERA (2015-16 to 2026-27) ---
  {
    id: 'drr-45',
    srNo: 45,
    year: '2026-27',
    tenure: 'RY 2026-27',
    name: 'Rtr. Archit Bhatia',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract Club of Delhi Heights',
    photo: PDRR_PHOTOS['archit-bhatia'],
    hasPhoto: true
  },
  {
    id: 'drr-44',
    srNo: 44,
    year: '2025-26',
    tenure: 'RY 2025-26',
    name: 'Rtr. Rishika Khanna',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['rishika-khanna'],
    hasPhoto: true
  },
  {
    id: 'drr-43',
    srNo: 43,
    year: '2024-25',
    tenure: 'RY 2024-25',
    name: 'Rtr. Geetika',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['geetika'],
    hasPhoto: true
  },
  {
    id: 'drr-42',
    srNo: 42,
    year: '2023-24',
    tenure: 'RY 2023-24',
    name: 'Rtr. Kriti Malhotra',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['kriti-malhotra'],
    hasPhoto: true
  },
  {
    id: 'drr-41',
    srNo: 41,
    year: '2022-23',
    tenure: 'RY 2022-23',
    name: 'Rtr. Ankit Arvind Singh',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['ankit-arvind'],
    hasPhoto: true
  },
  {
    id: 'drr-40',
    srNo: 40,
    year: '2022-23',
    tenure: 'RY 2022-23',
    name: 'Rtr. Rahul Sanjeev Sharma',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['rahul-sanjeev'],
    hasPhoto: true
  },
  {
    id: 'drr-39',
    srNo: 39,
    year: '2021-22',
    tenure: 'RY 2021-22',
    name: 'Rtr. Niranjan Dev Singh',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['niranjan-dev'],
    hasPhoto: true
  },
  {
    id: 'drr-38',
    srNo: 38,
    year: '2020-21',
    tenure: 'RY 2020-21',
    name: 'Rtr. Sarthak Bansal',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['sarthak-bansal'],
    hasPhoto: true
  },
  {
    id: 'drr-37',
    srNo: 37,
    year: '2020-21',
    tenure: 'RY 2020-21',
    name: 'Rtr. Yaamini Thareja',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['yaamini-thareja'],
    hasPhoto: true
  },
  {
    id: 'drr-36',
    srNo: 36,
    year: '2019-20',
    tenure: 'RY 2019-20',
    name: 'Rtr. Arpit Mehra',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['arpit-mehra'],
    hasPhoto: true
  },
  {
    id: 'drr-35',
    srNo: 35,
    year: '2018-19',
    tenure: 'RY 2018-19',
    name: 'Rtr. Ashima Agarwal Gupta',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['ashima-agarwal'],
    hasPhoto: true
  },
  {
    id: 'drr-34',
    srNo: 34,
    year: '2017-18',
    tenure: 'RY 2017-18',
    name: 'Rtr. Anmol Chawla',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['anmol-chawla'],
    hasPhoto: true
  },
  {
    id: 'drr-33',
    srNo: 33,
    year: '2016-17',
    tenure: 'RY 2016-17',
    name: 'Rtr. Manuj Mittal',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['manuj-mittal'],
    hasPhoto: true
  },
  {
    id: 'drr-32',
    srNo: 32,
    year: '2015-16',
    tenure: 'RY 2015-16',
    name: 'Rtr. Harsh Sirohi',
    district: '3011',
    districtEra: 'District 3011',
    homeClub: 'Rotaract District 3011',
    photo: PDRR_PHOTOS['harsh-sirohi'],
    hasPhoto: true
  },
  // --- DISTRICT 3010 ERA (1990-91 to 2014-15) ---
  {
    id: 'drr-31',
    srNo: 31,
    year: '2014-15',
    tenure: 'RY 2014-15',
    name: 'Rtr. Nikoonz Agarwal',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-30',
    srNo: 30,
    year: '2013-14',
    tenure: 'RY 2013-14',
    name: 'Rtr. Himanshu Gupta',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-29',
    srNo: 29,
    year: '2012-13',
    tenure: 'RY 2012-13',
    name: 'Rtr. Siddharth Gupta',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-28',
    srNo: 28,
    year: '2011-12',
    tenure: 'RY 2011-12',
    name: 'Rtr. Vir Philip',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-27',
    srNo: 27,
    year: '2010-11',
    tenure: 'RY 2010-11',
    name: 'Rtr. Manik Gupta',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-26',
    srNo: 26,
    year: '2009-10',
    tenure: 'RY 2009-10',
    name: 'Rtr. Niharika Ahluwalia',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-25',
    srNo: 25,
    year: '2008-09',
    tenure: 'RY 2008-09',
    name: 'Rtr. Neha Khurana',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-24',
    srNo: 24,
    year: '2007-08',
    tenure: 'RY 2007-08',
    name: 'Rtr. Sushant Gupta',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-23',
    srNo: 23,
    year: '2006-07',
    tenure: 'RY 2006-07',
    name: 'Rtr. Rhiya Gupta',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-22',
    srNo: 22,
    year: '2005-06',
    tenure: 'RY 2005-06',
    name: 'Rtr. S. Sorabh Jain',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-21',
    srNo: 21,
    year: '2004-05',
    tenure: 'RY 2004-05',
    name: 'Rtr. Dhruv Suri',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-20',
    srNo: 20,
    year: '2003-04',
    tenure: 'RY 2003-04',
    name: 'Rtr. Darshanjit Singh',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-19',
    srNo: 19,
    year: '2002-03',
    tenure: 'RY 2002-03',
    name: 'Rtr. Neeraj Sheth',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-18',
    srNo: 18,
    year: '2001-02',
    tenure: 'RY 2001-02',
    name: 'Rtr. Lokesh Aneja',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-17',
    srNo: 17,
    year: '2000-01',
    tenure: 'RY 2000-01',
    name: 'Rtr. Nitin Luthra',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-16',
    srNo: 16,
    year: '1999-00',
    tenure: 'RY 1999-00',
    name: 'Rtr. Lalit Bansal',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-15',
    srNo: 15,
    year: '1998-99',
    tenure: 'RY 1998-99',
    name: 'Rtr. Radhika Backliwal Narain',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-14',
    srNo: 14,
    year: '1997-98',
    tenure: 'RY 1997-98',
    name: 'Rtr. Anil Taneja',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-13',
    srNo: 13,
    year: '1996-97',
    tenure: 'RY 1996-97',
    name: 'Rtr. Naresh Devgun',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-12',
    srNo: 12,
    year: '1995-96',
    tenure: 'RY 1995-96',
    name: 'Rtr. Ajay Kumar',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-11',
    srNo: 11,
    year: '1994-95',
    tenure: 'RY 1994-95',
    name: 'Rtr. Rajesh Lal',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-10',
    srNo: 10,
    year: '1993-94',
    tenure: 'RY 1993-94',
    name: 'Rtr. Manoj Singhal',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-9',
    srNo: 9,
    year: '1992-93',
    tenure: 'RY 1992-93',
    name: 'Rtr. Raman Magan',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-8',
    srNo: 8,
    year: '1991-92',
    tenure: 'RY 1991-92',
    name: 'Rtr. Sudhir Ralan',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-7',
    srNo: 7,
    year: '1990-91',
    tenure: 'RY 1990-91',
    name: 'Rtr. Tejwant Chhatwal',
    district: '3010',
    districtEra: 'District 3010',
    homeClub: 'District 3010',
    photo: null,
    hasPhoto: false
  },
  // --- DISTRICT 301 ERA (1984-85 to 1989-90) ---
  {
    id: 'drr-6',
    srNo: 6,
    year: '1989-90',
    tenure: 'RY 1989-90',
    name: 'Rtr. Tejwant Chhatwal',
    district: '301',
    districtEra: 'District 301',
    homeClub: 'District 301',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-5',
    srNo: 5,
    year: '1988-89',
    tenure: 'RY 1988-89',
    name: 'Rtr. Divender Singh Sirohi',
    district: '301',
    districtEra: 'District 301',
    homeClub: 'District 301',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-4',
    srNo: 4,
    year: '1987-88',
    tenure: 'RY 1987-88',
    name: 'Rtr. Bawa Preetranjan Singh',
    district: '301',
    districtEra: 'District 301',
    homeClub: 'District 301',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-3',
    srNo: 3,
    year: '1986-87',
    tenure: 'RY 1986-87',
    name: 'Rtr. Rajeev Saxena',
    district: '301',
    districtEra: 'District 301',
    homeClub: 'District 301',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-2',
    srNo: 2,
    year: '1985-86',
    tenure: 'RY 1985-86',
    name: 'Rtr. Sanjiv Bali',
    district: '301',
    districtEra: 'District 301',
    homeClub: 'District 301',
    photo: null,
    hasPhoto: false
  },
  {
    id: 'drr-1',
    srNo: 1,
    year: '1984-85',
    tenure: 'RY 1984-85',
    name: 'Rtr. Rajeev Raheja',
    district: '301',
    districtEra: 'District 301',
    homeClub: 'District 301',
    photo: null,
    hasPhoto: false
  }
];

export const DISTRICT_LEADERSHIP: DistrictLeader[] = [
  {
    id: "lead-01",
    name: "Rtn. Rtr. Archit Bhatia",
    role: "District Rotaract Representative",
    email: "itsdrrarchit@gmail.com",
    phone: "9560126152",
    category: "Executive Council",
    photo: "/leadership/archit-bhatia.webp",
    order: 1
  },
  {
    id: "lead-02",
    name: "Rtn. Rtr. Sarthak Bansal",
    role: "District Learning Facilitator",
    email: "rtr.sarthak3003@gmail.com",
    phone: "8700096024",
    category: "Executive Council",
    photo: "/leadership/sarthak-bansal.webp",
    order: 2
  },
  {
    id: "lead-03",
    name: "Rtr. Divyanshu Katiyar",
    role: "Deputy District Rotaract Representative",
    email: "rtrdivyanshu3011@gmail.com",
    phone: "9794565358",
    category: "Executive Council",
    photo: "/leadership/divyanshu-katiyar.webp",
    order: 3
  },
  {
    id: "lead-04",
    name: "Rtr. Rajat Kapoor",
    role: "District Chair - Operations",
    email: "rajatkapoor44@gmail.com",
    phone: "7838923776",
    category: "Executive Council",
    photo: "/leadership/rajat-kapoor.webp",
    order: 4
  },
  {
    id: "lead-05",
    name: "Rtr. Sarthak Manchanda",
    role: "District Chair - Administration",
    email: "sarthakmanchanda2@gmail.com",
    phone: "7206708029",
    category: "Executive Council",
    photo: "/leadership/sarthak-manchanda.webp",
    order: 5
  },
  {
    id: "lead-06",
    name: "Rtr. Shefali Prakash",
    role: "District Rotaract General Secretary",
    email: "rtrshefali2004@gmail.com",
    phone: "8826376323",
    category: "Executive Council",
    photo: "/leadership/shefali-prakash.webp",
    order: 6
  },
  {
    id: "lead-07",
    name: "Rtn. Rtr. Himanshu Gulati",
    role: "District Rotaract Secretary - Reporting",
    email: "himanshugulati.rotary@gmail.com",
    phone: "9643889803",
    category: "Executive Council",
    photo: "/leadership/himanshu-gulati.webp",
    order: 7
  },
  {
    id: "lead-08",
    name: "Rtr. Harshita Malhotra",
    role: "District Rotaract Secretary - Administration",
    email: "harshitam2636@gmail.com",
    phone: "9315267609",
    category: "Executive Council",
    photo: "/leadership/harshita-malhotra.webp",
    order: 8
  },
  {
    id: "lead-09",
    name: "Rtr. Ayush Rai",
    role: "Assistant District Rotaract Representative",
    email: "aayushrai68@gmail.com",
    phone: "7065668589",
    category: "Executive Council",
    photo: "/leadership/ayush-rai.webp",
    order: 9
  },
  {
    id: "lead-10",
    name: "PHF Rtr. Radhika Bansal",
    role: "Assistant District Rotaract Representative",
    email: "rtr.radhikabansal23@gmail.com",
    phone: "8826274877",
    category: "Executive Council",
    photo: "/leadership/radhika-bansal.webp",
    order: 10
  },
  {
    id: "lead-11",
    name: "Rtn. Rtr. Harshit Mehta",
    role: "District Treasurer",
    email: "rtrharshit0403@gmail.com",
    phone: "9899424822",
    category: "Executive Council",
    photo: "/leadership/harshit-mehta.webp",
    order: 11
  },
  {
    id: "lead-12",
    name: "Rtr. V Tushaar",
    role: "District Sergeant at Arms",
    email: "rtr.tushaar@gmail.com",
    phone: "9667836167",
    category: "Executive Council",
    photo: "/leadership/v-tushaar.webp",
    order: 12
  },
  {
    id: "lead-13",
    name: "Rtr. Drishti Buttan",
    role: "District Sergeant at Arms",
    email: "drishtibuttan12@gmail.com",
    phone: "9773728313",
    category: "Executive Council",
    photo: "/leadership/drishti-buttan.webp",
    order: 13
  },
  {
    id: "lead-14",
    name: "Rtr. Tanishaa Sonker",
    role: "Zonal Rotaract Representative",
    email: "tanishaasonker08@gmail.com",
    phone: "9305833297",
    category: "Zonal Team",
    photo: "/leadership/tanishaa-sonker.webp",
    order: 14
  },
  {
    id: "lead-15",
    name: "Rtn. Rtr. Kanav Sachdeva",
    role: "Zonal Rotaract Representative",
    email: "sachdevakanav3@gmail.com",
    phone: "9821909169",
    category: "Zonal Team",
    photo: "/leadership/kanav-sachdeva.webp",
    order: 15
  },
  {
    id: "lead-16",
    name: "Rtr. Dhruv Kumar Jha",
    role: "Zonal Rotaract Representative",
    email: "rtrdhruvjha@gmail.com",
    phone: "9534987772",
    category: "Zonal Team",
    photo: "/leadership/dhruv-kumar-jha.webp",
    order: 16
  },
  {
    id: "lead-17",
    name: "Rtr. Palak Jain",
    role: "Zonal Rotaract Representative",
    email: "palak041003@gmail.com",
    phone: "8218365157",
    category: "Zonal Team",
    photo: "/leadership/palak-jain.webp",
    order: 17
  },
  {
    id: "lead-18",
    name: "Rtr. Arjun Pratap Singh",
    role: "Zonal Rotaract Secretary",
    email: "stormk375@gmail.com",
    phone: "9318317554",
    category: "Zonal Team",
    photo: "/leadership/arjun-pratap-singh.webp",
    order: 18
  },
  {
    id: "lead-19",
    name: "Rtr. Pratham Girdhar",
    role: "Zonal Rotaract Secretary",
    email: "prathamgirdhar08@gmail.com",
    phone: "7302495688",
    category: "Zonal Team",
    photo: "/leadership/pratham-girdhar.webp",
    order: 19
  },
  {
    id: "lead-20",
    name: "Rtr. Kartik Kumar",
    role: "Zonal Rotaract Secretary",
    email: "kartiksingh15082005@gmail.com",
    phone: "9582323419",
    category: "Zonal Team",
    photo: "/leadership/kartik-kumar.webp",
    order: 20
  },
  {
    id: "lead-21",
    name: "Rtr. Hitaishi Chawla",
    role: "Zonal Rotaract Secretary",
    email: "rtrhitaishichawla@gmail.com",
    phone: "9810410704",
    category: "Zonal Team",
    photo: "/leadership/hitaishi-chawla.webp",
    order: 21
  },
  {
    id: "lead-22",
    name: "Rtr. Ritik Varshney",
    role: "District Chair - Rotaract Inter-District Exchange (RIDE)",
    email: "ritikvarshney483@gmail.com",
    phone: "8006911311",
    category: "District Chairs",
    photo: "/leadership/ritik-varshney.webp",
    order: 22
  },
  {
    id: "lead-23",
    name: "Rtr. Yashika Malhotra",
    role: "District Chair - Membership",
    email: "yashika11malhotra@gmail.com",
    phone: "8287628612",
    category: "District Chairs",
    photo: "/leadership/yashika-malhotra.webp",
    order: 23
  },
  {
    id: "lead-24",
    name: "Rtr. Nishith Majumdar",
    role: "District Chair - Community Services",
    email: "nishithmajumdar8@gmail.com",
    phone: "7011079558",
    category: "District Chairs",
    photo: "/leadership/nishith-majumdar.webp",
    order: 24
  },
  {
    id: "lead-25",
    name: "Rtr. Efaa Jafri",
    role: "District Chair - Community Services",
    email: "rtrefaajafri20@gmail.com",
    phone: "9311632069",
    category: "District Chairs",
    photo: "/leadership/efaa-jafri.webp",
    order: 25
  },
  {
    id: "lead-26",
    name: "Rtr. Harshita Agarwal",
    role: "District Chair - Community Services",
    email: "harshitaagarwal2704@gmail.com",
    phone: "8130120701",
    category: "District Chairs",
    photo: "/leadership/harshita-agarwal.webp",
    order: 26
  },
  {
    id: "lead-27",
    name: "Rtr. Paridhi Rawat",
    role: "District Chair - Club Services",
    email: "rtrparidhirawat@gmail.com",
    phone: "8860409982",
    category: "District Chairs",
    photo: "/leadership/paridhi-rawat.webp",
    order: 27
  },
  {
    id: "lead-28",
    name: "Rtr. Aryan Sanjeev",
    role: "District Chair - Club Services",
    email: "rtrarynsnjv@gmail.com",
    phone: "8826880497",
    category: "District Chairs",
    photo: "/leadership/aryan-sanjeev.webp",
    order: 28
  },
  {
    id: "lead-29",
    name: "Rtr. Rachit Kathuria",
    role: "District Chair - Vocational Services",
    email: "rtrrachitkathuria@gmail.com",
    phone: "8851974024",
    category: "District Chairs",
    photo: "/leadership/rachit-kathuria.webp",
    order: 29
  },
  {
    id: "lead-30",
    name: "Rtr. Sejal Mishra",
    role: "District Chair - Vocational Services",
    email: "sejalmishra432@gmail.com",
    phone: "9625817125",
    category: "District Chairs",
    photo: "/leadership/sejal-mishra.webp",
    order: 30
  },
  {
    id: "lead-31",
    name: "Rtr. Prashant Joshi",
    role: "District Chair - International Services",
    email: "prashantjoshi8088@gmail.com",
    phone: "7300685437",
    category: "District Chairs",
    photo: "/leadership/prashant-joshi.webp",
    order: 31
  },
  {
    id: "lead-32",
    name: "Rtr. Saransh Srivastava",
    role: "District Chair - International Services",
    email: "rtrsaranshsrivastava@gmail.com",
    phone: "9599550719",
    category: "District Chairs",
    photo: "/leadership/saransh-srivastava.webp",
    order: 32
  },
  {
    id: "lead-33",
    name: "Rtr. Shubham Singh",
    role: "District Chair - International Services",
    email: "singh.shubham1901@gmail.com",
    phone: "7900542995",
    category: "District Chairs",
    photo: "/leadership/shubham-singh.webp",
    order: 33
  },
  {
    id: "lead-34",
    name: "Rtr. Bhavya Mehta",
    role: "District Chair - Gender Development",
    email: "rtrbhavyamehta@gmail.com",
    phone: "9899834027",
    category: "District Chairs",
    photo: "/leadership/bhavya-mehta.webp",
    order: 34
  },
  {
    id: "lead-35",
    name: "Rtr. Yashica Chaudhary",
    role: "District Chair - Rotaract - Interact Relations",
    email: "yashicachaudhary2026@gmail.com",
    phone: "9717832715",
    category: "District Chairs",
    photo: "/leadership/yashica-chaudhary.webp",
    order: 35
  },
  {
    id: "lead-36",
    name: "Rtr. Avni Bhatia",
    role: "District Co- Chair - Rotaract - Interact Relations",
    email: "avnibhatia0707@gmail.com",
    phone: "7982927168",
    category: "District Chairs",
    photo: "/leadership/avni-bhatia.webp",
    order: 36
  },
  {
    id: "lead-37",
    name: "Rtr. Jatin Mugrai",
    role: "District Co- Chair - Rotaract - Interact Relations",
    email: "jatin.mugrai25@gmail.com",
    phone: "9355456999",
    category: "District Chairs",
    photo: "/leadership/jatin-mugrai.webp",
    order: 37
  },
  {
    id: "lead-38",
    name: "Rtr. Shreya Singh",
    role: "District Chair - Corporate Relations",
    email: "shreyaasinghh585@gmail.com",
    phone: "6307097958",
    category: "District Chairs",
    photo: "/leadership/shreya-singh.webp",
    order: 38
  },
  {
    id: "lead-39",
    name: "Rtr. Apurv Jain",
    role: "District Chair - Corporate Relations",
    email: "apurvjain2003@gmail.com",
    phone: "9992829846",
    category: "District Chairs",
    photo: "/leadership/apurv-jain.webp",
    order: 39
  },
  {
    id: "lead-40",
    name: "Rtr. Yaman Puri",
    role: "District Chair - Sponsorship",
    email: "yamanpuri@outlook.in",
    phone: "8750411555",
    category: "District Chairs",
    photo: "/leadership/yaman-puri.webp",
    order: 40
  },
  {
    id: "lead-41",
    name: "Rtr. Jayant Kumar Sharma",
    role: "District Chair - Multimedia",
    email: "jayantsharmacreates@gmail.com",
    phone: "8862827515",
    category: "District Chairs",
    photo: "/leadership/jayant-kumar-sharma.webp",
    order: 41
  },
  {
    id: "lead-42",
    name: "Rtr. Ashi Gupta",
    role: "District Chair - Multimedia",
    email: "ashi7142@gmail.com",
    phone: "8851645688",
    category: "District Chairs",
    photo: "/leadership/ashi-gupta.webp",
    order: 42
  },
  {
    id: "lead-43",
    name: "Rtr. Mayur Pandita",
    role: "District Chair - Social Media",
    email: "mayurpandita7@gmail.com",
    phone: "9906981963",
    category: "District Chairs",
    photo: "/leadership/mayur-pandita.webp",
    order: 43
  },
  {
    id: "lead-44",
    name: "Rtr. Mukta Kumari",
    role: "District Editor",
    email: "muktakumari1811@gmail.com",
    phone: "8368803505",
    category: "District Chairs",
    photo: "/leadership/mukta-kumari.webp",
    order: 44
  },
  {
    id: "lead-45",
    name: "Rtr. Durgesh K Chaudhary",
    role: "District Photographer",
    email: "durgesh.ly22@gmail.com",
    phone: "7462893778",
    category: "District Chairs",
    photo: "/leadership/durgesh-k-chaudhary.webp",
    order: 45
  },
  {
    id: "lead-46",
    name: "Rtr. Rajveer Singh Marwah",
    role: "District Chair - Technology",
    email: "jasraj2626@gmail.com",
    phone: "9315218284",
    category: "District Chairs",
    photo: "/leadership/rajveer-singh-marwah.webp",
    order: 46
  },
  {
    id: "lead-47",
    name: "Rtr. Mehul Buttan",
    role: "District Co-Chair - Technology",
    email: "mehulbuttan85@gmail.com",
    phone: "8377842506",
    category: "District Chairs",
    photo: "/leadership/mehul-buttan.webp",
    order: 47
  },
  {
    id: "lead-48",
    name: "Rtr. Vrinda Garg",
    role: "District Web Administrator",
    email: "vrinda.garg1998@gmail.com",
    phone: "9871577088",
    category: "District Chairs",
    photo: "/leadership/vrinda-garg.webp",
    order: 48
  },
  {
    id: "lead-49",
    name: "Rtr. Parth Agarwal",
    role: "District Web Administrator",
    email: "thisisparthagarwal@gmail.com",
    phone: "7011638319",
    category: "District Chairs",
    photo: "/leadership/parth-agarwal.webp",
    order: 49
  },
  {
    id: "lead-50",
    name: "Rtr. Dhruvika Chopra",
    role: "District Chair - Artificial Intelligence",
    email: "dhruvika038@gmail.com",
    phone: "7303530476",
    category: "District Chairs",
    photo: "/leadership/dhruvika-chopra.webp",
    order: 50
  }
];

export const DISTRICT_RESOURCES: DistrictResource[] = [
  {
    id: 'res-master',
    title: 'Important Documents 2026-27 (Official Drive)',
    category: 'Master Repository',
    description: 'The master Google Drive repository containing all official administrative documents, guidelines, databases, and formats for Rotary Year 2026-27.',
    driveUrl: 'https://drive.google.com/drive/folders/13jmmlVGeA0W3-c6uv2rcNr-b43eVJAB_',
    isRoot: true,
    badge: 'Master Archive'
  },
  {
    id: 'res-installation',
    title: 'Agenda & Guidelines - Installation Ceremony',
    category: 'Protocols & Ceremonies',
    description: 'Official installation ceremony scripts, stage agenda, dignitary reception protocols, and collar exchange guidelines.',
    driveUrl: 'https://drive.google.com/drive/folders/13tuQeZJWdyqG4i6p9Ez6S7NuoD8wF8Al',
    badge: 'Ceremony Protocol'
  },
  {
    id: 'res-databases',
    title: 'District Directories & Databases',
    category: 'Directories & Contact Lists',
    description: 'Official contact and club roster databases for the District Administrative Council (DAC), Presidents, and Secretaries.',
    driveUrl: 'https://drive.google.com/drive/folders/1QJAzVfsrSSFD5SEcbtdTy5SqGR8QqCPK',
    badge: 'Directories',
    sublinks: [
      { name: 'District Administrative Council (DAC) Directory PDF', type: 'PDF' },
      { name: 'Club Presidents Database 2026-27 (PDF)', type: 'PDF' },
      { name: 'Club Secretaries Database 2026-27 (PDF)', type: 'PDF' }
    ]
  },
  {
    id: 'res-calendar-drive',
    title: 'DRR Installation & Official Calendar',
    category: 'District Calendar & Schedules',
    description: 'Official schedule of DRR visits, club charter celebrations, zonal meets, and flagship district events for RY 2026-27.',
    driveUrl: 'https://drive.google.com/drive/folders/1iFPB91adtXk1eRhLlTPkRJKnHytHnXdM',
    badge: 'Official Schedules'
  },
  {
    id: 'res-logos',
    title: 'Important Logos & Brand Assets',
    category: 'Brand Identity & Media',
    description: 'Master collection of official logos, theme vectors, print backdrops, and co-branding lockups.',
    driveUrl: 'https://drive.google.com/drive/folders/1BKr3Bb9AKDJlQbKNhMgmcuyudyABLdu2',
    badge: 'Brand Kit',
    subfolders: [
      {
        name: 'For Printables and Backdrop',
        url: 'https://drive.google.com/drive/folders/1Rxm7Ag95dzqoQblyM7WcAFUFG8SjUCtF',
        description: 'Vector and high-resolution assets formatted for stage backdrops, standees, and physical banners.'
      },
      {
        name: 'Official Logo Strip',
        url: 'https://drive.google.com/drive/folders/1BrYJ1FNnwgjyT7sZdI7nGTz3ODep_86r',
        description: 'Approved horizontal and vertical logo strips for club flyers, certificates, and event posters.'
      },
      {
        name: 'RI Presidential Message & Theme',
        url: 'https://drive.google.com/drive/folders/1EFVgj9Yvv-4WFZsp65PE6FGIEDkPnVaT',
        description: 'Annual RI theme assets, presidential citation guidelines, and high-res theme logos.'
      },
      {
        name: 'Rotaract Brand Assets',
        url: 'https://drive.google.com/drive/folders/19KMR4Sw4deM72mYUK9YChkwMYhMURccR',
        description: 'Official Rotaract lockups, typography guidelines, and approved district color swatches.'
      },
      {
        name: 'Rotary Official Logos',
        url: 'https://drive.google.com/drive/folders/1_phMS7YdgHEaHXq4cXl2dstIBl1GNswc',
        description: 'Rotary International master wheel marks, dual-branded lockups, and Rotary partner emblems.'
      }
    ]
  },
  {
    id: 'res-is',
    title: 'International Services (IS) Guidelines & Letterhead',
    category: 'International Service',
    description: 'Protocol guide for global twin clubs, international fellowship exchanges, official district letterheads (PPTX/PDF), and verified POC directory.',
    driveUrl: 'https://drive.google.com/drive/folders/1saHEi6QZU7yVSEjvpX3mADArAnHx8YgH',
    badge: 'Twin Club / IS',
    sublinks: [
      { name: 'International Services Guidelines PDF', type: 'PDF' },
      { name: 'International Services POCs Directory PDF', type: 'PDF' },
      { name: 'Official District Letterhead Format (PPTX & PDF)', type: 'Letterhead' }
    ]
  },
  {
    id: 'res-points',
    title: 'District Points System (RY 2026-27)',
    category: 'Club Reporting & Recognition',
    description: 'Comprehensive 2026-27 points manual detailing reporting criteria, zonal weights, monthly deadlines, and annual award citations.',
    driveUrl: 'https://drive.google.com/drive/folders/1GCqzGf1SGsOE2_CL3-po0Rh7BivEgnDt',
    badge: 'Points Manual',
    sublinks: [
      { name: 'Official Point System 2026-27 PDF (2.3 MB)', type: 'PDF' }
    ]
  },
  {
    id: 'res-zonal',
    title: 'Zonal Structure & Demarcations',
    category: 'Zonal Governance',
    description: 'Official territorial demarcations, Zonal Rotaract Representative (ZRR) appointments, and club zonal allocations for Zones Prithvi, Agni, Vayu, and Akash.',
    driveUrl: 'https://drive.google.com/drive/folders/1WY0XEbfNN4dbXwKklnmUAeOMSXrLivt1',
    badge: '4 Zones'
  }
];
