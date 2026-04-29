// npm install express
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

var express = require("express");
var app = express();
const { MongoClient } = require("mongodb");
const crypto = require("crypto");
var client = 0;

var dbName = "";
var collectionName = "";

var database = 0;
var collection = 0;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function prepareDB() {
  dbName = "usuarios_login";           // ← nueva base de datos
  collectionName = "usuarios_login";     // ← nueva colección

  database = client.db(dbName);
  collection = database.collection(collectionName);
}

async function connectDB() {
  const uri =
    "mongodb+srv://yuviamixer111213_db_user:Kv39QDXgxpHKMqvD@cluster0.meslfq3.mongodb.net/?appName=Cluster0";

  client = new MongoClient(uri);
  await client.connect();
}

app.get("/", async function (request, response) {
  r = { message: "Nothing to send" };
  response.json(r);
});

// ─────────────────────────────────────────────
//  POST /usuarios/insert
//  Inserta 5 usuarios con password hasheado SHA-256
// ─────────────────────────────────────────────
app.post("/usuarios/insert", async function (req, res) {
  const usuarios = [
    {
      usuario:  "yuvia01",
      correo:   "yuvia01@gmail.com",
      password: "b460b1982188f11d175f60ed670027e1afdd16558919fe47023ecd38329e0b7f", //hola123
      name:     "Yuvia Bernal",
      created:  new Date("2024-01-15"),
      deleted:  false
    },
    {
      usuario:  "karen1789",
      correo:   "karen_garcia22@gmail.com",
      password: "36c1e0bec98bf660f8fbcffe931d24c19e49df0ef71db5cc1f1ee4406ee31c32", //secreto29
      name:     "Karen Garcia",
      created:  new Date("2026-02-10"),
      deleted:  false
    },
    {
      usuario:  "Juan1",
      correo:   "juan.flores@outlook.com",
      password: "98c2b9ec9cff86acf581c3935a24ebfa6f3c57bd6d3f5951754976dd9ec975ed", //kaisa1
      name:     "Juan Flores",
      created:  new Date("2020-03-05"),
      deleted:  false
    },
    {
      usuario:  "alex_m",
      correo:   "alex.mramos@yahoo.com",
      password: "49bfb8998b3fabca7428df603bb2b263e099ce2959e96207669eeab330b85bbc", //rojo
      name:     "Alex Mondragon",
      created:  new Date("2022-05-05"),
      deleted:  false
    },
    {
      usuario:  "Susanaaa_12",
      correo:   "susana12_martinez@hotmail.com",
      password: "0cfcb2066405b409b6c23655312f1325914910fca7d2f95e506f82e2ce95138d", //palomitas0987
      name:     "Susana Martinez",
      created:  new Date("2024-05-30"),
      deleted:  false
    }
  ];

  let result = "";

  try {
    const insertManyResult = await collection.insertMany(usuarios);
    console.log(`${insertManyResult.insertedCount} usuarios insertados correctamente.\n`);
    result = `${insertManyResult.insertedCount} usuarios insertados correctamente.`;
  } catch (err) {
    console.error(`Error al insertar usuarios: ${err}\n`);
    result = `Error al insertar usuarios: ${err}`;
  }

  res.json({ result });
});

// ─────────────────────────────────────────────
//  GET /usuarios
//  Obtiene todos los usuarios
// ─────────────────────────────────────────────
app.get("/usuarios", async function (req, res) {
  try {
    const allUsuarios = await collection.find({}).toArray();
    res.json(allUsuarios);
  } catch (err) {
    res.json({ error: `No se pudieron obtener los usuarios: ${err}` });
  }
});

// ─────────────────────────────────────────────
//  POST /usuarios/login
//  Verifica usuario y contraseña hasheada
// ─────────────────────────────────────────────
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

app.post("/usuarios/login", async function (req, res) {
  const { correo, password } = req.body;

  try {
    const passwordHash = hashPassword(password); // hashea lo que llega

    const usuario = await collection.findOne({
      correo:   correo,
      password: passwordHash  // compara hash con hash
    });

    if (usuario) {
      res.json({ success: true, message: "Login correcto", usuario: usuario.name });
    } else {
      res.json({ success: false, message: "Correo o contraseña incorrectos" });
    }
  } catch (err) {
    res.json({ error: `Error en login: ${err}` });
  }
});

app.post("/usuarios/valida_login", async function (req, res) {
  const { usuario, password } = req.body;

  // Verificar que lleguen los datos
  if (!usuario || !password) {
    return res.json({
      success: false,
      message: "Usuario y contraseña son obligatorios"
    });
  }

  try {
    // Hashear la contraseña que llega
    const passwordHash = hashPassword(password);

    // Buscar en la BD con usuario + hash
    const encontrado = await collection.findOne({
      usuario:  usuario,
      password: passwordHash,
      deleted:  false
    });

    if (encontrado) {
      res.json({
        success: true,
        message: "Login válido",
        data: {
          nombre:  encontrado.name,
          usuario: encontrado.usuario,
          correo:  encontrado.correo,
          created: encontrado.created
        }
      });
    } else {
      res.json({
        success: false,
        message: "Usuario o contraseña incorrectos"
      });
    }

  } catch (err) {
    res.json({
      success: false,
      message: `Error en la validación: ${err}`
    });
  }
});

app.listen(3000, async function () {
  console.log("Aplicación escuchando el puerto 3000!");
  await connectDB();
  prepareDB();
});