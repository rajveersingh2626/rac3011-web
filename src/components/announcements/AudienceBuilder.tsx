import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field } from '@/components/ui/Field';
import { Checkbox } from '@/components/ui/Checkbox';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { fetchZones, fetchPublicClubs } from '@/lib/clubs';
import { fetchUserDirectory } from '@/lib/rbac/api';
import { estimateAudience } from '@/lib/announcements/api';
import { SENDABLE_ROLE_KEYS, type Audience } from '@/lib/announcements/types';
import { isAudienceEmpty } from '@/lib/announcements/audience';
import { ApiError } from '@/lib/api';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { Search, X, User } from 'lucide-react';

export interface AudienceBuilderProps {
  value: Audience;
  onChange: (audience: Audience) => void;
}

export function AudienceBuilder({ value, onChange }: AudienceBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const zonesQuery = useQuery({ queryKey: ['zones'], queryFn: fetchZones });
  const clubsQuery = useQuery({ queryKey: ['public-clubs'], queryFn: () => fetchPublicClubs() });

  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const directoryQuery = useQuery({
    queryKey: ['user-directory', debouncedSearch],
    queryFn: () => fetchUserDirectory(debouncedSearch),
    enabled: debouncedSearch.trim().length >= 2 && !debouncedSearch.includes(',') && !debouncedSearch.includes(';'),
  });

  const zoneOptions = (zonesQuery.data ?? []).map((z) => ({ value: z.id, label: z.name }));
  const clubOptions = (clubsQuery.data ?? []).map((c) => ({ value: c.id, label: c.name }));

  const toggleRole = (key: string, checked: boolean) => {
    const current = value.roleKeys ?? [];
    const next = checked ? [...current, key] : current.filter((k) => k !== key);
    onChange({ ...value, roleKeys: next.length ? next : undefined });
  };

  const setZoneIds = (ids: string[]) => onChange({ ...value, zoneIds: ids.length ? ids : undefined });
  const setClubIds = (ids: string[]) => onChange({ ...value, clubIds: ids.length ? ids : undefined });

  const selectedMemberIds = value.memberIds ?? [];

  const handleAddTokens = (rawText: string) => {
    const tokens = rawText
      .split(/[,;\n\r]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) return;

    const next = [...selectedMemberIds];
    for (const tok of tokens) {
      if (!next.includes(tok)) {
        next.push(tok);
      }
    }
    onChange({ ...value, memberIds: next });
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const addMemberId = (idOrRotaryId: string) => {
    handleAddTokens(idOrRotaryId);
  };

  const removeMemberId = (idOrRotaryId: string) => {
    const next = selectedMemberIds.filter((id) => id !== idOrRotaryId);
    onChange({ ...value, memberIds: next.length ? next : undefined });
  };

  const clearAllMembers = () => {
    onChange({ ...value, memberIds: undefined });
  };

  const empty = isAudienceEmpty(value);
  const debouncedAudience = useDebouncedValue(value, 400);

  const estimateQuery = useQuery({
    queryKey: ['announcements-audience-estimate', debouncedAudience],
    queryFn: () => estimateAudience(debouncedAudience),
    enabled: !isAudienceEmpty(debouncedAudience),
  });

  const estimateLabel = useMemo(() => {
    if (empty) return 'Pick at least one of the options below';
    if (estimateQuery.isFetching) return 'Estimating…';
    if (estimateQuery.isError) {
      const message = estimateQuery.error instanceof ApiError ? estimateQuery.error.message : 'Could not estimate reach';
      return message;
    }
    if (estimateQuery.data !== undefined) {
      const n = estimateQuery.data;
      return `${n} ${n === 1 ? 'person' : 'people'} would receive this`;
    }
    return null;
  }, [empty, estimateQuery.isFetching, estimateQuery.isError, estimateQuery.error, estimateQuery.data]);

  const searchResults = directoryQuery.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <Field label="Roles" hint="Optional — narrows the audience to these roles within any club/zone picked below">
        <div className="flex flex-col gap-1.5">
          {SENDABLE_ROLE_KEYS.map((r) => (
            <Checkbox
              key={r.key}
              label={r.label}
              checked={(value.roleKeys ?? []).includes(r.key)}
              onChange={(e) => toggleRole(r.key, e.target.checked)}
            />
          ))}
        </div>
      </Field>

      <Field label="Zones" hint="Optional — leave roles unchecked to reach everyone in these zones">
        <MultiSelect options={zoneOptions} values={value.zoneIds ?? []} onChange={setZoneIds} placeholder="Search zones…" />
      </Field>

      <Field label="Clubs" hint="Optional — leave roles unchecked to reach everyone in these clubs">
        <MultiSelect options={clubOptions} values={value.clubIds ?? []} onChange={setClubIds} placeholder="Search clubs…" />
      </Field>

      <Field
        label="Specific Members (Name, Rotary ID, or Comma-Separated List)"
        hint="Search by name/Rotary ID, or paste/type multiple comma-separated IDs (e.g. 10234, 10567, Himanshu)"
      >
        <div className="relative flex flex-col gap-2">
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes(',') || val.includes(';') || val.includes('\n')) {
                  handleAddTokens(val);
                } else {
                  setSearchTerm(val);
                  setIsDropdownOpen(true);
                }
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text');
                if (pasted.includes(',') || pasted.includes(';') || pasted.includes('\n')) {
                  e.preventDefault();
                  handleAddTokens(pasted);
                }
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchTerm.trim()) {
                    handleAddTokens(searchTerm);
                  }
                }
              }}
              placeholder="Search member name or paste comma-separated Rotary IDs / names…"
              className="pl-9"
            />
            <Search className="absolute left-3 top-3.5 size-4 text-fg-3" />
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && debouncedSearch.trim().length >= 2 && !debouncedSearch.includes(',') && (
            <div className="absolute top-[48px] z-50 max-h-60 w-full overflow-y-auto rounded-xl border border-line-accent bg-surface p-1 shadow-lg">
              {directoryQuery.isPending && (
                <div className="p-3 text-center text-xs text-fg-3">Searching members…</div>
              )}
              {!directoryQuery.isPending && searchResults.length === 0 && (
                <div className="p-3 text-center text-xs text-fg-3">
                  No member found. Press Enter to add &quot;{searchTerm}&quot; directly.
                </div>
              )}
              {searchResults.map((item) => {
                const name = item.profile?.fullName || item.name;
                const rotaryId = item.profile?.rotaryId;
                const clubName = item.profile?.clubName;
                const targetValue = rotaryId || item.profile?.id || item.id;
                const isSelected = selectedMemberIds.includes(targetValue) || (rotaryId && selectedMemberIds.includes(rotaryId));

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addMemberId(targetValue)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-page ${
                      isSelected ? 'bg-page/70 opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-full bg-[#D81B60]/10 text-[#D81B60]">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="m-0 font-bold text-fg">{name}</p>
                        <p className="m-0 text-[11px] text-fg-3">
                          {rotaryId ? `Rotary ID: ${rotaryId}` : item.email} {clubName ? `• ${clubName}` : ''}
                        </p>
                      </div>
                    </div>
                    {isSelected && <span className="text-[11px] font-semibold text-accent">Added</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Member Chips & Clear All */}
          {selectedMemberIds.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-fg-3">
                  {selectedMemberIds.length} {selectedMemberIds.length === 1 ? 'member' : 'members'} selected
                </span>
                {selectedMemberIds.length > 1 && (
                  <button
                    type="button"
                    onClick={clearAllMembers}
                    className="text-[11px] font-semibold text-danger-fg hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMemberIds.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line-accent bg-page px-3 py-1 text-xs font-semibold text-fg"
                  >
                    <span>{id}</span>
                    <button
                      type="button"
                      onClick={() => removeMemberId(id)}
                      className="rounded-full p-0.5 text-fg-3 hover:bg-surface hover:text-danger-fg"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Field>

      <Card tone={empty ? 'dashed' : 'action'} className="py-3.5">
        <p className="m-0 text-[13px] font-bold text-fg">{estimateLabel}</p>
      </Card>
    </div>
  );
}
