'use client'
import { createContext, useContext, ReactNode } from 'react'

interface LangCtx {
  lang: string
  setLang: (l: string) => void
  t: (key: string) => string
}

const Ctx = createContext<LangCtx>({
  lang: 'id',
  setLang: () => {},
  t: (k) => k,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = (key: string) => key
  return <Ctx.Provider value={{ lang: 'id', setLang: () => {}, t }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
