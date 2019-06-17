"use strict";
const express = require("express");
const app = express();
const fs = require("fs")
const path = require("path")
const mime = require("mime")

const chatServer = require ("./chat_server")
chatServer.listen(app)

var cache = {}

app.get("/", (req, res)=>{
    res.send("./index.html");
});

app.get("*", (req, res)=>{
    res.status(404).send("page not found");
});

app.listen(3000)