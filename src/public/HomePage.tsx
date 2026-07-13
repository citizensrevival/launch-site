import { Layout } from '../core/components/Layout'
import { Section } from '../core/components/Section'
import { Button } from '../core/components/Button'
import { HeroVideo } from '../core/components/HeroVideo'

// Get the base path for images
const getImagePath = (imageName: string) => {
  return '/images/' + imageName;
};

const saturdayLineup = [
  { act: 'Vintage Brew', time: '12:30pm' },
  { act: 'Julie & The Boyz', time: '2:00pm' },
  { act: 'Rio Grand Trio', time: '4:00pm' },
  { act: 'Hamilton Loomis', time: '7:00pm' },
]

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-16">

        <HeroVideo />

        <Section
          id="what-is-it"
          title="What is Aztec Citizens Revival?"
          date="What is it?"
        >
          <p className="mb-4">
            Aztec Citizens Revival is a homegrown weekend celebrating the people, places, and stories of the Four Corners. An event designed to honor the resiliency of the great City of Aztec, by fostering a joyous jubilee among all its residents. Expect live performances, local businesses on display, good food, and gatherings that bring all ages together—spread across our downtown, riverside, and community spaces.
          </p>
          <p className="mb-4 font-medium">
            August 28th, 29th &amp; 30th, 2026. Free and open to everyone.
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
          <p className="font-medium">Friday August 28th, 2026 &middot; 4:00pm&ndash;8:00pm &middot; Main Street, Aztec NM</p>
          <p className="mb-6">
          Kick off with the Community Scavenger Hunt: solve the clues that will introduce you and your family to the local businesses and organizations who have helped keep Aztec a thriving community. Pick the route that suits you&mdash;small, medium, or large&mdash;then explore Aztec, meet neighbors, and shop locally. Street vibes continue with live entertainment, family friendly art and information booths, and a bustling vendor fair.
          </p>

          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Activities
          </h3>

          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Community Business Scavenger Hunt, starting from the Aztec Senior Community Center &mdash; three routes: small, medium, and large</li>
            <li>Live music in three locations, including The Zia Chicks at the Stage on Main</li>
            <li>Family friendly art and information booths, with over 20 local businesses taking part</li>
            <li>Prizes awarded at 7:45pm &mdash; an inflatable paddle board, a ukulele, gift cards from participating businesses, and more</li>
            <li>Parking at the Aztec Senior Community Center and the city complex</li>
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
          <p className="font-medium">Saturday August 29th, 2026 &middot; 11:00am&ndash;9:00pm &middot; Riverside Park, Aztec NM</p>
          <p className="mb-6">
          Gather at the beautiful Riverside Park for the all day Jubilee Concert, featuring live bands from across the Four Corners and headlined by Hamilton Loomis. Great local music to dance and vibe to in the late summer, next to the Animas River. Bring a blanket or chair, browse the car show and the vendor fair, and eat your way through the food trucks.
          </p>

          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Concert Lineup
          </h3>

          <ul className="list-disc list-inside space-y-2 mb-8">
            {saturdayLineup.map(({ act, time }) => (
              <li key={act}>
                <span className="font-medium">{time}</span> &mdash; {act}
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Activities
          </h3>

          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Car show, plus over 30 unique art and informational vendors and 10 food trucks</li>
            <li>Bands and the beer garden get going at noon; last call at the beer garden is 8:00pm</li>
            <li>Hamilton Loomis headlines from 7:00pm to 9:00pm</li>
            <li>Social clubs and organizations doing good work across San Juan County</li>
          </ul>
        </Section>

        <Section
          id="sunday"
          title="Sunday - Aztec Senior Community Center"
          date="Sunday"
          image={{
            src: getImagePath("aztec-nm-community-center.jpg"),
            alt: "Sunday - Aztec Senior Community Center",
            width: 800,
            height: 600
          }}
        >
          <p className="font-medium">Sunday August 30th, 2026 &middot; 9:00am&ndash;1:00pm &middot; Aztec Senior Community Center</p>
          <p className="mb-4">
          Gather for an Interfaith Service&mdash;many faiths with one goal: community&mdash;followed by a pancake breakfast and a relaxed family fun day on the center&apos;s outdoor spaces.
          </p>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Activities
          </h3>
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Interfaith Service from 9:00am, running until about 10:30am</li>
            <li>Pancake breakfast served by the Friends of the Aztec Seniors and Community</li>
            <li>Chalk art, hula hoops, and casual fun on the center&apos;s outdoor spaces</li>
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

        <Section
          id="brought-to-you-by"
          title="Brought to You By"
          date="Supporters"
        >
          <p className="mb-6">
            This is a free community event, made possible by the local businesses and organizations who give their time, money, and goods to make it happen.
          </p>
          <div className="mt-6">
            <Button to="/brought-to-you-by" arrow>
              See Who
            </Button>
          </div>
        </Section>
      </div>
    </Layout>
  )
}
