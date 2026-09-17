import { useAuthenticationState } from "../features/authentication/useAuthenticationState";
import { useI18n } from "../lib/i18n/useI18n";

export const HomePage = () => {
  const { getResource } = useI18n();
  const { user } = useAuthenticationState();

  return (
    <section className="home-content">
      <p>{getResource("common.signedInAs")}</p>
      <h1>{user?.displayName ?? user?.email}</h1>
    </section>
  );
};
