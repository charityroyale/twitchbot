import mongoose from 'mongoose'

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

export const Channel = mongoose.model('Channel', ChannelSchema)
