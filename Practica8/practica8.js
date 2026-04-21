// npm install express
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
var express = require("express");
var app = express();
const { MongoClient } = require("mongodb");
var client = 0;

var dbName = "";
var collectionName = "";

var database = 0;
var collection = 0;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function prepareDB() {
  dbName = "projects";           // ← nueva base de datos
  collectionName = "projects";     // ← nueva colección

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

app.get("/serv001", async function (req, res) {
  const user_id = req.query.id;
  const token   = req.query.token;
  const geo     = req.query.geo;
  res.json({ user_id, token, geo });
});

app.get("/serv0010", async function (req, res) {
  const user_id1 = req.query.id;
  const token1   = req.query.token;
  const geo1     = req.query.geo;
  res.json({ user_id: user_id1, token: token1, geo: geo1 });
});

app.post("/serv002", async function (req, res) {
  const user_id = req.body.id;
  const token   = req.body.token;
  const geo     = req.body.geo;
  res.json({ user_id, token, geo });
});

app.post("/serv003/:info", async function (req, res) {
  const info = req.params.info;
  res.json({ info });
});

// ─────────────────────────────────────────────
//  POST /projects/insert
//  5 proyectos en la colección "projects"
// ─────────────────────────────────────────────
app.post("/projects/insert", async function (req, res) {
  const projects = [
    {
      id_externo:1,
      name:        "Biblioteca",
      description: "Descripciónn y número de libros disponibles en la biblioteca",
      status:      "en desarrollo",
      startDate:   new Date("2024-01-15"),
      budget:      45000,
      teamSize:    4,
    },
    {
      id_externo:2,
      name:        "Bodega de una tienda de ropa",
      description: "Conteno de piezas en existencia de tienda de ropa y su bitacora de llegada a la bodega",
      status:      "completado",
      startDate:   new Date("2023-06-01"),
      budget:      120000,
      teamSize:    8,
    },
    {
      id_externo:3,
      name:        "Menú restaurante mexicano",
      description: "Platillos y sus recetas de lo que se sirve en el restaurante",
      status:      "en pausa",
      startDate:   new Date("2024-03-10"),
      budget:      30000,
      teamSize:    3,
    },
    {
      id_externo:4,
      name:        "Escuela de música",
      description: "Registro de los estudiantes y profesores y las materias que imparten",
      status:      "en desarrollo",
      startDate:   new Date("2024-02-20"),
      budget:      95000,
      teamSize:    6,
    },
    {
      id_externo:5,
      name:        "Organizadora de bodas",
      description: "Clientes, fechas y servicios solicitados para cada evento",
      status:      "en planeación",
      startDate:   new Date("2024-04-01"),
      budget:      60000,
      teamSize:    2,
    },
  ];

  let result = "";

  try {
    const insertManyResult = await collection.insertMany(projects);
    console.log(`${insertManyResult.insertedCount} projects successfully inserted.\n`);
    result = `${insertManyResult.insertedCount} projects successfully inserted.`;
  } catch (err) {
    console.error(`Error inserting projects: ${err}\n`);
    result = `Error inserting projects: ${err}`;
  }

  res.json({ result });
});

app.get("/projects", async function (req, res) {
  try {
    const allProjects = await collection.find({}).toArray();
    res.json(allProjects);
  } catch (err) {
    res.json({ error: `Could not fetch projects: ${err}` });
  }
});

app.delete("/projects/delete/:id_externo", async function (req, res) {
  const id_externo = parseInt(req.params.id_externo);

  let result = "";

  try {
    const deleteResult = await collection.deleteOne({ id_externo: id_externo });

    if (deleteResult.deletedCount === 1) {
      result = `Proyecto con id_externo ${id_externo} eliminado correctamente.`;
    } else {
      result = `No se encontró ningún proyecto con id_externo ${id_externo}.`;
    }
  } catch (err) {
    result = `Error al eliminar: ${err}`;
  }

  res.json({ result });
});

// ─────────────────────────────────────────────
//  PUT /projects/update/:id_externo
//  Actualiza el nombre de un proyecto
// ─────────────────────────────────────────────
app.put("/projects/update/:id_externo", async function (req, res) {
  const id_externo = parseInt(req.params.id_externo);
  const nuevoNombre = req.body.name;

  let result = "";

  try {
    const updateResult = await collection.updateOne(
      { id_externo: id_externo },
      { $set: { name: nuevoNombre } }
    );

    if (updateResult.modifiedCount === 1) {
      result = `Proyecto con id_externo ${id_externo} actualizado correctamente.`;
    } else {
      result = `No se encontró ningún proyecto con id_externo ${id_externo}.`;
    }
  } catch (err) {
    result = `Error al actualizar: ${err}`;
  }

  res.json({ result });
});

// ─────────────────────────────────────────────
//  DELETE /projects/softdelete/:id_externo
//  Borrado lógico — agrega deleted: true
// ─────────────────────────────────────────────
app.delete("/projects/softdelete/:id_externo", async function (req, res) {
  const id_externo = parseInt(req.params.id_externo);
  let result = "";

  try {
    const updateResult = await collection.updateOne(
      { id_externo: id_externo },
      { $set: { deleted: true } }
    );

    if (updateResult.modifiedCount === 1) {
      result = `Proyecto con id_externo ${id_externo} marcado como eliminado.`;
    } else {
      result = `No se encontró ningún proyecto con id_externo ${id_externo}.`;
    }
  } catch (err) {
    result = `Error: ${err}`;
  }

  res.json({ result });
});

app.listen(3000, async function () {
  console.log("Aplicación ejemplo, escuchando el puerto 3000!");
  await connectDB();
  prepareDB();
});