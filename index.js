var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
rid = require('readable-id')


const port = 3000; //process.env.PORT || 3000 for heroku/local
const path = require("path")

app.get("/", (req,res)=>{
    res.sendFile(__dirname + '/index.html')
})





// var peers = [];
var rooms = [];

io.on('connection',(socket)=>{
    var address = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    console.log(rooms)
    for(i = 0; i < rooms.length;i++){
        if(rooms[i].ip == address){
            rooms[i].peers.push(new Peer(socket, address))
            return;
        }
    }

    var r = new Room(address)
    r._join(new Peer(socket,address))
    rooms.push(r)
    
    // peers.push()
})

class Room {

    constructor(ip){
        this.ip = ip;
        this.peers = [];
        this.id = rid();
    }

    sendToAll(message){
        for(i = 0; i < this.peers.length; i++){
            this.peers[i]._sendMessage(message);
        }
    }

    _join(peer){
        console.log(peer.id + " is joining room "+this.id)
        this.peers.push(peer)
    }

    // get ip(){
    //     return this.ip;
    // }
}


class Peer  {
    
    constructor(socket, ip){
        this.socket = socket;
        this.ip = ip;
        this.socket.on('chat',message =>{
            this._onMessage(message)
        })


        this.socket.on('disconnect',()=>{
            console.log(this.id +" disconnected.")
        })
      
        
        this._lastPing = 0;
        this.sendTime = 0;
        this.pingable = true;
        this.id = rid();
        console.log("Device "+this.id+" connected on "+this.ip)
        // this._ping()
        // setInterval(()=>{
        //     this._ping()
        // }, 100);
        
    
        this.socket.emit("name",this.id)
    }

    _onMessage(message){
        var chat = {
            id:this.id,
            data:message
        }
        for(i = 0; i< rooms.length;i++){
            if(rooms[i].ip == this.ip){
                this._sendAll(chat, rooms[i])
                return;
            }
        }

    }

    _sendAll(message, room){
        for(i = 0; i < room.peers.length;i++){
            room.peers[i]._sendMessage(message)
        }
    }

    _sendMessage(message){
        this.socket.emit('chat',message)
    }

    // _ping(){
    //     if(this.pingable){
    //         // console.log("pinging "+this.id)
    //         this.socket.emit('t')
    //         this.sendTime = process.hrtime();
    //         this.pingable = false;
    //     }
    // }
    // _pong(time){
    //     // console.log(time)
    //     var rT = new Date(time)
    //     var travelTime = process.hrtime(this.sendTime);
    //     console.log(travelTime)
    //     // console.log(this.id+": "+ " %ds %dms", travelTime[0], travelTime[1] / 1000000+" ms");
    //     this._info(travelTime)
    //     this.lastPing = time;
    //     this.pingable = true;
    // }

    // _info(message){
    //     this.socket.emit('info', message)
    // }
}

http.listen(3000, ()=>{
    console.log("listning on 3000")
})