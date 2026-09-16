import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Eye, FileSpreadsheet } from 'lucide-react';
import { AutoRickshawBadge, DilliDilwalonKiBadge } from './DelhiStickers';

export interface ParticipantRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  participantType: 'external' | 'internal_rotaractor';
  districtNumber: string;
  clubName: string;
  rotaryRole: string;
  status: 'pending' | 'approved' | 'confirmed' | 'rejected' | 'waitlist';
  arrivalMode: string;
  arrivalLocation: string;
  tshirtSize: string;
  dietaryPreference: string;
  hostClubName?: string;
  createdAt: string;
}

const STATUS_TONES: Record<ParticipantRecord['status'], BadgeTone> = {
  confirmed: 'green',
  approved: 'blue',
  pending: 'amber',
  waitlist: 'neutral',
  rejected: 'red',
};

export function DelhiMeriJaanAdminTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<ParticipantRecord | null>(null);

  const { data: apiResponse } = useQuery({
    queryKey: ['ride', 'participants'],
    queryFn: async () => {
      try {
        return await apiFetch<{ items: any[]; total: number }>('/ride/participants?pageSize=200');
      } catch {
        return null;
      }
    },
  });

  const participants: ParticipantRecord[] = useMemo(() => {
    if (apiResponse?.items && apiResponse.items.length > 0) {
      return apiResponse.items.map((raw: any) => ({
        id: raw.id,
        fullName: raw.fullName,
        email: raw.email,
        phone: raw.phone,
        participantType: (raw.participantType as any) || 'external',
        districtNumber: raw.homeDistrict || raw.districtNumber || '',
        clubName: raw.homeClubName || raw.clubName || '',
        rotaryRole: raw.clubDesignation || raw.rotaryRole || '',
        status: (raw.status as any) || 'pending',
        arrivalMode: raw.arrivalMode || 'Local',
        arrivalLocation: raw.cityState || raw.arrivalLocation || '',
        tshirtSize: raw.tshirtSize || '',
        dietaryPreference: raw.dietaryPref || raw.dietaryPreference || '',
        hostClubName: raw.hostFamilyName || undefined,
        createdAt: raw.createdAt,
      }));
    }
    return [];
  }, [apiResponse]);

  const districts = Array.from(new Set(participants.map((p) => p.districtNumber)));

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.clubName.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesDistrict = districtFilter === 'all' || p.districtNumber === districtFilter;
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiFetch(`/ride/participants/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['ride', 'participants'] });
    },
  });

  const updateStatus = (id: string, newStatus: ParticipantRecord['status']) => {
    updateStatusMutation.mutate({ id, status: newStatus });
    if (selectedRecord?.id === id) {
      setSelectedRecord((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const exportCSV = () => {
    const headers = ['Ref ID,Full Name,Email,Phone,Type,District,Club,Role,Status,Arrival,Location,T-Shirt,Diet'];
    const rows = filtered.map((p) =>
      `"${p.id}","${p.fullName}","${p.email}","${p.phone}","${p.participantType}","${p.districtNumber}","${p.clubName}","${p.rotaryRole}","${p.status}","${p.arrivalMode}","${p.arrivalLocation}","${p.tshirtSize}","${p.dietaryPreference}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delhi-meri-jaan-delegates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border-2 border-[#171515] bg-[#FDFBF7] ride-pop-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DilliDilwalonKiBadge />
            <span className="text-xs font-black uppercase text-neutral-500">RID 3011 Exchange Hub</span>
          </div>
          <h2 className="text-2xl font-black text-[#171515]">Delhi Meri Jaan 2026 Delegates Dossier</h2>
          <p className="text-xs text-neutral-600 font-semibold mt-0.5">
            Manage inbound national & international delegates, verify travel PNRs, allocate host families, and track badge passes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={exportCSV} leading={<FileSpreadsheet size={15} />}>
            Export CSV
          </Button>
          <AutoRickshawBadge />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border-2 border-[#171515] bg-white text-center ride-pop-sm">
          <div className="text-2xl font-black text-[#19539D]">{participants.length}</div>
          <div className="text-[11px] font-bold text-neutral-600 uppercase">Total Registrations</div>
        </div>
        <div className="p-4 rounded-xl border-2 border-[#171515] bg-white text-center ride-pop-sm">
          <div className="text-2xl font-black text-[#59A835]">
            {participants.filter((p) => p.status === 'confirmed').length}
          </div>
          <div className="text-[11px] font-bold text-neutral-600 uppercase">Confirmed Seats</div>
        </div>
        <div className="p-4 rounded-xl border-2 border-[#171515] bg-white text-center ride-pop-sm">
          <div className="text-2xl font-black text-[#EA6623]">
            {participants.filter((p) => p.status === 'pending').length}
          </div>
          <div className="text-[11px] font-bold text-neutral-600 uppercase">Pending Review</div>
        </div>
        <div className="p-4 rounded-xl border-2 border-[#171515] bg-white text-center ride-pop-sm">
          <div className="text-2xl font-black text-[#C72425]">
            {districts.length}
          </div>
          <div className="text-[11px] font-bold text-neutral-600 uppercase">Districts Represented</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border-2 border-[#171515] bg-white ride-pop-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search size={16} className="absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by delegate name, email, club, or pass reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#171515] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA6623]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#171515] text-xs font-bold bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlist">Waitlist</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#171515] text-xs font-bold bg-white"
          >
            <option value="all">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>RID {d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Delegates Table */}
      <Card rule="accent" padding="compact" className="overflow-x-auto border-2 border-[#171515] ride-pop-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-neutral-200 bg-neutral-50 font-black text-neutral-600 uppercase tracking-wider">
              <th className="p-3">Ref ID</th>
              <th className="p-3">Delegate</th>
              <th className="p-3">District & Club</th>
              <th className="p-3">Arrival</th>
              <th className="p-3">Kit & Diet</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500 font-semibold">
                  No delegates match the active filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="p-3 font-mono font-black text-[#C72425]">{item.id}</td>
                  <td className="p-3">
                    <div className="font-extrabold text-[#171515]">{item.fullName}</div>
                    <div className="text-[11px] text-neutral-500">{item.email} • {item.phone}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-[#19539D]">
                      {item.participantType === 'external' ? `RID ${item.districtNumber}` : 'Host RID 3011'}
                    </div>
                    <div className="text-[11px] text-neutral-600 truncate max-w-[180px]">{item.clubName}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-neutral-800">{item.arrivalMode}</div>
                    <div className="text-[11px] text-neutral-500 truncate max-w-[150px]">{item.arrivalLocation}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-[#171515]">Size: {item.tshirtSize}</span>
                    <span className="text-[11px] text-neutral-500 block uppercase">{item.dietaryPreference}</span>
                  </td>
                  <td className="p-3">
                    <Badge tone={STATUS_TONES[item.status]}>{item.status}</Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedRecord(item)}
                        leading={<Eye size={13} />}
                      >
                        View
                      </Button>
                      {item.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => updateStatus(item.id, 'approved')}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Delegate Detail Drawer / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border-3 border-[#171515] bg-white p-6 ride-pop-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b-2 border-neutral-200">
              <div>
                <span className="text-[10px] font-black uppercase text-neutral-500">Delegate Dossier</span>
                <h3 className="text-xl font-black text-[#171515]">{selectedRecord.fullName}</h3>
                <span className="text-xs font-mono font-bold text-[#C72425]">{selectedRecord.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full border-2 border-[#171515] flex items-center justify-center font-black hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FDFBF7] border border-neutral-200">
                <div>
                  <span className="text-neutral-500 font-bold block">District Affiliation</span>
                  <span className="font-extrabold text-[#19539D] text-sm">RID {selectedRecord.districtNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold block">Status</span>
                  <Badge tone={STATUS_TONES[selectedRecord.status]}>{selectedRecord.status}</Badge>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold block">Home Club</span>
                  <span className="font-semibold text-neutral-800">{selectedRecord.clubName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold block">Designation</span>
                  <span className="font-semibold text-neutral-800">{selectedRecord.rotaryRole || 'Member'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FDFBF7] border border-neutral-200">
                <div>
                  <span className="text-neutral-500 font-bold block">Email</span>
                  <span className="font-semibold text-neutral-800">{selectedRecord.email}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold block">Phone</span>
                  <span className="font-semibold text-neutral-800">{selectedRecord.phone}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold block">Arrival Location</span>
                  <span className="font-semibold text-neutral-800">{selectedRecord.arrivalLocation}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-bold block">Transit Mode</span>
                  <span className="font-semibold text-neutral-800">{selectedRecord.arrivalMode}</span>
                </div>
              </div>

              {/* Status transition actions */}
              <div className="pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-600 block mb-2">
                  Update Delegate Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'approved', 'confirmed', 'waitlist', 'rejected'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateStatus(selectedRecord.id, st)}
                      className={`px-3 py-1.5 rounded-xl border-2 border-[#171515] text-xs font-black transition-all ${
                        selectedRecord.status === st
                          ? 'bg-[#EA6623] text-white ride-pop-sm'
                          : 'bg-neutral-50 hover:bg-neutral-100'
                      }`}
                    >
                      {st.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-neutral-200 flex justify-end">
              <Button onClick={() => setSelectedRecord(null)}>Close Dossier</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
