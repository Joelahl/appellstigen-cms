/* eslint-disable @typescript-eslint/no-explicit-any */
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({
    config: import('@payload-config') as any,
    params,
    searchParams,
  })

const Page = ({ params, searchParams }: Args) =>
  RootPage({
    config: import('@payload-config') as any,
    params,
    searchParams,
    importMap,
  })

export default Page
