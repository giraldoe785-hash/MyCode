import assert from 'assert';
import fs from 'fs';
import { TOKEN_PACKAGES } from './src/services/mockData.js';

const es = JSON.parse(fs.readFileSync('./src/translations/es.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('./src/translations/en.json', 'utf8'));

console.log('==================================================================');
console.log('🧪 SUITE DE VALIDACIÓN: SISTEMA DE TOKENS, CARRITO & I18N');
console.log('==================================================================');

// 1. Paquetes y Ortografía
console.log('\n--- 1. Validación de 4 Paquetes y Ortografía Exacta ---');
assert.strictEqual(TOKEN_PACKAGES.length, 4, 'Deben existir exactamente 4 paquetes');

const expectedIds = ['handful', 'bucket', 'wagon', 'mountain'];
const actualIds = TOKEN_PACKAGES.map(p => p.id);
assert.deepStrictEqual(actualIds, expectedIds, 'Los IDs de los 4 paquetes deben coincidir');

// Ortografía visible en ES
assert.strictEqual(es.tokens.packages.handful.name, 'Puñado de Tokens');
assert.strictEqual(es.tokens.packages.bucket.name, 'Balde de Tokens');
assert.strictEqual(es.tokens.packages.wagon.name, 'Vagón de Tokens');
assert.strictEqual(es.tokens.packages.mountain.name, 'Montaña de Tokens');
console.log('✅ [PASS] Ortografía en Español: "Puñado de Tokens", "Balde de Tokens", "Vagón de Tokens", "Montaña de Tokens"');

// Ortografía visible en EN
assert.strictEqual(en.tokens.packages.handful.name, 'Token Handful');
assert.strictEqual(en.tokens.packages.bucket.name, 'Token Bucket');
assert.strictEqual(en.tokens.packages.wagon.name, 'Token Wagon');
assert.strictEqual(en.tokens.packages.mountain.name, 'Token Mountain');
console.log('✅ [PASS] Ortografía en Inglés: "Token Handful", "Token Bucket", "Token Wagon", "Token Mountain"');

// Paquete Popular
const popularPkg = TOKEN_PACKAGES.find(p => p.popular);
assert(popularPkg && popularPkg.id === 'wagon', 'El paquete "Vagón de Tokens" debe ser el popular/destacado');
console.log('✅ [PASS] Producto destacado: "Vagón de Tokens" configurado como popular');

// 2. Modelo de Datos Escalable
console.log('\n--- 2. Validación de Modelo de Datos de Tokens ---');
TOKEN_PACKAGES.forEach(pkg => {
  assert(pkg.id, 'Debe tener id');
  assert(pkg.nameKey, 'Debe tener nameKey');
  assert(pkg.descriptionKey, 'Debe tener descriptionKey');
  assert(typeof pkg.tokenAmount === 'number' && pkg.tokenAmount > 0, 'tokenAmount debe ser numérico positivo');
  assert(typeof pkg.price === 'number' && pkg.price > 0, 'price debe ser numérico positivo');
  assert.strictEqual(pkg.currency, 'USD', 'currency debe ser USD');
});
console.log('✅ [PASS] 4/4 paquetes cumplen el modelo de datos escalable');

// 3. Simulación de Operaciones de Carrito
console.log('\n--- 3. Simulación de Operaciones del Carrito ---');
let cart = [];

function addToCart(pkgId, qty = 1) {
  const pkg = TOKEN_PACKAGES.find(p => p.id === pkgId);
  if (!pkg) return;
  const existing = cart.find(i => i.packageId === pkgId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ packageId: pkgId, quantity: qty });
  }
}

function updateQty(pkgId, qty) {
  if (qty <= 0) {
    cart = cart.filter(i => i.packageId !== pkgId);
  } else {
    const item = cart.find(i => i.packageId === pkgId);
    if (item) item.quantity = qty;
  }
}

function remove(pkgId) {
  cart = cart.filter(i => i.packageId !== pkgId);
}

function getTotals() {
  let itemCount = 0;
  let tokens = 0;
  let subtotal = 0;
  for (const item of cart) {
    const pkg = TOKEN_PACKAGES.find(p => p.id === item.packageId);
    itemCount += item.quantity;
    tokens += pkg.tokenAmount * item.quantity;
    subtotal += pkg.price * item.quantity;
  }
  return { itemCount, tokens, subtotal };
}

// Agregar los 4 productos
addToCart('handful', 1);
addToCart('bucket', 1);
addToCart('wagon', 1);
addToCart('mountain', 1);

let totals = getTotals();
assert.strictEqual(totals.itemCount, 4, 'Deben haber 4 items');
assert.strictEqual(totals.tokens, 100 + 500 + 1500 + 5000, 'Total tokens = 7100');
assert.strictEqual(totals.subtotal.toFixed(2), (4.99 + 19.99 + 49.99 + 129.99).toFixed(2), 'Total precio');
console.log('✅ [PASS] Agregar 4 productos: 4 items, 7.100 tokens, $' + totals.subtotal.toFixed(2));

// Incrementar cantidad de Vagón
addToCart('wagon', 2);
totals = getTotals();
assert.strictEqual(totals.itemCount, 6, 'Total items = 6');
console.log('✅ [PASS] Incrementar cantidad de Vagón (ahora x3)');

// Disminuir / Actualizar cantidad
updateQty('bucket', 2);
totals = getTotals();
assert.strictEqual(totals.itemCount, 7, 'Total items = 7');
console.log('✅ [PASS] Actualizar cantidad de Balde (ahora x2)');

// Eliminar producto
remove('handful');
totals = getTotals();
assert.strictEqual(totals.itemCount, 6, 'Total items tras eliminar handful');
console.log('✅ [PASS] Eliminar producto "Puñado de Tokens"');

// Vaciar carrito
cart = [];
totals = getTotals();
assert.strictEqual(totals.itemCount, 0, 'Carrito vacío itemCount = 0');
assert.strictEqual(totals.tokens, 0, 'Carrito vacío tokens = 0');
assert.strictEqual(totals.subtotal, 0, 'Carrito vacío subtotal = 0');
console.log('✅ [PASS] Vaciar carrito completo');

// 4. Variables de Diseño y Contraste de Tema Claro
console.log('\n--- 4. Variables de Diseño & Contrastes CSS ---');
const css = fs.readFileSync('./src/index.css', 'utf8');

assert(css.includes('--accent-gold: #F59E0B;'), 'Dark mode debe tener --accent-gold');
assert(css.includes('--accent-gold: #D97706;'), 'Light mode debe tener --accent-gold');
assert(css.includes('--accent-gold-text: #92400E;'), 'Light mode debe tener --accent-gold-text para WCAG AAA');
assert(css.includes('.btn-gold'), 'CSS debe contener clase .btn-gold');
assert(css.includes('.badge-gold'), 'CSS debe contener clase .badge-gold');
assert(css.includes('.cart-badge'), 'CSS debe contener clase .cart-badge');
console.log('✅ [PASS] Variables de diseño doradas y clases de utilidad verificadas');

console.log('\n==================================================================');
console.log('🎯 TODAS LAS PRUEBAS DE TOKENS, CARRITO E I18N PASARON AL 100%');
console.log('==================================================================\n');
