import {
	InstanceBase,
	InstanceStatus,
	TCPHelper,
	UDPHelper,
	Regex,
	runEntrypoint,
	type SomeCompanionConfigField,
} from '@companion-module/base'
import ping from 'ping'

import type { ModuleConfig, DeviceModel } from './types.js'
import { getActions } from './actions.js'
import { getPresetDefinitions } from './presets.js'
import { getFeedbacks } from './feedbacks.js'
import { UpgradeScripts } from './upgrades.js'
import { getVariableDefinitions } from './variables.js'

import { CMD_DEVICES, DEVICES_INFORMATION } from './utils/constant.js'
import { getSystemDeviceInfo } from './utils/index.js'

const LATCH_ACTIONS = ['ftb', 'freeze', 'presetType']

class ModuleInstance extends InstanceBase<ModuleConfig> {
	public config: ModuleConfig = {
		host: '',
		modelId: '',
	}

	private DEVICES_INFO: Record<string, DeviceModel> = {}
	private DEVICES: DeviceModel[] = []
	public socket?: TCPHelper
	public udp?: UDPHelper
	private heartbeat?: NodeJS.Timeout
	private lastState: number = 0

	constructor(internal: unknown) {
		super(internal)

		this.DEVICES_INFO = getSystemDeviceInfo()
		this.DEVICES = Object.values(this.DEVICES_INFO)

		// Sort alphabetical
		this.DEVICES.sort(function (a, b) {
			const x = a.label.toLowerCase()
			const y = b.label.toLowerCase()
			if (x < y) {
				return -1
			}
			if (x > y) {
				return 1
			}
			return 0
		})
	}

	private updateActions(): void {
		this.log('debug', 'update actions....')
		this.setActionDefinitions(getActions(this))
	}

	private updateFeedbacks(): void {
		this.setFeedbackDefinitions(getFeedbacks(this))
	}

	public override getConfigFields(): SomeCompanionConfigField[] {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: DEVICES_INFORMATION,
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP Address',
				width: 6,
				default: '192.168.0.10',
				regex: Regex.IP,
				required: true,
			},
			{
				type: 'dropdown',
				id: 'modelId',
				label: 'Model',
				width: 6,
				choices: this.DEVICES.map((device) => ({ id: device.id, label: device.label })),
				default: this.DEVICES[0]?.id ?? 'f4',
			},
		]
	}

	public override async destroy(): Promise<void> {
		this.log('debug', 'destroy:' + this.id)
		if (this.socket !== undefined) {
			this.socket.destroy()
		}
		if (this.udp !== undefined) {
			this.udp.destroy()
		}
		if (this.heartbeat) {
			clearInterval(this.heartbeat)
			delete this.heartbeat
		}
	}

	private updateDeviceStatus(isAlive: boolean): void {
		this.log('debug', 'ping test:' + isAlive + ', lastState:' + this.lastState)
		if (isAlive === true) {
			this.log('debug', 'ping check ok.')
			if (this.lastState !== 0) {
				this.log('debug', 'connection recover, try to reconnect device.')
				this.updateStatus(InstanceStatus.Connecting)
				//try to reconnect
				this.initUDP()
				this.initTCP()
				this.lastState = 0
			}
		} else {
			if (isAlive === false && this.lastState === 0) {
				this.updateStatus(InstanceStatus.ConnectionFailure)
				this.log('debug', 'ping check failure.')
				this.lastState = 1
			}
		}
	}

	private pingTest(): void {
		ping.sys.probe(this.config.host, (isAlive: boolean) => this.updateDeviceStatus(isAlive), { timeout: 1 })
	}

	private initTCP(): void {
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		this.config.port = 5400

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.log('debug', `tcp-status-change, status: ${status}, msg: ${message}`)
				this.updateStatus(status, message)
			})

			this.socket.on('error', async (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure)
				this.log('debug', 'TCP Network error: ' + err.message)
				this.updateStatus(InstanceStatus.Connecting)
				if (this.udp !== undefined) {
					const cmd_connect = Buffer.from([
						0x72, 0x65, 0x71, 0x4e, 0x4f, 0x56, 0x41, 0x53, 0x54, 0x41, 0x52, 0x5f, 0x4c, 0x49, 0x4e, 0x4b, 0x3a, 0x00,
						0x00, 0x03, 0xfe, 0xff,
					]) // Port FFFE
					try {
						await this.udp.send(cmd_connect)
					} catch (e) {
						this.log('debug', `UDP send Error.${e}`)
					}
				} else {
					this.initUDP()
				}
			})

			this.socket.on('connect', () => {
				const cmd = Buffer.from([
					0x55, 0xaa, 0x00, 0x00, 0xfe, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00,
					0x57, 0x56,
				])
				this.socket?.send(cmd)
				this.log('debug', 'TCP Connected')
				this.updateStatus(InstanceStatus.Ok)
			})

			// if we get any data, display it to stdout
			this.socket.on('data', () => {
				//future feedback can be added here
				// this.log('debug', 'Tcp recv:' + buffer);
			})
		} else {
			this.log('error', 'No host configured')
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	private async initUDP(): Promise<void> {
		if (this.udp !== undefined) {
			this.udp.destroy()
			delete this.udp
		}

		if (this.config.host !== undefined) {
			this.udp = new UDPHelper(this.config.host, 3800)

			this.udp.on('error', (err) => {
				this.log('debug', 'UDP Network error: ' + err.message)
				this.updateStatus(InstanceStatus.ConnectionFailure)
			})

			// If we get data, thing should be good
			this.udp.on('data', () => {
				// this.status(this.STATE_WARNING, 'Connecting...')
			})

			this.udp.on('status_change', (status) => {
				this.log('debug', 'UDP status_change: ' + status)
			})
		} else {
			this.log('error', 'No host configured')
			this.updateStatus(InstanceStatus.BadConfig)
		}

		if (this.udp !== undefined) {
			const cmd_register = Buffer.from([
				0x72, 0x65, 0x71, 0x4e, 0x4f, 0x56, 0x41, 0x53, 0x54, 0x41, 0x52, 0x5f, 0x4c, 0x49, 0x4e, 0x4b, 0x3a, 0x00,
				0x00, 0x03, 0xfe, 0xff,
			])
			try {
				await this.udp.send(cmd_register)
			} catch (e) {
				this.log('debug', `UDP send error.${e}`)
			}
		}
	}

	private updateDefaultInfo(): void {
		LATCH_ACTIONS.map((item) => {
			delete this.config[item as keyof ModuleConfig]
		})
		this.updateActions()
		this.updateFeedbacks()
		this.setPresetDefinitions(getPresetDefinitions(this))
		getVariableDefinitions(this)
	}

	public override async configUpdated(config: ModuleConfig): Promise<void> {
		this.log('debug', 'configUpdated modules...')
		this.updateStatus(InstanceStatus.Connecting)
		let resetConnection = false
		if (this.config.host !== config.host || this.config.modelId !== config.modelId) {
			resetConnection = true
		}
		delete this.config.token
		delete this.config.sn
		this.config = {
			...this.config,
			...config,
			model: this.DEVICES_INFO[config.modelId],
		}
		this.updateDefaultInfo.bind(this)()
		// Clear heartbeat timer
		if (this.heartbeat) {
			clearInterval(this.heartbeat)
			delete this.heartbeat
		}

		const isRefresh = resetConnection === true || this.socket === undefined
		if (!isRefresh) return

		this.initUDP()
		this.initTCP()
		this.heartbeat = setInterval(() => this.pingTest(), 10000) //check every 10s

		this.updateDefaultInfo.bind(this)()
	}

	public override async init(config: ModuleConfig): Promise<void> {
		this.updateStatus(InstanceStatus.Connecting)

		this.config = Object.assign({}, config)

		if (this.config.modelId !== undefined) {
			this.config.model = this.DEVICES_INFO[this.config.modelId]
		} else {
			this.config.modelId = this.DEVICES[0]?.id ?? 'f4'
			this.config.model = this.DEVICES[0]
		}

		// Initialize and refresh device protocol/state
		if (CMD_DEVICES.includes(this.config.modelId)) {
			this.initUDP()
			this.initTCP()
			this.heartbeat = setInterval(() => this.pingTest(), 10000) //check every 10s
		}

		this.updateDefaultInfo.bind(this)()
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
