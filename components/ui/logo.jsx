import Image from 'next/image'
import Link from 'next/link'

export function Logo({ className = "", linkTo = "/", width = 120, height = 40 }) {
  const LogoComponent = (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/eurotours.jpeg"
        alt="EuroTours"
        width={width}
        height={height}
        className="h-auto w-auto max-h-10 rounded"
        priority
      />
    </div>
  )

  if (linkTo) {
    return (
      <Link href={linkTo} className="flex items-center">
        {LogoComponent}
      </Link>
    )
  }

  return LogoComponent
}

// Alternative text-based logo for fallback
export function TextLogo({ className = "", linkTo = "/" }) {
  const TextComponent = (
    <h1 className={`text-2xl font-bold text-blue-600 ${className}`}>
      EuroTours
    </h1>
  )

  if (linkTo) {
    return (
      <Link href={linkTo}>
        {TextComponent}
      </Link>
    )
  }

  return TextComponent
} 