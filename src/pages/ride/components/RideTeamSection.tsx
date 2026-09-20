import { HeartHandshake } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  designation?: string;
  image: string;
  tagline: string;
  accentColor: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'DRR PHF Rtn. Rtr. Archit Bhatia',
    role: 'DRR',
    designation: 'District Rotaract Representative · RID 3011',
    image: '/leadership/archit-bhatia.webp',
    tagline: 'Empowering youth diplomacy, leadership excellence, and national Rotaract fellowship.',
    accentColor: '#C72425',
  },
  {
    name: 'Rtr. Divyanshu Katiyar',
    role: 'Deputy DRR',
    designation: 'Deputy District Rotaract Representative · RID 3011',
    image: '/leadership/divyanshu-katiyar.webp',
    tagline: 'Spearheading district administration, strategic partnerships, and delegate immersion.',
    accentColor: '#19539D',
  },
  {
    name: 'Rtr. Shefali Prakash',
    role: 'DRS',
    designation: 'District Rotaract Secretary · RID 3011',
    image: '/leadership/shefali-prakash.webp',
    tagline: 'Guiding governance, delegation communications, and seamless administrative stewardship.',
    accentColor: '#EA6623',
  },
  {
    name: 'Rtr. Ritik Varshney',
    role: 'RIDE Chair',
    designation: 'Project Lead · Delhi Meri Jaan',
    image: '/leadership/ritik-varshney.webp',
    tagline: 'Leading the flagship national exchange experience for RID 3011.',
    accentColor: '#EA6623',
  },
  {
    name: 'Rtr. Sejal Mishra',
    role: 'Exchange Coordinator',
    designation: 'Liaison & Delegate Relations',
    image: '/leadership/sejal-mishra.webp',
    tagline: 'Curating homestay warmth and hospitality across the capital.',
    accentColor: '#19539D',
  },
  {
    name: 'Rtr. Prashant Joshi',
    role: 'Logistics Head',
    designation: 'Logistics & Transit Lead · Delhi Safari',
    image: '/leadership/prashant-joshi.webp',
    tagline: 'Orchestrating seamless travel, metro trails, and historical excursions.',
    accentColor: '#59A835',
  },
  {
    name: 'Rtr. Saransh Srivastava',
    role: 'Homestay Chair',
    designation: 'Homestay & Hospitality Chair · RID 3011',
    image: '/leadership/saransh-srivastava.webp',
    tagline: 'Connecting incoming delegates with warm, authentic Delhi host families.',
    accentColor: '#FBC02D',
  },
  {
    name: 'Rtr. Shubham Singh',
    role: 'Protocol Officer',
    designation: 'Protocol & Safety Officer · RID 3011',
    image: '/leadership/shubham-singh.webp',
    tagline: 'Ensuring round-the-clock delegate care, safety, and inter-district etiquette.',
    accentColor: '#8E24AA',
  },
];

export function RideTeamSection() {
  return (
    <section id="our-team" className="py-20 sm:py-28 px-4 sm:px-10 lg:px-20 xl:px-28 w-full bg-[#FFFDF7] border-t-3 border-[#171515]">
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 sm:border-3 border-[#171515] bg-[#19539D] text-white text-xs sm:text-sm font-black uppercase mb-3 ride-pop-sm">
            <HeartHandshake size={16} />
            <span>The Stewards of DMJ</span>
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#171515] tracking-tight uppercase">
            Our Organizing Team
          </h2>
          <p className="text-base sm:text-xl text-neutral-600 max-w-3xl mx-auto mt-4 font-semibold">
            The dedicated district leaders and exchange stewards bringing Delhi Meri Jaan 2026 to life with passion, hospitality, and pride.
          </p>
        </div>

        {/* 8 Team Cards Grid (4 cols on large, 2 cols on tablet/mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="group rounded-3xl border-3 border-[#171515] bg-white p-5 ride-pop-hover flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
            >
              {/* Card Accent Top Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: member.accentColor }}
              />

              <div>
                {/* Member Portrait */}
                <div className="relative aspect-[4/5] w-full rounded-2xl border-2 border-[#171515] overflow-hidden bg-neutral-100 mb-5 shadow-sm group-hover:shadow-md transition-shadow">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className="px-3 py-1 rounded-full border-2 border-[#171515] text-white text-xs font-black uppercase tracking-wider ride-pop-sm shadow-sm"
                      style={{ backgroundColor: member.accentColor }}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-xl sm:text-2xl font-black text-[#171515] tracking-tight leading-snug">
                  {member.name}
                </h3>
                {member.designation && (
                  <p className="text-xs font-bold text-neutral-500 mt-1 uppercase tracking-wider">
                    {member.designation}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-neutral-600 mt-3 leading-relaxed font-medium">
                  {member.tagline}
                </p>
              </div>

              {/* Bottom Badge */}
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-neutral-500">
                <span>Rotaract District 3011</span>
                <span className="text-[#EA6623]">DMJ • 2026</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
