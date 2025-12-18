const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const API_SECRET = process.env.API_SECRET || "S77-PRIVATE-2025";

app.use(express.json());
app.use(cors({ origin: "*", methods: ["POST"] }));

/* ===== SEGURIDAD ===== */
function auth(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key || key !== API_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

/* ===== LOGIN / USUARIOS (SIN DB) ===== */
const ADMIN = "ADMIN-1407";
let usuarios = {};

app.post("/login", auth, (req, res) => {
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

app.post("/crear-usuario", auth, (req, res) => {
  const { adminClave, nuevaClave, dias } = req.body;

  if (adminClave !== ADMIN) {
    return res.status(403).json({ error: "No autorizado" });
  }

  usuarios[nuevaClave] = Date.now() + dias * 86400000;
  res.json({ ok: true });
});

/* ===== LOTES PRIVADOS (OCULTOS) ===== */
const lotes3 = [
  [0,13,28],[1,18,36],[1,25,34],[2,10,35],[2,10,22],
  [3,18,19],[4,10,22],[6,17,28],[7,19,27],
  [7,9,32],[8,33,28],[8,26,35],[9,14,30],
  [9,1,30],[9,25,36],[10,26,24],[11,22,33],
  [17,20,35],[7,3,30]
];

const lotes4 = [
  [3,18,24,26],[4,11,15,29],[5,12,16,21],
  [6,10,13,31],[14,23,25,16]
];

/* ===== CALCULAR ===== */
app.post("/calcular", auth, (req, res) => {
  const ultimos = req.body.ultimos || [];
  let contador = {};
  let presentes = [...new Set(ultimos)];

  const sumar = n => {
    contador[n] = (contador[n] || 0) + 1;
  };

  // LOTES DE 3
  lotes3.forEach(lote => {
    const p = lote.filter(n => presentes.includes(n));
    if (p.length === 2) {
      const faltante = lote.find(n => !p.includes(n));
      sumar(faltante);
    }
  });

  // LOTES DE 4
  lotes4.forEach(lote => {
    const p = lote.filter(n => presentes.includes(n));
    if (p.length === 2) {
      lote.filter(n => !p.includes(n)).forEach(sumar);
    }
  });

  let favoritos = [];
  let explosivos = [];

  Object.keys(contador).forEach(n => {
    contador[n] > 1 ? explosivos.push(n) : favoritos.push(n);
  });

  res.json({ favoritos, explosivos });
});

app.listen(PORT, () => {
  console.log("Backend S77 activo");
});
