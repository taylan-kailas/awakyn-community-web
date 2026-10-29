/**
 * Configure contexts and render App
 */
import "./sentry";

import { JSX, onMount } from "solid-js";
import { render } from "solid-js/web";

import { attachDevtoolsOverlay } from "@solid-devtools/overlay";
import { Navigate, Route, Router, useParams } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import "material-symbols";
import "mdui/mdui.css";
import { PublicBot } from "stoat.js";

import FlowDeleteAccount from "@revolt/auth/src/flows/FlowDelete";
import FlowHome from "@revolt/auth/src/flows/FlowHome";
import { ClientContext, SoundContext, useClient } from "@revolt/client";
import { DeviceContext } from "@revolt/common";
import { I18nProvider } from "@revolt/i18n";
import { InstanceContext } from "@revolt/instance";
import { KeybindContext } from "@revolt/keybinds";
import { ModalContext, ModalRenderer, useModals } from "@revolt/modal";
import { VoiceContext } from "@revolt/rtc";
import { StateContext, SyncWorker, useState } from "@revolt/state";
import {
  FloatingManager,
  LoadTheme,
  SnackbarController,
  SnackbarProvider,
} from "@revolt/ui";

/* @refresh reload */
import "@revolt/ui/styles";

import { AndroidNag } from "./AndroidNag";
import AuthPage from "./Auth";
import Interface from "./Interface";
import { JoinPage } from "./awakyn/join/JoinPage";
import "./index.css";
import { DevelopmentPage } from "./interface/Development";
import { Friends } from "./interface/Friends";
import { HomePage } from "./interface/Home";
import { ServerHome } from "./interface/ServerHome";
import { ChannelPage } from "./interface/channels/ChannelPage";
import "./serviceWorkerInterface";
import { keepLinksInsideBasePath } from "./awakyn/basePathLinks";
import { loadThemeFont } from "./awakyn/theme/loadThemeFont";
import { loadPressFeedback } from "./awakyn/theme/pressFeedback";
import { AWAKYN_THEME } from "./awakyn/theme/tokens";

attachDevtoolsOverlay();

/**
 * Redirect PWA start to the last active path
 */
function PWARedirect() {
  const state = useState();
  return <Navigate href={state.layout.getLastActivePath()} />;
}

/**
 * Open settings and redirect to last active path
 */
function SettingsRedirect() {
  const { openModal } = useModals();

  onMount(() => openModal({ type: "settings", config: "user" }));
  return <PWARedirect />;
}

/**
 * Open bot invite and redirect to last active path
 */
function BotRedirect() {
  const params = useParams();
  const client = useClient();
  const { openModal, showError } = useModals();

  onMount(() => {
    if (params.code) {
      client()
        // TODO: add a helper to stoat.js for this
        .api.get(`/bots/${params.code as ""}/invite`)
        .then((invite) => new PublicBot(client(), invite))
        .then((invite) => openModal({ type: "add_bot", invite }))
        .catch(showError);
    }
  });

  return <PWARedirect />;
}

function MountContext(props: { children?: JSX.Element }) {
  const client = new QueryClient();

  return (
    <StateContext>
      <KeybindContext>
        <ModalContext>
          <ClientContext>
            <LoadTheme />
            <SoundContext>
              <VoiceContext>
                <QueryClientProvider client={client}>
                  {props.children}
                  <ModalRenderer />
                  <FloatingManager />
                  <AndroidNag />
                </QueryClientProvider>
              </VoiceContext>
            </SoundContext>
            <SyncWorker />
          </ClientContext>
        </ModalContext>
      </KeybindContext>
    </StateContext>
  );
}

const routes = () => (
  <Route component={MountContext}>
    <Route path="/login" component={AuthPage as never}>
      <Route path="/delete/:token" component={FlowDeleteAccount} />
      {/* Awakyn: Google is the only way in; email and password pages go to sign-in */}
      <Route
        path={["/check", "/create/*", "/auth", "/resend", "/reset/*", "/verify/*"]}
        component={() => <Navigate href="/login" />}
      />
      <Route path="/*" component={FlowHome} />
    </Route>
    {/* Awakyn: invite links open the join screen, signed in or not */}
    <Route path="/invite" component={AuthPage as never}>
      <Route path="/:code" component={JoinPage} />
    </Route>
    <Route path="/" component={Interface as never}>
      <Route path="/pwa" component={PWARedirect} />
      <Route path="/dev" component={DevelopmentPage} />
      {/* Awakyn: one community only, so Discover goes home */}
      <Route path="/discover/*" component={() => <Navigate href="/app" />} />
      <Route path="/settings" component={SettingsRedirect} />
      <Route path="/bot/:code" component={BotRedirect} />
      <Route path="/friends" component={Friends} />
      <Route path="/server/:server/*">
        <Route path="/channel/:channel/*" component={ChannelPage} />
        <Route path="/*" component={ServerHome} />
      </Route>
      <Route path="/channel/:channel/*" component={ChannelPage} />
      <Route path="/*" component={HomePage} />
    </Route>
  </Route>
);

const snackbarCtrl = new SnackbarController();

// Keeps in-app addresses under the folder the app is served from (BASE_PATH at
// build time), so reloading or sharing a link opens the app again.
const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");
keepLinksInsideBasePath(routerBase);
loadThemeFont();
loadPressFeedback(AWAKYN_THEME);

render(
  () => (
    <DeviceContext>
      <I18nProvider>
        <SnackbarProvider controller={snackbarCtrl}>
          <Router base={routerBase}>
            <Route path="/i/:host" component={InstanceContext}>
              {routes()}
            </Route>
            <Route path="/" component={InstanceContext}>
              {routes()}
            </Route>
          </Router>
          {/* <ReportBug /> */}
        </SnackbarProvider>
      </I18nProvider>
    </DeviceContext>
  ),
  document.getElementById("root") as HTMLElement,
);
