import { useState } from 'react'

const POSTER = '/video/revival-poster.jpg'
const SOURCE_1080 = '/video/revival-promo-1080.mp4'
const SOURCE_720 = '/video/revival-promo-720.mp4'

const CAPTION =
  'Aztec Citizens Revival — August 28, 29 & 30, 2026. Scavenger hunt, Jubilee Concert, and an interfaith service and pancake breakfast.'

/**
 * Autoplaying, muted, looping promo reel at the top of the home page.
 *
 * The `media` attribute on a <source> inside <video> is ignored by most browsers,
 * so the resolution is chosen here instead of being left to source selection.
 */
export function HeroVideo() {
  // Read once on mount: a mid-session viewport resize should not restart the video.
  const [prefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [source] = useState(() =>
    window.matchMedia('(max-width: 768px)').matches ? SOURCE_720 : SOURCE_1080,
  )

  return (
    <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
      <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
        <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto">
          <div className="relative overflow-hidden rounded-xl bg-gray-50">
            {prefersReducedMotion ? (
              <img
                src={POSTER}
                alt={CAPTION}
                width={1920}
                height={1080}
                className="h-auto w-full"
              />
            ) : (
              <video
                src={source}
                poster={POSTER}
                width={1920}
                height={1080}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={CAPTION}
                className="h-auto w-full"
              />
            )}
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset" />
          </div>
        </div>
      </div>
    </div>
  )
}
