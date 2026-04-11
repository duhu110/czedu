# 转学申请工单状态流转表

## 目的

本文档用于统一当前项目中“转学申请工单”的状态定义、允许流转、管理端操作规则与页面展示规则，作为后续实现和改动时的单一参考口径。

当前实现以以下代码为准：

- `app/actions/application.ts`
- `app/admin/(auth)/applications/_components/approval-panel.tsx`
- `app/application/**`

## 状态定义

| 状态 | 中文名 | 含义 |
| --- | --- | --- |
| `PENDING` | 待审核 | 资料已齐备，等待管理员审核 |
| `APPROVED` | 已通过 | 管理员审核通过，已分配目标学校 |
| `REJECTED` | 已驳回 | 管理员终止申请，申请不再继续 |
| `SUPPLEMENT` | 待补学籍信息卡 | 用户提交时缺少学籍信息卡，需先补件 |
| `EDITING` | 待修改 | 管理员驳回修改了指定字段，等待家长扫码修改后重新提交 |

## 状态流转总表

### 系统与用户侧流转

| 当前状态 | 触发方 | 动作 | 下一个状态 | 说明 |
| --- | --- | --- | --- | --- |
| 无 | 用户 | 新建申请，且已上传 `fileStudentCard` | `PENDING` | 正常进入待审核 |
| 无 | 用户 | 新建申请，未上传 `fileStudentCard` | `SUPPLEMENT` | 先生成申请，再补学籍卡 |
| `SUPPLEMENT` | 用户 | 补传 `fileStudentCard` | `PENDING` | 补件完成，进入待审核 |
| `EDITING` | 用户 | 扫码修改并重新提交 | `PENDING` | 清空 `rejectedFields`、`adminRemark`、`targetSchool` |

### 管理端流转

| 当前状态 | 管理员动作 | 下一个状态 | 必填条件 |
| --- | --- | --- | --- |
| `PENDING` | 通过申请 | `APPROVED` | `targetSchool` 必填 |
| `PENDING` | 驳回修改 | `EDITING` | `rejectedFields` 至少 1 项，`adminRemark` 必填 |
| `PENDING` | 驳回申请 | `REJECTED` | `adminRemark` 必填 |
| `SUPPLEMENT` | 驳回申请 | `REJECTED` | `adminRemark` 必填 |
| `EDITING` | 驳回申请 | `REJECTED` | `adminRemark` 必填 |

## 非法流转约束

以下流转当前不允许发生：

| 当前状态 | 不允许的动作 | 原因 |
| --- | --- | --- |
| `SUPPLEMENT` | 通过申请 | 必须先回到 `PENDING` 再审核通过 |
| `SUPPLEMENT` | 驳回修改 | 当前问题是“缺资料”，不是“指定字段修改” |
| `PENDING` | 打回补充 | `SUPPLEMENT` 仅用于“创建时缺学籍卡”或“用户补件中”的系统状态 |
| `EDITING` | 通过申请 | 必须由家长重新提交后回到 `PENDING` 再审核 |
| `EDITING` | 再次驳回修改 | 避免在未重新提交前重复进入编辑流程 |
| `APPROVED` | 任意审核动作 | 已办结 |
| `REJECTED` | 任意审核动作 | 已办结 |

## 管理端审核操作区规则

### 按钮显隐与可点击规则

| 状态 | 删除申请 | 通过申请 | 打回补充 | 驳回修改 | 驳回申请 | 留底页打印 | 家长页打印 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `PENDING` | 显示，可点 | 显示，可点 | 不显示 | 显示，可点 | 显示，可点 | 显示，可点 | 显示，可点 |
| `SUPPLEMENT` | 显示，可点 | 不显示 | 不显示 | 不显示 | 显示，可点 | 显示，可点，点击前提醒 | 显示，可点，点击前提醒 |
| `EDITING` | 显示，可点 | 不显示 | 不显示 | 不显示 | 显示，可点 | 显示，禁用 | 显示，禁用 |
| `APPROVED` | 显示，可点 | 不显示 | 不显示 | 不显示 | 不显示 | 显示，禁用 | 显示，禁用 |
| `REJECTED` | 显示，可点 | 不显示 | 不显示 | 不显示 | 不显示 | 显示，禁用 | 显示，禁用 |

### 备注与输入规则

| 状态 | 目标学校输入 | 审核备注输入 |
| --- | --- | --- |
| `PENDING` | 显示 | 显示 |
| `SUPPLEMENT` | 不显示 | 显示 |
| `EDITING` | 不显示 | 显示 |
| `APPROVED` | 不显示 | 不显示 |
| `REJECTED` | 不显示 | 不显示 |

说明：

1. `targetSchool` 只在 `PENDING` 状态可编辑，并且仅“通过申请”时生效。
2. 审核备注输入框只在 `驳回申请` 可出现的状态中显示，即 `PENDING / SUPPLEMENT / EDITING`。
3. 删除申请对所有状态都提供，且必须二次确认。

## 状态展示规则

| 状态 | 审核操作区展示 |
| --- | --- |
| `APPROVED` | 显示 `updatedAt` 作为“通过时间”；如有 `adminRemark` 一并显示 |
| `REJECTED` | 显示 `updatedAt` 作为“拒绝时间”；如有 `adminRemark` 一并显示 |
| `SUPPLEMENT` | 显示 `updatedAt` 作为“补件时间”；如有 `adminRemark` 一并显示；提示管理员提醒家长尽快补传学籍信息卡 |
| `EDITING` | 显示 `updatedAt` 作为“驳回修改时间”；显示 `adminRemark`；说明当前申请已进入驳回修改流程 |

### 详情页额外提示

`EDITING` 状态下，详情页正文区域还应展示 `rejectedFields` 对应的字段标签列表，用于明确“因为哪些项目不符合要求而被驳回修改”。

## 服务端校验要求

为避免仅靠前端控制造成非法流转，服务端必须校验当前状态与目标状态是否匹配：

| Server Action | 必须校验 |
| --- | --- |
| `updateApplicationStatus` | 只允许 `PENDING -> APPROVED / REJECTED`、`SUPPLEMENT -> REJECTED`、`EDITING -> REJECTED` |
| `rejectForEditing` | 只允许 `PENDING -> EDITING` |
| `submitApplicationSupplement` | 只允许 `SUPPLEMENT -> PENDING` |
| `submitApplicationEdit` | 只允许 `EDITING -> PENDING` |

## 推荐维护规则

后续若新增状态或调整按钮规则，必须同步更新：

1. 本文档。
2. `app/actions/application.ts` 中的状态机约束。
3. `app/admin/(auth)/applications/_components/approval-panel.tsx` 中的按钮与输入逻辑。
4. 相关测试：
   - `app/actions/application.test.ts`
   - `app/admin/(auth)/applications/_components/approval-panel.test.tsx`
