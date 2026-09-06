import type { ReportField } from './types';

export const NOTES_FIELD_KEY = 'notes';

export interface FieldGroups {
  topFields: ReportField[];
  activityFields: ReportField[];
  notesField: ReportField | null;
}

export function splitFields(fields: ReportField[]): FieldGroups {
  const sorted = [...fields].sort((a, b) => a.order - b.order);
  return {
    topFields: sorted.filter((f) => !f.perActivity && f.fieldKey !== NOTES_FIELD_KEY),
    activityFields: sorted.filter((f) => f.perActivity),
    notesField: sorted.find((f) => f.fieldKey === NOTES_FIELD_KEY) ?? null,
  };
}

export interface FieldSection {
  section: string;
  fields: ReportField[];
}

export function sectionsOf(fields: ReportField[]): FieldSection[] {
  const sorted = [...fields].sort((a, b) => a.order - b.order);
  const sections: FieldSection[] = [];
  for (const field of sorted) {
    let group = sections.find((s) => s.section === field.section);
    if (!group) {
      group = { section: field.section, fields: [] };
      sections.push(group);
    }
    group.fields.push(field);
  }
  return sections;
}

export function selectChoices(options: unknown): string[] {
  if (options && typeof options === 'object' && Array.isArray((options as { choices?: unknown }).choices)) {
    return (options as { choices: string[] }).choices;
  }
  return [];
}

export function linkAllowsMultiple(options: unknown): boolean {
  return !!options && typeof options === 'object' && (options as { multiple?: boolean }).multiple === true;
}

export function humanize(raw: string): string {
  return raw
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function defaultValueForField(field: ReportField): unknown {
  switch (field.type) {
    case 'boolean':
      return false;
    case 'multiselect':
    case 'clubs':
      return [];
    case 'link':
      return linkAllowsMultiple(field.options) ? [] : '';
    case 'number':
      return '';
    default:
      return '';
  }
}

export function emptyActivity(activityFields: ReportField[]): Record<string, unknown> {
  const activity: Record<string, unknown> = {};
  for (const field of activityFields) activity[field.fieldKey] = defaultValueForField(field);
  return activity;
}

export function activitiesOf(values: Record<string, unknown> | null | undefined): Record<string, unknown>[] {
  const raw = values?.activities;
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

export function activitySummaryLabel(activity: Record<string, unknown>): string {
  const title = activity.event_name ?? activity.activity_title;
  if (typeof title === 'string' && title.trim()) return title;
  const anyText = Object.values(activity).find((v) => typeof v === 'string' && v.trim());
  return typeof anyText === 'string' ? anyText : 'Untitled activity';
}

export function activitySummaryDetail(activity: Record<string, unknown>): string {
  const parts: string[] = [];
  const date = activity.event_date ?? activity.activity_date;
  if (typeof date === 'string' && date) parts.push(date);
  const venue = activity.venue;
  if (typeof venue === 'string' && venue.trim()) parts.push(venue.trim());
  const strength = activity.club_strength ?? activity.members_participated;
  if (typeof strength === 'number' || (typeof strength === 'string' && strength !== '')) {
    parts.push(`${strength} attendees`);
  }
  const reached = activity.beneficiary_count ?? activity.people_reached;
  if (typeof reached === 'number' || (typeof reached === 'string' && reached !== '')) {
    parts.push(`${reached} beneficiaries`);
  }
  return parts.join(' · ');
}

export function isActivityFilled(activity: Record<string, unknown>, activityFields: ReportField[]): boolean {
  return activityFields
    .filter((f) => f.required)
    .every((f) => {
      const v = activity[f.fieldKey];
      return v !== undefined && v !== null && v !== '';
    });
}

export function formatFieldValue(field: ReportField, value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  switch (field.type) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'multiselect':
    case 'clubs':
      return Array.isArray(value) && value.length > 0 ? value.join(', ') : '—';
    case 'link':
      return Array.isArray(value) ? (value.length > 0 ? `${value.length} link(s)` : '—') : String(value);
    case 'select':
      return humanize(String(value));
    default:
      return String(value);
  }
}
