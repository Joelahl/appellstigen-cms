import { NotFoundPage } from '@payloadcms/next/views'
import { importMap } from '../importMap'
import config from '@payload-config'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({ config: config as any, importMap, params, searchParams })

export default NotFound
