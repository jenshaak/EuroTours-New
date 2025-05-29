'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Database, RefreshCw, CheckCircle, AlertCircle, Globe } from 'lucide-react'

export default function AdminPage() {
  const t = useTranslations()
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitializingComplete, setIsInitializingComplete] = useState(false)
  const [initResult, setInitResult] = useState(null)
  const [completeInitResult, setCompleteInitResult] = useState(null)

  const initializeDatabase = async () => {
    setIsInitializing(true)
    setInitResult(null)

    try {
      const response = await fetch('/api/admin/init-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      setInitResult(result)

    } catch (error) {
      setInitResult({
        success: false,
        error: t('common.error'),
        details: error.message
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const initializeCompleteDatabase = async () => {
    setIsInitializingComplete(true)
    setCompleteInitResult(null)

    try {
      const response = await fetch('/api/admin/init-complete-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      setCompleteInitResult(result)

    } catch (error) {
      setCompleteInitResult({
        success: false,
        error: t('common.error'),
        details: error.message
      })
    } finally {
      setIsInitializingComplete(false)
    }
  }

  const ResultDisplay = ({ result, title }) => {
    if (!result) return null
    
    return (
      <div className={`p-4 rounded-lg border ${
        result.success 
          ? 'bg-green-50 border-green-200 text-green-700' 
          : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {result.success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">
            {title}: {result.success ? t('admin.success') : t('admin.error')}
          </span>
        </div>
        
        <p className="text-sm">
          {result.message || result.error}
        </p>
        
        {result.details && (
          <p className="text-xs mt-1 opacity-75">
            {result.details}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header with Language Switcher */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('admin.title')}
            </h1>
            <p className="text-gray-600">
              {t('admin.description')}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6">
          {/* Database Initialization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                {t('admin.databaseInit')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Initialization */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">{t('admin.basicInit')}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {t('admin.basicInitDesc')}
                  </p>

                  <Button
                    onClick={initializeDatabase}
                    disabled={isInitializing || isInitializingComplete}
                    className="w-full sm:w-auto"
                  >
                    {isInitializing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {t('admin.initializing')}
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        {t('admin.initBasicDb')}
                      </>
                    )}
                  </Button>

                  <ResultDisplay result={initResult} title={t('admin.basicInit')} />
                </div>
              </div>

              {/* Complete Initialization */}
              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      {t('admin.completeInit')}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {t('admin.completeInitDesc')}
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-blue-800 text-sm">
                        <strong>{t('common.loading')}:</strong> {t('admin.completeInitDesc')}
                      </p>
                    </div>

                    <Button
                      onClick={initializeCompleteDatabase}
                      disabled={isInitializing || isInitializingComplete}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                      {isInitializingComplete ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t('admin.initializing')}
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-2" />
                          {t('admin.initCompleteDb')}
                        </>
                      )}
                    </Button>

                    <ResultDisplay result={completeInitResult} title={t('admin.completeInit')} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.systemInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">{t('admin.environment')}</div>
                  <div className="text-gray-600">
                    {process.env.NODE_ENV || 'development'}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Next.js Version</div>
                  <div className="text-gray-600">15.3.2</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">{t('admin.database')}</div>
                  <div className="text-gray-600">MongoDB</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">{t('admin.framework')}</div>
                  <div className="text-gray-600">React 19 + Tailwind CSS</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Collections Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dbCollections')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{t('admin.countries')}</div>
                  <div className="text-gray-600">34 European countries</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{t('admin.cities')}</div>
                  <div className="text-gray-600">Hundreds of European cities</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{t('admin.carriers')}</div>
                  <div className="text-gray-600">Bus companies</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{t('admin.routes')}</div>
                  <div className="text-gray-600">Bus routes (TTL: 1h)</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{t('admin.searches')}</div>
                  <div className="text-gray-600">Search history (TTL: 24h)</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{t('admin.orders')}</div>
                  <div className="text-gray-600">Customer bookings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  {t('admin.viewLogs')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('admin.checkHealth')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('admin.dbStats')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('admin.clearCache')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 