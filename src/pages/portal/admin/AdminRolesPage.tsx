import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { createRole, deleteRole, fetchPermissions, fetchRoles, updateRole } from '@/lib/rbac/api';
import { ROLE_KEY_PATTERN, type CreateRoleInput, type Permission, type RoleRecord, type ScopeType, type UpdateRoleInput } from '@/lib/rbac/types';
import { SCOPE_LABEL, errorMessageOf } from '@/lib/rbac/ui';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Table, type Column } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

const SCOPE_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'None (district-wide)' },
  { value: 'club', label: 'Club' },
  { value: 'zone', label: 'Zone' },
  { value: 'project', label: 'Project' },
];

const MIN_NAME_LENGTH = 2;
const MIN_KEY_LENGTH = 2;
const MAX_KEY_LENGTH = 64;

function PermissionChecklist({
  permissions,
  selected,
  onToggle,
}: {
  permissions: Permission[];
  selected: Set<string>;
  onToggle: (key: string, checked: boolean) => void;
}) {
  return (
    <div className="flex max-h-72 flex-col gap-1 overflow-auto rounded-[8px] border border-line p-2">
      {permissions.map((p) => (
        <Checkbox
          key={p.key}
          label={
            <span>
              <span className="font-mono text-[11.5px]">{p.key}</span>{' '}
              <span className="ml-2 text-fg-3">{p.description}</span>
            </span>
          }
          checked={selected.has(p.key)}
          onChange={(e) => onToggle(p.key, e.target.checked)}
        />
      ))}
    </div>
  );
}

interface RoleEditorModalProps {
  role: RoleRecord | null;
  permissions: Permission[];
  onClose: () => void;
  onSave: (input: UpdateRoleInput) => void;
  saving: boolean;
  errorMessage: string | null;
}

function RoleEditorModal({ role, permissions, onClose, onSave, saving, errorMessage }: RoleEditorModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scopeType, setScopeType] = useState<ScopeType>('none');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description ?? '');
      setScopeType(role.scopeType);
      setSelected(new Set(role.permissionKeys));
    }
  }, [role]);

  if (!role) return null;

  const original = new Set(role.permissionKeys);
  const added = [...selected].filter((k) => !original.has(k));
  const removed = [...original].filter((k) => !selected.has(k));
  const permissionsChanged = added.length > 0 || removed.length > 0;
  const trimmedName = name.trim();
  const nameError = trimmedName.length < MIN_NAME_LENGTH ? `At least ${MIN_NAME_LENGTH} characters` : null;
  const metadataChanged =
    trimmedName !== role.name || description.trim() !== (role.description ?? '') || scopeType !== role.scopeType;
  const hasChanges = permissionsChanged || metadataChanged;

  function toggle(key: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function submit() {
    if (!role || nameError) return;
    const input: UpdateRoleInput = {};
    if (trimmedName !== role.name) input.name = trimmedName;
    const trimmedDescription = description.trim();
    if (trimmedDescription !== (role.description ?? '')) {
      input.description = trimmedDescription === '' ? null : trimmedDescription;
    }
    if (scopeType !== role.scopeType) input.scopeType = scopeType;
    if (permissionsChanged) input.permissionKeys = [...selected].sort();
    onSave(input);
  }

  return (
    <Modal
      open={Boolean(role)}
      onClose={onClose}
      title={`Edit ${role.name}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} disabled={!hasChanges || Boolean(nameError) || saving} onClick={submit}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 text-left">
        {errorMessage && (
          <Alert tone="error" title="Could not save">
            {errorMessage}
          </Alert>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" required error={nameError}>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </Field>
          <Field label="Scope type">
            <Select value={scopeType} onChange={(e) => setScopeType(e.target.value as ScopeType)} options={SCOPE_OPTIONS} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={500} />
        </Field>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.9px] text-fg-3">Permissions</p>
            {permissionsChanged && (
              <span className="text-[11.5px] font-semibold text-accent">
                {added.length > 0 ? `+${added.length}` : ''}
                {added.length > 0 && removed.length > 0 ? ' / ' : ''}
                {removed.length > 0 ? `-${removed.length}` : ''}
              </span>
            )}
          </div>
          <PermissionChecklist permissions={permissions} selected={selected} onToggle={toggle} />
        </div>
      </div>
    </Modal>
  );
}

interface CreateRoleModalProps {
  open: boolean;
  permissions: Permission[];
  onClose: () => void;
  onSave: (input: CreateRoleInput) => void;
  saving: boolean;
  errorMessage: string | null;
}

function CreateRoleModal({ open, permissions, onClose, onSave, saving, errorMessage }: CreateRoleModalProps) {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scopeType, setScopeType] = useState<ScopeType>('none');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setKey('');
      setName('');
      setDescription('');
      setScopeType('none');
      setSelected(new Set());
    }
  }, [open]);

  if (!open) return null;

  function toggle(k: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(k);
      else next.delete(k);
      return next;
    });
  }

  function validateKey(): string | null {
    if (key.length < MIN_KEY_LENGTH || key.length > MAX_KEY_LENGTH) {
      return `Must be ${MIN_KEY_LENGTH} to ${MAX_KEY_LENGTH} characters`;
    }
    if (!ROLE_KEY_PATTERN.test(key)) {
      return 'Lowercase letters, numbers, and underscores only, starting with a letter';
    }
    return null;
  }

  function validateName(): string | null {
    return name.trim().length < MIN_NAME_LENGTH ? `At least ${MIN_NAME_LENGTH} characters` : null;
  }

  // Computed on every render, like RoleEditorModal's nameError, so the message shows up as the
  // user types rather than only after a submit attempt the disabled button already prevents.
  const keyValidation = validateKey();
  const nameValidation = validateName();
  const keyError = key.length > 0 ? keyValidation : null;
  const nameError = name.length > 0 ? nameValidation : null;
  const canSubmit = keyValidation === null && nameValidation === null;

  function submit() {
    if (!canSubmit) return;
    onSave({
      key,
      name: name.trim(),
      description: description.trim() || undefined,
      scopeType,
      permissionKeys: [...selected],
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New role"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} disabled={!canSubmit || saving} onClick={submit}>
            Create role
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 text-left">
        {errorMessage && (
          <Alert tone="error" title="Could not create this role">
            {errorMessage}
          </Alert>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Key" required error={keyError} hint="Lower snake_case, e.g. zone_lead">
            <Input value={key} onChange={(e) => setKey(e.target.value.trim())} maxLength={64} />
          </Field>
          <Field label="Scope type">
            <Select value={scopeType} onChange={(e) => setScopeType(e.target.value as ScopeType)} options={SCOPE_OPTIONS} />
          </Field>
          <Field label="Name" required error={nameError}>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={500} />
        </Field>
        <div>
          <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-[0.9px] text-fg-3">Initial permissions</p>
          <PermissionChecklist permissions={permissions} selected={selected} onToggle={toggle} />
        </div>
      </div>
    </Modal>
  );
}

export function AdminRolesPage() {
  useDocumentMeta({ title: 'Roles and permissions' });
  const qc = useQueryClient();

  const rolesQuery = useQuery({ queryKey: ['roles'], queryFn: fetchRoles });
  const permissionsQuery = useQuery({ queryKey: ['permissions'], queryFn: fetchPermissions });

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  const invalidateRoles = () => void qc.invalidateQueries({ queryKey: ['roles'] });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) => updateRole(id, input),
    onSuccess: () => {
      setEditingRoleId(null);
      invalidateRoles();
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(input),
    onSuccess: () => {
      setCreating(false);
      invalidateRoles();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      setDeletingRoleId(null);
      invalidateRoles();
    },
  });

  function closeEditor() {
    setEditingRoleId(null);
    updateMutation.reset();
  }
  function closeCreate() {
    setCreating(false);
    createMutation.reset();
  }
  function closeDelete() {
    setDeletingRoleId(null);
    deleteMutation.reset();
  }

  const roles = rolesQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];
  const editingRole = roles.find((r) => r.id === editingRoleId) ?? null;
  const deletingRole = roles.find((r) => r.id === deletingRoleId) ?? null;

  const isPending = rolesQuery.isPending || permissionsQuery.isPending;
  const isError = rolesQuery.isError || permissionsQuery.isError;

  const columns: Column<RoleRecord>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (r) => (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="font-bold text-accent underline-offset-2 hover:underline"
            onClick={() => setEditingRoleId(r.id)}
          >
            {r.name}
          </button>
          {r.isSystem && <Badge tone="blue">System</Badge>}
        </div>
      ),
    },
    { key: 'key', header: 'Key', cell: (r) => <span className="font-mono text-[11.5px] text-fg-3">{r.key}</span> },
    { key: 'scope', header: 'Scope', cell: (r) => SCOPE_LABEL[r.scopeType] },
    { key: 'permissionCount', header: 'Permissions', numeric: true, cell: (r) => String(r.permissionKeys.length) },
    {
      key: '__actions',
      header: '',
      align: 'right',
      cell: (r) =>
        r.isSystem ? null : (
          <Button variant="link" size="sm" onClick={() => setDeletingRoleId(r.id)}>
            Delete
          </Button>
        ),
    },
  ];

  return (
    <Container width="wide">
      <Section
        eyebrow="RBAC"
        title="Roles and permissions"
        description="Every route these roles grant is enforced by the API. This screen only manages the grants; it is not the boundary."
        action={
          <Button leading={<Plus size={16} />} onClick={() => setCreating(true)}>
            New role
          </Button>
        }
      >
        {isPending ? (
          <Skeleton shape="rect" className="h-96" />
        ) : isError ? (
          <ErrorState
            title="Couldn't load roles"
            onRetry={() => {
              void rolesQuery.refetch();
              void permissionsQuery.refetch();
            }}
          />
        ) : roles.length === 0 ? (
          <EmptyState title="No roles yet" body="Create the first role to start granting permissions." />
        ) : (
          <Table columns={columns} rows={roles} rowKey={(r) => r.id} />
        )}
      </Section>

      <RoleEditorModal
        role={editingRole}
        permissions={permissions}
        onClose={closeEditor}
        onSave={(input) => editingRole && updateMutation.mutate({ id: editingRole.id, input })}
        saving={updateMutation.isPending}
        errorMessage={errorMessageOf(updateMutation.error)}
      />

      <CreateRoleModal
        open={creating}
        permissions={permissions}
        onClose={closeCreate}
        onSave={(input) => createMutation.mutate(input)}
        saving={createMutation.isPending}
        errorMessage={errorMessageOf(createMutation.error)}
      />

      <Modal
        open={Boolean(deletingRole)}
        onClose={closeDelete}
        title={`Delete "${deletingRole?.name ?? ''}"?`}
        footer={
          <>
            <Button variant="secondary" onClick={closeDelete}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deletingRole && deleteMutation.mutate(deletingRole.id)}
            >
              Delete
            </Button>
          </>
        }
      >
        {deleteMutation.isError ? (
          <Alert tone="error" title="Could not delete this role">
            {errorMessageOf(deleteMutation.error)}
          </Alert>
        ) : (
          'This cannot be undone.'
        )}
      </Modal>
    </Container>
  );
}
