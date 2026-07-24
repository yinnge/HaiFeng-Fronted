# 海峰未来规划院 (前端工程) - 管理端开发规范补充

---

## 管理员前端权限体系

### 权限模型
- RBAC: `管理员 → 角色 → 模块(三级树形) → 接口`
- 后端每个 Controller 用 `@RequireAdminModule("module_code")` 注解校验接口权限
- 前端从 `GET /api/v1/admin/profile` 返回的 `moduleCodes: string[]` 获取当前管理员的全部模块编码
- 后端查询: `SysAdminMapper.selectModuleCodesByAdminId()` 通过 `sys_admin → role_id → sys_role_module → sys_module.module_code` 链路获取

### 前端实现规则

1. **路由定义**: 每个需要权限的路由在 `meta.moduleCode` 中声明，值与后端 `module_code` 一一对应
   ```ts
   meta: { title: '公告管理', icon: 'Warning', moduleCode: 'home_announcement' }
   ```

2. **路由守卫** (`router.beforeEach`): 检查目标路由的 `meta.moduleCode`，若用户 `moduleCodes` 中不包含则重定向到 403 页面

3. **侧边栏菜单**: Sidebar 根据 `userStore.moduleCodes` 动态过滤; 父级菜单有可见子菜单时才显示

4. **应用启动流程**: 登录 → 获取 Profile(含 moduleCodes) → 存入 userStore → 生成动态路由 → 渲染侧边栏

5. **新建模块步骤**:
   - 后端: 在 `V26__seed_admin_module_data.sql` 添加模块记录（注意 level、parent_id、path）
   - 后端: 创建 Controller 并加 `@RequireAdminModule("新模块_code")`
   - 前端: 定义路由，加 `meta.moduleCode`
   - 前端: 在配置角色的页面，该模块会自动出现在模块树中供勾选

### 模块层级规则 (来自 sys_module.level)
```
level=1: 顶级父模块（14个）
level=2: 子模块（42个）
level=3: 三级子模块（25个）
总计: 81个模块
```
- 新建父模块: `level=1, parent_id=NULL`
- 新建子模块: `level=2, parent_id=父模块ID`
- 新建三级模块: `level=3, parent_id=二级模块ID`
- `path` 字段对应前端路由路径

### 完整模块代码参考

```
顶级父模块（level=1）:
  system             系统管理
  permission         权限管理
  user               用户管理
  home               首页管理
  university         院校管理
  major              专业管理
  city               城市管理
  algorithm          高考算法
  special            特殊通道
  certificate        证书竞赛
  resource           资源管理
  industry           行业管理
  company            企业管理
  employment         就业管理

子模块（level=2）:
  system_setting     系统设置
  system_provider    模型供应商配置
  system_log         操作日志记录
  permission_admin   管理员账号管理
  permission_role    角色管理
  permission_module  模块菜单管理
  user_member        用户信息管理
  user_order         会员订单管理
  user_withdraw      提现审核管理
  user_commission    佣金记录管理
  user_notification  通知消息管理
  home_announcement  公告管理
  home_planner       规划师管理
  home_institution   培训机构管理
  university_album   校园图册管理
  university_info    院校管理
  university_dept    院系管理
  university_lab     实验室管理
  university_eval    学科评估管理
  university_guide   院校适应指南管理
  major_info         专业管理
  major_subject      考研专业管理
  major_postgraduate 专业考研关联管理
  major_univ         考研专业大学关联管理
  city_info          城市管理
  algo_admission     专业组管理
  algo_score         分数位次管理
  algo_config        算法配置管理
  algo_constraint    约束管理
  algo_safety        安全系数管理
  special_admission  招生通道管理
  special_adm_univ   通道院校关联管理
  special_sbs_score  强基计划分数管理
  special_sbs_config 强基计划院校配置
  certificate_info   证书管理
  certificate_comp   竞赛管理
  cert_comp_major    竞赛专业关联管理
  resource_info      资源管理
  industry_info      行业管理
  company_info       企业管理
  company_industry   企业行业关联管理
  emp_content        招聘内容管理
  emp_civil          体制内招录管理
  emp_grassroots     基层服务管理
  emp_industry       行业专项招聘管理

三级子模块（level=3）:
  algo_admission_grp  专业组管理
  algo_admission_dtl  专业明细管理
  algo_score_rank     分数排名管理
  algo_score_baseline 批次基线管理
  algo_score_prov     改革省份管理
  algo_config_gaokao  算法配置管理
  algo_config_prov    省份配置管理
  algo_constraint_dict 约束字典管理
  algo_constraint_mjr 约束专业关联管理
  algo_safety_level   安全系数管理
  emp_content_guide   备考指南管理
  emp_content_notice  公告管理
  emp_civil_servant   公务员职位管理
  emp_civil_institution 事业编职位管理
  emp_civil_military  部队文职岗位管理
  emp_civil_selected  选调生岗位管理
  emp_grassroots_comm 社区工作者岗位管理
  emp_grassroots_3s   三支一扶西部计划
  emp_grassroots_welfare 公益性岗位管理
  emp_industry_bank   银行/金融岗位管理
  emp_industry_medical 医疗卫生岗位管理
  emp_industry_teacher 教师招聘岗位管理
```

