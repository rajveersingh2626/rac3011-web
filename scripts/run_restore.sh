#!/bin/bash
set -e

python3 /home/ubuntu/generate_restore_sql.py
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 < /home/ubuntu/restore_users.sql

echo "=== POST RESTORATION VERIFICATION ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT count(*) as total_users FROM public.\"user\";
SELECT count(*) as total_profiles FROM public.member_profiles;
SELECT count(*) as total_user_roles FROM public.user_roles;
SELECT count(*) as restored_target_users FROM public.\"user\" 
WHERE id IN (
  '15305b44-75d8-4484-b167-f296d7c9dd5f',
  '1c9c32ff-4dce-47ea-930f-3b46cb01fb72',
  '2b0d5b99-4b6d-4158-bd57-ed4c32a8979f',
  '6202d627-950f-4509-b5e3-d79c0ebda55a',
  '68786f66-2b78-419a-afe2-8846fade64ba',
  '77132e4d-4b89-4727-9a95-246ff37128dd',
  '88b7f33d-15cc-4e29-9158-5f73a7f2794f',
  '94e35fe1-9401-4b7b-b2c2-7408b58ff991',
  '982b5101-71a3-47c8-aa62-c895e0c73341',
  'aed4f8f0-b620-4ef1-8bae-f5c44b736ae9',
  'b1ecb8b8-d279-4897-98bb-dc7a223422ff',
  'ba160cc5-094c-4143-8d1c-5a1d19aac5d1',
  'c3c56940-c42b-4893-b4cd-eb2b15323375',
  'cf432248-2ad4-4431-9d9f-c388b662f621',
  'cf9b55e8-561c-4e36-8436-36815e433792',
  'e43ae309-1f3a-4d0b-afe0-4b2c7e6c482b',
  'ffec5941-66eb-4694-965b-5df817e80219'
);
"
