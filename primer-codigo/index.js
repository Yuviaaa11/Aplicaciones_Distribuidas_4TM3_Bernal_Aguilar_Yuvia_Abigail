var express=require('express');
var app=express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/aleatorio", function (request, response) {

    const numeroAleatorio = Math.floor(Math.random() * 100) + 1;
    console.log("Número aleatorio:", numeroAleatorio);

    const r = {
        numero: numeroAleatorio
    };

    response.json(r);
});

app.listen(3000, function () {
    console.log('Aplicación ejemplo, escuchando el puerto 3000!');
});