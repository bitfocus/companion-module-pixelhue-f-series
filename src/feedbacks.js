import { combineRgb } from '@companion-module/base'
import { FTB_STATUES, FREEZE_STATUES } from '../utils/constant.js'

export const getFeedbacks = (instance) => {
	let feedbacks = {}

	feedbacks['ftb'] = {
		type: 'boolean',
		name: 'Selected Screen FTB Status Detection',
		description: 'Update button style on FTB status change',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
		},
		options: [],
		callback: () => instance.config.ftb === FTB_STATUES.enable,
	}

	feedbacks['freeze'] = {
		type: 'boolean',
		name: 'Selected Screen Freeze Status Detection',
		description: 'Update button style on Freeze status change',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
		},
		options: [],
		callback: () => instance.config.freeze === FREEZE_STATUES.enable,
	}

	feedbacks['pgm'] = {
		type: 'boolean',
		name: 'Preset Load to PGM Status Detection',
		description: 'Update button style when preset loading area changes to PGM',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
		},
		options: [],
		callback: () => instance.config.presetType === 'pgm',
	}

	return feedbacks
}
