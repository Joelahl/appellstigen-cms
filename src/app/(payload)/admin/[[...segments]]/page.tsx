/* eslint-disable @typescript-eslint/no-explicit-any */
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

const configPromise = import('@payload-config').then((mod) => mod.default) as any

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: configPromise, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config: configPromise, params, searchParams, importMap })

export default Page
