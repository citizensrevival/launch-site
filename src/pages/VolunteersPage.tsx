import { Layout } from '../components/Layout'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { useTheme } from '../contexts/ThemeContext'
import { useSiteSettings } from '../lib/SiteSettingsManager'
import { useGetInvolvedDialog } from '../hooks/useGetInvolvedDialog'

export default function VolunteersPage() {
  const theme = useTheme()
  const colorTheme = theme?.colorTheme || 'purple'
  const siteSettings = useSiteSettings()
  const { openDialog } = useGetInvolvedDialog()

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          shifts: 'bg-emerald-50 dark:bg-emerald-900/20',
          mission: 'bg-emerald-50 dark:bg-emerald-900/20',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-600'
        }
      case 'blue':
        return {
          shifts: 'bg-blue-50 dark:bg-blue-900/20',
          mission: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-600'
        }
      case 'amber':
        return {
          shifts: 'bg-amber-50 dark:bg-amber-900/20',
          mission: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-600'
        }
      case 'rose':
        return {
          shifts: 'bg-rose-50 dark:bg-rose-900/20',
          mission: 'bg-rose-50 dark:bg-rose-900/20',
          border: 'border-rose-200 dark:border-rose-800',
          text: 'text-rose-600'
        }
      default: // purple
        return {
          shifts: 'bg-purple-50 dark:bg-purple-900/20',
          mission: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-600'
        }
    }
  }

  const themeColors = getThemeColors(colorTheme)
  
  // Check if user has already submitted as a volunteer
  const hasSubmittedAsVolunteer = siteSettings.getGetInvolvedSubmission('volunteer')

  return (
    <Layout>
      <div className="space-y-16">
        <div className="mb-8">
          <Button to="/" arrow={false}>
            ← Back to Home
          </Button>
        </div>
        <Section
          id="volunteers"
          title="Volunteers"
          date="Volunteers"
        >
          <div className="max-w-4xl mx-auto">
            <p className="mb-6 text-lg">
              Join us in celebrating Aztec's community spirit! Help us revive and strengthen the bonds that make our town strong. From supporting the Main Street scavenger hunt to assisting with the Jubilee concert and interfaith service, we'll match you with roles that connect you with neighbors and visitors alike.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Community Connection</h3>
                <ul className="space-y-2">
                  <li>Scavenger hunt support and guidance</li>
                  <li>Welcome and information assistance</li>
                  <li>Local business and vendor coordination</li>
                  <li>Community engagement activities</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Event Support</h3>
                <ul className="space-y-2">
                  <li>Concert setup and management</li>
                  <li>Interfaith service coordination</li>
                  <li>Pancake breakfast assistance</li>
                  <li>Family fun day activities</li>
                </ul>
              </div>
            </div>
            
              <h3 className="text-xl font-semibold mb-4">Volunteer Shifts</h3>
            <div className={`${themeColors.shifts} p-6 rounded-lg mb-8`}>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold text-lg text-center">Friday</h4>
                  <p className="text-sm mb-2 text-center font-semibold">Main Street</p>
                  <ul className="text-xs text-center space-y-2 list-none m-0 p-0">
                    <li className="">Scavenger Hunt Support</li>
                    <li className="">Food Truck Coordination</li>
                    <li className="">Street Entertainment Setup</li>
                    <li className="">Vendor Fair Assistance</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg text-center">Saturday</h4>
                  <p className="text-sm mb-2 text-center font-semibold">Riverside Park</p>
                  <ul className="text-xs text-center space-y-2 list-none m-0 p-0">
                    <li className="">Concert Setup & Support</li>
                    <li className="">Artist Coordination</li>
                    <li className="">Crowd Management</li>
                    <li className="">Four Corners Welcome</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg text-center">Sunday</h4>
                  <p className="text-sm mb-2 text-center font-semibold">Community Center</p>
                  <ul className="text-xs text-center space-y-2 list-none mx-auto m-0 p-0">
                    <li className="">Interfaith Service Support</li>
                    <li className="">Pancake Breakfast Setup</li>
                    <li className="">Family Fun Day Activities</li>
                    <li className="">Community Connection</li>
                  </ul>
                </div>
              </div>
            </div>
            
              <h3 className="text-xl font-semibold mb-4">Join Our Mission</h3>
            <div className={`${themeColors.mission} p-6 rounded-lg mb-8`}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Community Impact</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Strengthen Aztec's community bonds</li>
                    <li>Support local businesses and organizations</li>
                    <li>Celebrate our town's resilience together</li>
                    <li>Connect with neighbors and visitors</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Personal Growth</h4>
                  <ul className="space-y-1 text-sm">
                    <li>Build lasting community connections</li>
                    <li>Gain event coordination experience</li>
                    <li>Participate in interfaith dialogue</li>
                    <li>Help envision Aztec's brighter future</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              {hasSubmittedAsVolunteer ? (
                <div className={`${themeColors.mission} p-6 rounded-lg border ${themeColors.border}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${themeColors.text}`}>You're Already Involved!</h3>
                  <p className="text-sm mb-4">
                    Thank you for your interest in volunteering at our community event. We've received your submission and will be in touch soon with volunteer assignments and schedule details.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Keep an eye on your email for updates about your volunteer role, shift times, and event coordination. We're grateful for your community spirit!
                  </p>
                </div>
              ) : (
                <Button type="button" arrow onClick={() => openDialog('volunteer')}>
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
