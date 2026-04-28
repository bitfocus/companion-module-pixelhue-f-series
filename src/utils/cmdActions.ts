import type { ModuleInstanceInterface, ActionEvent } from '../types.js'
import { getPresetCmd } from './index.js'
import {
	Central_Control_Protocol_CUT,
	Central_Control_Protocol_FREEZE,
	Central_Control_Protocol_FTB,
	Central_Control_Protocol_TAKE,
	PRESET_TYPE,
	Central_Control_Protocol_Device_PresetType,
	COMMON_PRESET_TYPE,
} from './constant.js'

function handleCmdTake(this: ModuleInstanceInterface): void {
	const cmd = Buffer.from(Central_Control_Protocol_TAKE)
	this.socket?.send(cmd)
}

function handleCmdCut(this: ModuleInstanceInterface): void {
	const cmd = Buffer.from(Central_Control_Protocol_CUT)
	this.socket?.send(cmd)
}

function handleCmdFTB(this: ModuleInstanceInterface, event: ActionEvent): void {
	const element = Central_Control_Protocol_FTB.find((element) => element.id === event.options.ftb)
	if (!element) {
		return
	}

	this.config.ftb = event.options.ftb as string
	this.checkFeedbacks('ftb')
	this.socket?.send(element.cmd)
}

function handleCmdFreeze(this: ModuleInstanceInterface, event: ActionEvent): void {
	this.config.freeze = event.options.freeze as string
	this.checkFeedbacks('freeze')

	const element = Central_Control_Protocol_FREEZE.find((element) => element.id === event.options.freeze)
	if (element) {
		this.socket?.send(element.cmd)
	}
}

function handleCmdPresetType(this: ModuleInstanceInterface, event: ActionEvent): void {
	if (!COMMON_PRESET_TYPE.find((item) => item.id === event.options.presetType)) {
		return
	}

	this.config.presetType = event.options.presetType as 'pvw' | 'pgm'
	this.checkFeedbacks('pgm')
}

function handleCmdPreset(this: ModuleInstanceInterface, event: ActionEvent): void {
	const presetTypeCmd = Buffer.from(Central_Control_Protocol_Device_PresetType[this.config.presetType ?? 'pvw'])
	this.socket?.send(presetTypeCmd)

	setTimeout(() => {
		const cmd = getPresetCmd(event.options.preset as number, PRESET_TYPE[this.config.presetType ?? 'pvw'])
		this.socket?.send(cmd)
	}, 500)
}

export const cmdActions = {
	take: handleCmdTake,
	cut: handleCmdCut,
	ftb: handleCmdFTB,
	freeze: handleCmdFreeze,
	presetType: handleCmdPresetType,
	preset: handleCmdPreset,
}
