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
  BookOpen 
} from 'lucide-react';
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

// --- CONFIGURACIÓN DE FIREBASE Y GEMINI ---
const apiKey = "AIzaSyDZnjE3at0wVeKvJCsZYkK8CZhKwsJsI54"; 

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyC57JZwEMYGnavO07oaRQnR1TsJsBMzPto",
      authDomain: "aula-ateca-f0da0.firebaseapp.com",
      projectId: "aula-ateca-f0da0",
      storageBucket: "aula-ateca-f0da0.firebasestorage.app",
      messagingSenderId: "507798156882",
      appId: "1:507798156882:web:91cedaa274a7625e44d18b",
      measurementId: "G-NPMGV8JBNK"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'aula-ateca-v1';

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
  { time: "08:50 - 09:45", label: "2ª Hora", type: "class" },
  { time: "09:45 - 10:40", label: "3ª Hora", type: "class" },
  { time: "10:40 - 11:10", label: "Recreo", type: "break" },
  { time: "11:10 - 12:05", label: "4ª Hora", type: "class" },
  { time: "12:05 - 13:00", label: "5ª Hora", type: "class" },
  { time: "13:00 - 13:55", label: "6ª Hora", type: "class" },
  { time: "13:55 - 14:05", label: "Descanso", type: "break" },
  { time: "14:05 - 15:00", label: "7ª Hora", type: "class" },
];

// Helper to convert PCM to WAV for Gemini TTS
function pcmToWav(pcmData, sampleRate) {
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.length, true);
  const pcmView = new Uint8Array(pcmData);
  new Uint8Array(buffer, 44).set(pcmView);
  return new Blob([buffer], { type: 'audio/wav' });
}

export default function App() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); 
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [allReservations, setAllReservations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [customActivity, setCustomActivity] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para Gemini
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [suggestedIdea, setSuggestedIdea] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(null);
  const [aiPlanning, setAiPlanning] = useState('');
  const [isGeneratingPlanning, setIsGeneratingPlanning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioRef = useRef(null);
  const logoUrl = "https://i.ibb.co/0Vr8sZd3/image.png";

  const todayIso = new Date().toISOString().split('T')[0];

  const currentWeekDates = useMemo(() => {
    const current = new Date(selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        iso: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('es-ES', { weekday: 'short' }),
        num: d.getDate()
      };
    });
  }, [selectedDate]);

  const callGemini = async (prompt, systemPrompt = "", model = "gemini-2.5-flash-preview-09-2025") => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < delays.length; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined
          })
        });
        const result = await response.json();
        return result;
      } catch (err) {
        if (i === delays.length - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  const generateIdea = async () => {
    if (!selectedModule) return;
    setIsGeneratingIdea(true);
    const moduleName = selectedModule.id === 'otro' ? customActivity : selectedModule.name;
    const prompt = `Sugiere una actividad innovadora de 1 frase para realizar en el "Aula Ateca" para el módulo: ${moduleName}. Sé creativo y breve.`;
    
    try {
      const result = await callGemini(prompt, "Eres un experto en tecnología educativa.");
      const idea = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setSuggestedIdea(idea || "Prueba a integrar realidad virtual para simular entornos de trabajo.");
    } catch (error) {
      setSuggestedIdea("Prueba a integrar realidad virtual para simular entornos de trabajo.");
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  const generatePlanning = async (res) => {
    if (showAIAssistant === res.id) {
      setShowAIAssistant(null);
      return;
    }
    setShowAIAssistant(res.id);
    setIsGeneratingPlanning(true);
    setAiPlanning('');
    const prompt = `Genera una planificación técnica para una sesión en el Aula Ateca. Profesor: ${res.studentName}. Módulo: ${res.module}. Duración: 55 minutos. Incluye objetivos, herramientas sugeridas y estructura.`;

    try {
      const result = await callGemini(prompt, "Eres un asesor pedagógico especializado en aulas ATECA.");
      const plan = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiPlanning(plan || "No se pudo generar la planificación.");
    } catch (error) {
      setAiPlanning("Error al conectar con la IA.");
    } finally {
      setIsGeneratingPlanning(false);
    }
  };

  const speakPlan = async (text) => {
    if (isSpeaking) {
      if (audioRef.current) audioRef.current.pause();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Dilo con entusiasmo: ${text}` }] }],
          generationConfig: { 
            responseModalities: ["AUDIO"], 
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } } 
          }
        })
      });
      const result = await response.json();
      const audioBase64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (audioBase64) {
        const pcmData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
        const wavBlob = pcmToWav(pcmData, 24000);
        const url = URL.createObjectURL(wavBlob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => setIsSpeaking(false);
      }
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error de autenticación:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'reservations');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllReservations(data);
    }, (error) => {
      console.error("Error en Firestore:", error);
    });
    return () => unsubscribe();
  }, [user]);

  const dailyReservations = useMemo(() => {
    return allReservations.filter(res => res.date === selectedDate);
  }, [allReservations, selectedDate]);

  const handleBooking = async () => {
    if (!studentName.trim() || !selectedModule || !selectedSlot || !user) return;
    const finalModuleName = selectedModule.id === 'otro' ? customActivity.trim() : selectedModule.name;
    const reservationId = `${selectedSlot.date}_${selectedSlot.time.replace(/\s/g, '')}`;
    const resRef = doc(db, 'artifacts', appId, 'public', 'data', 'reservations', reservationId);
    
    try {
      await setDoc(resRef, {
        date: selectedSlot.date,
        time: selectedSlot.time,
        label: selectedSlot.label,
        studentName: studentName.trim(),
        module: finalModuleName,
        moduleId: selectedModule.id,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  const cancelBooking = async (resId) => {
    const resRef = doc(db, 'artifacts', appId, 'public', 'data', 'reservations', resId);
    try {
      await deleteDoc(resRef);
    } catch (error) {
      console.error(error);
    }
  };

  const openBookingModal = (slot, date) => {
    setSelectedSlot({ ...slot, date });
    setSuggestedIdea('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStudentName('');
    setSelectedModule(null);
    setCustomActivity('');
    setSelectedSlot(null);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-bold text-blue-600 gap-4 text-center p-6 bg-slate-50">
      <Loader2 className="animate-spin text-blue-500" size={48} />
      <p className="text-xl">Iniciando Ecosistema Digital...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-28">
      {/* Cabecera */}
      <header className="bg-blue-600 text-white px-8 pt-6 pb-24 rounded-b-[3.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-4 right-2 z-20 w-40 h-40 pointer-events-none">
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain filter drop-shadow-xl opacity-90" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30">
            <CalendarIcon size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Aula Ateca</h1>
            <p className="text-blue-100 font-bold opacity-90 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Gestión Inteligente con IA
            </p>
          </div>
        </div>
        <div className="relative z-10 mt-10 flex justify-center">
          <div className="bg-blue-800/40 p-1.5 rounded-2xl flex gap-1 border border-white/10 backdrop-blur-sm">
            <button 
              onClick={() => setViewMode('daily')} 
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'daily' ? 'bg-yellow-400 text-blue-900 shadow-lg scale-105' : 'text-blue-100 hover:bg-white/5'}`}
            >
              DÍA
            </button>
            <button 
              onClick={() => setViewMode('weekly')} 
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'weekly' ? 'bg-yellow-400 text-blue-900 shadow-lg scale-105' : 'text-blue-100 hover:bg-white/5'}`}
            >
              SEMANA
            </button>
          </div>
        </div>
      </header>

      {/* Navegador de Fecha */}
      <div className="px-4 -mt-12 relative z-30">
        <div className="bg-white rounded-[2.5rem] p-5 flex items-center justify-between shadow-2xl border border-blue-50 max-w-5xl mx-auto">
          <button onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - (viewMode === 'daily' ? 1 : 7));
            setSelectedDate(d.toISOString().split('T')[0]);
          }} className="p-4 hover:bg-blue-50 text-blue-600 rounded-full transition-colors">
            <ChevronLeft size={28} />
          </button>
          
          <div className="text-center font-black">
            <div className="text-[10px] text-blue-600 uppercase tracking-widest font-black">
              {viewMode === 'daily' ? new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long' }) : 'Horario Semanal'}
            </div>
            <div className="text-xl md:text-2xl text-slate-800">
              {viewMode === 'daily' 
                ? new Date(selectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) 
                : `Semana del ${currentWeekDates[0].num} al ${currentWeekDates[4].num} de ${new Date(selectedDate).toLocaleDateString('es-ES', { month: 'long' })}`
              }
            </div>
          </div>

          <button onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + (viewMode === 'daily' ? 1 : 7));
            setSelectedDate(d.toISOString().split('T')[0]);
          }} className="p-4 hover:bg-blue-50 text-blue-600 rounded-full transition-colors">
            <ChevronRight size={28} />
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="px-4 mt-8 max-w-6xl mx-auto">
        {viewMode === 'daily' ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {ACADEMIC_SCHEDULE.map((slot, index) => {
              const res = dailyReservations.find(r => r.time === slot.time);
              const isBreak = slot.type === 'break';
              const isMine = res?.userId === user?.uid;

              return (
                <div key={index} className="space-y-2">
                  <div className={`rounded-3xl p-6 flex items-center justify-between transition-all border-2 ${isBreak ? 'bg-amber-50/50 border-dashed border-amber-200 opacity-80' : res ? 'bg-white border-blue-500 shadow-md scale-[1.01]' : 'bg-white border-transparent shadow-sm hover:border-blue-100'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isBreak ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-blue-600'}`}>
                        {isBreak ? <Coffee size={24} /> : <Clock size={24} />}
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-blue-500 uppercase">{slot.label}</span>
                        <p className="font-black text-xl text-slate-800">{slot.time}</p>
                        <p className="text-sm font-semibold text-slate-500">
                          {isBreak ? 'Recreo' : res ? `${res.studentName} • ${res.module}` : 'Libre'}
                        </p>
                      </div>
                    </div>
                    {!isBreak && (
                      res ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => generatePlanning(res)} 
                            title="Generar Planificación ✨"
                            className={`p-3 rounded-xl transition-all ${showAIAssistant === res.id ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                          >
                            <BrainCircuit size={20} />
                          </button>
                          {isMine && (
                            <button onClick={() => cancelBooking(res.id)} className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 transition-colors">
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button 
                          onClick={() => openBookingModal(slot, selectedDate)} 
                          className="bg-yellow-400 text-blue-900 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md hover:bg-yellow-500 transition-all active:scale-95"
                        >
                          <Plus size={28} />
                        </button>
                      )
                    )}
                  </div>

                  {showAIAssistant === res?.id && (
                    <div className="bg-white border-2 border-purple-200 rounded-[2rem] p-6 shadow-xl animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-purple-800 text-xs uppercase tracking-widest flex items-center gap-2">
                          <Sparkles size={16} /> Planificación IA ✨
                        </h3>
                        <div className="flex gap-2">
                          {!isGeneratingPlanning && aiPlanning && (
                            <button 
                              onClick={() => speakPlan(aiPlanning)}
                              className={`p-2 rounded-lg transition-all ${isSpeaking ? 'bg-blue-600 text-white animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                              title="Escuchar Plan ✨"
                            >
                              <Volume2 size={16} />
                            </button>
                          )}
                          <button onClick={() => setShowAIAssistant(null)} className="text-purple-300 hover:text-purple-600 transition-colors">
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="text-slate-600 text-sm whitespace-pre-wrap font-medium leading-relaxed">
                        {isGeneratingPlanning ? (
                          <div className="flex items-center gap-2 text-purple-400 italic">
                            <Loader2 className="animate-spin" size={16} /> Generando plan docente...
                          </div>
                        ) : aiPlanning}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* VISTA SEMANAL COMPLETA */
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-blue-50/50">
                    <th className="p-6 text-left border-b border-blue-100 w-32">
                      <span className="text-[10px] font-black text-blue-400 uppercase">Horario</span>
                    </th>
                    {currentWeekDates.map(day => (
                      <th key={day.iso} className={`p-6 border-b border-blue-100 text-center transition-colors ${day.iso === todayIso ? 'bg-yellow-100' : day.iso === selectedDate ? 'bg-blue-600/5' : ''}`}>
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{day.label}</div>
                        <div className={`text-2xl font-black ${day.iso === selectedDate ? 'text-blue-600' : 'text-slate-700'}`}>{day.num}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ACADEMIC_SCHEDULE.map((slot, idx) => (
                    <tr key={idx} className={slot.type === 'break' ? 'bg-amber-50/20' : 'hover:bg-slate-50/50 transition-colors'}>
                      <td className="p-6 border-b border-slate-100">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{slot.label}</div>
                        <div className="text-sm font-black text-slate-700 whitespace-nowrap">{slot.time}</div>
                      </td>
                      {currentWeekDates.map(day => {
                        const res = allReservations.find(r => r.date === day.iso && r.time === slot.time);
                        const isBreak = slot.type === 'break';
                        const isToday = day.iso === todayIso;
                        
                        return (
                          <td key={day.iso} className={`p-2 border-b border-slate-100 border-l border-slate-50 transition-colors ${isToday ? 'bg-yellow-50/50' : ''}`}>
                            {isBreak ? (
                              <div className="h-full flex items-center justify-center opacity-30">
                                <Coffee size={18} className="text-amber-500" />
                              </div>
                            ) : res ? (
                              <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-sm space-y-1">
                                <div className="text-[10px] font-black uppercase opacity-80 leading-tight truncate">{res.studentName}</div>
                                <div className="text-[9px] font-bold bg-white/20 inline-block px-1.5 py-0.5 rounded-md truncate w-full">{res.module}</div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => openBookingModal(slot, day.iso)}
                                className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-center text-slate-300 hover:text-blue-400 group"
                              >
                                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Reserva */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Reservar</h2>
                <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">{selectedSlot?.label} • {new Date(selectedSlot?.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
              </div>
              <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-widest">Docente</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    value={studentName} 
                    onChange={(e) => setStudentName(e.target.value)} 
                    placeholder="Nombre del Profesor..." 
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-200 rounded-3xl outline-none font-bold text-slate-700 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-widest">Módulo / Ciclo</label>
                <div className="relative">
                  <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select 
                    className="w-full pl-14 pr-6 py-4 rounded-3xl border-2 border-transparent bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-200 appearance-none transition-all cursor-pointer" 
                    onChange={(e) => {
                      const mod = STANDARD_MODULES.find(m => m.id === e.target.value);
                      setSelectedModule(mod || { id: 'otro', name: 'Otro' });
                    }}
                  >
                    <option value="">Selecciona Módulo</option>
                    {STANDARD_MODULES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    <option value="otro">Otro (Especificar)</option>
                  </select>
                </div>
              </div>

              {selectedModule?.id === 'otro' && (
                <input 
                  type="text" 
                  value={customActivity} 
                  onChange={(e) => setCustomActivity(e.target.value)} 
                  placeholder="Especifica el tema..." 
                  className="w-full px-6 py-4 bg-purple-50 rounded-3xl outline-none font-bold text-purple-900 animate-in slide-in-from-top-2 border-2 border-purple-100" 
                />
              )}

              {selectedModule && (
                <div className="p-6 bg-purple-50 rounded-3xl border-2 border-purple-100 space-y-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200/20 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-purple-300/30 transition-all"></div>
                  <button 
                    onClick={generateIdea} 
                    className="text-[11px] font-black text-purple-700 uppercase flex items-center gap-2 hover:bg-white/50 px-3 py-1 rounded-full transition-colors relative z-10"
                  >
                    <Lightbulb size={14}/> Sugerencia IA ✨
                  </button>
                  <p className="text-sm font-medium text-purple-900/80 leading-relaxed italic relative z-10">
                    {isGeneratingIdea ? (
                      <span className="flex items-center gap-2 font-bold"><Loader2 className="animate-spin" size={12}/> Consultando el futuro...</span>
                    ) : (
                      suggestedIdea || "Pulsa arriba para obtener una idea innovadora para esta sesión."
                    )}
                  </p>
                </div>
              )}

              <button 
                onClick={handleBooking} 
                disabled={!studentName.trim() || !selectedModule}
                className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed mt-4"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
