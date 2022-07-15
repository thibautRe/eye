/* @refresh reload */
import { render } from "solid-js/web"

import "./index.css"
import App from "./App"
import { initIdentity } from "./providers/Identity"

try {
  initIdentity()
} catch (err) {
  console.error(err)
}

const elt = document.getElementById("root")
if (!elt) throw new Error("Cannot find element #root to render app")

render(() => <App />, elt)
