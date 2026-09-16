#!/bin/bash
set -e

echo "=== INSERTING TEST GALLERY ITEMS ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
INSERT INTO ride_gallery_items (id, year, url, kind, heading_left, heading_right, caption, \"order\", created_at, updated_at) 
VALUES 
('snap-test-1', 2026, '/ride/banners/hero_culture.png', 'photo', 'CHANDNI CHOWK', 'THE SOUL OF PURANI DILLI', 'Purani Dilli Culture', 0, NOW(), NOW()),
('snap-test-2', 2026, '/ride/banners/hero_heritage.png', 'photo', 'QUTUB COMPLEX', 'EIGHT CENTURIES OF ARCHITECTURE', 'Heritage monuments', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
"

echo "=== QUERYING PUBLIC RIDE GALLERY API ==="
curl -s http://127.0.0.1:3000/public/ride/gallery | jq . || curl -s http://127.0.0.1:3000/public/ride/gallery

echo ""
echo "=== VERIFYING TOTAL USERS REMAIN SAFE ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT (SELECT count(*) FROM public.\"user\") as total_district_users,
       (SELECT count(*) FROM ride_participants) as ride_participants,
       (SELECT count(*) FROM ride_gallery_items) as ride_gallery_items;
"
