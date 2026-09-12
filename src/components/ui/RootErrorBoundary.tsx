import { FC } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router';
import { ArrowLeft, Home, RotateCcw, AlertTriangle } from 'lucide-react';

export const RootErrorBoundary: FC = () => {
  const error = useRouteError();
  console.error('Captured Route Error:', error);

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred while rendering this page.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Page Not Found';
      message = "The page you are looking for doesn't exist or has moved.";
    } else {
      title = `${error.status} — ${error.statusText || 'Error'}`;
      message = typeof error.data === 'string' ? error.data : 'The server returned an error response.';
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4 py-16 text-center">
      <div className="w-full max-w-md rounded-[20px] border border-line-accent bg-surface p-8 shadow-md">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <AlertTriangle size={24} />
        </div>
        <h1 className="m-0 text-2xl font-extrabold text-fg">{title}</h1>
        <p className="mt-2.5 text-[13.5px] text-fg-2 leading-relaxed">{message}</p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => { window.location.href = '/'; }}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-bold text-white shadow-xs transition hover:opacity-95"
          >
            <Home size={15} /> District Website
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = '/portal/dashboard'; }}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-line-accent bg-surface px-4 py-2.5 text-[13px] font-bold text-fg shadow-xs transition hover:bg-page"
          >
            <ArrowLeft size={15} /> Member Portal
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-line-accent bg-transparent px-3 py-2.5 text-[13px] font-bold text-fg-3 transition hover:text-fg"
            title="Reload page"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
