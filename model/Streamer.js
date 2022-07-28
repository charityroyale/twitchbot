const mongoose = require("mongoose");

const StreamerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    commands:[{command: String, response: String}]
},{collection:"streamer"});

const Streamer = mongoose.model("Streamer",StreamerSchema);
module.exports = Streamer;