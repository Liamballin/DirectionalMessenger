
var socket = top.glob;
// socket.emit("hello","from chatScript")

function sendChat(){
    var chatText = document.getElementById('textInput').value;
    document.getElementById('textInput').value = "";
    
    var chatWinow = document.getElementById("currentChat")
    var textNode = document.createTextNode(chatText)
    var chatDiv = document.createElement('div');
    chatDiv.class = 'chatMessage'
    chatDiv.appendChild(textNode)
    chatWinow.appendChild(chatDiv)

    socket.emit("msg",{text:chatText,heading:top.heading})
}