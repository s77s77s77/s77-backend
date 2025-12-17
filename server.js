const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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

app.post("/calcular", (req, res) => {
  const ultimos = req.body.ultimos || [];
  let cnt = {};
  let presentes = [...new Set(ultimos)];
  const sumar = n => cnt[n] = (cnt[n] || 0) + 1;

  lotes3.forEach(l => {
    let pos = l.filter(n => presentes.includes(n));
    if (pos.length === 2) {
      let falt = l.find(n => !pos.includes(n));
      sumar(falt);
    }
  });

  lotes4.forEach(l => {
    let pos = l.filter(n => presentes.includes(n));
    if (pos.length === 2) {
      l.filter(n => !pos.includes(n)).forEach(sumar);
    }
  });

  let favoritos = [];
  let explosivos = [];

  for (let n in cnt) {
    cnt[n] > 1 ? explosivos.push(n) : favoritos.push(n);
  }

  res.json({ favoritos, explosivos });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("S77 backend activo"));
