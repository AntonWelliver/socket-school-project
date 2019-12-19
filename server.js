const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const users = [];

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

class ChatRoom {

    constructor(roomname, password = "") {
        this.roomname = roomname;
        this.password = password;
        this.users = [];
    }

    addUser(socketId, username) {
        this.users.push({ socketId: socketId, username: username });
    }

    removeUser(socketId) {
        let userIndex = 0;
        let userFound = false;

        this.users.forEach((user, index) => {
            if (user.socketId === socketId) {
                userFound = true;
                userIndex = index;
            }

            if (userFound === true) {
                this.users.splice(userIndex, 1);
            }
        });
    }

    getUser(socketId) {
        let username = "";

        this.users.forEach(user => {
            if (user.socketId === socketId) {
                username = user.username;
            }
        });
        return username;
    }

    userIsInList(socketId) {
        let isInList = false;

        this.users.forEach(user => {
            if (user.socketId === socketId) {
                isInList = true;
            }
        });
        return isInList;
    }

    printOut() {
        console.log(`room: ${this.roomname} password: ${this.password}`);
        this.users.forEach((user, index) => {
            console.log(`User: ${index} ${user.username} ${user.socketId}`);
        });
    }
}

class ChatRooms {
    constructor() {
        this.chatRoomList = [];
    }
    addChatroom(chatRoomName) {
        let room = new ChatRoom(chatRoomName);
        this.chatRoomList.push(room);
    }
    addNickname(chatRoomName, name, socketId) {
        this.chatRoomList.forEach(chatRoom => {
            if (chatRoom.roomname === chatRoomName) {
                chatRoom.addUser(socketId, name)
            }
        });
    }
    getUserBySocketId(chatRoomName, socketId) {
        let userName = "";
        let userFound = false;

        if (chatRoomName === "") {
            this.chatRoomList.forEach(room => {
                if (userFound === false) {
                    userName = room.getUser(socketId);
                    if (userName != "") {
                        userFound = true;
                    }
                }
            })
        } else {
            this.chatRoomList.forEach(chatRoom => {
                if (chatRoom.roomname === chatRoomName) {
                    userName = chatRoom.getUser(socketId)
                }
            });
        }
        return userName;
    }
    getRoomBySocketId(socketId) {
        let chatRoomName = "";
        let userName = "";
        let userFound = false;

        this.chatRoomList.forEach(room => {
            if (userFound === false) {
                userName = room.getUser(socketId);
                if (userName != "") {
                    userFound = true;
                    chatRoomName = room.roomname;
                }
            }
        })
        return chatRoomName;
    }
    removeNickname(socketId) {
        let userFound = false;
        let chatRoomName = "";

        this.chatRoomList.forEach(room => {
            if (userFound === false) {
                if (room.userIsInList(socketId) === true) {
                    userFound = true;
                    chatRoomName = room.roomName;
                    room.removeUser(socketId);
                }
            }
        });
        return chatRoomName;
    }
    getChatRoomsList() {
        let roomList = [];
        this.chatRoomList.forEach(room => {
            roomList.push(room.roomname);
        });
        return roomList;
    }
    checkExistingChatroom(chatRoomName) {
        let roomFound = false;
        this.chatRoomList.forEach(room => {
            if (room.roomname === chatRoomName) {
                roomFound = true;
            }
        });
        return roomFound;
    }
    deleteChatroom(chatRoomName) {
        let chatRoomIndex = 0;
        let chatRoomFound = false;

        this.chatRoomList.forEach((chatRoom, index) => {
            if (chatRoom.roomname === chatRoomName) {
                chatRoomFound = true;
                chatRoomIndex = index;
            }

        });
        if (chatRoomFound === true) {
            this.chatRoomList.splice(chatRoomIndex, 1);
        }
        return chatRoomFound;
    }
    printOut() {
        this.chatRoomList.forEach(room => {
            room.printOut();
        });
    }
}

const rooms = new ChatRooms();

app.get("/", (req, res) => {
    let chatRoomList = rooms.getChatRoomsList();

    res.render("index", { chatRooms: chatRoomList });
})

app.post("/room", (req, res) => {
    if (rooms.checkExistingChatroom(req.body.room) === false) {
        rooms.addChatroom(req.body.room);
    } else {
        return res.redirect("/");
    }
    res.redirect(req.body.room);
});

app.get("/:chatRoom", (req, res) => {
    res.render("chat", { chatRoomName: req.params.chatRoom });
});

app.post("/:chatRoom", (req, res) => {
    rooms.deleteChatroom(req.params.chatRoom);

    return res.redirect(`/`);
})

server.listen(3000);

io.on("connection", socket => {
    console.log("connected");

    socket.on("new-user", (chatRoomName, name) => {
        socket.join(chatRoomName);

        rooms.addNickname(chatRoomName, name, socket.id);

        socket.to(chatRoomName).broadcast.emit("user-connected", name);
    });

    socket.on("send-chat-message", (chatRoomName, messageInputInformation) => {
        let userName = rooms.getUserBySocketId(chatRoomName, socket.id);
        socket.to(chatRoomName).broadcast.emit("chat-message", {
            message: messageInputInformation,
            name: userName
        });
    });

    socket.on("disconnect", () => {
        let userName = rooms.getUserBySocketId("", socket.id);
        let roomName = rooms.getRoomBySocketId(socket.id);
        if (userName != "") {
            rooms.removeNickname(socket.id);
            socket.to(roomName).broadcast.emit("user-disconnected", userName);
        }
    });
});

console.log("Server Started")
