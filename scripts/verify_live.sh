#!/bin/bash
set -e

echo "=== POSTGRES DATABASE CHECK ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT (SELECT count(*) FROM public.\"user\") as total_district_users,
       (SELECT count(*) FROM public.member_profiles) as total_member_profiles,
       (SELECT count(*) FROM ride_participants) as ride_participants,
       (SELECT count(*) FROM ride_gallery_items) as ride_gallery_items;
"

echo "=== CHECK RIDE GALLERY COLUMNS ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ride_gallery_items';
"

echo "=== API ENDPOINT CHECKS ==="
echo -n "1. District Clubs: "
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/public/clubs
echo -n "2. District Events: "
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/public/events
echo -n "3. District Home: "
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/public/home
echo -n "4. Public Ride Gallery: "
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/public/ride/gallery
echo "Public Ride Gallery Response:"
curl -s http://127.0.0.1:3000/public/ride/gallery

echo ""
echo "=== ALL CHECKS COMPLETED ==="
