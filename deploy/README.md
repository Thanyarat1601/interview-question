# Deploy guide — Google Cloud (Always Free tier)

End-to-end deploy of this interview project to Google Cloud using only the
**Always Free** tier (no charges after the $300 trial expires).

```
┌──────────────────────────┐    ┌─────────────────────────┐    ┌──────────────────────────────┐
│ Firebase Hosting         │ →  │ Cloud Run (Docker)      │ →  │ Compute Engine e2-micro VM   │
│ Angular static build     │    │ Go + Gin backend        │    │ self-hosted PostgreSQL 16    │
│ free forever             │    │ free 2M req/month       │    │ free 1 VM in us-* regions    │
└──────────────────────────┘    └─────────────────────────┘    └──────────────────────────────┘
```

> Region picked: **us-central1** (Iowa). It's one of the three Always Free
> regions (`us-east1`, `us-west1`, `us-central1`). Don't use `asia-southeast1` for
> the VM — there's no Always Free quota there and you'll start paying after the
> $300 credit ends. Cloud Run can stay in any region.

---

## 0. One-time setup on your laptop

```bash
# Install gcloud (https://cloud.google.com/sdk/docs/install)
gcloud init
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Install Firebase CLI
npm install -g firebase-tools
firebase login
```

Enable the APIs we need:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  compute.googleapis.com \
  artifactregistry.googleapis.com
```

---

## 1. Create the Postgres VM (Always Free)

```bash
# Reserve a static IP so it won't change after restart.
gcloud compute addresses create itcc-db-ip --region=us-central1

# Create the e2-micro VM with that IP.
gcloud compute instances create itcc-db \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --address=itcc-db-ip \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --tags=postgres
```

> `e2-micro` + 30 GB pd-standard in `us-central1-a` is inside the Always Free
> quota (1 instance only across us-east1/us-west1/us-central1).

Open Postgres port to the public (Cloud Run egress IPs aren't fixed — strong
password + a tight firewall to **port 5432 only** is the typical free-tier
trade-off for demos):

```bash
gcloud compute firewall-rules create allow-postgres \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:5432 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=postgres
```

Get the VM external IP — copy this, you'll use it as `DB_HOST`:

```bash
gcloud compute instances describe itcc-db --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

SSH in and install Postgres:

```bash
gcloud compute ssh itcc-db --zone=us-central1-a
# now you're on the VM
nano setup-vm-postgres.sh   # paste in the contents of deploy/setup-vm-postgres.sh
chmod +x setup-vm-postgres.sh
sudo ./setup-vm-postgres.sh
```

The script prints `DB_NAME`, `DB_USER`, `DB_PASSWORD` at the end — **save those**.
Exit the VM with `exit`.

Sanity check from your laptop:

```bash
psql "host=$VM_IP port=5432 dbname=interview_test user=itcc_app sslmode=disable"
# (enter the password the script printed)
```

If that connects, the DB is ready.

---

## 2. Deploy backend to Cloud Run

From the repo root:

```bash
gcloud run deploy itcc-backend \
  --source ./backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --max-instances 2 \
  --set-env-vars="DB_HOST=$VM_IP,DB_PORT=5432,DB_USER=itcc_app,DB_PASSWORD=YOUR_DB_PASSWORD,DB_NAME=interview_test,DB_SSLMODE=disable,JWT_SECRET=$(openssl rand -hex 32)"
```

`gcloud` auto-detects the Dockerfile in `backend/`, builds the image with
Cloud Build, pushes it to Artifact Registry, then deploys. The first run
takes ~3 min; subsequent deploys are ~1 min.

At the end it prints something like:
```
Service URL: https://itcc-backend-xxxxxxx-uc.a.run.app
```

Smoke test:

```bash
curl https://itcc-backend-xxxxxxx-uc.a.run.app/healthz
# {"status":"ok"}

curl https://itcc-backend-xxxxxxx-uc.a.run.app/api/q01/persons
# {"success":true,"message":"","data":[]}
```

> If you redeploy and don't want to re-type all the env vars, drop
> `--set-env-vars` and they stay from the previous deploy.

---

## 3. Deploy frontend to Firebase Hosting

### 3a. Create a Firebase project (one-time)

The cheapest way: re-use your existing GCP project as a Firebase project.

```bash
firebase projects:addfirebase YOUR_PROJECT_ID
```

Or create a new Firebase project at <https://console.firebase.google.com>
and link it. Either way, edit [`frontend/.firebaserc`](../frontend/.firebaserc)
and replace `REPLACE-WITH-YOUR-FIREBASE-PROJECT-ID` with your project ID.

### 3b. Point Angular at the Cloud Run URL

Edit [`frontend/src/environments/environment.prod.ts`](../frontend/src/environments/environment.prod.ts):

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://itcc-backend-xxxxxxx-uc.a.run.app/api',
};
```

### 3c. Build + deploy

```bash
cd frontend
npm install
npm run build              # produces dist/interview-frontend/browser
firebase deploy --only hosting
```

Output:
```
Hosting URL: https://YOUR_PROJECT_ID.web.app
```

Open it. The frontend should call your Cloud Run backend and everything works.

---

## 4. CORS sanity check

The backend already allows `AllowOrigins: ["*"]`, so Firebase Hosting can call
Cloud Run with no extra config. If you ever want to tighten it, edit
`backend/internal/router/router.go` and put your Firebase domain in
`AllowOrigins`.

---

## 5. Cost & shutdown

In Always Free mode you should see **$0/month** as long as:

* The VM is exactly 1 × `e2-micro` in us-east1/us-west1/us-central1.
* Total Cloud Run usage stays under 2M requests + 360k GB-sec per month.
* Firebase Hosting stays under 10 GB stored + 360 MB/day egress (Spark plan).

To shut everything down later:

```bash
gcloud compute instances delete itcc-db --zone=us-central1-a
gcloud compute addresses delete itcc-db-ip --region=us-central1
gcloud compute firewall-rules delete allow-postgres
gcloud run services delete itcc-backend --region=us-central1
firebase hosting:disable
```

---

## Troubleshooting

| Symptom                                          | Likely cause / fix                                                                 |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Cloud Run 502 / "Container failed to start"      | `gcloud run services logs read itcc-backend --region=us-central1` — usually a DB env var typo |
| `connection refused` to Postgres                 | Firewall rule missing, or `listen_addresses` not set — re-run setup script         |
| Angular calls go to `localhost:8080` in prod     | `environment.prod.ts` not updated, or you forgot `--configuration=production`      |
| `firebase deploy` says "no public directory"     | Run `npm run build` first; output should be `dist/interview-frontend/browser`     |
| Bill > $0                                        | Probably picked a non-free region for the VM. Recreate in `us-central1-a`.        |
