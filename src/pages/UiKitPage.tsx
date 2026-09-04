import { useDocumentMeta } from '@/lib/meta';

export function UiKitPage() {
  useDocumentMeta({ title: 'UI kit' });
  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-fg">UI kit</h1>
    </div>
  );
}
