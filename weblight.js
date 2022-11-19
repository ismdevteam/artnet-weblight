#!/usr/bin/env node
"use strict";

// const artnet = require('artnet-node').Server;
const artnet = require('./lib/artnet_server'); // NPM-Version of artnet-lib is buggy...
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const glob = require("glob");

const fs = require('fs');

const path = require('path');

const config = {};
config.artnet = {};
config.artnet.port = 6454;
config.artnet.universe = 0;


const buffer = new Array(512).fill(0); //TODO maybe node buffer?


http.listen(3000, function () {
    console.log('Web listening on *:3000');
});


console.log("Starting Artnet server on port " + config.artnet.port)
const srv = artnet.listen(config.artnet.port, function (msg, peer) {
    // console.log("-----------------");
    // console.log("From: " + peer.address);
    // console.log("Sequence: " + msg.sequence);
    // console.log("Physical: " + msg.physical);
    // console.log("Universe: " + msg.universe);
    // console.log("Length: " + msg.length);
    // console.log("Data: " + msg.data);
    // console.log("-----------------");

    if (msg.universe !== config.artnet.universe) {
        console.log("Wrong Universe, aborting msg processing.");
        return;
    }

    new Array(msg.data.length)
        .fill(0)
        .map(function (val, index) {
            const value = msg.data[index]; //TODO msg.data.readUInt8(i); | buf.readUInt8(index);

            if (buffer[index] === value) {
                return;
            }

            buffer[index] = value;

            let deviceId = 0;
            if (index === 30) {
                        updateIMGA(deviceId);
                        //return;
            }
            if (index === 60) {
                        updateIMGB(deviceId);
                        //return;
            }
            updateClient(deviceId);
        });
});

app.get('/fonts/consolas-webfont.woff', function (req, res) {
    res.sendFile(__dirname + '/fonts/consolas-webfont.woff')
});

app.get('/fonts/consolas-webfont.woff2', function (req, res) {
    res.sendFile(__dirname + '/fonts/consolas-webfont.woff2')
});

app.get('/js/jquery.js', function (req, res) {
    res.sendFile(__dirname + '/js/jquery.js')
});

app.get('/js/bootstrap.min.js', function (req, res) {
    res.sendFile(__dirname + '/js/bootstrap.min.js')
});

app.get('/css/bootstrap.min.css', function (req, res) {
    res.sendFile(__dirname + '/css/bootstrap.min.css')
});

app.get('/css/style.css', function (req, res) {
    res.sendFile(__dirname + '/css/style.css')
});

app.use('/images', express.static("images"));

app.get('/frames', function (req, res) {
    res.sendFile(__dirname + '/frames.html')
});

app.get('/frames/:id', function (req, res) {
    res.sendFile(__dirname + '/frames.html')
});

app.get('/', function (req, res) {
    // Overview Page
    const channels = buffer
        .map((value, index) => {
            const tmp = {};
            tmp[index] = value;
            return tmp
        })
        .filter((channel, index) => channel[index] > 0)
        .map(channels => Object.keys(channels)[0])
        .map(channel => ((channel - 5) / 10).toFixed(0))
        .map(channel => {
            if (channel < 1) {
                return 0
            }
            return channel
        });

    const channelSet = new Set(channels);

    let text = "<h1>Artnet Weblight</h1>";
    text += "Devices with channel values > 0:";
    text += "<ul>";
    channelSet.forEach(device => {
        text += "<li><a href='/" + device + "'>Device " + device + "</a> (<a href='/" + device + "?debug'>Debug</a>)"
    });
    if (channelSet.size === 0) {
        text += '<li>No ArtNet values received yet.'
    }
    text += "</ul><br>";
    text += "<a href='/frames'>Show Multiple Frames</a>";
    res.send(text);
});

app.get('/:id', function (req, res) {
    const channelId = req.params.id * 10;
    const channel = channelId + 1;
/*
    if (channel + 10 > 512) {
        res.sendStatus(416);
        return;
    }
*/
    if (channel > 1) {
        res.sendStatus(416);
        return;
    }
    
    res.sendFile(__dirname + '/index.html');

    updateClient(req.params.id);
});


io.on('connection', function (socket) {
    updateAllClients();
});


let imageFiles = [];
glob("images/*", {}, function (er, files) {
    console.log(er);
    imageFiles = files;
});

let textByLine = [128];
let data = `0001 dj intro
pulse122
pills
TolmachoF
Cy4ka
Cy4ka Даёт
Cy4ka Даёт в попку
pulse125
pulseturbate.com
0010 synth fx 1> + add openhh
0011 drop 4x4
0012 +add main openshaker hh
0013 bass fx1 on 1 beat
0014 dj
0015 synth fx 3>
0016 +hats layer
0017 drop 4x4
0018 synth fx (bong) as crash
0019 synth bass fx1 on 1 beat syncope
0020 psyho synth layer cutoff<
0021 synth arp
0022 bitch
0023 drop4x4+synth bass fx2<
0024 drop with synth fx (bong) as crash + noisefx<
0025 drop with deep shaman bong
0026 drop dj arp (psyho rhodes) cutoff close>
0027 drop minimal sounds left
0028 drop theme begin from deep
0029 drop waiting theme
0030 drop theme
0031 funky
0032 drop noisefx< bass fx<
0033 drop as whomadewho variation
0034 drop theme
0035 drop out< uplifting bass&pad side-ch
0036 main part + theme (no hatz just work bd+clap)
0037 main part theme
0038 lil 4x4 drop + noisefx<
0039 main part + add openhh
0040 drop with hatz&perc and clap, but no kick
0041 drop with theme
0042 main part theme full drums
0043 main part theme full drums
0044 lil 4x4 drop + theme
0045 drop out + noisefx<
0046 main part theme coda
0047 main part theme coda
0048 main part theme coda var2
0049 main part theme outro with noisefx<
0050 final drop with side-ch pads perc hatz
0051 final drop with deeppadfx
0052 bass fx1<
0053 dj outro
0054 kick cut
0055 fin
0056
0057
0058
0059
0060
0061
0062
0063
ismdevteam
0065 LFO:SYNCtoHOST
0066 LFO:SYNCtoHOST
0067 TODO:NOISEFX1 #51 217.1.1
0068
0069
0070
0071
0072
0073
0074
0075
0076
0077
0078
0079
0080
0081
0082
0083
0084
0085
0086
0087
0088
0089
0090
0091
0092
0093
0094
0095
0096
0097
0098
0099 Koкс
0100 Дождь
0101
0102
0103
0104
0105
0106
0107
0108
0109
0110
0111
0112
0113
0114
0115
0116
0117
0118
0119
0120
0121
0122
0123
0124
0125
0126
0127`;

    textByLine = data.split("\n");
    textByLine.unshift("none");
    
    
let configJSON = {};    
fs.readFile('/storage/emulated/0/.headlighter-config.json', 'utf8', function(err, data){
	console.log('config:' + data);
	  if (!err) {
	    var jsonArr = JSON.parse(data);
	    console.log(jsonArr);
	    console.log("group id:" + jsonArr[0].node.image.uri);
	    jsonArr.forEach(element => {
	    	console.log(element.node.image.uri);
	    });
	  }
	    //layer1imagePath = data.split("\n");
    //layer1imagePath.unshift('none');
});
    

let imagedata = `1.png
Download/images/ism.png
Download/images/clock.png
Download/images/0001.png
Download/images/03.jpg
Download/images/11.jpg
Download/images/APNG-Icos4D.png
Download/images/02.jpg
Download/images/04.jpg
Download/images/0001.png
Download/images/0001.png
Download/images/0001.png
DCIM/Camera/IMG_20221119_012202.jpg
DCIM/Camera/IMG_20221119_012202.jpg
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0001.png
0127.png`;

let layer1imagePath = [128];

    layer1imagePath = imagedata.split("\n");
    layer1imagePath.unshift('none');

let layer2imagePath = [128];

    layer2imagePath = imagedata.split("\n");
    layer2imagePath.unshift('none');


function updateIMGA(deviceId) {
    const layerAsrc = (buffer[deviceId + 30] / 2).toFixed(0); //layer1 img src   
    let imagePath1 = "none";
    if (layer1imagePath[layerAsrc] === undefined ) imagePath1 = "none";
     else imagePath1 = path.join('', layer1imagePath[layerAsrc]); 
    if (!imagePath1) imagePath1 = "images/none";
    
    console.log('imagePath1:' + imagePath1);  
   io.sockets.emit('imga', {layer1_image: imagePath1});
}

function updateIMGB(deviceId) {
    const layerBsrc = (buffer[deviceId + 60] / 2).toFixed(0); //layer2 img src
    let imagePath2 = "none";
    if (layer2imagePath[layerBsrc] === undefined ) imagePath2 = "none";
     else imagePath2 = path.join('', layer2imagePath[layerBsrc]); 
    if (!imagePath2) imagePath2 = "images/none";
    console.log('imagePath2:' + imagePath2);
   io.sockets.emit('imgb', {	layer2_image: imagePath2});
}


function updateClient(deviceId) {
    //const deviceNr = deviceId * 10;
    const deviceNr = deviceId;
    
    const titlesSelector = (buffer[deviceNr + 6] / 2).toFixed(0);
    
    
    const imageNumber = (buffer[deviceNr + 4] / 2).toFixed(0);    
    let imagePath = imageFiles[parseInt(imageNumber) - 1]; 
    if (layer1imagePath[imageNumber] === undefined ) imagePath = "none";
     else imagePath = path.join('', layer1imagePath[imageNumber]);     
    if (!imagePath) { 
    	imagePath = "images/none"}    
    //console.log('imagePath:' + imagePath);
    
	
	    const imageNumber1 = (buffer[deviceNr + 30] / 2).toFixed(0);
	    
	    let imagePath1 = imageFiles[parseInt(imageNumber1) - 1]; //TODO improve via name matching

	    if (layer1imagePath[imageNumber1] === undefined ) imagePath1 = "none";
	     else imagePath1 = path.join('', layer1imagePath[imageNumber1]);
	     
	    if (!imagePath1) { 
	    	imagePath1 = "images/none"}	    
	    //console.log('imagePath1:' + imagePath1);
	    
	    
	    	    const imageNumber2 = (buffer[deviceNr + 60] / 2).toFixed(0);		    
		    let imagePath2 = imageFiles[parseInt(imageNumber2) - 1];
		    if (layer2imagePath[imageNumber2] === undefined ) imagePath2 = "none";
		     else imagePath2 = path.join('', layer2imagePath[imageNumber2]);
		     
		    if (!imagePath2) { 
		    	imagePath2 = "images/none"}	    
		    //console.log('imagePath2:' + imagePath2);
   


    io.sockets.emit('dev' + deviceId, {
    	index: titlesSelector,
        a: (buffer[deviceNr + 0] / 255).toFixed(3),
        r: buffer[deviceNr + 1],
        g: buffer[deviceNr + 2],
        b: buffer[deviceNr + 3],
        body_image_opacity: (buffer[deviceNr + 5] / 255).toFixed(3),
	panel_opacity: (buffer[deviceNr + 10] / 255).toFixed(3), 
	text: textByLine[titlesSelector],
	subtitles_a: (buffer[deviceNr + 10] / 255).toFixed(3),
        subtitles_r: buffer[deviceNr + 7],
        subtitles_g: buffer[deviceNr + 8],
        subtitles_b: buffer[deviceNr + 9],
        subtitles_rotate: (buffer[deviceNr + 11] * 1.41176470588 + 179).toFixed(0),
        subtitles_zoom: (buffer[deviceNr + 12] / 255 * 2).toFixed(3),
	layer1_image: imagePath1,
	layer1_opacity: (buffer[deviceNr + 36] / 255).toFixed(3),
        layer1_rotate: (buffer[deviceNr + 37] * 1.41176470588 + 179).toFixed(0),
        layer1_zoom: (buffer[deviceNr + 38] / 255 * 2).toFixed(3),
	layer2_image: imagePath2,
	layer2_opacity: (buffer[deviceNr + 66] / 255).toFixed(3),
	layer2_rotate: (buffer[deviceNr + 67] * 1.41176470588 + 179).toFixed(0),
        layer2_zoom: (buffer[deviceNr + 68] / 255 * 2).toFixed(3),
        image: imagePath
    });
}

function updateAllClients() {
    for (let i = 0; i <= 50; i++) {
        updateClient(i);
    }
}
