require("dotenv").config();
const tmi = require('tmi.js');
const Streamer = require("./model/Streamer.js")
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

const masterName = "master";
const opts = {
  identity: {
    username: process.env.BOT_NAME,
    password: process.env.BOT_TOKEN
  },
  channels: [
    process.env.BOT_NAME
  ]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

async function onMessageHandler (channel, context, msg, self) {
  if (self || !msg.startsWith('!')) { return; } 

  const commandName = msg.trim();

  let streamer = await Streamer.findOne({name:channel}).exec();
  let resp = streamer.commands.find(c=>c.command===commandName);

  if(resp){
    // if a streamer document contains the command
    client.say(channel,resp.response);
    console.log("respond with: " + resp.response);
  }else{
    // otherwise look into the master document
    let master = await Streamer.findOne({name:masterName});
    let masterResp = master.commands.find(c=>c.command===commandName);
    
    if(masterResp){
      // master document contains command
      client.say(channel,masterResp.response);
      console.log("master respond with: " + resp.response);
    }else{
      // no command found in collection
      console.log("undefinded command: " + msg);
    }
  }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}