import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, Search, ExternalLink, 
  CheckCircle2, Clock, 
  Eye, Download, RefreshCw, FileSpreadsheet 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { 
  getStoredSubmissions, 
  updateStoredSubmissionStatus,
  type FormSubmissionRecord 
} from '@/lib/ride/formsStorage';

export function RideFormBuilderTab() {
  const [submissions, setSubmissions] = useState<FormSubmissionRecord[]>(() => getStoredSubmissions());
  const [activeFormCategory, setActiveFormCategory] = useState<'internal_host_club' | 'external_delegation'>('internal_host_club');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'under_review' | 'approved' | 'declined'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmissionRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleSubmissionsUpdated = () => setSubmissions(getStoredSubmissions());
    window.addEventListener('ride_submissions_updated', handleSubmissionsUpdated);
    return () => window.removeEventListener('ride_submissions_updated', handleSubmissionsUpdated);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Internal Host Club Applications
  const hostClubSubmissions = useMemo(() => {
    return submissions.filter((s) => s.formId === 'form-host-club-app' || s.category === 'internal_host_club');
  }, [submissions]);

  // External Delegation Confirmations
  const delegationSubmissions = useMemo(() => {
    return submissions.filter((s) => s.formId === 'form-delegation-confirm' || s.category === 'external_delegation');
  }, [submissions]);

  // Compute pending applications for Needs Attention Queue
  const pendingHostClubCount = useMemo(() => {
    return hostClubSubmissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length;
  }, [hostClubSubmissions]);

  // Current active list
  const activeList = activeFormCategory === 'internal_host_club' ? hostClubSubmissions : delegationSubmissions;

  const filteredList = useMemo(() => {
    return activeList.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.participantName.toLowerCase().includes(q) ||
        s.participantEmail.toLowerCase().includes(q) ||
        (s.clubName && s.clubName.toLowerCase().includes(q)) ||
        (s.homeDistrict && s.homeDistrict.toLowerCase().includes(q)) ||
        (s.values?.drrName && String(s.values.drrName).toLowerCase().includes(q)) ||
        (s.values?.pocName && String(s.values.pocName).toLowerCase().includes(q))
      );
    });
  }, [activeList, statusFilter, search]);

  const handleUpdateStatus = (id: string, status: 'submitted' | 'under_review' | 'approved' | 'declined', label: string) => {
    updateStoredSubmissionStatus(id, status);
    setSubmissions(getStoredSubmissions());
    if (selectedSubmission && selectedSubmission.id === id) {
      setSelectedSubmission({ ...selectedSubmission, status });
    }
    showToast(`Application marked as "${label}"`);
  };

  const handleExportCSV = () => {
    if (filteredList.length === 0) return;
    const headers = Object.keys(filteredList[0].values || {}).concat(['Applicant', 'Email', 'District', 'Club', 'Status', 'SubmittedAt']);
    const rows = filteredList.map((item) => {
      const vals = Object.values(item.values || {}).map((v) => `"${String(v).replace(/"/g, '""')}"`);
      return [...vals, `"${item.participantName}"`, `"${item.participantEmail}"`, `"${item.homeDistrict}"`, `"${item.clubName || ''}"`, `"${item.status}"`, `"${item.submittedAt}"`].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeFormCategory}_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="p-6 rounded-3xl border-2 border-[#171515] bg-[#FFFDF7] ride-pop-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#19539D] text-white">
              <Building2 size={20} />
            </span>
            <h2 className="text-xl font-black text-[#171515] uppercase tracking-wide">
              Delhi Meri Jaan • Submissions & Applications Aggregator
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-1 max-w-3xl font-medium">
            Unified administrative data pipeline aggregating submissions from the external visiting districts Confirmation Form and internal RID 3011 Host Club Applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSubmissions(getStoredSubmissions())}
            leading={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportCSV}
            leading={<Download size={14} />}
            disabled={filteredList.length === 0}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-600 text-emerald-950 text-xs font-bold flex items-center gap-2 ride-pop-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* "NEEDS ATTENTION" APPLICATION TRIAGE QUEUE BANNER */}
      {pendingHostClubCount > 0 && (
        <div className="p-5 rounded-2xl border-2 border-[#171515] bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50/50 ride-pop-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EA6623] border-2 border-[#171515] flex items-center justify-center text-white ride-pop-sm shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase text-[#171515]">
                  Needs Attention • Internal Host Club Applications Queue
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#C72425] text-white text-[10px] font-black">
                  {pendingHostClubCount} Pending Review
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                RID 3011 Club Presidents & Secretaries have submitted applications and proposals to host incoming national delegates. Review their Google Drive proposals and assign hosting status below.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveFormCategory('internal_host_club');
                setStatusFilter('submitted');
              }}
              className="px-4 py-2 rounded-xl border-2 border-[#171515] bg-[#FBC02D] text-[#171515] text-xs font-black uppercase tracking-wider ride-pop-sm hover:bg-yellow-400 transition-all cursor-pointer"
            >
              Filter Needs Attention ({pendingHostClubCount})
            </button>
          </div>
        </div>
      )}

      {/* Main Section Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveFormCategory('internal_host_club');
              setStatusFilter('all');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeFormCategory === 'internal_host_club'
                ? 'bg-[#19539D] text-white ride-pop-sm border-2 border-[#171515]'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
            }`}
          >
            <Building2 size={16} />
            <span>RID 3011 Host Club Applications</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeFormCategory === 'internal_host_club' ? 'bg-[#FBC02D] text-[#171515]' : 'bg-neutral-200 text-neutral-800'
            }`}>
              {hostClubSubmissions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFormCategory('external_delegation');
              setStatusFilter('all');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeFormCategory === 'external_delegation'
                ? 'bg-[#19539D] text-white ride-pop-sm border-2 border-[#171515]'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
            }`}
          >
            <Users size={16} />
            <span>Outside District Confirmations</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeFormCategory === 'external_delegation' ? 'bg-[#FBC02D] text-[#171515]' : 'bg-neutral-200 text-neutral-800'
            }`}>
              {delegationSubmissions.length}
            </span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by club, name, district..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-neutral-300 text-xs w-52 sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#19539D]"
            />
          </div>

          <div className="flex items-center gap-1">
            {(['all', 'submitted', 'under_review', 'approved', 'declined'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer capitalize ${
                  statusFilter === st
                    ? 'bg-[#171515] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {st === 'all' ? 'All Statuses' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SUBMISSIONS LISTING CARD */}
      <Card rule="accent" padding="compact" className="border-2 border-[#171515] ride-pop-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileSpreadsheet className="mx-auto text-neutral-400" size={40} />
            <h3 className="text-sm font-black text-[#171515]">No submissions found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              No applications match your active search or status filter. Once submitted via the participant or main portal, they will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-200 bg-[#FDFBF7] text-[11px] font-black uppercase tracking-wider text-neutral-600">
                  <th className="p-3.5">
                    {activeFormCategory === 'internal_host_club' ? 'Club & Zone' : 'District & Country'}
                  </th>
                  <th className="p-3.5">
                    {activeFormCategory === 'internal_host_club' ? 'Lead Applicant & Position' : 'DRR & Contact'}
                  </th>
                  <th className="p-3.5">
                    {activeFormCategory === 'internal_host_club' ? 'Club Proposal' : 'Liaison POC'}
                  </th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Submitted</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Column 1: Identity */}
                    <td className="p-3.5">
                      {activeFormCategory === 'internal_host_club' ? (
                        <div>
                          <div className="font-black text-[#171515]">{item.clubName || 'RID 3011 Club'}</div>
                          <div className="text-[10px] text-neutral-500 font-semibold mt-0.5">
                            {item.values?.zone || 'Zone Prithvi'} · Parent: {item.values?.parentRotaryClub || 'NA'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-black text-[#171515] font-mono">
                            District {item.homeDistrict || item.values?.homeDistrict || '3011'}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-semibold mt-0.5">
                            Outside Visiting District
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Column 2: Lead / DRR */}
                    <td className="p-3.5">
                      {activeFormCategory === 'internal_host_club' ? (
                        <div>
                          <div className="font-bold text-[#171515]">{item.participantName}</div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {item.values?.position || 'President'} · {item.values?.phone}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">{item.participantEmail}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-[#171515]">{item.values?.drrName || item.participantName}</div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {item.values?.drrPhone} · {item.values?.drrEmail || item.participantEmail}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Column 3: Proposal / POC */}
                    <td className="p-3.5">
                      {activeFormCategory === 'internal_host_club' ? (
                        <div>
                          {item.values?.proposalDriveUrl ? (
                            <a
                              href={item.values.proposalDriveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#171515] bg-[#FBC02D] text-[#171515] font-black text-[11px] hover:bg-yellow-400 transition-all ride-pop-sm"
                            >
                              <ExternalLink size={12} />
                              <span>Open Google Drive Proposal</span>
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-xs italic">No proposal link provided</span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-[#171515]">{item.values?.pocName || 'Liaison POC'}</div>
                          <div className="text-[11px] text-neutral-500 font-mono">
                            {item.values?.pocPhone} · {item.values?.pocEmail}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Column 4: Status Badge */}
                    <td className="p-3.5">
                      <Badge tone={
                        item.status === 'approved' ? 'green' :
                        item.status === 'declined' ? 'red' :
                        item.status === 'under_review' ? 'blue' : 'amber'
                      }>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </td>

                    {/* Column 5: Date */}
                    <td className="p-3.5 text-neutral-500 text-[11px] font-mono">
                      {new Date(item.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>

                    {/* Column 6: Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedSubmission(item)}
                          leading={<Eye size={13} />}
                        >
                          Details
                        </Button>

                        {item.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleUpdateStatus(item.id, 'approved', 'Approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Approve
                          </Button>
                        )}

                        {item.status === 'submitted' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateStatus(item.id, 'under_review', 'Under Review')}
                            className="text-blue-700"
                          >
                            Review
                          </Button>
                        )}

                        {item.status !== 'declined' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(item.id, 'declined', 'Declined')}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Decline
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detailed Submission Inspection Modal */}
      <Modal
        open={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        title={selectedSubmission?.formTitle || 'Submission Dossier'}
        size="lg"
      >
        {selectedSubmission && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-blue-50 border border-neutral-300 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Submission Reference</span>
                <div className="text-base font-black text-[#171515] font-mono">{selectedSubmission.id}</div>
                <div className="text-[11px] text-neutral-600 mt-0.5">
                  Logged on {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-600">Status:</span>
                <Badge tone={
                  selectedSubmission.status === 'approved' ? 'green' :
                  selectedSubmission.status === 'declined' ? 'red' :
                  selectedSubmission.status === 'under_review' ? 'blue' : 'amber'
                }>
                  {selectedSubmission.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Render Detailed Key-Value Grid */}
            <div className="border border-neutral-200 rounded-2xl p-4 bg-white space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700 border-b pb-2">
                Submitted Field Values
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(selectedSubmission.values || {}).map(([key, val]) => {
                  const isUrl = String(val).startsWith('http://') || String(val).startsWith('https://');
                  return (
                    <div key={key} className="space-y-1">
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      {isUrl ? (
                        <a
                          href={String(val)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#19539D] hover:underline"
                        >
                          <ExternalLink size={13} />
                          <span>Open Link in New Tab</span>
                        </a>
                      ) : (
                        <div className="text-xs font-semibold text-neutral-900 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                          {String(val) || '—'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Status Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500">Change Status:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'approved', 'Approved')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-all"
                >
                  ✓ Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'under_review', 'Under Review')}
                  className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold transition-all"
                >
                  Clock Under Review
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedSubmission.id, 'declined', 'Declined')}
                  className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition-all"
                >
                  ✕ Decline
                </button>
              </div>

              <Button variant="secondary" onClick={() => setSelectedSubmission(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
