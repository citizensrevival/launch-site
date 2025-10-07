import { Layout } from '../components/Layout'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { useTheme } from '../contexts/ThemeContext'
import { useSiteSettings } from '../lib/SiteSettingsManager'
import { useGetInvolvedDialog } from '../hooks/useGetInvolvedDialog'

export default function VendorsPage() {
  const theme = useTheme()
  const colorTheme = theme?.colorTheme || 'purple'
  const siteSettings = useSiteSettings()
  const { openDialog } = useGetInvolvedDialog()

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          benefits: 'bg-emerald-50',
          pricing: 'bg-emerald-50',
          priceText: 'text-emerald-600',
          border: 'border-emerald-200'
        }
      case 'blue':
        return {
          benefits: 'bg-blue-50',
          pricing: 'bg-blue-50',
          priceText: 'text-blue-600',
          border: 'border-blue-200'
        }
      case 'amber':
        return {
          benefits: 'bg-amber-50',
          pricing: 'bg-amber-50',
          priceText: 'text-amber-600',
          border: 'border-amber-200'
        }
      case 'rose':
        return {
          benefits: 'bg-rose-50',
          pricing: 'bg-rose-50',
          priceText: 'text-rose-600',
          border: 'border-rose-200'
        }
      default: // purple
        return {
          benefits: 'bg-purple-50',
          pricing: 'bg-purple-50',
          priceText: 'text-purple-600',
          border: 'border-purple-200'
        }
    }
  }

  const themeColors = getThemeColors(colorTheme)
  
  // Check if user has already submitted as a vendor
  const hasSubmittedAsVendor = siteSettings.getGetInvolvedSubmission('vendor')

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
              <div className="bg-gray-50  p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Food Vendors</h3>
                <ul className="space-y-2">
                  <li>Prime Main Street locations</li>
                  <li>Featured in app directory</li>
                  <li>Special promotion options</li>
                  <li>Access to power and water</li>
                </ul>
              </div>
              
              <div className="bg-gray-50  p-6 rounded-lg">
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
              {hasSubmittedAsVendor ? (
                <div className={`${themeColors.benefits} p-6 rounded-lg border ${themeColors.border}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${themeColors.priceText}`}>You're Already Involved!</h3>
                  <p className="text-sm mb-4">
                    Thank you for your interest in being a vendor at our community event. We've received your submission and will be in touch soon with vendor details and next steps.
                  </p>
                  <p className="text-sm text-gray-600 ">
                    Keep an eye on your email for updates about booth assignments, setup times, and event logistics. We're excited to have you join us!
                  </p>
                </div>
              ) : (
                <Button type="button" arrow onClick={() => openDialog('vendor')}>
                  Get Involved
                </Button>
              )}
            </div>
          </div>
        </Section>
      </div>
    </Layout>
  )
}
