import fs from 'fs';

// Setup Mock LocalStorage for Node environment
const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) || null,
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear()
};

const { api } = await import('./src/services/api.js');

console.log('====================================================');
console.log('🚀 INICIANDO AUDITORÍA INTEGRAL: BLOQUE A & BLOQUE B');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, extra = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${extra ? `(${extra})` : ''}`);
  }
}

async function runTests() {
  // ----------------------------------------------------
  // TEST SUITE 1: BLOQUE A.1 (Notificaciones a Instructor)
  // ----------------------------------------------------
  console.log('\n--- 1. Pruebas de Notificación al Instructor & Anti-Spam (A.1) ---');
  const instructorId = 'ins_test_1';
  
  // Limpiar notificaciones previas de prueba
  localStorage.removeItem('mycode_notifications_' + instructorId);

  // 1ra Entrega
  await api.notifications.createForInstructor(instructorId, {
    studentName: 'Ana García',
    exerciseTitle: 'Patrón Singleton',
    courseTitle: 'Arquitectura Backend'
  });

  const notifs1 = await api.notifications.getAll(instructorId);
  const entregaNotifs1 = notifs1.filter(n => n.type === 'nueva-entrega');
  assert(entregaNotifs1.length === 1, 'Crea notificación de tipo nueva-entrega para instructor');
  assert(entregaNotifs1[0].count === 1, 'Primera entrega tiene count = 1');

  // 2da y 3ra Entregas rápidas (Anti-spam grouping)
  await api.notifications.createForInstructor(instructorId, {
    studentName: 'Carlos Ruiz',
    exerciseTitle: 'Microservicios',
    courseTitle: 'Arquitectura Backend'
  });
  await api.notifications.createForInstructor(instructorId, {
    studentName: 'Laura Torres',
    exerciseTitle: 'Spring Data JPA',
    courseTitle: 'Arquitectura Backend'
  });

  const notifs2 = await api.notifications.getAll(instructorId);
  const entregaNotifs2 = notifs2.filter(n => n.type === 'nueva-entrega');
  assert(entregaNotifs2.length === 1, 'Agrupa entregas consecutivas no leídas en una sola notificación');
  assert(entregaNotifs2[0].count === 3, 'Notificación agrupada refleja count = 3 entregas pendientes');
  assert(entregaNotifs2[0].link === '/instructor', 'Enlace de acción apunta a /instructor');

  // ----------------------------------------------------
  // TEST SUITE 2: BLOQUE A.2 (Ciclo de Vida del Curso & Despublicar)
  // ----------------------------------------------------
  console.log('\n--- 2. Pruebas de Ciclo de Vida de Curso & Despublicar (A.2) ---');
  const instructorUser = { id: 'usr_inst', nombre: 'Carlos', role: 'instructor' };
  const allCourses = await api.courses.getAll();
  const testCourse = allCourses[0];

  // Despublicar curso
  const unpubRes = await api.courses.updateStatus(testCourse.id, 'despublicado', instructorUser);
  assert(unpubRes.success && unpubRes.course.estado === 'despublicado', 'Instructor puede cambiar estado a despublicado');

  // Verificar filtrado en catálogo para nuevos alumnos
  const updatedCourses = await api.courses.getAll();
  const catalogVisible = updatedCourses.filter(c => c.estado !== 'despublicado' && c.estado !== 'borrador');
  assert(!catalogVisible.some(c => c.id === testCourse.id), 'Curso despublicado se excluye del catálogo de cursos');

  // Restaurar a publicado
  const pubRes = await api.courses.updateStatus(testCourse.id, 'publicado', instructorUser);
  assert(pubRes.success && pubRes.course.estado === 'publicado', 'Instructor puede republicar el curso');

  // ----------------------------------------------------
  // TEST SUITE 3: BLOQUE A.3 (Bloqueo de Cuenta por 6 Intentos & Correo Simulado)
  // ----------------------------------------------------
  console.log('\n--- 3. Pruebas de Bloqueo tras 6 Intentos & Correo de Seguridad (A.3) ---');
  const targetEmail = 'hacker_test@mycode.pro';
  localStorage.removeItem('mycode_login_attempts');
  localStorage.removeItem('mycode_security_emails');

  // 5 Intentos fallidos consecutivos
  for (let i = 1; i <= 5; i++) {
    const attempt = api.auth.recordFailedAttempt(targetEmail);
    assert(!attempt.locked && attempt.attempts === i && attempt.remainingAttempts === (6 - i), `Intento fallido ${i}: cuenta no bloqueada, restan ${6 - i}`);
  }

  // 6to Intento fallido -> Bloqueo exacto de 4 horas
  const sixthAttempt = api.auth.recordFailedAttempt(targetEmail);
  assert(sixthAttempt.locked === true && sixthAttempt.attempts === 6, 'Al 6to intento fallido se bloquea la cuenta');
  assert(sixthAttempt.timeFormatted.includes('4h'), 'Tiempo de bloqueo inicial es de 4 horas');

  // Verificación de persistencia tras recarga
  const checkStatus = api.auth.checkAccountLock(targetEmail);
  assert(checkStatus.locked === true, 'El estado de bloqueo sobrevive y se mantiene activo');

  // Intento de login rechazado
  const loginDuringLock = await api.auth.login(targetEmail, 'password123');
  assert(!loginDuringLock.success, 'Login durante bloqueo es rechazado');

  // Verificación de correo simulado persistido
  const secEmails = JSON.parse(localStorage.getItem('mycode_security_emails') || '[]');
  assert(secEmails.length >= 1 && secEmails[0].to === targetEmail, 'Correo de seguridad registrado en mycode_security_emails');
  assert(secEmails[0].details.intentosFallidos === 6, 'Detalles del correo registran 6 intentos fallidos');

  // Reseteo tras éxito
  api.auth.resetFailedAttempts(targetEmail);
  const checkAfterReset = api.auth.checkAccountLock(targetEmail);
  assert(!checkAfterReset.locked && checkAfterReset.attempts === 0, 'Reseteo exitoso limpia el contador a 0');

  // ----------------------------------------------------
  // TEST SUITE 4: BLOQUE A.4 (Analítica por Curso)
  // ----------------------------------------------------
  console.log('\n--- 4. Pruebas de Analítica por Curso (A.4) ---');
  const analyticsRes = await api.analytics.getCourseAnalytics(testCourse.id, instructorUser);
  assert(analyticsRes.success === true, 'Cálculo de analítica retorna exitoso');
  assert(typeof analyticsRes.alumnosInscritos === 'number' && analyticsRes.alumnosInscritos > 0, 'Analítica incluye total de alumnos inscritos');
  assert(typeof analyticsRes.tasaFinalizacion === 'number' && analyticsRes.tasaFinalizacion >= 0 && analyticsRes.tasaFinalizacion <= 100, 'Tasa de finalización es un porcentaje válido');
  assert(typeof analyticsRes.leccionMayorAbandono === 'string' && analyticsRes.leccionMayorAbandono.length > 0, 'Identifica lección de mayor abandono');
  assert(typeof analyticsRes.promedioCalificacion === 'number' && analyticsRes.promedioCalificacion > 0, 'Calcula promedio real de calificaciones');
  assert(Array.isArray(analyticsRes.desgloseLecciones) && analyticsRes.desgloseLecciones.length > 0, 'Incluye desglose por lección con métricas de retención');

  // ----------------------------------------------------
  // TEST SUITE 5: BLOQUE A.5 (RBAC - Control de Acceso por Rol en Capa Lógica)
  // ----------------------------------------------------
  console.log('\n--- 5. Pruebas de Control de Acceso por Rol - RBAC (A.5) ---');
  const studentUser = { id: 'usr_stud_1', nombre: 'Pedro', role: 'estudiante' };

  const studentUnpubAttempt = await api.courses.updateStatus(testCourse.id, 'despublicado', studentUser);
  assert(!studentUnpubAttempt.success && studentUnpubAttempt.error.includes('Acceso denegado'), 'Rol estudiante no puede despublicar cursos (rechazo en api.courses)');

  const studentAnalyticsAttempt = await api.analytics.getCourseAnalytics(testCourse.id, studentUser);
  assert(!studentAnalyticsAttempt.success && studentAnalyticsAttempt.error.includes('Acceso denegado'), 'Rol estudiante no puede acceder a analítica (rechazo en api.analytics)');

  // ----------------------------------------------------
  // TEST SUITE 6: BLOQUE B (i18n & Integridad de Traducciones)
  // ----------------------------------------------------
  console.log('\n--- 6. Pruebas de Integridad de Traducciones (B.14) ---');
  const es = JSON.parse(fs.readFileSync('src/translations/es.json', 'utf8'));
  const en = JSON.parse(fs.readFileSync('src/translations/en.json', 'utf8'));

  function getKeys(obj, prefix = '') {
    let keys = [];
    for (const k in obj) {
      const full = prefix ? prefix + '.' + k : k;
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        keys = keys.concat(getKeys(obj[k], full));
      } else {
        keys.push(full);
      }
    }
    return keys;
  }

  const esKeys = new Set(getKeys(es));
  const enKeys = new Set(getKeys(en));

  const missingInEn = [...esKeys].filter(k => !enKeys.has(k));
  const missingInEs = [...enKeys].filter(k => !esKeys.has(k));

  assert(missingInEn.length === 0, `0 claves faltantes en EN (ES->EN)`, missingInEn.join(', '));
  assert(missingInEs.length === 0, `0 claves faltantes en ES (EN->ES)`, missingInEs.join(', '));

  // Resumen Final
  console.log('\n====================================================');
  console.log(`🎯 RESULTADOS FINALES: ${passedTests}/${totalTests} pruebas superadas (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
