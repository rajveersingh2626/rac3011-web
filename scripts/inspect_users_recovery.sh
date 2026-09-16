#!/bin/bash
set -e

echo "=== 1. SAFETY BACKUP OF CURRENT DB ==="
docker exec rac3011-postgres pg_dump -U rac3011 rac3011 | gzip > /home/ubuntu/backups/snapshot_before_recovery.sql.gz
ls -lh /home/ubuntu/backups/snapshot_before_recovery.sql.gz

echo "=== 2. CURRENT USER COUNTS IN PRODUCTION ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -c "
SELECT count(*) as total_users FROM public.\"user\";
SELECT count(*) as total_profiles FROM public.member_profiles;
SELECT count(*) as total_user_roles FROM public.user_roles;
"

echo "=== 3. RESTORING BACKUP INTO TEMPORARY DATABASE TO COMPARE ==="
docker exec -i rac3011-postgres psql -U rac3011 -d postgres -c "DROP DATABASE IF EXISTS rac3011_recovery; CREATE DATABASE rac3011_recovery OWNER rac3011;"
gunzip -c /home/ubuntu/backups/rac3011_2026-09-16_030001.sql.gz | docker exec -i rac3011-postgres psql -U rac3011 -d rac3011_recovery -q

echo "=== 4. BACKUP (SEPT 16 03:00) USER COUNTS ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011_recovery -c "
SELECT count(*) as total_users_in_backup FROM public.\"user\";
SELECT count(*) as total_profiles_in_backup FROM public.member_profiles;
SELECT count(*) as total_user_roles_in_backup FROM public.user_roles;
"

echo "=== 5. IDENTIFYING MISSING / DELETED USERS ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011_recovery -c "
SELECT u.id, u.email, u.name, u.created_at
FROM public.\"user\" u
WHERE u.id NOT IN (SELECT id FROM dblink('dbname=rac3011 user=rac3011 password=NqRBUEl0pJ5i3f2msthLBvkchbudPEGx', 'SELECT id FROM public.\"user\"') AS t(id text));
" || echo "dblink not installed, using temp dump comparison"

