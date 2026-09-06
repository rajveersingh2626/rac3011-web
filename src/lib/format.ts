import { formatDistanceToNowStrict } from 'date-fns';

export function relativeTimeOrFallback(value: string | null, fallback = 'Not sent yet'): string {
  if (!value) return fallback;
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function titleCaseSlug(input: string): string {
  return input
    .split(/[-_]/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}
