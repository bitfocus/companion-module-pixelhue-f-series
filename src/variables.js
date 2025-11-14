// F系列设备不需要动态变量，只需要基础变量
export const getVaraiableDefinitions = (self) => {
	// F系列设备没有动态变量，所以这里可以为空
	// 如果需要基础变量，可以从 constant.js 导入 defaultVariableDefinitions
	self.setVariableDefinitions([])
	self.setVariableValues({})
}
