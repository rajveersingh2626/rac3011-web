import { Link } from 'react-router';
import { useDocumentMeta } from '@/lib/meta';
import { Button } from '@/components/ui/Button';

export function PendingPage() {
  useDocumentMeta({ title: 'Registration pending' });
  return (
    <div className="text-center">
      <h1 className="m-0 mb-2 text-[22px] font-extrabold tracking-tight text-fg">Almost there</h1>
      <p className="m-0 mb-6 text-[13.5px] text-fg-2">
        Your club&apos;s president or secretary needs to approve your account before you can sign in. This
        usually takes a day or two &ndash; we&apos;ll let you know by email once it&apos;s done.
      </p>
      <Link to="/portal/login">
        <Button variant="secondary" block>
          Back to sign in
        </Button>
      </Link>
    </div>
  );
}
