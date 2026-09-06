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
  name: string;
  shortName: string;
  zone: string;
  lat: number;
  lng: number;
  president: string;
  isDirector: string;
  phone: string;
  email: string;
  rotaryId: string;
  secretary: string;
  secretaryEmail: string;
  secretaryPhone: string;
  initiatives: ClubInitiative[];
  // Absent from the static roster; merged in at runtime from the portal API / Excel roster.
  brief?: string;
  charterYear?: string;
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
    "name": "Rotaract Club of College of Vocational Studies",
    "shortName": "College of Vocational Studies",
    "zone": "Zone Prithvi",
    "lat": 28.547818046226283,
    "lng": 77.23503122460636,
    "president": "Rtr. Jubin Sabu",
    "isDirector": "",
    "phone": "9910938515",
    "email": "jubinsabu25@gmail.com",
    "rotaryId": "12651882",
    "secretary": "Rtr. Mohd Arham",
    "secretaryEmail": "mdarham0672@gmail.com",
    "secretaryPhone": "7905580623",
    "initiatives": []
  },
  {
    "id": "c2",
    "name": "Rotaract Club of Galgotias Educational Institutions",
    "shortName": "Galgotias Educational Institutions",
    "zone": "Zone Prithvi",
    "lat": 28.611144741582923,
    "lng": 77.23727089047544,
    "president": "Rtr. Kushagra Yadav",
    "isDirector": "",
    "phone": "9389422030",
    "email": "rtrkushagrayadav@gmail.com",
    "rotaryId": "12254264",
    "secretary": "Rtr. Jahanvi Panwar",
    "secretaryEmail": "rtrjahanvipanwar@gmail.com",
    "secretaryPhone": "9557277689",
    "initiatives": []
  },
  {
    "id": "c3",
    "name": "Rotaract Club of Ingenious Minds",
    "shortName": "Ingenious Minds",
    "zone": "Zone Prithvi",
    "lat": 28.60883842514265,
    "lng": 77.21871136011616,
    "president": "Rtr. Meher Kapoor",
    "isDirector": "",
    "phone": "9319747479",
    "email": "Kapoormeher32@gmail.com",
    "rotaryId": "12401789",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c4",
    "name": "Rotaract Club of Delhi Ehsaas",
    "shortName": "Delhi Ehsaas",
    "zone": "Zone Prithvi",
    "lat": 28.565310889132455,
    "lng": 77.2525,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.delhiehsaas@district3011.org",
    "rotaryId": "12700199",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c5",
    "name": "Rotaract Club of Delhi South East",
    "shortName": "Delhi South East",
    "zone": "Zone Prithvi",
    "lat": 28.5427417255814,
    "lng": 77.24170431923022,
    "president": "Rtr. Gunpreet Singh",
    "isDirector": "",
    "phone": "7042854616",
    "email": "singhgunpreet90@gmail.com",
    "rotaryId": "11952661",
    "secretary": "Rtr. Aryan Sanjeev",
    "secretaryEmail": "rtrarynsnjv@gmail.com",
    "secretaryPhone": "8826880497",
    "initiatives": []
  },
  {
    "id": "c6",
    "name": "Rotaract Club of Delhi MAIMS",
    "shortName": "Delhi MAIMS",
    "zone": "Zone Prithvi",
    "lat": 28.599636322545308,
    "lng": 77.27234364998104,
    "president": "Rtr. Jagruti Dhoundiyal",
    "isDirector": "",
    "phone": "8527493269",
    "email": "Dhoundiyaljagruti.22@gmail.com",
    "rotaryId": "12512205",
    "secretary": "Rtr. Anaye Bhalla",
    "secretaryEmail": "anayebhalla@gmail.com",
    "secretaryPhone": "8882337318",
    "initiatives": []
  },
  {
    "id": "c7",
    "name": "Rotaract Club of Delhi Midtown Maitreyi",
    "shortName": "Delhi Midtown Maitreyi",
    "zone": "Zone Prithvi",
    "lat": 28.558303094041808,
    "lng": 77.18601508841597,
    "president": "Rtr. Srishty Goyal",
    "isDirector": "",
    "phone": "8572858798",
    "email": "srishtygoyal611@gmail.com",
    "rotaryId": "12157688",
    "secretary": "Rtr. Divyanjali Rai",
    "secretaryEmail": "divyanjalirai74@gmail.com",
    "secretaryPhone": "8840101762",
    "initiatives": []
  },
  {
    "id": "c8",
    "name": "Rotaract Club of Delhi South",
    "shortName": "Delhi South",
    "zone": "Zone Prithvi",
    "lat": 28.542414026489755,
    "lng": 77.2743752997881,
    "president": "Rtr. Tamanna Goyal",
    "isDirector": "",
    "phone": "9728743666",
    "email": "tamanna17goyal@gmail.com",
    "rotaryId": "11934107",
    "secretary": "Rtr. Tarika Gupta",
    "secretaryEmail": "tarikagupta268@gmail.com",
    "secretaryPhone": "9812320308",
    "initiatives": []
  },
  {
    "id": "c9",
    "name": "Rotaract Club of Delhi South Central",
    "shortName": "Delhi South Central",
    "zone": "Zone Prithvi",
    "lat": 28.612626247419463,
    "lng": 77.2316211644374,
    "president": "Rtr. Yashika Kapoor",
    "isDirector": "",
    "phone": "9220611229",
    "email": "rtr.yashikakapoor12@gmail.com",
    "rotaryId": "12428490",
    "secretary": "Rtr. Srishti Kekti",
    "secretaryEmail": "rtr.srishtikekti@gmail.com",
    "secretaryPhone": "7982214512",
    "initiatives": []
  },
  {
    "id": "c10",
    "name": "Rotaract Club of Delhi Southend Next",
    "shortName": "Delhi Southend Next",
    "zone": "Zone Prithvi",
    "lat": 28.6024117387325,
    "lng": 77.28264627388441,
    "president": "Rtr. Amritesh Pandey",
    "isDirector": "",
    "phone": "8004599667",
    "email": "rtramriteshpandey@gmail.com",
    "rotaryId": "N/A",
    "secretary": "Rtr. Happy Kumar",
    "secretaryEmail": "ph07rtrhappykumar@gmail.com",
    "secretaryPhone": "9470792148",
    "initiatives": []
  },
  {
    "id": "c11",
    "name": "Rotaract Club of GD Goenka University, Sohna",
    "shortName": "GD Goenka University, Sohna",
    "zone": "Zone Prithvi",
    "lat": 28.632061243215535,
    "lng": 77.23690381619949,
    "president": "Rtr. Manav Bhardwaj",
    "isDirector": "",
    "phone": "8076752358",
    "email": "bhardwajmanav24@gmail.com",
    "rotaryId": "N/A",
    "secretary": "Rtr. Aryan Verma",
    "secretaryEmail": "Aryanchoudharyc17@gmail.com",
    "secretaryPhone": "9411238785",
    "initiatives": []
  },
  {
    "id": "c12",
    "name": "Rotaract Club of Ilmaura",
    "shortName": "Ilmaura",
    "zone": "Zone Prithvi",
    "lat": 28.54360348997537,
    "lng": 77.27500963486325,
    "president": "Rtr. Mansi Mishra",
    "isDirector": "",
    "phone": "9918280973",
    "email": "rtrmansimishra@gmail.com",
    "rotaryId": "12141826",
    "secretary": "Rtr. Sai Dhinesh S",
    "secretaryEmail": "saidhinesh342@gmail.com",
    "secretaryPhone": "9360201763",
    "initiatives": []
  },
  {
    "id": "c13",
    "name": "Rotaract Club of Jagannath Institute of Management Sciences",
    "shortName": "Jagannath Institute of Management Sciences",
    "zone": "Zone Prithvi",
    "lat": 28.504689110867545,
    "lng": 77.2175,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.jagannathinstituteofmanagementsciences@district3011.org",
    "rotaryId": "12654850",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c14",
    "name": "Rotaract Club of Lady Shri Ram College",
    "shortName": "Lady Shri Ram College",
    "zone": "Zone Prithvi",
    "lat": 28.48575961234939,
    "lng": 77.22631759111665,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.ladyshriramcollege@district3011.org",
    "rotaryId": "12530018",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c15",
    "name": "Rotaract Club of Ramanujan College",
    "shortName": "Ramanujan College",
    "zone": "Zone Prithvi",
    "lat": 28.470987496054207,
    "lng": 77.24628713154836,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.ramanujancollege@district3011.org",
    "rotaryId": "12438358",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c16",
    "name": "Rotaract Club of Resilience",
    "shortName": "Resilience",
    "zone": "Zone Prithvi",
    "lat": 28.629920752486527,
    "lng": 77.25708370838063,
    "president": "Rtr. Aditi Singhal",
    "isDirector": "",
    "phone": "9166997903",
    "email": "aditisinghal5010@gmail.com",
    "rotaryId": "12397071",
    "secretary": "Rtr. Shreshth Kaushik",
    "secretaryEmail": "shresthsk171412@gmail.com",
    "secretaryPhone": "9810909751",
    "initiatives": []
  },
  {
    "id": "c17",
    "name": "Rotaract Club of Sri Guru Gobind Singh College of Commerce",
    "shortName": "Sri Guru Gobind Singh College of Commerce",
    "zone": "Zone Prithvi",
    "lat": 28.666493327375708,
    "lng": 77.21784844597903,
    "president": "Rtr. Janav Panjwani",
    "isDirector": "",
    "phone": "9319080104",
    "email": "janavpanjwani@gmail.com",
    "rotaryId": "12653224",
    "secretary": "Rtr. Anoushka Nayyar",
    "secretaryEmail": "anoushka.rotaractclubsggscc@gmail.com",
    "secretaryPhone": "9910471058",
    "initiatives": []
  },
  {
    "id": "c18",
    "name": "Rotaract Club of Young Visionaries",
    "shortName": "Young Visionaries",
    "zone": "Zone Prithvi",
    "lat": 28.51276869068383,
    "lng": 77.29608002035108,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.youngvisionaries@district3011.org",
    "rotaryId": "12619518",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c19",
    "name": "Rotaract Club of Delhi Capital Circle",
    "shortName": "Delhi Capital Circle",
    "zone": "Zone Agni",
    "lat": 28.555616399705276,
    "lng": 77.15491722957039,
    "president": "Rtr. Arnav Jain",
    "isDirector": "",
    "phone": "9992983266",
    "email": "arnavjain0050@gmail.com",
    "rotaryId": "12645228",
    "secretary": "Rtr. Ananya Gupta",
    "secretaryEmail": "guptananya.7.3.5@gmail.com",
    "secretaryPhone": "9991931860",
    "initiatives": []
  },
  {
    "id": "c20",
    "name": "Rotaract Club of Delhi Dynamic Leaders",
    "shortName": "Delhi Dynamic Leaders",
    "zone": "Zone Agni",
    "lat": 28.568288440025267,
    "lng": 77.28339803907336,
    "president": "Rtr. Tanya Khanna",
    "isDirector": "",
    "phone": "8800614956",
    "email": "rtrtanyakhanna03@gmail.com",
    "rotaryId": "11932177",
    "secretary": "Rtr. Kamakshi Aggarwal",
    "secretaryEmail": "Rtr.kamakshiaggarwal05@gmail.com",
    "secretaryPhone": "9667425304",
    "initiatives": []
  },
  {
    "id": "c21",
    "name": "Rotaract Club of Delhi Imperia",
    "shortName": "Delhi Imperia",
    "zone": "Zone Agni",
    "lat": 28.632518850561077,
    "lng": 77.17613870435638,
    "president": "Rtr. Kinjal Goyal",
    "isDirector": "",
    "phone": "7425830573",
    "email": "rtrkinjalgoyal@gmail.com",
    "rotaryId": "12133160",
    "secretary": "Rtr. Christie Grover",
    "secretaryEmail": "christiegrover1@gmail.com",
    "secretaryPhone": "9899252626",
    "initiatives": []
  },
  {
    "id": "c22",
    "name": "Rotaract Club of Delhi Rajdhani",
    "shortName": "Delhi Rajdhani",
    "zone": "Zone Agni",
    "lat": 28.645399715994884,
    "lng": 77.15914168228497,
    "president": "Rtr. Deeta Chandhok",
    "isDirector": "",
    "phone": "8745937208",
    "email": "deetachandhok18@gmail.com",
    "rotaryId": "12670852",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c23",
    "name": "Rotaract Club of Delhi Heights",
    "shortName": "Delhi Heights",
    "zone": "Zone Agni",
    "lat": 28.683515237738458,
    "lng": 77.28310048236902,
    "president": "Rtr. Yash Satija",
    "isDirector": "",
    "phone": "9711504506",
    "email": "Rtryashsatija@gmail.com",
    "rotaryId": "11638250",
    "secretary": "Rtr. Anshita Jain",
    "secretaryEmail": "rtranshitajain@gmail.com",
    "secretaryPhone": "9311073812",
    "initiatives": []
  },
  {
    "id": "c24",
    "name": "Rotaract Club of Delhi-Pankh",
    "shortName": "Delhi-Pankh",
    "zone": "Zone Agni",
    "lat": 28.689777992045432,
    "lng": 77.2096323425443,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.delhipankh@district3011.org",
    "rotaryId": "12853325",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c25",
    "name": "Rotaract Club of Faridabad Aravalli",
    "shortName": "Faridabad Aravalli",
    "zone": "Zone Agni",
    "lat": 28.65705206643293,
    "lng": 77.20094066013715,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.faridabadaravalli@district3011.org",
    "rotaryId": "12795151",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c26",
    "name": "Rotaract Club of Galgotias University",
    "shortName": "Galgotias University",
    "zone": "Zone Agni",
    "lat": 28.661786195533658,
    "lng": 77.18113592141871,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.galgotiasuniversity@district3011.org",
    "rotaryId": "12540985",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c27",
    "name": "Rotaract Club of Guru Teg Bahadur Institute of Technology",
    "shortName": "Guru Teg Bahadur Institute of Technology",
    "zone": "Zone Agni",
    "lat": 28.65593658054741,
    "lng": 77.15783420617159,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.gurutegbahadurinstituteoftechnology@district3011.org",
    "rotaryId": "12831562",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c28",
    "name": "Rotaract Club of Indira Gandhi Delhi Technical University for Women",
    "shortName": "Indira Gandhi Delhi Technical University for Women",
    "zone": "Zone Agni",
    "lat": 28.5727765458316,
    "lng": 77.20500974360587,
    "president": "Rtr. Harshita Gupta",
    "isDirector": "",
    "phone": "8595983188",
    "email": "Harshitaigcs@gmail.com",
    "rotaryId": "12249352",
    "secretary": "Rtr. Khushi Yadav",
    "secretaryEmail": "Khushiiyadav0504@gmail.com",
    "secretaryPhone": "7419022068",
    "initiatives": []
  },
  {
    "id": "c29",
    "name": "Rotaract Club of KR Manglam University",
    "shortName": "KR Manglam University",
    "zone": "Zone Agni",
    "lat": 28.616770270485965,
    "lng": 77.16568193482986,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.krmanglamuniversity@district3011.org",
    "rotaryId": "12500308",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c30",
    "name": "Rotaract Club of Lakshmibai College",
    "shortName": "Lakshmibai College",
    "zone": "Zone Agni",
    "lat": 28.578444153788723,
    "lng": 77.16493336879108,
    "president": "Rtr. Garima Malviya",
    "isDirector": "",
    "phone": "7400992298",
    "email": "garimamalviya92@gmail.com",
    "rotaryId": "12159845",
    "secretary": "Rtr. Krishika Bindal",
    "secretaryEmail": "krishikabindal@gmail.com",
    "secretaryPhone": "8168952614",
    "initiatives": []
  },
  {
    "id": "c31",
    "name": "Rotaract Club of DPSRU",
    "shortName": "DPSRU",
    "zone": "Zone Agni",
    "lat": 28.581947871172453,
    "lng": 77.19245548949043,
    "president": "Rtr. Ashif Khan",
    "isDirector": "",
    "phone": "8595704914",
    "email": "asifkhan989733@gmail.com",
    "rotaryId": "11940072",
    "secretary": "Rtr. Gauri Sharma",
    "secretaryEmail": "racdpsrugaurisharma@gmail.com",
    "secretaryPhone": "8700106618",
    "initiatives": []
  },
  {
    "id": "c32",
    "name": "Rotaract Club of National Association for Blind",
    "shortName": "National Association for Blind",
    "zone": "Zone Agni",
    "lat": 28.651966925816517,
    "lng": 77.19004199180921,
    "president": "Rtr. Harpreet Singh Dua",
    "isDirector": "",
    "phone": "9939036635",
    "email": "hsdua.02@gmail.com",
    "rotaryId": "12408805",
    "secretary": "Rtr. Inderpreet Singh",
    "secretaryEmail": "inderpreet@nabdelhi.in",
    "secretaryPhone": "6239561506",
    "initiatives": []
  },
  {
    "id": "c33",
    "name": "Rotaract Club of Saksham",
    "shortName": "Saksham",
    "zone": "Zone Agni",
    "lat": 28.560222007954568,
    "lng": 77.2096323425443,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.saksham@district3011.org",
    "rotaryId": "12156948",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c34",
    "name": "Rotaract Club of Shaheed Bhagat Singh College",
    "shortName": "Shaheed Bhagat Singh College",
    "zone": "Zone Agni",
    "lat": 28.591070990692124,
    "lng": 77.22359199204993,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.shaheedbhagatsinghcollege@district3011.org",
    "rotaryId": "12793459",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c35",
    "name": "Rotaract Club of Shri Aurobindo College",
    "shortName": "Shri Aurobindo College",
    "zone": "Zone Agni",
    "lat": 28.583141676086875,
    "lng": 77.24234740790612,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.shriaurobindocollege@district3011.org",
    "rotaryId": "12828953",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c36",
    "name": "Rotaract Club of Starex University",
    "shortName": "Starex University",
    "zone": "Zone Agni",
    "lat": 28.585076173675173,
    "lng": 77.26629413311078,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.starexuniversity@district3011.org",
    "rotaryId": "12123955",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c37",
    "name": "Rotaract Club of Unified Spirits",
    "shortName": "Unified Spirits",
    "zone": "Zone Agni",
    "lat": 28.635663531619205,
    "lng": 77.1787073650442,
    "president": "Rtr. Harish Seth",
    "isDirector": "",
    "phone": "9999046566",
    "email": "harishseth2525@gmail.com",
    "rotaryId": "12116467",
    "secretary": "Rtr. Sonal Dhingra",
    "secretaryEmail": "Sonaldhingra.official@gmail.com",
    "secretaryPhone": "9289828335",
    "initiatives": []
  },
  {
    "id": "c38",
    "name": "Rotaract Club of Activa Delhi, IHE",
    "shortName": "Activa Delhi, IHE",
    "zone": "Zone Vayu",
    "lat": 28.685,
    "lng": 77.2,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.activadelhiihe@district3011.org",
    "rotaryId": "12187229",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c39",
    "name": "Rotaract Club of DTU Regency",
    "shortName": "DTU Regency",
    "zone": "Zone Vayu",
    "lat": 28.544495394448976,
    "lng": 77.186964958933,
    "president": "Rtr. Abhinav Jha",
    "isDirector": "",
    "phone": "9773860195",
    "email": "Abhinavjha2509@gmail.com",
    "rotaryId": "12555986",
    "secretary": "Rtr. Shayna Sharma",
    "secretaryEmail": "Shaynasharma0412@gmail.com",
    "secretaryPhone": "8076379391",
    "initiatives": []
  },
  {
    "id": "c40",
    "name": "Rotaract Club of Delhi Elite",
    "shortName": "Delhi Elite",
    "zone": "Zone Vayu",
    "lat": 28.682452724471304,
    "lng": 77.25223951181482,
    "president": "Rtr. Ghazal Sapra",
    "isDirector": "",
    "phone": "9319513310",
    "email": "sapra.ghazal16@gmail.com",
    "rotaryId": "11864134",
    "secretary": "Rtr. Rishabh Babber",
    "secretaryEmail": "rtr.rishabh.babber01@gmail.com",
    "secretaryPhone": "8826841005",
    "initiatives": []
  },
  {
    "id": "c41",
    "name": "Rotaract Club of Delhi Manthan",
    "shortName": "Delhi Manthan",
    "zone": "Zone Vayu",
    "lat": 28.5988938081914,
    "lng": 77.27344864400148,
    "president": "Rtr. Himank Anand",
    "isDirector": "",
    "phone": "9873790855",
    "email": "himankanand2047@gmail.com",
    "rotaryId": "12458608",
    "secretary": "Rtr. Avishi Sharma",
    "secretaryEmail": "official.avishi8@gmail.com",
    "secretaryPhone": "7982037599",
    "initiatives": []
  },
  {
    "id": "c42",
    "name": "Rotaract Club of Delhi Nexus",
    "shortName": "Delhi Nexus",
    "zone": "Zone Vayu",
    "lat": 28.733470013296966,
    "lng": 77.17727427435705,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.delhinexus@district3011.org",
    "rotaryId": "12690841",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c43",
    "name": "Rotaract Club of Delhi Philanthropists",
    "shortName": "Delhi Philanthropists",
    "zone": "Zone Vayu",
    "lat": 28.74977799204543,
    "lng": 77.1596323425443,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.delhiphilanthropists@district3011.org",
    "rotaryId": "12871883",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c44",
    "name": "Rotaract Club of Delhi Valiant Midwest",
    "shortName": "Delhi Valiant Midwest",
    "zone": "Zone Vayu",
    "lat": 28.717052066432927,
    "lng": 77.15094066013715,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.delhivaliantmidwest@district3011.org",
    "rotaryId": "12893284",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c45",
    "name": "Rotaract Club of Don Bosco Institute of Technology (Sankalp)",
    "shortName": "Don Bosco Institute of Technology (Sankalp)",
    "zone": "Zone Vayu",
    "lat": 28.721786195533657,
    "lng": 77.13113592141872,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.donboscoinstituteoftechnologysankalp@district3011.org",
    "rotaryId": "12392689",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c46",
    "name": "Rotaract Club of Dronacharya Govt. College (Gurugram)",
    "shortName": "Dronacharya Govt. College (Gurugram)",
    "zone": "Zone Vayu",
    "lat": 28.71593658054741,
    "lng": 77.10783420617159,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.dronacharyagovtcollegegurugram@district3011.org",
    "rotaryId": "12360697",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c47",
    "name": "Rotaract Club of IILM",
    "shortName": "IILM",
    "zone": "Zone Vayu",
    "lat": 28.690760810659825,
    "lng": 77.13047735438091,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.iilm@district3011.org",
    "rotaryId": "12260438",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c48",
    "name": "Rotaract Club of Catalyst",
    "shortName": "Catalyst",
    "zone": "Zone Vayu",
    "lat": 28.676770270485964,
    "lng": 77.11568193482987,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.catalyst@district3011.org",
    "rotaryId": "12749915",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c49",
    "name": "Rotaract Club of Kirori Mal College",
    "shortName": "Kirori Mal College",
    "zone": "Zone Vayu",
    "lat": 28.569915470469937,
    "lng": 77.15861455267573,
    "president": "Rtr. Suvanshi Deb",
    "isDirector": "",
    "phone": "8448782006",
    "email": "Suvanshideb@gmail.com",
    "rotaryId": "12597285",
    "secretary": "Rtr. Vaishnavi Mishra",
    "secretaryEmail": "mishravaishnavi926@gmail.com",
    "secretaryPhone": "9120814792",
    "initiatives": []
  },
  {
    "id": "c50",
    "name": "Rotaract Club of Maharaja Agrasain",
    "shortName": "Maharaja Agrasain",
    "zone": "Zone Vayu",
    "lat": 28.659249663126438,
    "lng": 77.14129514499311,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.maharajaagrasain@district3011.org",
    "rotaryId": "12271771",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c51",
    "name": "Rotaract Club of New Delhi",
    "shortName": "New Delhi",
    "zone": "Zone Vayu",
    "lat": 28.635074273541104,
    "lng": 77.2512485721861,
    "president": "Rtr. Ashmeet Kaur Anand",
    "isDirector": "",
    "phone": "7011676591",
    "email": "rtrashmeetkauranand@gmail.com",
    "rotaryId": "11192426",
    "secretary": "Rtr. Bhavneet Kaur",
    "secretaryEmail": "rtr.bhavneetkaur@gmail.com",
    "secretaryPhone": "8595527979",
    "initiatives": []
  },
  {
    "id": "c52",
    "name": "Rotaract Club of Rever",
    "shortName": "Rever",
    "zone": "Zone Vayu",
    "lat": 28.634297357703073,
    "lng": 77.24264469625777,
    "president": "Rtr. Aarshi Lohia",
    "isDirector": "",
    "phone": "7982225321",
    "email": "aarshi1999lohia@gmail.com",
    "rotaryId": "11300467",
    "secretary": "Rtr. Bhavika Ghai",
    "secretaryEmail": "ghaibhavika7@gmail.com",
    "secretaryPhone": "9871991327",
    "initiatives": []
  },
  {
    "id": "c53",
    "name": "Rotaract Club of Sri Guru Teg Bahadur Khalsa College",
    "shortName": "Sri Guru Teg Bahadur Khalsa College",
    "zone": "Zone Vayu",
    "lat": 28.683059930257183,
    "lng": 77.23674954146871,
    "president": "Rtr. Anshdeep Singh",
    "isDirector": "",
    "phone": "9759309512",
    "email": "ansh.deepaulakh2.006@gmail.com",
    "rotaryId": "12594083",
    "secretary": "Rtr. Bhavya Singh Bhandari",
    "secretaryEmail": "bhavyasingh760@gmail.com",
    "secretaryPhone": "9816131593",
    "initiatives": []
  },
  {
    "id": "c54",
    "name": "Rotaract Club of Sushant University",
    "shortName": "Sushant University",
    "zone": "Zone Vayu",
    "lat": 28.681713265342463,
    "lng": 77.22595003658816,
    "president": "Rtr. Danish Kaul",
    "isDirector": "",
    "phone": "9811603710",
    "email": "danish.230btccse302@sushantuniversity.edu.in",
    "rotaryId": "12128001",
    "secretary": "Rtr. Ashutosh Bhandari",
    "secretaryEmail": "ashutosh.240bca045@sushantuniversity.edu.in",
    "secretaryPhone": "9582957676",
    "initiatives": []
  },
  {
    "id": "c55",
    "name": "Rotaract Club of Trinity Institute Dwarka",
    "shortName": "Trinity Institute Dwarka",
    "zone": "Zone Vayu",
    "lat": 28.648052447850176,
    "lng": 77.27947603329488,
    "president": "Rtr. Yogya Goyal",
    "isDirector": "",
    "phone": "9821001937",
    "email": "yogyagoyal804@gmail.com",
    "rotaryId": "12253959",
    "secretary": "Rtr. Ashi Gupta",
    "secretaryEmail": "Ashi7142@gmail.com",
    "secretaryPhone": "8851645688",
    "initiatives": []
  },
  {
    "id": "c56",
    "name": "Rotaract Club of Young Souvenirs",
    "shortName": "Young Souvenirs",
    "zone": "Zone Vayu",
    "lat": 28.643743296205415,
    "lng": 77.16302179498724,
    "president": "Rtr. Tanisha Sharma",
    "isDirector": "",
    "phone": "9599668561",
    "email": "Tanishasharma080504@gmail.com",
    "rotaryId": "12131349",
    "secretary": "Rtr. Shashwat Chauhan",
    "secretaryEmail": "shashwatchauhan2003@gmail.com",
    "secretaryPhone": "8826290906",
    "initiatives": []
  },
  {
    "id": "c57",
    "name": "Rotaract Club of Apeejay Stya University",
    "shortName": "Apeejay Stya University",
    "zone": "Zone Akash",
    "lat": 28.605266667505276,
    "lng": 77.16478075390881,
    "president": "Rtr. Philip J. Dolo",
    "isDirector": "",
    "phone": "9266833394",
    "email": "dev.engrpjdolo24@gmail.com",
    "rotaryId": "12508967",
    "secretary": "Rtr. Aryan Pandey",
    "secretaryEmail": "aryanpandey38805@gmail.com",
    "secretaryPhone": "8368151747",
    "initiatives": []
  },
  {
    "id": "c58",
    "name": "Rotaract Club of DAVIM",
    "shortName": "DAVIM",
    "zone": "Zone Akash",
    "lat": 28.644675650019632,
    "lng": 77.20673624051283,
    "president": "Rtr. Kartik Kalra",
    "isDirector": "",
    "phone": "9266871474",
    "email": "kartikkalra30@gmail.com",
    "rotaryId": "12445301",
    "secretary": "Rtr. Sania Khatter",
    "secretaryEmail": "Khattersania@gmail.com",
    "secretaryPhone": "8130370710",
    "initiatives": []
  },
  {
    "id": "c59",
    "name": "Rotaract Club of DUSC",
    "shortName": "DUSC",
    "zone": "Zone Akash",
    "lat": 28.642824689631105,
    "lng": 77.13521916969138,
    "president": "Rtr. Sehajleen Kaur",
    "isDirector": "",
    "phone": "8377036954",
    "email": "ksehajleen19@gmail.com",
    "rotaryId": "12702754",
    "secretary": "Rtr. Lakshita Bansal",
    "secretaryEmail": "lakshitabansal2022@gmail.com",
    "secretaryPhone": "7835907905",
    "initiatives": []
  },
  {
    "id": "c60",
    "name": "Rotaract Club of Delhi Allure Midwest",
    "shortName": "Delhi Allure Midwest",
    "zone": "Zone Akash",
    "lat": 28.644300826739187,
    "lng": 77.10414318553428,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.delhialluremidwest@district3011.org",
    "rotaryId": "12310558",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c61",
    "name": "Rotaract Club of Delhi Genesis",
    "shortName": "Delhi Genesis",
    "zone": "Zone Akash",
    "lat": 28.64027401038402,
    "lng": 77.15165268111467,
    "president": "Rtr. Rishi Upadhyay",
    "isDirector": "",
    "phone": "8882350472",
    "email": "rtrrishiupadhyay@gmail.com",
    "rotaryId": "12414224",
    "secretary": "Rtr. Swadha Goswami",
    "secretaryEmail": "swadhagoswami2007@gmail.com",
    "secretaryPhone": "9759533433",
    "initiatives": []
  },
  {
    "id": "c62",
    "name": "Rotaract Club of Delhi Genesis Midwest",
    "shortName": "Delhi Genesis Midwest",
    "zone": "Zone Akash",
    "lat": 28.675526798244587,
    "lng": 77.18746730958935,
    "president": "Rtr. Aditi Singhal",
    "isDirector": "",
    "phone": "9953926024",
    "email": "aditi.singhal0706@gmail.com",
    "rotaryId": "12214363",
    "secretary": "Rtr. Manvi Khajuria",
    "secretaryEmail": "Manvikhajuria.work@gmail.com",
    "secretaryPhone": "9910639168",
    "initiatives": []
  },
  {
    "id": "c63",
    "name": "Rotaract Club of Delhi Janak",
    "shortName": "Delhi Janak",
    "zone": "Zone Akash",
    "lat": 28.550420727783422,
    "lng": 77.1547240247481,
    "president": "Rtr. Tanushka Arora",
    "isDirector": "",
    "phone": "9911237337",
    "email": "Aroratanushka16@gmail.com",
    "rotaryId": "12541676",
    "secretary": "Rtr. Aditya Dev",
    "secretaryEmail": "adityadev0702@gmail.com",
    "secretaryPhone": "9311236557",
    "initiatives": []
  },
  {
    "id": "c64",
    "name": "Rotaract Club of Delhi Phoenix Midwest",
    "shortName": "Delhi Phoenix Midwest",
    "zone": "Zone Akash",
    "lat": 28.651786195533656,
    "lng": 77.0511359214187,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.delhiphoenixmidwest@district3011.org",
    "rotaryId": "12215238",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c65",
    "name": "Rotaract Club of Delhi Yuva",
    "shortName": "Delhi Yuva",
    "zone": "Zone Akash",
    "lat": 28.68643765012802,
    "lng": 77.248710332853,
    "president": "Rtr. Lalit Panghal",
    "isDirector": "",
    "phone": "8178634241",
    "email": "lalit.panghal4645@gmail.com",
    "rotaryId": "12118414",
    "secretary": "Rtr. Nitika Khatri",
    "secretaryEmail": "nitikakhatri663@gmail.com",
    "secretaryPhone": "7042209199",
    "initiatives": []
  },
  {
    "id": "c66",
    "name": "Rotaract Club of NSIT Regency",
    "shortName": "NSIT Regency",
    "zone": "Zone Akash",
    "lat": 28.5996733496121,
    "lng": 77.22214731644159,
    "president": "Rtr. Aman Devedi",
    "isDirector": "",
    "phone": "8929279448",
    "email": "amandevedi272@gmail.com",
    "rotaryId": "1214497.0",
    "secretary": "Rtr. Gayatri Rana",
    "secretaryEmail": "ranagayatri9090@gmail.com",
    "secretaryPhone": "9818989003",
    "initiatives": []
  },
  {
    "id": "c67",
    "name": "Rotaract Club of Indraprastha College for Women (DU)",
    "shortName": "Indraprastha College for Women (DU)",
    "zone": "Zone Akash",
    "lat": 28.606770270485963,
    "lng": 77.03568193482985,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.indraprasthacollegeforwomendu@district3011.org",
    "rotaryId": "12222778",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c68",
    "name": "Rotaract Club of Meraki",
    "shortName": "Meraki",
    "zone": "Zone Akash",
    "lat": 28.653286611812966,
    "lng": 77.25231551466588,
    "president": "Rtr. Dipanita Das",
    "isDirector": "",
    "phone": "9971100320",
    "email": "dipanitadas101@gmail.com",
    "rotaryId": "12412615",
    "secretary": "Rtr. Afifa Rubani",
    "secretaryEmail": "xo.afifa0408@gmail.com",
    "secretaryPhone": "9667022125",
    "initiatives": []
  },
  {
    "id": "c69",
    "name": "Rotaract Club of NDIM",
    "shortName": "NDIM",
    "zone": "Zone Akash",
    "lat": 28.630619174654196,
    "lng": 77.14059397452324,
    "president": "Rtr. Tushar Chaudhary",
    "isDirector": "",
    "phone": "9289240902",
    "email": "tusharrchaudhary2005@gmail.com",
    "rotaryId": "12196843",
    "secretary": "Rtr. Kanishka Singh",
    "secretaryEmail": "Kanishkasingh3117@gmail.com",
    "secretaryPhone": "9211380247",
    "initiatives": []
  },
  {
    "id": "c70",
    "name": "Rotaract Club of SGT University",
    "shortName": "SGT University",
    "zone": "Zone Akash",
    "lat": 28.569211333667244,
    "lng": 77.06491522876735,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.sgtuniversity@district3011.org",
    "rotaryId": "12700841",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c71",
    "name": "Rotaract Club of Shri Ram College of Commerce",
    "shortName": "Shri Ram College of Commerce",
    "zone": "Zone Akash",
    "lat": 28.606630451948167,
    "lng": 77.22883923468433,
    "president": "Rtr. Srishty Priya",
    "isDirector": "",
    "phone": "9870597260",
    "email": "srishtypriya05@gmail.com",
    "rotaryId": "12061748",
    "secretary": "Rtr. Rishika Ranjan",
    "secretaryEmail": "rishikaranjan.rotaractsrcc@gmail.com",
    "secretaryPhone": "9262869926",
    "initiatives": []
  },
  {
    "id": "c72",
    "name": "Rotaract Club of The North'Cap University",
    "shortName": "The North'Cap University",
    "zone": "Zone Akash",
    "lat": 28.66617932415963,
    "lng": 77.16437364711133,
    "president": "Rtr. Devina Sharma",
    "isDirector": "",
    "phone": "7696661990",
    "email": "23llb006@ncuindia.edu",
    "rotaryId": "12132183",
    "secretary": "Rtr. Aryan Yadav",
    "secretaryEmail": "arryaan30@gmail.com",
    "secretaryPhone": "8290610907",
    "initiatives": []
  },
  {
    "id": "c73",
    "name": "Rotaract Club of Virasat",
    "shortName": "Virasat",
    "zone": "Zone Akash",
    "lat": 28.573141676086873,
    "lng": 77.11234740790611,
    "president": "Rtr. Club President",
    "isDirector": "",
    "phone": "9811000000",
    "email": "rac.virasat@district3011.org",
    "rotaryId": "12128994",
    "secretary": "Rtr. Club Secretary",
    "secretaryEmail": "",
    "secretaryPhone": "",
    "initiatives": []
  },
  {
    "id": "c74",
    "name": "Rotaract Club of Visioners League",
    "shortName": "Visioners League",
    "zone": "Zone Akash",
    "lat": 28.632015934136643,
    "lng": 77.2295976744302,
    "president": "Rtr. Anjali Pawar",
    "isDirector": "",
    "phone": "9315534633",
    "email": "anjalipawar282006@gmail.com",
    "rotaryId": "N/A",
    "secretary": "Rtr. Lakshay Nandwani",
    "secretaryEmail": "lakshyanandwani40@gmail.com",
    "secretaryPhone": "9429093090",
    "initiatives": []
  },
  {
    "id": "c75",
    "name": "Rotaract Club of World Without Childhood Blindness",
    "shortName": "World Without Childhood Blindness",
    "zone": "Zone Akash",
    "lat": 28.584649499545282,
    "lng": 77.27127898053878,
    "president": "Rtr. Priyanshi Aggarwal",
    "isDirector": "",
    "phone": "9319419618",
    "email": "Priyanshiiaggarwal25@gmail.com",
    "rotaryId": "12186432",
    "secretary": "Rtr. Adhira Binny",
    "secretaryEmail": "binnyadhira@gmail.com",
    "secretaryPhone": "9891998320",
    "initiatives": []
  }
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
    photo: "/leadership/divyanshu-katiyar.jpeg",
    order: 3
  },
  {
    id: "lead-04",
    name: "Rtr. Rajat Kapoor",
    role: "District Chair - Operations",
    email: "rajatkapoor44@gmail.com",
    phone: "7838923776",
    category: "Executive Council",
    photo: "/leadership/rajat-kapoor.jpg",
    order: 4
  },
  {
    id: "lead-05",
    name: "Rtr. Sarthak Manchanda",
    role: "District Chair - Administration",
    email: "sarthakmanchanda2@gmail.com",
    phone: "7206708029",
    category: "Executive Council",
    photo: "/leadership/sarthak-manchanda.jpg",
    order: 5
  },
  {
    id: "lead-06",
    name: "Rtr. Shefali Prakash",
    role: "District Rotaract General Secretary",
    email: "rtrshefali2004@gmail.com",
    phone: "8826376323",
    category: "Executive Council",
    photo: "/leadership/shefali-prakash.jpg",
    order: 6
  },
  {
    id: "lead-07",
    name: "Rtn. Rtr. Himanshu Gulati",
    role: "District Rotaract Secretary - Reporting",
    email: "himanshugulati.rotary@gmail.com",
    phone: "9643889803",
    category: "Executive Council",
    photo: "/leadership/himanshu-gulati.jpg",
    order: 7
  },
  {
    id: "lead-08",
    name: "Rtr. Harshita Malhotra",
    role: "District Rotaract Secretary - Administration",
    email: "harshitam2636@gmail.com",
    phone: "9315267609",
    category: "Executive Council",
    photo: "/leadership/harshita-malhotra.jpeg",
    order: 8
  },
  {
    id: "lead-09",
    name: "Rtr. Ayush Rai",
    role: "Assistant District Rotaract Representative",
    email: "aayushrai68@gmail.com",
    phone: "7065668589",
    category: "Executive Council",
    photo: "/leadership/ayush-rai.png",
    order: 9
  },
  {
    id: "lead-10",
    name: "PHF Rtr. Radhika Bansal",
    role: "Assistant District Rotaract Representative",
    email: "rtr.radhikabansal23@gmail.com",
    phone: "8826274877",
    category: "Executive Council",
    photo: "/leadership/radhika-bansal.png",
    order: 10
  },
  {
    id: "lead-11",
    name: "Rtn. Rtr. Harshit Mehta",
    role: "District Treasurer",
    email: "rtrharshit0403@gmail.com",
    phone: "9899424822",
    category: "Executive Council",
    photo: "/leadership/harshit-mehta.jpg",
    order: 11
  },
  {
    id: "lead-12",
    name: "Rtr. V Tushaar",
    role: "District Sergeant at Arms",
    email: "rtr.tushaar@gmail.com",
    phone: "9667836167",
    category: "Executive Council",
    photo: "/leadership/v-tushaar.jpeg",
    order: 12
  },
  {
    id: "lead-13",
    name: "Rtr. Drishti Buttan",
    role: "District Sergeant at Arms",
    email: "drishtibuttan12@gmail.com",
    phone: "9773728313",
    category: "Executive Council",
    photo: "/leadership/drishti-buttan.jpeg",
    order: 13
  },
  {
    id: "lead-14",
    name: "Rtr. Tanishaa Sonker",
    role: "Zonal Rotaract Representative",
    email: "tanishaasonker08@gmail.com",
    phone: "9305833297",
    category: "Zonal Team",
    photo: "/leadership/tanishaa-sonker.jpeg",
    order: 14
  },
  {
    id: "lead-15",
    name: "Rtn. Rtr. Kanav Sachdeva",
    role: "Zonal Rotaract Representative",
    email: "sachdevakanav3@gmail.com",
    phone: "9821909169",
    category: "Zonal Team",
    photo: "/leadership/kanav-sachdeva.jpg",
    order: 15
  },
  {
    id: "lead-16",
    name: "Rtr. Dhruv Kumar Jha",
    role: "Zonal Rotaract Representative",
    email: "rtrdhruvjha@gmail.com",
    phone: "9534987772",
    category: "Zonal Team",
    photo: "/leadership/dhruv-kumar-jha.jpg",
    order: 16
  },
  {
    id: "lead-17",
    name: "Rtr. Palak Jain",
    role: "Zonal Rotaract Representative",
    email: "palak041003@gmail.com",
    phone: "8218365157",
    category: "Zonal Team",
    photo: "/leadership/palak-jain.jpeg",
    order: 17
  },
  {
    id: "lead-18",
    name: "Rtr. Arjun Pratap Singh",
    role: "Zonal Rotaract Secretary",
    email: "stormk375@gmail.com",
    phone: "9318317554",
    category: "Zonal Team",
    photo: "/leadership/arjun-pratap-singh.jpeg",
    order: 18
  },
  {
    id: "lead-19",
    name: "Rtr. Pratham Girdhar",
    role: "Zonal Rotaract Secretary",
    email: "prathamgirdhar08@gmail.com",
    phone: "7302495688",
    category: "Zonal Team",
    photo: "/leadership/pratham-girdhar.jpeg",
    order: 19
  },
  {
    id: "lead-20",
    name: "Rtr. Kartik Kumar",
    role: "Zonal Rotaract Secretary",
    email: "kartiksingh15082005@gmail.com",
    phone: "9582323419",
    category: "Zonal Team",
    photo: "/leadership/kartik-kumar.jpg",
    order: 20
  },
  {
    id: "lead-21",
    name: "Rtr. Hitaishi Chawla",
    role: "Zonal Rotaract Secretary",
    email: "rtrhitaishichawla@gmail.com",
    phone: "9810410704",
    category: "Zonal Team",
    photo: "/leadership/hitaishi-chawla.png",
    order: 21
  },
  {
    id: "lead-22",
    name: "Rtr. Ritik Varshney",
    role: "District Chair - Rotaract Inter-District Exchange (RIDE)",
    email: "ritikvarshney483@gmail.com",
    phone: "8006911311",
    category: "District Chairs",
    photo: "/leadership/ritik-varshney.jpg",
    order: 22
  },
  {
    id: "lead-23",
    name: "Rtr. Yashika Malhotra",
    role: "District Chair - Membership",
    email: "yashika11malhotra@gmail.com",
    phone: "8287628612",
    category: "District Chairs",
    photo: "/leadership/yashika-malhotra.jpeg",
    order: 23
  },
  {
    id: "lead-24",
    name: "Rtr. Nishith Majumdar",
    role: "District Chair - Community Services",
    email: "nishithmajumdar8@gmail.com",
    phone: "7011079558",
    category: "District Chairs",
    photo: "/leadership/nishith-majumdar.jpeg",
    order: 24
  },
  {
    id: "lead-25",
    name: "Rtr. Efaa Jafri",
    role: "District Chair - Community Services",
    email: "rtrefaajafri20@gmail.com",
    phone: "9311632069",
    category: "District Chairs",
    photo: "/leadership/efaa-jafri.png",
    order: 25
  },
  {
    id: "lead-26",
    name: "Rtr. Harshita Agarwal",
    role: "District Chair - Community Services",
    email: "harshitaagarwal2704@gmail.com",
    phone: "8130120701",
    category: "District Chairs",
    photo: "/leadership/harshita-agarwal.jpg",
    order: 26
  },
  {
    id: "lead-27",
    name: "Rtr. Paridhi Rawat",
    role: "District Chair - Club Services",
    email: "rtrparidhirawat@gmail.com",
    phone: "8860409982",
    category: "District Chairs",
    photo: "/leadership/paridhi-rawat.jpeg",
    order: 27
  },
  {
    id: "lead-28",
    name: "Rtr. Aryan Sanjeev",
    role: "District Chair - Club Services",
    email: "rtrarynsnjv@gmail.com",
    phone: "8826880497",
    category: "District Chairs",
    photo: "/leadership/aryan-sanjeev.jpg",
    order: 28
  },
  {
    id: "lead-29",
    name: "Rtr. Rachit Kathuria",
    role: "District Chair - Vocational Services",
    email: "rtrrachitkathuria@gmail.com",
    phone: "8851974024",
    category: "District Chairs",
    photo: "/leadership/rachit-kathuria.png",
    order: 29
  },
  {
    id: "lead-30",
    name: "Rtr. Sejal Mishra",
    role: "District Chair - Vocational Services",
    email: "sejalmishra432@gmail.com",
    phone: "9625817125",
    category: "District Chairs",
    photo: "/leadership/sejal-mishra.png",
    order: 30
  },
  {
    id: "lead-31",
    name: "Rtr. Prashant Joshi",
    role: "District Chair - International Services",
    email: "prashantjoshi8088@gmail.com",
    phone: "7300685437",
    category: "District Chairs",
    photo: "/leadership/prashant-joshi.png",
    order: 31
  },
  {
    id: "lead-32",
    name: "Rtr. Saransh Srivastava",
    role: "District Chair - International Services",
    email: "rtrsaranshsrivastava@gmail.com",
    phone: "9599550719",
    category: "District Chairs",
    photo: "/leadership/saransh-srivastava.png",
    order: 32
  },
  {
    id: "lead-33",
    name: "Rtr. Shubham Singh",
    role: "District Chair - International Services",
    email: "singh.shubham1901@gmail.com",
    phone: "7900542995",
    category: "District Chairs",
    photo: "/leadership/shubham-singh.jpg",
    order: 33
  },
  {
    id: "lead-34",
    name: "Rtr. Bhavya Mehta",
    role: "District Chair - Gender Development",
    email: "rtrbhavyamehta@gmail.com",
    phone: "9899834027",
    category: "District Chairs",
    photo: "/leadership/bhavya-mehta.jpg",
    order: 34
  },
  {
    id: "lead-35",
    name: "Rtr. Yashica Chaudhary",
    role: "District Chair - Rotaract - Interact Relations",
    email: "yashicachaudhary2026@gmail.com",
    phone: "9717832715",
    category: "District Chairs",
    photo: "/leadership/yashica-chaudhary.png",
    order: 35
  },
  {
    id: "lead-36",
    name: "Rtr. Avni Bhatia",
    role: "District Co- Chair - Rotaract - Interact Relations",
    email: "avnibhatia0707@gmail.com",
    phone: "7982927168",
    category: "District Chairs",
    photo: "/leadership/avni-bhatia.jpeg",
    order: 36
  },
  {
    id: "lead-37",
    name: "Rtr. Jatin Mugrai",
    role: "District Co- Chair - Rotaract - Interact Relations",
    email: "jatin.mugrai25@gmail.com",
    phone: "9355456999",
    category: "District Chairs",
    photo: "/leadership/jatin-mugrai.jpg",
    order: 37
  },
  {
    id: "lead-38",
    name: "Rtr. Shreya Singh",
    role: "District Chair - Corporate Relations",
    email: "shreyaasinghh585@gmail.com",
    phone: "6307097958",
    category: "District Chairs",
    photo: "/leadership/shreya-singh.jpeg",
    order: 38
  },
  {
    id: "lead-39",
    name: "Rtr. Apurv Jain",
    role: "District Chair - Corporate Relations",
    email: "apurvjain2003@gmail.com",
    phone: "9992829846",
    category: "District Chairs",
    photo: "/leadership/apurv-jain.jpeg",
    order: 39
  },
  {
    id: "lead-40",
    name: "Rtr. Yaman Puri",
    role: "District Chair - Sponsorship",
    email: "yamanpuri@outlook.in",
    phone: "8750411555",
    category: "District Chairs",
    photo: "/leadership/yaman-puri.jpeg",
    order: 40
  },
  {
    id: "lead-41",
    name: "Rtr. Jayant Kumar Sharma",
    role: "District Chair - Multimedia",
    email: "jayantsharmacreates@gmail.com",
    phone: "8862827515",
    category: "District Chairs",
    photo: "/leadership/jayant-kumar-sharma.jpeg",
    order: 41
  },
  {
    id: "lead-42",
    name: "Rtr. Ashi Gupta",
    role: "District Chair - Multimedia",
    email: "ashi7142@gmail.com",
    phone: "8851645688",
    category: "District Chairs",
    photo: "/leadership/ashi-gupta.jpeg",
    order: 42
  },
  {
    id: "lead-43",
    name: "Rtr. Mayur Pandita",
    role: "District Chair - Social Media",
    email: "mayurpandita7@gmail.com",
    phone: "9906981963",
    category: "District Chairs",
    photo: "/leadership/mayur-pandita.jpeg",
    order: 43
  },
  {
    id: "lead-44",
    name: "Rtr. Mukta Kumari",
    role: "District Editor",
    email: "muktakumari1811@gmail.com",
    phone: "8368803505",
    category: "District Chairs",
    photo: "/leadership/mukta-kumari.png",
    order: 44
  },
  {
    id: "lead-45",
    name: "Rtr. Durgesh K Chaudhary",
    role: "District Photographer",
    email: "durgesh.ly22@gmail.com",
    phone: "7462893778",
    category: "District Chairs",
    photo: "/leadership/durgesh-k-chaudhary.jpg",
    order: 45
  },
  {
    id: "lead-46",
    name: "Rtr. Rajveer Singh Marwah",
    role: "District Chair - Technology",
    email: "jasraj2626@gmail.com",
    phone: "9315218284",
    category: "District Chairs",
    photo: "/leadership/rajveer-singh-marwah.jpg",
    order: 46
  },
  {
    id: "lead-47",
    name: "Rtr. Mehul Buttan",
    role: "District Co-Chair - Technology",
    email: "mehulbuttan85@gmail.com",
    phone: "8377842506",
    category: "District Chairs",
    photo: "/leadership/mehul-buttan.jpg",
    order: 47
  },
  {
    id: "lead-48",
    name: "Rtr. Vrinda Garg",
    role: "District Web Administrator",
    email: "vrinda.garg1998@gmail.com",
    phone: "9871577088",
    category: "District Chairs",
    photo: "/leadership/vrinda-garg.jpg",
    order: 48
  },
  {
    id: "lead-49",
    name: "Rtr. Parth Agarwal",
    role: "District Web Administrator",
    email: "thisisparthagarwal@gmail.com",
    phone: "7011638319",
    category: "District Chairs",
    photo: "/leadership/parth-agarwal.jpg",
    order: 49
  },
  {
    id: "lead-50",
    name: "Rtr. Dhruvika Chopra",
    role: "District Chair - Artificial Intelligence",
    email: "dhruvika038@gmail.com",
    phone: "7303530476",
    category: "District Chairs",
    photo: "/leadership/dhruvika-chopra.jpeg",
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
