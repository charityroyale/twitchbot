import mongoose from 'mongoose'

export interface IChannel extends mongoose.Document {
	commands: { [key: string]: { response: string } }
}

const ChannelSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		commands: mongoose.Schema.Types.Mixed,
	},
	{ collection: 'channels' }
)

export const Channel = mongoose.model<IChannel>('Channel', ChannelSchema)
