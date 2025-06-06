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
        error: 'An error occurred',
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
        error: 'An error occurred',
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
            {title}: {result.success ? 'Success' : 'Error'}
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
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            EuroTours Admin Panel
          </h1>
          <p className="text-gray-600">
            Database administration and system management
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
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
                    Initialize basic database structure with essential data
                  </p>

                  <Button
                    onClick={initializeDatabase}
                    disabled={isInitializing || isInitializingComplete}
                    className="w-full sm:w-auto"
                  >
                    {isInitializing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Initializing...
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
                      Complete Initialization
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Initialize complete database with full European city data and sample routes
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Note:</strong> This will initialize the complete database with comprehensive European city data and sample bus routes.
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
                          Initializing...
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

          {/* Database Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Database Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Cities</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Routes</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Searches</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 