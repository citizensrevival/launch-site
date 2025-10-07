import { Layout } from '../components/Layout'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { useTheme } from '../contexts/ThemeContext'
import { useSiteSettings } from '../lib/SiteSettingsManager'
import { useGetInvolvedDialog } from '../hooks/useGetInvolvedDialog'

export default function SponsorsPage() {
  const theme = useTheme()
  const colorTheme = theme?.colorTheme || 'purple'
  const siteSettings = useSiteSettings()
  const { openDialog } = useGetInvolvedDialog()
  
  // Get theme-specific colors
  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-200'
        }
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-200'
        }
      case 'amber':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-200'
        }
      case 'rose':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-600',
          border: 'border-rose-200'
        }
      default: // purple
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-600',
          border: 'border-purple-200'
        }
    }
  }
  
  const themeColors = getThemeColors(colorTheme)
  
  // Check if user has already submitted as a sponsor
  const hasSubmittedAsSponsor = siteSettings.getGetInvolvedSubmission('sponsor')
  
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
              Support our community while gaining valuable exposure. Your sponsorship helps fund the Community Center expansion and connects you with thousands of engaged community members.
            </p>
            <h3 className="text-xl font-semibold mb-4">Sponsorship Tiers</h3>
            <div className={`${themeColors.bg} p-6 rounded-lg mb-8`}>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Legacy Partner</h4>
                  <p className={`text-2xl font-bold ${themeColors.text}`}>$5,000+</p>
                  <p className="text-sm mb-2">or equivalent in-kind</p>
                  <ul className="text-xs text-center space-y-2 list-none m-0 p-0">
                    <li>"Presented by [YOUR BRAND]" on all event materials</li>
                    <li>Top-tier logo placement</li>
                    <li>2-3 minute on-stage remarks</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Community Champion</h4>
                  <p className={`mb-6 text-2xl font-bold ${themeColors.text}`}>$2,000-$4,999</p>
                  <ul className="text-xs text-center space-y-2 list-none m-0 p-0">
                    <li>Logo on signage</li>
                    <li>Premium booth placement</li>
                    <li>Public thank-you's during event</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Neighbor Ally</h4>
                  <p className={`mb-6 text-2xl font-bold ${themeColors.text}`}>$500-$1,999</p>
                  <ul className="text-xs text-center space-y-2 list-none m-0 p-0">
                    <li>Logo or name on signs and event site(s)</li>
                    <li>Flyer/coupon placement at community table</li>
                    <li>Group thank you and mention in printed program</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Friend of the Event</h4>
                  <p className={`mb-6 text-2xl font-bold ${themeColors.text}`}>$100-$499</p>
                  <ul className="text-xs text-center space-y-2 list-none">
                    <li>Name listed online and in print program</li>
                    <li>Coupons or small items in giveaway bags</li>
                    <li>Verbal recognition during raffle or drawing</li>
                  </ul>
                </div>
              </div>
            </div>
            
              <h3 className="text-xl font-semibold mb-4">Benefits of Sponsorship</h3>
            <div className="bg-gray-50  p-6 rounded-lg mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-2">
                  <li>Recognition on banners, programs, and social media</li>
                  <li>Engagement with thousands of attendees face-to-face</li>
                </ul>
                <ul className="space-y-2">
                  <li>Support for Community Center expansion</li>
                  <li>Positive visibility as a community champion</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              {hasSubmittedAsSponsor ? (
                <div className={`${themeColors.bg} p-6 rounded-lg border ${themeColors.border}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${themeColors.text}`}>You're Already Involved!</h3>
                  <p className="text-sm mb-4">
                    Thank you for your interest in sponsoring our community event. We've received your submission and will be in touch soon with next steps.
                  </p>
                  <p className="text-sm text-gray-600 ">
                    Keep an eye on your email for updates and contact information. We appreciate your support!
                  </p>
                </div>
              ) : (
                <Button type="button" arrow onClick={() => openDialog('sponsor')}>
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
