import {
  Accessor,
  createContext,
  createEffect,
  createResource,
  createSignal,
  ParentComponent,
  Show,
  useContext,
} from "solid-js"

import type { Catalogue } from "./catalogues/en"
export { Catalogue }
export type CatalogueKey = keyof Catalogue

const allLangs = ["en", "fr"] as const
type I18nLang = typeof allLangs[number]

const defaultLang: I18nLang =
  navigator.languages
    .map(l => l.split("-")[0].toLowerCase() as I18nLang)
    .find(l => allLangs.includes(l)) ?? "en"

interface I18nContext {
  readonly lang: Accessor<I18nLang>
  readonly catalogue: Catalogue
}
const I18nContext = createContext<I18nContext>({
  lang: () => defaultLang,
  // @ts-expect-error
  catalogue: () => {
    throw new Error("No catalogue in dummy provider")
  },
})

export const I18nProvider: ParentComponent = p => {
  const [lang, setLang] = createSignal<I18nLang>(defaultLang)
  const [catalogueRes] = createResource(lang, async lang => {
    return (await import(`./catalogues/${lang}.ts`)).default as Catalogue
  })

  createEffect(() => {
    document.documentElement.lang = lang()
  })
  return (
    <Show when={catalogueRes()}>
      {catalogue => (
        <I18nContext.Provider value={{ lang, catalogue }}>
          {p.children}
        </I18nContext.Provider>
      )}
    </Show>
  )
}

const useI18nContext = () => useContext(I18nContext)

/**
 * @example
 *    const t = useTrans()
 *    return <span>{t("download")}</span>
 */
export const useTrans = () => {
  const { catalogue } = useI18nContext()
  return (key: CatalogueKey) => catalogue[key]
}
