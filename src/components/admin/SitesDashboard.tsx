import React from 'react'
import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * SitesDashboard — a `beforeDashboard` admin panel listing every site with
 * quick stats (cards/pages) and links. Server component; queries via local API.
 */
const SitesDashboard = async () => {
  const payload = await getPayload({ config })

  const [sites, cardsCount] = await Promise.all([
    payload.find({ collection: 'sites', limit: 100, depth: 0, sort: 'name' }),
    payload.count({ collection: 'credit-cards' }),
  ])

  // Per-site page counts
  const siteStats = await Promise.all(
    sites.docs.map(async (site) => {
      const pages = await payload.count({
        collection: 'pages',
        where: { site: { equals: site.id } },
      })
      return { site, pages: pages.totalDocs }
    }),
  )

  const statusColor: Record<string, string> = {
    active: '#16a34a',
    draft: '#d97706',
    archived: '#6b7280',
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Sajter</h2>
        <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>
          {sites.totalDocs} sajt(er) · {cardsCount.totalDocs} kort totalt
        </span>
        <Link
          href="/admin/collections/sites/create"
          style={{ marginLeft: 'auto', fontSize: '0.85rem' }}
        >
          + Ny sajt
        </Link>
      </div>

      {sites.docs.length === 0 ? (
        <p style={{ opacity: 0.7 }}>Inga sajter ännu.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {siteStats.map(({ site, pages }) => (
            <Link
              key={site.id}
              href={`/admin/collections/sites/${site.id}`}
              style={{
                display: 'block',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: '8px',
                padding: '1rem',
                textDecoration: 'none',
                color: 'inherit',
                background: 'var(--theme-elevation-50)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ fontSize: '1.05rem' }}>{site.name}</strong>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: statusColor[site.status as string] || '#6b7280',
                    border: `1px solid ${statusColor[site.status as string] || '#6b7280'}`,
                    borderRadius: '999px',
                    padding: '1px 8px',
                  }}
                >
                  {String(site.status || '')}
                </span>
              </div>
              <div style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {site.domain}
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                <span>📄 {pages} sidor</span>
                <span style={{ opacity: 0.6 }}>{String(site.template || '')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default SitesDashboard
