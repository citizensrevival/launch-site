import { Layout } from '../components/Layout'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { useTheme } from '../contexts/ThemeContext'

export default function VendorsPage() {
  const { colorTheme } = useTheme()

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          benefits: 'bg-emerald-50 dark:bg-emerald-900/20',
          pricing: 'bg-emerald-50 dark:bg-emerald-900/20',
          priceText: 'text-emerald-600'
        }
      case 'blue':
        return {
          benefits: 'bg-blue-50 dark:bg-blue-900/20',
          pricing: 'bg-blue-50 dark:bg-blue-900/20',
          priceText: 'text-blue-600'
        }
      case 'amber':
        return {
          benefits: 'bg-amber-50 dark:bg-amber-900/20',
          pricing: 'bg-amber-50 dark:bg-amber-900/20',
          priceText: 'text-amber-600'
        }
      case 'rose':
        return {
          benefits: 'bg-rose-50 dark:bg-rose-900/20',
          pricing: 'bg-rose-50 dark:bg-rose-900/20',
          priceText: 'text-rose-600'
        }
      default: // purple
        return {
          benefits: 'bg-purple-50 dark:bg-purple-900/20',
          pricing: 'bg-purple-50 dark:bg-purple-900/20',
          priceText: 'text-purple-600'
        }
    }
  }

  const themeColors = getThemeColors(colorTheme)

  return (
    <Layout>
      <div className="space-y-16">
        <div className="mb-8">
          <Button to="/" arrow={false}>
            ← Back to Home
          </Button>
        </div>
        <Section
          id="vendors"
          title="Vendors"
          date="Vendors"
        >
          <div className="max-w-4xl mx-auto">
            <p className="mb-6 text-lg">
              Join the heartbeat of Main Street and the vendor fair. Get a directory listing with map pin, highlight your menu or goods, and attract attendees with simple, scannable deals.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Food Vendors</h3>
                <ul className="space-y-2">
                  <li>Prime Main Street locations</li>
                  <li>Featured in app directory</li>
                  <li>Special promotion options</li>
                  <li>Access to power and water</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Craft & Retail</h3>
                <ul className="space-y-2">
                  <li>Vendor fair booth space</li>
                  <li>Digital catalog listing</li>
                  <li>QR code promotions</li>
                  <li>Customer engagement tools</li>
                </ul>
              </div>
            </div>
            
              <h3 className="text-xl font-semibold mb-4">Vendor Benefits</h3>
            <div className={`${themeColors.benefits} p-6 rounded-lg mb-8`}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Digital Presence</h4>
                  <ul className="space-y-1 text-sm">
                    <li>App directory with map pin</li>
                    <li>Menu/product showcase</li>
                    <li>Special offer promotions</li>
                    <li>Customer reviews integration</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Event Access</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Friday: Main Street setup</li>
                    <li>Saturday: Riverside Park</li>
                    <li>Sunday: Community Center</li>
                    <li>Flexible participation options</li>
                  </ul>
                </div>
              </div>
            </div>
            
              <h3 className="text-xl font-semibold mb-4">Pricing</h3>
            <div className={`${themeColors.pricing} p-6 rounded-lg mb-8`}>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Single Day</h4>
                  <p className={`text-2xl font-bold ${themeColors.priceText}`}>$75</p>
                  <p className="text-sm">One day participation</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Weekend Pass</h4>
                  <p className={`text-2xl font-bold ${themeColors.priceText}`}>$150</p>
                  <p className="text-sm">All three days</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Premium</h4>
                  <p className={`text-2xl font-bold ${themeColors.priceText}`}>$200</p>
                  <p className="text-sm">Best locations + extras</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button type="submit" arrow>
                Get Involved
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </Layout>
  )
}
