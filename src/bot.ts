require('dotenv').config()
import { Channel, IChannel } from './model/Channel'
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
const defaultChannel = 'default'
const editCommand = 'edit'

const opts = {
	identity: {
		username: process.env.BOT_NAME,
		password: process.env.BOT_TOKEN,
	},
	channels: ['#heideltrauteuw', '#cibonator'],
}

const client = new tmi.client(opts)

const onConnectedHandler = (addr: string, port: number) => {
	console.log(`* Connected to ${addr}:${port}`)
}

// https://spacejelly.dev/posts/how-to-create-a-twitch-chat-bot-with-node-js-tmi-js-heroku/
const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?([a-zA-Z0-9]+)?(?:\W+)?(.*)/)

const onMessageHandler = async (channel: string, _userstate: ChatUserstate, msg: string, self: boolean) => {
	if (self || !msg.startsWith('!')) {
		return
	}

	// !edit hey boi
	const [, command, commandToEdit, response] = msg.match(regexpCommand)

	// if a streamer wants to edit a command
	if (command === editCommand && response) {
		console.log(`commandToEdit "${commandToEdit}"`)
		console.log(`argument "${response}"`)

		const filter = { name: channel }
		const update = { $set: { [`commands.${commandToEdit}`]: { response: response } } }

		Channel.findOneAndUpdate(filter, update, { upsert: true }, function (err) {
			if (err) {
				console.log('Error on command edit ' + commandToEdit + ' for channel: ' + channel)
			} else {
				console.log('Edited command: ' + commandToEdit + ' for channel: ' + channel + ' with new response: ' + response)
			}
		})
		return
	}

	Channel.findOne({ name: channel }, (_err: Error, doc: IChannel) => {
		const { response } = doc.commands[command] || {}
		if (response) {
			client
				.say(channel, response)
				.then((data) => {
					console.log(data)
				})
				.catch((err) => {
					console.log(err)
				})
		} else {
			// if no suiting command is found in the channel's document, search in master document
			Channel.findOne({ name: defaultChannel }, (_err: Error, doc: IChannel) => {
				const { response } = doc.commands[command] || {}
				if (response) {
					console.log('found command in master document')
					console.log('say: ' + response + ' in channel: ' + channel)
					client.say(channel, response)
				} else {
					console.log('command: ' + command + ' not found for channel: ' + channel)
				}
			})
		}
	})
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
