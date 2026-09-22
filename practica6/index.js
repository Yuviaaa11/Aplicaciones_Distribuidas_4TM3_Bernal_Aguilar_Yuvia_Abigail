require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

function iterateFunc(doc) {
   console.log(JSON.stringify(doc, null, 4));
}

async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function findAllData(client) {
  const cursor = await client.db("sample_mflix").collection("movies").find({}).limit(2);
  // Convertir cursor a array de documentos
  const results = await cursor.toArray();
  console.log("Title: ",results[0]['title']);

  // Mostrar resultados
  console.log("Películas encontradas:");
  console.log(JSON.stringify(results, null, 2));

}

async function agruparPorGenero(client) {
  const pipeline = [
    // 1. "genres" es un arreglo, por ejemplo ["Comedy", "Drama"].
    //    $unwind crea un documento por cada género de cada película.
    { $unwind: "$genres" },

    // 2. Junta los documentos por género y calcula datos de cada grupo
    {
      $group: {
        _id: "$genres",
        total: { $sum: 1 },                       // cuántas películas tiene el género
        ratingPromedio: { $avg: "$imdb.rating" }, // calificación promedio en IMDb
        titulos: { $push: "$title" }              // títulos de las películas
      }
    },

    // 3. Da formato a la salida
    {
      $project: {
        _id: 0,
        genero: "$_id",
        total: 1,
        ratingPromedio: { $round: ["$ratingPromedio", 1] },
        ejemplos: { $slice: ["$titulos", 3] }     // solo 3 títulos de muestra
      }
    },

    // 4. Ordena de mayor a menor cantidad de películas
    { $sort: { total: -1 } }
  ];

  const resultados = await client
    .db("sample_mflix")
    .collection("movies")
    .aggregate(pipeline)
    .toArray();

  console.log(`\nPelículas agrupadas por género (${resultados.length} géneros):`);
  for (const g of resultados) {
    console.log(`\n${g.genero}: ${g.total} películas (IMDb promedio: ${g.ratingPromedio})`);
    g.ejemplos.forEach(titulo => console.log(`   - ${titulo}`));
  }
}

async function main() {
  const uri = "mongodb+srv://yuviamixer111213_db_user:Kv39QDXgxpHKMqvD@cluster0.meslfq3.mongodb.net/?appName=Cluster0";

  const client = new MongoClient(uri, { family: 4, connectTimeoutMS: 10000 });

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await listDatabases(client);
    // await findAllData(client);
    await agruparPorGenero(client);

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);