import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, UserPlus, Key, Search, RefreshCw, 
  CheckCircle2, ShieldCheck, Mail, Phone
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { 
  fetchUserDirectory, 
  createAdminUser, 
  updateAdminUser 
} from '@/lib/rbac/api';
import type { UserDirectoryItem } from '@/lib/rbac/types';

export function RideUsersManagementTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ride' | 'participant'>('ride');
  
  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDirectoryItem | null>(null);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Ride@2026');
  const [newRole, setNewRole] = useState('participant');
  const [newPhone, setNewPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Password Reset state
  const [resetPassword, setResetPassword] = useState('RidePass@2026');
  const [resetError, setResetError] = useState<string | null>(null);

  const { data: directory = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ride-user-directory', search],
    queryFn: () => fetchUserDirectory(search),
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      await createAdminUser({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword.trim(),
        clubId: 'DISTRICT',
        phone: newPhone.trim() || undefined,
        roleKey: newRole,
      });
    },
    onSuccess: () => {
      setIsAddUserOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('Ride@2026');
      setNewPhone('');
      setFormError(null);
      setSuccessToast(`User account created successfully! Credentials assigned.`);
      void qc.invalidateQueries({ queryKey: ['ride-user-directory'] });
      setTimeout(() => setSuccessToast(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to create user account. Please verify the email is unique.');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return;
      await updateAdminUser(selectedUser.id, {
        password: resetPassword.trim(),
      });
    },
    onSuccess: () => {
      setIsResetPasswordOpen(false);
      setSelectedUser(null);
      setResetError(null);
      setSuccessToast(`Password updated successfully for ${selectedUser?.name}.`);
      void qc.invalidateQueries({ queryKey: ['ride-user-directory'] });
      setTimeout(() => setSuccessToast(null), 4000);
    },
    onError: (err: any) => {
      setResetError(err?.message || 'Failed to update password.');
    },
  });

  // Filter users based on RIDE scope and search query
  const filteredUsers = useMemo(() => {
    return directory.filter((u) => {
      const isRideUser = u.roles.some((r) => 
        r.roleKey === 'participant' || 
        r.roleKey === 'ride_admin' || 
        r.roleKey === 'project_admin:ride' ||
        r.scopeId === 'ride'
      );

      if (roleFilter === 'ride' && !isRideUser) {
        // Also include users whose email domain or rotary role is participant
        const matchesRideHeuristic = u.email.includes('ride') || u.email.includes('delhi');
        if (!matchesRideHeuristic) return false;
      }

      if (roleFilter === 'participant') {
        const isParticipant = u.roles.some((r) => r.roleKey === 'participant');
        if (!isParticipant) return false;
      }

      return true;
    });
  }, [directory, roleFilter]);

  const openResetPasswordModal = (u: UserDirectoryItem) => {
    setSelectedUser(u);
    setResetPassword('RidePass@2026');
    setResetError(null);
    setIsResetPasswordOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="p-5 rounded-2xl border-2 border-[#171515] bg-[#FFFDF7] ride-pop-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#19539D]" size={22} />
            <h2 className="text-lg font-black text-[#171515] uppercase tracking-wide">
              RIDE User & Credential Management
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl font-medium">
            Generate login accounts, assign secure credentials, manage access levels, and reset passwords for incoming delegates, host coordinators, and exchange organizing staff.
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
            + Create New User ID
          </Button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-green-50 border-2 border-green-600 text-green-900 text-xs font-bold flex items-center gap-2 ride-pop-sm">
          <CheckCircle2 size={16} className="text-green-700 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border-2 border-[#171515] bg-white ride-pop-sm">
        <div className="flex-1 min-w-[260px] relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by delegate name, email, rotary ID, or club..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#19539D]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">Filter:</span>
          <button
            type="button"
            onClick={() => setRoleFilter('ride')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              roleFilter === 'ride'
                ? 'bg-[#19539D] text-white ride-pop-sm'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            RIDE Staff & Delegates
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('participant')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              roleFilter === 'participant'
                ? 'bg-[#19539D] text-white ride-pop-sm'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            Participants Only
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-[#19539D] text-white ride-pop-sm'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            All Portal Accounts
          </button>
        </div>
      </div>

      {/* Users Table */}
      <Card rule="accent" padding="compact" className="border-2 border-[#171515] ride-pop-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold text-neutral-500">
            Loading user credentials directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="mx-auto text-neutral-400" size={36} />
            <h3 className="text-sm font-black text-[#171515]">No users found matching filter</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              No RIDE accounts match the current search. You can create a new delegate or staff user using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-200 bg-[#FDFBF7] text-[11px] font-black uppercase tracking-wider text-neutral-600">
                  <th className="p-3.5">User Identity</th>
                  <th className="p-3.5">Contact / Email</th>
                  <th className="p-3.5">Role & Access Level</th>
                  <th className="p-3.5">Club / Scope</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#19539D]/10 text-[#19539D] flex items-center justify-center font-black text-xs">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-[#171515]">{u.name}</div>
                          {u.profile?.rotaryId && (
                            <div className="text-[10px] font-mono text-neutral-500">Rotary ID: {u.profile.rotaryId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-[11px] text-neutral-700 flex items-center gap-1.5">
                        <Mail size={12} className="text-neutral-400" />
                        {u.email}
                      </div>
                      {u.profile?.phone && (
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-neutral-400" />
                          {u.profile.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r, idx) => (
                          <Badge 
                            key={idx} 
                            tone={
                              r.roleKey === 'super_admin' ? 'red' :
                              r.roleKey === 'ride_admin' || r.roleKey.includes('ride') ? 'blue' :
                              r.roleKey === 'participant' ? 'green' : 'neutral'
                            }
                          >
                            {r.roleName || r.roleKey}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-neutral-600 font-medium">
                      {u.profile?.clubName || 'District 3011'}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openResetPasswordModal(u)}
                        leading={<Key size={13} />}
                      >
                        Reset Password
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal
        open={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Create New User ID (RIDE Staff or Participant)"
        size="md"
      >
        <div className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">
              {formError}
            </div>
          )}

          <Field label="Full Legal Name" hint="As shown on official ID">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Rtr. Rohan Sharma"
            />
          </Field>

          <Field label="Login Email Address" hint="Used as the username for portal login">
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. delegate@rotaract3141.org"
            />
          </Field>

          <Field label="Initial Password" hint="Temporary password assigned to the account">
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="e.g. Ride@2026"
            />
          </Field>

          <Field label="Access Level & Role">
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={[
                { value: 'participant', label: 'Participant / Exchange Delegate' },
                { value: 'ride_admin', label: 'RIDE Youth Exchange Admin' },
                { value: 'member', label: 'General Rotaract Member' },
                { value: 'dsc', label: 'District Council / Secretariat' },
              ]}
            />
          </Field>

          <Field label="Mobile / WhatsApp Number (Optional)">
            <Input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="secondary" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!newName.trim() || !newEmail.trim() || createUserMutation.isPending}
              loading={createUserMutation.isPending}
              onClick={() => createUserMutation.mutate()}
            >
              Generate User Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        title={`Reset Password for ${selectedUser?.name}`}
        size="sm"
      >
        <div className="space-y-4 pt-2">
          {resetError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">
              {resetError}
            </div>
          )}

          <div className="text-xs text-neutral-600">
            Assign a new password for <strong className="text-neutral-900">{selectedUser?.email}</strong>. The user can immediately sign in with this new password.
          </div>

          <Field label="New Password">
            <Input
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button variant="secondary" onClick={() => setIsResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!resetPassword.trim() || updatePasswordMutation.isPending}
              loading={updatePasswordMutation.isPending}
              onClick={() => updatePasswordMutation.mutate()}
            >
              Update Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
