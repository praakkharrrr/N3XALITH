# NEXUS-3D Firebase setup

NEXUS-3D uses Cloud Firestore for application data.

## 1. Create Firebase project
1. Open Firebase Console.
2. Create a project.
3. Create a Cloud Firestore database.
4. Create a service account in Project settings -> Service accounts.
5. Generate a private key.

## 2. Configure environment
Copy `.env.example` to `.env.local` and fill in:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `SESSION_SECRET`

The app restores the included demo parcels, buildings, floors, units, owners and ULPIN records on the first server request when the Firestore collections are empty.

Default bootstrap credentials are `admin` / `nexus3d` unless overridden by `FIREBASE_ADMIN_USERNAME` and `FIREBASE_ADMIN_PASSWORD`.

## 3. Install and run

```bash
npm install
npm run dev
```

Then open the local Next.js URL.

## Firestore collections

- admins
- locations
- parcels
- buildings
- floors
- propertyUnits
- propertyOwners
- ulpinRecords
- _counters

Numeric IDs are preserved so the existing frontend/API contract does not need to change.

## Optional Smart Property Assistant
Set `GEMINI_API_KEY` in `.env.local` to enable the Gemini 3.6 Flash-powered property assistant in the 3D explorer. Without the key, the UI remains available and reports that the assistant is not configured.


### Gemini AI assistant
The property assistant uses Google's Gemini Interactions API with `gemini-3.6-flash`. Set `GEMINI_API_KEY` in `.env.local` to enable it.
