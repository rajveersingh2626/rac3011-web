import { useState } from 'react';
import { 
  ExternalLink, Copy, Check, Plus, 
  Search, HardDrive, Users, Building, ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';

export type ResourceCategory = 
  | 'guidelines'
  | 'passes'
  | 'hospitality'
  | 'transit'
  | 'media'
  | 'dossiers';

export type ResourceScope = 'all' | 'club' | 'member';

export interface DriveResource {
  id: string;
  title: string;
  category: ResourceCategory;
  scope: ResourceScope;
  targetClubName?: string;
  targetMemberEmail?: string;
  driveUrl: string;
  description: string;
  lastUpdated: string;
  fileCount?: number;
}

const CATEGORY_LABELS: Record<ResourceCategory, { label: string; tone: BadgeTone }> = {
  guidelines: { label: 'Guidelines & Safety', tone: 'blue' },
  passes: { label: 'Delegate ID & Passes', tone: 'pink' },
  hospitality: { label: 'Host Family Kits', tone: 'green' },
  transit: { label: 'Transit & Route Maps', tone: 'amber' },
  media: { label: 'PR & Media Assets', tone: 'neutral' },
  dossiers: { label: 'Executive Dossiers', tone: 'red' },
};

const INITIAL_RESOURCES: DriveResource[] = [
  {
    id: 'res-1',
    title: 'Official Delegate Information Kit & 4-Day Itinerary (DMJ 2026)',
    category: 'guidelines',
    scope: 'all',
    driveUrl: 'https://drive.google.com/drive/folders/1a_RIDE2026_Official_Delegate_Dossier',
    description: 'Master pack including check-in checkpoints, dress codes, Sufi night entry passes, and Old Delhi heritage trail route maps.',
    lastUpdated: '2026-09-10',
    fileCount: 8,
  },
  {
    id: 'res-2',
    title: 'Host Family Welcome & Emergency Protocol Handbook',
    category: 'hospitality',
    scope: 'club',
    targetClubName: 'RAC Delhi South Central',
    driveUrl: 'https://drive.google.com/drive/folders/1b_Host_Family_Welcome_Handbooks_2026',
    description: 'Checklist and dietary guidelines for Rotaractor families hosting outstation delegates in Hauz Khas and Greater Kailash.',
    lastUpdated: '2026-09-12',
    fileCount: 4,
  },
  {
    id: 'res-3',
    title: 'Delhi Metro Smart Token & Transit Transit Route Manifest',
    category: 'transit',
    scope: 'all',
    driveUrl: 'https://drive.google.com/drive/folders/1c_DMJ2026_DMRC_Transit_Manifests',
    description: 'Airport Express line guides, station coordination desks, and emergency shuttle dispatch schedules.',
    lastUpdated: '2026-09-14',
    fileCount: 6,
  },
  {
    id: 'res-4',
    title: 'Cultural Night Audio Tracks & Stage Lighting Cues',
    category: 'media',
    scope: 'member',
    targetMemberEmail: 'cultural.lead@rotaract3011.org',
    driveUrl: 'https://drive.google.com/drive/folders/1d_Stage_Cues_Performances_Master_Stems',
    description: 'High-definition master stems and backing tracks for state cultural performances and closing awards gala.',
    lastUpdated: '2026-09-15',
    fileCount: 12,
  },
  {
    id: 'res-5',
    title: 'Print-Ready Badge Artwork & Delegate NFC Lanyards',
    category: 'passes',
    scope: 'all',
    driveUrl: 'https://drive.google.com/drive/folders/1e_Print_Ready_Badges_Vector_Files',
    description: 'Vector SVG & CMYK PDF print files for delegate QR credentials with yellow metro-line lanyard borders.',
    lastUpdated: '2026-09-08',
    fileCount: 5,
  },
  {
    id: 'res-6',
    title: 'Host Club Bilateral Memorandums (Zonal Allotments)',
    category: 'dossiers',
    scope: 'club',
    targetClubName: 'All 75 District 3011 Clubs',
    driveUrl: 'https://drive.google.com/drive/folders/1f_Bilateral_Exchange_Agreements_Signed',
    description: 'Formal twin-club and hosting agreements countersigned by DRR Archit Bhatia and visiting District Chairs.',
    lastUpdated: '2026-09-05',
    fileCount: 15,
  },
];

export function RideResourcesPortalTab() {
  const [resources, setResources] = useState<DriveResource[]>(INITIAL_RESOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Resource Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ResourceCategory>('guidelines');
  const [newScope, setNewScope] = useState<ResourceScope>('all');
  const [newClubName, setNewClubName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newDriveUrl, setNewDriveUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const filteredResources = resources.filter((res) => {
    const matchesCategory = selectedCategory === 'all' || res.category === selectedCategory;
    const matchesScope = selectedScope === 'all' || res.scope === selectedScope;
    const matchesSearch = 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.targetClubName && res.targetClubName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.targetMemberEmail && res.targetMemberEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesScope && matchesSearch;
  });

  const handleCopyLink = (res: DriveResource) => {
    navigator.clipboard.writeText(res.driveUrl);
    setCopiedId(res.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAddResource = () => {
    if (!newTitle.trim() || !newDriveUrl.trim()) return;

    const created: DriveResource = {
      id: 'res-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      scope: newScope,
      targetClubName: newScope === 'club' ? newClubName.trim() : undefined,
      targetMemberEmail: newScope === 'member' ? newMemberEmail.trim() : undefined,
      driveUrl: newDriveUrl.trim(),
      description: newDescription.trim() || 'Official resource drive link for Delhi Meri Jaan 2026.',
      lastUpdated: new Date().toISOString().slice(0, 10),
      fileCount: 1,
    };

    setResources((prev) => [created, ...prev]);
    setAddModalOpen(false);
    setNewTitle('');
    setNewDriveUrl('');
    setNewDescription('');
    setNewClubName('');
    setNewMemberEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border-2 border-[#171515] bg-[#FFFDF7] ride-pop-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="text-[#EA6623]" size={20} />
            <h2 className="text-lg font-black text-[#171515] uppercase tracking-wide">
              Google Drive Resources & Relational Vault
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl font-medium">
            Serve and restrict official event drive directories, badge artwork, itineraries, and hosting dossiers dynamically mapped to authenticated clubs and members.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setAddModalOpen(true)}
          leading={<Plus size={15} />}
        >
          Attach Drive Link
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border-2 border-[#171515] ride-pop-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resource files, host club dossiers, or guidelines..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#19539D]"
            />
          </div>

          {/* Category Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold bg-neutral-50 text-neutral-700"
            >
              <option value="all">All Categories</option>
              <option value="guidelines">Guidelines & Safety</option>
              <option value="passes">Delegate ID & Passes</option>
              <option value="hospitality">Host Family Kits</option>
              <option value="transit">Transit & Route Maps</option>
              <option value="media">PR & Media Assets</option>
              <option value="dossiers">Executive Dossiers</option>
            </select>
          </div>

          {/* Scope Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold bg-neutral-50 text-neutral-700"
            >
              <option value="all">All Access Scopes</option>
              <option value="all">Public / All Participants</option>
              <option value="club">Club Restricted Only</option>
              <option value="member">Member Specific Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res) => {
          const categoryMeta = CATEGORY_LABELS[res.category] || { label: res.category, tone: 'neutral' };

          return (
            <Card
              key={res.id}
              rule="accent"
              padding="compact"
              className="border-2 border-[#171515] ride-pop-sm flex flex-col justify-between hover:scale-[1.01] transition-all bg-white"
            >
              <div className="space-y-3">
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge tone={categoryMeta.tone}>
                    {categoryMeta.label}
                  </Badge>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500">
                    {res.scope === 'all' && (
                      <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                        <Users size={11} /> All Delegates
                      </span>
                    )}
                    {res.scope === 'club' && (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                        <Building size={11} /> {res.targetClubName || 'Club Restricted'}
                      </span>
                    )}
                    {res.scope === 'member' && (
                      <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                        <ShieldCheck size={11} /> {res.targetMemberEmail || 'Member Locked'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Resource Title & Details */}
                <div>
                  <h3 className="text-sm font-black text-[#171515] leading-snug line-clamp-2">
                    {res.title}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1.5 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-neutral-400 font-mono">
                  Updated: {res.lastUpdated}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(res)}
                    className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-600 transition-all text-xs flex items-center gap-1"
                    title="Copy Google Drive URL"
                  >
                    {copiedId === res.id ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                  </button>

                  <a
                    href={res.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#19539D] text-white text-xs font-black hover:bg-blue-800 transition-all"
                  >
                    <span>Open Drive</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="p-10 text-center rounded-2xl border-2 border-dashed border-neutral-300 bg-[#FDFBF7]">
          <HardDrive size={32} className="mx-auto text-neutral-400 mb-2" />
          <h4 className="text-sm font-black text-neutral-700">No matching drive resources found</h4>
          <p className="text-xs text-neutral-500 mt-1">
            Try adjusting your search criteria or attach a new Google Drive link above.
          </p>
        </div>
      )}

      {/* Attach New Drive Resource Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Attach Google Drive Resource Link"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!newTitle.trim() || !newDriveUrl.trim()}
              onClick={handleAddResource}
            >
              Add to Resource Vault
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
              Resource Title *
            </label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Sufi Night Qawwali Passes & Seating Layout"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
                Category
              </label>
              <Select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ResourceCategory)}
                options={[
                  { value: 'guidelines', label: 'Guidelines & Safety' },
                  { value: 'passes', label: 'Delegate ID & Passes' },
                  { value: 'hospitality', label: 'Host Family Kits' },
                  { value: 'transit', label: 'Transit & Route Maps' },
                  { value: 'media', label: 'PR & Media Assets' },
                  { value: 'dossiers', label: 'Executive Dossiers' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
                Access Scope
              </label>
              <Select
                value={newScope}
                onChange={(e) => setNewScope(e.target.value as ResourceScope)}
                options={[
                  { value: 'all', label: 'All Participants (Public)' },
                  { value: 'club', label: 'Specific Host Club' },
                  { value: 'member', label: 'Specific Member' },
                ]}
              />
            </div>
          </div>

          {newScope === 'club' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
                Target Club Name / Zone
              </label>
              <Input
                value={newClubName}
                onChange={(e) => setNewClubName(e.target.value)}
                placeholder="e.g. Rotaract Club of Delhi South Central"
              />
            </div>
          )}

          {newScope === 'member' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
                Target Member Email Address
              </label>
              <Input
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="e.g. lead.hospitality@rotaract3011.org"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
              Google Drive URL / Folder Link *
            </label>
            <Input
              value={newDriveUrl}
              onChange={(e) => setNewDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-700 mb-1">
              Description & Instructions
            </label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Provide context or download instructions for delegates and host clubs..."
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[#19539D]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
