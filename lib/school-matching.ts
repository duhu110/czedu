import schoolListData from "@/lib/data/school_list.json";

export type SchoolEntry = {
  school_name: string;
  district_range: string[];
};

export type SchoolDataSourceEntry = {
  name: string;
  districtRange: string[];
};

type NumberRange = {
  parity: "odd" | "even" | "any";
  min: number;
  max: number; // Infinity for "最大号"
  excludes: number[];
};

type ParsedRule =
  | { type: "simple"; street: string }
  | { type: "range"; street: string; ranges: NumberRange[] }
  | { type: "exact"; street: string; number: number }
  | { type: "residency"; street: string; requiredType: "LOCAL" }
  | { type: "dynamic"; subrules: ParsedRule[] }
  | { type: "exclusion"; street: string; ranges: NumberRange[]; excludeAddresses: string[] }
  | { type: "manual" };

const schoolList: SchoolEntry[] = schoolListData;

export function toSchoolEntries(
  list: SchoolDataSourceEntry[],
): SchoolEntry[] {
  return list.map((school) => ({
    school_name: school.name,
    district_range: school.districtRange,
  }));
}

/**
 * 从 district_range 条目中解析出匹配规则
 */
export function parseDistrictRange(entry: string): ParsedRule {
  // 动态学区
  if (entry.startsWith("动态学区：") || entry.startsWith("动态学区:")) {
    const content = entry.replace(/^动态学区[：:]/, "");
    const parts = content.split("、");
    const subrules = parts.map((p) => parseSingleEntry(p.trim()));
    return { type: "dynamic", subrules };
  }

  return parseSingleEntry(entry);
}

function parseSingleEntry(entry: string): ParsedRule {
  // 1. 检查是否有括号（全角或半角）
  const bracketMatch = entry.match(/^(.+?)[（(](.+?)[）)]$/);

  if (bracketMatch) {
    const street = bracketMatch[1].trim();
    const inside = bracketMatch[2].trim();

    // 检查是否包含排除条件（截取到下一个；或字符串末尾）
    const excludeMatch = inside.match(/不含([^；;]+)/);
    const excludeAddresses: string[] = [];
    if (excludeMatch) {
      excludeAddresses.push(
        ...excludeMatch[1]
          .split(/[、,]/)
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }

    // 检查是否为户籍条件
    if (/中区户籍|城中户籍/.test(inside) && !parseRangeClausesFromString(inside).length) {
      if (excludeAddresses.length > 0) {
        return { type: "exclusion", street, ranges: [], excludeAddresses };
      }
      return { type: "residency", street, requiredType: "LOCAL" };
    }

    // 检查是否有号段范围
    const ranges = parseRangeClausesFromString(inside);
    if (ranges.length > 0) {
      if (excludeAddresses.length > 0) {
        return { type: "exclusion", street, ranges, excludeAddresses };
      }
      return { type: "range", street, ranges };
    }

    // 无法识别的括号内容，按简单匹配处理（如"上下"、"二三队"、"路"等）
    return { type: "simple", street };
  }

  // 2. 无括号格式

  // 检查 "街名双号：N-M" 或 "街名连号：N-M" 格式（如 "香格里拉路双号：6-最大号"）
  const inlineRangeMatch = entry.match(
    /^(.+?)(单号|双号|连号)[：:](.+)$/,
  );
  if (inlineRangeMatch) {
    const street = inlineRangeMatch[1].trim();
    const parityStr = inlineRangeMatch[2];
    const rangeStr = inlineRangeMatch[3].trim();
    const range = parseSingleRange(parityStr, rangeStr);
    if (range) {
      return { type: "range", street, ranges: [range] };
    }
  }

  // 检查精确门牌号格式：如 "七一路381号"、"南小街68号"、"时代大道3号"
  const exactMatch = entry.match(/^(.+?)(\d+)号$/);
  if (exactMatch) {
    const street = exactMatch[1].trim();
    const number = parseInt(exactMatch[2], 10);
    return { type: "exact", street, number };
  }

  // 宽泛描述（如"对口接收总寨农村及教学点学生"）
  if (entry.includes("对口接收")) {
    return { type: "manual" };
  }

  // 默认：简单街名匹配
  return { type: "simple", street: entry.trim() };
}

/**
 * 从括号内的字符串中解析号段范围
 * 如 "单号：21-最大号；双号：18-最大号" 或 "单号：1-43；双号：2-26"
 */
function parseRangeClausesFromString(str: string): NumberRange[] {
  const ranges: NumberRange[] = [];

  // 先去除排除条件和户籍条件的部分（非贪婪匹配，避免吞掉分号后的子句）
  const cleanStr = str
    .replace(/[，,]其中不含[^；;]*/g, "")
    .replace(/[，,]不含[^；;]*/g, "")
    .replace(/[，,]?城中户籍/g, "")
    .replace(/[，,]?中区户籍/g, "");

  // 分割子句：用 ；ˍ; 分割
  const clauses = cleanStr.split(/[；;]/);

  for (const clause of clauses) {
    const trimmed = clause.trim();
    if (!trimmed) continue;

    // 匹配 "单号：N-M" 或 "双号：N-M" 或 "连号：N-M"
    const clauseMatch = trimmed.match(
      /^(单号|双号|连号)[：:](.+)$/,
    );
    if (clauseMatch) {
      const range = parseSingleRange(clauseMatch[1], clauseMatch[2].trim());
      if (range) ranges.push(range);
      continue;
    }

    // 特殊格式处理："双号" 无范围（如"五一路（双号）"）
    if (trimmed === "单号") {
      ranges.push({ parity: "odd", min: 1, max: Infinity, excludes: [] });
    } else if (trimmed === "双号") {
      ranges.push({ parity: "even", min: 2, max: Infinity, excludes: [] });
    }
  }

  return ranges;
}

/**
 * 解析单个范围表达式
 * 如 "21-最大号" → { min: 21, max: Infinity }
 * 如 "1-43" → { min: 1, max: 43 }
 * 如 "125-最大号，其中不含145号" → { min: 125, max: Infinity, excludes: [145] }
 */
function parseSingleRange(parityStr: string, rangeStr: string): NumberRange | null {
  const parity: NumberRange["parity"] =
    parityStr === "单号" ? "odd" : parityStr === "双号" ? "even" : "any";

  // 提取排除号码
  const excludes: number[] = [];
  const excludeMatch = rangeStr.match(/其中不含(\d+)号/);
  if (excludeMatch) {
    excludes.push(parseInt(excludeMatch[1], 10));
  }

  // 清理范围字符串
  const cleanRange = rangeStr.replace(/[，,].*其中不含.*/, "").trim();

  const rangeMatch = cleanRange.match(/^(\d+)\s*-\s*(\d+|最大号)$/);
  if (!rangeMatch) return null;

  const min = parseInt(rangeMatch[1], 10);
  const max = rangeMatch[2] === "最大号" ? Infinity : parseInt(rangeMatch[2], 10);

  return { parity, min, max, excludes };
}

/**
 * 从用户地址中提取某个街道名之后的门牌号
 */
export function extractHouseNumber(address: string, street: string): number | null {
  const idx = address.indexOf(street);
  if (idx === -1) return null;
  const after = address.slice(idx + street.length);
  const numMatch = after.match(/^(\d+)/);
  if (!numMatch) return null;
  return parseInt(numMatch[1], 10);
}

/**
 * 检查门牌号是否匹配某个范围
 */
function matchesRange(number: number, range: NumberRange): boolean {
  // 检查奇偶性
  if (range.parity === "odd" && number % 2 === 0) return false;
  if (range.parity === "even" && number % 2 !== 0) return false;

  // 检查范围
  if (number < range.min || number > range.max) return false;

  // 检查排除
  if (range.excludes.includes(number)) return false;

  return true;
}

/**
 * 检查地址是否匹配某条排除地址
 */
function matchesExcludeAddress(address: string, excludeAddr: string): boolean {
  // 精确门牌号格式
  const exactMatch = excludeAddr.match(/^(.+?)(\d+)号$/);
  if (exactMatch) {
    const street = exactMatch[1].trim();
    const num = parseInt(exactMatch[2], 10);
    if (address.includes(street)) {
      const houseNum = extractHouseNumber(address, street);
      return houseNum === num;
    }
    return false;
  }
  return address.includes(excludeAddr);
}

/**
 * 检查一个地址是否匹配某条规则
 */
function matchesRule(
  address: string,
  rule: ParsedRule,
  residencyType: "LOCAL" | "NON_LOCAL",
): boolean {
  switch (rule.type) {
    case "simple":
      return address.includes(rule.street);

    case "range": {
      if (!address.includes(rule.street)) return false;
      const houseNum = extractHouseNumber(address, rule.street);
      if (houseNum === null) return false;
      return rule.ranges.some((r) => matchesRange(houseNum, r));
    }

    case "exact": {
      if (!address.includes(rule.street)) return false;
      const num = extractHouseNumber(address, rule.street);
      return num === rule.number;
    }

    case "residency":
      return residencyType === "LOCAL" && address.includes(rule.street);

    case "exclusion": {
      if (!address.includes(rule.street)) return false;
      // 检查排除地址
      for (const ex of rule.excludeAddresses) {
        if (matchesExcludeAddress(address, ex)) return false;
      }
      // 如果有范围则检查范围，否则简单匹配
      if (rule.ranges.length > 0) {
        const houseNum = extractHouseNumber(address, rule.street);
        if (houseNum === null) return false;
        return rule.ranges.some((r) => matchesRange(houseNum, r));
      }
      return true;
    }

    case "dynamic":
      return rule.subrules.some((sub) => matchesRule(address, sub, residencyType));

    case "manual":
      return false;
  }
}

/**
 * 对单个地址匹配学校列表，返回第一个匹配的学校名
 */
export function matchSchoolForAddress(
  address: string,
  residencyType: "LOCAL" | "NON_LOCAL",
  list: SchoolEntry[] = schoolList,
): string | null {
  if (!address || !address.trim()) return null;

  for (const school of list) {
    for (const rangeEntry of school.district_range) {
      const rule = parseDistrictRange(rangeEntry);
      if (matchesRule(address, rule, residencyType)) {
        return school.school_name;
      }
    }
  }

  return null;
}

/**
 * 根据户籍类型和地址，推荐目标学校
 * - LOCAL：户籍地址与居住地址一致时匹配
 * - NON_LOCAL：使用居住地址匹配
 */
export function getRecommendedSchool(
  hukouAddress: string,
  livingAddress: string,
  residencyType: "LOCAL" | "NON_LOCAL",
  list: SchoolEntry[] = schoolList,
): string | null {
  if (residencyType === "LOCAL") {
    if (hukouAddress !== livingAddress) return null;
    return matchSchoolForAddress(hukouAddress, residencyType, list);
  }
  return matchSchoolForAddress(livingAddress, residencyType, list);
}

/**
 * 获取所有学校名列表
 */
export function getSchoolNames(list: SchoolEntry[] = schoolList): string[] {
  return list.map((s) => s.school_name);
}
