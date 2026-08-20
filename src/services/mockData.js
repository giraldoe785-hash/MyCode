// Mock Data for MyCode Pro - VOD & Live Streaming Platform

export const INITIAL_USER = {
  id: "usr_101",
  nombre: "Shalom Dev",
  email: "shalom@mycode.pro",
  role: "student",
  rol: "Desarrollador",
  plan: "Bronce",
  nivel: "Nivel 4 - Fullstack Pro",
  avatar: "/avatars/cyber_fox.svg",
  avatarId: "avatar-1",
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

export const PRESET_AVATARS = [
  { id: "avatar-1", name: "Mecha Fox (Zorro)", url: "/avatars/cyber_fox.svg" },
  { id: "avatar-2", name: "Cyber Cat (Gato)", url: "/avatars/cyber_cat.svg" },
  { id: "avatar-3", name: "Glitch Wolf (Lobo)", url: "/avatars/cyber_wolf.svg" },
  { id: "avatar-4", name: "Quantum Eagle (Águila)", url: "/avatars/cyber_eagle.svg" },
  { id: "avatar-5", name: "Vector Bear (Oso)", url: "/avatars/cyber_bear.svg" },
  { id: "avatar-6", name: "Neon Panda (Panda)", url: "/avatars/cyber_panda.svg" },
  { id: "avatar-7", name: "Apex Tiger (Tigre)", url: "/avatars/cyber_tiger.svg" },
  { id: "avatar-8", name: "Cyber Lion (León)", url: "/avatars/cyber_lion.svg" }
];

export const PLANS_DATA = [
  {
    id: "bronce",
    nombre: "Bronce",
    badge: "Inicial",
    tokensMensuales: 50,
    precioMensual: 9.99,
    precioAnual: 95.88,
    descripcion: "Para estudiantes y principiantes que dan sus primeros pasos y quieren dominar las bases de la programación.",
    descripcionEn: "For students and beginners taking their first steps and wanting to master the basics of programming.",
    caracteristicas: [
      "50 tokens mensuales recargables para desbloquear retos",
      "Acceso completo al catálogo de fundamentos y cursos base",
      "Prácticas guiadas en Playground con compilaciones en vivo",
      "Certificados de finalización en rutas iniciales"
    ],
    caracteristicasEn: [
      "50 monthly rechargeable tokens to unlock challenges",
      "Full access to the fundamentals and core course catalog",
      "Guided practices in Playground with live builds",
      "Completion certificates on foundational learning paths"
    ],
    destacado: false,
    colorAccent: "#CD7F32",
    themeClass: "plan-card-bronze"
  },
  {
    id: "plata",
    nombre: "Plata",
    badge: "Popular",
    tokensMensuales: 150,
    precioMensual: 19.99,
    precioAnual: 191.88,
    descripcion: "Para desarrolladores en crecimiento que buscan acelerar su carrera, crear portafolio y dominar tecnologías en demanda.",
    descripcionEn: "For growing developers looking to accelerate their career, build a portfolio, and master in-demand technologies.",
    caracteristicas: [
      "150 tokens mensuales recargables para avanzar sin pausas",
      "Acceso ilimitado a todos los cursos, talleres y grabaciones VOD",
      "Acceso a transmisiones en vivo semanales con instructores",
      "Proyectos reales con código fuente descargable para tu CV"
    ],
    caracteristicasEn: [
      "150 monthly rechargeable tokens to advance without pauses",
      "Unlimited access to all courses, workshops, and VOD recordings",
      "Access to weekly live streams with instructors",
      "Real-world projects with downloadable source code for your CV"
    ],
    destacado: true,
    colorAccent: "#C0C0C0",
    themeClass: "plan-card-silver"
  },
  {
    id: "oro",
    nombre: "Oro",
    badge: "Pro Unlimited",
    tokensMensuales: 350,
    precioMensual: 39.99,
    precioAnual: 383.88,
    descripcion: "La experiencia profesional definitiva con mentoría directa, preparación para entrevistas técnicas y compilaciones libres.",
    descripcionEn: "The definitive professional experience with direct mentorship, technical interview prep, and free compilations.",
    caracteristicas: [
      "350 tokens mensuales recargables + bonos de racha",
      "Compilaciones ilimitadas en Playground (0 tokens)",
      "Revisiones de código personalizadas (Code Review) por expertos",
      "Acceso VIP a todas las transmisiones, grabaciones y canal privado"
    ],
    caracteristicasEn: [
      "350 monthly rechargeable tokens + streak bonuses",
      "Unlimited compilations in Playground (0 tokens)",
      "Personalized Code Reviews by expert instructors",
      "VIP access to all live streams, recordings, and private channel"
    ],
    destacado: false,
    colorAccent: "#FFD700",
    themeClass: "plan-card-gold"
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
    tituloEn: "Backend Architecture with Java & Spring Boot 3",
    subtitulo: "Aprende Microservicios, Spring Data JPA, Security JWT y Docker desde cero a producción.",
    subtituloEn: "Master Microservices, Spring Data JPA, Security JWT, and Docker from scratch to production.",
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
            codigoMuestra: `package com.mycode.demo;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n        System.out.println("⚡ MyCode Spring Core Inicializado!");\n    }\n}`,
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
            codigoMuestra: `@Service\npublic class CourseService {\n    private final CourseRepository repo;\n\n    public CourseService(CourseRepository repo) {\n        this.repo = repo;\n    }\n\n    public List<Course> getAllActive() {\n        return repo.findByActiveTrue();\n    }\n}`,
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
            codigoMuestra: `@RestController\n@RequestMapping("/api/v1/courses")\npublic class CourseController {\n    @GetMapping("/{id}")\n    public ResponseEntity<CourseDTO> getCourse(@PathVariable String id) {\n        return ResponseEntity.ok(service.getById(id));\n    }\n}`,
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
            codigoMuestra: `@Query("SELECT c FROM Course c LEFT JOIN FETCH c.lessons WHERE c.id = :id")\nOptional<Course> findWithLessonsById(@Param("id") String id);`,
            recursos: []
          }
        ]
      }
    ]
  },
  {
    id: "course-python-ml",
    titulo: "Mastering Python: De Cero a Machine Learning",
    tituloEn: "Mastering Python: From Zero to Machine Learning",
    subtitulo: "Domina NumPy, Pandas, Scikit-Learn y despliegue de modelos predictivos en la nube.",
    subtituloEn: "Master NumPy, Pandas, Scikit-Learn, and cloud predictive model deployment.",
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
            codigoMuestra: `import numpy as np\n\ndata = np.random.randn(1000, 1000)\nnormalized = (data - np.mean(data)) / np.std(data)\nprint(f"Forma: {normalized.shape}, Media: {np.mean(normalized):.2f}")`,
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
            codigoMuestra: `import pandas as pd\n\ndf = pd.read_csv("dataset.csv")\ndf["fecha"] = pd.to_datetime(df["fecha"])\ndf_clean = df.dropna(subset=["target"])`,
            recursos: []
          }
        ]
      }
    ]
  },
  {
    id: "course-react-next",
    titulo: "React 19 & Next.js 15: Fullstack Mastery",
    tituloEn: "React 19 & Next.js 15: Fullstack Mastery",
    subtitulo: "Server Components, Server Actions, View Transitions y Renderizado Híbrido ultra veloz.",
    subtituloEn: "Server Components, Server Actions, View Transitions, and ultra-fast Hybrid Rendering.",
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
            codigoMuestra: `import { useActionState } from "react";\n\nasync function updateName(prevState, formData) {\n  const res = await api.saveName(formData.get("name"));\n  return res.success ? { name: res.name } : { error: res.msg };\n}`,
            recursos: []
          }
        ]
      }
    ]
  },
  {
    id: "course-cpp-algorithms",
    titulo: "Estructuras de Datos y Algoritmos Competitivos en C++",
    tituloEn: "Data Structures & Competitive Algorithms in C++",
    subtitulo: "Grafos, Programación Dinámica, Árboles Segmentados y Técnicas para entrevistas FAANG.",
    subtituloEn: "Graphs, Dynamic Programming, Segment Trees, and Techniques for FAANG interviews.",
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
            codigoMuestra: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nbool canDistribute(int maxWork, const vector<int>& jobs, int workers) {\n    int count = 1, current = 0;\n    for (int j : jobs) {\n        if (current + j > maxWork) {\n            count++;\n            current = j;\n        } else current += j;\n    }\n    return count <= workers;\n}`,
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
    tituloEn: "🔴 Live Code Review: Refactoring & Design Patterns in Java & Python",
    instructor: "Carlos Mendoza & Dra. Elena",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    estado: "en-vivo",
    espectadoresSimulados: 842,
    videoUrl: SAMPLE_VIDEOS.LESSON_1,
    subtitulosUrl: null,
    tema: "Analizamos arquitecturas reales enviadas por los estudiantes. Refactorizamos código legacy en tiempo real.",
    temaEn: "Analyzing real-world student architectures and refactoring legacy code in real time.",
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
      tituloEn: "Masterclass: Concurrency & Virtual Threads in Java 23",
      instructor: "Carlos Mendoza",
      fechaHora: "2026-08-18T19:00:00",
      duracionEstimada: "2 horas",
      costoTokens: 15,
      recordatorioActivo: false,
      descripcion: "Aprende a escalar a millones de peticiones concurrentes sin complejidad de reactive programming.",
      descripcionEn: "Scale to millions of concurrent requests without the complexity of reactive programming."
    },
    {
      id: "live-up-02",
      titulo: "Hackathon en Vivo: Construyendo un Agente de IA con Python & LangChain",
      tituloEn: "Live Hackathon: Building an AI Agent with Python & LangChain",
      instructor: "Dra. Elena Rostova",
      fechaHora: "2026-08-20T18:30:00",
      duracionEstimada: "3 horas",
      costoTokens: 15,
      recordatorioActivo: true,
      descripcion: "De cero a un agente autónomo conectado a bases de datos vectoriales en vivo.",
      descripcionEn: "From scratch to an autonomous agent connected to live vector databases."
    },
    {
      id: "live-up-03",
      titulo: "Resolución de Retos de Algoritmos FAANG en C++ & Java",
      tituloEn: "Solving FAANG Algorithm Challenges in C++ & Java",
      instructor: "Mateo Valenzuela",
      fechaHora: "2026-08-22T20:00:00",
      duracionEstimada: "2.5 horas",
      costoTokens: 15,
      recordatorioActivo: false,
      descripcion: "Técnicas de pensamiento lateral y patrones recurrentes en entrevistas técnicas de alto nivel.",
      descripcionEn: "Lateral thinking techniques and recurring patterns for high-level technical interviews."
    }
  ],
  past: [
    {
      id: "live-past-01",
      titulo: "Arquitectura Hexagonal en Microservicios (Grabación)",
      tituloEn: "Hexagonal Architecture in Microservices (VOD)",
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
      tituloEn: "SQL Query Optimization & Profiling in PostgreSQL",
      instructor: "Andrés Silva",
      fecha: "2026-08-05",
      duracion: "2h 10m",
      grabacionUrl: SAMPLE_VIDEOS.LESSON_3,
      miniatura: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80",
      vistas: 4190
    }
  ]
};

export const EJERCICIOS_DATA = [
  {
    id: "ex_101",
    courseId: "course-java-spring",
    moduleId: "sec-1",
    lessonId: "les-1-1",
    status: "published",
    titulo: "Hello World en Spring Boot",
    tituloEn: "Hello World in Spring Boot",
    content: "Crea una clase con el método main que arranque una aplicación Spring Boot e imprima '⚡ MyCode Spring Core Inicializado!' en consola.",
    contentEn: "Create a class with the main method that starts a Spring Boot application and prints '⚡ MyCode Spring Core Inicializado!' to the console.",
    initialCode: "package com.mycode.demo;\n\n// Importa las clases necesarias\n\npublic class Application {\n    public static void main(String[] args) {\n        // Tu código aquí\n    }\n}",
    language: "java"
  },
  {
    id: "ex_201",
    courseId: "course-python-ml",
    moduleId: "sec-p1",
    lessonId: "les-p1-1",
    status: "published",
    titulo: "Normalización de Matrices con NumPy",
    tituloEn: "Matrix Normalization with NumPy",
    content: "Dada una matriz de 1000x1000, normaliza los valores restando la media y dividiendo por la desviación estándar.",
    contentEn: "Given a 1000x1000 matrix, normalize the values by subtracting the mean and dividing by the standard deviation.",
    initialCode: "import numpy as np\n\ndata = np.random.randn(1000, 1000)\n# Escribe aquí tu código para normalizar 'data'\nnormalized = data\nprint(f\"Media: {np.mean(normalized):.2f}\")",
    language: "python"
  }
];

export const ENTREGAS_DATA = [
  {
    id: "sub_001",
    studentId: "usr_101",
    instructorId: "ins_1",
    courseId: "course-java-spring",
    exerciseId: "ex_101",
    code: "package com.mycode.demo;\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n        System.out.println(\"⚡ MyCode Spring Core Inicializado!\");\n    }\n}",
    language: "java",
    attemptNumber: 1,
    submittedAt: "2026-08-15T12:00:00Z",
    status: "approved",
    score: 100,
    feedback: "¡Excelente! Has configurado la aplicación Spring Boot correctamente.",
    reviewedAt: "2026-08-15T12:30:00Z",
    reviewedBy: "Carlos Mendoza"
  }
];

// Usuarios simulados para validación de roles
export const USERS_DB = [
  INITIAL_USER, // role: student
  {
    id: "usr_admin",
    name: "Admin System",
    email: "admin@mycode.pro",
    role: "admin",
    plan: "Oro",
    avatar: "/avatars/cyber_lion.svg",
    avatarId: "avatar-8"
  },
  {
    id: "ins_1",
    name: "Carlos Mendoza",
    email: "carlos@mycode.pro",
    role: "instructor",
    plan: "Oro",
    avatar: "/avatars/cyber_wolf.svg",
    avatarId: "avatar-3"
  }
];
// Notifications Mock Data
export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    userId: "usr_101",
    type: "success",
    title: "¡Solución Aprobada!",
    titleEn: "Solution Approved!",
    message: "Tu entrega en 'Hello World en Spring Boot' ha sido calificada con 100/100.",
    messageEn: "Your submission for 'Hello World in Spring Boot' scored 100/100.",
    date: "2026-08-16 09:30",
    read: false,
    link: "/instructor/dashboard"
  },
  {
    id: "notif-2",
    userId: "usr_101",
    type: "warning",
    title: "Ejercicios Pendientes",
    titleEn: "Pending Exercises",
    message: "Tienes un reto práctico disponible en 'Machine Learning con Python'.",
    messageEn: "You have a practical challenge available in 'Machine Learning with Python'.",
    date: "2026-08-15 18:00",
    read: false,
    link: "/exercises/ex_201"
  },
  {
    id: "notif-3",
    userId: "usr_101",
    type: "info",
    title: "Bono de Racha Activo",
    titleEn: "Streak Bonus Active",
    message: "¡Llevas 5 días consecutivos aprendiendo! Mantén tu racha hoy.",
    messageEn: "5 consecutive learning days! Keep up your streak today.",
    date: "2026-08-15 12:00",
    read: true,
    link: "/dashboard"
  }
];

// Achievements System Definitions
export const ACHIEVEMENTS_DATA = [
  {
    id: "ach-1",
    title: "Primer Código",
    titleEn: "First Code",
    desc: "Ejecutaste tu primer programa en el Sandbox.",
    descEn: "Executed your first program in the Sandbox.",
    icon: "Code2",
    color: "#06B6D4",
    requiredXP: 50,
    checkUnlocked: (user, txs, progress) => (txs || []).some(t => t.tipo === 'Consumo' || t.tipo === 'Consumo Sandbox') || (user?.experienciaXP || 0) >= 50
  },
  {
    id: "ach-2",
    title: "Racha de Fuego",
    titleEn: "Fire Streak",
    desc: "Alcanzaste 5 días consecutivos de estudio.",
    descEn: "Reached 5 consecutive days of learning.",
    icon: "Flame",
    color: "#F59E0B",
    requiredXP: 200,
    checkUnlocked: (user) => (user?.diasRacha || 0) >= 5
  },
  {
    id: "ach-3",
    title: "Explorador Audiovisual",
    titleEn: "Media Explorer",
    desc: "Completaste tu primera lección en video sincronizado.",
    descEn: "Completed your first synchronized video lesson.",
    icon: "BookOpen",
    color: "#8B5CF6",
    requiredXP: 100,
    checkUnlocked: (user, txs, progressMap) => Object.values(progressMap || {}).some(p => p.completed)
  },
  {
    id: "ach-4",
    title: "Desafío Resuelto",
    titleEn: "Challenge Solved",
    desc: "Enviaste tu primer ejercicio práctico al instructor.",
    descEn: "Submitted your first coding challenge to the instructor.",
    icon: "CheckCircle2",
    color: "#10B981",
    requiredXP: 300,
    checkUnlocked: (user, txs, progress, subs) => (subs || []).length > 0
  },
  {
    id: "ach-5",
    title: "Maestro Políglota",
    titleEn: "Polyglot Master",
    desc: "Probaste Python y Java en el Sandbox de MyCode.",
    descEn: "Tested both Python and Java in the MyCode Sandbox.",
    icon: "Sparkles",
    color: "#EC4899",
    requiredXP: 500,
    checkUnlocked: (user, txs) => (user?.experienciaXP || 0) >= 500
  },
  {
    id: "ach-6",
    title: "Arquitecto Pro",
    titleEn: "Pro Architect",
    desc: "Alcanzaste más de 1,000 puntos de experiencia XP.",
    descEn: "Reached over 1,000 XP points.",
    icon: "Award",
    color: "#FFD700",
    requiredXP: 1000,
    checkUnlocked: (user) => (user?.experienciaXP || 0) >= 1000
  }
];
