# 转学申请补件流程设计

> 当前项目的完整状态定义与管理端审核规则，统一见 [2026-04-11-application-status-machine.md](./2026-04-11-application-status-machine.md)。

## 背景

当前用户端 `application` 路由下的 `pending`、`confirmation`、`supplement` 页面仍然是基于 mock 数据的独立演示页，而真实申请数据已经通过 `app/actions/application.ts` 与 Prisma 模型落库。现有流程把 `SUPPLEMENT` 作为管理员审核动作的一部分，但业务要求已经变化：用户在创建申请时可以先不上传 `fileStudentCard`，系统先生成申请单，并允许用户稍后通过补件入口补传。

## 目标

1. 新申请在缺少 `fileStudentCard` 时仍可成功创建。
2. 创建成功后统一跳转到 `app/application/new/success/page.tsx`。
3. 申请缺少 `fileStudentCard` 时状态为 `SUPPLEMENT`，补传后改为 `PENDING`。
4. `pending`、`confirmation`、`supplement` 三个用户端详情页改为真实数据驱动。
5. 新增测试脚本，生成四种固定状态的测试申请，并让 `app/application/page.tsx` 直接跳转到对应测试单。

## 非目标

1. 不改动管理员审核主流程，只保证其对新状态流转继续兼容。
2. 不实现用户端“输入身份证查询申请”的独立功能。
3. 不改动文件上传组件的基础能力，只复用现有 `ImageUploader`。

## 状态流转

### 新建申请

1. 用户在 `app/application/new/page.tsx` 填写除学籍卡以外的所有资料。
2. 若其他校验通过：
   - `fileStudentCard` 已上传：申请状态设为 `PENDING`
   - `fileStudentCard` 未上传：申请状态设为 `SUPPLEMENT`
3. 创建成功后统一跳转 `app/application/new/success/page.tsx`。

### 待审核页

`app/application/pending/[id]/page.tsx` 负责处理中间态：

1. `PENDING`：展示审核中信息。
2. `SUPPLEMENT`：展示“待补学籍信息卡”，并给出跳转到 `app/application/supplement/[id]/page.tsx` 的入口。
3. `APPROVED` 或 `REJECTED`：自动跳转到 `app/application/confirmation/[id]/page.tsx`。

### 补件页

`app/application/supplement/[id]/page.tsx` 仅处理 `SUPPLEMENT` 申请：

1. 展示申请基础信息、监护人信息、学校和地址信息。
2. 已有资料只显示“已上传”状态，不展示图片预览。
3. 仅允许上传 `fileStudentCard`。
4. 提交成功后将状态改为 `PENDING`，再跳转回 `app/application/pending/[id]/page.tsx`。
5. 若申请状态不是 `SUPPLEMENT`，则跳回对应状态页：
   - `PENDING` 跳 `pending`
   - `APPROVED` / `REJECTED` 跳 `confirmation`

### 结果页

`app/application/confirmation/[id]/page.tsx` 根据状态动态展示：

1. `APPROVED`：显示通过结果、目标学校、申请人信息。
2. `REJECTED`：显示驳回结果、申请人信息、`adminRemark`。
3. `PENDING` 或 `SUPPLEMENT`：自动跳转到 `pending` 页。

## 数据设计

### Prisma 模型

`prisma/schema/application.prisma` 中 `fileStudentCard` 改为非必填字段，以兼容历史和未来的空值数据。为保持现有序列化方式，数据库中仍以 JSON 字符串数组存储文件列表。

### 校验规则

`lib/validations/application.ts` 中：

1. `fileStudentCard` 从必填数组改为可选数组。
2. 其余创建校验保持不变。
3. 管理员审核校验继续保留 `SUPPLEMENT`、`APPROVED`、`REJECTED` 的联动规则。
4. 新增仅补传学籍卡的专用校验模式，要求至少一张学籍卡图片。

### 服务端动作

`app/actions/application.ts` 需要承担三类职责：

1. 创建申请时根据是否上传学籍卡决定初始状态。
2. 读取申请详情时统一反序列化所有文件字段。
3. 新增补传学籍卡动作，仅允许在 `SUPPLEMENT` 状态下更新 `fileStudentCard` 并把状态改为 `PENDING`。

## 页面职责

### `app/application/new/_components/application-form.tsx`

1. 保留现有输入结构。
2. 学籍卡区块文案改为“可后补”。
3. 提交成功后仍跳 `new/success`，不直接暴露申请状态。

### `app/application/new/success/page.tsx`

保持成功反馈页，但文案需要说明：

1. 申请已创建；
2. 若后续需要补件，可通过申请入口页内的固定测试/演示链接查看待补件状态流程。

### `app/application/page.tsx`

入口页改成真实测试入口集合，不再强调 mock 页面：

1. 新建申请
2. 审核中申请
3. 审核通过结果
4. 审核驳回结果
5. 待补学籍信息卡

其中四个状态入口都使用脚本生成的固定申请 ID。

## 测试脚本设计

新增脚本在 `scripts/` 下创建四条固定 ID 的申请记录，优先绑定当前开放学期：

1. 完整上传资料，状态 `PENDING`
2. 缺少 `fileStudentCard`，状态 `SUPPLEMENT`
3. 已分配 `targetSchool`，状态 `APPROVED`
4. 有 `adminRemark`，状态 `REJECTED`

脚本使用 `upsert`，确保可重复执行且入口页链接稳定。

## 测试与验证

1. `app/actions/application.test.ts` 覆盖：
   - 创建申请缺少学籍卡时写入 `SUPPLEMENT`
   - 创建申请带学籍卡时写入 `PENDING`
   - 补传学籍卡时更新状态为 `PENDING`
2. 用户端页面测试覆盖：
   - `pending/[id]` 根据状态显示不同 CTA 或重定向
   - `confirmation/[id]` 针对 `APPROVED` / `REJECTED` 呈现不同结果
   - `supplement/[id]` 只允许 `SUPPLEMENT` 访问
3. 脚本执行后验证入口页链接包含固定 ID。

## 风险与取舍

1. 现有 mock 测试需要整体替换为真实数据测试，属于结构性调整，但这样能避免同一路径下保留双套逻辑。
2. 若数据库中没有任何学期，测试脚本无法创建申请；脚本应明确报错，而不是静默创建无效数据。
3. `fileStudentCard` 改为可空后，需要兼容历史读取逻辑，反序列化时统一回退为空数组。
