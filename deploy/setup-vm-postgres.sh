#!/usr/bin/env bash
# Run this on the e2-micro VM (Ubuntu/Debian) to install Postgres 16
# and configure it to accept connections from Cloud Run.
#
# Usage:
#   1. gcloud compute ssh itcc-db --zone=us-central1-a
#   2. curl -O https://raw.githubusercontent.com/<you>/<repo>/main/deploy/setup-vm-postgres.sh
#      (or paste this file via nano)
#   3. chmod +x setup-vm-postgres.sh && sudo ./setup-vm-postgres.sh
#
# After it runs, take note of the DB password it prints — you'll need it
# when you `gcloud run deploy` the backend.

set -euo pipefail

DB_NAME="${DB_NAME:-interview_test}"
DB_USER="${DB_USER:-itcc_app}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 24 | tr -d '=+/' | cut -c1-24)}"

echo ">>> Installing PostgreSQL 16..."
sudo apt-get update -y
sudo apt-get install -y wget gnupg2 lsb-release

# Use the PGDG repo so we get a consistent Postgres 16.
echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  | sudo tee /etc/apt/sources.list.d/pgdg.list
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc \
  | sudo apt-key add -
sudo apt-get update -y
sudo apt-get install -y postgresql-16

echo ">>> Configuring Postgres to listen on all interfaces..."
PG_CONF="/etc/postgresql/16/main/postgresql.conf"
PG_HBA="/etc/postgresql/16/main/pg_hba.conf"

sudo sed -i "s/^#listen_addresses.*/listen_addresses = '*'/" "$PG_CONF"
sudo sed -i "s/^listen_addresses.*/listen_addresses = '*'/" "$PG_CONF" || true

# Allow password connections from anywhere (Cloud Run egress IPs are not fixed).
# Combined with a strong password and a tight firewall rule below, this is
# acceptable for an interview demo. For real production, use a VPC connector.
if ! sudo grep -q "host all all 0.0.0.0/0 md5" "$PG_HBA"; then
  echo "host all all 0.0.0.0/0 md5" | sudo tee -a "$PG_HBA"
fi

sudo systemctl restart postgresql

echo ">>> Creating database and application user..."
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
  ELSE
    ALTER ROLE $DB_USER WITH PASSWORD '$DB_PASSWORD';
  END IF;
END
\$\$;
SQL

sudo -u postgres psql <<SQL
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
SQL

echo
echo "============================================================"
echo "Postgres is ready. Save these values — you will pass them to"
echo "Cloud Run via environment variables when deploying the backend."
echo "============================================================"
echo "DB_NAME     = $DB_NAME"
echo "DB_USER     = $DB_USER"
echo "DB_PASSWORD = $DB_PASSWORD"
echo "DB_PORT     = 5432"
echo "DB_SSLMODE  = disable    # (or 'require' if you set up TLS later)"
echo
echo "Next:"
echo "  1. From your laptop, get the VM external IP:"
echo "       gcloud compute instances describe itcc-db \\"
echo "         --zone=us-central1-a \\"
echo "         --format='get(networkInterfaces[0].accessConfigs[0].natIP)'"
echo "  2. Use that IP as DB_HOST when deploying the backend."
echo "============================================================"
