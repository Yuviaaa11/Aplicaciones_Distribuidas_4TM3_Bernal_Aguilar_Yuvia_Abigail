require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

var express = require("express");
var app = express();
const { MongoClient } = require("mongodb");
const crypto = require("crypto");

// ── Telegram config ──────────────────────────
const TELEGRAM_TOKEN = "8769927076:AAF-3RIeT6KfTlEvzVu4QrgxIRU9P3caQms";
const TELEGRAM_CHAT_ID = "6846584063";

// ── PIN temporal en memoria ──────────────────
// { pin: "123456", usuario: "yuvia01", expira: Date }
let pinActivo = null;

var client = 0;
var dbName = "", collectionName = "";
var database = 0, collection = 0;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Helpers ──────────────────────────────────
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generarPIN() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
}

async function enviarTelegram(mensaje) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: mensaje })
  });
  return res.json();
}

// ── DB ───────────────────────────────────────
function prepareDB() {
  dbName = "usuarios_login";
  collectionName = "usuarios_login";
  database = client.db(dbName);
  collection = database.collection(collectionName);
}

async function connectDB() {
  const uri = "mongodb+srv://yuviamixer111213_db_user:Kv39QDXgxpHKMqvD@cluster0.meslfq3.mongodb.net/?appName=Cluster0";
  client = new MongoClient(uri);
  await client.connect();
}

// ── Endpoints ────────────────────────────────

app.get("/", (req, res) => res.json({ message: "Nothing to send" }));

// PASO 1: Login- valida credenciales y envía PIN a Telegram
app.post("/usuarios/valida_login", async function (req, res) {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.json({ success: false, message: "Usuario y contraseña son obligatorios" });
  }

  try {
    const passwordHash = hashPassword(password);

    const encontrado = await collection.findOne({
      usuario:  usuario,
      password: passwordHash,
      deleted:  false
    });

    if (!encontrado) {
      return res.json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    // Generar PIN y guardarlo con expiración de 1 minuto
    const pin = generarPIN();
    pinActivo = {
      pin:     pin,
      usuario: encontrado.usuario,
      expira:  new Date(Date.now() + 60 * 1000) // 1 minuto
    };

    // Enviar PIN por Telegram
    await enviarTelegram(
      ` ¡Alerta de inicio de sesión!\n\nEl usuario "${encontrado.name}" quiere iniciar sesión.\n\nTu PIN es: ${pin}\n\n⏳ Expira en 1 minuto.`
    );

    res.json({
      success: true,
      message: "Credenciales correctas. Se envió un PIN a Telegram. Tienes 1 minuto para verificarlo."
    });

  } catch (err) {
    res.json({ success: false, message: `Error: ${err}` });
  }
});

// PASO 2: Verificar PIN
app.post("/usuarios/verificar_pin", async function (req, res) {
  const { usuario, pin } = req.body;

  if (!pinActivo) {
    return res.json({ success: false, message: "No hay ningún PIN activo" });
  }

  if (new Date() > pinActivo.expira) {
    pinActivo = null;
    return res.json({ success: false, message: "El PIN expiró. Inicia sesión de nuevo." });
  }

  if (pinActivo.usuario !== usuario || pinActivo.pin !== pin) {
    return res.json({ success: false, message: "PIN o usuario incorrecto" });
  }

  // PIN correcto
  pinActivo = null;
  res.json({ success: true, message: `Bienvenido, ${usuario}! Login completado.` });
});

app.listen(3000, async function () {
  console.log("Aplicación escuchando el puerto 3000!");
  await connectDB();
  prepareDB();
});