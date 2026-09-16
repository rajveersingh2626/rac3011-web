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

# Check member_profile ids
profile_query = f"SELECT id FROM public.member_profiles WHERE user_id IN ('{uid_list}');"
res_prof = subprocess.check_output(["docker", "exec", "-i", "rac3011-postgres", "psql", "-U", "rac3011", "-d", "rac3011_recovery", "-t", "-A", "-c", profile_query]).decode('utf-8').strip().split('\n')
profile_ids = [p.strip() for p in res_prof if p.strip()]
pid_list = "', '".join(profile_ids)

print(f"Found {len(profile_ids)} member profiles to restore.")

# Check secondary child tables
secondary_tables = [
  ('certificates', 'member_id', pid_list),
  ('event_checkins', 'member_id', pid_list),
  ('event_rsvps', 'member_id', pid_list),
  ('member_badges', 'member_id', pid_list),
  ('member_privacy_acceptances', 'member_id', pid_list),
]

for tbl, col, ids in secondary_tables:
  cnt = subprocess.check_output(["docker", "exec", "-i", "rac3011-postgres", "psql", "-U", "rac3011", "-d", "rac3011_recovery", "-t", "-A", "-c", f"SELECT count(*) FROM public.\"{tbl}\" WHERE \"{col}\" IN ('{ids}');"]).decode('utf-8').strip()
  print(f"Secondary table {tbl}: {cnt} rows")

with open('/home/ubuntu/restore_users.sql', 'w') as out:
  out.write("BEGIN;\n\n")

  # 1. user table
  tables_to_restore = [
    ('user', 'id', uid_list),
    ('account', 'user_id', uid_list),
    ('member_profiles', 'user_id', uid_list),
    ('user_roles', 'user_id', uid_list),
    ('trusted_devices', 'user_id', uid_list),
  ]

  for tbl, col, ids in tables_to_restore:
    query = f"SELECT json_agg(t) FROM (SELECT * FROM public.\"{tbl}\" WHERE \"{col}\" IN ('{ids}')) t;"
    res = subprocess.check_output(["docker", "exec", "-i", "rac3011-postgres", "psql", "-U", "rac3011", "-d", "rac3011_recovery", "-t", "-A", "-c", query]).decode('utf-8').strip()
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
        elif isinstance(v, list):
          # Format as array literal
          escaped_items = [f"'{str(x).replace(chr(39), chr(39)+chr(39))}'" for x in v]
          vals.append(f"ARRAY[{', '.join(escaped_items)}]::text[]")
        elif isinstance(v, dict):
          escaped = json.dumps(v).replace("'", "''")
          vals.append(f"'{escaped}'::jsonb")
        else:
          escaped = str(v).replace("'", "''")
          vals.append(f"'{escaped}'")
      val_str = ', '.join(vals)
      out.write(f'INSERT INTO public."{tbl}" ({cols_str}) VALUES ({val_str}) ON CONFLICT DO NOTHING;\n')
    out.write("\n")

  # Secondary tables
  for tbl, col, ids in secondary_tables:
    query = f"SELECT json_agg(t) FROM (SELECT * FROM public.\"{tbl}\" WHERE \"{col}\" IN ('{ids}')) t;"
    res = subprocess.check_output(["docker", "exec", "-i", "rac3011-postgres", "psql", "-U", "rac3011", "-d", "rac3011_recovery", "-t", "-A", "-c", query]).decode('utf-8').strip()
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
        elif isinstance(v, list):
          escaped_items = [f"'{str(x).replace(chr(39), chr(39)+chr(39))}'" for x in v]
          vals.append(f"ARRAY[{', '.join(escaped_items)}]::text[]")
        elif isinstance(v, dict):
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
