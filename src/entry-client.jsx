import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Hydrate the SSR'd HTML. Falls back gracefully when no SSR markup is present
// (e.g. legacy static `index.html`), in which case React mounts fresh.
hydrateRoot(document.getElementById('root'), <App />)
