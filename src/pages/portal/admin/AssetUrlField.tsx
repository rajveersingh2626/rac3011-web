import { useState } from 'react';
import { FileUpload, type FileUploadValue } from '@/components/ui/FileUpload';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Link2, Upload, ExternalLink } from 'lucide-react';
import type { StorageTier } from '@/lib/upload';

export interface AssetUrlFieldProps {
  label: string;
  url: string | null | undefined;
  onChange: (url: string | null) => void;
  resourceType: string;
  tier?: StorageTier;
}

export function AssetUrlField({ label, url, onChange, resourceType, tier = 'permanent' }: AssetUrlFieldProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const value: FileUploadValue | null = url ? { kind: 'link', url } : null;

  return (
    <div className="flex flex-col gap-2">
      <FileUpload
        label={label}
        tier={tier}
        resourceType={resourceType}
        value={value}
        onChange={(next) => {
          onChange(next ? (next.kind === 'file' ? (next.file.url ?? null) : next.url) : null);
        }}
      />

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline cursor-pointer bg-transparent border-0 p-0"
        >
          {showUrlInput ? (
            <>
              <Upload className="size-3.5" />
              <span>Hide custom URL input</span>
            </>
          ) : (
            <>
              <Link2 className="size-3.5" />
              <span>Or enter direct image URL</span>
            </>
          )}
        </button>

        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-fg-3 hover:text-accent"
          >
            <span>Open preview</span>
            <ExternalLink className="size-3" />
          </a>
        ) : null}
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="url"
            placeholder="https://... or /showcase_images/..."
            value={url ?? ''}
            onChange={(e) => onChange(e.target.value.trim() || null)}
            className="text-xs"
          />
          {url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
              className="text-xs shrink-0"
            >
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
