import { Layout } from '../components/Layout'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { useTheme } from '../contexts/ThemeContext'

export default function SponsorsPage() {
  const { colorTheme } = useTheme()
  
  // Get theme-specific colors
  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          text: 'text-emerald-600',
          border: 'border-emerald-200 dark:border-emerald-800'
        }
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-600',
          border: 'border-blue-200 dark:border-blue-800'
        }
      case 'amber':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          text: 'text-amber-600',
          border: 'border-amber-200 dark:border-amber-800'
        }
      case 'rose':
        return {
          bg: 'bg-rose-50 dark:bg-rose-900/20',
          text: 'text-rose-600',
          border: 'border-rose-200 dark:border-rose-800'
        }
      default: // purple
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          text: 'text-purple-600',
          border: 'border-purple-200 dark:border-purple-800'
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
          id="sponsors"
          title="Sponsors"
          date="Sponsors"
        >
          <div className="max-w-4xl mx-auto">
            <p className="mb-6 text-lg">
              Spotlight your brand where the community gathers. Flexible packages place your logo and messages in premium app and site locations and on the ground at key venues—plus options to promote offers that drive real foot traffic.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Digital Presence</h3>
                <ul className="space-y-2">
                  <li>Logo placement on website and app</li>
                  <li>Featured in event announcements</li>
                  <li>Social media recognition</li>
                  <li>Email newsletter inclusion</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">On-Ground Presence</h3>
                <ul className="space-y-2">
                  <li>Banner placement at key venues</li>
                  <li>Booth space at vendor fair</li>
                  <li>Recognition during announcements</li>
                  <li>Networking opportunities</li>
                </ul>
              </div>
            </div>
            
            <div className={`${themeColors.bg} p-6 rounded-lg mb-8`}>
              <h3 className="text-xl font-semibold mb-4">Sponsorship Packages</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Community</h4>
                  <p className={`text-2xl font-bold ${themeColors.text}`}>$500</p>
                  <p className="text-sm">Basic digital presence</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Main Street</h4>
                  <p className={`text-2xl font-bold ${themeColors.text}`}>$1,000</p>
                  <p className="text-sm">Enhanced visibility</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Headline</h4>
                  <p className={`text-2xl font-bold ${themeColors.text}`}>$2,500</p>
                  <p className="text-sm">Premium placement</p>
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
