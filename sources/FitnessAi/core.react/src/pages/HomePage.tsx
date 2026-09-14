import { useAuthenticationState } from "../features/authentication/useAuthenticationState";
import { useI18n } from "../lib/i18n/useI18n";

export const HomePage = () => {
  const { getResource } = useI18n();
  const { user, logout } = useAuthenticationState();

  return (
    <main className="home-page">
      <header className="app-header">
        <strong>{getResource("common.appName")}</strong>
        <button type="button" onClick={() => void logout()}>
          {getResource("common.auth.signOut")}
        </button>
      </header>
      <section className="home-content">
        <p>{getResource("common.auth.signedInAs")}</p>
        <h1>{user?.displayName ?? user?.email}</h1>
      </section>
    </main>
  );
};
