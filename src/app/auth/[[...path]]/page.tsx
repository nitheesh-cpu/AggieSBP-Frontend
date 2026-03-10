"use client";

import { useEffect, useState } from "react";
import { redirectToAuth } from "supertokens-auth-react";
import { canHandleRoute, getRoutingComponent } from "supertokens-auth-react/ui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { ErrorBoundary } from "react-error-boundary";

function AuthErrorFallback({ error, resetErrorBoundary }: any) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="max-w-md w-full border-2 border-red-500 rounded-lg p-6 bg-red-500/10">
                <h2 className="text-xl font-bold mb-4 text-red-500">Authentication Service Error</h2>
                <p className="text-sm text-gray-300 mb-4">
                    The frontend couldn't initialize the sign-in providers. This usually means the FastAPI backend is returning a 400 error because the Google ThirdParty provider is not fully configured in the backend SuperTokens recipe.
                </p>
                <div className="bg-black/50 p-2 rounded text-xs mb-6 overflow-x-auto text-red-300 font-mono">
                    {error.message}
                </div>
                <button
                    onClick={resetErrorBoundary}
                    className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    );
}

export default function Auth() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (canHandleRoute([EmailPasswordPreBuiltUI, ThirdPartyPreBuiltUI])) {
            setLoaded(true);
        } else {
            redirectToAuth();
        }
    }, []);

    if (loaded) {
        return (
            <ErrorBoundary FallbackComponent={AuthErrorFallback}>
                {getRoutingComponent([EmailPasswordPreBuiltUI, ThirdPartyPreBuiltUI])}
            </ErrorBoundary>
        );
    }

    return null;
}
