require("dotenv").config();
const tmi = require('tmi.js');
const Channel = require("./model/Channel.js");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

const defaultChannel = "default";

// fetcher(url){
//   try{
      // return access_token
//   }catch(){

//   }
// }


// const bot_token = refreshToken();

// async function refreshToken(){
//   //https://reqbin.com/code/javascript/wzp2hxwh/javascript-post-request-example#:~:text=To%20send%20an%20HTTP%20POST,subscribe%20to%20the%20onreadystatechange%20event.
//   //https://dev.twitch.tv/docs/authentication/refresh-tokens#:~:text=When%20you%20get%20a%20user,receiving%20a%20401%20Unauthorized%20response.
//   const content_type = "application/x-www-form-urlencoded";
//   const url = "https://id.twitch.tv/oauth2/token";
//   const client_id = process.env.CLIENT_ID;
//   const client_secret =process.env.CLIENT_SECRET;
//   const grant_type ="refresh_token";
//   const refresh_token ="";

//   const response = await fetch(url,{
//     method:"POST",
//     headers:{
//       "Content-Type":"application/x-www-form-urlencoded"
//     },
//     body:`{
//       "client_id":,
//       "client_secret":,
//       "grant_type":
//       "refresh_token":
//     }`
//   });

//   response.json().then(data=>{
//     console.log(data)
//   });
// }

const opts = {
  identity: {

    // fetcher(url)
    username: process.env.BOT_NAME,
    password: process.env.BOT_TOKEN
  },
  channels: [
    // get from file
    "#heideltrauteuw", "#cibonator"
  ]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on("roomstate",(channel,state)=>{
  console.log("join channel:" +channel)
  console.log(state)
})
client.connect();
// https://spacejelly.dev/posts/how-to-create-a-twitch-chat-bot-with-node-js-tmi-js-heroku/
const regexpCommand = new RegExp(/^!(?:\W+)?([a-zA-Z0-9]+)(?:\W+)?([a-zA-Z0-9]+)?(?:\W+)?(.*)/);

async function onMessageHandler(channel, context, msg, self) {
  if (self || !msg.startsWith('!')) { return; }

  // e.g. !edit hey boi
  const [raw, command, commandToEdit, newResponse] = msg.match(regexpCommand);

  // if a streamer wants to edit/add/delete a command
  // only mods and the streamer can access these commands
  if(context.mod || context.username === channel.replace('#','')){
    if (commandToEdit) {
      switch (command) {
        case "add":
          onAddCommand(channel,commandToEdit,newResponse);
          break;
        case "edit":
          onEditCommand(channel,commandToEdit,newResponse);
          break;
        case "delete":
          onDeleteCommand(channel,commandToEdit);
          break;
        default:
          console.log("Triple not found - Command: " + command + " commandToEdit: " + commandToEdit + " newResponse: " + newResponse);
          break;
      }
      return;
    };
  }

  Channel.findOne({name:channel},function(err,doc){
    Channel.findOne({name:defaultChannel},function(err2,doc2){
      // https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
      // in the case of the same command in both documents, use the one in the streamer's document
      let commands = {...doc2.commands,...doc.commands};
      const {response} = commands[command] || {};

      if(response){
        client.say(channel,response)
        .then((data)=>{
          // e.g [ '#cibonator', 'boi' ]
          console.log(data);
        }).catch((err)=>{
          console.log(err);
        });
      }
    });
  });
}

async function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function onDeleteCommand(channel, command){
  console.log("[DELETE] command: " + command + " for channel: " + channel)

  const filter = { name: channel };
  const update = { $unset: { [`commands.${command}`]:""} };

  Channel.findOneAndUpdate(filter, update, { upsert: true }, function (err, doc) {
    if (err) {
      console.log("Error on delete command err:"+ err);
    } else {
      console.log("Successfully deleted command: " + command + " for channel: " + channel)
    }
  });
  return;
}

async function onEditCommand(channel,commandToEdit,response){
  console.log("[EDIT] command: " + commandToEdit + " with new response: " + response +" for channel: " + channel)


  const filter = { name: channel };
  const update = { $set: { [`commands.${commandToEdit}`]: { response: response } } };

  Channel.findOneAndUpdate(filter, update, { upsert: true }, function (err, doc) {
    if (err) {
      console.log("Error on edit command err:"+ err);
    } else {
      console.log("Successfully edited command: " + commandToEdit + " with new response: " +response+" for channel: " + channel)
    }
  });
  return;
}
// TODO vl mit edit command joinen
async function onAddCommand(channel,commandToEdit,response){
  console.log("[ADD] command: " + commandToEdit + " with response: " + response +" for channel: " + channel)

  const filter = { name: channel };
  const update = { $set: { [`commands.${commandToEdit}`]: { response: response } } };

  Channel.findOneAndUpdate(filter, update, { upsert: true }, function (err, doc) {
    if (err) {
      console.log("Error on add command err:"+ err);
    } else {
      console.log("Successfully add command: " + commandToEdit + " with response: " +response+" for channel: " + channel)
    }
  });
  return;
}