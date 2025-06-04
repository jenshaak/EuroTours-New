'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Globe, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/lib/contexts/LanguageContext'

// Flag component for better styling
function FlagIcon({ countryCode, className = "" }) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${countryCode}.png`}
      srcSet={`https://flagcdn.com/48x36/${countryCode}.png 2x`}
      alt={`${countryCode} flag`}
      className={`rounded-sm shadow-sm ${className}`}
      width="24"
      height="18"
    />
  )
}

export function LanguageDropdown() {
  const { currentLanguage, setCurrentLanguage, languages, t } = useLanguage()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Map language codes to country codes for flags
  const flagMap = {
    'en': 'us', // English -> US flag
    'cs': 'cz', // Czech -> Czech Republic flag
    'bg': 'bg', // Bulgarian -> Bulgaria flag
    'ru': 'ru'  // Russian -> Russia flag
  }

  const currentLanguageData = languages.find(lang => lang.code === currentLanguage)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200 ${
          showDropdown ? 'bg-gray-100 border-gray-200' : ''
        }`}
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <FlagIcon 
          countryCode={flagMap[currentLanguage]} 
          className="drop-shadow-sm hover:drop-shadow-md transition-all duration-200"
        />
        <span className="hidden sm:inline font-medium text-gray-700">
          {currentLanguageData?.name}
        </span>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
          showDropdown ? 'rotate-180' : ''
        }`} />
      </Button>
      
      {showDropdown && (
        <div className={`absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[200px] overflow-hidden backdrop-blur-sm transition-all duration-200 ${
          showDropdown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'
        }`}>
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">{t.selectLanguage}</span>
            </div>
          </div>

          {/* Language options */}
          <div className="py-2">
            {languages.map((language, index) => (
              <button
                key={language.code}
                onClick={() => {
                  setCurrentLanguage(language.code)
                  setShowDropdown(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-all duration-200 group ${
                  currentLanguage === language.code 
                    ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative">
                  <FlagIcon 
                    countryCode={flagMap[language.code]} 
                    className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200 group-hover:scale-110"
                  />
                  {currentLanguage === language.code && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white animate-pulse"></div>
                  )}
                </div>
                <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                  {language.name}
                </span>
                {currentLanguage === language.code && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 