import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Send, Check, Copy, Trash2, Mail, Users, Building, ShieldCheck, 
  MessageSquare, History, CheckCircle2, Search, X, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  getStoredRideAnnouncements, saveStoredRideAnnouncement, deleteStoredRideAnnouncement,
  type StoredRideAnnouncement 
} from '@/lib/ride/formsStorage';
import { dispatchRideBroadcast } from '@/lib/ride/rideBroadcastApi';
import { fetchRideDistricts } from '@/lib/ride/api';

function generateBespokeRideEmailHtml(
  title: string,
  rawBody: string,
  cta?: { label?: string; url?: string } | null,
): string {
  const paragraphs = rawBody
    .split('\n\n')
    .filter((p) => p.trim());

  const ctaLabel = cta?.label?.trim() || 'Join the RIDE';
  const ctaUrl = cta?.url?.trim() || 'https://ride.rotar3011.org';
  const ctaBlock =
    cta !== null
      ? `
              <!-- Integrated Editable CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 16px; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 34px; background: linear-gradient(135deg, #19539D 0%, #0D2C54 100%); background-color: #19539D; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border: 2px solid #171515; border-radius: 12px; box-shadow: 4px 4px 0px #171515;">
                      ${ctaLabel} &rarr;
                    </a>
                  </td>
                </tr>
              </table>`
      : '';

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

              ${ctaBlock}

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

function simulatePreviewText(text: string, selectedDistricts: string[]): string {
  const sampleDistrict = selectedDistricts[0] || '3141';
  return text
    .replace(/\{\{\s*(?:name|delegate_name|full_name)\s*\}\}/gi, 'Rtr. Rohan Mehra')
    .replace(/\{\{\s*district_number\s*\}\}/gi, sampleDistrict)
    .replace(/\{\{\s*(?:pass_reference|pass_ref)\s*\}\}/gi, 'DMJ-2026-X89A')
    .replace(/\{\{\s*(?:host_club|host_club_name)\s*\}\}/gi, 'Rotaract Club of Delhi Central');
}

export function RideEmailStudioTab() {
  const [activeSubTab, setActiveSubTab] = useState<'compose' | 'history'>('compose');
  const [announcements, setAnnouncements] = useState<StoredRideAnnouncement[]>(() => getStoredRideAnnouncements());

  // Targeting state
  const [targetAll, setTargetAll] = useState(true);
  const [targetHostClubsOnly, setTargetHostClubsOnly] = useState(false);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [districtSearch, setDistrictSearch] = useState('');
  const [customEmailsInput, setCustomEmailsInput] = useState('');
  const [publishAsAnnouncement, setPublishAsAnnouncement] = useState(true);

  // Dynamic districts pulled directly from actual registered user credentials in database
  const { data: dynamicDistricts = [] } = useQuery({
    queryKey: ['ride', 'districts'],
    queryFn: fetchRideDistricts,
  });

  const allAvailableDistricts = [...dynamicDistricts].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );

  // Form State
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [previewMode, setPreviewMode] = useState<'visual' | 'html'>('visual');
  const [includeCta, setIncludeCta] = useState(true);
  const [ctaLabel, setCtaLabel] = useState('Join the RIDE');
  const [ctaUrl, setCtaUrl] = useState('https://ride.rotar3011.org');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);

  useEffect(() => {
    const handleSync = () => setAnnouncements(getStoredRideAnnouncements());
    window.addEventListener('ride_announcements_updated', handleSync);
    return () => window.removeEventListener('ride_announcements_updated', handleSync);
  }, []);

  const insertToken = (token: string) => {
    setBody((prev) => prev + ` ${token} `);
  };

  const toggleDistrict = (d: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d],
    );
    if (targetAll) setTargetAll(false);
  };

  const filteredDistricts = allAvailableDistricts.filter((d) =>
    d.includes(districtSearch.trim()),
  );

  // Live preview content with simulated tokens
  const previewSubject = simulatePreviewText(
    subject || 'DELHI MERI JAAN 2026 NOTIFICATION',
    selectedDistricts,
  );
  const previewBody = simulatePreviewText(
    body || 'Compose your message to view the live responsive preview with simulated dynamic tokens.',
    selectedDistricts,
  );

  const bespokeHtml = generateBespokeRideEmailHtml(
    previewSubject,
    previewBody,
    includeCta ? { label: ctaLabel, url: ctaUrl } : null,
  );

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(bespokeHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setErrorMessage(null);
    setSendSuccess(null);

    const customEmails = customEmailsInput
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.includes('@'));

    const isExplicitAll =
      targetAll &&
      selectedDistricts.length === 0 &&
      customEmails.length === 0 &&
      !targetHostClubsOnly;

    try {
      const result = await dispatchRideBroadcast({
        subject: subject.trim(),
        body: body.trim(),
        all: isExplicitAll,
        hostClubsOnly: targetHostClubsOnly,
        districtNumbers: selectedDistricts.length > 0 ? selectedDistricts : undefined,
        customEmails: customEmails.length > 0 ? customEmails : undefined,
        publishAsAnnouncement,
        ctaLabel: includeCta ? ctaLabel.trim() : undefined,
        ctaUrl: includeCta ? ctaUrl.trim() : undefined,
      });

      const audienceDesc = isExplicitAll
        ? 'All Registered Delegates'
        : selectedDistricts.length > 0
          ? `Districts: ${selectedDistricts.join(', ')}`
          : targetHostClubsOnly
            ? 'Host Clubs Only'
            : customEmails.length > 0
              ? `${customEmails.length} Custom Email(s)`
              : 'Targeted Audience';

      if (publishAsAnnouncement) {
        saveStoredRideAnnouncement({
          subject: subject.trim(),
          body: body.trim(),
          audienceScope: isExplicitAll ? 'all' : selectedDistricts.length > 0 ? 'district' : 'individual',
          targetValue: audienceDesc,
          targetDistricts: selectedDistricts,
          targetEmails: customEmails,
          sender: 'RIDE Organizing Committee (RID 3011)',
          recipientCount: result.dispatchedCount,
        });
      }

      setAnnouncements(getStoredRideAnnouncements());
      setSendSuccess(`Successfully queued ${result.dispatchedCount} email(s) for delivery!`);
      setSubject('');
      setBody('');
      setCustomEmailsInput('');

      setTimeout(() => {
        setSendSuccess(null);
        setActiveSubTab('history');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to dispatch broadcast. Please verify connectivity.');
    } finally {
      setSending(false);
    }
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

              {/* Enhanced Recipient Targeting Controls */}
              <div className="space-y-3 rounded-2xl border-2 border-neutral-200 bg-neutral-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter size={13} className="text-[#EA6623]" />
                    <span>Audience Targeting & Scope</span>
                  </label>
                  <span className="text-[10px] font-bold text-neutral-500">
                    Select one or more filters
                  </span>
                </div>

                {/* Main Scope Switches */}
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    targetAll
                      ? 'border-[#19539D] bg-blue-50/80 text-[#19539D] ring-1 ring-[#19539D]'
                      : 'border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={targetAll}
                      onChange={(e) => {
                        setTargetAll(e.target.checked);
                        if (e.target.checked) setSelectedDistricts([]);
                      }}
                      className="rounded text-[#19539D] focus:ring-[#19539D]"
                    />
                    <Users size={14} className="shrink-0" />
                    <span>All Registered Delegates</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    targetHostClubsOnly
                      ? 'border-[#59A835] bg-emerald-50/80 text-emerald-800 ring-1 ring-[#59A835]'
                      : 'border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={targetHostClubsOnly}
                      onChange={(e) => setTargetHostClubsOnly(e.target.checked)}
                      className="rounded text-[#59A835] focus:ring-[#59A835]"
                    />
                    <ShieldCheck size={14} className="shrink-0" />
                    <span>Host Clubs Only</span>
                  </label>
                </div>

                {/* District Selector & Search */}
                <div className="space-y-2 pt-1 border-t border-neutral-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase text-neutral-700 flex items-center gap-1">
                      <Building size={12} />
                      <span>Filter by District Number ({selectedDistricts.length} selected)</span>
                    </span>
                    {selectedDistricts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedDistricts([])}
                        className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      placeholder="Search district numbers (e.g. 3011, 3141)..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#19539D] bg-white"
                    />
                  </div>

                  {/* District Pills Grid */}
                  {allAvailableDistricts.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic py-2 px-1">
                      No registered participant districts found in database.
                    </p>
                  ) : filteredDistricts.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic py-2 px-1">
                      No registered districts match &quot;{districtSearch}&quot;.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                      {filteredDistricts.map((d) => {
                        const isSelected = selectedDistricts.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDistrict(d)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-[#19539D] text-white border border-[#19539D] shadow-sm'
                                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            <span>RID {d}</span>
                            {isSelected && <Check size={11} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Custom Email Input */}
                <div className="space-y-1.5 pt-1 border-t border-neutral-200">
                  <label className="text-[11px] font-black uppercase text-neutral-700 flex items-center gap-1">
                    <Mail size={12} />
                    <span>Custom Guest Emails (Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={customEmailsInput}
                    onChange={(e) => {
                      setCustomEmailsInput(e.target.value);
                      if (e.target.value.trim() && targetAll) setTargetAll(false);
                    }}
                    placeholder="Enter additional emails separated by commas or newlines..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#19539D] bg-white"
                  />
                </div>
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
                  placeholder="e.g. Important DMJ 2026 Itinerary & Homestay Briefing: {{district_number}}"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-[#171515] focus:outline-none focus:ring-2 focus:ring-[#19539D]"
                />
              </div>

              {/* Variable Token Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-bold">
                  <span>Dynamic Insertion Tokens</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Click to insert at cursor</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Delegate Name', token: '{{name}}' },
                    { label: 'Home District', token: '{{district_number}}' },
                    { label: 'Pass Reference', token: '{{pass_reference}}' },
                    { label: 'Assigned Host Club', token: '{{host_club}}' },
                  ].map((chip) => (
                    <button
                      key={chip.token}
                      type="button"
                      onClick={() => insertToken(chip.token)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
                    >
                      {chip.label} &bull; <span className="text-[#EA6623]">{chip.token}</span>
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
                  placeholder="Dear {{name}}, Welcome to RID {{district_number}} delegation. Your pass reference is {{pass_reference}} and your designated host club is {{host_club}}..."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#19539D]"
                />
              </div>

              {/* Editable CTA Button Setting */}
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeCta"
                      checked={includeCta}
                      onChange={(e) => setIncludeCta(e.target.checked)}
                      className="rounded text-[#19539D] focus:ring-[#19539D] h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="includeCta" className="text-xs font-black text-neutral-800 uppercase tracking-wider cursor-pointer">
                      Integrated Action Button (CTA)
                    </label>
                  </div>
                  {includeCta && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-[#19539D]">
                      Active in Email
                    </span>
                  )}
                </div>

                {includeCta && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-600 block">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={ctaLabel}
                        onChange={(e) => setCtaLabel(e.target.value)}
                        placeholder="e.g. Join the RIDE"
                        className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-bold text-[#171515] bg-white focus:outline-none focus:ring-2 focus:ring-[#19539D]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-600 block">
                        Hyperlink URL
                      </label>
                      <input
                        type="text"
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        placeholder="https://ride.rotar3011.org"
                        className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-medium text-[#171515] bg-white focus:outline-none focus:ring-2 focus:ring-[#19539D]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status and Error Banners */}
              {errorMessage && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-800 flex items-center justify-between">
                  <span>{errorMessage}</span>
                  <button onClick={() => setErrorMessage(null)}><X size={14} /></button>
                </div>
              )}

              {sendSuccess && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>{sendSuccess}</span>
                </div>
              )}

              {/* In-Portal Announcement Toggle */}
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="publishAsAnnouncement"
                  checked={publishAsAnnouncement}
                  onChange={(e) => setPublishAsAnnouncement(e.target.checked)}
                  className="rounded text-[#19539D] focus:ring-[#19539D] h-4 w-4 mt-0.5 cursor-pointer"
                />
                <label htmlFor="publishAsAnnouncement" className="cursor-pointer text-xs">
                  <span className="font-bold text-[#171515] block">Publish as In-Portal Announcement</span>
                  <span className="text-[11px] text-neutral-600 font-medium leading-normal block mt-0.5">
                    Automatically sync this broadcast to the Participant Portal feed and Delegate Inbox for real-time in-app delivery.
                  </span>
                </label>
              </div>

              {/* Submit & Dispatch Action */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-neutral-100">
                <div className="text-[11px] text-neutral-500 font-medium">
                  Ready to broadcast to {targetAll ? 'All Registered Delegates' : 'targeted filters'}
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
                    className="w-full h-[540px] border-0 bg-white"
                  />
                </div>
              ) : (
                <div className="p-4 rounded-2xl border-2 border-neutral-300 bg-neutral-900 text-neutral-100 font-mono text-[11px] leading-relaxed max-h-[540px] overflow-y-auto whitespace-pre-wrap">
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
