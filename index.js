var app = require('express')();
var express = require("express")
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var rid = require('readable-id')

var testChats = require('./testChats').chats

const port = process.env.PORT || 3000;//// for heroku/local
const path = require("path")


const chats = [];
const users = [];

app.use(express.static(__dirname))  //!Pretty sure this should be changed for security reasons

app.get("/", (req,res)=>{
    // res.sendFile(__dirname + '/pos.html')
    res.sendFile(__dirname+'/compass.html')
})

io.on('connection',(socket)=>{
    users.push(new User(socket));
})


function addMessageToChat(msg){
    for(i = 0; i< chats.length; i++){
        if(chats[i].name == msg.chat){
            chats[i].messages.push(msg)
        }
    }
}

class User{
    constructor(socket){
        this.socket = socket;
        this.name = rid()
        this.messageCount = 0;
        this.heading;
        this.lastMatch;
        console.log("User connected")
        printUpdate()

        //send all chats for new user to load
        this.socket.emit("chats",chats)
    
        //on sending a message from the client, it is saved and broadcast.
        this.socket.on("msg",(msg)=>{
            this.messageCount ++;
            console.log(msg)
            printUpdate()
            addMessageToChat(msg)
            this.socket.broadcast.emit("msg", msg)
        })

        this.socket.on("heading",(deg)=>{
            var detectThreshold = 10;
            this.heading = deg;
            printUpdate();
            var foundMatch = false;

            for(i = 0; i < users.length;i++){
                if(users[i].name != this.name){
                    let d1 = Math.abs(users[i].heading - this.heading)
                    let d2 = Math.abs(getOppAngle(users[i].heading) - this.heading)
                    let d;
                    if(d1 < d2){
                        d = d1;
                    }else{
                        d = d2;
                    }
                    if(d < detectThreshold){
                        if(!this.lastMatch){
                            this.socket.emit("match", {
                                user:users[i].name,
                                distance:d
                            })
                            this.lastMatch = true;
                            
                        }
                        foundMatch = true;
                    }
                }
            }

            if(!foundMatch && this.lastMatch){
                this.socket.emit("noMatch");
                this.lastMatch = false;
            }

            


        })


        this.socket.on("disconnect",()=>{
            // console.log("User disconneted")
            printUpdate()
            users.splice(users.indexOf(this),1);
        })
    
        this.socket.on("new",chat=>{
            console.log("New chat: ")
            console.log(chat)
            printUpdate()
            chats.push(chat)
            socket.broadcast.emit("chats",[chat]);
    
        })
    }

    
}

function getOppAngle(angle){
    if(angle+180>360){
        return angle-180;
    }else{
        return angle+180;
    }
}

function printUpdate(){
    console.clear();
    console.log(users.length+ " active users");
    for(i =0;i< users.length;i++){
        console.log("   -"+users[i].name);
        console.log("    "+users[i].messageCount + "messages sent.")
        console.log("    "+ "Heading: "+users[i].heading)
    }
    console.log(chats.length + " active chats")
}

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
//     for(i =0; i < testChats.length;i++){
// chats.push(testChats[i])
//     }
    
})