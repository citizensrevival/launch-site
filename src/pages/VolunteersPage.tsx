import { Layout } from '../components/Layout'
import { Section } from '../components/Section'
import { Button } from '../components/Button'

export default function VolunteersPage() {
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
              Be part of the crew that makes the weekend sing. From welcoming guests to helping at stages and family activities, we'll match shifts to your interests and provide quick training.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Event Support</h3>
                <ul className="space-y-2">
                  <li>• Stage setup and management</li>
                  <li>• Sound and lighting assistance</li>
                  <li>• Vendor coordination</li>
                  <li>• Crowd management</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Guest Services</h3>
                <ul className="space-y-2">
                  <li>• Welcome and information booths</li>
                  <li>• Family activity coordination</li>
                  <li>• Accessibility support</li>
                  <li>• First aid assistance</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4">Volunteer Shifts</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Friday</h4>
                  <p className="text-sm mb-2">Main Street Setup</p>
                  <ul className="text-sm space-y-1">
                    <li>• 2-4 PM: Setup</li>
                    <li>• 4-8 PM: Event Support</li>
                    <li>• 8-10 PM: Cleanup</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Saturday</h4>
                  <p className="text-sm mb-2">Riverside Concert</p>
                  <ul className="text-sm space-y-1">
                    <li>• 10 AM-2 PM: Setup</li>
                    <li>• 2-8 PM: Concert Support</li>
                    <li>• 8-10 PM: Cleanup</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Sunday</h4>
                  <p className="text-sm mb-2">Community Center</p>
                  <ul className="text-sm space-y-1">
                    <li>• 8-10 AM: Breakfast Setup</li>
                    <li>• 10 AM-2 PM: Activities</li>
                    <li>• 2-4 PM: Final Cleanup</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4">Volunteer Benefits</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Recognition</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Volunteer appreciation event</li>
                    <li>• Special volunteer t-shirt</li>
                    <li>• Community recognition</li>
                    <li>• Networking opportunities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Training & Support</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Quick orientation sessions</li>
                    <li>• Role-specific training</li>
                    <li>• Volunteer coordinator support</li>
                    <li>• Flexible scheduling</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button type="submit" arrow>
                Sign Up to Volunteer
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </Layout>
  )
}
