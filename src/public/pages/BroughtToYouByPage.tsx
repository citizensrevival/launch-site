import { Layout } from '../../core/components/Layout'
import { Section } from '../../core/components/Section'
import { Button } from '../../core/components/Button'
import { useGetInvolvedDialog } from '../hooks/useGetInvolvedDialog'
import {
  featuredSupporters,
  healthcareChampions,
  facilitators,
  neighborhoodAllies,
  friendsOfTheEvent,
  type Supporter,
  type SupporterGroup,
} from '../data/supporters'

type TileSize = 'large' | 'medium' | 'small'

const tileStyles: Record<TileSize, { box: string; image: string; showName: boolean }> = {
  large: { box: 'h-44', image: 'max-h-24', showName: true },
  medium: { box: 'h-44', image: 'max-h-20', showName: true },
  small: { box: 'h-32', image: 'max-h-20', showName: false },
}

function LogoTile({
  supporter,
  size = 'small',
}: {
  supporter: Supporter
  size?: TileSize
}) {
  const styles = tileStyles[size]

  const tile = (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 ${styles.box}`}
    >
      <img
        src={supporter.logo}
        alt={supporter.name}
        loading="lazy"
        className={`w-auto object-contain ${styles.image}`}
      />
      {styles.showName && (
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

/** One tile for supporters who gave together, each logo linking out on its own. */
function GroupTile({ group }: { group: SupporterGroup }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {group.members.map((member) => (
          <a
            key={member.name}
            href={member.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={member.name}
            className="cursor-pointer no-underline transition-opacity hover:opacity-75"
          >
            <img
              src={member.logo}
              alt={member.name}
              loading="lazy"
              className="max-h-16 w-auto object-contain"
            />
          </a>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-700">
        {group.members.map((member, index) => (
          <span key={member.name} className="flex items-center gap-x-3">
            {index > 0 && (
              <span aria-hidden="true" className="text-gray-300">
                &middot;
              </span>
            )}
            {member.name}
          </span>
        ))}
      </div>
      <span className="mt-1 text-center text-xs font-normal text-gray-500">
        {group.role}
      </span>
    </div>
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
                <LogoTile key={supporter.name} supporter={supporter} size="large" />
              ))}
              <GroupTile group={healthcareChampions} />
            </div>

            <h3 className="mb-1 text-xl font-semibold">Facilitators</h3>
            <p className="mb-4 text-sm text-gray-600">
              The businesses and organizations our planning committee members come from,
              who help put the event together.
            </p>
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {facilitators.map((supporter) => (
                <LogoTile key={supporter.name} supporter={supporter} size="medium" />
              ))}
            </div>

            <h3 className="mb-4 text-xl font-semibold">Neighborhood Allies</h3>
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {neighborhoodAllies.map((supporter) => (
                <LogoTile key={supporter.name} supporter={supporter} size="medium" />
              ))}
            </div>

            <h3 className="mb-4 text-xl font-semibold">Friends of the Event</h3>
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {friendsOfTheEvent.map((supporter) => (
                <LogoTile key={supporter.name} supporter={supporter} size="small" />
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
