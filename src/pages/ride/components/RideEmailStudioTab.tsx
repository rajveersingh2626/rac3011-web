import { useState } from 'react';
import { Send, ShieldAlert, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    slug: 'welcome-pass',
    name: 'Official Delegate Pass & Welcome',
    subject: 'Welcome to Delhi Meri Jaan 2026 • Your Official Delegate Pass [{{pass_ref}}]',
    body: `Dear {{delegate_name}},

Namaste from Rotary International District 3011!

We are thrilled to welcome you to the capital for "THE RIDE: DELHI MERI JAAN 2026". Your registration from RID {{district_number}} ({{club_name}}) has been successfully approved.

Your Official Delegate Reference: {{pass_ref}}
Designated Transit Hub: {{arrival_location}}
Assigned Host Club: {{host_club_name}}

Please keep your digital pass QR code handy during arrivals at our welcome desks. Our youth exchange leads will meet you with authentic Dilli refreshments and guide you to your host families.

Check the live 4-day itinerary: {{itinerary_url}}

Yours in Rotaract Fellowship,
Host Organizing Committee • RID 3011
Delhi Meri Jaan 2026`,
  },
  {
    id: 'tpl-2',
    slug: 'homestay-match',
    name: 'Homestay Allocation & Host Family Details',
    subject: 'Your Dilli Homestay Match • Delhi Meri Jaan 2026',
    body: `Dear {{delegate_name}},

We are pleased to introduce your host family for Delhi Meri Jaan!

Host Rotaractor: {{host_rotaractor_name}}
Host Club: {{host_club_name}}
Location: {{host_neighborhood}}, Delhi NCR
Contact: {{host_phone}}

Your host family has been briefed regarding your dietary preferences ({{dietary_preference}}) and arrival schedule. Feel free to connect with them on WhatsApp before departing.

Welcome to a home away from home!

Warm regards,
Homestay & Hospitality Team • RID 3011`,
  },
  {
    id: 'tpl-3',
    slug: 'farewell-certificate',
    name: 'Post-Exchange Certificate of Participation',
    subject: 'Delhi Meri Jaan 2026 • Official Certificate of Exchange & Memories',
    body: `Dear {{delegate_name}},

Thank you for making Delhi Meri Jaan 2026 an unforgettable celebration of friendship and culture!

Your verified Certificate of Participation has been generated and appended to your Rotaract RID 3011 profile.

Relive the magic on our Snap Gallery: {{gallery_url}}

May the memories of Old Delhi street safaris, Sufi night qawwalis, and late-night laughter stay with you forever.

With warm Rotaract hugs,
District Rotaract Representative & Exchange Committee
Rotary International District 3011`,
  },
];

function generateBespokeRideEmailHtml(title: string, rawBody: string, ctaUrl: string): string {
  const paragraphs = rawBody
    .split('\n\n')
    .filter((p) => p.trim() && !p.startsWith('Your Official Delegate') && !p.startsWith('Check the live') && !p.startsWith('Yours in') && !p.startsWith('Host Organizing') && !p.startsWith('Delhi Meri Jaan') && !p.startsWith('Warm regards') && !p.startsWith('With warm'));

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

  <!-- 1. CONTINUOUS HORIZONTAL YELLOW LINE TICKER (Homepage Signature Element) -->
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
        <!-- 2. Pop-Brutalist White Card Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 3px solid #171515; border-radius: 20px; box-shadow: 6px 6px 0px #171515; overflow: hidden;">
          
          <!-- Card Header Banner -->
          <tr>
            <td style="padding: 28px 24px 20px; text-align: center; background-color: #FDFBF7; border-bottom: 2px solid #171515;">
              <!-- Official 2026 Emblem -->
              <img src="https://ride.rotaract3011.org/ride/logos/2026_logo_coloured.png" alt="Delhi Meri Jaan 2026" width="180" style="max-width: 180px; height: auto; display: inline-block; margin-bottom: 12px;" />
              
              <!-- Cultural Slogan Badge -->
              <div>
                <span style="display: inline-block; padding: 4px 14px; background-color: #19539D; border: 2px solid #171515; border-radius: 999px; color: #FFFFFF; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;">
                  Rotary District Exchange &bull; RID 3011
                </span>
              </div>
            </td>
          </tr>

          <!-- Card Content Body -->
          <tr>
            <td style="padding: 28px 28px 24px;">
              <h1 class="email-hero-title" style="margin: 0 0 16px; font-size: 26px; font-weight: 900; line-height: 1.2; text-transform: uppercase; color: #171515; letter-spacing: -0.5px;">
                ${title}
              </h1>

              ${paragraphs.map((p) => `<p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #374151;">${p}</p>`).join('')}

              <!-- Event Dispatch Facts Card -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #FFFDF7; border: 2px solid #171515; border-radius: 12px; box-shadow: 3px 3px 0px #171515; overflow: hidden; font-size: 13px;">
                <tr style="background-color: #FBC02D; border-bottom: 2px solid #171515;">
                  <td colspan="2" style="padding: 8px 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #171515;">
                    Official Exchange Dispatch Record
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 12px; color: #6B7280; font-weight: bold; width: 40%;">Delegate Reference</td>
                  <td style="padding: 8px 12px; font-weight: 900; color: #19539D;">DMJ-902144</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 12px; color: #6B7280; font-weight: bold;">Transit Arrival Hub</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #171515;">IGI Airport T3 / NDLS</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 12px; color: #6B7280; font-weight: bold;">Assigned Host Club</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #59A835;">RAC Delhi South Central</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #6B7280; font-weight: bold;">Dates</td>
                  <td style="padding: 8px 12px; font-weight: 700; color: #EA6623;">October 2026 (4-Day Trail)</td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <div style="margin: 26px 0 16px; text-align: center;">
                <a href="${ctaUrl}" style="background-color: #EA6623; color: #FFFFFF; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 14px 32px; border: 2px solid #171515; border-radius: 12px; text-decoration: none; display: inline-block; box-shadow: 4px 4px 0px #171515;">
                  Access Event Portal & Pass &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Continuous Yellow Accent Strip before Footer -->
          <tr>
            <td style="height: 6px; background-color: #FBC02D; border-top: 2px solid #171515; border-bottom: 1px solid #171515;"></td>
          </tr>

          <!-- Card Footer -->
          <tr>
            <td style="padding: 20px 24px; background-color: #FDFBF7; text-align: center; font-size: 11px; color: #6B7280; line-height: 1.5;">
              <p style="margin: 0 0 6px; font-weight: 700; color: #171515;">
                Rotaract International District 3011 &bull; The RIDE: Delhi Meri Jaan
              </p>
              <p style="margin: 0;">
                Official Portal: <a href="https://ride.rotaract3011.org" style="color: #19539D; font-weight: bold; text-decoration: underline;">ride.rotaract3011.org</a>
              </p>
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
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0]);
  const [targetAudience, setTargetAudience] = useState('confirmed');
  const [testRecipient, setTestRecipient] = useState('delegate.preview@rotaract3011.org');
  const [dryRunSent, setDryRunSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [previewMode, setPreviewMode] = useState<'visual' | 'html' | 'text'>('visual');

  const previewSubject = selectedTemplate.subject
    .replace('{{pass_ref}}', 'DMJ-[REF]')
    .replace('{{district_number}}', '3141');

  const previewBody = selectedTemplate.body
    .replace(/\{\{delegate_name\}\}/g, '[Delegate Name]')
    .replace(/\{\{district_number\}\}/g, '[Home District]')
    .replace(/\{\{club_name\}\}/g, '[Home Rotaract Club]')
    .replace(/\{\{pass_ref\}\}/g, 'DMJ-[REF]')
    .replace(/\{\{arrival_location\}\}/g, '[Transit Hub / Airport Desk]')
    .replace(/\{\{host_club_name\}\}/g, '[Assigned Host Club]')
    .replace(/\{\{host_rotaractor_name\}\}/g, '[Host Rotaractor]')
    .replace(/\{\{host_neighborhood\}\}/g, '[Delhi Neighborhood]')
    .replace(/\{\{host_phone\}\}/g, '[Host Contact]')
    .replace(/\{\{dietary_preference\}\}/g, '[Dietary Preference]')
    .replace(/\{\{itinerary_url\}\}/g, 'https://delhimerijaan.rotaract3011.org/#itinerary')
    .replace(/\{\{gallery_url\}\}/g, 'https://delhimerijaan.rotaract3011.org/#gallery');

  const bespokeHtml = generateBespokeRideEmailHtml(
    selectedTemplate.name,
    previewBody,
    'https://delhimerijaan.rotaract3011.org',
  );

  const handleDryRunSend = () => {
    setDryRunSent(true);
    setTimeout(() => setDryRunSent(false), 4000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(bespokeHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Safety Alert Banner */}
      <div className="p-4 rounded-2xl border-2 border-[#19539D] bg-blue-50/70 flex items-start gap-3 text-xs text-[#19539D] font-bold">
        <ShieldAlert size={18} className="shrink-0 text-[#19539D] mt-0.5" />
        <div>
          <span className="uppercase tracking-wider font-black block">Bespoke Design Architecture:</span>
          Each template is strictly fixed and tailored for Delhi Meri Jaan 2026, integrating the continuous horizontal yellow line element and official district branding.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Template Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-600 block">
            Select Notification Template
          </span>
          {EMAIL_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedTemplate(tpl)}
              className={`w-full text-left p-4 rounded-2xl border-2 border-[#171515] transition-all cursor-pointer ${
                selectedTemplate.id === tpl.id
                  ? 'bg-white ride-pop scale-[1.02]'
                  : 'bg-[#FDFBF7] hover:bg-neutral-100 ride-pop-sm opacity-90'
              }`}
            >
              <div className="font-black text-sm text-[#171515]">{tpl.name}</div>
              <div className="text-[11px] text-neutral-500 truncate mt-1">{tpl.subject}</div>
            </button>
          ))}
        </div>

        {/* Template Preview and Dry Run */}
        <div className="lg:col-span-8">
          <Card rule="accent" padding="compact" className="border-2 border-[#171515] ride-pop-sm space-y-4">
            {/* Subject Line Bar */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Subject Line Preview</div>
              <div className="text-sm font-black text-[#171515] mt-0.5">{previewSubject}</div>
            </div>

            {/* Preview Mode Switcher */}
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
                  Live Visual Preview
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
                  HTML Source
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('text')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    previewMode === 'text'
                      ? 'bg-[#171515] text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  Plain Text
                </button>
              </div>

              <div className="text-[11px] font-bold text-neutral-500">
                Continuous Yellow Element: <span className="text-green-700 font-extrabold">Active</span>
              </div>
            </div>

            {/* Preview Content Area */}
            {previewMode === 'visual' && (
              <div className="rounded-2xl border-2 border-[#171515] overflow-hidden bg-neutral-100 shadow-inner">
                <iframe
                  title="Bespoke Email Client Preview"
                  srcDoc={bespokeHtml}
                  className="w-full h-[460px] border-0 bg-white"
                />
              </div>
            )}

            {previewMode === 'html' && (
              <div className="p-4 rounded-2xl border-2 border-neutral-300 bg-neutral-900 text-neutral-100 font-mono text-[11px] leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap">
                {bespokeHtml}
              </div>
            )}

            {previewMode === 'text' && (
              <div className="p-5 rounded-2xl border-2 border-neutral-200 bg-white font-mono text-xs leading-relaxed whitespace-pre-wrap text-neutral-800 max-h-[460px] overflow-y-auto">
                {previewBody}
              </div>
            )}

            {/* Audience Targeting Filter */}
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-neutral-300 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="font-bold text-neutral-700">
                <span className="text-[#19539D] font-black uppercase tracking-wider block text-[10px]">Restricted Scope:</span>
                Dispatches are strictly isolated to RIDE Youth Exchange delegates.
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-600 text-xs">Target Audience:</span>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-neutral-300 bg-white text-xs font-bold text-neutral-800"
                >
                  <option value="all">All Registered RIDE Delegates</option>
                  <option value="confirmed">Confirmed Delegates Only</option>
                  <option value="approved">Approved & Pending Delegates</option>
                  <option value="hosts">Assigned Host Club Leads</option>
                </select>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={handleCopyHtml} leading={copiedHtml ? <Check size={14} /> : <Copy size={14} />}>
                  {copiedHtml ? 'Copied HTML!' : 'Copy Bespoke HTML'}
                </Button>
                <Button size="sm" variant="secondary" onClick={handleCopy} leading={copied ? <Check size={14} /> : <Copy size={14} />}>
                  {copied ? 'Copied Text!' : 'Copy Text'}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#171515] text-xs font-medium"
                  placeholder="Test recipient email"
                />
                <Button size="sm" variant="primary" onClick={handleDryRunSend} leading={<Send size={13} />}>
                  {dryRunSent ? 'Dry-Run Logged!' : 'Simulate Dry-Run'}
                </Button>
              </div>
            </div>

            {dryRunSent && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-300 text-green-800 text-xs font-bold flex items-center gap-2">
                <Check size={15} />
                <span>Simulated dispatch recorded in audit logs for {testRecipient}. No real emails sent.</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

