var app = require('express')();
var express = require("express");
var http = require("http").createServer(app);
var io = require('socket.io')(http);
var rid = require('readable-id')
// const uuidv4 = require('uuid/v4');


const port = process.env.PORT || 3000;

app.use(express.static(__dirname+"/web"))
app.use(express.static(__dirname+"/web/images"))
app.use(express.static(__dirname+"/web/images/icons"))

app.get("/", (req, res)=>{
    res.sendFile(__dirname+'/web/index.html')
})

app.get("/offline", (req, res)=>{
    res.sendFile(__dirname+'/web/offline.html')
})

setInterval(cleanUsers, 5000);

var chats = [];

var users = [];

class User{
    constructor(socket){
        this.socket = socket;
        this.name = rid();
        this.connected = true;
        
        this.socket.emit("startChats", chats);
        this.socket.emit("name", this.name);
        // console.log("User "+this.name+" logged in")
        this.socket.on("update", (chatUpdate)=>{
            chats = chatUpdate;
            updateClients();

        })

        this.socket.on("disconnect",()=>{
            // console.log("Disconnected "+this.name);
            // this.connected = false;
            console.log(this.name+" DISCONNECTED")
            users = removeModel(users,this)
        })

    }

}

function updateClients(){
    console.log(users.length+" users connected.")
    for(i =0; i < users.length;i++){
        users[i].socket.emit("startChats", chats);
    }
}

function cleanUsers(){
    // var removed = 0;
    // console.log("Cleaning...")
    // for(i =0;i<users.length;i++){
    //     if(users[i].connected == false){
    //         users.pop(i);
    //         removed++;
    //     }
    // }
    // console.log("Removed "+removed+" users")
    // console.log(users.length+" users online")
}

function removeModel(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
  }

function syncChats(newChat){
    for(nc = 0; nc< newChat.length;nc++){   //iterator for newChats
        var foundChat = false;
        var matchingChatIndex;
        for(oc = 0; oc < chats.length;oc++){    //iterator for old chats
            var incomingChat = newChat[nc];
            var matchingChat = chats[oc];

            if(incomingChat.id == matchingChat.id){
                foundChat = true;
                matchingChatIndex = oc;
            }
        }

        if(!foundChat){
            chats.push()
        }

    }
}


// function isNewChat(chatObject){
//     var id = chatObject.id;
//     for(i = 0; i < chats.length;i++){
//         if(chats[i].id == id){

//             return i;
//         }else{
//             console.log("I dont match "+chats[i].id+" with "+id+" because im rarted");

//         }
//     }
//     return true;
// }

io.on('connection',(socket)=>{
    users.push(new User(socket));
    console.log(users.length+" users connected.")

})


http.listen(port, ()=>{
    console.log("Listening on "+port);
});