import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getSettingByKey } from '../lib/api/settings'

export function DynamicFavicon() {
  const { data: logoKabupaten } = useQuery({
    queryKey: ['setting', 'logo_kabupaten'],
    queryFn: () => getSettingByKey('logo_kabupaten'),
  })

  useEffect(() => {
    const logoUrl = logoKabupaten?.data?.value || '/logo.png'
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = logoUrl
  }, [logoKabupaten])

  return null
}
