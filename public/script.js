const socket = io("http://localhost:3000");
const messageForm = document.getElementById("send-container");
const messageContainer = document.getElementById("message-container");
const messageInput = document.getElementById("message-input");

const name = "Anton";
appendMessage("You joined");
socket.emit("new-user", name);

socket.on("chat-message", data => {
    appendMessage(`${data.name}: ${data.message}`);
});

messageForm.addEventListener("submit", e => {
    e.preventDefault();

    const messageInputInformation = messageInput.value;

    appendMessage(`You: ${messageInputInformation}`);

    socket.emit("send-chat-message", messageInputInformation);

    messageInput.value = "";
})

function parseMessage(message) {
    // FontAwesome
    const SMILE = `<i class="far fa-smile-wink"></i>`;
    const COFFEE = `<i class="fas fa-coffee"></i>`;

    // Emoji
    const LIKE = String.fromCodePoint(0x1f44d);
    const NO_LIKE = String.fromCodePoint(0x1f44e);
    const GRIN = String.fromCodePoint(0x1f601);
    const BURGER = String.fromCodePoint(0x1f354);

    // Turns the messageData String into an array of strings with one word each
    messageArray = message.split(" ");

    let newMessage = "";

    messageArray.forEach(element => {
        switch (element) {
            case "/smile":
                newMessage += `${SMILE}`;
                break;
            case "/coffee":
                newMessage += `${COFFEE}`;
                break;
            case "/like":
                newMessage += LIKE;
                break;
            case "/nolike":
                newMessage += NO_LIKE;
                break;
            case "/grin":
                newMessage += GRIN;
                break;
            case "/burger":
                newMessage += BURGER;
                break;
            default:
                newMessage += element;
        }
        newMessage += " ";
    });
    return newMessage;
}

function appendMessage(message) {
    const messageElement = document.createElement("div");
    let newMessage = parseMessage(message);
    messageElement.innerHTML = newMessage;
    messageContainer.append(messageElement);
}

socket.on("user-connected", name => {
    appendMessage(`${name} connected`);
});

socket.on("user-disconnected", name => {
    appendMessage(`${name} disconnected`);
});