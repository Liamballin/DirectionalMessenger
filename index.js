var app = require('express')();
var express = require("express");
var http = require("http").createServer(app);
var io = require('socket.io')(http);
var rid = require('readable-id')
// const uuidv4 = require('uuid/v4');


const port = process.env.PORT || 3000;

app.use(express.static(__dirname+"/web"))
app.use(express.static(__dirname+"/web/images"))

app.get("/", (req, res)=>{
    res.sendFile(__dirname+'/web/index.html')
})

var chats = [];
// var chats = [
//     {
//         heading:0,
//         id:"123123123",
//         messages:    
//         [
//         {
//         sender:"bot",
//         text:"hello",
//         time:"0200303030"
//         }, 
//         {
//         sender:"me",
//         text:"hey",
//         time:"0200303030"
//         }
//     ]
//     },
//     {
//         heading:45,
//         id:"696969696",
//         messages:[
//             {
//                 sender:"sever",
//                 text:"at heading 45",
//                 time:"1232323",
//             }
//         ]
//     }
// ]
var users = [];

class User{
    constructor(socket){
        this.socket = socket;
        this.name = rid();
        
        this.socket.emit("startChats", chats);
        this.socket.emit("name", this.name);
        console.log("User "+this.name+" logged in")
        this.socket.on("update", (chatUpdate)=>{
            chats = chatUpdate;
            updateClients();

        })

        this.socket.on("disconnect",()=>{
            console.log("Disconnected "+this.name);
        })

    }

}

function updateClients(){
    for(i =0; i < users.length;i++){
        users[i].socket.emit("startChats", chats);
    }
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

// function syncChats(newChat){
//     for(ch = 0; ch < newChat.length;ch++){ // loop through NewChat incase there are new chats
//         var foundChat = false;

//         for(oc = 0; oc < chats.length;oc++){
//             if(newChat[ch].id == chats[oc].id){
//                 foundChat = true;
//             }
//         }

//         if(!foundChat){ //chat is new - doesn't match any other chats
//             chats.push(newChat[ch])
//         }else{
//             var matchingChat = chats[oc] //our chat object that matched the incoming chat object.
//             var incomingChat = newChat[ch] // incoming chat with the same ID as the matching chat.
//             console.log(chats)
//             for(i = 0; i < incomingChat.messages.length;i++){
//                 var foundMessage = false;
//                 for(m = 0; m < chats[oc].messages.length;m++){
//                     if(incomingChat.messages[i].id == matchingChat.messages[m].id){
//                         foundMessage = true;
//                     }
//                 }
//                 if(!foundMessage){
//                     chats[oc].messages.push(newChat[ch].messages[i])
//                 }
//             }
//         }


//     }



// }

// function isNewMessage(messageObject, chatObject){
//     console.log("Fuck")
//     var id = messageObject.id;
//     for(c = 0; c< chatObject.length;c++){
//         for(m = 0; m < chats[i].messages.length;m++){
//             if(chatObject[c].messages[m].id == id){
//                 console.log("Im matching "+chatObject[c].messages[m].id+" with "+id);

//                 return false;
//             }else{
//                 console.log("not matching "+chatObject[c].messages[m].id+" with "+id);

//             }
//         }

//     }
//     return true;
// }

function isNewChat(chatObject){
    var id = chatObject.id;
    for(i = 0; i < chats.length;i++){
        if(chats[i].id == id){

            return i;
        }else{
            console.log("I dont match "+chats[i].id+" with "+id+" because im rarted");

        }
    }
    return true;
}

io.on('connection',(socket)=>{
    users.push(new User(socket));
})


http.listen(port, ()=>{
    console.log("Listening on "+port);
});