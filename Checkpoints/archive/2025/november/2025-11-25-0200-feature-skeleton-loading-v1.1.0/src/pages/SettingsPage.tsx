/**
 * Settings Page
 *
 * Centralized settings page with tabs for:
 * - Data OPD
 * - Jenis Retribusi
 * - OPD-Pelayanan
 * - Konfigurasi Umum
 *
 * Last Updated: 2025-11-15
 */

import { Building2, DollarSign, Link2, Settings as SettingsIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import GeneralSettings from '../components/GeneralSettings'
import JenisRetribusiListPage from './JenisRetribusiListPage'
import OPDListPage from './OPDListPage'
import OPDPelayananListPage from './OPDPelayananListPage'

type TabType = 'opd' | 'jenis-retribusi' | 'opd-pelayanan' | 'general'

interface Tab {
  id: TabType
  label: string
  icon: React.ReactNode
  description: string
}

const tabs: Tab[] = [
  {
    id: 'opd',
    label: 'Data OPD',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Kelola data Organisasi Perangkat Daerah',
  },
  {
    id: 'jenis-retribusi',
    label: 'Jenis Retribusi',
    icon: <DollarSign className="h-5 w-5" />,
    description: 'Kelola jenis-jenis retribusi daerah',
  },
  {
    id: 'opd-pelayanan',
    label: 'OPD-Pelayanan',
    icon: <Link2 className="h-5 w-5" />,
    description: 'Konfigurasi hubungan OPD dengan jenis retribusi',
  },
  {
    id: 'general',
    label: 'Konfigurasi Umum',
    icon: <SettingsIcon className="h-5 w-5" />,
    description: 'Pengaturan umum aplikasi',
  },
]

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('opd')

  // Sync tab with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'opd':
        return <OPDListPage />
      case 'jenis-retribusi':
        return <JenisRetribusiListPage />
      case 'opd-pelayanan':
        return <OPDPelayananListPage />
      case 'general':
        return <GeneralSettings />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 lg:px-6 py-3 lg:py-4">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-xs lg:text-sm text-gray-600">
            Kelola konfigurasi dan data master sistem
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="px-4 lg:px-6">
          <nav
            className="-mb-px flex space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide"
            aria-label="Tabs"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    group inline-flex items-center gap-1.5 lg:gap-2 whitespace-nowrap border-b-2 px-1 py-3 lg:py-4 text-xs lg:text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className={`text-base lg:text-lg
                      ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  >
                    {tab.icon}
                  </span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50">{renderTabContent()}</div>
    </div>
  )
}
