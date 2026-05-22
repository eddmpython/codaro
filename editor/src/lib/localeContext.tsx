import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import {
  type AppLocale,
  translateWithLocale,
} from "@/lib/localeCopy";

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: typeof translateWithLocale;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: Omit<LocaleContextValue, "t">;
}) {
  const contextValue: LocaleContextValue = {
    ...value,
    t: (locale, key, values) => translateWithLocale(locale, key, values),
  };
  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  const localize = (key: string, values?: Record<string, string | number | null | undefined>) =>
    translateWithLocale(context.locale, key, values);
  return {
    ...context,
    t: localize,
  };
}
