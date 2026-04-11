"use client";

import { useEffect, useState } from "react";
import { useSemester } from "@/lib/semester-context";
import { getSystemTexts } from "@/app/actions/system-text";
import {
  SYSTEM_TEXT_TYPES,
  systemTextTypeMap,
  type SystemTextType,
} from "@/lib/validations/system-text";
import { SystemTextCard } from "./system-text-card";

interface SystemTextRecord {
  id: string;
  semesterId: string;
  type: string;
  content: string;
}

export function SystemTextManager() {
  const { selectedSemester } = useSemester();
  const [texts, setTexts] = useState<SystemTextRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTexts = async (semesterId: string) => {
    setLoading(true);
    try {
      const result = await getSystemTexts(semesterId);
      if (result.success) {
        setTexts(result.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSemester?.id) {
      fetchTexts(selectedSemester.id);
    } else {
      setTexts([]);
    }
  }, [selectedSemester?.id]);

  if (!selectedSemester) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
        请先在左侧选择一个学期
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
        加载中...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {SYSTEM_TEXT_TYPES.map((type) => {
        const meta = systemTextTypeMap[type];
        const record = texts.find((t) => t.type === type);
        return (
          <SystemTextCard
            key={type}
            type={type as SystemTextType}
            label={meta.label}
            description={meta.description}
            content={record?.content}
            semesterId={selectedSemester.id}
            onSaved={() => fetchTexts(selectedSemester.id)}
          />
        );
      })}
    </div>
  );
}
