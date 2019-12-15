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
    getChatRoomsList() {
        let roomList = [];
        this.chatRoomList.forEach(room => {
            console.log(room.roomname);
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
    printOut() {
        console.log("Chatrooms:");
        this.chatRoomList.forEach(room => {
            room.printOut();
        });
    }
}

const rooms = new ChatRooms();

app.get("/", (req, res) => {

    let chatRoomList = rooms.getChatRoomsList();
    console.log(chatRoomList);

    res.render("index", { chatRooms: chatRoomList });
})

app.post("/room", (req, res) => {
    console.log(`provided room: ${req.body.room}`);

    if (rooms.checkExistingChatroom(req.body.room) === false) {
        rooms.addChatroom(req.body.room);
    } else {
        return res.redirect("/");
    }
    rooms.printOut();
    res.redirect(req.body.room);
});

app.get("/:chatRoom", (req, res) => {


    res.render("chat", { chatRoomName: req.params.chatRoom });
});

app.post("/:chatRoom", (req, res) => {
    console.log(`${req.params.chatRoom}`);
    console.log(`Delete ${req.body.deleteButton}`);

    return res.redirect(`/`);
})

server.listen(3000);

io.on("connection", socket => {
    console.log("connected");

    socket.on("new-user", name => {
        users[socket.id] = name;
        socket.broadcast.emit("user-connected", name);
    });

    socket.on("send-chat-message", messageInputInformation => {
        socket.broadcast.emit("chat-message", {
            message: messageInputInformation,
            name: users[socket.id]
        })
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("user-disconnected", users[socket.id]);
        delete users[socket.id];
    });
});

console.log("Server Started")
