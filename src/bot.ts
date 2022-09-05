require('dotenv').config()
import { Channel , IChannel} from './model/Channel'
import mongoose from 'mongoose'
import tmi, { ChatUserstate } from 'tmi.js'

const connectMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI ?? 'MONGODB_URI')
		console.log('Connected to MongoDB')
	} catch (e) {
		console.log(`Couldn't connect to mongodb: ${e}`)
	}
}
connectMongoDB()

const defaultChannel = "default";

const opts = {
  identity: {
    username: process.env.BOT_NAME,
    password: process.env.BOT_TOKEN
  },
  channels: [
    "#heideltrauteuw", "#cibonator"
  ]
};

const client = new tmi.client(opts);

const onConnectedHandler = (addr: string, port: number) => {
  console.log(`* Connected to ${addr}:${port}`);
}

// https://spacejelly.dev/posts/how-to-create-a-twitch-chat-bot-with-node-js-tmi-js-heroku/
const regexpCommand = new RegExp(/^!(?:\W+)?([a-zA-Z0-9]+)(?:\W+)?([a-zA-Z0-9]+)?(?:\W+)?(.*)/);

const onMessageHandler = async(channel:string, _userstate: ChatUserstate, msg:string, self: boolean) => {
  if (self || !msg.startsWith('!')) { return; }
  
  // !edit hey boi
  const [, command, commandToEdit, newResponse] = msg.match(regexpCommand) || []


  // if a streamer wants to edit/add/delete a command
  // only mods
  if(_userstate.mod || _userstate.username === channel.replace('#','')){
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

  Channel.findOne({name:channel},function(err: Error,doc: IChannel){
    Channel.findOne({name:defaultChannel},function(err2: Error,doc2: IChannel){
      // https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
      // in the case of the same command in both documents, use the one in the streamer's document
      let commands = {...doc2.commands,...doc.commands};
      const {response} = commands[command] || {};

      if(response){
        client.say(channel,response)
        .then((data)=>{
          // e.g [ '#cibonator', 'boi' ]
          console.log(data);
        }).catch((err: Error)=>{
          console.log(err);
        });
      }
    });
  });
}

const onDeleteCommand = (channel: string, command: string) => {
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

const onEditCommand = (channel: string,commandToEdit: string,response: string) => {
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
const onAddCommand = (channel: string,commandToEdit: string,response: string) => {
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

const connectClient = async () => {
	try {
		await client.connect()

		client.on('message', onMessageHandler)
		client.on('connected', onConnectedHandler)
		client.on('roomstate', (channel, state) => {
			console.log('join channel:' + channel)
			console.log(state)
		})
	} catch (e) {
		console.log(`Couldn't connect to client: ${e}`)
	}
}
connectClient()
