import { useState } from 'react';
import { Camera, MapPin, Image as ImageIcon } from 'lucide-react';

interface PhotoItem {
  id: string;
  title: string;
  location: string;
  edition: string;
  category: string;
  photographer: string;
  imageUrl: string;
  aspectClass: string;
  colSpanClass: string;
}

const FEATURED_PHOTOS: PhotoItem[] = [
  {
    id: 'p1',
    title: 'Kartavya Path Twilight & Tricolor Illumination',
    location: 'India Gate, New Delhi',
    edition: 'Edition 2026',
    category: 'Monuments',
    photographer: 'Rotaract 3011 Media Crew',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop',
    aspectClass: 'aspect-[16/10]',
    colSpanClass: 'md:col-span-8',
  },
  {
    id: 'p2',
    title: 'Morning Sun Through Shahjahanabad Arches',
    location: 'Jama Masjid, Old Delhi',
    edition: 'Edition 2025',
    category: 'Heritage Trail',
    photographer: 'Exchange Photo Leads',
    imageUrl: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?q=80&w=1000&auto=format&fit=crop',
    aspectClass: 'aspect-[4/5]',
    colSpanClass: 'md:col-span-4',
  },
  {
    id: 'p3',
    title: 'Sizzling Stuffed Paranthas & Clay Tapri Chai',
    location: 'Paranthe Wali Gali, Chandni Chowk',
    edition: 'Edition 2025',
    category: 'Culinary Safari',
    photographer: 'Food Trail Curators',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop',
    aspectClass: 'aspect-[4/3]',
    colSpanClass: 'md:col-span-4',
  },
  {
    id: 'p4',
    title: 'Lal Qila Sandstone Poetry & Azure Skies',
    location: 'Red Fort, Delhi',
    edition: 'Edition 2024',
    category: 'Mughal Splendor',
    photographer: 'District Archives',
    imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1400&auto=format&fit=crop',
    aspectClass: 'aspect-[16/9]',
    colSpanClass: 'md:col-span-8',
  },
  {
    id: 'p5',
    title: 'Humayun’s Tomb Gardens at Golden Hour',
    location: 'Nizamuddin East',
    edition: 'Edition 2024',
    category: 'World Heritage',
    photographer: 'Media Directorate',
    imageUrl: 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?q=80&w=1400&auto=format&fit=crop',
    aspectClass: 'aspect-[16/9]',
    colSpanClass: 'md:col-span-6',
  },
  {
    id: 'p6',
    title: 'Dilli Tapri Hospitality & Warm Homestays',
    location: 'South Delhi Host Clubs',
    edition: 'Edition 2026',
    category: 'Homestay Moments',
    photographer: 'Host Committee',
    imageUrl: 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=1400&auto=format&fit=crop',
    aspectClass: 'aspect-[16/9]',
    colSpanClass: 'md:col-span-6',
  },
];

export function NativePhotoShowcase() {
  const [filter, setFilter] = useState<'ALL' | 'Monuments' | 'Heritage Trail' | 'Culinary Safari'>('ALL');

  const displayed = filter === 'ALL' ? FEATURED_PHOTOS : FEATURED_PHOTOS.filter((p) => p.category === filter);

  return (
    <section id="gallery" className="py-20 sm:py-28 px-4 sm:px-8 lg:px-14 xl:px-20 w-full bg-[#111111] text-white">
      <div className="w-full max-w-[1720px] mx-auto space-y-12">
        {/* Editorial Header in nativecontent.com Style */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/15">
          <div className="space-y-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/25 bg-white/5 backdrop-blur-md text-xs font-mono uppercase tracking-widest text-[#FBC02D]">
              <Camera size={14} />
              <span>Native Photo Showcase · Delhi Meri Jaan</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.92]">
              Delhi Through Our Lens
            </h2>
            <p className="text-base sm:text-xl text-neutral-400 font-medium max-w-2xl leading-relaxed">
              Curated editorial glimpses from previous exchange editions and upcoming 2026 trails. Raw monuments, street delicacies, and lifetime camaraderie.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'Monuments', 'Heritage Trail', 'Culinary Safari'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  filter === cat
                    ? 'bg-white text-black font-black'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7">
          {displayed.map((photo) => (
            <div
              key={photo.id}
              className={`${photo.colSpanClass} group relative rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl transition-all duration-500 hover:border-white/40`}
            >
              <div className={`w-full ${photo.aspectClass} overflow-hidden relative`}>
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />

                {/* Top Location & Edition Pills */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-[11px] font-mono uppercase tracking-wider text-white">
                    {photo.category}
                  </span>
                  <span className="px-3 py-1 rounded-full border border-white/20 bg-[#EA6623] text-[11px] font-bold text-white shadow-sm">
                    {photo.edition}
                  </span>
                </div>

                {/* Bottom Editorial Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white/70 text-xs font-mono">
                    <MapPin size={13} className="text-[#C72425]" />
                    <span>{photo.location}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    {photo.title}
                  </h3>

                  <div className="flex items-center justify-between pt-3 border-t border-white/15 text-[11px] font-mono text-white/50 mt-1">
                    <span>Captured by {photo.photographer}</span>
                    <span className="text-[#FBC02D] font-bold">RID 3011</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Clean Placeholder Card for Incoming 2026 Event Photos */}
          <div className="md:col-span-12 rounded-3xl border-2 border-dashed border-white/20 bg-white/[0.02] p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#FBC02D]">
              <ImageIcon size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black uppercase tracking-tight text-white">
                Live Event Dumps Coming Soon · Delhi Meri Jaan 2026
              </h4>
              <p className="text-xs text-neutral-400 max-w-xl mx-auto font-mono">
                High-resolution albums, delegate candids, monument drone footage, and gala ball captures will populate here live during the exchange dates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
