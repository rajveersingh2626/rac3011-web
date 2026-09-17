import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, UserPlus, Key, Search, RefreshCw, 
  CheckCircle2, ShieldCheck, Mail, Phone,
  Trash2, AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { apiFetch } from '@/lib/api';

export interface RideParticipantItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  gender?: string;
  rotaryId?: string | null;
  homeDistrict?: string;
  homeClubName?: string;
  cityState?: string;
  country?: string;
  clubDesignation?: string | null;
  status: string;
  approvalStatus: string;
  dossierStatus?: string;
  isActive: boolean;
  createdAt: string;
}

export function RideUsersManagementTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  
  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<RideParticipantItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<RideParticipantItem | null>(null);

  // New participant form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Ride@2026');
  const [newPhone, setNewPhone] = useState('');
  const [newHomeDistrict, setNewHomeDistrict] = useState('');
  const [newHomeClub, setNewHomeClub] = useState('');
  const [newRotaryId, setNewRotaryId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Password Reset state
  const [resetPassword, setResetPassword] = useState('RidePass@2026');
  const [resetError, setResetError] = useState<string | null>(null);

  // Query strictly isolated ride_participants
  const { data: participants = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ride-admin-participants', search],
    queryFn: async () => {
      const res = await apiFetch<{ items: RideParticipantItem[]; total: number }>(
        `/ride/participants?search=${encodeURIComponent(search)}&pageSize=100`,
      );
      return res?.items ?? [];
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      await apiFetch('/ride/participants/admin/create', {
        method: 'POST',
        body: {
          fullName: newName.trim(),
          email: newEmail.trim(),
          password: newPassword.trim(),
          phone: newPhone.trim() || undefined,
          homeDistrict: newHomeDistrict.trim() || 'Outside 3011',
          homeClubName: newHomeClub.trim() || 'Rotaract Visiting Club',
          rotaryId: newRotaryId.trim() || undefined,
        },
      });
    },
    onSuccess: () => {
      setIsAddUserOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('Ride@2026');
      setNewPhone('');
      setNewHomeDistrict('');
      setNewHomeClub('');
      setNewRotaryId('');
      setFormError(null);
      setSuccessToast('Participant account created successfully in ride_participants with secure credentials.');
      void qc.invalidateQueries({ queryKey: ['ride-admin-participants'] });
      setTimeout(() => setSuccessToast(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to create participant. Ensure email is unique.');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return;
      await apiFetch(`/ride/participants/admin/${selectedUser.id}/reset-password`, {
        method: 'POST',
        body: { password: resetPassword.trim() },
      });
    },
    onSuccess: () => {
      setIsResetPasswordOpen(false);
      setSelectedUser(null);
      setResetError(null);
      setSuccessToast(`Password updated successfully for ${selectedUser?.fullName}.`);
      void qc.invalidateQueries({ queryKey: ['ride-admin-participants'] });
      setTimeout(() => setSuccessToast(null), 4000);
    },
    onError: (err: any) => {
      setResetError(err?.message || 'Failed to update password.');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (u: RideParticipantItem) => {
      await apiFetch(`/ride/participants/admin/${u.id}/toggle-active`, {
        method: 'POST',
        body: { isActive: !u.isActive },
      });
    },
    onSuccess: () => {
      setSuccessToast('Participant access status updated.');
      void qc.invalidateQueries({ queryKey: ['ride-admin-participants'] });
      setTimeout(() => setSuccessToast(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to toggle status.');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiFetch(`/ride/participants/${encodeURIComponent(userId)}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      setDeleteConfirmUser(null);
      setSuccessToast('Participant record permanently removed.');
      void qc.invalidateQueries({ queryKey: ['ride-admin-participants'] });
      setTimeout(() => setSuccessToast(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to remove participant.');
    },
  });

  const filteredUsers = useMemo(() => {
    return participants.filter((u) => {
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'blocked' && u.isActive) return false;
      return true;
    });
  }, [participants, statusFilter]);

  const openResetPasswordModal = (u: RideParticipantItem) => {
    setSelectedUser(u);
    setResetPassword('RidePass@2026');
    setResetError(null);
    setIsResetPasswordOpen(true);
  };

  return (
    <div className="space-y-6 font-ride-sans">
      {/* Top Controls Banner */}
      <div className="p-5 rounded-2xl border-2 border-[#171515] bg-[#FFFDF7] ride-pop-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#19539D]" size={22} />
            <h2 className="text-lg font-black text-[#171515] uppercase tracking-wide">
              Isolated Participant Directory & Credentials
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl font-medium">
            Strict database isolation: Only records listed in this directory can sign in to the Participant Portal. District members and Super Admins are strictly blocked from the Participant Portal unless explicitly provisioned here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void refetch()}
            loading={isRefetching}
            leading={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsAddUserOpen(true)}
            leading={<UserPlus size={15} />}
          >
            + Create Participant ID
          </Button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-green-50 border-2 border-green-600 text-green-900 text-xs font-bold flex items-center gap-2 ride-pop-sm">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by participant name, email, or rotary ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border-2 border-neutral-300 text-xs font-medium focus:outline-none focus:border-[#19539D] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-600">Filter:</span>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            options={[
              { value: 'all', label: `All Participants (${participants.length})` },
              { value: 'active', label: 'Active Access Only' },
              { value: 'blocked', label: 'Blocked / Suspended' },
            ]}
          />
        </div>
      </div>

      {/* Participants Table */}
      <Card className="border-2 border-[#171515] p-0 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500 font-bold">
            Loading isolated participant registry...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users size={32} className="mx-auto text-neutral-400" />
            <h3 className="font-bold text-sm text-neutral-700">No Participants Found</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              {search
                ? `No participants matched your search "${search}".`
                : 'The participant table is currently empty. Click "+ Create Participant ID" to provision an authorized delegate.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-200 bg-neutral-50 text-[11px] font-black uppercase tracking-wider text-neutral-600">
                  <th className="p-3.5">Participant Name</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Home District & Club</th>
                  <th className="p-3.5">Portal Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#19539D]/10 text-[#19539D] flex items-center justify-center font-black text-xs">
                          {u.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-[#171515]">{u.fullName}</div>
                          {u.rotaryId && (
                            <div className="text-[10px] font-mono text-neutral-500">Rotary ID: {u.rotaryId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-[11px] text-neutral-700 flex items-center gap-1.5">
                        <Mail size={12} className="text-neutral-400" />
                        {u.email}
                      </div>
                      {u.phone && (
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-neutral-400" />
                          {u.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-neutral-700 font-medium">
                      <div>{u.homeClubName || 'Rotaract Club'}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        {u.homeDistrict ? `RID ${u.homeDistrict}` : 'External'}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={u.isActive ? 'green' : 'red'}>
                          {u.isActive ? 'Active' : 'Blocked'}
                        </Badge>
                        <Badge tone="neutral">{u.approvalStatus}</Badge>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openResetPasswordModal(u)}
                          leading={<Key size={13} />}
                        >
                          Password
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => toggleActiveMutation.mutate(u)}
                          loading={toggleActiveMutation.isPending}
                        >
                          {u.isActive ? 'Block' : 'Unblock'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteConfirmUser(u)}
                          leading={<Trash2 size={13} />}
                          title="Permanently remove participant"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Participant Modal */}
      <Modal
        open={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Provision Participant Account (Strict ride_participants)"
        size="md"
      >
        <div className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">
              {formError}
            </div>
          )}

          <Field label="Full Legal / Rotary Name" required>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Rtr. Priya Sharma"
            />
          </Field>

          <Field label="Email Address (Login Username)" required>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. delegate@rotaract3141.org"
            />
          </Field>

          <Field label="Rotary ID (Optional)">
            <Input
              value={newRotaryId}
              onChange={(e) => setNewRotaryId(e.target.value)}
              placeholder="e.g. 10459812"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Home District">
              <Input
                value={newHomeDistrict}
                onChange={(e) => setNewHomeDistrict(e.target.value)}
                placeholder="e.g. 3141 or 3190"
              />
            </Field>
            <Field label="Home Club Name">
              <Input
                value={newHomeClub}
                onChange={(e) => setNewHomeClub(e.target.value)}
                placeholder="e.g. RAC Bombay Film City"
              />
            </Field>
          </div>

          <Field label="Phone / WhatsApp Number">
            <Input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Field>

          <Field label="Initial Access Password" required hint="Password for Participant Portal login">
            <Input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ride@2026"
            />
          </Field>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => createUserMutation.mutate()}
              loading={createUserMutation.isPending}
              disabled={!newName.trim() || !newEmail.trim() || !newPassword.trim()}
            >
              Save to ride_participants
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        title={`Reset Password • ${selectedUser?.fullName}`}
        size="sm"
      >
        <div className="space-y-4 pt-2">
          {resetError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">
              {resetError}
            </div>
          )}

          <p className="text-xs text-neutral-600">
            Set a new password for <span className="font-bold text-neutral-900">{selectedUser?.email}</span>. This will be hashed with bcrypt into the isolated participant database.
          </p>

          <Field label="New Password" required>
            <Input
              type="text"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Enter new password..."
            />
          </Field>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => updatePasswordMutation.mutate()}
              loading={updatePasswordMutation.isPending}
              disabled={!resetPassword.trim()}
            >
              Update Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirmUser}
        onClose={() => setDeleteConfirmUser(null)}
        title="Permanently Delete Participant Record"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-300 text-red-950 text-xs font-medium space-y-1">
            <div className="font-black flex items-center gap-1.5 text-red-700">
              <AlertTriangle size={15} />
              <span>Permanent Registry Removal</span>
            </div>
            <p>
              Are you sure you want to remove <span className="font-bold">{deleteConfirmUser?.fullName}</span> ({deleteConfirmUser?.email}) from the RIDE participant registry? They will immediately lose all access to the Participant Portal.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteConfirmUser(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirmUser && deleteUserMutation.mutate(deleteConfirmUser.id)}
              loading={deleteUserMutation.isPending}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
