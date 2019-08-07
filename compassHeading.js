
    //---------global vars ----------

    var chats = [];
    
    
    
    //----------socket stuff---------------
    var socket = top.glob;  // import the same socket instance that is already initialized.

    socket.on("chats",(cs)=>{
        console.log(cs)
        for(i = 0;i < cs.length; i++){
            if(!cs[i].messages){
                cs[i].messages = [];
            }
            chats.push(cs[i])
        }
        console.log(chats.length)
        createChats();
    })

    socket.on("msg", (msg)=>{
        console.log("Got incoming message")
        console.log(msg)
        addMessageToChat(msg.text,msg.chat, "other", false);
        onDeviceMove(alpha, accuracy);
    })





    //-------------DOM STUFF------------------



    function inter(
        val, //current value
        min1, //start of range that value is in
        max1, //end of range that value is in
        min2, //start of range to convert value to
        max2 //end of range to convert value to
       ) 
       {
       var res = min2 + (max2 - min2) * ((val - min1) / (max1 - min1));
       return res;
       }
    //----------------------------------------
     




        var alpha =0;
        var accuracy;
        var currentChat;
        var lastScroll;
        var compassMode; //! 1 = iphone - actual magnetic compass
                         //! 2 = android - calibrated accelleromter
                         //! 3 = desktop - completely manual compass

        function setCompass(){
                console.log("Adding magnetic compass listener")
            window.addEventListener('deviceorientation', function(event) {
                if (typeof event.webkitCompassHeading !== "undefined") {
                     alpha = event.webkitCompassHeading; 
                     accuracy = event.webkitCompassAccuracy;
                    onDeviceMove(alpha,accuracy)
                }else{
                    console.log("adding scroll listener")
                    window.addEventListener("wheel", (event)=>{
                        var delta = Math.sign(event.deltaY);
            
                        alpha += delta*2;
                        if(alpha >= 360){
                            alpha = 0;
                        }else if(alpha < 0){
                            alpha = 360;
                        }
                        onDeviceMove(alpha)
                    })
                    onDeviceMove(alpha);
                    }
            })      
        }
       


    function onDeviceMove(alpha, accuracy){
        var heading = alpha
        top.heading = alpha;
        document.getElementById("heading").innerHTML = heading.toFixed([0])+"°";
        rotateCompass(alpha);
        updateAccuracy(accuracy);
        updateChatOpacity(alpha);
    }

    function updateAccuracy(acc){
        var newSize = inter(acc,0,15,1,0)
        document.getElementById("accuracyCircle").style.webkitTransform = "scale("+newSize+")"
    }

    function rotateCompass(deg){
        var chatAngle = 75;
        var div = document.getElementById("compassRing")
        div.style.webkitTransform = 'rotate('+deg+"deg)"
    }

    function getOppAngle(angle){
        if(angle+180>360){
            return angle-180;
        }else{
            return angle+180;
        }
    }

    function createChats(){
        console.log("Creating chats..")
        console.log(chats.length)
        for(i =0; i<chats.length;i++){
            console.log("Creating chat "+i+": "+chats[i].name)
            createChatElement(chats[i])
        }
    }

    function getDistance(a,b){
        return (Math.abs(a - b));
    }

    function updateChatOpacity(alpha){
        var visibleThreshholdDegrees = 20;
        let found = false;
        for(i=0;i<chats.length;i++){
            var chatHeading1 = getOppAngle(chats[i].heading);
            var chatHeading2 = chats[i].heading;
            var distance1;
            var distance2;
            //get opposite angle instead of matching
            if(chatHeading1 + visibleThreshholdDegrees > 360 || chatHeading1 - visibleThreshholdDegrees < 0){
                let m11 = getOppAngle(chatHeading1);
                let a11 = getOppAngle(alpha);
                distance1 = getDistance(a11,m11);
            }else{
                distance1 = getDistance(alpha,chatHeading1)
            }

            if(chatHeading2 + visibleThreshholdDegrees > 360 || chatHeading2 - visibleThreshholdDegrees < 0){
                let m12 = getOppAngle(chatHeading2);
                let a12 = getOppAngle(alpha);
                distance2 = getDistance(a12,m12);
            }else{
                distance2 = getDistance(alpha,chatHeading2)
            }
            

            if( distance1 < visibleThreshholdDegrees || distance2 < visibleThreshholdDegrees){
                let distance;
                if(distance1 < distance2){
                    distance = distance1;
                }else{
                    distance = distance2;
                }
                var newOpacity = inter(distance, 0, visibleThreshholdDegrees,1,0)
                document.getElementById(chats[i].name).style.opacity = newOpacity;
                currentChat = chats[i].name;
                
                currentChat = document.getElementById(chats[i].name);
                // var degrees = inter(distance,0,10,45,0);
                found = true;
            }else{
                document.getElementById(chats[i].name).style.opacity = 0;
            }
        }

        if(!found){
            currentChat = undefined;
        }
    }

    //---------------------- chat stuff ----------------

    function sendChat(){
        var chatText = document.getElementById('textInput').value;
        document.getElementById('textInput').value = "";
        
        if(currentChat){

            addMessageToChat(chatText, currentChat.id, "me", true)

        }else{
            createNewChat(alpha).then(nn=>{
                // currentChat = nn;
                addMessageToChat(chatText, nn, "me", false);
                currentChat = document.getElementById(nn)
                // updateChatOpacity()
                onDeviceMove(alpha, accuracy)
                for(i = 0; i < chats.length; i ++){
                    if(chats[i].name == nn){
                        socket.emit("new",chats[i])
                    }
                }
                console.log(chats)
            });
        }
    }

    function createNewChat(heading){
        return new Promise((resolve,reject)=>{
            var nn = uuid.v1();
            console.log("making new chat with name "+nn)
            var nc = chatObjectConstructor(nn, heading)
            chats.push(nc);
            createChatElement(nc).then(()=>{
                // socket.emit("new",{name:nn,heading:heading})
                resolve(nn);

            })
            
        })
    }

    function createChatElement(chatObject){
        return new Promise((resolve,reject)=>{
            var chatParent = document.getElementById("chatParent");
            var newChat = document.createElement("div")
            newChat.className = "chat"
            newChat.id = chatObject.name;
            for(ii = 0; ii < chatObject.messages.length; ii++){
                var newText = document.createTextNode(chatObject.messages[ii].text);
                var newMessage = document.createElement("H1");
                if(chatObject.messages[ii].sender == "me"){
                    newMessage.className = "chatMessageSent";
                }else{
                    newMessage.className = "chatMessage";
                }
                newMessage.appendChild(newText);
                newChat.appendChild(newMessage)
            }
            chatParent.appendChild(newChat)    
            resolve()   
        })
        
    }
    

    function chatObjectConstructor(name, heading){
        return {
            name:name,
            heading:heading,
            messages:[]
        }
    }

    function addMessageToChat(message, chatName, sender, syncToServer){
        //---------update chat object-------

        for(i = 0; i < chats.length;i++){
            if(chats[i].name == chatName){
                console.log("found match")
                chats[i].messages.push(
                    {
                        text:message,
                        time:"13",
                        sender:sender
                    }
                )
                console.log(chats[i].messages)

            }
        }

        if(syncToServer){
            socket.emit("msg",{text:message,heading:alpha,chat:chatName})
        }


        //---update dom instantly
        var chatWindow = document.getElementById(chatName);//currentChat//document.getElementById(currentChat);
        var textNode = document.createTextNode(message)
        var chatMessage = document.createElement('h1');

        if(sender == "me"){
        chatMessage.className = 'chatMessageSent'
        }else{
            chatMessage.className = "chatMessage"
        }
        chatMessage.appendChild(textNode)
        chatWindow.appendChild(chatMessage)
        // socket.emit("msg",{text:message,heading:alpha}) //!Update this to show the chat name
        let scroll = 100+lastScroll;
        chatWindow.scroll({
            top: scroll,
            // left: 100,
            behavior: 'smooth'
          });

          lastScroll = scroll;
    }








    //run on startup:
    function onLoad(){
        setCompass();
        createChats();
    }
    