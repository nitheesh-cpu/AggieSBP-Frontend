import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import ThirdParty, { Google } from "supertokens-auth-react/recipe/thirdparty";
import Session from "supertokens-auth-react/recipe/session";
import { SuperTokensConfig } from "supertokens-auth-react/lib/build/types";

const apiDomain =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000";

const websiteDomain =
  process.env.NEXT_PUBLIC_BASE_URL?.trim() || "http://localhost:3000";

export const frontendConfig: () => SuperTokensConfig = () => {
  return {
    appInfo: {
      appName: "AggieSB+",
      apiDomain,
      websiteDomain,
      apiBasePath: "/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      EmailPassword.init(),
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [Google.init()],
        },
      }),
      Session.init(),
    ],
  };
};
