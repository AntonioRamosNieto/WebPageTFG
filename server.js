/*
------------------------------------------------------------------------------
--                                                                          --
--  Copyright (C) 2017-2018 Universidad PolitÃ©cnica de Madrid              --
--                                                                          --
--  Redistribution and use in source and binary forms, with or without      --
--  modification, are permitted provided that the following conditions are  --
--  met:                                                                    --
--     1. Redistributions of source code must retain the above copyright    --
--        notice, this list of conditions and the following disclaimer.     --
--     2. Redistributions in binary form must reproduce the above copyright --
--        notice, this list of conditions and the following disclaimer in   --
--        the documentation and/or other materials provided with the        --
--        distribution.                                                     --
--     3. Neither the name of the copyright holder nor the names of its     --
--        contributors may be used to endorse or promote products derived   --
--        from this software without specific prior written permission.     --
--                                                                          --
--   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS    --
--   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT      --
--   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR  --
--   A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT   --
--   HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, --
--   SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT       --
--   LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,  --
--   DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY  --
--   THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT    --
--   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE  --
--   OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.   --
--                                                                          --
------------------------------------------------------------------------------
@author Antonio Ramos Nieto

 */

// we require the needed modules
const express = require( 'express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const mqtt = require('mqtt');


const PORT =  5000;

server.listen(PORT);
console.log('Server is running');

const options = {
    port: 8883,
    clientId: 'SERVER'+ Math.random().toString(16).substr(2, 8),
    username: 'antonio52',
    password: 'TFGantonio9',
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8',
    rejectUnauthorized: false
};

const MQTTclient = mqtt.connect('mqtts://acrux.dit.upm.es',options);
const connections = [];

MQTTclient.on('connect', function () {
    console.log("conectado");
    MQTTclient.subscribe('basic', function (err) {});
    MQTTclient.subscribe('housekeeping', function (err) {});
});
/*
@brief It connects to the MQTT broker and subscribe to the topics 'basic' and 'housekeeping'.
 */

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
});
/*
@brief The data received form the MQTT subscriber are send to the web client on port 5000.
 */


io.sockets.on('connection',(socket) => {
    connections.push(socket);
    console.log(' %s sockets is connected', connections.length);

    socket.on('disconnect', () => { // count connections
        connections.splice(connections.indexOf(socket), 1);
    });

    socket.on('sending message', (message) => { // recibe datos del puerto 5000
        console.log('Message is received from web:', message);
        if(message == "tc") {
            MQTTclient.publish('tc', 'tc');
        }
    });
});
/*
@brief The data received from the port 5000 is published on the MQTT broker.
 */

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
/*
@brief sends '/index.html' when it is get '/'
 */
