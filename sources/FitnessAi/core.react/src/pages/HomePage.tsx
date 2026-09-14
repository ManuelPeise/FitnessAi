import { useI18n } from "../lib/i18n/useI18n";

export function HomePage() {
  const { getResource } = useI18n();

  return (
    <main>
      <h1>{getResource("common.appName")}</h1>
    </main>
  );
}
