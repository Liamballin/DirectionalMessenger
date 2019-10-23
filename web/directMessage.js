var io = io();

    var user = {
        name:"",
        loaded:false,
        alpha:0,
        chats:[],
        visibleThresh:20,
        activeChat:"",
        offset:undefined,
        androidHeadingSet:false,
        fadeOutMs:20000
    }

    const bStates = Object.freeze({
        empty:1,
        open:2,
        loaded:3,
    })

    var buttonState = {
        text:"",
        state:bStates.empty
    }

    io.on("name",(name)=>{
        user.name = name;
        console.log("Logged in as "+name);
    })



    io.on("startChats", (startChats)=>{
        user.chats = startChats;
        user.loaded = true;
        // console.log("Loaded chats")
        // console.log(startChats);
        // console.log("Chats loaded..")
        //  ();
        renderChat();
    })

    function button(){
        if(buttonState.state == bStates.empty){
            buttonState.state = bStates.open;
        }else if(buttonState.state == bStates.open){
            buttonState.state = bStates.loaded;
        }else if(buttonState.state == bStates.loaded){
            sendMessage();
            buttonState.state = bStates.empty;
        }

        //! A way to find key in object by value
        // console.log(Object.keys(bStates).find(key => bStates[key]===buttonState.state))
        renderButton();
    }

    function serverSync(){
        io.emit("update", user.chats);
    }

    function sendMessage(){
        renderChat()
        var message = {
  
            sender:user.name,
            id:uuidv4(),
            text:document.getElementById("openTextbox").value,
            time:new Date()
        }
        
        document.getElementById("openTextbox").value = "";

        // console.log(message)
        // console.log("Active chat: "+user.activeChat)

        if(user.activeChat){ 
            var index = chatIndexFromId(user.activeChat)     
            if(index == undefined){
                // console.log("Idnotfound")
            }else{
                user.chats[index].messages.push(message)
                // console.log(user.chats)
            }    
        }else{
            var newChat = {
                id:uuidv4(),
                heading:user.alpha,
                messages:[]
            }

            newChat.messages.push(message);
            user.chats.push(newChat)
            
        }

        serverSync();   //sync with server

    }

    function chatIndexFromId(id){
        for(i =0;i<user.chats.length;i++){
            if(user.chats[i].id === id){
                return i;
            }
        }
        return false;   //if chat not found
    }

    function setActiveChat(){
        var alpha = user.alpha;
        var found = false;
        for(i =0;i<user.chats.length;i++){
            var curChat = user.chats[i];
            var dist = calcHeadingDistance(alpha, curChat.heading);
            if(dist < user.visibleThresh){
                user.activeChat = curChat.id;
                found = true;
                document.getElementById(curChat.id).style.opacity = inter(dist,user.visibleThresh, 0, 0, 1);
            }else{
                document.getElementById(curChat.id).style.opacity = "0";
            }
        }
        if(!found){
            user.activeChat = undefined;
        }
    }

    function calcHeadingDistance(a,h2){
        // var distances = [
        // ]; //array with two values: h distance and -h distance (inverse angle )
        return(Math.min(getDistance(a,h2), getDistance(a, getOppAngle(h2))));
    }

    function getOppAngle(angle){
        if(angle+180>360){
            return angle-180;
        }else{
            return angle+180;
        }
    }

    function circularize(angle){
        if(angle > 360){
            return angle - 360;
        }else if(angle < 0){
            return angle + 360;
        }else{
            return angle
        }
    }

    function getDistance(a,b){
        if(b+user.visibleThresh > 360 || b-user.visibleThresh < 0){
            b = getOppAngle(b);
            a = getOppAngle(a);
        }
        if(Math.abs(Math.max(a,b) - Math.min(a,b)) > 180){
            return 360 - Math.abs(Math.max(a,b) - Math.min(a,b));
        }else{
            return (Math.abs(Math.max(a,b) - Math.min(a,b)));
        }
        
    }


    function setCompass(){
        //! FOR FLICK MOVEMENT DETECTION
        // if (window.DeviceMotionEvent) {
        //     window.addEventListener('devicemotion', deviceMotionHandler);
        //   }

        window.addEventListener('deviceorientation', function(event) {
            if (typeof event.webkitCompassHeading !== "undefined") {
                // console.log("Adding magnetic compass listener")
                var    alpha = event.webkitCompassHeading; 
                // if(!user.androidHeadingSet){
                //     show("popup")
                // }
                onDeviceMove(alpha)
            }else{
                if(typeof window.DeviceOrientationEvent !== "undefined"){
                    //android
                    // if(!headingSet){
                    //     showPopup(true)
                    // }
                    if(!user.androidHeadingSet){
                        show("popup")
                    }
                // console.log("adding scroll listener")
                window.addEventListener("wheel", (event)=>{
                    var delta = Math.sign(event.deltaY);
                    var alpha = user.alpha;
                    alpha += delta*2;
                    if(alpha >= 360){
                        alpha = 0;
                    }else if(alpha < 0){
                        alpha = 360;
                    }
                    onDeviceMove(alpha)
                })
                // onDeviceMove(alpha);


                }else{
                    //dont think this will ever work
                    // console.log("Desktop client?")
                    alert("Desktop")
                
                // console.log("adding scroll listener")
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
            }
        })      
    }

    function confirmHeadingOld(){
        var reading;
        window.addEventListener("deviceorientation", (e)=>{
            // alert(offset)
            reading = e.alpha;
            if(user.offset == undefined){
                user.offset = getDistance(e.alpha, 0);
            }
            let a = (-(e.alpha)+(user.offset)) 
                if(a>=360){
                    a -= 360
                }else if(a < 0){
                    a += 360;
                }
                user.alpha = a;
        document.getElementById("info_acc").innerHTML = "Acc: "+reading;
        document.getElementById("info_off").innerHTML = "Off: "+user.offset;
        document.getElementById("info_hea").innerHTML = "Hea: "+user.alpha;
            onDeviceMove(user.alpha)
        }); //remove true? 
        hide("popup");
        user.androidHeadingSet = true;
    
    }

    function confirmHeading(){

        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
.then(response => {
  if (response == 'granted') {
    window.addEventListener('deviceorientation', (e) => {
        var alpha = circularize(-1*e.alpha);
        if(!user.androidHeadingSet){
            renderChat();
        }
        onDeviceMove(alpha);
    })
  }
})
.catch(console.error)
          } else {
            window.addEventListener("deviceorientation",(e)=>{
                // user.alpha = -1*e.alpha;
                var alpha = circularize(-1*e.alpha);
                if(!user.androidHeadingSet){
                    renderChat();
                }
                onDeviceMove(alpha);
            })
          }







        hide("popup");
        user.androidHeadingSet = true;
    }

    function onDeviceMove(alpha){
        user.alpha = alpha;
        rotateCompass(alpha)
        setActiveChat();
    }

    var threshold = 150;
    function deviceMotionHandler(event){
        let a = event.rotationRate.beta;
        if(a > threshold && buttonState.state == bStates.loaded){
            sendMessage();
            buttonState.state = bStates.empty;
            renderButton()
        }
    }

    function textboxColor(){
        var tb = document.getElementById("openTextbox");
        if(tb.value.length > 0){
            tb.className = "tbRed"
            document.getElementById("buttonOpenRed").style.opacity = 1;
            document.getElementById("buttonOpen").style.opacity = 0;


        }else{
            tb.className = "tbBlack"
            document.getElementById("buttonOpenRed").style.opacity = 0;
            document.getElementById("buttonOpen").style.opacity = 1;
        }
    }

        function rotateCompass(deg){
        var chatAngle = 75;
        
        var div = document.getElementById("dial")
        div.style.webkitTransform = 'rotate('+-1*deg+"deg)"
        var pips = document.getElementsByClassName("pip");
        // pips.forEach((pip)=>{
        //     pip.style.webkitTransform = 'rotate('+deg+")"
        // })
        for(i = 0; i < pips.length;i++){
            pips[i].style.webkitTransform = 'rotate('+ -1*circularize(deg-(pips[i].id))+"deg)"
           // console.log(circularize(deg-(pips[i].id)))
        }

        
    }
 
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

    function loaded(){
        window.addEventListener("offline",()=>{
            console.log("Client recognizes offline")
            window.location.href = "/offline";
        })
        hide("popup")
        hide("flickInfo")
        document.getElementById("popupIcon").addEventListener("click", ()=>{
            confirmHeading();
        })

        document.getElementById("qMark").addEventListener("click",()=>{
            window.location.href = "http://adirectmessage.to"
        })

        document.getElementById("openTextbox").addEventListener("input",()=>{
            textboxColor();
        })

        setInterval(updateMessageOpacity, 500);

        // setCompass();   //add event listeners
        show("popup");
        setButtons();
        renderChat();   //create initial html elements 
        renderButton() // start button states
        onDeviceMove(0);    // set heading at 0 to set opacities

  
    }

    function setButtons(){

        document.getElementById("buttonOpenRed").addEventListener("click", ()=>{
            button()
        })
        document.getElementById("buttonLoaded").addEventListener("click", ()=>{
            button()
        })
        document.getElementById("buttonEmpty").addEventListener("click", ()=>{
            button()
        })

        document.getElementById("editButton").addEventListener("click",()=>{
            buttonState.state = bStates.open;
            renderButton()
        })
    }

    function setPips(){
        document.getElementById("pipParent").innerHTML = "";

        for(i = 0; i < user.chats.length;i++){
          
                var heading = user.chats[i].heading;
                var headingO = getOppAngle(heading); 

                var p = document.createElement("img");
                p.className = "pip";
                p.src = "images/pip.png";
                p.style.transform = "rotate("+heading+"deg)";
                p.id = heading;
                

                var pO = document.createElement("img");
                pO.className = "pip";
                pO.src = "images/pip.png";
                pO.style.transform = "rotate("+headingO+"deg)";
                pO.id = headingO;
                

                
                document.getElementById("pipParent").appendChild(p);
                document.getElementById("pipParent").appendChild(pO);
        }
    }



    function createChatElement(id){
        var c = document.createElement("div");  //create new element
            c.className = "chat"; 
            c.id = id;

            return c;
    }

    function updateMessageOpacity(){

        var currentTime = new Date();

        if(user.chats.length > 0){

            for(c = 0; c < user.chats.length;c++){
                var latest = undefined;
                
                for(i = 0; i< user.chats[c].messages.length;i++){
                    var age = currentTime - new Date(user.chats[c].messages[i].time);
                    // if(age > )
                    var opacity = inter(age,user.fadeOutMs,0,0,1)
                    
                    if(document.getElementById(user.chats[c].messages[i].id)){
                        if(opacity < 0){
                            document.getElementById(user.chats[c].messages[i].id).style.opacity = 0;
                        }else{
                            document.getElementById(user.chats[c].messages[i].id).style.opacity = opacity;
                        }
                    }
                    if(opacity > latest || latest == undefined){
                        latest = opacity;
                    }

                    console.log(opacity)
                }

                var pip1 = document.getElementById(user.chats[c].heading);
                var pip2 = document.getElementById(getOppAngle(user.chats[c].heading))
                pip1.style.opacity = latest;
                pip2.style.opacity = latest;

                if(latest <= 0){
                    deleteChat(user.chats[c])
                    serverSync()
                }

            }
        }
    }

    function deleteChat(chatObject){
        user.chats = removeModel(user.chats, chatObject);
        renderChat()
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

    function renderChat(){
      
            document.getElementById("chatParent").innerHTML  = "";
        if(user.chats.length>0){

        for(var ci = 0; ci < user.chats.length;ci++){    //loop through every chat 
            var currentChat = user.chats[ci];
            var c = createChatElement(currentChat.id);
            c.className = "chatElement"


            if(currentChat.messages){ //check if chat has any messages to render
                var start = 0;
                var max = 5;
                if(currentChat.messages.length > max){
                    var start = currentChat.messages.length - max;
                }
            
                for(i = start; i < currentChat.messages.length;i++){
                    // var t=  document.createTextNode(currentChat.messages[i].sender+":   "+currentChat.messages[i].text);
                    var t=  document.createTextNode(currentChat.messages[i].text);

                    var container = document.createElement("div");
                    container.id = currentChat.messages[i].id;
                    if(currentChat.messages[i].sender == user.name){
                        container.className = "message sent";
                    }else{
                        container.className = "message receive";
                    }

                   


                    container.appendChild(t);
                    c.appendChild(container);
                    // updateMessageOpacity()
            }
        }else{
            // console.log("No messages");
            // console.log(currentChat)
        }

        document.getElementById("chatParent").appendChild(c);
    }
    setActiveChat();    //update opacities
        setPips();
        rotateCompass();
        updateMessageOpacity()
    }
    }

    var buttonModes = {     //for dynamic document.get?
        empty:"buttonModeEmpty",
        open:"buttonModeOpen",
        loaded:"buttonModeLoaded",
        dial:"dialParent",

    }

    function hide(id){
        document.getElementById(id).style.display = "none";
        document.getElementById(id).style.pointerEvents = "none";
        // document.getElementById(id).style.zIndex = "50";

    }
    function show(id){
        document.getElementById(id).style.display = "block";
        document.getElementById(id).style.pointerEvents = "all";
        // document.getElementById(id).style.zIndex = "-50";

    }

    function renderButton(){
        var state = buttonState.state;
        // console.log("button render start")

        if(state == bStates.empty){
            // document.getElementById(buttonModes.open).style.display = "none";
            // document.getElementById(buttonModes.loaded).style.display = "none";
            // document.getElementById(buttonModes.empty).style.display = "1";
            hide(buttonModes.open);
            hide(buttonModes.loaded);
            show(buttonModes.empty);
            show(buttonModes.dial)
            hide("flickInfo")
        }else if(state == bStates.open){
            show(buttonModes.open);
            hide(buttonModes.loaded);
            hide(buttonModes.empty);
            hide(buttonModes.dial);
            hide("flickInfo")
            document.getElementById("openTextbox").focus();
        }else if(state == bStates.loaded){
            hide(buttonModes.open);
            show(buttonModes.loaded);
            hide(buttonModes.empty);
            show(buttonModes.dial)
            show("flickInfo")
        }

    }
//     function renderChat(){
//     console.log(user.chats);
//     for(chat = 0; chat < user.chats.length;chat++){
//         var currentChat = user.chats[chat][0];
//         console.log(currentChat.messages[0].text)
//         for(message = 0; message < currentChat.messages.length;message++){
//             console.log(currentChat.messages[message])
//         }
//     }
// }

    function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}