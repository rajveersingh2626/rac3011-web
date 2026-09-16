INSERT INTO ride_support_clubs (
  id, ry_year, club_id, capacity_delegates, homestay_available, preferred_months, contact_phone, notes, created_by_id, created_at, updated_at
) VALUES (
  'sub_test_hostclub_3011_01', 
  2026, 
  'c9', 
  12, 
  true, 
  ARRAY[10, 11, 12, 1], 
  '+91 98765 43210', 
  'Google Drive Proposal: https://drive.google.com/file/d/1DelhiMeriJaan2026_HostClubProposalMockDoc/view?usp=sharing | Applicant: Rtr. Priya Sharma (President) | Parent Club: Rotary Club of Delhi South | Zone: Zone 2 | Motivation: Excited to showcase Delhi heritage and host visiting delegates with top-tier hospitality.', 
  'd61fafbc-2279-4731-9e34-7dea47c5a862', 
  NOW(), 
  NOW()
) ON CONFLICT (ry_year, club_id) DO UPDATE SET 
  capacity_delegates = EXCLUDED.capacity_delegates,
  homestay_available = EXCLUDED.homestay_available,
  preferred_months = EXCLUDED.preferred_months,
  contact_phone = EXCLUDED.contact_phone,
  notes = EXCLUDED.notes,
  updated_at = NOW();
