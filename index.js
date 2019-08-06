var app = require('express')();
var express = require("express")
var http = require('http').createServer(app);
var io = require('socket.io')(http);
rid = require('readable-id')

var testChats = require('./testChats').chats

const port = process.env.PORT || 3000;//// for heroku/local
const path = require("path")


const chats = [];

app.use(express.static(__dirname))  //!Pretty sure this should be changed for security reasons

app.get("/", (req,res)=>{
    // res.sendFile(__dirname + '/pos.html')
    res.sendFile(__dirname+'/compass.html')
})

io.on('connection',(socket)=>{
    console.log("User connected")
    console.log(chats)
    socket.emit("chats",chats)

    socket.on("msg",(msg)=>{
        console.log(msg)
    })
    socket.on("disconnect",()=>{
        console.log("User disconneted")
    })

    socket.on("new",chat=>{
        console.log("New chat: ")
        console.log(chat)
        chats.push(chat)
    })
})



// app.get("/map",(req,res)=>{
//     res.sendFile(__dirname+"/map.html")
// })
/*

var count = 0;

peers = [];

io.on('connection',(socket)=>{
    console.log("New connection")
    peers.push(new Peer(socket))
})



class Peer{

    constructor(socket){
        this.socket = socket;
        this.lat;
        this.lon;
        this.acc;
        this.elev;
        this.id = count;
        count++;

        this.socket.on("loc",(loc)=>{
            console.log("Got loc update")
            console.log(loc.lat)
            console.log(loc.lon)
            this.lat = loc.lat;
            this.lon = loc.lon;
            this.sendLocation()
            this.socket.emit("info","hello")
        })

        this.socket.on("start",()=>{
            console.log("Start key received")
        })

        

        this.socket.on("error",(e)=>{
            console.log("Pos error")
            console.log(e)
        })

        this.socket.on("disconenct",()=>{
            console.log("User disconnected")
        })
    }
    sendLocation(lat,lon){
        console.log("Sending update")
        var o = {index:this.id,coords:{lat:this.lat,lng:this.lon}}
       io.emit("update",o)
    }
}

*/
http.listen(port, ()=>{
    console.log("listning on "+port)
    for(i =0; i < testChats.length;i++){
chats.push(testChats[i])
    }
    
})