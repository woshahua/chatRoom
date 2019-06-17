"use strict";

const socketio = require("socket.io");
const io;
var guestNumber = 1;
var nickNames = {};
var nameUsed = [];
var currentName = {};

exports.listen = function(server){
    io = io.listen(server);
    io.set("log level", 1);
    io.sockets.on("connection", function(socket){
        guestNumber = assignGuestName(socket, guestNumber, nickNames, nameUsed);
        joinRoom(socket, "Lobby");
    })
}

function assignGuestName(socket, guestNumber, nickNames, nameUsed){
    var name = "Guest" + guestNumber;
    nickNames[socket.id] = name;
    socket.emit("nameResult", {
        sucess: true,
        name: name
    });
    nameUsed.push(name);
    return guestNumber + 1
};

function joinRoom(socket, room){
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit("joinResult", {room: room});
    socket.broadcast.to(room).emit("message", {
        text: nickNames[socket.id] + "has joined" + room + "."
    });
    var userInRoom = io.socket.clients(room); // get current user in room
    if (usersInRoom.length > 1){
        var userInRoomSummary = "Users currently in " + room + ":";
        for(let index in userInRoom){
            let userSocketId = usersInRoom[index].id;
            if (userSocketId != socket.id){
                if (index > 0){
                    userInRoomSummary += ", ";
                }
            userInRoomSummary += nickNames[userSocketId];
            }
        }
        userInRoomSummary += ".";
        socket.emit("message", {text: userInRoomSummary})
    }
};

function handleNameChangeAttempts(socket, nickNames, nameUsed){
    socket.on("nameAttempt", function(name){
        if(name.indexOf("Guest") == 0){
            socket.emit("nameResult", {
                sucess: false,
                message: "Names cannot begin with 'Guest'"
        });
    }
})
}