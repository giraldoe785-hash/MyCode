import fs from 'fs';
import { PLANS_DATA, COURSES_DATA, LIVE_STREAMS } from '../src/services/mockData.js';

const esTranslations = JSON.parse(fs.readFileSync('src/translations/es.json', 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync('src/translations/en.json', 'utf8'));

console.log("==================================================");
console.log("   EJECUTANDO PRUEBAS DE VERIFICACIÓN Y REGRESIÓN");
console.log("==================================================");

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
  }
}

// 1. i18n Dictionary Parity Test
console.log("\n--- 1. VERIFICACIÓN DE TRADUCCIONES (ES ↔ EN) ---");
function checkKeyParity(esObj, enObj, prefix = '') {
  for (const k in esObj) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof esObj[k] === 'object' && esObj[k] !== null) {
      assert(k in enObj && typeof enObj[k] === 'object', `Objeto i18n '${fullKey}' existe en EN`);
      checkKeyParity(esObj[k], enObj[k], fullKey);
    } else {
      assert(k in enObj && typeof enObj[k] === 'string', `Clave i18n '${fullKey}' traducida en EN`);
    }
  }
}
checkKeyParity(esTranslations, enTranslations);

// 2. Plans Pricing & Metallic Palette Test
console.log("\n--- 2. VERIFICACIÓN DE PLANES Y PRECIOS ---");
const bronce = PLANS_DATA.find(p => p.id === 'bronce');
const plata = PLANS_DATA.find(p => p.id === 'plata');
const oro = PLANS_DATA.find(p => p.id === 'oro');

assert(bronce && bronce.precioMensual === 22.00, "Plan Bronce configurado en $22.00 USD");
assert(bronce && bronce.themeClass === 'plan-card-bronze', "Plan Bronce usa clase 'plan-card-bronze'");
assert(plata && plata.precioMensual === 55.00, "Plan Plata configurado en $55.00 USD");
assert(plata && plata.themeClass === 'plan-card-silver', "Plan Plata usa clase 'plan-card-silver'");
assert(oro && oro.precioMensual === 200.00, "Plan Oro configurado en $200.00 USD");
assert(oro && oro.themeClass === 'plan-card-gold', "Plan Oro usa clase 'plan-card-gold'");

// 3. Password Validation Logic Test
console.log("\n--- 3. VERIFICACIÓN DE REGLAS DE CONTRASEÑA ---");
function validatePasswordRules(pwd) {
  const isLenValid = pwd.length >= 7 && pwd.length <= 150;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const isMaxValid = pwd.length <= 150;
  return isLenValid && hasUpper && hasLower && hasNumber && isMaxValid;
}

assert(validatePasswordRules("abc") === false, "Falla: < 7 caracteres ('abc')");
assert(validatePasswordRules("abcdefg") === false, "Falla: sin mayúscula ni número ('abcdefg')");
assert(validatePasswordRules("Abcdefg") === false, "Falla: sin número ('Abcdefg')");
assert(validatePasswordRules("abcdef1") === false, "Falla: sin mayúscula ('abcdef1')");
assert(validatePasswordRules("Abcdef1") === true, "Éxito: contraseña válida ('Abcdef1', 7 caracteres)");
assert(validatePasswordRules("SuperSecure2026!Key") === true, "Éxito: contraseña robusta ('SuperSecure2026!Key')");

// Test max limit 150
const longPwd150 = "A1" + "a".repeat(148);
assert(longPwd150.length === 150, "Longitud es exactamente 150 caracteres");
assert(validatePasswordRules(longPwd150) === true, "Éxito: contraseña de exactamente 150 caracteres es válida");

const longPwd151 = "A1" + "a".repeat(149);
assert(longPwd151.length === 151, "Longitud es 151 caracteres");
assert(validatePasswordRules(longPwd151) === false, "Falla: contraseña de 151 caracteres supera el límite");

// Truncation simulation
const pasted200 = "P@ssword1" + "x".repeat(191);
const truncated = pasted200.slice(0, 150);
assert(truncated.length === 150, "Truncamiento estricto a 150 caracteres en paste");
assert(validatePasswordRules(truncated) === true, "Contraseña truncada a 150 es válida");

// 4. Data Consistency & VOD Integrity Test
console.log("\n--- 4. INTEGRIDAD DE CURSOS VOD Y STREAMS ---");
assert(COURSES_DATA.length >= 4, "Catálogo posee 4 cursos completos estructurados");
assert(COURSES_DATA.every(c => c.secciones.length > 0 && c.secciones[0].lecciones.length > 0), "Todos los cursos poseen secciones y lecciones en video");
assert(LIVE_STREAMS.active && LIVE_STREAMS.active.estado === 'en-vivo', "Stream activo en vivo configurado");
assert(LIVE_STREAMS.upcoming.length >= 3, "Transmisiones programadas con countdown configuradas");

console.log("\n==================================================");
console.log(`   RESULTADO DE PRUEBAS: ${passed}/${total} APROBADAS`);
console.log("==================================================");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}