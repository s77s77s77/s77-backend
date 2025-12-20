const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: "*", methods: ["POST"] }));

/* =========================
   LOGIN / USUARIOS
========================= */
const ADMIN = "ADMIN-1407";
let usuarios = {};

app.post("/login", (req, res) => {
  const { clave } = req.body;
  const ahora = Date.now();

  if (clave === ADMIN) return res.json({ ok: true, admin: true });
  if (!usuarios[clave] || usuarios[clave] < ahora)
    return res.json({ ok: false, error: "Clave inválida o vencida" });

  res.json({ ok: true, admin: false });
});

app.post("/crear-usuario", (req, res) => {
  const { adminClave, nuevaClave, dias } = req.body;
  if (adminClave !== ADMIN)
    return res.status(403).json({ error: "No autorizado" });

  usuarios[nuevaClave] = Date.now() + dias * 86400000;
  res.json({ ok: true });
});

/* =========================
   LOTES DEFINIDOS
========================= */
const lotes3 = [
  [0,13,28],[1,18,36],[1,25,34],[2,10,35],[2,10,22],
  [3,18,19],[4,10,22],[6,17,28],[7,19,27],[7,9,32],
  [7,3,30],[8,33,28],[8,26,35],[9,14,30],[9,1,30],
  [9,25,36],[10,26,24],[11,22,33],[17,20,35]
];

const lotes4 = [
  [3,18,24,26],
  [4,11,15,29], // ← corregido
  [5,12,16,21],
  [6,10,13,31],
  [14,23,25,16]
];

/* =========================
   CALCULAR – MOTOR FINAL
========================= */
app.post("/calcular", (req, res) => {
  const { ultimos } = req.body;

  if (!Array.isArray(ultimos)) {
    return res.json({ favoritos: [], explosivos: [], completed: false });
  }

  let contador = {};
  let completed = false;

  const idx = n => ultimos.indexOf(n);

  function condicionesValidas(a, b) {
    const ia = idx(a);
    const ib = idx(b);
    if (ia === -1 || ib === -1) return false;
    if (!(ia <= 7 || ib <= 7)) return false;
    if (Math.abs(ia - ib) > 8) return false;
    return true;
  }

  /* ===== LOTES DE 3 ===== */
  lotes3.forEach(lote => {
    const presentes = lote.filter(n => idx(n) !== -1);

    // COMPLETADO lote de 3
    if (presentes.length === 3) {
      completed = true;
      return;
    }

    if (presentes.length === 2) {
      const [a, b] = presentes;
      if (condicionesValidas(a, b)) {
        const faltante = lote.find(n => n !== a && n !== b);
        if (faltante !== undefined) {
          contador[faltante] = (contador[faltante] || 0) + 1;
        }
      }
    }
  });

  /* ===== LOTES DE 4 ===== */
  lotes4.forEach(lote => {
    const presentes = lote.filter(n => idx(n) !== -1);

    // COMPLETADO lote de 4 CUANDO APARECE EL TERCER NÚMERO
    if (presentes.length >= 3) {
      completed = true;
      return;
    }

    if (presentes.length === 2) {
      const [a, b] = presentes;
      if (condicionesValidas(a, b)) {
        const faltantes = lote.filter(n => n !== a && n !== b);
        faltantes.forEach(f => {
          contador[f] = (contador[f] || 0) + 1;
        });
      }
    }
  });

  let favoritos = [];
  let explosivos = [];

  Object.entries(contador).forEach(([num, count]) => {
    const n = parseInt(num, 10);
    if (count >= 2) {
      explosivos.push(n);
    } else {
      favoritos.push(n);
    }
  });

  res.json({ favoritos, explosivos, completed });
});

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log("S77 backend activo");
});
