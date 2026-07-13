import { Link } from 'react-router-dom'

import { Button } from './Button'
import { Logo } from './Logo'
import { Menu } from './Menu'
import { SignUpForm } from '../../public/components/SignUpForm'
import { useGetInvolvedDialog } from '../../public/hooks/useGetInvolvedDialog'
import { featuredSupporters, type Supporter } from '../../public/data/supporters'

/** A supporter without a `url` -- the fiscal sponsor has none -- renders unlinked. */
function SupporterTile({ supporter }: { supporter: Supporter }) {
  const tile = (
    <div className="flex h-20 items-center justify-center rounded-lg bg-white p-2">
      <img
        src={supporter.logo}
        alt={supporter.name}
        className="max-h-14 w-auto object-contain"
      />
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
      aria-label={supporter.name}
      className="cursor-pointer no-underline transition-opacity hover:opacity-75"
    >
      {tile}
    </a>
  )
}

export function Intro() {
  const { openDialog } = useGetInvolvedDialog()

  return (
    <>
      <h1 className="mb-2 flex items-center font-display text-4xl/tight font-medium text-white">
        <Logo className="inline-block h-10 w-auto" />{' '}
        <span className="pl-3">2026</span>
      </h1>
      <h1 className="font-display text-4xl/tight font-light text-white">
        Aztec Citizens Revival{' '}
        <span className="text-xl font-medium text-white">
          Celebrating Aztec's community spirit
        </span>
      </h1>
      <p className="mt-4 text-sm/6 text-gray-300">
        Three days of neighbors, music, and local flavor across Main Street,
        Riverside Park, and the Aztec Senior Community Center in Aztec, New
        Mexico. August 28th&ndash;30th, 2026. Free and open to everyone.
      </p>
      <SignUpForm />
      <div className="mt-8 flex flex-wrap justify-center gap-x-1 gap-y-3 sm:gap-x-2 lg:justify-start">
        <p className="mt-4 text-sm/6 text-gray-300">
          We are looking for volunteers, sponsors and vendors to help us make
          this event a success.
        </p>
        <Button type="button" arrow onClick={() => openDialog()}>
          Get Involved
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-center text-2xs/4 font-medium tracking-wide text-white/50 uppercase lg:text-left">
          Brought to You By
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {featuredSupporters.map((supporter) => (
            <SupporterTile key={supporter.name} supporter={supporter} />
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link
            to="/brought-to-you-by"
            className="cursor-pointer text-[0.8125rem]/6 text-gray-300 transition-colors hover:text-white"
          >
            See all our supporters <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>

      <div className="mt-12 flex justify-center lg:hidden">
        <Menu />
      </div>
    </>
  )
}

export function IntroFooter() {
  return (
    <div className="flex flex-col gap-2 text-[0.8125rem]/6 text-gray-500">
      <p className="flex items-baseline gap-x-2">
        &copy; 2025 Aztec Citizens Revival
      </p>
      <div className="flex gap-x-4">
        <a href="/privacy" className="transition-colors hover:text-gray-300">
          Privacy Policy
        </a>
        <a href="/terms" className="transition-colors hover:text-gray-300">
          Terms & Conditions
        </a>
      </div>
    </div>
  )
}
