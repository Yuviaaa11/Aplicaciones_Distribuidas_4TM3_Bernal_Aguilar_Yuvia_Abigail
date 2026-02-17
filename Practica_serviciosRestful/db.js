const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const isString = x => typeof x === "string";
const sha256 = text => crypto.createHash("sha256").update(text).digest("hex");
const normPal = s => s.toLowerCase().replace(/[^a-z0-9]/gi, "");

// Middleware error
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) return res.status(400).json({ error: "JSON inválido" });
  next();
});

// Endpoints
app.post("/mascaracteres", (req, res) => {
  const { cadena1, cadena2 } = req.body || {};
  if (!isString(cadena1) || !isString(cadena2)) 
    return res.status(400).json({ error: "Se requieren cadena1 y cadena2 (strings)" });
  res.json({ resultado: cadena1.length >= cadena2.length ? cadena1 : cadena2 });
});

app.post("/menoscaracteres", (req, res) => {
  const { cadena1, cadena2 } = req.body || {};
  if (!isString(cadena1) || !isString(cadena2)) 
    return res.status(400).json({ error: "Se requieren cadena1 y cadena2 (strings)" });
  res.json({ resultado: cadena1.length <= cadena2.length ? cadena1 : cadena2 });
});

app.post("/numcaracteres", (req, res) => {
  const { cadena } = req.body || {};
  if (!isString(cadena)) return res.status(400).json({ error: "Se requiere cadena (string)" });
  res.json({ resultado: cadena.length });
});

app.post("/palindrome", (req, res) => {
  const { cadena } = req.body || {};
  if (!isString(cadena)) return res.status(400).json({ error: "Se requiere cadena (string)" });
  const n = normPal(cadena);
  res.json({ resultado: n === n.split("").reverse().join("") });
});

app.post("/concat", (req, res) => {
  const { cadena1, cadena2 } = req.body || {};
  if (!isString(cadena1) || !isString(cadena2)) 
    return res.status(400).json({ error: "Se requieren cadena1 y cadena2 (strings)" });
  res.json({ resultado: cadena1 + cadena2 });
});

app.post("/applysha256", (req, res) => {
  const { cadena } = req.body || {};
  if (!isString(cadena)) return res.status(400).json({ error: "Se requiere cadena (string)" });
  res.json({ original: cadena, encriptada: sha256(cadena) });
});

app.post("/verifysha256", (req, res) => {
  const { cadenaEncriptada, cadenaNormal } = req.body || {};
  if (!isString(cadenaNormal) || !isString(cadenaEncriptada)) 
    return res.status(400).json({ error: "Se requieren cadenaNormal y cadenaEncriptada (strings)" });
  if (!/^[a-f0-9]{64}$/i.test(cadenaEncriptada))
    return res.status(400).json({ error: "cadenaEncriptada no es un SHA256 válido" });
  res.json({ resultado: sha256(cadenaNormal).toLowerCase() === cadenaEncriptada.toLowerCase() });
});

app.get("/health", (req, res) => res.json({ status: "OK" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server en http://localhost:${PORT}`));