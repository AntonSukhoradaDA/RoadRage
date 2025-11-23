## Python backend for RoadRage

This backend exposes a small FastAPI service that runs the original YOLOv8 road-damage model
stored at `backend/models/rdd.pt` and returns detections to the React Native app over HTTP.

### 1. Create and activate virtualenv

```bash
cd /Users/antonsukhorada/Desktop/projects/RoadRage
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Python dependencies

```bash
pip install -r backend/requirements.txt
```

Make sure the YOLOv8 model file exists at `backend/models/rdd.pt` (same as in the original
[`RoadDamageDetection` repo](https://github.com/oracl4/RoadDamageDetection/tree/c0e8b7c35b22f27273ef8625111a7cd63e3c9359)).

### 3. Run the backend locally

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The important part is `--host 0.0.0.0` so that your Expo app (running on a device or simulator
on the same network) can reach the backend via your machine's LAN IP.

### 4. Deploying to Railway (or similar)

On platforms like Railway, use the `$PORT` environment variable they provide:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Ensure that `backend/models/rdd.pt` is committed to the repository so it is available in the container.

### 5. Configure the mobile app

In `services/roadDamageYolo.ts` the constant `BACKEND_URL` must point to your machine or deployed backend URL:

```ts
// Example – replace with your real local IP or Railway URL
export const BACKEND_URL = 'http://192.168.0.10:8000';
// export const BACKEND_URL = 'https://your-railway-app.up.railway.app';
```

You can also wire this through an environment variable (e.g. `EXPO_PUBLIC_BACKEND_URL`) if you
prefer.
