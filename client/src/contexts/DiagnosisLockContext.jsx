"use client"

import { createContext, useContext, useState } from "react"

const DiagnosisLockContext = createContext()

export function DiagnosisLockProvider({ children }) {
  const [isDiagnosisLocked, setIsDiagnosisLocked] = useState(true)
  const [unlockReason, setUnlockReason] = useState("")

  const unlockDiagnosis = (reason) => {
    setUnlockReason(reason)
    setIsDiagnosisLocked(false)
  }

  return (
    <DiagnosisLockContext.Provider value={{ isDiagnosisLocked, unlockDiagnosis, unlockReason }}>
      {children}
    </DiagnosisLockContext.Provider>
  )
}

export function useDiagnosisLock() {
  return useContext(DiagnosisLockContext)
}
