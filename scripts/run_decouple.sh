#!/bin/bash
set -e

echo "=== EXECUTING DECOUPLING & CLEAN SLATE SQL ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 < /home/ubuntu/wipe_and_decouple.sql

echo "=== VERIFYING MAIN DISTRICT USER INTEGRITY ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT count(*) as total_district_users FROM public.\"user\";
SELECT count(*) as total_district_profiles FROM public.member_profiles;
SELECT count(*) as total_district_roles FROM public.user_roles;
"

echo "=== VERIFYING RIDE DECOUPLING & ZERO USERS ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT count(*) as total_ride_participants FROM public.ride_participants;
SELECT count(*) as total_ride_submissions FROM public.ride_form_submissions;
"

echo "=== VERIFYING TABLE CONSTRAINTS (NO USER FK) ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'public.ride_participants'::regclass;
"
