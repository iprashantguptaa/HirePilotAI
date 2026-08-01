// ============================================================================
// HirePilot AI - useBrand Hook
// ============================================================================
// React hook for consuming brand configuration throughout the application
// ============================================================================

import { useMemo } from 'react'
import BRAND, { 
  getPageTitle, 
  getPageMeta, 
  getOpenGraphTags, 
  getTwitterTags,
  getStructuredData 
} from '../config/brand'

/**
 * Custom hook for accessing brand configuration
 * @returns {Object} Brand configuration and utility functions
 */
export const useBrand = () => {
  return useMemo(() => ({
    // Direct access to brand config
    ...BRAND,
    
    // Utility functions
    getPageTitle,
    getPageMeta,
    getOpenGraphTags,
    getTwitterTags,
    getStructuredData,
    
    // Common shortcuts
    productName: BRAND.product.name,
    tagline: BRAND.product.tagline,
    description: BRAND.product.description,
    supportEmail: BRAND.contact.supportEmail,
    copyright: BRAND.legal.copyright,
    primaryColor: BRAND.theme.primary.hex,
    logo: BRAND.assets.logo,
    social: BRAND.social
  }), [])
}

export default useBrand
