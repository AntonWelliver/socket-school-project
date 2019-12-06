const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const users = [];

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {

    let chatRoomList = ["Chat"];
    /*     let chatRoomList = chatRooms.getChatRoomsList(); */

    res.render("index", { chatRooms: chatRoomList });
})

app.get("/:chatRoom", (req, res) => {


    res.render("chat", { chatRoomName: req.params.chatRoom });
});

server.listen(3000);

io.on("connection", socket => {
    console.log("connected");

    socket.on("new-user", name => {
        console.log(`new-user ${name}`);
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
