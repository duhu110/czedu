INSERT INTO "SystemText" ("id", "semesterId", "type", "content", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
  substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
  s."id",
  'PENDING_TEXT',
  '{
  "statusLabel": "待审核",
  "pendingPage": {
    "title": "审核中",
    "description": "您的申请已提交，正在等待教育局和学校审核",
    "detailParagraphs": [
      "当前申请资料已经齐全，工作人员正在进行审核。",
      "审核完成后，系统会进入“通过”或“驳回”结果页。"
    ]
  }
}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Semester" s
WHERE NOT EXISTS (
  SELECT 1
  FROM "SystemText" st
  WHERE st."semesterId" = s."id" AND st."type" = 'PENDING_TEXT'
);

INSERT INTO "SystemText" ("id", "semesterId", "type", "content", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
  substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
  s."id",
  'APPROVED_TEXT',
  '{
  "statusLabel": "审核通过",
  "confirmationPage": {
    "title": "确认结果",
    "description": "您的申请已审核通过",
    "resultTitle": "审核通过"
  }
}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Semester" s
WHERE NOT EXISTS (
  SELECT 1
  FROM "SystemText" st
  WHERE st."semesterId" = s."id" AND st."type" = 'APPROVED_TEXT'
);

INSERT INTO "SystemText" ("id", "semesterId", "type", "content", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
  substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
  s."id",
  'REJECTED_TEXT',
  '{
  "statusLabel": "审核驳回",
  "confirmationPage": {
    "title": "确认结果",
    "description": "您的申请未通过审核",
    "resultTitle": "审核驳回",
    "reasonTitle": "驳回原因",
    "emptyReasonText": "未填写审核备注"
  }
}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Semester" s
WHERE NOT EXISTS (
  SELECT 1
  FROM "SystemText" st
  WHERE st."semesterId" = s."id" AND st."type" = 'REJECTED_TEXT'
);

INSERT INTO "SystemText" ("id", "semesterId", "type", "content", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
  substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
  s."id",
  'SUPPLEMENT_TEXT',
  '{
  "statusLabel": "待补学籍信息卡",
  "pendingPage": {
    "title": "待补学籍信息卡",
    "description": "请补传学籍信息卡后继续审核",
    "detailParagraphs": [
      "系统已收到您的基本申请资料，但学籍信息卡尚未上传。",
      "请补传学籍信息卡后，申请会自动转入正式审核流程。"
    ],
    "ctaLabel": "去补充学籍信息卡"
  },
  "supplementPage": {
    "title": "补传学籍信息卡",
    "description": "该申请缺少学籍信息表，请补传后继续审核。",
    "uploadedSummary": "已上传资料仅展示提交状态，不在此页面重复展示图片内容。"
  }
}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Semester" s
WHERE NOT EXISTS (
  SELECT 1
  FROM "SystemText" st
  WHERE st."semesterId" = s."id" AND st."type" = 'SUPPLEMENT_TEXT'
);

INSERT INTO "SystemText" ("id", "semesterId", "type", "content", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
  substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
  s."id",
  'EDITING_TEXT',
  '{
  "statusLabel": "待修改",
  "pendingPage": {
    "title": "需要修改",
    "description": "您的申请需要修改部分信息，请扫描现场提供的二维码进行修改",
    "detailParagraphs": [
      "审核人员发现您的部分申请信息需要修改。",
      "请前往登记处，扫描工作人员提供的二维码进行修改。"
    ]
  },
  "editPage": {
    "title": "修改转学申请信息",
    "subtitle": "{name} 的转学申请",
    "remarkTitle": "审核人员备注",
    "fieldsTitle": "以下信息需要修改（标红的字段）：",
    "invalidMessages": {
      "missing_params": {
        "title": "链接无效",
        "desc": "缺少必要的安全参数，请从二维码重新扫描。"
      },
      "invalid_signature": {
        "title": "链接无效",
        "desc": "安全签名验证失败，请确认二维码来源正确。"
      },
      "not_editing": {
        "title": "链接已失效",
        "desc": "该申请的修改已提交或状态已变更，此链接不再有效。"
      }
    }
  }
}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Semester" s
WHERE NOT EXISTS (
  SELECT 1
  FROM "SystemText" st
  WHERE st."semesterId" = s."id" AND st."type" = 'EDITING_TEXT'
);
