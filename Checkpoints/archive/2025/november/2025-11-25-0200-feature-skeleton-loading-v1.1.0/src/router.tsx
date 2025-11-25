/**
 * Router Configuration - React Router v7
 *
 * Changes:
 * - React Router v7 data router setup
 * - Route definitions with loaders and actions
 * - Error boundaries per route
 */

import { createBrowserRouter } from 'react-router-dom'
// Import loaders and actions
import { loginAction } from './actions/auth'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { dashboardHomeLoader } from './loaders/dashboard'
import DashboardHomePage from './pages/DashboardHomePage'
import ErrorPage from './pages/ErrorPage'
import HelpPage from './pages/HelpPage'
import HomePage from './pages/HomePage'
import JenisRetribusiFormPage from './pages/JenisRetribusiFormPage'
import LaporanRetribusiFormPage from './pages/LaporanRetribusiFormPageNew'
import LaporanRetribusiListPage from './pages/LaporanRetribusiListPage'
import LoginPage from './pages/LoginPage'
import OPDFormPage from './pages/OPDFormPage'
import OPDPelayananFormPage from './pages/OPDPelayananFormPage'
import ProfilePage from './pages/ProfilePage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    action: loginAction,
    errorElement: <ErrorPage />,
  },

  // Protected Routes - Dashboard
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardHomePage />,
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requireAdmin>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requireAdmin>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requireAdmin>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'help',
        element: <HelpPage />,
      },
      // Laporan Retribusi
      {
        path: 'laporan-retribusi',
        element: <LaporanRetribusiListPage />,
      },
      {
        path: 'laporan-retribusi/create',
        element: <LaporanRetribusiFormPage />,
      },
      {
        path: 'laporan-retribusi/edit/:id',
        element: <LaporanRetribusiFormPage />,
      },
      // OPD Management
      {
        path: 'settings/opd/create',
        element: <OPDFormPage />,
      },
      {
        path: 'settings/opd/edit/:kode',
        element: <OPDFormPage />,
      },
      // Jenis Retribusi Management
      {
        path: 'settings/jenis-retribusi/create',
        element: <JenisRetribusiFormPage />,
      },
      {
        path: 'settings/jenis-retribusi/edit/:kode',
        element: <JenisRetribusiFormPage />,
      },
      // OPD-Pelayanan Management
      {
        path: 'settings/opd-pelayanan/create',
        element: <OPDPelayananFormPage />,
      },
    ],
  },

  // 404 Catch-all
  {
    path: '*',
    element: <ErrorPage />,
  },
])
