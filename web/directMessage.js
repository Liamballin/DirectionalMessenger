var io = io();

    var user = {
        name:"",
        loaded:false,
        alpha:0,
        chats:[],
        visibleThresh:20,
        activeChat:""
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
        console.log(startChats);
        console.log("Chats loaded..")
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
        console.log(Object.keys(bStates).find(key => bStates[key]===buttonState.state))
        renderButton();
    }

    function serverSync(){
        io.emit("update", user.chats);
    }

    function sendMessage(){

        var message = {
  
            sender:user.name,
            id:uuidv4(),
            text:document.getElementById("openTextbox").value,
            time:new Date()
        }
        
        document.getElementById("openTextbox").value = "";

        console.log(message)
        console.log("Active chat: "+user.activeChat)

        if(user.activeChat){ 
            var index = chatIndexFromId(user.activeChat)     
            if(index == undefined){
                console.log("Idnotfound")
            }else{
                user.chats[index].messages.push(message)
                console.log(user.chats)
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
        console.log("Hello from chatIndex finder")
        for(i =0;i<user.chats.length;i++){
            console.log("at loop "+i)
            if(user.chats[i].id === id){
                console.log("Match with "+user.chats[i].id+" and "+id);

                return i;
            }
            console.log("No match")
            console.log(user.chats[i].id+" and "+id);
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

    // function setCompass(){
    //     console.log("Adding device listener")
    //         window.addEventListener("wheel", (event)=>{
    //                     var delta = Math.sign(event.deltaY);
    //                     var alpha = user.alpha;
    //                     alpha += delta*2;
    //                     if(alpha >= 360){
    //                         alpha = 0;
    //                     }else if(alpha < 0){
    //                         alpha = 360;
    //                     }
    //                     onDeviceMove(alpha)

    //                 })
    //     }
    function setCompass(){
        //! FOR FLICK MOVEMENT DETECTION
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', deviceMotionHandler);
          }

        window.addEventListener('deviceorientation', function(event) {
            if (typeof event.webkitCompassHeading !== "undefined") {
                // console.log("Adding magnetic compass listener")
                var    alpha = event.webkitCompassHeading; 

                onDeviceMove(alpha)
            }else{
                if(typeof window.DeviceOrientationEvent !== "undefined"){
                    //android
                    // if(!headingSet){
                    //     showPopup(true)
                    // }
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
        }
    }

    function rotateCompass(deg){
        var chatAngle = 75;
        
        var div = document.getElementById("dial")
        div.style.webkitTransform = 'rotate('+deg+"deg)"
        // var pips = document.getElementsByClassName("pip");
        // pips.forEach((pip)=>{
        //     pip.style.webkitTransform = 'rotate('+deg+")"
        // })
        // div.style.webkitTransform = 'rotate('+deg+"deg)"

        
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
        setCompass();   //add event listeners
        setButtons();
        renderChat();   //create initial html elements 
        renderButton() // start button states
        onDeviceMove(0);    // set heading at 0 to set opacities

  
    }

    function setButtons(){

        document.getElementById("buttonOpen").addEventListener("click", ()=>{
            console.log("open button pressed")
            button()
        })
        document.getElementById("buttonLoaded").addEventListener("click", ()=>{
            console.log("loaded button pressed")
            button()
        })
        document.getElementById("buttonEmpty").addEventListener("click", ()=>{
            console.log("empty button pressed")
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
            var p = document.createElement("img");
            p.className = "pip";
            p.src = "images/pip.png";
            p.style.transform = "rotate("+user.chats[i].heading+"deg)";
            p.id = user.chats[i].heading;
            console.log("adding pip at heading "+user.chats[i].heading)
            document.getElementById("pipParent").appendChild(p);
        }
    }



    function createChatElement(id){
        var c = document.createElement("div");  //create new element
            c.className = "chat"; 
            c.id = id;

            return c;
    }

    function renderChat(){
            document.getElementById("chatParent").innerHTML  = "";
        console.log(user);
        if(user.chats.length>0){
        for(var ci = 0; ci < user.chats.length;ci++){    //loop through every chat 
            var currentChat = user.chats[ci];
            var c = createChatElement(currentChat.id);

            if(currentChat.messages){ //check if chat has any messages to render
            for(i = 0; i < currentChat.messages.length;i++){
                // var t=  document.createTextNode(currentChat.messages[i].sender+":   "+currentChat.messages[i].text);
                var t=  document.createTextNode(currentChat.messages[i].text);

                var container = document.createElement("div");
                if(currentChat.messages[i].sender == user.name){
                    container.className = "message sent";
                }else{
                    container.className = "message receive";
                }
                container.appendChild(t);
                c.appendChild(container);
            }
        }else{
            console.log("No messages");
            console.log(currentChat)
        }

        document.getElementById("chatParent").appendChild(c);
    }
    setActiveChat();    //update opacities
    // setPips();
    }
    }

    var buttonModes = {     //for dynamic document.get?
        empty:"buttonModeEmpty",
        open:"buttonModeOpen",
        loaded:"buttonModeLoaded",
        dial:"dial"
    }

    function hide(id){
        document.getElementById(id).style.display = "none";
        document.getElementById(id).style.pointerEvents = "none";
        document.getElementById(id).style.zIndex = "50";

    }
    function show(id){
        document.getElementById(id).style.display = "block";
        document.getElementById(id).style.pointerEvents = "all";
        document.getElementById(id).style.zIndex = "-50";

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
        }else if(state == bStates.open){
            show(buttonModes.open);
            hide(buttonModes.loaded);
            hide(buttonModes.empty);
            hide(buttonModes.dial);
            document.getElementById("openTextbox").focus();
        }else if(state == bStates.loaded){
            hide(buttonModes.open);
            show(buttonModes.loaded);
            hide(buttonModes.empty);
            show(buttonModes.dial)
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