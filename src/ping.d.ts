declare module 'ping' {
	export interface PingConfig {
		timeout?: number
		extra?: string[]
	}

	export interface PingSys {
		probe(addr: string, callback: (isAlive: boolean) => void, config?: PingConfig): void
	}

	export const sys: PingSys
}
