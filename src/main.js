import { InstanceBase, InstanceStatus, TCPHelper, UDPHelper, Regex, runEntrypoint } from '@companion-module/base'
import ping from 'ping'

import { getActions } from './actions.js'
import { getPresetDefinitions } from './presets.js'
import { getFeedbacks } from './feedbacks.js'
import { upgradeScripts } from './upgrades.js'
import { getVaraiableDefinitions } from './variables.js'

import { CMD_DEVICES, DEVICES_INFORMATION } from '../utils/constant.js'
import { getSystemDeviceInfo } from '../utils/index.js'

const LATCH_ACTIONS = ['ftb', 'freeze', 'presetType']
class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.DEVICES_INFO = getSystemDeviceInfo()
		this.DEVICES = Object.values(this.DEVICES_INFO)

		// Sort alphabetical
		this.DEVICES.sort(function (a, b) {
			var x = a.label.toLowerCase()
			var y = b.label.toLowerCase()
			if (x < y) {
				return -1
			}
			if (x > y) {
				return 1
			}
			return 0
		})
	}

	updateActions() {
		this.log('debug', 'update actions....')
		this.setActionDefinitions(getActions(this))
	}

	updateFeedbacks() {
		this.setFeedbackDefinitions(getFeedbacks(this))
	}

	// Return config fields for web config
	getConfigFields() {
		this.log('getting the fields....')
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
				choices: this.DEVICES,
				default: this.DEVICES[0].id,
			},
		]
	}

	// When module gets deleted
	async destroy() {
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

	//update device status
	updateDeviceStatus(isAlive) {
		this.log('debug', 'ping test:' + isAlive + ', lastState:' + this.lastState)
		if (isAlive == true) {
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
			if (isAlive == false && this.lastState === 0) {
				this.updateStatus(InstanceStatus.ConnectionFailure)
				this.log('debug', 'ping check failure.')
				this.lastState = 1
			}
		}
	}

	pingTest() {
		ping.sys.probe(this.config.host, (isAlive) => this.updateDeviceStatus(isAlive), { timeout: 1 })
	}

	initTCP() {
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
					let cmd_connect = Buffer.from([
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
				let cmd = Buffer.from([
					0x55, 0xaa, 0x00, 0x00, 0xfe, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00,
					0x57, 0x56,
				])
				this.socket.send(cmd)
				this.log('debug', 'TCP Connected')
				this.updateStatus(InstanceStatus.Ok)
			})

			// if we get any data, display it to stdout
			this.socket.on('data', (buffer) => {
				//future feedback can be added here
				// this.log('debug', 'Tcp recv:' + buffer);
			})
		} else {
			this.log('error', 'No host configured')
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	async initUDP() {
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

			this.udp.on('status_change', (status, message) => {
				this.log('debug', 'UDP status_change: ' + status)
			})
		} else {
			this.log('error', 'No host configured')
			this.updateStatus(InstanceStatus.BadConfig)
		}

		if (this.udp !== undefined) {
			let cmd_register = Buffer.from([
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

	updateDefaultInfo() {
		LATCH_ACTIONS.map((item) => {
			delete this.config[item]
		})
		this.updateActions()
		this.updateFeedbacks()
		this.setPresetDefinitions(getPresetDefinitions(this))
		getVaraiableDefinitions(this)
	}

	async configUpdated(config) {
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
		// 删除心跳
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

	async init(config) {
		this.updateStatus(InstanceStatus.Connecting)

		this.config = Object.assign({}, config)

		if (this.config.modelId !== undefined) {
			this.config.model = this.DEVICES_INFO[this.config.modelId]
		} else {
			this.config.modelId = this.DEVICES[0].id
			this.config.model = this.DEVICES[0]
		}

		// 初始化并再次更新设备协议及设备状态
		if (CMD_DEVICES.includes(this.config.modelId)) {
			this.initUDP()
			this.initTCP()
			this.heartbeat = setInterval(() => this.pingTest(), 10000) //check every 10s
		}

		this.updateDefaultInfo.bind(this)()
	}
}

runEntrypoint(ModuleInstance, upgradeScripts)
