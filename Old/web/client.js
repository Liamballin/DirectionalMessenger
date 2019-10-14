console.log("client.js started")

class chatClient {
    currentChat;
    chats = [];
    constructor(sock){
        this.socket = sock;
        this.socket.on("chats", (cs)=>{
            chats = cs;
            updateDom();
        })
    }



    sendChat(text, alpha){
        //!If the chat exists ->
            //! add to that chat
        //!else
            //!Create new Chat
    }

    updateDom(){
        //reCreatethe dom from blank
        //craete pips
        //create chats
        
    }
}