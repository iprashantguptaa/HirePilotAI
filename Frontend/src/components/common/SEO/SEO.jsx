// ============================================================================
// HirePilot AI - SEO Component
// ============================================================================
// Component for managing page metadata, Open Graph tags, and structured data
// ============================================================================

import { useEffect } from 'react'
import { useBrand } from '../../../hooks/useBrand'

/**
 * SEO Component - Sets document title and meta tags
 * @param {Object} props
 * @param {string} [props.title] - Page title
 * @param {string} [props.description] - Page description
 * @param {string} [props.keywords] - Additional keywords
 * @param {string} [props.image] - Page image URL
 * @param {string} [props.url] - Canonical URL
 * @param {string} [props.type] - Open Graph type
 * @param {boolean} [props.noIndex] - Prevent search engine indexing
 * @param {Object} [props.structuredData] - Custom JSON-LD structured data
 */
export const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type,
  noIndex = false,
  structuredData
}) => {
  const brand = useBrand()

  useEffect(() => {
    // Set document title
    const pageTitle = title 
      ? brand.getPageTitle(title)
      : brand.seo.defaultTitle
    document.title = pageTitle

    // Set or update meta tags
    const setMetaTag = (name, content, isProperty = false) => {
      if (!content) return

      const attribute = isProperty ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attribute}="${name}"]`)
      
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, name)
        document.head.appendChild(meta)
      }
      
      meta.setAttribute('content', content)
    }

    // Basic meta tags
    setMetaTag('description', description || brand.seo.defaultDescription)
    setMetaTag('keywords', keywords 
      ? `${brand.seo.keywords.join(', ')}, ${keywords}`
      : brand.seo.keywords.join(', ')
    )
    setMetaTag('author', brand.seo.author)
    setMetaTag('theme-color', brand.seo.themeColor)

    // Robots meta tag
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow')
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]')
      if (robotsMeta) robotsMeta.remove()
    }

    // Open Graph tags
    const ogTags = brand.getOpenGraphTags({
      title: title || brand.openGraph.title,
      description: description || brand.openGraph.description,
      url: url || window.location.href,
      type: type || brand.openGraph.type,
      image: image ? { url: image } : undefined
    })

    Object.entries(ogTags).forEach(([property, content]) => {
      setMetaTag(property, content, true)
    })

    // Twitter Card tags
    const twitterTags = brand.getTwitterTags({
      title: title || brand.twitter.title,
      description: description || brand.twitter.description,
      image: image || brand.twitter.image
    })

    Object.entries(twitterTags).forEach(([name, content]) => {
      setMetaTag(name, content)
    })

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url || window.location.href)

    // Structured Data (JSON-LD)
    const jsonLdId = 'structured-data'
    let jsonLdScript = document.getElementById(jsonLdId)
    
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script')
      jsonLdScript.id = jsonLdId
      jsonLdScript.type = 'application/ld+json'
      document.head.appendChild(jsonLdScript)
    }

    const jsonLdData = structuredData || brand.getStructuredData()
    jsonLdScript.textContent = JSON.stringify(jsonLdData)

    // Cleanup function
    return () => {
      // We don't remove meta tags on unmount to avoid flickering
      // They'll be updated when a new SEO component mounts
    }
  }, [title, description, keywords, image, url, type, noIndex, structuredData, brand])

  // This component doesn't render anything
  return null
}

export default SEO
