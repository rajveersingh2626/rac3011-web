import { useState, useRef } from 'react';
import { Volume2, VolumeX, MapPin, Camera, Sparkles, Filter } from 'lucide-react';

interface ReelItem {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  posterUrl?: string;
  caption: string;
  location: string;
  edition: '2026' | '2025' | '2024';
  photographer: string;
  aspectTag: string;
}

const REEL_ITEMS: ReelItem[] = [
  {
    id: '1',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1400&auto=format&fit=crop',
    caption: 'India Gate illuminated in tricolor at twilight - delegates gathering along Kartavya Path.',
    location: 'India Gate, New Delhi',
    edition: '2026',
    photographer: 'Rotaract 3011 Media Team',
    aspectTag: 'Iconic Delhi',
  },
  {
    id: '2',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?q=80&w=1400&auto=format&fit=crop',
    caption: 'The majestic arches of Jama Masjid bathed in morning gold as the Old Delhi safari commences.',
    location: 'Old Delhi, Shahjahanabad',
    edition: '2025',
    photographer: 'Exchange Photo Crew',
    aspectTag: 'Heritage Walk',
  },
  {
    id: '3',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1400&auto=format&fit=crop',
    caption: 'Sizzling tandoori delicacies and stuffed butter paranthas along the narrow gallis.',
    location: 'Paranthe Wali Gali',
    edition: '2025',
    photographer: 'Food Safari Leads',
    aspectTag: 'Food Trail',
  },
  {
    id: '4',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1400&auto=format&fit=crop',
    caption: 'Lal Qila sandstone majesty under an azure winter afternoon sky.',
    location: 'Red Fort, Delhi',
    edition: '2024',
    photographer: 'Dastaan-e-Delhi Team',
    aspectTag: 'Mughal Splendor',
  },
  {
    id: '5',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1400&auto=format&fit=crop',
    caption: 'Steaming hot, crispy samosas and chai served during host family welcomes.',
    location: 'Host Club Dilli Chai Tapri',
    edition: '2026',
    photographer: 'Homestay Committee',
    aspectTag: 'Dilli Chai',
  },
  {
    id: '6',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?q=80&w=1400&auto=format&fit=crop',
    caption: 'Humayun’s Tomb gardens at golden hour - the architectural inspiration of the Taj.',
    location: 'Nizamuddin East',
    edition: '2024',
    photographer: 'RID 3011 Archives',
    aspectTag: 'World Heritage',
  },
];

export function SnapGalleryReel() {
  const [filter, setFilter] = useState<'ALL' | '2026' | '2025' | '2024'>('ALL');
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = REEL_ITEMS.filter((item) => (filter === 'ALL' ? true : item.edition === filter));

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#171515] bg-white text-xs font-bold ride-pop-sm">
            <Filter size={14} className="text-[#EA6623]" />
            <span>Filter:</span>
          </div>
          {(['ALL', '2026', '2025', '2024'] as const).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFilter(tag)}
              className={`px-3 py-1.5 rounded-xl border-2 border-[#171515] text-xs font-black transition-all ${
                filter === tag
                  ? 'bg-[#19539D] text-white ride-pop-sm'
                  : 'bg-white text-[#171515] hover:bg-neutral-100'
              }`}
            >
              {tag === 'ALL' ? 'All Snaps' : tag}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#171515] bg-white text-xs font-bold ride-pop-sm hover:bg-amber-50"
        >
          {isMuted ? <VolumeX size={14} className="text-neutral-500" /> : <Volume2 size={14} className="text-[#59A835]" />}
          <span>{isMuted ? 'Muted' : 'Audio On'}</span>
        </button>
      </div>

      {/* Snap Feed: NativeContent style vertical snap reel */}
      <div
        ref={containerRef}
        className="ride-snap-feed h-[620px] rounded-3xl border-3 border-[#171515] bg-[#171515] ride-pop-lg overflow-y-auto space-y-4 p-4"
      >
        {filtered.map((item) => (
          <div
            key={item.id}
            className="ride-snap-card relative h-[580px] w-full rounded-2xl overflow-hidden border-2 border-[#171515] bg-neutral-900 group"
          >
            {/* Background Media */}
            <img
              src={item.mediaUrl}
              alt={item.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

            {/* Top Badge Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="px-3 py-1 rounded-full border-2 border-white/80 bg-black/60 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider">
                {item.aspectTag}
              </span>
              <span className="px-3 py-1 rounded-full border-2 border-white/80 bg-[#EA6623] text-white text-xs font-black">
                Edition {item.edition}
              </span>
            </div>

            {/* Bottom Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2 pointer-events-auto">
              <div className="flex items-center gap-2 text-white/90 text-xs font-bold">
                <MapPin size={14} className="text-[#C72425]" />
                <span>{item.location}</span>
              </div>

              <p className="text-white text-base sm:text-lg font-bold leading-snug drop-shadow-md">
                {item.caption}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/20 text-white/70 text-xs">
                <div className="flex items-center gap-1.5">
                  <Camera size={13} />
                  <span>{item.photographer}</span>
                </div>
                <div className="flex items-center gap-1 text-[#FBC02D] font-bold">
                  <Sparkles size={13} />
                  <span>#DelhiMeriJaan</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
