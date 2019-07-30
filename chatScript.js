
var socket = top.glob;
socket.emit("hello","from chatScript")

function sendChat(){
    var chatText = document.getElementById('textInput').value;
    document.getElementById('textInput').value = "";

    socket.emit("msg",{text:chatText,heading:top.heading})
}