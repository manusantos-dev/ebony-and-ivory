export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBEtGSX5ZS8WMakeer6M0ekASismF9t87w",
  authDomain: "ebony-and-ivory-app.firebaseapp.com",
  projectId: "ebony-and-ivory-app",
  storageBucket: "ebony-and-ivory-app.firebasestorage.app",
  messagingSenderId: "1081906794092",
  appId: "1:1081906794092:web:77f1ec26b703b56ff3d249"
};

export const KEYS_DB = [
  { val: "C",  us: "C / Am",   eu: "Do / La m" },
  { val: "G",  us: "G / Em",   eu: "Sol / Mi m" },
  { val: "D",  us: "D / Bm",   eu: "Re / Si m" },
  { val: "A",  us: "A / F#m",  eu: "La / Fa# m" },
  { val: "E",  us: "E / C#m",  eu: "Mi / Do# m" },
  { val: "B",  us: "B / G#m",  eu: "Si / Sol# m" },
  { val: "F",  us: "F / Dm",   eu: "Fa / Re m" },
  { val: "Bb", us: "Bb / Gm",  eu: "Sib / Sol m" },
  { val: "Eb", us: "Eb / Cm",  eu: "Mib / Do m" },
  { val: "Ab", us: "Ab / Fm",  eu: "Lab / Fa m" }
];

export const STORAGE_KEY = "ebony_ivory:scores";

export const DUR_Q = { 
  "w": 4, 
  "h": 2, 
  "q": 1, 
  "8": 0.5, 
  "16": 0.25, 
  "32": 0.125 
};