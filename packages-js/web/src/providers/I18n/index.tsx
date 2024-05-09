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
type I18nLang = (typeof allLangs)[number]

const defaultLang: I18nLang =
  navigator.languages
    .map(l => l.split("-")[0].toLowerCase() as I18nLang)
    .find(l => allLangs.includes(l)) ?? "en"

interface I18nContext {
  readonly lang: Accessor<I18nLang>
  readonly catalogue: Accessor<Catalogue>
}

const I18nContext = createContext<I18nContext>({
  lang: () => defaultLang,
  catalogue: () => {
    throw new Error("No catalogue in dummy provider")
  },
})

export const [lang, setLang] = createSignal<I18nLang>(defaultLang)
export const I18nProvider: ParentComponent = p => {
  const [catalogueRes] = createResource<Catalogue, I18nLang>(
    lang,
    async lang => (await import(`./catalogues/${lang}.ts`)).default,
  )

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

/**
 * @example
 *    const t = useTrans()
 *    return <span>{t("download")}</span>
 */
export const useTrans = () => {
  const { catalogue } = useContext(I18nContext)
  return <T extends CatalogueKey>(key: T): Catalogue[T] => catalogue()[key]
}
