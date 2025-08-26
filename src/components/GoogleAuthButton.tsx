"use client";

import React, { useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";

/* ================================
   Minimal Google Identity types
   ================================ */
type GsiSelectBy =
  | "auto"
  | "user"
  | "user_1tap"
  | "user_2tap"
  | "btn"
  | "btn_confirm"
  | "btn_add_session"
  | "silent"
  | "revocation";

interface GsiCredentialResponse {
  credential: string; 
  select_by: GsiSelectBy;
  clientId?: string; 
}

type GsiUxMode = "popup" | "redirect";

interface GsiIdConfiguration {
  client_id: string;
  callback: (response: GsiCredentialResponse) => void;
  ux_mode?: GsiUxMode;
  login_uri?: string;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
  context?: "signin" | "signup" | "use";
  state_cookie_domain?: string;
  allowed_parent_origins?: string | string[];
  itp_support?: boolean;
}

type GsiButtonType = "standard" | "icon";
type GsiButtonTheme = "outline" | "filled_blue" | "filled_black";
type GsiButtonSize = "large" | "medium" | "small";
type GsiButtonShape = "rectangular" | "pill" | "circle" | "square";
type GsiText = "signin_with" | "signup_with" | "continue_with" | "signin";
type GsiLogoAlignment = "left" | "center";

interface GsiRenderButtonOptions {
  type?: GsiButtonType;
  theme?: GsiButtonTheme;
  size?: GsiButtonSize;
  text?: GsiText;
  shape?: GsiButtonShape;
  logo_alignment?: GsiLogoAlignment;
  width?: number | string;
  locale?: string;
}

interface GsiPromptMomentNotification {
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
  getMomentType: () => string;
}

interface GoogleAccountsId {
  initialize: (config: GsiIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GsiRenderButtonOptions) => void;
  prompt: (listener?: (n: GsiPromptMomentNotification) => void) => void;
  revoke: (hint: string, done: () => void) => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

interface GoogleGlobal {
  accounts: GoogleAccounts;
}

declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}

/* ================================
   Component props and helpers
   ================================ */
export interface GoogleAuthButtonProps {
  redirectTo: string; 
  keepMeLogged?: boolean; 
  onMessage?: (msg: { ok?: string; err?: string }) => void;
  size?: GsiButtonSize;
  theme?: GsiButtonTheme;
}

interface AuthResponse {
  access: string;
  refresh?: string;
  username?: string;
  role?: string;
}

const getApiBase = (): string =>
  process.env.NEXT_PUBLIC_API_URL || "https://hazalkaynak.pythonanywhere.com/";

const getGoogleEndpoint = (): string =>
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENDPOINT ||
  `${getApiBase()}/auth/google/`;

const loadGoogleScript = (): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(s);
  });

/* ================================
   Component
   ================================ */
const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  redirectTo,
  keepMeLogged,
  onMessage,
  size = "large",
  theme = "outline",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const init = async (): Promise<void> => {
      try {
        await loadGoogleScript();
        if (cancelled) return;

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");

        const onGoogleCallback = async (
          response: GsiCredentialResponse
        ): Promise<void> => {
          try {
            const credential = response.credential;
            if (!credential) throw new Error("No Google credential received");

            const { data } = await axios.post<AuthResponse>(
              getGoogleEndpoint(),
              { credential }
            );


            localStorage.setItem("accessToken", data.access);
            if (data.refresh)
              localStorage.setItem("refreshToken", data.refresh);
            if (data.username) localStorage.setItem("username", data.username);
            if (data.role) localStorage.setItem("role", String(data.role));

            // honour Keep me logged in
            if (keepMeLogged === false) localStorage.removeItem("refreshToken");

            onMessage?.({ ok: "Logged in with Google." });
            window.location.href = `/${redirectTo}`;
          } catch (e: unknown) {
            const err = e as AxiosError<{ detail?: string }>;
            onMessage?.({
              err: err.response?.data?.detail || "Google sign-in failed.",
            });
          }
        };

        window.google?.accounts.id.initialize({
          client_id: clientId,
          ux_mode: "popup",
          callback: onGoogleCallback,
        });

        setReady(true);

        if (containerRef.current && window.google?.accounts.id) {
          window.google.accounts.id.renderButton(containerRef.current, {
            type: "standard",
            theme,
            size,
            shape: "pill",
            text: "signin_with",
            width: 340,
          });
        }
      } catch (e) {
        onMessage?.({
          err: e instanceof Error ? e.message : "Google init failed.",
        });
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [keepMeLogged, onMessage, redirectTo, size, theme]);

  return <div ref={containerRef} aria-disabled={!ready} />;
};

export default GoogleAuthButton;
