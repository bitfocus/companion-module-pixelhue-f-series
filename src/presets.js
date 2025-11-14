import { combineRgb } from '@companion-module/base'
import { CMD_DEVICES, DEVICE_PRESETS } from '../utils/constant.js'

const displayPresets = {
	take: {
		type: 'button',
		category: 'Display',
		name: 'TAKE',
		style: {
			text: 'TAKE',
			size: '24',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'take',
						options: {},
					},
				],
			},
		],
		feedbacks: [],
	},
	cut: {
		type: 'button',
		category: 'Display',
		name: 'CUT',
		style: {
			text: 'CUT',
			size: '24',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'cut',
						options: {},
					},
				],
			},
		],
		feedbacks: [],
	},
	ftb: {
		type: 'button',
		category: 'Display',
		name: 'FTB',
		style: {
			text: 'FTB',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'ftb',
						options: {
							ftb: '1',
						},
					},
				],
			},
			{
				down: [
					{
						actionId: 'ftb',
						options: {
							ftb: '0',
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'ftb',
				style: {
					bgcolor: combineRgb(255, 0, 0),
				},
				options: {},
			},
		],
	},
	freeze: {
		type: 'button',
		category: 'Display',
		name: 'Freeze',
		style: {
			text: 'Freeze',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'freeze',
						options: {
							freeze: '1',
						},
					},
				],
			},
			{
				down: [
					{
						actionId: 'freeze',
						options: {
							freeze: '0',
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'freeze',
				style: {
					bgcolor: combineRgb(255, 0, 0),
				},
				options: {},
			},
		],
	},
}

// presetType: 1: PGM, 0: PVW (cmd)
const cmdPresetType = {
	type: 'button',
	category: 'Display',
	name: 'presetType',
	style: {
		text: 'Load to\nPVW',
		size: '18',
		color: combineRgb(255, 255, 255),
		bgcolor: combineRgb(0, 0, 0),
	},
	steps: [
		{
			down: [
				{
					actionId: 'presetType',
					options: {
						presetType: 'pgm',
					},
				},
			],
		},
		{
			down: [
				{
					actionId: 'presetType',
					options: {
						presetType: 'pvw',
					},
				},
			],
		},
	],
	feedbacks: [
		{
			feedbackId: 'pgm',
			style: {
				bgcolor: combineRgb(255, 0, 0),
				text: 'Load to\nPGM',
			},
			options: {},
		},
	],
}

// F系列场景
const getFseriesPresets = (num) => {
	const playPresets = {}
	for (let i = 1; i <= num; i++) {
		const preset = {
			type: 'button',
			category: 'Presets',
			name: 'Preset ' + i,
			style: {
				text: 'Preset \n' + i,
				size: '18',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'preset',
							options: {
								preset: i,
							},
						},
					],
				},
			],
			feedbacks: [],
		}
		playPresets['preset-play' + i] = preset
	}
	return playPresets
}

export const getPresetDefinitions = function (instance) {
	let basicPresets = {}
	// F系列场景生成
	const presetNum = parseInt(DEVICE_PRESETS[instance.config.modelId]) ?? 128
	const fSeriesPresets = getFseriesPresets(presetNum)
	basicPresets = { ...displayPresets, cmdPresetType, ...fSeriesPresets }

	return basicPresets
}
