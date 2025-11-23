# RoadRage – Road Damage Detection

Expo React Native application for detecting road surface damage using an AI model running on a Python backend.

## Features

- **Analyze photos from gallery** – pick and analyze road images from the device gallery
- **Python AI backend** – YOLOv8 model for detecting road damage classes (D00, D10, D20, D40)
- **Dark theme only** – UI optimized for dark mode

## Tech stack

- **Expo + React Native** – mobile application
- **FastAPI + Ultralytics YOLOv8** – backend for damage detection
- **expo-image-picker** – image selection from gallery

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Expo app:

   ```bash
   npx expo start
   ```

3. Choose a platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Or scan the QR code to run on a physical device

## Usage

1. Open the **Home** screen.
2. Tap **Select photo** and choose a road image from the gallery.
3. Tap **Analyze** to send the image to the backend and see detected damage.

## Notes

- Detection is performed on a Python backend with a YOLOv8 model running locally or on a service like Railway.
- Make sure the mobile app can reach the backend over the network (IP and port are configured in `services/roadDamageYolo.ts` or via `EXPO_PUBLIC_BACKEND_URL`).

## Project structure

```
RoadRage/
├── app/
│   ├── _layout.tsx         # Root layout and navigation
│   ├── index.tsx           # Home screen with gallery analysis
│   └── modal.tsx           # Modal screen (if used)
├── backend/
│   ├── main.py             # FastAPI backend with YOLOv8
│   ├── models/
│   │   └── rdd.pt          # YOLOv8 model file for damage detection
│   ├── README.md           # Backend setup (local and Railway)
│   └── requirements.txt    # Backend Python dependencies
├── components/
│   ├── GalleryView.tsx     # Gallery + analysis component
│   ├── themed-text.tsx     # Themed text
│   └── themed-view.tsx     # Themed container view
└── services/
    └── roadDamageYolo.ts   # Client for calling the Python backend
```

## License

Private project by asukhorada
