"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { pickPreferredSemester } from "@/lib/semester";

export interface SemesterInfo {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface SemesterContextValue {
  semesters: SemesterInfo[];
  selectedSemester: SemesterInfo | null;
  selectedSemesterId: string | undefined;
  setSelectedSemesterId: (id: string) => void;
}

const SemesterContext = createContext<SemesterContextValue | null>(null);

export function SemesterProvider({
  semesters,
  initialSelectedSemesterId,
  children,
}: {
  semesters: SemesterInfo[];
  initialSelectedSemesterId?: string;
  children: ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(() =>
    pickPreferredSemester(semesters, initialSelectedSemesterId)?.id,
  );

  const selectedSemester = useMemo(
    () => pickPreferredSemester(semesters, selectedId) ?? null,
    [selectedId, semesters],
  );

  const value = useMemo<SemesterContextValue>(
    () => ({
      semesters,
      selectedSemester: selectedSemester as SemesterInfo | null,
      selectedSemesterId: (selectedSemester as SemesterInfo | null)?.id,
      setSelectedSemesterId: setSelectedId,
    }),
    [semesters, selectedSemester],
  );

  return (
    <SemesterContext.Provider value={value}>{children}</SemesterContext.Provider>
  );
}

export function useSemester() {
  const ctx = useContext(SemesterContext);
  if (!ctx) {
    throw new Error("useSemester 必须在 SemesterProvider 内使用");
  }
  return ctx;
}
