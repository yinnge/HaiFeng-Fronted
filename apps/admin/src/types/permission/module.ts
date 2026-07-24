/** 模块 VO */
export interface ModuleVO {
  id: string
  moduleName: string
  moduleCode: string
  parentId?: number
  path?: string
  icon?: string
  sortOrder: number
  level: number
  status: number
  description?: string
  createdAt: string
  updatedAt: string
}

/** 模块树形 VO */
export interface ModuleTreeVO extends ModuleVO {
  children?: ModuleTreeVO[]
}

/** 模块查询 DTO */
export interface ModuleQueryDTO {
  moduleCode?: string
}

/** 模块新增 DTO */
export interface ModuleAddDTO {
  moduleName: string
  moduleCode: string
  parentId?: number
  path?: string
  icon?: string
  sortOrder?: number
  level: number
  description?: string
}

/** 模块更新 DTO */
export interface ModuleUpdateDTO {
  moduleName: string
  moduleCode: string
  parentId?: number
  path?: string
  icon?: string
  sortOrder?: number
  level: number
  description?: string
}
