/**
 * Client Entry Point
 *
 * Changes:
 * - React client hydration
 * - Router initialization
 */

import { StartClient } from '@tanstack/start'
import { hydrateRoot } from 'react-dom/client'
import { createRouter } from './router'

const router = createRouter()

hydrateRoot(document, <StartClient router={router} />)
