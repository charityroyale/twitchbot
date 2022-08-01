const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    commands: mongoose.Schema.Types.Mixed
},{collection:"channels"});

const Channel = mongoose.model("Channel",ChannelSchema);
module.exports = Channel;