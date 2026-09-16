#!/bin/bash
set -e

echo "=== 1. EXECUTING PIPELINE B SQL INSERT ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 < /home/ubuntu/insert_test_b.sql

echo "=== 2. VERIFYING PIPELINE A (ride_participants) ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT id, full_name, email, home_district, home_club_name, status, created_at 
FROM ride_participants 
WHERE email = 'test.delegate.mumbai@rotaract3141.org';
"

echo "=== 3. VERIFYING PIPELINE B (ride_support_clubs) ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT r.id, r.ry_year, c.name as club_name, r.capacity_delegates, r.homestay_available, r.contact_phone, r.notes 
FROM ride_support_clubs r 
JOIN clubs c ON r.club_id = c.id 
WHERE r.id = 'sub_test_hostclub_3011_01';
"

echo "=== 4. VERIFYING LEGACY DISTRICT PORTAL & API HEALTH ==="
echo -n "Checking API health (/healthz): "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/healthz

echo -n "Checking API public clubs (/public/clubs): "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/public/clubs

echo -n "Checking API public events (/public/events): "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/public/events

echo -n "Checking API public home (/public/home): "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/public/home

echo -n "Checking Main Web Portal (https://testing.rotaract3011.org): "
curl -s -o /dev/null -w "%{http_code}\n" https://testing.rotaract3011.org

echo -n "Checking RIDE Subdomain (https://ride.rotaract3011.org): "
curl -s -o /dev/null -w "%{http_code}\n" https://ride.rotaract3011.org

echo -n "Checking Delhi Meri Jaan Subdomain (https://delhimerijan.rotaract3011.org): "
curl -s -o /dev/null -w "%{http_code}\n" https://delhimerijan.rotaract3011.org

echo -n "Checking Delhi Meri Jaan Alt Subdomain (https://delhimerijaan.rotaract3011.org): "
curl -s -o /dev/null -w "%{http_code}\n" https://delhimerijaan.rotaract3011.org

echo "=== ALL VERIFICATIONS COMPLETE ==="
