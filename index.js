var app = require('express')();
var express = require("express")
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var rid = require('readable-id')


const port = process.env.PORT || 3000;//// for heroku/local
const path = require("path")


const chats = [];
const users = [];

app.use(express.static(__dirname+"/web"))  

app.get("/", (req,res)=>{
    // res.sendFile(__dirname + '/pos.html')
    res.sendFile(__dirname+'/web/compass.html')
})

app.get("/test", (req,res)=>{
    res.sendFile(__dirname+"/web/detectTest.html")
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
        this.self = this;
        this.name = rid()
        this.messageCount = 0;
        this.heading;
        this.lastMatch;
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
            var detectThreshold = 20;
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
            // users.splice(users.indexOf(this.self),1);
            for(i = 0; i< users.length;i++){
                if(users[i].name == this.name){
                    users.splice(i,1)
                }
            }
            printUpdate()
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
    console.log("A DIRECT MESSAGE")
    
    console.log("Running on " + port)  
    console.log('\n\n')
    console.log(users.length+ " active users");
    console.log("\n")
    for(i =0;i< users.length;i++){
        console.log("   > "+users[i].name);
        console.log("       [M]"+users[i].messageCount + " messages sent.")
        console.log("       [H]"+ "Heading: "+users[i].heading)
    }
    
    console.log("\n[C]"+chats.length + " active chats")
}


http.listen(port, ()=>{
printUpdate()
})