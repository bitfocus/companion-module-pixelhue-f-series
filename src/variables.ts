import type { ModuleInstanceInterface } from './types.js'

export function getVariableDefinitions(self: ModuleInstanceInterface): void {
	self.setVariableDefinitions([])
	self.setVariableValues({})
}
