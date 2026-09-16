#!/bin/bash
set -e

echo "=== 1. DUMPING DELETED USERS DATA FROM rac3011_recovery ==="

# Dump data for the 17 users from recovery db using pg_dump or plain COPY/INSERT
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011_recovery -c "
CREATE TEMPORARY TABLE target_users AS 
SELECT unnest(ARRAY[
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
]::text[]) AS id;

SELECT 'user' as tbl, count(*) FROM public.\"user\" WHERE id IN (SELECT id FROM target_users)
UNION ALL
SELECT 'account', count(*) FROM public.account WHERE user_id IN (SELECT id FROM target_users)
UNION ALL
SELECT 'member_profiles', count(*) FROM public.member_profiles WHERE user_id IN (SELECT id FROM target_users)
UNION ALL
SELECT 'user_roles', count(*) FROM public.user_roles WHERE user_id IN (SELECT id FROM target_users)
UNION ALL
SELECT 'two_factor', count(*) FROM public.two_factor WHERE user_id IN (SELECT id FROM target_users)
UNION ALL
SELECT 'trusted_devices', count(*) FROM public.trusted_devices WHERE user_id IN (SELECT id FROM target_users);
"

echo "=== 2. EXPORTING RESTORATION SQL FROM rac3011_recovery ==="

# We can use pg_dump with table filtering, or SQL INSERT queries
# Let's generate clean INSERT statements for user, account, member_profiles, user_roles, two_factor, trusted_devices
cat << 'EOF' > /home/ubuntu/generate_restore_sql.py
import subprocess
import json

uids = [
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
]

uid_list = "', '".join(uids)

tables = [
  ('user', 'id'),
  ('account', 'user_id'),
  ('member_profiles', 'user_id'),
  ('user_roles', 'user_id'),
  ('two_factor', 'user_id'),
  ('trusted_devices', 'user_id')
]

with open('/home/ubuntu/restore_users.sql', 'w') as out:
  out.write("BEGIN;\n\n")
  for tbl, col in tables:
    query = f"SELECT json_agg(t) FROM (SELECT * FROM public.\"{tbl}\" WHERE \"{col}\" IN ('{uid_list}')) t;"
    cmd = ["docker", "exec", "-i", "rac3011-postgres", "psql", "-U", "rac3011", "-d", "rac3011_recovery", "-t", "-A", "-c", query]
    res = subprocess.check_output(cmd).decode('utf-8').strip()
    if not res or res == 'null':
      continue
    rows = json.loads(res)
    if not rows:
      continue
    cols = list(rows[0].keys())
    cols_str = ', '.join([f'"{c}"' for c in cols])
    for r in rows:
      vals = []
      for c in cols:
        v = r[c]
        if v is None:
          vals.append('NULL')
        elif isinstance(v, bool):
          vals.append('TRUE' if v else 'FALSE')
        elif isinstance(v, (int, float)):
          vals.append(str(v))
        elif isinstance(v, (dict, list)):
          escaped = json.dumps(v).replace("'", "''")
          vals.append(f"'{escaped}'::jsonb")
        else:
          escaped = str(v).replace("'", "''")
          vals.append(f"'{escaped}'")
      val_str = ', '.join(vals)
      out.write(f'INSERT INTO public."{tbl}" ({cols_str}) VALUES ({val_str}) ON CONFLICT DO NOTHING;\n')
    out.write("\n")
  out.write("COMMIT;\n")

print("Generated /home/ubuntu/restore_users.sql successfully.")
EOF

python3 /home/ubuntu/generate_restore_sql.py

echo "=== 3. EXECUTING RESTORATION SCRIPT ON PRODUCTION rac3011 ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 < /home/ubuntu/restore_users.sql

echo "=== 4. POST-RESTORATION VERIFICATION COUNTS ==="
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
