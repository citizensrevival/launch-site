import { Link } from 'react-router-dom'

export function Menu() {

  return (
    <div className="hidden sm:block absolute top-3 left-4 z-50">
      <div className="flex items-center space-x-4">
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
      </div>
    </div>
  )
}
