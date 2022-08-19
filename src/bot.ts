require('dotenv').config()
import { Channel } from './model/Channel'
import mongoose from 'mongoose'
import tmi from 'tmi.js'

mongoose.connect(process.env.MONGODB_URI ?? 'MONGODB_URI')

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

client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)
client.on('roomstate', (channel, state) => {
	console.log('join channel:' + channel)
	console.log(state)
})
client.connect()
// https://spacejelly.dev/posts/how-to-create-a-twitch-chat-bot-with-node-js-tmi-js-heroku/
const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?([a-zA-Z0-9]+)?(?:\W+)?(.*)/)

// @ts-ignore: TODO: fix typings
async function onMessageHandler(channel, context, msg, self) {
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

	// @ts-ignore: TODO: fix typings
	Channel.findOne({ name: channel }, function (err, doc) {
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
			// @ts-ignore: TODO: fix typings
			Channel.findOne({ name: defaultChannel }, function (err, doc) {
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

// @ts-ignore: TODO: fix typings
function onConnectedHandler(addr, port) {
	console.log(`* Connected to ${addr}:${port}`)
}