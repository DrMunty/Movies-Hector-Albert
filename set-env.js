const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, 'src', 'environments');

if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

const firebaseApiKey = process.env.FIREBASE_API_KEY || "AIzaSyD_AOr_M5QtzHgRe1-hI5P3g7LooFrYxDU";
const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN || "movies-it.firebaseapp.com";
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || "movies-it";
const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET || "movies-it.firebasestorage.app";
const firebaseMessagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || "449599753941";
const firebaseAppId = process.env.FIREBASE_APP_ID || "1:449599753941:web:1a57ab418f718bee6b1c5c";
const firebaseMeasurementId = process.env.FIREBASE_MEASUREMENT_ID || "G-V14ES7FV1E";

const tmdbBaseUrl = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzM2E4NmY4MGY4OTgyNGUzZDMxOTdmOWFhMGUzYzAyYyIsIm5iZiI6MTc4NjQ0NjM1OC42Nywic3ViIjoiNmE3YjAyMTZkYjE5ZThkZGNlMzE5Y2FhIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.2xQxyO6auWyIkrNU4jUJsUmFbKyeg_QV41YEGR5WC2c";

const envProd = `import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "${firebaseApiKey}",
  authDomain: "${firebaseAuthDomain}",
  projectId: "${firebaseProjectId}",
  storageBucket: "${firebaseStorageBucket}",
  messagingSenderId: "${firebaseMessagingSenderId}",
  appId: "${firebaseAppId}",
  measurementId: "${firebaseMeasurementId}"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const environment = {
  production: true,
  firebase: firebaseConfig,
  tmdbBaseUrl: '${tmdbBaseUrl}',
  tmdbBearerToken: '${tmdbBearerToken}'
};
`;

const envDev = `import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "${firebaseApiKey}",
  authDomain: "${firebaseAuthDomain}",
  projectId: "${firebaseProjectId}",
  storageBucket: "${firebaseStorageBucket}",
  messagingSenderId: "${firebaseMessagingSenderId}",
  appId: "${firebaseAppId}",
  measurementId: "${firebaseMeasurementId}"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const environment = {
  production: false,
  firebase: firebaseConfig,
  tmdbBaseUrl: '${tmdbBaseUrl}',
  tmdbBearerToken: '${tmdbBearerToken}'
};
`;

fs.writeFileSync(path.join(envDir, 'environment.ts'), envProd);
fs.writeFileSync(path.join(envDir, 'environment.development.ts'), envDev);

console.log('Environment files generated successfully.');