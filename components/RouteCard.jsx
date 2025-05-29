'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Bus, MapPin, ArrowRight } from 'lucide-react'
import { formatTime, formatDuration, formatPrice, getTranslatedName } from '@/lib/utils/i18n'
import { cn } from '@/lib/utils'

export function RouteCard({ route, onSelect, fromCity, toCity, carrier, className }) {
  const departureTime = new Date(route.departureTime)
  const arrivalTime = new Date(route.arrivalTime)
  const duration = formatDuration(route.departureTime, route.arrivalTime)

  const fromCityName = getTranslatedName(fromCity?.names || {}, 'en')
  const toCityName = getTranslatedName(toCity?.names || {}, 'en')

  return (
    <Card className={cn("hover:shadow-lg transition-shadow duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Route Information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-3">
              {/* Departure */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(departureTime)}
                </div>
                <div className="text-sm text-gray-600 truncate max-w-[100px]">
                  {fromCityName}
                </div>
              </div>

              {/* Journey Details */}
              <div className="flex-1 text-center px-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span>{duration}</span>
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <div className="flex-1 h-px bg-gray-300 relative">
                    <ArrowRight className="w-4 h-4 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                </div>

                {/* Transfer indicator */}
                {!route.isDirect && (
                  <div className="text-xs text-orange-600 font-medium">
                    with transfer
                  </div>
                )}
                
                {route.isDirect && (
                  <div className="text-xs text-green-600 font-medium">
                    direct
                  </div>
                )}
              </div>

              {/* Arrival */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(arrivalTime)}
                </div>
                <div className="text-sm text-gray-600 truncate max-w-[100px]">
                  {toCityName}
                </div>
              </div>
            </div>

            {/* Carrier Information */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bus className="w-4 h-4" />
              <span className="font-medium">{carrier?.name || 'Unknown Carrier'}</span>
              {route.isExternal && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  External
                </span>
              )}
            </div>

            {/* Available Seats */}
            {route.availableSeats && (
              <div className="mt-2 text-xs text-gray-500">
                {route.availableSeats} seats available
              </div>
            )}
          </div>

          {/* Price and Action */}
          <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(route.price, route.currency)}
              </div>
              {route.maxPrice && route.maxPrice > route.price && (
                <div className="text-sm text-gray-500">
                  up to {formatPrice(route.maxPrice, route.currency)}
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => onSelect(route)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Select
            </Button>
          </div>
        </div>

        {/* Additional route details on mobile */}
        <div className="mt-4 pt-4 border-t border-gray-100 sm:hidden">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-gray-500">Departure</div>
              <div className="font-medium">{formatTime(departureTime)}</div>
            </div>
            <div>
              <div className="text-gray-500">Duration</div>
              <div className="font-medium">{duration}</div>
            </div>
            <div>
              <div className="text-gray-500">Arrival</div>
              <div className="font-medium">{formatTime(arrivalTime)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 