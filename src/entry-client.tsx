// @refresh reload
import { mount, StartClient } from '@solidjs/start/client';
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import App from './app';
import AppTicker from './app_ticker';
const wrapper = document.getElementById("app");

if (!wrapper) {
  throw new Error("Wrapper div not found");
}
render( () => (
        <Router>
            <Route path="/" component={() => <h1>Hello World!</h1>} />
            <Route path="/local_chat" component={App} />
            <Route path="/ticker" component={AppTicker} />
        </Router>
    ), wrapper)

//mount(() => <StartClient />, wrapper!);
