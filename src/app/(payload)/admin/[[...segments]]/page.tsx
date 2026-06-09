import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../../importMap'
import config from '@payload-config'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generatePageMetadata({ config: config as any, params, searchParams })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Page = ({ params, searchParams }: Args) =>
  RootPage({ config: config as any, params, searchParams, importMap })

export default Page
