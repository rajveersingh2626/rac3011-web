import { galleryApi } from '@/lib/publicContent/api';
import { GALLERY_CATEGORIES, GALLERY_TYPES, type GalleryItem } from '@/lib/publicContent/types';
import { Badge } from '@/components/ui/Badge';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { AssetUrlField } from './AssetUrlField';
import { PublicContentTable } from './PublicContentTable';

export function GalleryAdmin({ canWrite }: { canWrite: boolean }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <PublicContentTable<GalleryItem>
      title="Gallery Photo"
      queryKey="gallery-admin"
      crud={galleryApi}
      orderable
      canWrite={canWrite}
      writableKeys={['title', 'eventName', 'category', 'galleryType', 'imageUrl', 'caption', 'date']}
      emptyValues={{
        title: '',
        eventName: '',
        category: 'District Events',
        galleryType: 'district',
        imageUrl: '',
        caption: '',
        date: today,
      }}
      columns={[
        {
          key: 'imageUrl',
          header: 'Photo',
          cell: (r) =>
            r.imageUrl ? (
              <img
                src={r.imageUrl}
                alt={r.title}
                className="size-11 rounded-lg object-cover bg-surface-2 border border-line"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-fg-4 text-xs italic">—</span>
            ),
        },
        {
          key: 'title',
          header: 'Title & Event',
          cell: (r) => (
            <div>
              <div className="font-medium text-fg-1 text-sm">{r.title}</div>
              {r.eventName && <div className="text-xs text-fg-3">{r.eventName}</div>}
            </div>
          ),
        },
        {
          key: 'galleryType',
          header: 'Target Gallery',
          cell: (r) => (
            <Badge tone={r.galleryType === 'ride' ? 'amber' : 'neutral'}>
              {r.galleryType === 'ride' ? 'RIDE Gallery' : 'Main District'}
            </Badge>
          ),
        },
        {
          key: 'category',
          header: 'Category',
          cell: (r) => <Badge tone="neutral">{r.category || 'District Events'}</Badge>,
        },
        {
          key: 'date',
          header: 'Date',
          cell: (r) => <span className="text-xs text-fg-3 font-mono">{r.date}</span>,
        },
      ]}
      renderForm={({ values, setValues }) => (
        <div className="flex flex-col gap-4">
          <Field label="Target Gallery Destination" required hint="Classify whether this photo appears in the Main District Gallery or the RIDE Snap-Scroll">
            <Select
              options={GALLERY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              value={values.galleryType ?? 'district'}
              onChange={(e) => setValues({ galleryType: e.target.value })}
            />
          </Field>
          <Field label="Photo Title" required hint="Brief caption or descriptive headline">
            <Input
              value={values.title ?? ''}
              onChange={(e) => setValues({ title: e.target.value })}
              placeholder="e.g. Annual District Assembly 2026"
            />
          </Field>
          <Field label="Event / Occasion Name" hint="Optional event or project context">
            <Input
              value={values.eventName ?? ''}
              onChange={(e) => setValues({ eventName: e.target.value })}
              placeholder="e.g. Aagaaz, Mahadan, District Conference"
            />
          </Field>
          <Field label="Category" required>
            <Select
              options={GALLERY_CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={values.category ?? 'District Events'}
              onChange={(e) => setValues({ category: e.target.value })}
            />
          </Field>
          <Field label="Date" required>
            <Input
              type="date"
              value={values.date ?? today}
              onChange={(e) => setValues({ date: e.target.value })}
            />
          </Field>
          <AssetUrlField
            label="Photo / Image"
            url={values.imageUrl}
            onChange={(imageUrl) => setValues({ imageUrl: imageUrl ?? '' })}
            resourceType="gallery_photo"
          />
          <Field label="Description / Caption" hint="Optional detailed note or photo credits">
            <Textarea
              rows={3}
              value={values.caption ?? ''}
              onChange={(e) => setValues({ caption: e.target.value })}
              placeholder="Details about the photograph..."
            />
          </Field>
        </div>
      )}
    />
  );
}
