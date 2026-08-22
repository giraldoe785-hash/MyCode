// API service layer with reactive localStorage synchronization
import { INITIAL_USER, INITIAL_TRANSACTIONS, COURSES_DATA, LIVE_STREAMS, PLANS_DATA, TOKEN_COSTS, TOKEN_PACKAGES, EJERCICIOS_DATA, ENTREGAS_DATA, USERS_DB, SAMPLE_VIDEOS, INITIAL_NOTIFICATIONS, ACHIEVEMENTS_DATA, INITIAL_ENROLLMENTS, INITIAL_ATTEMPTS, INITIAL_ANNOUNCEMENTS, INITIAL_ACTIVITY } from './mockData.js';
import { ExecutionService } from './execution/ExecutionService.js';

const delay = (ms = 120) => new Promise(res => setTimeout(res, ms));

const memoryStore = {};

const getStored = (key, fallback) => {
  try {
    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    }
    return memoryStore[key] !== undefined ? memoryStore[key] : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(val));
    }
    memoryStore[key] = val;
  } catch (e) {
    console.error('Storage error:', e);
  }
};
export const api = {
  // --- Auth Service ---
  auth: {
    async getCurrentUser() {
      await delay(80);
      return getStored('mycode_user', INITIAL_USER);
    },

        // --- Failed Login Attempts & 4-Hour Lockout System (A.3) ---
    getLoginAttempts(email = "") {
      const all = getStored("mycode_login_attempts", {});
      const normalized = (email || "").toLowerCase().trim();
      return all[normalized] || { attempts: 0, lockedUntil: null };
    },

    saveLoginAttempts(email, data) {
      const all = getStored("mycode_login_attempts", {});
      const normalized = (email || "").toLowerCase().trim();
      all[normalized] = data;
      setStored("mycode_login_attempts", all);
      return data;
    },

    checkAccountLock(email) {
      const record = this.getLoginAttempts(email);
      if (record.lockedUntil) {
        const now = Date.now();
        if (record.lockedUntil > now) {
          const remainingMs = record.lockedUntil - now;
          const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
          const hours = Math.floor(remainingMinutes / 60);
          const mins = remainingMinutes % 60;
          const timeFormatted = hours > 0 ? (hours + "h " + mins + "m") : (mins + "m");
          return {
            locked: true,
            attempts: record.attempts,
            remainingMs,
            remainingMinutes,
            timeFormatted,
            lockedUntil: record.lockedUntil
          };
        } else {
          this.saveLoginAttempts(email, { attempts: 0, lockedUntil: null });
        }
      }
      return { locked: false, attempts: record.attempts || 0 };
    },

    recordFailedAttempt(email) {
      const record = this.getLoginAttempts(email);
      const newAttempts = (record.attempts || 0) + 1;
      if (newAttempts >= 6) {
        const lockedUntil = Date.now() + (4 * 60 * 60 * 1000);
        this.saveLoginAttempts(email, { attempts: newAttempts, lockedUntil });
        api.notifications.simulateSecurityEmail(email, {
          evento: "bloqueo-por-intentos",
          timestamp: new Date().toISOString(),
          intentosFallidos: newAttempts,
          duracionBloqueo: "4 horas"
        });
        return {
          locked: true,
          attempts: newAttempts,
          remainingAttempts: 0,
          lockedUntil,
          timeFormatted: "4h 0m"
        };
      } else {
        this.saveLoginAttempts(email, { attempts: newAttempts, lockedUntil: null });
        return {
          locked: false,
          attempts: newAttempts,
          remainingAttempts: 6 - newAttempts
        };
      }
    },

    resetFailedAttempts(email) {
      this.saveLoginAttempts(email, { attempts: 0, lockedUntil: null });
    },
    async login(email, password, rememberMe = true) {
      const lock = this.checkAccountLock(email);
      if (lock.locked) {
        return { success: false, error: "Cuenta bloqueada por seguridad. Intenta de nuevo en " + lock.timeFormatted, locked: true, timeFormatted: lock.timeFormatted };
      }
      await delay(250);
      const registeredUsers = getStored('mycode_registered_users', []);
      const userFound = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) ||
                        USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
        id: "usr_" + Date.now(),
        nombre: email.split("@")[0],
        email: email,
        role: "student",
        rol: "Estudiante",
        plan: "Bronce",
        avatar: "/avatars/cyber_fox.svg",
        avatarId: "avatar-1"
      };

      if (password && password.length >= 6) {
        if (rememberMe) {
          setStored('mycode_user', userFound);
          setStored('mycode_is_auth', true);
        }
        return { success: true, user: userFound };
      }
      return { success: false, error: 'Credenciales inválidas. Compruebe el correo y contraseña.' };
    },

    async register(userData) {
      await delay(300);
      const isInstructor = userData.rol === 'Instructor' || userData.role === 'instructor';
      const newUser = {
        id: 'usr_' + Date.now(),
        nombre: userData.nombre || 'Nuevo Desarrollador',
        email: userData.email,
        role: isInstructor ? 'instructor' : 'student',
        rol: userData.rol || (isInstructor ? 'Instructor' : 'Estudiante'),
        plan: 'Bronce',
        nivel: isInstructor ? 'Docente Tech' : 'Nivel 1 - Principiante',
        avatar: userData.avatar || '/avatars/cyber_fox.svg',
        avatarId: userData.avatarId || 'avatar-1',
        biografia: isInstructor ? 'Instructor de desarrollo de software y nuevas tecnologías.' : 'Nuevo miembro entusiasta en MyCode Pro.',
        fechaRegistro: new Date().toISOString().split('T')[0],
        experienciaXP: isInstructor ? 500 : 50,
        diasRacha: 1
      };
      
      const registeredUsers = getStored('mycode_registered_users', []);
      const filtered = registeredUsers.filter(u => u.email.toLowerCase() !== newUser.email.toLowerCase());
      setStored('mycode_registered_users', [...filtered, newUser]);

      setStored('mycode_user', newUser);
      setStored('mycode_is_auth', true);
      setStored('mycode_tokens', 50);

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
      await delay(80);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('mycode_is_auth');
      }
      return { success: true };
    },

    async updateProfile(updates) {
      await delay(150);
      const current = getStored('mycode_user', INITIAL_USER);
      const updated = { ...current, ...updates };
      setStored('mycode_user', updated);
      return { success: true, user: updated };
    }
  },

  // --- Users & Profile Service ---
  users: {
    async updateAvatar(userId, avatarData) {
      await delay(150);
      const current = getStored('mycode_user', INITIAL_USER);
      const avatarUrl = typeof avatarData === 'string' ? avatarData : avatarData.url;
      const avatarId = typeof avatarData === 'object' ? avatarData.id : null;
      const updated = {
        ...current,
        avatar: avatarUrl,
        avatarId: avatarId
      };
      setStored('mycode_user', updated);
      return { success: true, user: updated };
    },

    async changePassword(currentPassword, newPassword) {
      await delay(200);
      return { success: true, message: 'Contraseña actualizada correctamente.' };
    }
  },

  // --- Courses & CMS Service ---
  courses: {
    async getAll() {
      await delay(100);
      return getStored('mycode_courses', COURSES_DATA);
    },

    async getById(id) {
      await delay(80);
      const courses = getStored('mycode_courses', COURSES_DATA);
      return courses.find(c => c.id === id) || null;
    },

    async createCourse(courseData, user) {
      await delay(200);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const newCourse = {
        id: 'course_' + Date.now(),
        titulo: courseData.titulo || 'Nuevo Curso',
        tituloEn: courseData.tituloEn || courseData.titulo || 'New Course',
        subtitulo: courseData.subtitulo || courseData.descripcionCorta || '',
        subtituloEn: courseData.subtituloEn || courseData.descripcionCorta || '',
        descripcionLarga: courseData.descripcionLarga || '',
        instructor: user?.nombre || user?.name || 'Instructor MyCode',
        instructorId: user?.id || 'ins_1',
        instructorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        instructorBio: user?.biografia || 'Instructor profesional en MyCode Pro',
        miniatura: courseData.miniatura || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
        trailerUrl: courseData.trailerUrl || SAMPLE_VIDEOS.TRAILER,
        costoTokens: parseInt(courseData.costoTokens, 10) || 0,
        lenguaje: courseData.lenguaje || 'Python',
        nivel: courseData.nivel || 'Básico',
        formato: 'Grabado',
        duracionTotal: '0h 0m',
        totalLecciones: 0,
        estudiantes: 0,
        valoracion: 5.0,
        desbloqueado: true,
        prerrequisitos: courseData.prerrequisitos || ['Ganas de aprender y programar'],
        secciones: []
      };

      const updated = [newCourse, ...courses];
      setStored('mycode_courses', updated);
      return { success: true, course: newCourse };
    },

    async updateCourse(courseId, updates) {
      await delay(150);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const idx = courses.findIndex(c => c.id === courseId);
      if (idx === -1) return { success: false, error: 'Curso no encontrado' };

      courses[idx] = { ...courses[idx], ...updates };
      setStored('mycode_courses', courses);
      return { success: true, course: courses[idx] };
    },

    
    async updateStatus(courseId, newStatus, user) {
      await delay(120);
      // Control de acceso RBAC por rol
      if (user && user.role !== 'instructor' && user.role !== 'admin') {
        return { success: false, error: 'Acceso denegado: Se requiere rol de instructor o administrador.' };
      }

      const courses = getStored('mycode_courses', COURSES_DATA);
      const idx = courses.findIndex(c => c.id === courseId);
      if (idx === -1) return { success: false, error: 'Curso no encontrado' };

      courses[idx] = { ...courses[idx], estado: newStatus };
      setStored('mycode_courses', courses);
      return { success: true, course: courses[idx] };
    },

    async deleteCourse(courseId) {
      await delay(150);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const filtered = courses.filter(c => c.id !== courseId);
      setStored('mycode_courses', filtered);
      return { success: true };
    },

    async addSection(courseId, sectionData) {
      await delay(150);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const idx = courses.findIndex(c => c.id === courseId);
      if (idx === -1) return { success: false, error: 'Curso no encontrado' };

      const course = courses[idx];
      const newSection = {
        id: 'sec_' + Date.now(),
        titulo: sectionData.titulo || `Módulo ${(course.secciones || []).length + 1}`,
        orden: (course.secciones || []).length + 1,
        lecciones: []
      };

      course.secciones = [...(course.secciones || []), newSection];
      courses[idx] = course;
      setStored('mycode_courses', courses);
      return { success: true, section: newSection, course };
    },

    async updateSection(courseId, sectionId, updates) {
      await delay(120);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const cIdx = courses.findIndex(c => c.id === courseId);
      if (cIdx === -1) return { success: false, error: 'Curso no encontrado' };

      const course = courses[cIdx];
      course.secciones = (course.secciones || []).map(s => s.id === sectionId ? { ...s, ...updates } : s);
      courses[cIdx] = course;
      setStored('mycode_courses', courses);
      return { success: true, course };
    },

    async deleteSection(courseId, sectionId) {
      await delay(120);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const cIdx = courses.findIndex(c => c.id === courseId);
      if (cIdx === -1) return { success: false, error: 'Curso no encontrado' };

      const course = courses[cIdx];
      course.secciones = (course.secciones || []).filter(s => s.id !== sectionId);
      courses[cIdx] = course;
      setStored('mycode_courses', courses);
      return { success: true, course };
    },

    async reorderSections(courseId, newSections) {
      await delay(100);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const cIdx = courses.findIndex(c => c.id === courseId);
      if (cIdx === -1) return { success: false, error: 'Curso no encontrado' };

      courses[cIdx].secciones = newSections;
      setStored('mycode_courses', courses);
      return { success: true, course: courses[cIdx] };
    },

    async addLesson(courseId, sectionId, lessonData) {
      await delay(180);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const cIdx = courses.findIndex(c => c.id === courseId);
      if (cIdx === -1) return { success: false, error: 'Curso no encontrado' };

      const course = courses[cIdx];
      const sIdx = (course.secciones || []).findIndex(s => s.id === sectionId);
      if (sIdx === -1) return { success: false, error: 'Sección no encontrada' };

      const durSecs = parseInt(lessonData.duracionSegundos, 10) || 300;
      const mins = Math.floor(durSecs / 60).toString().padStart(2, '0');
      const secs = (durSecs % 60).toString().padStart(2, '0');

      const newLesson = {
        id: 'les_' + Date.now(),
        titulo: lessonData.titulo || 'Nueva Lección',
        duracionSegundos: durSecs,
        duracionFormato: `${mins}:${secs}`,
        tipoOrigen: lessonData.tipoOrigen || 'url', // 'url' | 'archivo-local'
        videoUrl: lessonData.videoUrl || SAMPLE_VIDEOS.LESSON_1,
        bloqueada: !lessonData.esVistaPrevia,
        esVistaPrevia: Boolean(lessonData.esVistaPrevia),
        completada: false,
        progresoSegundos: 0,
        resumen: lessonData.resumen || '',
        codigoMuestra: lessonData.codigoMuestra || '',
        recursos: lessonData.recursos || []
      };

      course.secciones[sIdx].lecciones = [...(course.secciones[sIdx].lecciones || []), newLesson];
      course.totalLecciones = course.secciones.reduce((acc, sec) => acc + (sec.lecciones?.length || 0), 0);
      courses[cIdx] = course;
      setStored('mycode_courses', courses);
      return { success: true, lesson: newLesson, course };
    },

    async updateLesson(courseId, sectionId, lessonId, updates) {
      await delay(150);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const cIdx = courses.findIndex(c => c.id === courseId);
      if (cIdx === -1) return { success: false, error: 'Curso no encontrado' };

      const course = courses[cIdx];
      const sIdx = (course.secciones || []).findIndex(s => s.id === sectionId);
      if (sIdx === -1) return { success: false, error: 'Sección no encontrada' };

      course.secciones[sIdx].lecciones = (course.secciones[sIdx].lecciones || []).map(l =>
        l.id === lessonId ? { ...l, ...updates } : l
      );
      courses[cIdx] = course;
      setStored('mycode_courses', courses);
      return { success: true, course };
    },

    async deleteLesson(courseId, sectionId, lessonId) {
      await delay(120);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const cIdx = courses.findIndex(c => c.id === courseId);
      if (cIdx === -1) return { success: false, error: 'Curso no encontrado' };

      const course = courses[cIdx];
      const sIdx = (course.secciones || []).findIndex(s => s.id === sectionId);
      if (sIdx === -1) return { success: false, error: 'Sección no encontrada' };

      course.secciones[sIdx].lecciones = (course.secciones[sIdx].lecciones || []).filter(l => l.id !== lessonId);
      course.totalLecciones = course.secciones.reduce((acc, sec) => acc + (sec.lecciones?.length || 0), 0);
      courses[cIdx] = course;
      setStored('mycode_courses', courses);
      return { success: true, course };
    },

    async unlockCourse(courseId) {
      await delay(200);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const course = courses.find(c => c.id === courseId);
      if (!course) return { success: false, error: 'Curso no encontrado' };

      const updatedCourses = courses.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            desbloqueado: true,
            secciones: (c.secciones || []).map(sec => ({
              ...sec,
              lecciones: (sec.lecciones || []).map(les => ({ ...les, bloqueada: false }))
            }))
          };
        }
        return c;
      });

      setStored('mycode_courses', updatedCourses);
      return { success: true, course: updatedCourses.find(c => c.id === courseId) };
    },

    async unlockLesson(courseId, lessonId) {
      await delay(150);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const updatedCourses = courses.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            secciones: (c.secciones || []).map(sec => ({
              ...sec,
              lecciones: (sec.lecciones || []).map(les => les.id === lessonId ? { ...les, bloqueada: false } : les)
            }))
          };
        }
        return c;
      });
      setStored('mycode_courses', updatedCourses);
      return { success: true };
    }
  },

  // --- Exercises & Submissions Service ---
  exercises: {
    async getAll() {
      await delay(100);
      return getStored('mycode_exercises', EJERCICIOS_DATA);
    },

    async getExercisesForCourse(courseId) {
      await delay(100);
      const all = getStored('mycode_exercises', EJERCICIOS_DATA);
      return all.filter(e => e.courseId === courseId || e.cursoId === courseId);
    },

    async getExercisesForInstructor(instructorId) {
      await delay(120);
      const all = getStored('mycode_exercises', EJERCICIOS_DATA);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const myCourseIds = courses.filter(c => c.instructorId === instructorId || c.instructor === "Carlos Mendoza").map(c => c.id);
      return all.filter(e => e.instructorId === instructorId || myCourseIds.includes(e.courseId || e.cursoId));
    },

    async getExerciseById(id) {
      await delay(80);
      const all = getStored('mycode_exercises', EJERCICIOS_DATA);
      return all.find(e => e.id === id);
    },

    async createExercise(exerciseData, user) {
      await delay(200);
      const all = getStored('mycode_exercises', EJERCICIOS_DATA);
      const newEx = {
        id: 'ex_' + Date.now(),
        courseId: exerciseData.cursoId || exerciseData.courseId,
        cursoId: exerciseData.cursoId || exerciseData.courseId,
        moduleId: exerciseData.seccionId || exerciseData.moduleId || '',
        seccionId: exerciseData.seccionId || exerciseData.moduleId || '',
        lessonId: exerciseData.lessonId || '',
        instructorId: user?.id || 'ins_1',
        status: 'published',
        titulo: exerciseData.titulo || 'Nuevo Ejercicio',
        tituloEn: exerciseData.tituloEn || exerciseData.titulo || 'New Exercise',
        content: exerciseData.enunciado || exerciseData.content || '',
        enunciado: exerciseData.enunciado || exerciseData.content || '',
        initialCode: exerciseData.codigoInicial || exerciseData.initialCode || '',
        codigoInicial: exerciseData.codigoInicial || exerciseData.initialCode || '',
        solucionReferencia: exerciseData.solucionReferencia || '',
        criterios: exerciseData.criterios || '',
        language: (exerciseData.lenguaje || exerciseData.language || 'python').toLowerCase(),
        lenguaje: exerciseData.lenguaje || 'Python',
        fechaCreacion: new Date().toISOString()
      };

      const updated = [newEx, ...all];
      setStored('mycode_exercises', updated);
      return { success: true, exercise: newEx };
    },

    async updateExercise(exerciseId, updates) {
      await delay(150);
      const all = getStored('mycode_exercises', EJERCICIOS_DATA);
      const idx = all.findIndex(e => e.id === exerciseId);
      if (idx === -1) return { success: false, error: 'Ejercicio no encontrado' };

      all[idx] = { ...all[idx], ...updates };
      setStored('mycode_exercises', all);
      return { success: true, exercise: all[idx] };
    },

    async deleteExercise(exerciseId) {
      await delay(120);
      const all = getStored('mycode_exercises', EJERCICIOS_DATA);
      const filtered = all.filter(e => e.id !== exerciseId);
      setStored('mycode_exercises', filtered);
      return { success: true };
    }
  },

  submissions: {
    async submitExercise(submissionData) {
      await delay(200);
      const subs = getStored('mycode_submissions', ENTREGAS_DATA);
      const existingIdx = subs.findIndex(s => s.studentId === submissionData.studentId && s.exerciseId === submissionData.exerciseId);
      
      const newSub = {
        id: 'sub_' + Date.now(),
        ...submissionData,
        attemptNumber: existingIdx >= 0 ? subs[existingIdx].attemptNumber + 1 : 1,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        score: null,
        feedback: null
      };

      if (existingIdx >= 0) {
        subs[existingIdx] = newSub;
      } else {
        subs.push(newSub);
      }
      setStored('mycode_submissions', subs);

      // Notificar al instructor dueño del curso/ejercicio automáticamente
      const courses = getStored('mycode_courses', COURSES_DATA);
      const exCourse = courses.find(c => c.id === submissionData.courseId);
      const instructorId = submissionData.instructorId || exCourse?.instructorId || 'ins_1';
      
      await api.notifications.createForInstructor(instructorId, {
        studentName: submissionData.studentName || 'Estudiante',
        exerciseTitle: submissionData.exerciseTitle || 'Ejercicio Práctico',
        courseTitle: exCourse?.titulo || 'Curso MyCode'
      });

      return { success: true, submission: newSub };
    },

    async getSubmissionsByStudent(studentId) {
      await delay(80);
      const subs = getStored('mycode_submissions', ENTREGAS_DATA);
      return subs.filter(s => s.studentId === studentId);
    },

    async getSubmissionsForInstructor(instructorId) {
      await delay(150);
      const courses = getStored('mycode_courses', COURSES_DATA);
      const instructorCourseIds = courses.filter(c => c.instructorId === instructorId || c.instructor === "Carlos Mendoza").map(c => c.id);
      
      const subs = getStored('mycode_submissions', ENTREGAS_DATA);
      return subs.filter(s => instructorCourseIds.includes(s.courseId) || s.instructorId === instructorId);
    },
    
    async reviewSubmission(subId, score, feedback, status) {
      await delay(180);
      const subs = getStored('mycode_submissions', ENTREGAS_DATA);
      const idx = subs.findIndex(s => s.id === subId);
      if (idx === -1) return { success: false, error: 'Entrega no encontrada' };
      
      subs[idx] = {
        ...subs[idx],
        score,
        feedback,
        status,
        reviewedAt: new Date().toISOString()
      };
      setStored('mycode_submissions', subs);
      return { success: true, submission: subs[idx] };
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
  tokens: {
    async getPackages() {
      await delay(50);
      return TOKEN_PACKAGES;
    }
  },
  wallet: {
    getTokenPackages() {
      return TOKEN_PACKAGES;
    },
    validateBalanceIntegrity() {
      const current = getStored('mycode_tokens', 48);
      if (typeof current !== 'number' || isNaN(current) || current < 0) {
        setStored('mycode_tokens', 0);
        return 0;
      }
      return current;
    },

    async getBalance() {
      await delay(50);
      return this.validateBalanceIntegrity();
    },

    async getTransactions() {
      await delay(80);
      return getStored('mycode_transactions', INITIAL_TRANSACTIONS);
    },

    async consumeTokens(amount, concept, isCompiling = false) {
      await delay(120);
      if (!isCompiling) {
        return { success: true, consumed: false, newBalance: this.validateBalanceIntegrity() };
      }

      this.validateBalanceIntegrity();
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
        tipo: 'Consumo',
        descripcion: concept,
        cambio: -amount,
        saldoRestante: newBalance,
        estado: 'completado'
      };
      setStored('mycode_transactions', [newTx, ...txs]);
      return { success: true, newBalance, transaction: newTx, consumed: true };
    },
    
    async deductTokens(amount, description, type = 'Consumo') {
       return this.consumeTokens(amount, description, true);
    },

    async addTokens(amount, description, type = 'Recarga') {
      await delay(150);
      this.validateBalanceIntegrity();
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
      await delay(250);
      const plan = PLANS_DATA.find(p => p.id === planId) || PLANS_DATA[0];
      const user = getStored('mycode_user', INITIAL_USER);
      const updatedUser = { ...user, plan: plan.nombre };
      setStored('mycode_user', updatedUser);

      this.validateBalanceIntegrity();
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
      await delay(80);
      const reminders = getStored('mycode_live_reminders', ['live-up-02']);
      const streamData = getStored('mycode_live_data', LIVE_STREAMS);
      
      const upcomingWithReminders = (streamData.upcoming || []).map(u => ({
        ...u,
        recordatorioActivo: reminders.includes(u.id)
      }));

      return {
        ...streamData,
        upcoming: upcomingWithReminders
      };
    },

    async startStream(streamData, user) {
      await delay(200);
      const current = getStored('mycode_live_data', LIVE_STREAMS);
      
      const newLive = {
        id: 'live_' + Date.now(),
        titulo: streamData.titulo || 'Transmisión en Vivo',
        tituloEn: streamData.tituloEn || streamData.titulo || 'Live Stream',
        tema: streamData.tema || streamData.descripcion || 'Sesión en vivo de desarrollo y arquitectura',
        instructor: user?.nombre || user?.name || 'Instructor MyCode',
        instructorId: user?.id || 'ins_1',
        instructorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        cursoId: streamData.cursoId || null,
        videoUrl: streamData.videoUrl || SAMPLE_VIDEOS.LIVE_RECORDING,
        streamKey: streamData.streamKey || 'live_' + Math.random().toString(36).substring(2, 14),
        rtmpUrl: 'rtmp://ingest.mycodepro.dev/live',
        estado: 'en-vivo',
        fechaHora: new Date().toISOString(),
        espectadoresSimulados: 120,
        chatSimulado: [
          { usuario: "AlexDev99", rol: "pro", mensaje: "¡Hola profe! Conectado al live.", hora: "10:00" },
          { usuario: "Carla_Frontend", rol: "student", mensaje: "¿Podemos hacer preguntas sobre el proyecto?", hora: "10:01" }
        ]
      };

      const updatedLiveData = {
        ...current,
        active: newLive
      };

      setStored('mycode_live_data', updatedLiveData);
      return { success: true, stream: newLive };
    },

    async toggleReminder(streamId) {
      const reminders = getStored('mycode_live_reminders', ['live-up-02']);
      const exists = reminders.includes(streamId);
      const updated = exists ? reminders.filter(id => id !== streamId) : [...reminders, streamId];
      setStored('mycode_live_reminders', updated);
      return { success: true, recordatorioActivo: !exists };
    }
  },

  // --- Code Execution Service (ExecutionService Dispatcher) ---
  
  // --- Favorites Service ---
  favorites: {
    async getFavorites(userId = 'usr_101') {
      await delay(50);
      return getStored('mycode_favorites_' + userId, {
        courses: [],
        lessons: []
      });
    },

    async toggleCourse(courseId, userId = 'usr_101') {
      const favs = getStored('mycode_favorites_' + userId, { courses: [], lessons: [] });
      const exists = (favs.courses || []).includes(courseId);
      const updatedCourses = exists ? favs.courses.filter(id => id !== courseId) : [...(favs.courses || []), courseId];
      const updated = { ...favs, courses: updatedCourses };
      setStored('mycode_favorites_' + userId, updated);
      return { success: true, isFavorite: !exists, favorites: updated };
    },

    async toggleLesson(lessonId, userId = 'usr_101') {
      const favs = getStored('mycode_favorites_' + userId, { courses: [], lessons: [] });
      const exists = (favs.lessons || []).includes(lessonId);
      const updatedLessons = exists ? favs.lessons.filter(id => id !== lessonId) : [...(favs.lessons || []), lessonId];
      const updated = { ...favs, lessons: updatedLessons };
      setStored('mycode_favorites_' + userId, updated);
      return { success: true, isFavorite: !exists, favorites: updated };
    }
  },

  // --- Notifications Center Service ---
  notifications: {

    // Simulación de envío de correo de seguridad (audit trail en localStorage)
    // NOTA: En un entorno de producción real, este método se comunicaría con un microservicio
    // de backend que utilice un proveedor de correo transaccional (ej. Resend, SendGrid, AWS SES).
    simulateSecurityEmail(userEmail, details = {}) {
      const emails = getStored('mycode_security_emails', []);
      const newEmail = {
        id: 'email_' + Date.now(),
        to: userEmail,
        subject: '⚠️ Alerta de Seguridad: Cuenta bloqueada temporalmente en MyCode Pro',
        body: `Hola, hemos detectado ${details.intentosFallidos || 6} intentos consecutivos de contraseña fallida en tu cuenta (${userEmail}). Por motivos de seguridad, el acceso ha sido bloqueado durante ${details.duracionBloqueo || '4 horas'}. Si no fuiste tú, te sugerimos restablecer tus credenciales.`,
        timestamp: details.timestamp || new Date().toISOString(),
        details
      };
      emails.unshift(newEmail);
      setStored('mycode_security_emails', emails);
      console.warn('[SIMULACIÓN SEGURIDAD] Correo de alerta emitido a ' + userEmail, newEmail);
      return newEmail;
    },

    async createForInstructor(instructorId, submissionData) {
      await delay(50);
      const notifs = getStored('mycode_notifications_' + instructorId, INITIAL_NOTIFICATIONS);
      
      // Anti-spam grouping: Si ya existe una notificación no leída de nueva entrega, agrupamos
      const pendingIdx = notifs.findIndex(n => n.type === 'nueva-entrega' && !n.read);
      
      if (pendingIdx >= 0) {
        const currentCount = notifs[pendingIdx].count || 1;
        const newCount = currentCount + 1;
        notifs[pendingIdx] = {
          ...notifs[pendingIdx],
          count: newCount,
          title: 'Nuevas Entregas por Calificar',
          titleEn: 'New Submissions to Grade',
          message: `Tienes ${newCount} entregas de alumnos pendientes de revisión en tus cursos.`,
          messageEn: `You have ${newCount} pending student submissions in your courses.`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          link: '/instructor'
        };
      } else {
        notifs.unshift({
          id: 'notif_inst_' + Date.now(),
          userId: instructorId,
          type: 'nueva-entrega',
          title: 'Nueva Entrega de Alumno',
          titleEn: 'New Student Submission',
          message: `${submissionData.studentName || 'Un estudiante'} envió una solución para '${submissionData.exerciseTitle || 'Ejercicio'}' en el curso '${submissionData.courseTitle || 'MyCode'}'.`,
          messageEn: `${submissionData.studentName || 'A student'} submitted a solution for '${submissionData.exerciseTitle || 'Exercise'}' in '${submissionData.courseTitle || 'Course'}'.`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          read: false,
          link: '/instructor',
          count: 1
        });
      }
      
      setStored('mycode_notifications_' + instructorId, notifs);
      return { success: true };
    },

    async getAll(userId = 'usr_101') {
      await delay(60);
      const notifs = getStored('mycode_notifications_' + userId, INITIAL_NOTIFICATIONS);
      return notifs;
    },

    async markAsRead(id, userId = 'usr_101') {
      const notifs = getStored('mycode_notifications_' + userId, INITIAL_NOTIFICATIONS);
      const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
      setStored('mycode_notifications_' + userId, updated);
      return { success: true, notifications: updated };
    },

    async markAllAsRead(userId = 'usr_101') {
      const notifs = getStored('mycode_notifications_' + userId, INITIAL_NOTIFICATIONS);
      const updated = notifs.map(n => ({ ...n, read: true }));
      setStored('mycode_notifications_' + userId, updated);
      return { success: true, notifications: updated };
    },

    async addNotification(notif, userId = 'usr_101') {
      const notifs = getStored('mycode_notifications_' + userId, INITIAL_NOTIFICATIONS);
      const newN = {
        id: 'notif_' + Date.now(),
        userId,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        read: false,
        ...notif
      };
      const updated = [newN, ...notifs];
      setStored('mycode_notifications_' + userId, updated);
      return { success: true, notification: newN };
    }
  },

  // --- Achievements & Gamification Service ---
  achievements: {
    async getAchievements(userId = 'usr_101') {
      await delay(60);
      const user = getStored('mycode_user', INITIAL_USER);
      const txs = getStored('mycode_transactions', INITIAL_TRANSACTIONS);
      const progressMap = getStored('mycode_video_progress', {});
      const subs = getStored('mycode_submissions', ENTREGAS_DATA).filter(s => s.studentId === userId);

      return ACHIEVEMENTS_DATA.map(ach => {
        const unlocked = ach.checkUnlocked ? ach.checkUnlocked(user, txs, progressMap, subs) : false;
        return {
          ...ach,
          unlocked
        };
      });
    }
  },

  
  // --- Course Analytics Service for Instructors (A.4) ---
  analytics: {
    async getCourseAnalytics(courseId, user) {
      await delay(150);
      // Control de acceso RBAC por rol
      if (user && user.role !== 'instructor' && user.role !== 'admin') {
        return { success: false, error: 'Acceso denegado: Se requiere rol de instructor o administrador.' };
      }

      const courses = getStored('mycode_courses', COURSES_DATA);
      const course = courses.find(c => c.id === courseId);
      if (!course) return { success: false, error: 'Curso no encontrado' };

      const progressMap = getStored('mycode_video_progress', {});
      const submissions = getStored('mycode_submissions', ENTREGAS_DATA).filter(s => s.courseId === courseId);

      const allLessons = (course.secciones || []).flatMap(s => s.lecciones || []);
      const totalLessonsCount = allLessons.length || 1;

      // Alumnos inscritos simulados / reales
      const baseEnrolled = course.estudiantes || 42;
      
      // Contar lecciones completadas y calcular retención por lección
      let maxDropoffLesson = allLessons[0]?.titulo || 'N/A';
      let highestDropoffCount = 0;

      const desgloseLecciones = allLessons.map((les, index) => {
        // Simulación de embudo decreciente realista basada en progreso
        const progressFactor = Math.max(0.35, 1 - (index * 0.08));
        const visualizaciones = Math.round(baseEnrolled * progressFactor);
        const completados = Math.round(visualizaciones * 0.88);
        const abandonos = baseEnrolled - visualizaciones;

        if (abandonos > highestDropoffCount && index > 0) {
          highestDropoffCount = abandonos;
          maxDropoffLesson = les.titulo;
        }

        return {
          id: les.id,
          titulo: les.titulo,
          orden: index + 1,
          duracion: les.duracionFormato || '08:00',
          visualizaciones,
          completados,
          tasaRetencion: Math.round((visualizaciones / baseEnrolled) * 100)
        };
      });

      // Calcular tasa de finalización global
      const finalLessonViews = desgloseLecciones[desgloseLecciones.length - 1]?.completados || Math.round(baseEnrolled * 0.45);
      const tasaFinalizacion = Math.round((finalLessonViews / baseEnrolled) * 100);

      // Promedio de calificaciones en entregas
      const gradedSubs = submissions.filter(s => typeof s.score === 'number');
      const promedioCalificacion = gradedSubs.length > 0
        ? Math.round(gradedSubs.reduce((acc, curr) => acc + curr.score, 0) / gradedSubs.length)
        : 92;

      return {
        success: true,
        courseId,
        courseTitle: course.titulo,
        alumnosInscritos: baseEnrolled,
        tasaFinalizacion,
        leccionMayorAbandono: maxDropoffLesson,
        promedioCalificacion,
        totalEntregas: submissions.length,
        desgloseLecciones
      };
    }
  },


  // --- Enrollments Service ---
  enrollments: {
    async getEnrollmentsByStudent(studentId = 'usr_101') {
      await delay(80);
      const list = getStored('mycode_enrollments', INITIAL_ENROLLMENTS);
      return list.filter(e => e.studentId === studentId);
    },
    async enroll(studentId, courseId) {
      await delay(150);
      const list = getStored('mycode_enrollments', INITIAL_ENROLLMENTS);
      const existing = list.find(e => e.studentId === studentId && e.courseId === courseId);
      if (existing) return { success: true, enrollment: existing };
      const newEnr = {
        id: 'enr_' + Date.now(),
        studentId,
        courseId,
        status: 'active',
        enrolledAt: new Date().toISOString(),
        completedAt: null,
        lastActivityAt: new Date().toISOString()
      };
      const updated = [newEnr, ...list];
      setStored('mycode_enrollments', updated);
      return { success: true, enrollment: newEnr };
    }
  },

  // --- Attempts Service (Drafts & Code Runs) ---
  attempts: {
    async getAttemptsByExercise(studentId, exerciseId) {
      await delay(80);
      const list = getStored('mycode_attempts', INITIAL_ATTEMPTS);
      return list.filter(a => a.studentId === studentId && a.exerciseId === exerciseId);
    },
    async getLatestAttempt(studentId, exerciseId) {
      await delay(50);
      const list = getStored('mycode_attempts', INITIAL_ATTEMPTS);
      const userAttempts = list.filter(a => a.studentId === studentId && a.exerciseId === exerciseId);
      return userAttempts.length > 0 ? userAttempts[0] : null;
    },
    async saveAttempt(attemptData) {
      await delay(100);
      const list = getStored('mycode_attempts', INITIAL_ATTEMPTS);
      const newAtt = {
        id: 'att_' + Date.now(),
        ...attemptData,
        createdAt: new Date().toISOString()
      };
      setStored('mycode_attempts', [newAtt, ...list]);
      return { success: true, attempt: newAtt };
    }
  },

  // --- Evaluations Service ---
  evaluations: {
    async getEvaluationsByStudent(studentId = 'usr_101') {
      await delay(80);
      const subs = getStored('mycode_submissions', ENTREGAS_DATA);
      return subs.filter(s => s.studentId === studentId && s.score !== null).map(s => ({
        id: 'eval_' + s.id,
        submissionId: s.id,
        exerciseId: s.exerciseId,
        courseId: s.courseId,
        score: s.score,
        grade: s.score,
        feedback: s.feedback,
        status: s.status,
        evaluatedBy: s.reviewedBy || 'Carlos Mendoza',
        evaluatedAt: s.reviewedAt || s.submittedAt
      }));
    }
  },

  // --- Announcements Service ---
  announcements: {
    async getAnnouncementsForStudent(studentId = 'usr_101') {
      await delay(80);
      return getStored('mycode_announcements', INITIAL_ANNOUNCEMENTS);
    },
    async markAsRead(announcementId) {
      const list = getStored('mycode_announcements', INITIAL_ANNOUNCEMENTS);
      const updated = list.map(a => a.id === announcementId ? { ...a, read: true } : a);
      setStored('mycode_announcements', updated);
      return { success: true };
    }
  },

  // --- Student Activity Service ---
  activity: {
    async getStudentActivity(studentId = 'usr_101') {
      await delay(80);
      return getStored('mycode_activity', INITIAL_ACTIVITY).filter(a => a.studentId === studentId);
    },
    async recordActivity(activityData) {
      const list = getStored('mycode_activity', INITIAL_ACTIVITY);
      const newAct = {
        id: 'act_' + Date.now(),
        ...activityData,
        timestamp: new Date().toISOString()
      };
      setStored('mycode_activity', [newAct, ...list]);
      return { success: true, activity: newAct };
    }
  },

  code: {
    async executeCode(code, language, callbacks) {
      const options = typeof callbacks === 'function' ? { onStatusUpdate: callbacks } : (callbacks || {});
      return await ExecutionService.execute(code, language, options);
    },
    cancelExecution() {
      return ExecutionService.cancel();
    }
  }
};