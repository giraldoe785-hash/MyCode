import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const LiveStreamContext = createContext();

const RANDOM_CHATTERS = [
  { usuario: "AlexDev99", rol: "pro", mensajes: ["Brutal esa explicación de concurrencia!", "Pregunta: ¿esto afecta el garbage collector?", "En Java 21 los Virtual Threads son una locura."] },
  { usuario: "Carla_Frontend", rol: "student", mensajes: ["¿Quedará la grabación disponible en VOD?", "¿Qué librería usas para los gráficos?", "Me encanta cómo modularizas el código."] },
  { usuario: "RootAdmin", rol: "mod", mensajes: ["¡Por favor mantengan las preguntas enfocadas en el tema!", "Recuerden revisar los repositorios en la pestaña de recursos.", "Bienvenidos a todos los nuevos suscriptores!"] },
  { usuario: "NicoCoder", rol: "student", mensajes: ["Primer live al que llego a tiempo 🚀", "Un saludo desde Medellín!", "Excelente audio y calidad de video."] },
  { usuario: "Valeria_TS", rol: "pro", mensajes: ["Podemos hacer un benchmark rápido de memoria?", "Esto resuelve el problema que tenía en mi trabajo ayer.", "Suscrita a MyCode Pro Oro hoy mismo."] }
];

export function LiveStreamProvider({ children }) {
  const [streamData, setStreamData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [viewerCount, setViewerCount] = useState(842);
  const [loading, setLoading] = useState(true);
  const chatIntervalRef = useRef(null);

  const initLive = async () => {
    const data = await api.live.getStreamData();
    setStreamData(data);
    if (data.active && data.active.chatSimulado) {
      setChatMessages(data.active.chatSimulado);
      setViewerCount(data.active.espectadoresSimulados || 842);
    }
    setLoading(false);
  };

  useEffect(() => {
    initLive();
  }, []);

  // Simulate organic chat activity & viewer count fluctuation
  useEffect(() => {
    chatIntervalRef.current = setInterval(() => {
      setViewerCount(prev => Math.max(750, prev + Math.floor(Math.random() * 7) - 3));

      if (Math.random() > 0.45) {
        const chatter = RANDOM_CHATTERS[Math.floor(Math.random() * RANDOM_CHATTERS.length)];
        const msgText = chatter.mensajes[Math.floor(Math.random() * chatter.mensajes.length)];
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        const newMsg = {
          id: 'chat_' + Date.now() + Math.random(),
          usuario: chatter.usuario,
          rol: chatter.rol,
          mensaje: msgText,
          hora: timeStr
        };

        setChatMessages(prev => [...prev.slice(-40), newMsg]);
      }
    }, 4500);

    return () => {
      if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    };
  }, []);

  const sendChatMessage = (mensaje, user) => {
    if (!mensaje || !mensaje.trim()) return;
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const newMsg = {
      id: 'chat_user_' + Date.now(),
      usuario: user ? user.nombre : 'Tú',
      rol: user?.plan === 'Oro' ? 'pro' : 'student',
      mensaje: mensaje.trim(),
      hora: timeStr
    };

    setChatMessages(prev => [...prev, newMsg]);
  };

  const toggleReminder = async (streamId) => {
    const res = await api.live.toggleReminder(streamId);
    if (streamData) {
      setStreamData(prev => ({
        ...prev,
        upcoming: prev.upcoming.map(item =>
          item.id === streamId ? { ...item, recordatorioActivo: res.recordatorioActivo } : item
        )
      }));
    }
    return res.recordatorioActivo;
  };

  return (
    <LiveStreamContext.Provider value={{
      streamData,
      chatMessages,
      viewerCount,
      loading,
      sendChatMessage,
      toggleReminder,
      refreshStreamData: initLive,
      activeStream: streamData?.active || null,
      upcomingStreams: streamData?.upcoming || [],
      pastStreams: streamData?.past || []
    }}>
      {children}
    </LiveStreamContext.Provider>
  );
}

export function useLiveStream() {
  const context = useContext(LiveStreamContext);
  if (!context) {
    throw new Error('useLiveStream must be used within a LiveStreamProvider');
  }
  return context;
}