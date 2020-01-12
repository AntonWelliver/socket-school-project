const socket = io("http://localhost:3000");
const messageForm = document.getElementById("send-container");
const messageContainer = document.getElementById("message-container");
const messageInput = document.getElementById("message-input");
const sendContainer = document.getElementById("send-container");
const dropdownMenu = document.getElementById("dropdown-menu");

const messageBox = document.getElementById("message-box");
const chatSignOn = document.getElementById("chat-sign-on");
const signOnBtn = document.getElementById("sign-on-button");
const nameInput = document.getElementById("name-input");
const userInfoBox = document.getElementById("user-info-box");

if (chatSignOn != null) {

    userInfoBox.classList.remove("d-none");
    messageBox.classList.add("d-none");

    signOnBtn.addEventListener("click", e => {
        e.preventDefault();
        const name = nameInput.value;

        userInfoBox.classList.add("d-none");
        messageBox.classList.remove("d-none");

        appendMessage(`You joined ${chatRoomName}`);
        socket.emit("new-user", chatRoomName, name);
    })
}

socket.on("chat-message", data => {
    appendMessage(`${data.name}: ${data.message}`);
});

messageForm.addEventListener("submit", e => {
    e.preventDefault();

    const messageInputInformation = messageInput.value;

    appendMessage(`You: ${messageInputInformation}`);

    socket.emit("send-chat-message", chatRoomName, messageInputInformation);

    messageInput.value = "";
});

messageInput.addEventListener("input", e => {
    e.preventDefault();

    let inputLength = messageInput.value.length;
    let lastChar = messageInput.value[inputLength - 1];

    if (lastChar === "/") {
        dropdownInput();
    }
    if (lastChar === " ") {
        clearDropdown();
    }
});

dropdownMenu.addEventListener("click", e => {
    e.preventDefault();

    messageInput.value += "smile ";
    clearDropdown();
});

messageInput.addEventListener("click", e => {
    e.preventDefault();

    clearDropdown();
});

function parseMessage(message) {
    // Turns the messageData String into an array of strings with one word each
    messageArray = message.split(" ");

    let newMessage = "";

    messageArray.forEach(element => {
        switch (element) {
            case "/smile":
                getGIF();
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

function dropdownInput() {
    let output = "";

    output += `<a class="dropdown-item" href="#">${"/smile"}</a>`;

    dropdownMenu.innerHTML = output;
    dropdownMenu.classList.add("show");
}

function clearDropdown() {
    let output = "";

    dropdownMenu.innerHTML = output;
    dropdownMenu.classList.remove("show");
}

function getGIF() {
    const apiKey = "ww7HhGCmnkyQoReh1CdcmQA6Ld82y3Fl";
    let url = `http://api.giphy.com/v1/gifs/search?q=smiley&api_key=${apiKey}&limit=1`;

    fetch(url)
        .then(response => response.json())
        .then(content => {
            let fig = document.createElement("figure");
            let img = document.createElement("img");
            img.src = content.data[0].images.downsized.url;
            img.alt = content.data[0].title;
            fig.appendChild(img);
            messageContainer.append(fig);
        })
        .catch(err => {
            console.log(err);
        })
}

socket.on("user-connected", name => {
    appendMessage(`${name} connected`);
});

socket.on("user-disconnected", name => {
    appendMessage(`${name} disconnected`);
});