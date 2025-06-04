'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowUpDown, Search, MapPin } from 'lucide-react'
import { CitySelect } from './CitySelect'
import { DatePicker } from './DatePicker'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export function SearchForm({ onSearch, initialValues = {} }) {
  const { t } = useLanguage()
  const [tripType, setTripType] = useState(initialValues.tripType || 'one-way')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fromCity: initialValues.fromCity || null,
      toCity: initialValues.toCity || null,
      departureDate: initialValues.departureDate || '',
      returnDate: initialValues.returnDate || '',
      tripType: initialValues.tripType || 'one-way'
    }
  })

  const watchedTripType = watch('tripType')
  const watchedFromCity = watch('fromCity')
  const watchedToCity = watch('toCity')

  useEffect(() => {
    setTripType(watchedTripType)
  }, [watchedTripType])

  const swapCities = () => {
    const fromCity = getValues('fromCity')
    const toCity = getValues('toCity')
    setValue('fromCity', toCity)
    setValue('toCity', fromCity)
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSearch(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg pt-0">
      <CardHeader className="bg-blue-600 text-white rounded-t-lg p-2 mt-0">
        <CardTitle className="text-2xl text-center font-bold">
          {t.findPerfectRoute}
        </CardTitle>
        <p className="text-center text-blue-100">
          {t.comparePrices}
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* From and To Cities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t.from}
              </label>
              <CitySelect
                name="fromCity"
                placeholder={t.selectDepartureCity}
                value={watchedFromCity}
                onValueChange={(value) => setValue('fromCity', value)}
                error={errors.fromCity?.message}
              />
            </div>

            <div className="flex justify-center md:justify-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={swapCities}
                className="rounded-full h-10 w-10 hover:bg-blue-50"
                title="Swap cities"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t.to}
              </label>
              <CitySelect
                name="toCity"
                placeholder={t.selectDestinationCity}
                value={watchedToCity}
                onValueChange={(value) => setValue('toCity', value)}
                error={errors.toCity?.message}
              />
            </div>
          </div>

          {/* Trip Type */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="return-trip"
                checked={tripType === 'return'}
                onCheckedChange={(checked) => {
                  const newTripType = checked ? 'return' : 'one-way'
                  setTripType(newTripType)
                  setValue('tripType', newTripType)
                }}
              />
              <label
                htmlFor="return-trip"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t.returnTicket}
              </label>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t.departureDate}
              </label>
              <DatePicker
                name="departureDate"
                placeholder={t.selectDate}
                value={watch('departureDate')}
                onValueChange={(value) => setValue('departureDate', value)}
                minDate={new Date()}
                error={errors.departureDate?.message}
              />
            </div>

            {tripType === 'return' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t.returnDate}
                </label>
                <DatePicker
                  name="returnDate"
                  placeholder={t.selectDate}
                  value={watch('returnDate')}
                  onValueChange={(value) => setValue('returnDate', value)}
                  minDate={watch('departureDate') ? new Date(watch('departureDate')) : new Date()}
                  error={errors.returnDate?.message}
                />
              </div>
            )}
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-4 rounded-lg shadow-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t.loading}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                {t.findTickets}
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 