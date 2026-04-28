import { combineRgb } from '@companion-module/base'
import type { ModuleInstanceInterface, ModulePresets } from './types.js'
import { DEVICE_PRESETS } from './utils/constant.js'

const displayPresets: ModulePresets = {
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
				up: [],
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
				up: [],
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
			size: 18,
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
				up: [],
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
				up: [],
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
			size: 18,
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
				up: [],
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
				up: [],
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
const cmdPresetType: ModulePresets[string] = {
	type: 'button',
	category: 'Display',
	name: 'presetType',
	style: {
		text: 'Load to\nPVW',
		size: 18,
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
			up: [],
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
			up: [],
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

// F-series scenes
function getFseriesPresets(num: number): ModulePresets {
	const playPresets: ModulePresets = {}
	for (let i = 1; i <= num; i++) {
		const preset = {
			type: 'button' as const,
			category: 'Presets',
			name: 'Preset ' + i,
			style: {
				text: 'Preset \n' + i,
				size: 18,
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
					up: [],
				},
			],
			feedbacks: [],
		}
		playPresets['preset-play' + i] = preset
	}
	return playPresets
}

export function getPresetDefinitions(instance: ModuleInstanceInterface): ModulePresets {
	let basicPresets: ModulePresets = {}
	const presetNum = DEVICE_PRESETS[instance.config.modelId] ?? 128
	const fSeriesPresets = getFseriesPresets(presetNum)
	basicPresets = { ...displayPresets, cmdPresetType, ...fSeriesPresets }

	return basicPresets
}
