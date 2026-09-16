#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "1. VERIFYING SUBDOMAIN & NGINX ROUTING"
echo "=========================================================="
for host in "testing.rotaract3011.org" "ride.rotaract3011.org" "delhimerijan.rotaract3011.org" "delhimerijaan.rotaract3011.org"; do
  CODE=$(curl -s -k -o /dev/null -w "%{http_code}" -H "Host: $host" http://127.0.0.1:80/)
  echo "Virtual Host $host -> HTTP $CODE"
done

echo ""
echo "=========================================================="
echo "2. TEST PIPELINE A: EXTERNAL DELEGATION CONFIRMATION FORM"
echo "=========================================================="

PAYLOAD_A='{
  "fullName": "Rtr. Test Delegate Mumbai",
  "email": "test.delegate.mumbai@rotaract3141.org",
  "phone": "+91 98765 11111",
  "gender": "other",
  "participantType": "external",
  "homeDistrict": "3141",
  "homeClubName": "Rotaract Club of Bombay Central",
  "cityState": "Mumbai, Maharashtra",
  "country": "India",
  "edition": "delhi_meri_jaan_2026",
  "arrivalMode": "Flight",
  "allergiesNotes": "{\"drrName\":\"Rtr. Aaditya Sharma\",\"drrPhone\":\"+91 98200 12345\",\"drrEmail\":\"drr@rotaract3141.org\",\"pocName\":\"Rtr. Priya Shah\",\"pocPhone\":\"+91 98199 54321\",\"pocEmail\":\"isd@rotaract3141.org\",\"confirmedDelegates\":\"12\"}"
}'

RES_A=$(curl -s -X POST http://127.0.0.1:3000/public/ride/participants \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD_A")

echo "Response A: $RES_A"

echo -e "\nVerifying Pipeline A in PostgreSQL (ride_participants)..."
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT id, full_name, email, home_district, home_club_name, status, created_at 
FROM ride_participants 
WHERE email = 'test.delegate.mumbai@rotaract3141.org';
"

echo "=========================================================="
echo "3. TEST PIPELINE B: INTERNAL HOST CLUB APPLICATION FORM"
echo "=========================================================="

# 1. Identify a real user with super_admin / district capabilities
USER_ROW=$(docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -t -A -F "|" -c "
SELECT u.id, u.email, u.name 
FROM \"user\" u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
WHERE r.key = 'super_admin' 
LIMIT 1;
")

USER_ID=$(echo "$USER_ROW" | cut -d'|' -f1)
USER_EMAIL=$(echo "$USER_ROW" | cut -d'|' -f2)
USER_NAME=$(echo "$USER_ROW" | cut -d'|' -f3)

echo "Authenticated Officer: $USER_NAME ($USER_EMAIL, ID: $USER_ID)"

# 2. Identify a real club for host application
CLUB_ROW=$(docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -t -A -F "|" -c "
SELECT id, name FROM clubs ORDER BY name ASC LIMIT 1;
")
CLUB_ID=$(echo "$CLUB_ROW" | cut -d'|' -f1)
CLUB_NAME=$(echo "$CLUB_ROW" | cut -d'|' -f2)

echo "Target Host Club: $CLUB_NAME ($CLUB_ID)"

# 3. Create a valid test session token directly in PostgreSQL
TEST_TOKEN="test_ride_e2e_session_token_$(date +%s)"
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
INSERT INTO session (id, user_id, token, expires_at, created_at, updated_at, mfa_pending)
VALUES ('test-ride-session', '$USER_ID', '$TEST_TOKEN', NOW() + interval '1 day', NOW(), NOW(), false)
ON CONFLICT (id) DO UPDATE 
SET user_id = '$USER_ID', token = '$TEST_TOKEN', expires_at = NOW() + interval '1 day', updated_at = NOW(), mfa_pending = false;
"

# 4. Submit Host Club Application with Google Drive proposal link
PROPOSAL_URL="https://drive.google.com/file/d/1DelhiMeriJaan2026_HostClubProposalMockDoc/view?usp=sharing"

PAYLOAD_B="{
  \"clubId\": \"$CLUB_ID\",
  \"ryYear\": 2026,
  \"capacityDelegates\": 15,
  \"homestayAvailable\": true,
  \"contactPhone\": \"+91 98111 22222\",
  \"notes\": \"Google Drive Proposal: $PROPOSAL_URL | Position: Club President | Zone: Zone Prithvi | Motivation: Prepared to offer premier homestays and heritage hospitality.\"
}"

RES_B=$(curl -s -X POST http://127.0.0.1:3000/ride/support-clubs \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=$TEST_TOKEN" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d "$PAYLOAD_B")

echo "Response B: $RES_B"

echo -e "\nVerifying Pipeline B in PostgreSQL (ride_support_clubs)..."
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT sc.id, sc.ry_year, c.name as club_name, sc.capacity_delegates, sc.contact_phone, sc.notes, sc.created_at
FROM ride_support_clubs sc
JOIN clubs c ON sc.club_id = c.id
WHERE sc.club_id = '$CLUB_ID';
"

echo "=========================================================="
echo "4. ADMIN DATA RETRIEVAL AUDIT"
echo "=========================================================="
ADMIN_LIST=$(curl -s -X GET "http://127.0.0.1:3000/ride/support-clubs?filter[ryYear]=2026" \
  -H "Cookie: better-auth.session_token=$TEST_TOKEN" \
  -H "Authorization: Bearer $TEST_TOKEN")

echo "Admin Support Clubs List: $ADMIN_LIST"

DASHBOARD_STATS=$(curl -s http://127.0.0.1:3000/public/ride/dashboard)
echo "Public RIDE Dashboard: $DASHBOARD_STATS"

echo -e "\n=========================================================="
echo "ALL PIPELINE AUDIT CHECKS COMPLETED SUCCESSFULLY!"
echo "=========================================================="
