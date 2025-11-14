import {
	COMMON_PRESET_TYPE,
	Central_Control_Protocol_FTB,
	Central_Control_Protocol_FREEZE,
	CMD_DEVICES,
	DEVICE_PRESETS,
} from '../utils/constant.js'
import { cmdActions } from '../utils/cmdActions.js'

export const getActions = (instance) => {
	const modelId = instance.config.modelId

	let actions = {}

	actions['take'] = {
		name: 'Execute Take on the selected screen',
		options: [],
		callback: async (event) => {
			try {
				cmdActions['take'].bind(instance)(event)
			} catch (error) {
				instance.log('error', 'take send error')
			}
		},
	}

	actions['cut'] = {
		name: 'Execute Cut on the selected screen',
		options: [],
		callback: async (event) => {
			try {
				cmdActions['cut'].bind(instance)(event)
			} catch (error) {
				instance.log('error', 'cut send error')
			}
		},
	}

	actions['ftb'] = {
		name: 'Execute FTB on the selected screen',
		options: [
			{
				type: 'dropdown',
				name: 'FTB',
				id: 'ftb',
				default: '1',
				choices: Central_Control_Protocol_FTB,
			},
		],
		callback: async (event) => {
			try {
				cmdActions['ftb'].bind(instance)(event)
			} catch (error) {
				instance.log('error', 'FTB send error')
			}
		},
	}

	actions['freeze'] = {
		name: 'Execute Freeze on the selected screen ',
		options: [
			{
				type: 'dropdown',
				name: 'FRZ',
				id: 'freeze',
				default: '1',
				choices: Central_Control_Protocol_FREEZE,
			},
		],
		callback: async (event) => {
			try {
				cmdActions['freeze'].bind(instance)(event)
			} catch (error) {
				instance.log('error', 'FRZ send error')
			}
		},
	}

	if (CMD_DEVICES.includes(modelId)) {
		actions['presetType'] = {
			name: 'Choose a destination to load the preset',
			options: [
				{
					type: 'dropdown',
					name: 'PVW/PGM',
					id: 'presetType',
					default: 'pvw',
					choices: COMMON_PRESET_TYPE,
				},
			],
			callback: async (event) => {
				try {
					cmdActions['presetType'].bind(instance)(event)
				} catch (error) {
					instance.log('error', 'presetType set error')
				}
			},
		}

		actions['preset'] = {
			name: 'Select a preset to load',
			options: [
				{
					type: 'dropdown',
					name: 'Preset',
					id: 'preset',
					default: 1,
					choices: [...Array(parseInt(DEVICE_PRESETS[modelId]) ?? 128)].map((_, index) => ({
						id: index + 1,
						label: `Preset ${index + 1}`,
					})),
				},
			],
			callback: async (event) => {
				try {
					cmdActions['preset'].bind(instance)(event)
				} catch (error) {
					instance.log('error', 'load_preset send error')
				}
			},
		}
	}

	return actions
}
