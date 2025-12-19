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

/* ===== LOGIN ===== */
app.post("/login", (req, res) => {
  const { clave } = req.body;
  const ahora = Date.now();

  if (clave === ADMIN) {
    return res.json({ ok: true, admin: true });
  }

  if (!usuarios[clave] || usuarios[clave] < ahora) {
    return res.json({ ok: false, error: "Clave inválida o vencida" });
  }

  res.json({ ok: true, admin: false });
});

/* ===== CREAR USUARIO ===== */
app.post("/crear-usuario", (req, res) => {
  const { adminClave, nuevaClave, dias } = req.body;

  if (adminClave !== ADMIN) {
    return res.status(403).json({ error: "No autorizado" });
  }

  usuarios[nuevaClave] = Date.now() + dias * 86400000;
  res.json({ ok: true });
});

/* =========================
   LOTES
========================= */
const lotes3 = [
  [0,13,28],[1,25,34],[2,10,35],[2,10,22],[3,18,19],
  [4,10,22],[6,17,28],[7,19,27],[7,9,32],[8,33,28],
  [8,26,35],[9,14,30],[9,1,30],[9,25,36],
  [10,26,24],[11,22,33],[17,20,35]
];

const lotes4 = [
  [3,18,24,26],
  [4,11,15,19],
  [5,12,16,21],
  [6,10,13,31],
  [14,23,25,16]
];

/* =========================
   CALCULAR (LÓGICA REAL)
========================= */
app.post("/calcular", (req, res) => {
  const { ultimos } = req.body;

  if (!Array.isArray(ultimos) || ultimos.length < 2) {
    return res.json({ favoritos: [], explosivos: [] });
  }

  let favoritos = [];
  let explosivos = [];

  // índice 0 = más reciente
  const reciente = ultimos[0];
  const anteriores = ultimos.slice(1);

  /* ===== LOTES DE 3 ===== */
  lotes3.forEach(lote => {
    const tieneReciente = lote.includes(reciente);
    const tieneAnterior = lote.some(n => anteriores.includes(n));

    if (tieneReciente && tieneAnterior) {
      const faltante = lote.find(
        n => n !== reciente && !anteriores.includes(n)
      );

      if (faltante !== undefined && !favoritos.includes(faltante)) {
        favoritos.push(faltante);
      }
    }
  });

  /* ===== LOTES DE 4 ===== */
  lotes4.forEach(lote => {
    const presentes = lote.filter(n => ultimos.includes(n));

    if (presentes.length === 2) {
      const tieneReciente = presentes.includes(reciente);
      const tieneAnterior = presentes.some(n => anteriores.includes(n));

      if (tieneReciente && tieneAnterior) {
        const faltantes = lote.filter(n => !presentes.includes(n));
        faltantes.forEach(f => {
          if (!favoritos.includes(f)) {
            favoritos.push(f);
          }
        });
      }
    }
  });

  res.json({ favoritos, explosivos });
});

/* =========================
   START
========================= */
app.listen(PORT, () => {
  console.log("S77 backend activo en puerto", PORT);
});
