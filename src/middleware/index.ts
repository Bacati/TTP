import { sequence } from 'astro/middleware'

import logger from './logger'
import securityHeaders from './securityHeaders'

export const onRequest = sequence(logger, securityHeaders)
