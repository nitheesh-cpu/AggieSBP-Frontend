"use client";

import React, { useRef } from "react";
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { frontendConfig } from "@/config/frontend";

export const SupertokensProvider: React.FC<React.PropsWithChildren<{}>> = ({
    children,
}) => {
    // Only initialize SuperTokens once when the component mounts on the client
    const isInitialized = useRef(false);

    if (typeof window !== "undefined" && !isInitialized.current) {
        SuperTokens.init(frontendConfig());
        isInitialized.current = true;
    }

    return <SuperTokensWrapper>{children}</SuperTokensWrapper>;
};
