/* @refresh reload */
import { initIdentity } from "./providers/Identity"
try {
  initIdentity()
} catch (err) {
  console.error(err)
}

import { render } from "solid-js/web"
import App from "./App"
import "./components/Styles/global.css"

const elt = document.getElementById("root")
if (!elt) throw new Error("Cannot find element #root to render app")

render(() => <App />, elt)
