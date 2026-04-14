import { describe, expect, it } from "vitest";

import { applicationTestRecordIds } from "@/lib/application-test-records";
import {
  buildApplicationSeedRecords,
  parseSeedCountArg,
} from "../../scripts/create-test-applications-utils.mjs";

function createSequenceRandom(values: number[]) {
  let index = 0;

  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return value;
  };
}

function flattenUploadUrls(value: unknown): string[] {
  if (typeof value === "string") {
    return value ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenUploadUrls(entry));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((entry) => flattenUploadUrls(entry));
  }

  return [];
}

describe("buildApplicationSeedRecords", () => {
  it("builds fixed demo records and requested random records using uploaded images", () => {
    const uploadPaths = [
      "/uploads/1.jpg",
      "/uploads/2.jpg",
      "/uploads/3.jpg",
      "/uploads/4.jpg",
      "/uploads/5.jpg",
      "/uploads/6.jpg",
      "/uploads/7.jpg",
      "/uploads/8.jpg",
    ];

    const records = buildApplicationSeedRecords({
      semesterId: "semester-1",
      uploadPaths,
      count: 3,
      random: createSequenceRandom([
        0.01, 0.21, 0.41, 0.61, 0.81, 0.11, 0.31, 0.51, 0.71, 0.91,
      ]),
    });

    expect(records).toHaveLength(7);
    expect(records.slice(0, 4).map((record) => record.id)).toEqual([
      applicationTestRecordIds.pending,
      applicationTestRecordIds.supplement,
      applicationTestRecordIds.approved,
      applicationTestRecordIds.rejected,
    ]);
    expect(records.slice(4)).toHaveLength(3);

    for (const record of records) {
      expect(record.semesterId).toBe("semester-1");
      expect(["PURCHASE", "RENT"]).toContain(record.propertyType);
      expect(record.guardian1Relation).toBeTruthy();
      expect(record.fileHukou).toEqual(expect.any(String));
      expect(record.fileProperty).toEqual(expect.any(String));
      expect(record.fileResidencePermit).toEqual(expect.any(String));
      expect(record.fileStudentCard).toEqual(expect.any(String));

      const imageUrls = flattenUploadUrls([
        JSON.parse(record.fileHukou),
        JSON.parse(record.fileProperty),
        JSON.parse(record.fileStudentCard),
        JSON.parse(record.fileResidencePermit),
      ]);

      expect(imageUrls.length).toBeGreaterThan(0);
      expect(imageUrls.every((url) => url.startsWith("/uploads/"))).toBe(true);

      const property = JSON.parse(record.fileProperty);
      expect(
        Boolean(
          property.propertyDeed ||
            property.purchaseContract ||
            property.rentalCert,
        ),
      ).toBe(true);
    }
  });

  it("throws when no uploaded images are available", () => {
    expect(() =>
      buildApplicationSeedRecords({
        semesterId: "semester-1",
        uploadPaths: [],
        count: 1,
      }),
    ).toThrow("未找到可用的上传图片");
  });
});

describe("parseSeedCountArg", () => {
  it("accepts both named and positional count arguments", () => {
    expect(parseSeedCountArg(["--count", "4"])).toBe(4);
    expect(parseSeedCountArg(["--count=5"])).toBe(5);
    expect(parseSeedCountArg(["6"])).toBe(6);
    expect(parseSeedCountArg([])).toBe(6);
  });
});
