-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "districtRange" TEXT NOT NULL DEFAULT "[]",
    "address" TEXT NOT NULL DEFAULT "",
    "notice" TEXT NOT NULL DEFAULT "",
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "School_name_key" ON "School"("name");

-- SeedData
INSERT INTO "School" ("id", "name", "districtRange", "address", "notice", "createdAt", "updatedAt") VALUES
('school-001', '西关街小学', '["南关街（单号：21-最大号；双号：18-最大号）","民主街","人民街","北斗宫街","营房巷","水井巷及中央商务区住宅楼","长江路（单号：67-89；双号：76-130）"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-002', '水井巷小学', '["南山路（单号：21-最大号；双号：22-最大号）","长江路（单号：91-最大号；双号：132-最大号）","新青巷","凤凰山路（中区户籍）","南园村"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-003', '南山路小学', '["南大街（单号：51-最大号；双号：98-最大号）","农建巷","昆仑中路（城中户籍）","体育巷","动态学区：体育巷9号、花园南街81号、南大街双号90-96号"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-004', '南大街小学', '["南关街（单号：1-19；双号：2-16）","南大街（单号：1-49；双号2-54）","解放巷","莫家街","雷鸣寺街","宏觉寺街（上下）","仓门街","合作巷","前营街","后营街","夏都大街（城中户籍）","动态学区：南大街双号56-88号、花园南街66号"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-005', '观门街小学', '["斗行街","五一路（双号）","七一路381号","生产巷","观门街","花园南北街（城中户籍，不含花园南街66号）"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-006', '玉井巷小学', '["法院街","南玉井巷","北玉井巷","新民街","饮马街","兴隆巷","石坡街","大新街","小新街","东大街"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-007', '北大街小学', '["北大街","文化街","勤学巷"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-008', '北大街小学凤临校区', '["香格里拉路双号：6-最大号"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-009', '七一路小学', '["滨河南路","上滨河路","七一路","长江路（单号：1-43；双号：2-26）"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-010', '大同街小学', '["解放路","西大街","大同街","礼让街","新华街","自新巷","教场街","斜石巷","互助巷","长江路（单号：45-65；双号：28-74）"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-011', '劳动路小学', '["建新巷（城中户籍）","建材巷","劳动巷","翠南路","南山路（单号：1-19；双号：2-20）","南小街68号"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-012', '红星小学', '["香格里拉路（单号：双号：2-4）","砖场路","红星村（二三队）","园树村","园树新村","南川西路（单号：1-41；双号：2-48）","园树庄","园树巷"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-013', '南川西路小学', '["南川西路（单号：43-123；双号：50-98）","沈新巷","红星村一队"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-014', '沈家寨学校', '["南川西路（单号：125-最大号，其中不含145号；双号：100-最大号）","福禄巷","沈家寨村","时代大道3号","安宁路连号：6-最大号","海山街","动态学区：湟源大街15、16号、安宁路连号：1-5号"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-015', '逸夫小学', '["总北村","总南村","金十字社区","动态学区：麟河路"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-016', '龙泰小学', '["南川东路（单号：1-67；双号：2-60）","南西山村（路）","红光村"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-017', '南川东路小学', '["南川东路（单号：69-最大号；双号：62-最大号）","水磨村","动态学区：南川西路145号"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-018', '阳光小学', '["对口接收总寨农村及教学点学生","塘马坊村","泉儿湾村","新安庄村","元堡子村","新庄村"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-019', '华罗庚实验学校西宁分校', '["城南新区","杜家庄"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-020', '逯家寨学校', '["逯家寨村","陈家窑村"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('school-021', '谢家寨小学', '["谢家寨村","璃珑大厦","动态学区：兴川路"]', '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
