/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundPage } from '@payloadcms/next/views'
import { importMap } from '../../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

const configPromise = import('@payload-config').then((mod) => mod.default) as any

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({ config: configPromise, importMap, params, searchParams })

export default NotFound
