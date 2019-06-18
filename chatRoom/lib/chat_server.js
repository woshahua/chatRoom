"use strict";

const socketio = require("socket.io");
const io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom= {};

exports.listen = function(server){
    io = socketio.listen(server);
    io.set("log level", 1);
    io.sockets.on("connection", function(socket){
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
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
    namesUsed.push(name);
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
        }else{
            if(namesUsed.indexOf(name) == -1){
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName)
                namesUsed.push(name);
                nickNames[socket.id] = name;
                delete nameUsed[previousNameIndex];
            socket.emit("nameResult",{
                sucess: true,
                name: name
            });
            socket.broadcast.to(currentRoom[socket.id]).emit("message", {
                text: previousName + "is now Known as" + name + "."
            });
            }else{
                socket.emit("nameResult", {
                    sucess: false,
                    message: "that name is already in use"
                })
            }
        }
    })
};

function handleMessageBroadcasting(socket){
    socket.on("message", function(message){
        socket.broadcast.to(message.room).emit("message",{
            text: nickNames[socket.id] + ":" + message.text
        });
    });
}

function handleRoomJoining(socket){
    socket.on("join", function(room){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom)
    })
}

function handleClientDisconnection(socket){
    socket.on("disconnect", function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex]
        delete nickNames[socket.id]
    });
};