import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import ThirdParty, { Google } from "supertokens-auth-react/recipe/thirdparty";
import Session from "supertokens-auth-react/recipe/session";
import { SuperTokensConfig } from "supertokens-auth-react/lib/build/types";
import { track } from "@/lib/analytics";

/**
 * websiteDomain MUST match the URL the user actually sees (same origin).
 * NEXT_PUBLIC_BASE_URL is inlined at build time — Vercel previews get a
 * unique URL per deploy, so a single env var can't cover previews and the
 * fallback was localhost, which broke login redirects on preview/mobile.
 * Using window.location.origin at init time fixes production + every preview.
 */
function getWebsiteDomain(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.trim() || "http://localhost:3000"
  );
}

function getApiDomain(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000"
  );
}

export const frontendConfig: () => SuperTokensConfig = () => {
  return {
    appInfo: {
      appName: "AggieSB+",
      apiDomain: getApiDomain(),
      websiteDomain: getWebsiteDomain(),
      apiBasePath: "/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      EmailPassword.init({
        onHandleEvent: (context) => {
          if (context.action === "SUCCESS" && context.createdNewSession) {
            track("signin-complete", { method: "email", new_user: context.isNewRecipeUser });
          }
        },
      }),
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [Google.init()],
        },
        onHandleEvent: (context) => {
          if (context.action === "SUCCESS" && context.createdNewSession) {
            track("signin-complete", { method: "google", new_user: context.isNewRecipeUser });
          }
        },
      }),
      Session.init({ tokenTransferMethod: "header" }),
    ],
  };
};
