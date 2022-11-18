#!/usr/bin/env node
"use strict";

// const artnet = require('artnet-node').Server;
const artnet = require('./lib/artnet_server'); // NPM-Version of artnet-lib is buggy...
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const glob = require("glob");

//const fs = require('fs');
//const path = require('path');


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
    console.log("Data: " + msg.data);
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
                        return;
            }
            if (index === 60) {
                        updateIMGB(deviceId);
                        return;
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
0064 PNG_sequence
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
    

let imagedata = `ballmagic.png
test15FPS.png
skyfluids.gif
fLuids.png
skyocean_ballmagic.gif
skyocean_ballmagic_a.png
APNG-Icos4D.png
clock.png
oblivion_lp.png
luna.png
ytune.png
cmatrix.png
0013.png
0014.png
0015.png
0016.png
0017.png
0018.png
0019.png
0020.png
0021.png
0022.png
0023.png
0024.png
0025.png
0026.png
0027.png
0028.png
0029.png
0030.png
0031.png
0032.png
0033.png
0034.png
0035.png
0036.png
0037.png
0038.png
0039.png
0040.png
0041.png
0042.png
0043.png
0044.png
0045.png
0046.png
0047.png
0048.png
0049.png
0050.png
0051.png
0052.png
0053.png
0054.png
0055.png
0056.png
0057.png
0058.png
0059.png
0060.png
0061.png
0062.png
0063.png
0064.png
0065.png
0066.png
0067.png
0068.png
0069.png
0070.png
0071.png
0072.png
0073.png
0074.png
0075.png
0076.png
0077.png
0078.png
0079.png
0080.png
0081.png
0082.png
0083.png
0084.png
0085.png
0086.png
0087.png
0088.png
0089.png
0090.png
0091.png
0092.png
0093.png
0094.png
0095.png
0096.png
0097.png
0098.png
0099.png
0100.png
0101.png
0102.png
0103.png
0104.png
0105.png
0106.png
0107.png
0108.png
0109.png
0110.png
0111.png
0112.png
0113.png
0114.png
0115.png
0116.png
0117.png
0118.png
0119.png
0120.png
0121.png
0122.png
0123.png
0124.png
0125.png
0126.png
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
     else imagePath1 = path.join('images', layer1imagePath[layerAsrc]); 
    if (!imagePath1) imagePath1 = "images/none";    
   io.sockets.emit('imga', {layer1_image: imagePath1});
}

function updateIMGB(deviceId) {
    const layerBsrc = (buffer[deviceId + 60] / 2).toFixed(0); //layer2 img src
    let imagePath2 = "none";
    if (layer2imagePath[layerBsrc] === undefined ) imagePath2 = "none";
     else imagePath2 = path.join('images', layer2imagePath[layerBsrc]); 
    if (!imagePath2) imagePath2 = "images/none";
   io.sockets.emit('imgb', {	layer2_image: imagePath2});
}


function updateClient(deviceId) {
    //const deviceNr = deviceId * 10;
    const deviceNr = deviceId;
    
    const titlesSelector = (buffer[deviceNr + 6] / 2).toFixed(0);

    io.sockets.emit('dev' + deviceId, {
    	index: titlesSelector,
        a: (buffer[deviceNr + 0] / 255).toFixed(3),
        r: buffer[deviceNr + 1],
        g: buffer[deviceNr + 2],
        b: buffer[deviceNr + 3],
	panel_opacity: (buffer[deviceNr + 10] / 255).toFixed(3), 
	//text: textByLine[titlesSelector],
	subtitles_a: (buffer[deviceNr + 10] / 255).toFixed(3),
        subtitles_r: buffer[deviceNr + 7],
        subtitles_g: buffer[deviceNr + 8],
        subtitles_b: buffer[deviceNr + 9],
        subtitles_rotate: (buffer[deviceNr + 11] * 1.41176470588 + 179).toFixed(0),
        subtitles_zoom: (buffer[deviceNr + 12] / 255 * 2).toFixed(3),
	//layer1_image: imagePath1,
	layer1_opacity: (buffer[deviceNr + 36] / 255).toFixed(3),
        layer1_rotate: (buffer[deviceNr + 37] * 1.41176470588 + 179).toFixed(0),
        layer1_zoom: (buffer[deviceNr + 38] / 255 * 2).toFixed(3),
	//layer2_image: imagePath2,
	layer2_opacity: (buffer[deviceNr + 66] / 255).toFixed(3),
	layer2_rotate: (buffer[deviceNr + 67] * 1.41176470588 + 179).toFixed(0),
        layer2_zoom: (buffer[deviceNr + 68] / 255 * 2).toFixed(3),
    });
}

function updateAllClients() {
    for (let i = 0; i <= 50; i++) {
        updateClient(i);
    }
}
