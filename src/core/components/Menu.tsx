import { Link } from 'react-router-dom'

export function Menu() {

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {/* Home Link */}
      <Link to="/" className="text-white hover:text-white/80 hover:underline">
        Home
      </Link>
      
      {/* Page Links */}
      <Link to="/sponsors" className="text-white hover:text-white/80 hover:underline text-sm">
        Sponsors
      </Link>
      <Link to="/vendors" className="text-white hover:text-white/80 hover:underline text-sm">
        Vendors
      </Link>
      <Link to="/volunteers" className="text-white hover:text-white/80 hover:underline text-sm">
        Volunteers
      </Link>
      <Link to="/brought-to-you-by" className="text-white hover:text-white/80 hover:underline text-sm">
        Supporters
      </Link>
    </div>
  )
}
