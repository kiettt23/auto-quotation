"use client";

import { createContext, useContext } from "react";

type CompanyContextValue = {
  companyId: string;
  companyName: string;
};

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({
  value,
  children,
}: {
  value: CompanyContextValue;
  children: React.ReactNode;
}) {
  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

/** Get current company context — throws if used outside CompanyProvider */
export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext);
  if (!ctx) {
    throw new Error("useCompany must be used within CompanyProvider");
  }
  return ctx;
}
