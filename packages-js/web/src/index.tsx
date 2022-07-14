/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';

const elt = document.getElementById('root')
if (!elt) throw new Error("Cannot find element #root to render app")

render(() => <App />, elt);
