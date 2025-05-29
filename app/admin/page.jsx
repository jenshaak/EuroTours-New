'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, RefreshCw, CheckCircle, AlertCircle, Globe } from 'lucide-react'

export default function AdminPage() {
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
        error: 'Network error',
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
        error: 'Network error',
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
            {title}: {result.success ? 'Success!' : 'Error'}
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            EuroTours Admin Panel
          </h1>
          <p className="text-gray-600">
            Database management and system administration
          </p>
        </div>

        <div className="grid gap-6">
          {/* Database Initialization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Initialization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Initialization */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Basic Initialization</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Initialize the database with sample countries, cities, and carriers.
                    This includes basic European cities for testing.
                  </p>

                  <Button
                    onClick={initializeDatabase}
                    disabled={isInitializing || isInitializingComplete}
                    className="w-full sm:w-auto"
                  >
                    {isInitializing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Initializing Basic DB...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Initialize Basic Database
                      </>
                    )}
                  </Button>

                  <ResultDisplay result={initResult} title="Basic Initialization" />
                </div>
              </div>

              {/* Complete Initialization */}
              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Complete European Database
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Initialize with ALL European cities across 34+ countries. This includes
                      hundreds of cities from UK, France, Germany, Italy, Spain, and more.
                      <span className="font-medium"> Recommended for production use.</span>
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Note:</strong> This will initialize hundreds of cities across Europe,
                        making them all available in the search dropdowns organized by country.
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
                          Initializing Complete DB...
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-2" />
                          Initialize Complete Database
                        </>
                      )}
                    </Button>

                    <ResultDisplay result={completeInitResult} title="Complete Initialization" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">Environment</div>
                  <div className="text-gray-600">
                    {process.env.NODE_ENV || 'development'}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Next.js Version</div>
                  <div className="text-gray-600">15.3.2</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Database</div>
                  <div className="text-gray-600">MongoDB</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Framework</div>
                  <div className="text-gray-600">React 19 + Tailwind CSS</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Collections Status */}
          <Card>
            <CardHeader>
              <CardTitle>Database Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">Countries</div>
                  <div className="text-gray-600">34 European countries</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">Cities</div>
                  <div className="text-gray-600">Hundreds of European cities</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">Carriers</div>
                  <div className="text-gray-600">Bus companies</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">Routes</div>
                  <div className="text-gray-600">Bus routes (TTL: 1h)</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">Searches</div>
                  <div className="text-gray-600">Search history (TTL: 24h)</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">Orders</div>
                  <div className="text-gray-600">Customer bookings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  View System Logs
                </Button>
                <Button variant="outline" size="sm">
                  Check API Health
                </Button>
                <Button variant="outline" size="sm">
                  Database Stats
                </Button>
                <Button variant="outline" size="sm">
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 