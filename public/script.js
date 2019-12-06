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

function parseMessage(messageData) {
    // FontAwesome
    const SMILE = `<i class="far fa-smile-wink"></i>`;
    const LIKE = String.fromCodePoint(0x1f44d);
}

function appendMessage(messageData) {
    const messageElement = document.createElement("div");
    messageElement.innerText = messageData;
    messageContainer.append(messageElement);
}

socket.on("user-connected", name => {
    appendMessage(`${name} connected`);
});

socket.on("user-disconnected", name => {
    appendMessage(`${name} disconnected`);
});