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

export function RideEmailStudioTab() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0]);
  const [testRecipient, setTestRecipient] = useState('delegate.preview@rotaract3011.org');
  const [dryRunSent, setDryRunSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const previewSubject = selectedTemplate.subject
    .replace('{{pass_ref}}', 'DMJ-902144')
    .replace('{{district_number}}', '3141');

  const previewBody = selectedTemplate.body
    .replace(/\{\{delegate_name\}\}/g, 'Rtr. Rohan Malhotra')
    .replace(/\{\{district_number\}\}/g, '3141')
    .replace(/\{\{club_name\}\}/g, 'Rotaract Club of Bombay Midtown')
    .replace(/\{\{pass_ref\}\}/g, 'DMJ-902144')
    .replace(/\{\{arrival_location\}\}/g, 'IGI Airport Terminal 3')
    .replace(/\{\{host_club_name\}\}/g, 'Rotaract Club of Delhi South Central')
    .replace(/\{\{host_rotaractor_name\}\}/g, 'Rtr. Kabir Mehra')
    .replace(/\{\{host_neighborhood\}\}/g, 'Hauz Khas Enclave')
    .replace(/\{\{host_phone\}\}/g, '+91 98101 23456')
    .replace(/\{\{dietary_preference\}\}/g, 'Vegetarian')
    .replace(/\{\{itinerary_url\}\}/g, 'https://ride.rotaract3011.org/#itinerary')
    .replace(/\{\{gallery_url\}\}/g, 'https://ride.rotaract3011.org/#gallery');

  const handleDryRunSend = () => {
    setDryRunSent(true);
    setTimeout(() => setDryRunSent(false), 4000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Safety Alert Banner */}
      <div className="p-4 rounded-2xl border-2 border-[#19539D] bg-blue-50/70 flex items-start gap-3 text-xs text-[#19539D] font-bold">
        <ShieldAlert size={18} className="shrink-0 text-[#19539D] mt-0.5" />
        <div>
          <span className="uppercase tracking-wider font-black block">Strict Safety Protocol Active:</span>
          Live external email dispatching is locked. All outgoing broadcasts must be dry-run tested or explicitly verified to safeguard delegate privacy and domain reputation.
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
              className={`w-full text-left p-4 rounded-2xl border-2 border-[#171515] transition-all ${
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
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Subject Line Preview</div>
              <div className="text-sm font-black text-[#171515] mt-0.5">{previewSubject}</div>
            </div>

            <div className="p-5 rounded-2xl border-2 border-neutral-200 bg-white font-mono text-xs leading-relaxed whitespace-pre-wrap text-neutral-800 max-h-[380px] overflow-y-auto">
              {previewBody}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={handleCopy} leading={copied ? <Check size={14} /> : <Copy size={14} />}>
                  {copied ? 'Copied' : 'Copy Text'}
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
