import { Button } from './Button'
import { Logo } from './Logo'
import { SignUpForm } from './SignUpForm'
import { useGetInvolvedDialog } from '../hooks/useGetInvolvedDialog'

export function Intro() {
  const { openDialog } = useGetInvolvedDialog();

  return (
    <>
      <h1 className="font-display text-4xl/tight font-medium text-white mb-2 flex items-center">
        <Logo className="inline-block h-10 w-auto" /> <span className="pl-3">2026</span>
      </h1>
      <h1 className="font-display text-4xl/tight font-light text-white">
        Aztec Citizens Revival{' '}
        <span className="text-xl text-white font-medium">Celebrating Aztec's community spirit</span>
      </h1>
      <p className="mt-4 text-sm/6 text-gray-300">
        Three days of neighbors, music, and local flavor across Main Street,
        Riverside Park, and the Community Center in Aztec, New Mexico.
      </p>
      <SignUpForm />
      <div className="mt-8 flex flex-wrap justify-center gap-x-1 gap-y-3 sm:gap-x-2 lg:justify-start">
        <p className="mt-4 text-sm/6 text-gray-300">
          We are looking for volunteers, sponsors and vendors to help us make this event a success.
        </p>
        <Button type="button" arrow onClick={() => openDialog()}>
          Get Involved
        </Button>
      </div>
    </>
  )
}

export function IntroFooter() {
  return (
    <p className="flex items-baseline gap-x-2 text-[0.8125rem]/6 text-gray-500">
      &copy; 2025 Aztec Citizens Revival
    </p>
  )
}
