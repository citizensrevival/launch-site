import { Layout } from '../../core/components/Layout'
import { Section } from '../../core/components/Section'
import { Button } from '../../core/components/Button'
import { useGetInvolvedDialog } from '../hooks/useGetInvolvedDialog'
import { featuredSupporters, supporters, type Supporter } from '../data/supporters'

function LogoTile({
  supporter,
  featured = false,
}: {
  supporter: Supporter
  featured?: boolean
}) {
  const tile = (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 ${
        featured ? 'h-44' : 'h-32'
      }`}
    >
      <img
        src={supporter.logo}
        alt={supporter.name}
        loading="lazy"
        className={`w-auto object-contain ${featured ? 'max-h-24' : 'max-h-20'}`}
      />
      {featured && (
        <span className="mt-3 text-center text-xs font-semibold text-gray-700">
          {supporter.name}
          {supporter.role && (
            <span className="block font-normal text-gray-500">{supporter.role}</span>
          )}
        </span>
      )}
    </div>
  )

  if (!supporter.url) {
    return tile
  }

  return (
    <a
      href={supporter.url}
      target="_blank"
      rel="noreferrer noopener"
      className="cursor-pointer no-underline transition-opacity hover:opacity-75"
    >
      {tile}
    </a>
  )
}

export default function BroughtToYouByPage() {
  const { openDialog } = useGetInvolvedDialog()

  return (
    <Layout>
      <div className="space-y-16">
        <div className="mb-8">
          <Button to="/" arrow={false}>
            ← Back to Home
          </Button>
        </div>

        <Section id="brought-to-you-by" title="Brought to You By" date="Supporters">
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-lg">
              The Aztec Citizens Revival is a free community event, made possible by the
              local businesses and organizations who give their time, money, and goods to
              keep Aztec thriving. Please support the people who support us.
            </p>

            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {featuredSupporters.map((supporter) => (
                <LogoTile key={supporter.name} supporter={supporter} featured />
              ))}
            </div>

            <h3 className="mb-4 text-xl font-semibold">Our Local Supporters</h3>
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {supporters.map((supporter) => (
                <LogoTile key={supporter.name} supporter={supporter} />
              ))}
            </div>

            <div className="text-center">
              <p className="mb-6">Want to see your business on this page?</p>
              <Button type="button" arrow onClick={() => openDialog('sponsor')}>
                Become a Sponsor
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </Layout>
  )
}
