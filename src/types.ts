import type {
	CompanionActionDefinitions,
	CompanionFeedbackDefinitions,
	CompanionPresetDefinitions,
	CompanionActionEvent,
	InstanceBase,
	TCPHelper,
	UDPHelper,
} from '@companion-module/base'

export interface ModuleConfig {
	host: string
	modelId: string
	port?: number
	model?: DeviceModel
	ftb?: string
	freeze?: string
	presetType?: 'pvw' | 'pgm'
	token?: string
	sn?: string
}

export interface DeviceModel {
	id: string
	label: string
	ftb: FTBOption[]
	freeze: FreezeOption[]
}

export interface FTBOption {
	id: string
	label: string
	cmd: Buffer
}

export interface FreezeOption {
	id: string
	label: string
	cmd: Buffer
}

export interface PresetTypeOption {
	id: string
	label: string
	default: string
}

export interface ModuleInstanceInterface extends InstanceBase<ModuleConfig> {
	config: ModuleConfig
	socket?: TCPHelper
	udp?: UDPHelper
}

export type ModuleActions = CompanionActionDefinitions
export type ModuleFeedbacks = CompanionFeedbackDefinitions
export type ModulePresets = CompanionPresetDefinitions
export type ActionEvent = CompanionActionEvent
