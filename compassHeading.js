    var socket = top.glob;  // import the same socket instance that is already initialized.


    var chats = [
        {
            name:"testChat",    //!this should be a UUID? to identify which person moved??
            heading:00,
            messages:[
                {
                    text:"Heading 00",
                    time:"123456",
                    sender:"me"
                },
                {
                    text:"MEssage 1 this a long message to test whether this element should be a div or a text element like H1",
                    time:"123456",
                    sender:"user2"
                },
                {
                    text:"another message",
                    time:"123456",
                    sender:"me"
                },
                {
                    text:"the third message",
                    time:"123456",
                    sender:"user2"
                },
                {
                    text:"four four",
                    time:"123456",
                    sender:"me"
                },
                {
                    text:"👌👌👌👌",
                    time:"123456",
                    sender:"user2"
                }
            ]
        },
        {
            name:"chat2",    //!this should be a UUID? to identify which person moved??
            heading:270,
            messages:[
                {
                    text:"heading 270;from CHAT 2WOOO!!",
                    time:"1236636",
                    sender:"me"
                }
            ]
        },
        {
            name:"chat3Baby",    //!this should be a UUID? to identify which person moved??
            heading:100,
            messages:[
                {
                    text:"heading 100;from CHAT THEE!!",
                    time:"1236636",
                    sender:"user69"
                }
            ]
        }
    ]

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
        function test1(){
            compassMode = 1;
            console.log("mode 1")
            alpha = 0;
            setCompass();
        }
        function test2(){
            compassMode = 3;
            console.log("mode 2")
            setCompass();
        }

        function detectCompassMode(){
            console.log("Detecting compass mode..")
            var test = window.addEventListener("deviceorientation", (evt)=>{
                if(typeof event.webkitCompassHeading !== "undefined"){
                   test1();
                }else{
                    test2();

                }
            })
            
        }

        function setCompass(){
            if(compassMode == 1){
                console.log("Adding magnetic compass listener")
            window.addEventListener('deviceorientation', function(event) {
                if (typeof event.webkitCompassHeading !== "undefined") {
                    var alpha = event.webkitCompassHeading; 
                    var accuracy = event.webkitCompassAccuracy;
                    onDeviceMove(alpha,accuracy)
                }
                else 
                {
                    //! alert("Your device is reporting relative alpha values, so this compass won't point north! ");
                    var heading = 360 - alpha; 
                    document.getElementById("heading").innerHTML = heading.toFixed([0]);
                }
            })  
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

        }
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
        var chatParent = document.getElementById("chatParent");
        for(i =0; i<chats.length;i++){
            // console.log("Creating chat "+i)

            var newChat = document.createElement("div")
            newChat.className = "chat"
            newChat.id = chats[i].name;

            for(ii =0; ii< chats[i].messages.length;ii++){
                var newText = document.createTextNode(chats[i].messages[ii].text);
                var newMessage = document.createElement("H1");
                if(chats[i].messages[ii].sender == "me"){
                    newMessage.className = "chatMessageSent";
                }else{
                    newMessage.className = "chatMessage";
                }
                
                newMessage.appendChild(newText);
                newChat.appendChild(newMessage)
            }

            chatParent.appendChild(newChat)
            // document.getElementById(newChat.id).style.webkitTransform = "rotate("+getOppAngle([i].heading)+"deg)"

        }
    }

    function updateChatOpacity(alpha){
        var visibleThreshholdDegrees = 20;
        let found = false;
        for(i=0;i<chats.length;i++){
            var chatHeading = chats[i].heading;
            //get opposite angle instead of matching
            var distance = (Math.abs(alpha - chatHeading));

            if( distance < visibleThreshholdDegrees){
                // console.log("Within 10deg of "+chats[i].name)
                var newOpacity = inter(distance, 0, visibleThreshholdDegrees,1,0)
                document.getElementById(chats[i].name).style.opacity = newOpacity;
                currentChat = chats[i].name;
                
                currentChat = document.getElementById(chats[i].name);
                var degrees = inter(distance,0,10,45,0);
                found = true;
            }else{
                document.getElementById(chats[i].name).style.opacity = 0;
            }
        }

        if(!found){
            currentChat = undefined;
        }
        console.log(currentChat)
    }

    //---------------------- chat stuff ----------------

    function sendChat(){
        var chatText = document.getElementById('textInput').value;
        document.getElementById('textInput').value = "";

        if(currentChat){
            var chatWindow = currentChat//document.getElementById(currentChat);
            var textNode = document.createTextNode(chatText)
            var chatMessage = document.createElement('h1');
            chatMessage.className = 'chatMessageSent'
            chatMessage.appendChild(textNode)
            chatWindow.appendChild(chatMessage)
            socket.emit("msg",{text:chatText,heading:top.heading})
            // }else{
            //     console.log("Current chat was undefined")
            // }
        }else{
            alert("no chat selected!")
        }
    
        
    }








    //run on startup:
    function onLoad(){
        detectCompassMode();
        createChats();
    }
    