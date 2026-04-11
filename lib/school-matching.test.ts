import { describe, expect, it } from "vitest";
import {
  parseDistrictRange,
  extractHouseNumber,
  matchSchoolForAddress,
  getRecommendedSchool,
} from "@/lib/school-matching";
import type { SchoolEntry } from "@/lib/school-matching";

// 使用实际 school_list.json 的子集进行测试
const testSchoolList: SchoolEntry[] = [
  {
    school_name: "西关街小学",
    district_range: [
      "南关街（单号：21-最大号；双号：18-最大号）",
      "民主街",
      "人民街",
      "北斗宫街",
      "营房巷",
      "水井巷及中央商务区住宅楼",
      "长江路（单号：67-89；双号：76-130）",
    ],
  },
  {
    school_name: "水井巷小学",
    district_range: [
      "南山路（单号：21-最大号；双号：22-最大号）",
      "长江路（单号：91-最大号；双号：132-最大号）",
      "新青巷",
      "凤凰山路（中区户籍）",
      "南园村",
    ],
  },
  {
    school_name: "南山路小学",
    district_range: [
      "南大街（单号：51-最大号；双号：98-最大号）",
      "农建巷",
      "昆仑中路（城中户籍）",
      "体育巷",
      "动态学区：体育巷9号、花园南街81号、南大街双号90-96号",
    ],
  },
  {
    school_name: "南大街小学",
    district_range: [
      "南关街（单号：1-19；双号：2-16）",
      "南大街（单号：1-49；双号2-54）",
      "解放巷",
      "莫家街",
      "夏都大街（城中户籍）",
      "动态学区：南大街双号56-88号、花园南街66号",
    ],
  },
  {
    school_name: "观门街小学",
    district_range: [
      "斗行街",
      "五一路（双号）",
      "七一路381号",
      "生产巷",
      "观门街",
      "花园南北街（城中户籍，不含花园南街66号）",
    ],
  },
  {
    school_name: "七一路小学",
    district_range: [
      "滨河南路",
      "上滨河路",
      "七一路",
      "长江路（单号：1-43；双号：2-26）",
    ],
  },
  {
    school_name: "劳动路小学",
    district_range: [
      "建新巷（城中户籍）",
      "建材巷",
      "劳动巷",
      "翠南路",
      "南山路（单号：1-19；双号：2-20）",
      "南小街68号",
    ],
  },
  {
    school_name: "沈家寨学校",
    district_range: [
      "南川西路（单号：125-最大号，其中不含145号；双号：100-最大号）",
      "福禄巷",
      "沈家寨村",
      "时代大道3号",
      "安宁路连号：6-最大号",
      "海山街",
      "动态学区：湟源大街15、16号、安宁路连号：1-5号",
    ],
  },
  {
    school_name: "南川东路小学",
    district_range: [
      "南川东路（单号：69-最大号；双号：62-最大号）",
      "水磨村",
      "动态学区：南川西路145号",
    ],
  },
  {
    school_name: "逸夫小学",
    district_range: [
      "总北村",
      "总南村",
      "金十字社区",
      "动态学区：麟河路",
    ],
  },
  {
    school_name: "北大街小学凤临校区",
    district_range: ["香格里拉路双号：6-最大号"],
  },
  {
    school_name: "阳光小学",
    district_range: [
      "对口接收总寨农村及教学点学生",
      "塘马坊村",
      "泉儿湾村",
    ],
  },
];

// ==============================
// parseDistrictRange
// ==============================
describe("parseDistrictRange", () => {
  it("parses a simple street name", () => {
    const rule = parseDistrictRange("民主街");
    expect(rule).toEqual({ type: "simple", street: "民主街" });
  });

  it("parses odd/even number ranges", () => {
    const rule = parseDistrictRange(
      "南关街（单号：21-最大号；双号：18-最大号）",
    );
    expect(rule.type).toBe("range");
    if (rule.type === "range") {
      expect(rule.street).toBe("南关街");
      expect(rule.ranges).toHaveLength(2);
      expect(rule.ranges[0]).toMatchObject({ parity: "odd", min: 21, max: Infinity });
      expect(rule.ranges[1]).toMatchObject({ parity: "even", min: 18, max: Infinity });
    }
  });

  it("parses bounded number ranges", () => {
    const rule = parseDistrictRange("长江路（单号：67-89；双号：76-130）");
    expect(rule.type).toBe("range");
    if (rule.type === "range") {
      expect(rule.street).toBe("长江路");
      expect(rule.ranges[0]).toMatchObject({ parity: "odd", min: 67, max: 89 });
      expect(rule.ranges[1]).toMatchObject({ parity: "even", min: 76, max: 130 });
    }
  });

  it("parses inline range without brackets (连号)", () => {
    const rule = parseDistrictRange("安宁路连号：6-最大号");
    expect(rule.type).toBe("range");
    if (rule.type === "range") {
      expect(rule.street).toBe("安宁路");
      expect(rule.ranges[0]).toMatchObject({ parity: "any", min: 6, max: Infinity });
    }
  });

  it("parses inline range without brackets (双号)", () => {
    const rule = parseDistrictRange("香格里拉路双号：6-最大号");
    expect(rule.type).toBe("range");
    if (rule.type === "range") {
      expect(rule.street).toBe("香格里拉路");
      expect(rule.ranges[0]).toMatchObject({ parity: "even", min: 6, max: Infinity });
    }
  });

  it("parses residency condition (中区户籍)", () => {
    const rule = parseDistrictRange("凤凰山路（中区户籍）");
    expect(rule).toEqual({ type: "residency", street: "凤凰山路", requiredType: "LOCAL" });
  });

  it("parses residency condition (城中户籍)", () => {
    const rule = parseDistrictRange("建新巷（城中户籍）");
    expect(rule).toEqual({ type: "residency", street: "建新巷", requiredType: "LOCAL" });
  });

  it("parses exact house number", () => {
    const rule = parseDistrictRange("七一路381号");
    expect(rule).toEqual({ type: "exact", street: "七一路", number: 381 });
  });

  it("parses dynamic district with multiple sub-entries", () => {
    const rule = parseDistrictRange(
      "动态学区：体育巷9号、花园南街81号、南大街双号90-96号",
    );
    expect(rule.type).toBe("dynamic");
    if (rule.type === "dynamic") {
      expect(rule.subrules).toHaveLength(3);
      expect(rule.subrules[0]).toEqual({ type: "exact", street: "体育巷", number: 9 });
      expect(rule.subrules[1]).toEqual({ type: "exact", street: "花园南街", number: 81 });
    }
  });

  it("parses exclusion condition (不含)", () => {
    const rule = parseDistrictRange(
      "南川西路（单号：125-最大号，其中不含145号；双号：100-最大号）",
    );
    expect(rule.type).toBe("exclusion");
    if (rule.type === "exclusion") {
      expect(rule.street).toBe("南川西路");
      expect(rule.ranges).toHaveLength(2);
      expect(rule.excludeAddresses).toContain("145号");
    }
  });

  it("parses exclusion with residency (城中户籍，不含花园南街66号)", () => {
    const rule = parseDistrictRange("花园南北街（城中户籍，不含花园南街66号）");
    expect(rule.type).toBe("exclusion");
    if (rule.type === "exclusion") {
      expect(rule.street).toBe("花园南北街");
      expect(rule.excludeAddresses).toContain("花园南街66号");
    }
  });

  it("parses 双号 without range in brackets", () => {
    const rule = parseDistrictRange("五一路（双号）");
    expect(rule.type).toBe("range");
    if (rule.type === "range") {
      expect(rule.street).toBe("五一路");
      expect(rule.ranges[0]).toMatchObject({ parity: "even", min: 2, max: Infinity });
    }
  });

  it("returns manual for broad description", () => {
    const rule = parseDistrictRange("对口接收总寨农村及教学点学生");
    expect(rule.type).toBe("manual");
  });
});

// ==============================
// extractHouseNumber
// ==============================
describe("extractHouseNumber", () => {
  it("extracts number after street name", () => {
    expect(extractHouseNumber("城中区南关街25号1栋", "南关街")).toBe(25);
  });

  it("returns null when street not found", () => {
    expect(extractHouseNumber("城中区民主街12号", "南关街")).toBeNull();
  });

  it("returns null when no number follows street", () => {
    expect(extractHouseNumber("城中区民主街附近", "民主街")).toBeNull();
  });

  it("extracts number without 号 suffix", () => {
    expect(extractHouseNumber("长江路89号院", "长江路")).toBe(89);
  });
});

// ==============================
// matchSchoolForAddress
// ==============================
describe("matchSchoolForAddress", () => {
  it("matches simple street name", () => {
    expect(
      matchSchoolForAddress("城中区民主街12号", "LOCAL", testSchoolList),
    ).toBe("西关街小学");
  });

  it("matches odd number in range (单号 21-最大号)", () => {
    expect(
      matchSchoolForAddress("城中区南关街23号", "LOCAL", testSchoolList),
    ).toBe("西关街小学");
  });

  it("matches even number in range (双号 18-最大号)", () => {
    expect(
      matchSchoolForAddress("城中区南关街20号", "LOCAL", testSchoolList),
    ).toBe("西关街小学");
  });

  it("does not match odd number below range", () => {
    // 南关街 单号 21-最大号 (西关街) vs 单号 1-19 (南大街)
    // 19 is odd and in range 1-19
    expect(
      matchSchoolForAddress("城中区南关街19号", "LOCAL", testSchoolList),
    ).toBe("南大街小学");
  });

  it("matches even number in bounded range (双号 2-16)", () => {
    expect(
      matchSchoolForAddress("城中区南关街16号", "LOCAL", testSchoolList),
    ).toBe("南大街小学");
  });

  it("matches max boundary (最大号 means no upper bound)", () => {
    expect(
      matchSchoolForAddress("城中区南关街999号", "LOCAL", testSchoolList),
    ).toBe("西关街小学");
  });

  it("matches bounded range correctly (单号 67-89)", () => {
    expect(
      matchSchoolForAddress("城中区长江路67号", "LOCAL", testSchoolList),
    ).toBe("西关街小学");
  });

  it("does not match outside bounded range (单号 91 not in 67-89)", () => {
    // 91 falls into 水井巷小学's range: 单号 91-最大号
    expect(
      matchSchoolForAddress("城中区长江路91号", "LOCAL", testSchoolList),
    ).toBe("水井巷小学");
  });

  it("matches exact house number (七一路381号)", () => {
    expect(
      matchSchoolForAddress("城中区七一路381号", "LOCAL", testSchoolList),
    ).toBe("观门街小学");
  });

  it("matches residency-conditional street for LOCAL", () => {
    expect(
      matchSchoolForAddress("城中区凤凰山路10号", "LOCAL", testSchoolList),
    ).toBe("水井巷小学");
  });

  it("does not match residency-conditional street for NON_LOCAL", () => {
    expect(
      matchSchoolForAddress("城中区凤凰山路10号", "NON_LOCAL", testSchoolList),
    ).toBeNull();
  });

  it("matches dynamic district exact address (体育巷9号)", () => {
    expect(
      matchSchoolForAddress("城中区体育巷9号", "LOCAL", testSchoolList),
    ).toBe("南山路小学");
  });

  it("matches dynamic district (花园南街81号)", () => {
    expect(
      matchSchoolForAddress("城中区花园南街81号", "LOCAL", testSchoolList),
    ).toBe("南山路小学");
  });

  it("matches 连号 range (安宁路连号：6-最大号)", () => {
    expect(
      matchSchoolForAddress("城中区安宁路8号", "LOCAL", testSchoolList),
    ).toBe("沈家寨学校");
  });

  it("matches 连号 range for odd number too", () => {
    expect(
      matchSchoolForAddress("城中区安宁路7号", "LOCAL", testSchoolList),
    ).toBe("沈家寨学校");
  });

  it("does not match excluded number (不含145号)", () => {
    // 南川西路145号 is excluded from 沈家寨学校, should match 南川东路小学 via 动态学区
    expect(
      matchSchoolForAddress("城中区南川西路145号", "LOCAL", testSchoolList),
    ).toBe("南川东路小学");
  });

  it("matches village name simply", () => {
    expect(
      matchSchoolForAddress("城中区沈家寨村18号", "LOCAL", testSchoolList),
    ).toBe("沈家寨学校");
  });

  it("returns null for unmatched address", () => {
    expect(
      matchSchoolForAddress("西宁市大通县某某路1号", "LOCAL", testSchoolList),
    ).toBeNull();
  });

  it("returns null for empty address", () => {
    expect(matchSchoolForAddress("", "LOCAL", testSchoolList)).toBeNull();
  });

  it("matches 双号 only for even numbers (五一路（双号）)", () => {
    expect(
      matchSchoolForAddress("城中区五一路8号", "LOCAL", testSchoolList),
    ).toBe("观门街小学");
  });

  it("does not match 五一路 for odd number", () => {
    expect(
      matchSchoolForAddress("城中区五一路7号", "LOCAL", testSchoolList),
    ).toBeNull();
  });

  it("matches exclusion street but not excluded address (花园南北街)", () => {
    // 花园南北街 matches 观门街小学, but 花园南街66号 is excluded → 南大街小学 via 动态学区
    expect(
      matchSchoolForAddress("城中区花园南街66号", "LOCAL", testSchoolList),
    ).toBe("南大街小学");
  });
});

// ==============================
// getRecommendedSchool
// ==============================
describe("getRecommendedSchool", () => {
  it("returns school for LOCAL when addresses match", () => {
    const result = getRecommendedSchool(
      "城中区民主街12号",
      "城中区民主街12号",
      "LOCAL",
    );
    expect(result).toBe("西关街小学");
  });

  it("returns null for LOCAL when addresses differ", () => {
    const result = getRecommendedSchool(
      "城中区民主街12号",
      "城中区南关街25号",
      "LOCAL",
    );
    expect(result).toBeNull();
  });

  it("returns school for NON_LOCAL using living address", () => {
    const result = getRecommendedSchool(
      "大通县某某路",
      "城中区民主街12号",
      "NON_LOCAL",
    );
    expect(result).toBe("西关街小学");
  });

  it("returns null for NON_LOCAL when living address has no match", () => {
    const result = getRecommendedSchool(
      "大通县某某路",
      "大通县某某路",
      "NON_LOCAL",
    );
    expect(result).toBeNull();
  });
});
