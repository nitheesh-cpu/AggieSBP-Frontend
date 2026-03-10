import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import ThirdParty, { Google } from "supertokens-auth-react/recipe/thirdparty";
import Session from "supertokens-auth-react/recipe/session";
import { SuperTokensConfig } from "supertokens-auth-react/lib/build/types";

export const frontendConfig: () => SuperTokensConfig = () => {
    return {
        appInfo: {
            appName: "AggieSB+",
            apiDomain: "http://localhost:8000",
            websiteDomain: "http://localhost:3000",
            apiBasePath: "/auth",
            websiteBasePath: "/auth",
        },
        recipeList: [
            EmailPassword.init(),
            ThirdParty.init({
                signInAndUpFeature: {
                    providers: [
                        Google.init(),
                    ]
                }
            }),
            Session.init(),
        ],
    };
};
