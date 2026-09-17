import { useState, useEffect } from 'react';
import { 
  Send, Check, Copy, Trash2, Mail, Users, Building, ShieldCheck, 
  MessageSquare, History, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  getStoredRideAnnouncements, saveStoredRideAnnouncement, deleteStoredRideAnnouncement,
  type StoredRideAnnouncement 
} from '@/lib/ride/formsStorage';

function generateBespokeRideEmailHtml(title: string, rawBody: string): string {
  const paragraphs = rawBody
    .split('\n\n')
    .filter((p) => p.trim());

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .email-card { border-width: 2px !important; }
      .email-hero-title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171515;">

  <!-- Signature Continuous Yellow Bar -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FBC02D; border-bottom: 3px solid #171515;">
    <tr>
      <td style="padding: 10px 16px; text-align: center;">
        <span style="font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #171515;">
          DELHI MERI JAAN 2026 &bull; ROTARY INTERNATIONAL DISTRICT 3011 &bull; THE RIDE
        </span>
      </td>
    </tr>
  </table>

  <!-- Main Body Container -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FDFBF7; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 3px solid #171515; border-radius: 20px; box-shadow: 6px 6px 0px #171515; overflow: hidden;">
          <tr>
            <td style="padding: 24px 24px 18px; text-align: center; background-color: #FDFBF7; border-bottom: 2px solid #171515;">
              <span style="display: inline-block; padding: 4px 14px; background-color: #19539D; border: 2px solid #171515; border-radius: 999px; color: #FFFFFF; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;">
                Official RIDE Communication &bull; RID 3011
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 28px 24px;">
              <h1 class="email-hero-title" style="margin: 0 0 16px; font-size: 24px; font-weight: 900; line-height: 1.25; text-transform: uppercase; color: #171515; letter-spacing: -0.5px;">
                ${title}
              </h1>

              ${paragraphs.map((p) => `<p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #374151;">${p.replace(/\n/g, '<br/>')}</p>`).join('')}

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; padding-top: 16px; border-top: 2px dashed #E5E7EB; text-align: center;">
                <tr>
                  <td style="font-size: 11px; color: #6B7280; line-height: 1.5;">
                    Rotary International District 3011 &bull; Delhi Meri Jaan 2026<br/>
                    Delivered securely via the RIDE Operations Console.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function RideEmailStudioTab() {
  const [activeSubTab, setActiveSubTab] = useState<'compose' | 'history'>('compose');
  const [announcements, setAnnouncements] = useState<StoredRideAnnouncement[]>(() => getStoredRideAnnouncements());

  // Form State
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audienceScope, setAudienceScope] = useState<'all' | 'district' | 'host_club' | 'individual'>('all');
  const [targetValue, setTargetValue] = useState('');
  const [previewMode, setPreviewMode] = useState<'visual' | 'html'>('visual');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  useEffect(() => {
    const handleSync = () => setAnnouncements(getStoredRideAnnouncements());
    window.addEventListener('ride_announcements_updated', handleSync);
    return () => window.removeEventListener('ride_announcements_updated', handleSync);
  }, []);

  const insertToken = (token: string) => {
    setBody((prev) => prev + ` ${token} `);
  };

  const bespokeHtml = generateBespokeRideEmailHtml(
    subject || 'DELHI MERI JAAN 2026 NOTIFICATION',
    body || 'Compose your message to view the live responsive preview.'
  );

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(bespokeHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);

    setTimeout(() => {
      saveStoredRideAnnouncement({
        subject: subject.trim(),
        body: body.trim(),
        audienceScope,
        targetValue: audienceScope === 'all' ? undefined : targetValue.trim(),
        sender: 'RIDE Organizing Committee (RID 3011)',
        recipientCount: audienceScope === 'all' ? 65 : audienceScope === 'individual' ? 1 : 12,
      });

      setAnnouncements(getStoredRideAnnouncements());
      setSending(false);
      setSendSuccess(true);
      setSubject('');
      setBody('');
      setTargetValue('');

      setTimeout(() => {
        setSendSuccess(false);
        setActiveSubTab('history');
      }, 1200);
    }, 600);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (window.confirm('Delete this sent communication record?')) {
      deleteStoredRideAnnouncement(id);
      setAnnouncements(getStoredRideAnnouncements());
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Pill Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('compose')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'compose'
                ? 'bg-[#19539D] text-white ride-pop-sm'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300'
            }`}
          >
            <MessageSquare size={14} />
            <span>Compose Email Announcement</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'bg-[#19539D] text-white ride-pop-sm'
                : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300'
            }`}
          >
            <History size={14} />
            <span>Sent Communications Log ({announcements.length})</span>
          </button>
        </div>

        <div className="text-xs font-bold text-neutral-500 font-mono">
          RIDE Announcements Engine &bull; RID 3011
        </div>
      </div>

      {activeSubTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Compose Form Column */}
          <div className="lg:col-span-6 space-y-4">
            <Card rule="accent" padding="compact" className="border-2 border-[#171515] ride-pop-sm space-y-4 bg-white">
              <div>
                <h3 className="text-sm font-black uppercase text-[#171515] tracking-wide">
                  Compose Email Announcement
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Broadcast notices, travel alerts, and hosting updates to visiting delegates and host clubs.
                </p>
              </div>

              {/* Audience Scope Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-800 uppercase tracking-wider block">
                  Audience Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'All Registered Delegates', icon: Users },
                    { id: 'district', label: 'Filter by District No.', icon: Building },
                    { id: 'host_club', label: 'Host Clubs Only', icon: ShieldCheck },
                    { id: 'individual', label: 'Single Delegate (Email)', icon: Mail },
                  ].map((scope) => {
                    const Icon = scope.icon;
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => setAudienceScope(scope.id as any)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          audienceScope === scope.id
                            ? 'border-[#19539D] bg-blue-50/70 text-[#19539D] ring-2 ring-[#19539D]'
                            : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <Icon size={14} className="shrink-0" />
                        <span className="truncate">{scope.label}</span>
                      </button>
                    );
                  })}
                </div>

                {audienceScope !== 'all' && (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder={
                        audienceScope === 'district'
                          ? 'Enter Rotary District Number (e.g. 3141)'
                          : audienceScope === 'host_club'
                            ? 'Enter Host Club Name'
                            : 'Enter Delegate Email Address'
                      }
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#19539D]"
                    />
                  </div>
                )}
              </div>

              {/* Subject Line */}
              <div className="space-y-1">
                <label className="text-xs font-black text-neutral-800 uppercase tracking-wider block">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Important Itinerary Update: Old Delhi Heritage Walk Coordinates"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-[#171515] focus:outline-none focus:ring-2 focus:ring-[#19539D]"
                />
              </div>

              {/* Variable Token Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-bold">
                  <span>Dynamic Personalization Tokens:</span>
                  <span className="text-[10px] text-[#EA6623]">Click to insert</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { token: '{{delegate_name}}', label: 'Delegate Name' },
                    { token: '{{district_number}}', label: 'District No.' },
                    { token: '{{pass_ref}}', label: 'Pass Ref' },
                    { token: '{{host_club_name}}', label: 'Host Club' },
                  ].map((chip) => (
                    <button
                      key={chip.token}
                      type="button"
                      onClick={() => insertToken(chip.token)}
                      className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-mono font-bold transition-all cursor-pointer border border-neutral-300"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <label className="text-xs font-black text-neutral-800 uppercase tracking-wider block">
                  Announcement Body
                </label>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your email content here. Paragraph breaks are supported..."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#19539D]"
                />
              </div>

              {/* Submit & Dispatch Action */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-neutral-100">
                <div className="text-[11px] text-neutral-500 font-medium">
                  {sendSuccess ? (
                    <span className="text-green-600 font-black flex items-center gap-1">
                      <CheckCircle2 size={14} /> Announcement Dispatched!
                    </span>
                  ) : (
                    <span>Ready to broadcast to {audienceScope === 'all' ? 'All Registered Delegates' : 'targeted recipients'}</span>
                  )}
                </div>

                <Button
                  variant="primary"
                  loading={sending}
                  disabled={sending || !subject.trim() || !body.trim()}
                  onClick={handleSend}
                  leading={<Send size={14} />}
                >
                  Broadcast Announcement
                </Button>
              </div>
            </Card>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-6 space-y-4">
            <Card rule="accent" padding="compact" className="border-2 border-[#171515] ride-pop-sm space-y-3 bg-white">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('visual')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      previewMode === 'visual'
                        ? 'bg-[#171515] text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    Visual Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('html')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      previewMode === 'html'
                        ? 'bg-[#171515] text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    HTML Code
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="px-2.5 py-1 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedHtml ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  <span>{copiedHtml ? 'Copied' : 'Copy HTML'}</span>
                </button>
              </div>

              {previewMode === 'visual' ? (
                <div className="rounded-2xl border-2 border-[#171515] overflow-hidden bg-neutral-100 shadow-inner">
                  <iframe
                    title="Live Email Preview"
                    srcDoc={bespokeHtml}
                    className="w-full h-[520px] border-0 bg-white"
                  />
                </div>
              ) : (
                <div className="p-4 rounded-2xl border-2 border-neutral-300 bg-neutral-900 text-neutral-100 font-mono text-[11px] leading-relaxed max-h-[520px] overflow-y-auto whitespace-pre-wrap">
                  {bespokeHtml}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-[#171515]">
              Dispatched Announcements Log
            </h3>
            <span className="text-xs text-neutral-500 font-mono font-bold">
              Total Communications: {announcements.length}
            </span>
          </div>

          {announcements.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300 bg-white">
              <Mail size={36} className="mx-auto text-neutral-400 mb-2" />
              <h4 className="text-sm font-black text-neutral-700 uppercase">No Announcements Dispatched Yet</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Use the Compose tab to draft and send official announcements to visiting delegates and host families.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <Card
                  key={ann.id}
                  rule="accent"
                  padding="compact"
                  className="border-2 border-[#171515] ride-pop-sm bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-[#171515]">
                        {ann.subject}
                      </h4>
                      <Badge tone={ann.audienceScope === 'all' ? 'green' : 'blue'}>
                        {ann.audienceScope === 'all'
                          ? 'All Delegates'
                          : `${ann.audienceScope}: ${ann.targetValue || ''}`}
                      </Badge>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase">
                        {ann.deliveryStatus}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {ann.body}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-mono pt-1">
                      <span>Sent: {new Date(ann.sentAt).toLocaleString()}</span>
                      <span>Recipients: ~{ann.recipientCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-all text-xs flex items-center gap-1 cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline text-[11px] font-bold">Remove</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
