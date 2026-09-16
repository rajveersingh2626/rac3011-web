#!/bin/bash
set -e

echo "=== PREPARING RECOVERY DATABASE ==="
docker exec -i rac3011-postgres psql -U rac3011 -d postgres -c "DROP DATABASE IF EXISTS rac3011_recovery;"
docker exec -i rac3011-postgres psql -U rac3011 -d postgres -c "CREATE DATABASE rac3011_recovery OWNER rac3011;"
echo "Restoring backup rac3011_2026-09-16_030001.sql.gz into rac3011_recovery..."
gunzip -c /home/ubuntu/backups/rac3011_2026-09-16_030001.sql.gz | docker exec -i rac3011-postgres psql -U rac3011 -d rac3011_recovery -q

echo "=== BACKUP COUNTS ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011_recovery -c "
SELECT count(*) as total_users_in_backup FROM public.\"user\";
SELECT count(*) as total_profiles_in_backup FROM public.member_profiles;
SELECT count(*) as total_user_roles_in_backup FROM public.user_roles;
"

echo "=== DUMPING USER IDS FROM BOTH ==="
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011 -t -A -c "SELECT id FROM public.\"user\";" | sort > /home/ubuntu/current_users.txt
docker exec -i rac3011-postgres psql -U rac3011 -d rac3011_recovery -t -A -c "SELECT id FROM public.\"user\";" | sort > /home/ubuntu/backup_users.txt

echo "Current count: $(wc -l < /home/ubuntu/current_users.txt)"
echo "Backup count:  $(wc -l < /home/ubuntu/backup_users.txt)"

echo "=== DELETED USER IDS (In backup but missing in current) ==="
comm -23 /home/ubuntu/backup_users.txt /home/ubuntu/current_users.txt > /home/ubuntu/deleted_user_ids.txt
cat /home/ubuntu/deleted_user_ids.txt
echo "Total deleted users count: $(wc -l < /home/ubuntu/deleted_user_ids.txt)"

echo "=== DELETED USERS DETAILS ==="
while read -r uid; do
  [ -z "$uid" ] && continue
  docker exec -i rac3011-postgres psql -U rac3011 -d rac3011_recovery -c "SELECT id, email, name, role FROM public.\"user\" WHERE id = '$uid';"
done < /home/ubuntu/deleted_user_ids.txt
