-- 1. Decouple ride_participants from public."user" entirely
ALTER TABLE public.ride_participants DROP CONSTRAINT IF EXISTS ride_participants_user_id_fkey;
ALTER TABLE public.ride_participants DROP CONSTRAINT IF EXISTS ride_participants_club_id_fkey;

-- Remove user_id so ride_participants can never touch the main user table
ALTER TABLE public.ride_participants DROP COLUMN IF EXISTS user_id;

-- Add dedicated independent authentication & status tracking columns to ride_participants
ALTER TABLE public.ride_participants 
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS dossier_status TEXT NOT NULL DEFAULT 'incomplete',
  ADD COLUMN IF NOT EXISTS dossier_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Wipe all RIDE participants and test submissions for a clean slate (0 users)
TRUNCATE TABLE public.ride_form_submissions CASCADE;
TRUNCATE TABLE public.ride_participants CASCADE;
DELETE FROM public.ride_support_clubs WHERE id LIKE 'sub_test_%';

-- 3. Confirm clean slate counts
SELECT count(*) AS remaining_ride_participants FROM public.ride_participants;
SELECT count(*) AS remaining_ride_submissions FROM public.ride_form_submissions;
