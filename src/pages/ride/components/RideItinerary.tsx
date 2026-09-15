import { useState } from 'react';
import { Compass, Clock, MapPin, Coffee, Utensils, Flag } from 'lucide-react';

interface ItineraryDay {
  day: number;
  dateStr: string;
  title: string;
  subtitle: string;
  color: string;
  badge: string;
  timeline: {
    time: string;
    activity: string;
    description: string;
    location: string;
    type: 'travel' | 'food' | 'culture' | 'fellowship';
  }[];
}

const ITINERARY: ItineraryDay[] = [
  {
    day: 1,
    dateStr: 'Day 1 • Thursday',
    title: 'Dastak-e-Dilli',
    subtitle: 'The Arrival & Homestay Warmth',
    color: '#19539D',
    badge: 'Arrivals & Icebreakers',
    timeline: [
      {
        time: '10:00 AM - 03:00 PM',
        activity: 'Swagat & Airport/Station Reception',
        description: 'Warm Rotaract welcome desks at IGI Airport T3 and New Delhi Railway Station with garlands and chilled Chaas.',
        location: 'IGI Airport / NDLS Station',
        type: 'travel',
      },
      {
        time: '04:30 PM - 06:00 PM',
        activity: 'Host Family Settlement & Chai Pe Charcha',
        description: 'Delegates meet their loving host families across Delhi NCR, unpack, and experience authentic Dilli hospitality.',
        location: 'Host Club Residences',
        type: 'fellowship',
      },
      {
        time: '07:30 PM - 10:30 PM',
        activity: 'Dilli Haat Icebreaker & Street Food Carnival',
        description: 'First grand gathering under fairy lights with folk musicians, momos, chaat, and team icebreaker games.',
        location: 'Dilli Haat, INA',
        type: 'food',
      },
    ],
  },
  {
    day: 2,
    dateStr: 'Day 2 • Friday',
    title: 'Shahjahanabad Safari',
    subtitle: 'Old Delhi Heritage & Spice Labyrinths',
    color: '#C72425',
    badge: 'Heritage & Food Trail',
    timeline: [
      {
        time: '08:30 AM - 11:30 AM',
        activity: 'Red Fort & Jama Masjid Heritage Walk',
        description: 'Historic guided expedition through the Mughal sandstone ramparts with professional heritage historians.',
        location: 'Lal Qila & Jama Masjid',
        type: 'culture',
      },
      {
        time: '12:00 PM - 02:30 PM',
        activity: 'Rickshaw Rally & Paranthe Wali Gali Feast',
        description: 'High-energy cycle rickshaw hunt through narrow alleys, tasting legendary stuffed paranthas and Rabri Jalebi.',
        location: 'Chandni Chowk',
        type: 'food',
      },
      {
        time: '03:30 PM - 06:00 PM',
        activity: 'Khari Baoli Spice Bazaar & Chai Stoppage',
        description: 'A sensory explosion at Asia’s largest spice market followed by cutting chai at roadside vintage stalls.',
        location: 'Khari Baoli',
        type: 'culture',
      },
      {
        time: '07:30 PM - 10:00 PM',
        activity: 'Rotary Friendship Exchange Dinner',
        description: 'Formal dinner with district governors and exchange committee leads celebrating international peace.',
        location: 'Rotary Sadan, Delhi',
        type: 'fellowship',
      },
    ],
  },
  {
    day: 3,
    dateStr: 'Day 3 • Saturday',
    title: 'Lutyens to Lodhi',
    subtitle: 'Modern Power Corridors & Sufi Twilight',
    color: '#EA6623',
    badge: 'Metro Rally & Sufi Night',
    timeline: [
      {
        time: '09:00 AM - 12:00 PM',
        activity: 'DMRC Metro Scavenger Challenge',
        description: 'Teams race across the Delhi Metro yellow and violet lines deciphering cultural clues and trivia.',
        location: 'Rajiv Chowk to Central Secretariat',
        type: 'culture',
      },
      {
        time: '12:30 PM - 03:00 PM',
        activity: 'India Gate Picnic & Street Food Quest',
        description: 'Strolling Kartavya Path, clicking team portraits, and savoring Chole Bhature and spicy Gol Gappe.',
        location: 'Kartavya Path & Khan Market',
        type: 'food',
      },
      {
        time: '03:30 PM - 06:00 PM',
        activity: 'Lodhi Open-Air Art District Walk',
        description: 'Exploring India’s first open-air public art district with towering murals painted by global street artists.',
        location: 'Lodhi Art Colony',
        type: 'culture',
      },
      {
        time: '07:00 PM - 10:00 PM',
        activity: 'Nizamuddin Dargah Sufi Qawwali Experience',
        description: 'Mesmerizing spiritual music and soul-stirring devotional poetry in the courtyard of Hazrat Nizamuddin Auliya.',
        location: 'Hazrat Nizamuddin Basti',
        type: 'fellowship',
      },
    ],
  },
  {
    day: 4,
    dateStr: 'Day 4 • Sunday',
    title: 'Jashn-e-Alvida',
    subtitle: 'The Grand Exchange Gala & Flag Exchange',
    color: '#59A835',
    badge: 'Diplomatic Gala & Farewell',
    timeline: [
      {
        time: '10:00 AM - 01:00 PM',
        activity: 'RID 3011 Youth Exchange Summit',
        description: 'Cross-district panel discussions, project presentations, and cultural showcase performances by delegates.',
        location: 'India International Centre (IIC)',
        type: 'culture',
      },
      {
        time: '01:30 PM - 03:00 PM',
        activity: 'Farewell Mughlai Lunch Buffet',
        description: 'Lavish traditional Mughlai feast with Dum Biryani, Paneer Tikka, and Shahi Tukda desserts.',
        location: 'Daryaganj Hall',
        type: 'food',
      },
      {
        time: '04:00 PM - 06:30 PM',
        activity: 'Official Rotary Flag & Pin Exchange',
        description: 'The sacred tradition of exchanging club banners, lapel pins, certificates, and lifelong fellowship mementos.',
        location: 'Main Auditorium',
        type: 'fellowship',
      },
      {
        time: '07:30 PM - Late Night',
        activity: 'The Royal Delhi Meri Jaan Gala Ball',
        description: 'Dhol beats, DJ night, photo booth memories, and heartfelt goodbyes to conclude an epic adventure.',
        location: 'Heritage Grand Ballroom',
        type: 'fellowship',
      },
    ],
  },
];

export function RideItinerary() {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const currentDay = ITINERARY[activeDayIndex];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Day Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8">
        {ITINERARY.map((day, idx) => {
          const isSelected = idx === activeDayIndex;
          return (
            <button
              key={day.day}
              type="button"
              onClick={() => setActiveDayIndex(idx)}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 border-[#171515] text-left transition-all ${
                isSelected
                  ? 'bg-white ride-pop scale-[1.02]'
                  : 'bg-[#FDFBF7] hover:bg-neutral-100 ride-pop-sm opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white"
                  style={{ backgroundColor: day.color }}
                >
                  D{day.day}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                  {day.dateStr.split('•')[1]?.trim()}
                </span>
              </div>
              <div className="font-extrabold text-sm text-[#171515] truncate">{day.title}</div>
            </button>
          );
        })}
      </div>

      {/* Active Day Content */}
      <div className="rounded-3xl border-3 border-[#171515] bg-white p-6 sm:p-8 ride-pop-lg">
        {/* Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b-2 border-neutral-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white border border-[#171515]"
                style={{ backgroundColor: currentDay.color }}
              >
                Day {currentDay.day}
              </span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{currentDay.badge}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#171515] tracking-tight">{currentDay.title}</h3>
            <p className="text-sm font-medium text-neutral-600 mt-0.5">{currentDay.subtitle}</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#171515] bg-[#F7F3E9] text-xs font-black">
            <Compass size={16} className="text-[#EA6623]" />
            <span>Curated RID 3011 Trail</span>
          </div>
        </div>

        {/* Timeline Events */}
        <div className="pt-6 space-y-6">
          {currentDay.timeline.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-2xl border-2 border-[#171515] bg-[#FDFBF7] ride-pop-sm hover:translate-x-1 transition-transform"
            >
              {/* Time pill */}
              <div className="sm:w-44 shrink-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#171515] bg-white text-xs font-black text-[#171515]">
                  <Clock size={13} className="text-[#C72425]" />
                  <span>{item.time}</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
                  <MapPin size={12} className="text-neutral-400" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              {/* Event detail */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-[#171515]">{item.activity}</span>
                  {item.type === 'food' && <Utensils size={14} className="text-[#EA6623]" />}
                  {item.type === 'fellowship' && <Flag size={14} className="text-[#19539D]" />}
                  {item.type === 'culture' && <Coffee size={14} className="text-[#59A835]" />}
                </div>
                <p className="text-sm text-neutral-700 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
