'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CitySelect({ 
  name, 
  placeholder, 
  value, 
  onValueChange, 
  error,
  className
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cities, setCities] = useState([])
  const [filteredCities, setFilteredCities] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Use provided placeholder or default
  const displayPlaceholder = placeholder || 'Search cities...'

  // Load cities on component mount
  useEffect(() => {
    loadCities()
  }, [])

  // Filter cities based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCities(cities.slice(0, 20)) // Show first 20 cities
    } else {
      const filtered = cities.filter(city => {
        const searchLower = searchQuery.toLowerCase()
        
        // Search in all language versions
        const nameMatches = Object.values(city.names || {}).some(name => 
          name && name.toLowerCase().includes(searchLower)
        )
        
        // Search in variations
        const variationMatches = city.variations?.some(variation =>
          variation.toLowerCase().includes(searchLower)
        )
        
        return nameMatches || variationMatches
      })
      
      setFilteredCities(filtered.slice(0, 10)) // Show max 10 results
    }
  }, [searchQuery, cities])

  const loadCities = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cities')
      if (response.ok) {
        const data = await response.json()
        setCities(data)
      }
    } catch (error) {
      console.error('Error loading cities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectCity = (city) => {
    onValueChange(city)
    setOpen(false)
    setSearchQuery('')
  }

  const getDisplayName = (city) => {
    if (!city) return displayPlaceholder
    // Default to English name, fallback to first available name
    return city.names?.en || city.names?.cs || city.names?.bg || Object.values(city.names || {})[0] || city.name
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-12 px-3",
              !value && "text-muted-foreground",
              error && "border-red-500"
            )}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">
                {value ? getDisplayName(value) : displayPlaceholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-3 border-b">
            <Input
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading...</span>
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                {searchQuery ? 'No cities found' : 'No cities found'}
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => selectCity(city)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100 transition-colors",
                      value?.id === city.id && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {getDisplayName(city)}
                      </div>
                      {/* Show alternative names if they exist */}
                      {city.variations && city.variations.length > 0 && (
                        <div className="text-xs text-gray-500 truncate">
                          {city.variations.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>
                    {value?.id === city.id && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  )
} 