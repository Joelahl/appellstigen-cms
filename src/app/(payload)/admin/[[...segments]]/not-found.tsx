/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundPage } from '@payloadcms/next/views'
import { importMap } from '../../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({
    config: import('@payload-config') as any,
    importMap,
    params,
    searchParams,
  })

export default NotFound
