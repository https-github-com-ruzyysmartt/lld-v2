// @flow

import React from "react";
import { connect } from "react-redux";
import Transport from "@ledgerhq/hw-transport";
import { NotEnoughBalance } from "@ledgerhq/errors";
import { log } from "@ledgerhq/logs";
import { checkLibs } from "@ledgerhq/live-common/lib/sanityChecks";
import { remote, webFrame } from "electron";
import { render } from "react-dom";
import moment from "moment";

import "~/renderer/styles/global";
import "~/renderer/live-common-setup";
import "~/renderer/experimental";
import "~/renderer/i18n/init";

import logger from "~/logger";
import LoggerTransport from "~/logger/logger-transport-renderer";
import { DEBUG_TICK_REDUX } from "~/config/constants";
import { enableGlobalTab, disableGlobalTab, isGlobalTabEnabled } from "~/config/global-tab";
import sentry from "~/sentry/browser";
import resolveUserDataDirectory from "~/helpers/resolveUserDataDirectory";
import db from "~/helpers/db";
import { setEnvOnAllThreads } from "~/helpers/env";
import { command } from "~/renderer/commands";
import Countervalues from "~/renderer/countervalues";
import dbMiddleware from "~/renderer/middlewares/db";
import createStore from "~/renderer/createStore";
import events from "~/renderer/events";
import { fetchAccounts } from "~/renderer/actions/accounts";
import { fetchSettings } from "~/renderer/actions/settings";
import { lock } from "~/renderer/actions/application";

import {
  languageSelector,
  sentryLogsSelector,
  hideEmptyTokenAccountsSelector,
} from "~/renderer/reducers/settings";
import { decodeAccountsModel, encodeAccountsModel } from "~/renderer/reducers/accounts";

import ReactRoot from "~/renderer/ReactRoot";
import AppError from "~/renderer/AppError";

logger.add(new LoggerTransport());

const rootNode = document.getElementById("react-root");
const userDataDirectory = resolveUserDataDirectory();

const TAB_KEY = 9;

db.init(userDataDirectory);

async function init() {
  checkLibs({
    NotEnoughBalance,
    React,
    log,
    Transport,
    connect,
  });

  db.init(userDataDirectory);
  db.registerTransform("app", "accounts", {
    get: decodeAccountsModel,
    set: encodeAccountsModel,
  });
  const store = createStore({ dbMiddleware });

  const settings = await db.getKey("app", "settings");
  store.dispatch(fetchSettings(settings));

  const countervaluesData = await db.getKey("app", "countervalues");
  if (countervaluesData) {
    store.dispatch(Countervalues.importAction(countervaluesData));
  }

  const state = store.getState();
  const language = languageSelector(state);
  moment.locale(language);

  const hideEmptyTokenAccounts = hideEmptyTokenAccountsSelector(state);
  setEnvOnAllThreads("HIDE_EMPTY_TOKEN_ACCOUNTS", hideEmptyTokenAccounts);

  // TODO: DON'T FORGET SENTRY
  sentry(() => sentryLogsSelector(store.getState()));

  const isMainWindow = remote.getCurrentWindow().name === "MainWindow";

  const isAccountsDecrypted = await db.hasBeenDecrypted("app", "accounts");
  if (!isAccountsDecrypted) {
    store.dispatch(lock());
  } else {
    await store.dispatch(fetchAccounts());
  }

  if (DEBUG_TICK_REDUX) {
    setInterval(() => store.dispatch({ type: "DEBUG_TICK" }), DEBUG_TICK_REDUX);
  }

  r(<ReactRoot store={store} language={language} />);

  if (isMainWindow) {
    webFrame.setVisualZoomLevelLimits(1, 1);

    events({ store });

    const libcoreVersion = await command("libcoreGetVersion")().toPromise();
    logger.log("libcore", libcoreVersion);

    window.addEventListener("keydown", (e: SyntheticKeyboardEvent<any>) => {
      if (e.which === TAB_KEY) {
        if (!isGlobalTabEnabled()) enableGlobalTab();
        logger.onTabKey(document.activeElement);
      }
    });

    window.addEventListener("click", () => {
      if (isGlobalTabEnabled()) disableGlobalTab();
    });
  }

  document.addEventListener(
    "dragover",
    (event: Event) => {
      event.preventDefault();
      return false;
    },
    false,
  );

  document.addEventListener(
    "drop",
    (event: Event) => {
      event.preventDefault();
      return false;
    },
    false,
  );

  if (document.body) {
    const classes = document.body.classList;
    let timer = 0;
    window.addEventListener("resize", () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      } else classes.add("stop-all-transition");

      timer = setTimeout(() => {
        classes.remove("stop-all-transition");
        timer = null;
      }, 500);
    });
  }

  // expose stuff in Windows for DEBUG purpose
  window.ledger = {
    store,
    db,
  };
}

function r(Comp) {
  if (rootNode) {
    render(Comp, rootNode);
  }
}

init()
  .catch(e => {
    logger.critical(e);
    r(<AppError error={e} language="en" />);
  })
  .catch(error => {
    const pre = document.createElement("pre");
    pre.innerHTML = `Ledger Live crashed. Please contact Ledger support.
  ${String(error)}
  ${String((error && error.stack) || "no stacktrace")}`;
    if (document.body) {
      document.body.style.padding = "50px";
      document.body.innerHTML = "";
      document.body.appendChild(pre);
    }
  });
