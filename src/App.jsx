import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc,
  deleteDoc, 
  query 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Coffee, 
  BookOpen,
  Sparkles,
  BrainCircuit,
  Loader2,
  Lightbulb,
  HeartPulse,
  Dumbbell,
  Music,
  Waves,
  Activity,
  ShieldCheck,
  GraduationCap,
  Bike,
  Mountain,
  Anchor,
  LifeBuoy,
  Compass,
  Users,
  Tent,
  Volume2
} from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyC57JZwEMYGnav0O7oaRQnR1TsJsBMzPto",
  authDomain: "aula-ateca-f0da0.firebaseapp.com",
  projectId: "aula-ateca-f0da0",
  storageBucket: "aula-ateca-f0da0.firebasestorage.app",
  messagingSenderId: "507798156882",
  appId: "1:507798156882:web:91cedaa274a7625e44d18b",
  measurementId: "G-NPMGV8JBNK"
};

const apiKeyGemini = "AIzaSyDZnjE3at0wVeKvJCsZYkK8CZhKwsJsI54"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const STANDARD_MODULES = [
  { id: 'valoracion', name: 'Valoración CF', icon: <HeartPulse size={16} />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'fitness', name: 'Fitness', icon: <Dumbbell size={16} />, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 'act_basicas', name: 'Act. básicas soporte musical', icon: <Music size={16} />, color: 'bg-emerald-100 text-emerald-700 border-blue-200' },
  { id: 'act_especializadas', name: 'Act. especializadas soporte musical', icon: <Music size={16} />, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'af_agua', name: 'AF en agua', icon: <Waves size={16} />, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { id: 'hidrocinesia', name: 'Hidrocinesia', icon: <Activity size={16} />, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'control_postural', name: 'Control postural', icon: <ShieldCheck size={16} />, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'eso', name: 'ESO', icon: <GraduationCap size={16} />, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'bachillerato', name: 'BACHILLERATO', icon: <GraduationCap size={16} />, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'bici', name: 'Guía de Bicicleta', icon: <Bike size={16} />, color: 'bg-lime-100 text-lime-700 border-lime-200' },
  { id: 'montana', name: 'Guía de montaña', icon: <Mountain size={16} />, color: 'bg-stone-100 text-stone-700 border-stone-200' },
  { id: 'natacion', name: 'Técnicas natación', icon: <Waves size={16} />, color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'medio_acuatico', name: 'Guía medio acuático', icon: <Anchor size={16} />, color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { id: 'socorrismo', name: 'Socorrismo', icon: <LifeBuoy size={16} />, color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'cuerdas', name: 'Cuerdas', icon: <Compass size={16} />, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'grupos', name: 'Att. grupos', icon: <Users size={16} />, color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { id: 'tiempo_libre', name: 'Téc. tiempo libre', icon: <Tent size={16} />, color: 'bg-green-100 text-green-700 border-green-200' },
];

const ACADEMIC_SCHEDULE = [
  { time: "07:55 - 08:50", label: "1ª Hora", type: "class" },
  { time: "08:50 - 09:45", label: "2ª Hora", type
