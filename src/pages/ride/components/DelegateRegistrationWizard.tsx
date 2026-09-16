import { useState } from 'react';
import { User, Phone, Mail, MapPin, Train, AlertCircle, CheckCircle2, QrCode, ArrowRight, ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { AutoRickshawBadge, MetroCardBadge } from './DelhiStickers';

interface DelegateFormData {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  participantType: 'external' | 'internal_rotaractor';
  districtNumber: string;
  clubName: string;
  rotaryRole: string;
  arrivalMode: 'flight' | 'train' | 'bus' | 'local';
  arrivalDateTime: string;
  pnrNumber: string;
  arrivalLocation: string;
  dietaryPreference: 'veg' | 'non_veg' | 'jain';
  allergies: string;
  tshirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

const INITIAL_FORM: DelegateFormData = {
  fullName: '',
  email: '',
  phone: '',
  gender: 'female',
  participantType: 'external',
  districtNumber: '3141',
  clubName: '',
  rotaryRole: 'Member',
  arrivalMode: 'flight',
  arrivalDateTime: '',
  pnrNumber: '',
  arrivalLocation: 'IGI Airport T3',
  dietaryPreference: 'veg',
  allergies: '',
  tshirtSize: 'L',
  bloodGroup: 'B+',
  emergencyContactName: '',
  emergencyContactPhone: '',
};

export function DelegateRegistrationWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<DelegateFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = <K extends keyof DelegateFormData>(key: K, value: DelegateFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep((prev) => (prev + 1) as any);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const arrivalIso = form.arrivalDateTime ? new Date(form.arrivalDateTime).toISOString() : null;
      const res = await apiFetch<{ id: string; fullName: string; status: string; message: string }>(
        '/public/ride/participants',
        {
          method: 'POST',
          body: {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            gender: form.gender,
            participantType: form.participantType,
            homeDistrict: form.districtNumber.trim() || '3141',
            homeClubName: form.clubName.trim() || 'Rotaract Club',
            clubDesignation: form.rotaryRole.trim() || 'Member',
            arrivalMode: form.arrivalMode,
            arrivalAt: arrivalIso,
            arrivalNumber: form.pnrNumber.trim() || null,
            cityState: form.arrivalLocation.trim() || 'Delhi NCR',
            dietaryPref: form.dietaryPreference,
            allergiesNotes: form.allergies.trim() || null,
            emergencyName: form.emergencyContactName.trim() || 'Emergency Contact',
            emergencyPhone: form.emergencyContactPhone.trim() || '+91 99999 99999',
            districtNumber: form.districtNumber.trim(),
            clubName: form.clubName.trim(),
            rotaryRole: form.rotaryRole.trim(),
            pnrNumber: form.pnrNumber.trim(),
            arrivalLocation: form.arrivalLocation.trim(),
            dietaryPreference: form.dietaryPreference,
            allergies: form.allergies.trim(),
            tshirtSize: form.tshirtSize,
            bloodGroup: form.bloodGroup,
            emergencyContactName: form.emergencyContactName.trim(),
            emergencyContactPhone: form.emergencyContactPhone.trim(),
          },
        },
      );

      setSubmittedRef(res.id || `DMJ-${Math.floor(100000 + Math.random() * 900000)}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please review your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedRef) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-3xl border-3 border-[#171515] bg-white p-8 ride-pop-lg text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#59A835] text-white flex items-center justify-center mx-auto mb-4 border-2 border-[#171515] ride-pop-sm">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-[#171515]">Swagat Hai, {form.fullName || 'Delegate'}!</h3>
        <p className="text-sm text-neutral-600 mt-2">
          Your Delhi Meri Jaan 2026 delegate pass request is recorded. Our exchange committee will review your dossier and confirm your homestay match.
        </p>

        {/* Delegate Pass Card */}
        <div className="my-6 p-5 rounded-2xl border-2 border-[#171515] bg-[#FDFBF7] text-left ride-pop-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-300">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Official Delegate Pass</div>
              <div className="text-lg font-black text-[#171515]">Delhi Meri Jaan • RID 3011</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#EA6623] text-white font-black text-xs border border-[#171515]">
              {form.participantType === 'external' ? `RID ${form.districtNumber}` : 'Host RID 3011'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-3 text-xs">
            <div>
              <span className="text-neutral-500 font-bold block">Delegate Name</span>
              <span className="font-extrabold text-[#171515] text-sm">{form.fullName || 'Registered Delegate'}</span>
            </div>
            <div>
              <span className="text-neutral-500 font-bold block">Pass Reference</span>
              <span className="font-mono font-black text-[#C72425] text-sm">{submittedRef}</span>
            </div>
            <div>
              <span className="text-neutral-500 font-bold block">Club Affiliation</span>
              <span className="font-semibold text-neutral-800">{form.clubName || 'Rotaract Club'}</span>
            </div>
            <div>
              <span className="text-neutral-500 font-bold block">Arrival Mode</span>
              <span className="font-semibold text-neutral-800 uppercase">{form.arrivalMode} • {form.arrivalLocation || 'Delhi'}</span>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-dashed border-neutral-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode size={36} className="text-[#171515]" />
              <div className="text-[10px] text-neutral-500 font-bold">
                Scan at Reception Desk<br />Keep PDF / Screenshot handy
              </div>
            </div>
            <MetroCardBadge />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSubmittedRef(null);
            setForm(INITIAL_FORM);
            setStep(1);
          }}
          className="px-6 py-2.5 rounded-xl border-2 border-[#171515] bg-[#19539D] text-white font-black text-sm ride-pop hover:bg-blue-800"
        >
          Register Another Delegate
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl border-3 border-[#171515] bg-white p-6 sm:p-8 ride-pop-lg">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-neutral-200">
        {[
          { num: 1, label: 'Identity' },
          { num: 2, label: 'Travel' },
          { num: 3, label: 'Homestay' },
          { num: 4, label: 'Emergency' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full border-2 border-[#171515] flex items-center justify-center font-black text-xs ${
                step === s.num
                  ? 'bg-[#EA6623] text-white ride-pop-sm scale-110'
                  : step > s.num
                  ? 'bg-[#59A835] text-white'
                  : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {s.num}
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === s.num ? 'text-[#171515]' : 'text-neutral-500'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl border-2 border-[#C72425] bg-red-50 text-[#C72425] text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleNext} className="space-y-4">
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black text-[#171515]">Step 1: Delegate Rotary Identity</h4>
              <AutoRickshawBadge />
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-[#171515] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA6623]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="aarav@rotaract.org"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-[#171515] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA6623]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  WhatsApp / Phone *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-[#171515] text-sm focus:outline-none focus:ring-2 focus:ring-[#EA6623]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Delegate Type
                </label>
                <select
                  value={form.participantType}
                  onChange={(e) => updateField('participantType', e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm bg-white"
                >
                  <option value="external">Visiting Delegate (Other District)</option>
                  <option value="internal_rotaractor">Host RID 3011 Rotaractor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  District No.
                </label>
                <input
                  type="text"
                  required
                  value={form.districtNumber}
                  onChange={(e) => updateField('districtNumber', e.target.value)}
                  placeholder="e.g. 3141 / 3011"
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm bg-white"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Non-binary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Home Club Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.clubName}
                  onChange={(e) => updateField('clubName', e.target.value)}
                  placeholder="e.g. Rotaract Club of Bombay"
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Rotary Role / Title
                </label>
                <input
                  type="text"
                  value={form.rotaryRole}
                  onChange={(e) => updateField('rotaryRole', e.target.value)}
                  placeholder="e.g. President / Director ISD / Member"
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Travel */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-lg font-black text-[#171515]">Step 2: Travel & Arrival Logistics</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Arrival Mode
                </label>
                <select
                  value={form.arrivalMode}
                  onChange={(e) => updateField('arrivalMode', e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm bg-white"
                >
                  <option value="flight">Flight (Air Travel)</option>
                  <option value="train">Train (Indian Railways)</option>
                  <option value="bus">Intercity Bus</option>
                  <option value="local">Self Driving / Local Delhi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Arrival Date & Expected Time
                </label>
                <input
                  type="datetime-local"
                  value={form.arrivalDateTime}
                  onChange={(e) => updateField('arrivalDateTime', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Arrival Station / Terminal
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={form.arrivalLocation}
                    onChange={(e) => updateField('arrivalLocation', e.target.value)}
                    placeholder="e.g. IGI Terminal 3 / NDLS Paharganj"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-[#171515] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Flight No. / Train PNR
                </label>
                <div className="relative">
                  <Train size={16} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={form.pnrNumber}
                    onChange={(e) => updateField('pnrNumber', e.target.value)}
                    placeholder="e.g. 6E-2041 or 12951 PNR"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-[#171515] text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Homestay & Food */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-lg font-black text-[#171515]">Step 3: Homestay & Food Safari Preferences</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Dietary Preference
                </label>
                <select
                  value={form.dietaryPreference}
                  onChange={(e) => updateField('dietaryPreference', e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm bg-white"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non_veg">Non-Vegetarian</option>
                  <option value="jain">Pure Jain (No Onion/Garlic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Official DMJ T-Shirt Size
                </label>
                <select
                  value={form.tshirtSize}
                  onChange={(e) => updateField('tshirtSize', e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm bg-white"
                >
                  <option value="S">Small (S - 38)</option>
                  <option value="M">Medium (M - 40)</option>
                  <option value="L">Large (L - 42)</option>
                  <option value="XL">Extra Large (XL - 44)</option>
                  <option value="XXL">Double XL (XXL - 46)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                Food Allergies or Special Health Needs
              </label>
              <textarea
                rows={2}
                value={form.allergies}
                onChange={(e) => updateField('allergies', e.target.value)}
                placeholder="e.g. Peanut allergy, lactose intolerant, asthma inhaler carried..."
                className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 4: Emergency Contacts */}
        {step === 4 && (
          <div className="space-y-4">
            <h4 className="text-lg font-black text-[#171515]">Step 4: Emergency Contacts & Safety Dossier</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.emergencyContactName}
                  onChange={(e) => updateField('emergencyContactName', e.target.value)}
                  placeholder="Parent / Guardian Name"
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Emergency Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={form.emergencyContactPhone}
                  onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                  placeholder="+91 99999 88888"
                  className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-700 uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <select
                value={form.bloodGroup}
                onChange={(e) => updateField('bloodGroup', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#171515] text-sm bg-white"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-neutral-200">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-[#171515] bg-neutral-100 text-xs font-black hover:bg-neutral-200"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-[#171515] bg-[#EA6623] text-white text-xs font-black tracking-wider uppercase ride-pop hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Pass...</span>
            ) : step === 4 ? (
              <>
                <span>Complete Registration</span>
                <CheckCircle2 size={15} />
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
