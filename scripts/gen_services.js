import fs from 'fs';

const mockDataCode = `// Mock Data for MyCode Pro - VOD & Live Streaming Platform

export const INITIAL_USER = {
  id: "usr_101",
  nombre: "Shalom Dev",
  email: "shalom@mycode.pro",
  rol: "Desarrollador",
  plan: "Bronce",
  nivel: "Nivel 4 - Fullstack Pro",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  biografia: "Desarrollador enfocado en arquitectura de software, microservicios y frontend reactivo.",
  fechaRegistro: "2026-01-10",
  experienciaXP: 1450,
  diasRacha: 5
};

export const TOKEN_COSTS = {
  COMPILATION: 2,
  UNLOCK_LESSON: 5,
  UNLOCK_COURSE_DISCOUNT: 35,
  EXCLUSIVE_LIVE_PASS: 15
};

export const INITIAL_TRANSACTIONS = [
  {
    id: "tx_1001",
    fecha: "2026-08-14 14:20",
    tipo: "Recarga Bienvenida",
    descripcion: "Bono de bienvenida por registro Plan Bronce",
    cambio: 50,
    saldoRestante: 50,
    estado: "completado"
  },
  {
    id: "tx_1002",
    fecha: "2026-08-14 16:45",
    tipo: "Compilación Sandbox",
    descripcion: "Ejecución de algoritmo Python en Playground",
    cambio: -2,
    saldoRestante: 48,
    estado: "completado"
  },
  {
    id: "tx_1003",
    fecha: "2026-08-15 10:10",
    tipo: "Desbloqueo de Módulo",
    descripcion: "Acceso a Módulo 2: Spring Boot REST API",
    cambio: -10,
    saldoRestante: 38,
    estado: "completado"
  },
  {
    id: "tx_1004",
    fecha: "2026-08-15 12:00",
    tipo: "Recompensa Diaria",
    descripcion: "Racha de 3 días consecutivos completada",
    cambio: 10,
    saldoRestante: 48,
    estado: "completado"
  }
];

export const PLANS_DATA = [
  {
    id: "bronce",
    nombre: "Bronce",
    badge: "Inicial",
    tokensMensuales: 50,
    precioMensual: 0,
    precioAnual: 0,
    descripcion: "Ideal para iniciarse en la programación y explorar lecciones fundamentales.",
    caracteristicas: [
      "50 tokens mensuales recargables",
      "Acceso al catálogo de cursos base",
      "Compilaciones en Playground (2 tokens)",
      "Transmisiones en vivo abiertas",
      "Soporte en comunidad Discord"
    ],
    destacado: false,
    colorAccent: "#9CA3AF"
  },
  {
    id: "plata",
    nombre: "Plata",
    badge: "Popular",
    tokensMensuales: 150,
    precioMensual: 14.99,
    precioAnual: 140,
    descripcion: "Para desarrolladores constantes que asisten a transmisiones en vivo e interactúan.",
    caracteristicas: [
      "150 tokens mensuales recargables",
      "Acceso a todos los cursos y trailers VOD",
      "Acceso a todas las transmisiones en vivo",
      "Resolución de dudas en chat en vivo prioritario",
      "Descarga de repositorios y recursos de código",
      "Descuento del 15% en compras de tokens extra"
    ],
    destacado: true,
    colorAccent: "#6366F1"
  },
  {
    id: "oro",
    nombre: "Oro",
    badge: "Pro Unlimited",
    tokensMensuales: 350,
    precioMensual: 29.99,
    precioAnual: 280,
    descripcion: "La experiencia definitiva para profesionales de élite con streaming VIP y compilaciones ilimitadas.",
    caracteristicas: [
      "350 tokens mensuales + bonos de racha",
      "Compilaciones ilimitadas en Playground (0 tokens)",
      "Acceso VIP a todas las transmisiones y grabaciones VOD",
      "Sesiones de Code Review 1 a 1 en vivo",
      "Descarga offline simulada de videos y guías",
      "Insignia Dorada en el chat y perfil público"
    ],
    destacado: false,
    colorAccent: "#F59E0B"
  }
];

export const SAMPLE_VIDEOS = {
  TRAILER: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  LESSON_1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  LESSON_2: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  LESSON_3: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  LESSON_4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  LIVE_RECORDING: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
};

export const COURSES_DATA = [
  {
    id: "course-java-spring",
    titulo: "Arquitectura Backend con Java & Spring Boot 3",
    subtitulo: "Aprende Microservicios, Spring Data JPA, Security JWT y Docker desde cero a producción.",
    instructor: "Carlos Mendoza",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    instructorBio: "Staff Software Engineer en Fintech. 12+ años especializándose en sistemas distribuidos y Java empresarial.",
    miniatura: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
    trailerUrl: SAMPLE_VIDEOS.TRAILER,
    costoTokens: 35,
    lenguaje: "Java",
    nivel: "Avanzado",
    formato: "Grabado",
    duracionTotal: "6h 45m",
    totalLecciones: 4,
    estudiantes: 1240,
    valoracion: 4.9,
    desbloqueado: true,
    prerrequisitos: [
      "Conocimientos fundamentales de POO en Java",
      "Manejo básico de bases de datos SQL y Git"
    ],
    secciones: [
      {
        id: "sec-1",
        titulo: "Módulo 1: Fundamentos y Setup de Spring Boot 3",
        lecciones: [
          {
            id: "les-1-1",
            titulo: "1.1 Introducción y Configuración del Ecosistema",
            duracionSegundos: 420,
            duracionFormato: "07:00",
            videoUrl: SAMPLE_VIDEOS.LESSON_1,
            bloqueada: false,
            completada: true,
            progresoSegundos: 420,
            resumen: "En esta lección configuramos el entorno de desarrollo con Java 21 LTS, IntelliJ IDEA y Spring Initializr.",
            codigoMuestra: "package com.mycode.demo;\\n\\nimport org.springframework.boot.SpringApplication;\\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\\n\\n@SpringBootApplication\\npublic class Application {\\n    public static void main(String[] args) {\\n        SpringApplication.run(Application.class, args);\\n        System.out.println(\"⚡ MyCode Spring Core Inicializado!\");\\n    }\\n}",
            recursos: [
              { nombre: "Guía de Setup en PDF", tamano: "1.2 MB", enlace: "#" },
              { nombre: "Repositorio Inicial en GitHub", tamano: "Código Fuente", enlace: "#" }
            ]
          },
          {
            id: "les-1-2",
            titulo: "1.2 Inyección de Dependencias y Componentes Clave",
            duracionSegundos: 580,
            duracionFormato: "09:40",
            videoUrl: SAMPLE_VIDEOS.LESSON_2,
            bloqueada: false,
            completada: false,
            progresoSegundos: 145,
            resumen: "Comprende a fondo el IoC Container, @Autowired, @Service, @Repository y la gestión de beans en Spring.",
            codigoMuestra: "@Service\\npublic class CourseService {\\n    private final CourseRepository repo;\\n\\n    public CourseService(CourseRepository repo) {\\n        this.repo = repo;\\n    }\\n\\n    public List<Course> getAllActive() {\\n        return repo.findByActiveTrue();\\n    }\\n}",
            recursos: [
              { nombre: "Diagrama de Ciclo de Vida del Bean", tamano: "800 KB", enlace: "#" }
            ]
          }
        ]
      },
      {
        id: "sec-2",
        titulo: "Módulo 2: APIs RESTful y Persistencia con Spring Data JPA",
        lecciones: [
          {
            id: "les-2-1",
            titulo: "2.1 Controladores REST y Manejo Global de Excepciones",
            duracionSegundos: 650,
            duracionFormato: "10:50",
            videoUrl: SAMPLE_VIDEOS.LESSON_3,
            bloqueada: false,
            completada: false,
            progresoSegundos: 0,
            resumen: "Creación de endpoints REST con validación @Valid y manejo de excepciones mediante @RestControllerAdvice.",
            codigoMuestra: "@RestController\\n@RequestMapping(\"/api/v1/courses\")\\npublic class CourseController {\\n    @GetMapping(\"/{id}\")\\n    public ResponseEntity<CourseDTO> getCourse(@PathVariable String id) {\\n        return ResponseEntity.ok(service.getById(id));\\n    }\\n}",
            recursos: [
              { nombre: "Postman Collection v1", tamano: "250 KB", enlace: "#" }
            ]
          },
          {
            id: "les-2-2",
            titulo: "2.2 Relaciones JPA Complejas y Queries N+1",
            duracionSegundos: 720,
            duracionFormato: "12:00",
            videoUrl: SAMPLE_VIDEOS.LESSON_4,
            bloqueada: true,
            completada: false,
            progresoSegundos: 0,
            resumen: "Evita cuellos de botella con @EntityGraph, joins optimizados y paginación en PostgreSQL.",
            codigoMuestra: "@Query(\"SELECT c FROM Course c LEFT JOIN FETCH c.lessons WHERE c.id = :id\")\\nOptional<Course> findWithLessonsById(@Param(\"id\") String id);",
            recursos: []
          }
        ]
      }
    ]
  },
  {
    id: "course-python-ml",
    titulo: "Mastering Python: De Cero a Machine Learning",
    subtitulo: "Domina NumPy, Pandas, Scikit-Learn y despliegue de modelos predictivos en la nube.",
    instructor: "Dra. Elena Rostova",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    instructorBio: "Científica de Datos Principal e investigadora en IA. Autora de 3 libros de Deep Learning.",
    miniatura: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    trailerUrl: SAMPLE_VIDEOS.TRAILER,
    costoTokens: 30,
    lenguaje: "Python",
    nivel: "Intermedio",
    formato: "Con grabación disponible",
    duracionTotal: "5h 20m",
    totalLecciones: 3,
    estudiantes: 980,
    valoracion: 4.85,
    desbloqueado: false,
    prerrequisitos: [
      "Sintaxis básica de Python (funciones, listas, diccionarios)",
      "Conceptos elementales de estadística y álgebra"
    ],
    secciones: [
      {
        id: "sec-p1",
        titulo: "Módulo 1: Procesamiento Vectorial con NumPy y Pandas",
        lecciones: [
          {
            id: "les-p1-1",
            titulo: "1.1 Matrices Multidimensionales y Broadcasting",
            duracionSegundos: 490,
            duracionFormato: "08:10",
            videoUrl: SAMPLE_VIDEOS.LESSON_1,
            bloqueada: false,
            completada: false,
            progresoSegundos: 0,
            resumen: "Compara el rendimiento de listas nativas vs ndarrays y operaciones vectorizadas en memoria.",
            codigoMuestra: "import numpy as np\\n\\ndata = np.random.randn(1000, 1000)\\nnormalized = (data - np.mean(data)) / np.std(data)\\nprint(f\"Forma: {normalized.shape}, Media: {np.mean(normalized):.2f}\")",
            recursos: [
              { nombre: "Jupyter Notebook 01", tamano: "2.1 MB", enlace: "#" }
            ]
          },
          {
            id: "les-p1-2",
            titulo: "1.2 Limpieza y Feature Engineering con Pandas",
            duracionSegundos: 620,
            duracionFormato: "10:20",
            videoUrl: SAMPLE_VIDEOS.LESSON_2,
            bloqueada: true,
            completada: false,
            progresoSegundos: 0,
            resumen: "Manejo de nulos, imputación, codificación one-hot y transformaciones temporales.",
            codigoMuestra: "import pandas as pd\\n\\ndf = pd.read_csv(\"dataset.csv\")\\ndf[\"fecha\"] = pd.to_datetime(df[\"fecha\"])\\ndf_clean = df.dropna(subset=[\"target\"])",
            recursos: []
          }
        ]
      }
    ]
  },
  {
    id: "course-react-next",
    titulo: "React 19 & Next.js 15: Fullstack Mastery",
    subtitulo: "Server Components, Server Actions, View Transitions y Renderizado Híbrido ultra veloz.",
    instructor: "Andrés Silva",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    instructorBio: "Tech Lead Frontend & Google Developer Expert en Tecnologías Web.",
    miniatura: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80",
    trailerUrl: SAMPLE_VIDEOS.TRAILER,
    costoTokens: 40,
    lenguaje: "JavaScript",
    nivel: "Avanzado",
    formato: "En vivo próximamente",
    duracionTotal: "7h 15m",
    totalLecciones: 3,
    estudiantes: 1890,
    valoracion: 4.95,
    desbloqueado: false,
    prerrequisitos: [
      "Dominio de React moderno (Hooks, Context, JSX)",
      "Experiencia con TypeScript y llamadas HTTP"
    ],
    secciones: [
      {
        id: "sec-r1",
        titulo: "Módulo 1: Nuevos Paradigmas de React 19",
        lecciones: [
          {
            id: "les-r1-1",
            titulo: "1.1 React Actions y useActionState",
            duracionSegundos: 540,
            duracionFormato: "09:00",
            videoUrl: SAMPLE_VIDEOS.LESSON_3,
            bloqueada: false,
            completada: false,
            progresoSegundos: 0,
            resumen: "Elimina useEffect innecesarios para mutaciones de formularios con useActionState y useOptimistic.",
            codigoMuestra: "import { useActionState } from \"react\";\\n\\nasync function updateName(prevState, formData) {\\n  const res = await api.saveName(formData.get(\"name\"));\\n  return res.success ? { name: res.name } : { error: res.msg };\\n}",
            recursos: []
          }
        ]
      }
    ]
  },
  {
    id: "course-cpp-algorithms",
    titulo: "Estructuras de Datos y Algoritmos Competitivos en C++",
    subtitulo: "Grafos, Programación Dinámica, Árboles Segmentados y Técnicas para entrevistas FAANG.",
    instructor: "Mateo Valenzuela",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    instructorBio: "Medallista olímpico en informática y Software Engineer en Google.",
    miniatura: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    trailerUrl: SAMPLE_VIDEOS.TRAILER,
    costoTokens: 25,
    lenguaje: "C++",
    nivel: "Intermedio",
    formato: "Grabado",
    duracionTotal: "8h 00m",
    totalLecciones: 4,
    estudiantes: 670,
    valoracion: 4.92,
    desbloqueado: false,
    prerrequisitos: [
      "Sintaxis básica de C++ (punteros, referencias, STL vector/map)"
    ],
    secciones: [
      {
        id: "sec-c1",
        titulo: "Módulo 1: Optimización de Tiempo y Espacio O(n log n)",
        lecciones: [
          {
            id: "les-c1-1",
            titulo: "1.1 Búsqueda Binaria Avanzada sobre el Espacio de Respuestas",
            duracionSegundos: 610,
            duracionFormato: "10:10",
            videoUrl: SAMPLE_VIDEOS.LESSON_4,
            bloqueada: false,
            completada: false,
            progresoSegundos: 0,
            resumen: "Aprende el patrón pred(x) para encontrar óptimos en funciones monótonas en tiempo logarítmico.",
            codigoMuestra: "#include <iostream>\\n#include <vector>\\nusing namespace std;\\n\\nbool canDistribute(int maxWork, const vector<int>& jobs, int workers) {\\n    int count = 1, current = 0;\\n    for (int j : jobs) {\\n        if (current + j > maxWork) {\\n            count++;\\n            current = j;\\n        } else current += j;\\n    }\\n    return count <= workers;\\n}",
            recursos: []
          }
        ]
      }
    ]
  }
];

export const LIVE_STREAMS = {
  active: {
    id: "live-active-01",
    titulo: "🔴 Code Review en Vivo: Refactorización y Patrones de Diseño en Java & Python",
    instructor: "Carlos Mendoza & Dra. Elena",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    estado: "en-vivo",
    espectadoresSimulados: 842,
    videoUrl: SAMPLE_VIDEOS.LESSON_1,
    subtitulosUrl: null,
    tema: "Analizamos arquitecturas reales enviadas por los estudiantes. Refactorizamos código legacy en tiempo real.",
    chatSimulado: [
      { id: "c1", usuario: "DevGamer", rol: "pro", mensaje: "¡Buenas tardes a todos! Listo para el refactor 🔥", hora: "15:02" },
      { id: "c2", usuario: "LauraCode", rol: "student", mensaje: "¿Se hablará sobre el patrón Factory Method hoy?", hora: "15:03" },
      { id: "c3", usuario: "Mod_Alex", rol: "mod", mensaje: "¡Recuerden dejar sus preguntas con la etiqueta #pregunta!", hora: "15:03" },
      { id: "c4", usuario: "KikeFullstack", rol: "student", mensaje: "Excelente calidad de transmisión 1080p ⚡", hora: "15:04" },
      { id: "c5", usuario: "Sofi_Tech", rol: "pro", mensaje: "Ese snippet de Spring Boot quedó súper limpio", hora: "15:05" }
    ]
  },
  upcoming: [
    {
      id: "live-up-01",
      titulo: "Masterclass: Concurrencia y Virtual Threads en Java 23",
      instructor: "Carlos Mendoza",
      fechaHora: "2026-08-18T19:00:00",
      duracionEstimada: "2 horas",
      costoTokens: 15,
      recordatorioActivo: false,
      descripcion: "Aprende a escalar a millones de peticiones concurrentes sin complejidad de reactive programming."
    },
    {
      id: "live-up-02",
      titulo: "Hackathon en Vivo: Construyendo un Agente de IA con Python & LangChain",
      instructor: "Dra. Elena Rostova",
      fechaHora: "2026-08-20T18:30:00",
      duracionEstimada: "3 horas",
      costoTokens: 15,
      recordatorioActivo: true,
      descripcion: "De cero a un agente autónomo conectado a bases de datos vectoriales en vivo."
    },
    {
      id: "live-up-03",
      titulo: "Resolución de Retos de Algoritmos FAANG en C++ & Java",
      instructor: "Mateo Valenzuela",
      fechaHora: "2026-08-22T20:00:00",
      duracionEstimada: "2.5 horas",
      costoTokens: 15,
      recordatorioActivo: false,
      descripcion: "Técnicas de pensamiento lateral y patrones recurrentes en entrevistas técnicas de alto nivel."
    }
  ],
  past: [
    {
      id: "live-past-01",
      titulo: "Arquitectura Hexagonal en Microservicios (Grabación)",
      instructor: "Carlos Mendoza",
      fecha: "2026-08-10",
      duracion: "1h 45m",
      grabacionUrl: SAMPLE_VIDEOS.LIVE_RECORDING,
      miniatura: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      vistas: 3420
    },
    {
      id: "live-past-02",
      titulo: "Optimización de Consultas SQL y Profiling en PostgreSQL",
      instructor: "Andrés Silva",
      fecha: "2026-08-05",
      duracion: "2h 10m",
      grabacionUrl: SAMPLE_VIDEOS.LESSON_3,
      miniatura: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80",
      vistas: 4190
    }
  ]
};
`;

const apiCode = `// API service layer with reactive localStorage synchronization
import { INITIAL_USER, INITIAL_TRANSACTIONS, COURSES_DATA, LIVE_STREAMS, PLANS_DATA, TOKEN_COSTS } from './mockData';

const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));

const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

export const api = {
  // --- Auth Service ---
  auth: {
    async getCurrentUser() {
      await delay(100);
      return getStored('mycode_user', INITIAL_USER);
    },

    async login(email, password, rememberMe = true) {
      await delay(300);
      const currentUser = getStored('mycode_user', INITIAL_USER);
      if (email === 'admin@mycode.pro' || email === currentUser.email || email.includes('@')) {
        const user = { ...currentUser, email };
        if (rememberMe) {
          setStored('mycode_user', user);
          setStored('mycode_is_auth', true);
        }
        return { success: true, user };
      }
      return { success: false, error: 'Credenciales inválidas. Compruebe el correo y contraseña.' };
    },

    async register(userData) {
      await delay(350);
      const newUser = {
        id: 'usr_' + Date.now(),
        nombre: userData.nombre || 'Nuevo Desarrollador',
        email: userData.email,
        rol: userData.rol || 'Estudiante',
        plan: 'Bronce',
        nivel: 'Nivel 1 - Principiante',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        biografia: 'Nuevo miembro entusiasta en MyCode Pro.',
        fechaRegistro: new Date().toISOString().split('T')[0],
        experienciaXP: 50,
        diasRacha: 1
      };
      setStored('mycode_user', newUser);
      setStored('mycode_is_auth', true);
      setStored('mycode_tokens', 50);

      // Register initial welcome transaction
      const initialTx = {
        id: 'tx_' + Date.now(),
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
        tipo: 'Recarga Bienvenida',
        descripcion: '50 tokens de regalo por unirte a MyCode Pro',
        cambio: 50,
        saldoRestante: 50,
        estado: 'completado'
      };
      setStored('mycode_transactions', [initialTx]);
      return { success: true, user: newUser };
    },

    async logout() {
      await delay(100);
      localStorage.removeItem('mycode_is_auth');
      return { success: true };
    },

    async updateProfile(updates) {
      await delay(200);
      const current = getStored('mycode_user', INITIAL_USER);
      const updated = { ...current, ...updates };
      setStored('mycode_user', updated);
      return { success: true, user: updated };
    }
  },

  // --- Courses & VOD Service ---
  courses: {
    async getAll() {
      await delay(150);
      return getStored('mycode_courses', COURSES_DATA);
    },

    async getById(id) {
      await delay(100);
      const courses = getStored('mycode_courses', COURSES_DATA);
      return courses.find(c => c.id === id) || null;
    },

    async unlockCourse(courseId) {
      await delay(250);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const course = courses.find(c => c.id === courseId);
      if (!course) return { success: false, error: 'Curso no encontrado' };

      const updatedCourses = courses.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            desbloqueado: true,
            secciones: c.secciones.map(sec => ({
              ...sec,
              lecciones: sec.lecciones.map(les => ({ ...les, bloqueada: false }))
            }))
          };
        }
        return c;
      });

      setStored('mycode_courses', updatedCourses);
      return { success: true, course: updatedCourses.find(c => c.id === courseId) };
    },

    async unlockLesson(courseId, lessonId) {
      await delay(200);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const updatedCourses = courses.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            secciones: c.secciones.map(sec => ({
              ...sec,
              lecciones: sec.lecciones.map(les => les.id === lessonId ? { ...les, bloqueada: false } : les)
            }))
          };
        }
        return c;
      });
      setStored('mycode_courses', updatedCourses);
      return { success: true };
    }
  },

  // --- Video Progress Service ---
  progress: {
    async getProgressMap() {
      return getStored('mycode_video_progress', {
        'les-1-1': { courseId: 'course-java-spring', seconds: 420, completed: true, lastWatched: Date.now() - 3600000 },
        'les-1-2': { courseId: 'course-java-spring', seconds: 145, completed: false, lastWatched: Date.now() - 1800000 }
      });
    },

    async saveLessonProgress(courseId, lessonId, seconds, completed = false) {
      const map = getStored('mycode_video_progress', {});
      map[lessonId] = {
        courseId,
        seconds: Math.floor(seconds),
        completed: completed || (map[lessonId]?.completed ?? false),
        lastWatched: Date.now()
      };
      setStored('mycode_video_progress', map);
      return { success: true };
    }
  },

  // --- Wallet & Token Economy Service ---
  wallet: {
    async getBalance() {
      await delay(50);
      return getStored('mycode_tokens', 48);
    },

    async getTransactions() {
      await delay(100);
      return getStored('mycode_transactions', INITIAL_TRANSACTIONS);
    },

    async deductTokens(amount, description, type = 'Consumo') {
      await delay(200);
      const current = getStored('mycode_tokens', 48);
      if (current < amount) {
        return { success: false, error: 'Saldo insuficiente de tokens. Recargue su billetera o mejore su plan.' };
      }
      const newBalance = current - amount;
      setStored('mycode_tokens', newBalance);

      const txs = getStored('mycode_transactions', INITIAL_TRANSACTIONS);
      const newTx = {
        id: 'tx_' + Date.now(),
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
        tipo: type,
        descripcion: description,
        cambio: -amount,
        saldoRestante: newBalance,
        estado: 'completado'
      };
      setStored('mycode_transactions', [newTx, ...txs]);
      return { success: true, newBalance, transaction: newTx };
    },

    async addTokens(amount, description, type = 'Recarga') {
      await delay(200);
      const current = getStored('mycode_tokens', 48);
      const newBalance = current + amount;
      setStored('mycode_tokens', newBalance);

      const txs = getStored('mycode_transactions', INITIAL_TRANSACTIONS);
      const newTx = {
        id: 'tx_' + Date.now(),
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
        tipo: type,
        descripcion: description,
        cambio: amount,
        saldoRestante: newBalance,
        estado: 'completado'
      };
      setStored('mycode_transactions', [newTx, ...txs]);
      return { success: true, newBalance, transaction: newTx };
    },

    async upgradePlan(planId, isAnnual = false) {
      await delay(350);
      const plan = PLANS_DATA.find(p => p.id === planId) || PLANS_DATA[0];
      const user = getStored('mycode_user', INITIAL_USER);
      const updatedUser = { ...user, plan: plan.nombre };
      setStored('mycode_user', updatedUser);

      // Add plan tokens grant
      const currentTokens = getStored('mycode_tokens', 48);
      const newBalance = currentTokens + plan.tokensMensuales;
      setStored('mycode_tokens', newBalance);

      const txs = getStored('mycode_transactions', INITIAL_TRANSACTIONS);
      const newTx = {
        id: 'tx_' + Date.now(),
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
        tipo: 'Mejora de Plan',
        descripcion: 'Ascenso a Plan ' + plan.nombre + ' (' + (isAnnual ? 'Anual' : 'Mensual') + ') +' + plan.tokensMensuales + ' tokens',
        cambio: plan.tokensMensuales,
        saldoRestante: newBalance,
        estado: 'completado'
      };
      setStored('mycode_transactions', [newTx, ...txs]);

      return { success: true, user: updatedUser, newBalance, plan };
    }
  },

  // --- Live Stream Service ---
  live: {
    async getStreamData() {
      await delay(100);
      const reminders = getStored('mycode_live_reminders', ['live-up-02']);
      const streamData = { ...LIVE_STREAMS };
      streamData.upcoming = streamData.upcoming.map(u => ({
        ...u,
        recordatorioActivo: reminders.includes(u.id)
      }));
      return streamData;
    },

    async toggleReminder(streamId) {
      const reminders = getStored('mycode_live_reminders', ['live-up-02']);
      const exists = reminders.includes(streamId);
      const updated = exists ? reminders.filter(id => id !== streamId) : [...reminders, streamId];
      setStored('mycode_live_reminders', updated);
      return { success: true, recordatorioActivo: !exists };
    }
  },

  // --- Code Execution Simulation ---
  code: {
    async executeCode(code, language) {
      await delay(400);
      const trimmed = (code || '').trim();
      if (!trimmed) {
        return { success: false, output: '', error: 'El editor está vacío. Ingrese código para compilar.' };
      }

      if (language === 'python') {
        if (trimmed.includes('print')) {
          const match = trimmed.match(/print\\((.*?)\\)/);
          let printVal = match ? match[1].replace(/['"]/g, '') : 'Ejecutado con éxito.';
          return {
            success: true,
            output: \`[Python 3.13.0 - MyCode Sandbox]\\n> Ejecutando main.py...\\n\${printVal}\\n\\n--- Proceso finalizado en 0.042s (Memoria: 14.2 MB) ---\`,
            error: null
          };
        }
        return {
          success: true,
          output: \`[Python 3.13.0 - MyCode Sandbox]\\n> Ejecución finalizada con código de salida 0.\\nVariables en memoria: OK.\`,
          error: null
        };
      }

      if (language === 'java') {
        if (trimmed.includes('class') && trimmed.includes('main')) {
          return {
            success: true,
            output: \`[OpenJDK 21.0.2 - JVM Sandbox]\\n> Compilando Main.java...\\n> Bytecode verificado con éxito.\\nHola Mundo desde Java 21 LTS en MyCode Pro!\\n\\n--- Ejecución completada en 0.088s (JVM Heap: 28.4 MB) ---\`,
            error: null
          };
        }
        return {
          success: false,
          output: '',
          error: 'Error de sintaxis Java: No se encontró la clase principal pública o método `public static void main(String[] args)`.'
        };
      }

      return { success: true, output: 'Código ejecutado correctamente.', error: null };
    }
  }
};
`;

fs.writeFileSync('src/services/mockData.js', mockDataCode, 'utf8');
fs.writeFileSync('src/services/api.js', apiCode, 'utf8');
console.log('Services and Mock Data created successfully.');