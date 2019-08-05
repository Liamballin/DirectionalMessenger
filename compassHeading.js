    // var io = top.glob()
    var socket = top.glob;
    // socket.emit("hello","From compass heading..")


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



        var alpha;
        var accuracy;
        var currentChat;
        var compassMode; //! 1 = iphone - actual magnetic compass
                         //! 2 = android - calibrated accelleromter
                         //! 3 = desktop - completely manual compass
       
        window.addEventListener('deviceorientation', function(event) {
            if (typeof event.webkitCompassHeading !== "undefined") {
                var alpha = event.webkitCompassHeading; //iOS non-standard
                var accuracy = event.webkitCompassAccuracy;
                onDeviceMove(alpha,accuracy)
            }
            else 
            {
                // alert("Your device is reporting relative alpha values, so this compass won't point north! ");
                var heading = 360 - alpha; //heading [0, 360)
                document.getElementById("heading").innerHTML = heading.toFixed([0]);
            }

        // if (window.DeviceOrientationAbsoluteEvent) {
        //   window.addEventListener("DeviceOrientationAbsoluteEvent", deviceOrientationListener);
        // } // If not, check if the device sends any orientation data
        // else if(window.DeviceOrientationEvent){
        //   window.addEventListener("deviceorientation", deviceOrientationListener);
        // } // Send an alert if the device isn't compatible
        // else {
        //   alert("Sorry, try again on a compatible mobile device!");
        // }
      
        var message = document.getElementById('testMessage');
        var messageAngle = 100;

        var distance = Math.floor(Math.abs(alpha-messageAngle))

        // if(distance < 10){
        //     document.getElementById('testMessage').style.opacity = inter(distance,0,10,1,0);//innerHTML = distance//style.opacity = str(inter(Math.abs(alpha-messageAngle),0,10,0,1));
        // }else{
        //     document.getElementById('testMessage').style.opacity = 0;//innerHTML = "Test message";
        // }

    })  

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
        // newSize = 5;
        document.getElementById("accuracyCircle").style.webkitTransform = "scale("+newSize+")"
        document.getElementById("sendButton").value = acc;
    }

    function rotateCompass(deg){
        var chatAngle = 75;
        
        var div = document.getElementById("compassRing")
        div.style.webkitTransform = 'rotate('+deg+"deg)"
        
        // var chat = document.getElementById("currentChat")
        // var distance = (Math.abs(alpha - chatHeading));



        // var heading = deg;
        // var distance = Math.floor(Math.abs(heading-chatAngle))
        // document.getElementById("sendButton").value = distance;
        // chat.style.opacity = inter(distance,0,10,1,0)
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

            // var title = document.createTextNode(chats[i].name)
            // title.className = "title"
            // newChat.append(title)
            chatParent.appendChild(newChat)
            // document.getElementById(newChat.id).style.webkitTransform = "rotate("+getOppAngle([i].heading)+"deg)"

        }
    }

    function updateChatOpacity(alpha){
        // console.log("Updating opacity")

        var visibleThreshholdDegrees = 20;

        for(i=0;i<chats.length;i++){
            var chatHeading = chats[i].heading;
            //get opposite angle instead of matching
            var distance = (Math.abs(alpha - chatHeading));

            if( distance < visibleThreshholdDegrees){
                // console.log("Within 10deg of "+chats[i].name)
                var newOpacity = inter(distance, 0, visibleThreshholdDegrees,1,0)
                document.getElementById(chats[i].name).style.opacity = newOpacity;
                currentChat = document.getElementById(chats[i].name);
                var degrees = inter(distance,0,10,45,0);
                // document.getElementById(chats[i].name).style.webkitTransform = "rotate("+(alpha*-1)+"deg)";
            }else{

                // console.log("Not close to any chats")
                // console.log("Alpha = "+alpha)
                // console.log("chat heading = "+chatHeading)
                // document.getElementsByName(chats[i].name).style.opacity = 0;
                document.getElementById(chats[i].name).style.opacity = 0;
                // document.getElementById(chats[i].name).style.webkitTransform = "rotate(180deg)";


            }
        }
    }






// function getDistance(a,b){
//     if(a-b) < 0
// }


    //run on startup:
    function onLoad(){
        createChats();
    }
    