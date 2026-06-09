/* eslint-disable @typescript-eslint/no-explicit-any */
import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import config from '@payload-config'

export const GET = REST_GET(config as any)
export const POST = REST_POST(config as any)
export const DELETE = REST_DELETE(config as any)
export const PATCH = REST_PATCH(config as any)
