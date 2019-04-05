// requerimos los modulos necesarios
const express = require( 'express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const mqtt = require('mqtt');


const PORT = 3000;

server.listen(PORT);
console.log('Server is running');

const options = {
    port: 15484,
    clientId: 'SERVER'+ Math.random().toString(16).substr(2, 8),
    username: 'cunjkfki',
    password: 'NiROE_oOt3ZF',
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};

const MQTTclient = mqtt.connect('mqtt://m24.cloudmqtt.com',options);

MQTTclient.on('connect', function () {
    console.log("conectado");
    MQTTclient.subscribe('basic', function (err) {});
    MQTTclient.subscribe('housekeeping', function (err) {});
})

MQTTclient.on('message', function (topic, message) {
    // message is Buffer
    let mes;
    if (topic.toString() == "basic"){
        mes =  "basic," + message.toString();
        io.sockets.emit('new message', {message: mes});
        console.log(mes);
    }else if (topic.toString() == "housekeeping"){
        mes = "housekeeping," + message.toString();
        io.sockets.emit('new message', {message: mes});
        console.log(mes);
    }
})

const connections = [];

io.sockets.on('connection',(socket) => {
    connections.push(socket);
    console.log(' %s sockets is connected', connections.length);

    socket.on('disconnect', () => { // contar conexiones
        connections.splice(connections.indexOf(socket), 1);
    });

    socket.on('sending message', (message) => { // recibe datos del puerto 3000
        console.log('Message is received from web:', message);
        MQTTclient.publish('tc', 'tc')
    });
});
/*
@brief escribe en el socket del puerto 50000 lo que le pasen del socket del puerto 3000
 */

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
/*
@brief envía '/index.html' cuando se hace un get de '/'
 */
