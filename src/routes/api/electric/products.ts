import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from '@electric-sql/client'
import { createFileRoute } from '@tanstack/react-router'

const protocolParams = new Set<string>(ELECTRIC_PROTOCOL_QUERY_PARAMS)

async function serveProductsShape(request: Request) {
  const requestUrl = new URL(request.url)
  const electricUrl = new URL(
    '/v1/shape',
    process.env.ELECTRIC_URL ?? 'http://localhost:30000',
  )

  for (const [key, value] of requestUrl.searchParams) {
    if (protocolParams.has(key)) {
      electricUrl.searchParams.set(key, value)
    }
  }

  electricUrl.searchParams.set('table', 'products')

  if (process.env.ELECTRIC_SOURCE_ID) {
    electricUrl.searchParams.set('source_id', process.env.ELECTRIC_SOURCE_ID)
  }

  if (process.env.ELECTRIC_SECRET) {
    electricUrl.searchParams.set('secret', process.env.ELECTRIC_SECRET)
  }

  const response = await fetch(electricUrl)
  const headers = new Headers(response.headers)

  headers.delete('content-encoding')
  headers.delete('content-length')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export const Route = createFileRoute('/api/electric/products')({
  server: {
    handlers: {
      GET: ({ request }) => serveProductsShape(request),
    },
  },
})
