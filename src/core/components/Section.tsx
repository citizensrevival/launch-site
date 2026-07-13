import { ReactNode } from 'react'

interface SectionProps {
  id: string
  title: string
  date?: string
  image?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  children?: ReactNode
}

export function Section({ id, title, date, image, children }: SectionProps) {
  return (
    <article id={id} className="scroll-mt-16">
      <header className="relative mb-10 xl:mb-0">
        <div className="pointer-events-none absolute top-0 left-[max(-0.5rem,calc(50%-18.625rem))] z-50 flex h-4 items-center justify-end gap-x-2 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:left-0 lg:min-w-lg xl:h-8">
          <a href={`#${id}`} className="inline-flex">
            <time className="hidden xl:pointer-events-auto xl:block xl:text-2xs/4 xl:font-medium xl:text-white/50">
              {date || title}
            </time>
          </a>
          <div className="h-0.25 w-3.5 bg-gray-400 lg:-mr-3.5 xl:mr-0 xl:bg-gray-300" />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
          <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
            <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto">
              <div className="flex">
                <a href={`#${id}`} className="inline-flex">
                  <time className="text-2xs/4 font-medium text-gray-500 xl:hidden">
                    {date || title}
                  </time>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
        <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
          <div className="mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto typography">
            {image && (
              <div className="relative overflow-hidden rounded-xl bg-gray-50 mb-8">
                <img
                  src={image.src}
                  alt={image.alt}
                  width={image.width || 800}
                  height={image.height || 600}
                  className="w-full h-auto"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset" />
              </div>
            )}
            
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            
            {children}
          </div>
        </div>
      </div>
    </article>
  )
}
