import { SparkleIcon } from './SparkleIcon'
import { Layout } from './Layout'
import { Section } from './Section'

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-16">

        <Section
          id="what-is-it"
          title="What is Aztec Citizens Revival?"
          date="What is it?"
          image={{
            src: "/images/purple_logo_splash.png",
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
            src: "/images/aztec-nm-main-street.jpg",
            alt: "Friday - Main Street",
            width: 800,
            height: 600
          }}
        >
          <p className="font-medium">Friday August 28th, 2026</p>
          <p className="mb-6">
            Get to know Aztec on Main Street.
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
            src: "/images/aztec-nm-riverside-park.jpg",
            alt: "Saturday - Riverside Park",
            width: 800,
            height: 600
          }}
        >
          <p className="font-medium">Saturday August 29th, 2026</p>
          <p className="mb-6">
            Hang out at Riverside Park and enjoy the performances.
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
            src: "/images/aztec-nm-community-center.jpg",
            alt: "Sunday - Community Center",
            width: 800,
            height: 600
          }}
        >
          <p className="font-medium">Sunday August 30th, 2026</p>
          <p className="mb-4">
            Celebrate the end of the weekend at the Community Center.
          </p>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SparkleIcon /> Activities
          </h3>
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Interfaith Spiritual Conversation: faith, values, & community growth</li>
            <li>Followed by a community pancake breakfast & family fun day</li>
          </ul>
        </Section>
      </div>
    </Layout>
  )
}
