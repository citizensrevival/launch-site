import { Layout } from '../shell/Layout'
import { Section } from '../shell/Section'
import { Button } from '../shell/Button'

// Get the base path for images
const getImagePath = (imageName: string) => {
  return '/images/' + imageName;
};

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-16">

        <Section
          id="what-is-it"
          title="What is Aztec Citizens Revival?"
          date="What is it?"
          image={{
            src: getImagePath("purple_logo_splash.png"),
            alt: "Commit suggestions feature",
            width: 800,
            height: 600
          }}
        >
          <p className="mb-4">
            Aztec Citizens Revival is a homegrown weekend celebrating the people, places, and stories of the Four Corners. An event designed to honor the resiliency of the great City of Aztec, by fostering a joyous jubilee among all its residents. Expect live performances, local businesses on display, good food, and gatherings that bring all ages together—spread across our downtown, riverside, and community spaces.
          </p>
        </Section>

        <Section
          id="friday"
          title="Friday - Main Street"
          date="Friday"
          image={{
            src: getImagePath("aztec-nm-main-street.jpg"),
            alt: "Friday - Main Street",
            width: 800,
            height: 600
          }}
        >
          <p className="font-medium">Friday August 28th, 2026</p>
          <p className="mb-6">
          Kick off with the Community Scavenger Hunt: From Kare Drug to Minium Park, solve the clues that will introduce you and your family to the local businesses and organizations who have helped keep Aztec a thriving community. It's the perfect opportunity to explore Aztec, meet neighbors, and shop locally. Street vibes continue with food trucks, live entertainment, and a bustling vendor fair.
          </p>
          
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Activities
          </h3>
          
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Community Business Scavender Hunt: Explore Aztec, meet neighbors, shop local</li>
            <li>Food trucks, live street entertainment, vendor fair</li>
          </ul>
        </Section>

        <Section
          id="saturday"
          title="Saturday - Jubilee Concert"
          date="Saturday"
          image={{
            src: getImagePath("aztec-nm-riverside-park.jpg"),
            alt: "Saturday - Jubilee Concert",
            width: 800,
            height: 600
          }}
        >
          <p className="font-medium">Saturday August 29th, 2026</p>
          <p className="mb-6">
          Gather at the beautiful Riverside park for the all day Jubilee Concert, featuring live bands from across the Four Corners. Great local music to dance and vibe to in the late summer, with a groovy headliner to be announced soon. Bring a blanket or chair and enjoy the wonderful atmosphere next to the Animas River. Local food trucks on site.
          </p>
          
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Activities
          </h3>
          
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Jubilee Concert featuring live bands from across the Four Corners</li>
            <li>Groovy headliner to be announced soon</li>
            <li>Local food trucks on site</li>
          </ul>
        </Section>

        <Section
          id="sunday"
          title="Sunday - Community Center"
          date="Sunday"
          image={{
            src: getImagePath("aztec-nm-community-center.jpg"),
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
            Activities
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
          <p className="mb-6">
            Spotlight your brand where the community gathers. Flexible packages place your logo and messages in premium app and site locations and on the ground at key venues—plus options to promote offers that drive real foot traffic.
          </p>
          <div className="mt-6">
            <Button to="/sponsors" arrow>
              Learn More
            </Button>
          </div>
        </Section>

        <Section
          id="vendors"
          title="Vendors"
          date="Vendors"
        >
          <p className="mb-6">
            Join the heartbeat of Main Street and the vendor fair. Get a directory listing with map pin, highlight your menu or goods, and attract attendees with simple, scannable deals.
          </p>
          <div className="mt-6">
            <Button to="/vendors" arrow>
              Learn More
            </Button>
          </div>
        </Section>

        <Section
          id="volunteers"
          title="Volunteers"
          date="Volunteers"
        >
          <p className="mb-6">
            Be part of the crew that makes the weekend sing. From welcoming guests to helping at stages and family activities, we'll match shifts to your interests and provide quick training.
          </p>
          <p className="mt-6">
            <Button to="/volunteers" arrow>
              Learn More
            </Button>
          </p>
        </Section>
      </div>
    </Layout>
  )
}
