import { SparkleIcon } from './SparkleIcon'
import { Layout } from './Layout'
import { Section } from './Section'
import { Button } from './Button'

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-16">

        <Section
          id="what-is-it"
          title="What is Aztec Citizens Revival?"
          date="What is it?"
          image={{
            src: "./images/purple_logo_splash.png",
            alt: "Commit suggestions feature",
            width: 800,
            height: 600
          }}
        >
          <p className="mb-4">
            Aztec Citizens Revival is a homegrown weekend celebrating the people, places, and stories of the Four Corners. Expect live performances, local businesses on display, good food, and gatherings that bring all ages together—spread across our downtown, riverside, and community spaces.
          </p>
        </Section>

        <Section
          id="friday"
          title="Friday - Main Street"
          date="Friday"
          image={{
            src: "./images/aztec-nm-main-street.jpg",
            alt: "Friday - Main Street",
            width: 800,
            height: 600
          }}
        >
          <p className="font-medium">Friday August 28th, 2026</p>
          <p className="mb-6">
          Kick off with the Community Business Scavenger Hunt: explore Aztec, meet neighbors, and shop local. Street vibes continue with food trucks, live entertainment, and a bustling vendor fair.
          </p>
          
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SparkleIcon /> Activities
          </h3>
          
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Community Business Scavender Hunt: Explore Aztec, meet neighbors, shop local</li>
            <li>Food trucks, live street entertainment, vendor fair</li>
          </ul>
        </Section>

        <Section
          id="saturday"
          title="Saturday - Riverside Park"
          date="Saturday"
          image={{
            src: "./images/aztec-nm-riverside-park.jpg",
            alt: "Saturday - Riverside Park",
            width: 800,
            height: 600
          }}
        >
          <p className="font-medium">Saturday August 29th, 2026</p>
          <p className="mb-6">
          Settle in by the Animas for a Community Concert featuring artists from across the Four Corners. Headliner announcements coming soon! Bring a chair or blanket and enjoy the park atmosphere.
          </p>
          
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SparkleIcon /> Activities
          </h3>
          
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Community Concert featuring artists from across the Four Corners Region</li>
            <li>Headliner announcements coming soon</li>
          </ul>
        </Section>

        <Section
          id="sunday"
          title="Sunday - Community Center"
          date="Sunday"
          image={{
            src: "./images/aztec-nm-community-center.jpg",
            alt: "Sunday - Community Center",
            width: 800,
            height: 600
          }}
        >
          <p className="font-medium">Sunday August 30th, 2026</p>
          <p className="mb-4">
          Gather for an Interfaith Spiritual Conversation on faith, values, and community growth—followed by a pancake breakfast and family fun day activities.
          </p>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SparkleIcon /> Activities
          </h3>
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Interfaith Spiritual Conversation: faith, values, & community growth</li>
            <li>Followed by a community pancake breakfast & family fun day</li>
          </ul>
        </Section>

        <Section
          id="sponsors"
          title="Sponsors"
          date="Sponsors"
        >
          <p>
            Spotlight your brand where the community gathers. Flexible packages place your logo and messages in premium app and site locations and on the ground at key venues—plus options to promote offers that drive real foot traffic.
          </p>
          <Button type="submit" arrow>
            Get Involved
          </Button>
        </Section>

        <Section
          id="vendors"
          title="Vendors"
          date="Vendors"
        >
          <p>
            Join the heartbeat of Main Street and the vendor fair. Get a directory listing with map pin, highlight your menu or goods, and attract attendees with simple, scannable deals.
          </p>
          <Button type="submit" arrow>
            Get Involved
          </Button>
        </Section>

        <Section
          id="volunteers"
          title="Volunteers"
          date="Volunteers"
        >
          <p>
            Be part of the crew that makes the weekend sing. From welcoming guests to helping at stages and family activities, we'll match shifts to your interests and provide quick training.
          </p>
          <Button type="submit" arrow>
            Get Involved
          </Button>
        </Section>
      </div>
    </Layout>
  )
}
