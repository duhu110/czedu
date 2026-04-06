"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type ApplicationStatus =
  | "form"
  | "pending"
  | "confirmation"
  | "supplement";

export interface BasicInfo {
  studentName: string;
  studentId: string;
  currentSchool: string;
  currentGrade: string;
  targetSchool: string;
  targetGrade: string;
  phone: string;
  email: string;
  reason: string;
}

export interface SupplementInfo {
  idCardFront: string | null;
  idCardBack: string | null;
  transcript: string | null;
  transferLetter: string | null;
  additionalDocs: string[];
}

interface TransferContextType {
  status: ApplicationStatus;
  setStatus: (status: ApplicationStatus) => void;
  basicInfo: BasicInfo;
  setBasicInfo: (info: BasicInfo) => void;
  supplementInfo: SupplementInfo;
  setSupplementInfo: (info: SupplementInfo) => void;
  confirmedNotices: string[];
  setConfirmedNotices: (notices: string[]) => void;
}

const TransferContext = createContext<TransferContextType | undefined>(
  undefined,
);

export function TransferProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ApplicationStatus>("form");
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    studentName: "",
    studentId: "",
    currentSchool: "",
    currentGrade: "",
    targetSchool: "",
    targetGrade: "",
    phone: "",
    email: "",
    reason: "",
  });
  const [supplementInfo, setSupplementInfo] = useState<SupplementInfo>({
    idCardFront: null,
    idCardBack: null,
    transcript: null,
    transferLetter: null,
    additionalDocs: [],
  });
  const [confirmedNotices, setConfirmedNotices] = useState<string[]>([]);

  return (
    <TransferContext.Provider
      value={{
        status,
        setStatus,
        basicInfo,
        setBasicInfo,
        supplementInfo,
        setSupplementInfo,
        confirmedNotices,
        setConfirmedNotices,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfer() {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error("useTransfer must be used within a TransferProvider");
  }
  return context;
}
