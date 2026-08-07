export interface Supporter {
  name: string
  /** Path under `public/images/supporters/`. */
  logo: string
  /** Shown beneath the name in the featured row. */
  role?: string
  url?: string
}

/**
 * Supporters who gave together at a single tier and are shown as one tile
 * rather than one each.
 */
export interface SupporterGroup {
  /** Shown beneath the logos, in place of a per-supporter role. */
  role: string
  members: Supporter[]
}

/**
 * The host city, the event's fiscal sponsor, and our top-tier sponsors, in that
 * order. Shown above the rest.
 */
export const featuredSupporters: Supporter[] = [
  {
    name: 'City of Aztec',
    logo: '/images/supporters/city-of-aztec.jpg',
    url: 'https://aztecnm.gov',
  },
  {
    name: 'Friends of the Aztec Seniors and Community',
    logo: '/images/supporters/helping-hands-caring-hearts.jpg',
    role: 'Fiscal Sponsor',
  },
  {
    name: "Serrano's Inc.",
    logo: '/images/supporters/serranos.jpg',
    role: 'Community Champion',
    url: 'https://serranosinc.com',
  },
]

/**
 * Three local healthcare providers who gave together at the Community Champion
 * tier. Shown with the featured supporters, one tile for the three of them.
 */
export const healthcareChampions: SupporterGroup = {
  role: 'Community Champion',
  members: [
    {
      name: 'Aztec Healthcare',
      logo: '/images/supporters/aztec-healthcare.png',
      url: 'https://aztechealthcare.com',
    },
    {
      name: 'Farmington Wellness & Rehabilitation',
      logo: '/images/supporters/farmington-wellness-rehab.jpg',
      url: 'https://farmingtonwellness.com',
    },
    {
      name: 'San Juan Care Center',
      logo: '/images/supporters/san-juan-care-center.jpg',
      url: 'https://sanjuancarecenter.com',
    },
  ],
}

/**
 * The businesses and organizations our planning committee members come from.
 * A role rather than a donation tier, so they sit above the tiers on the
 * Brought to You By page.
 */
export const facilitators: Supporter[] = [
  {
    name: '2nd Harvest Foundation',
    logo: '/images/supporters/2nd-harvest-foundation.png',
  },
  {
    name: 'AK Manufacturing',
    logo: '/images/supporters/ak-manufacturing.jpg',
    url: 'https://www.ak-mfg.com',
  },
  {
    name: 'Aztec Chamber of Commerce',
    logo: '/images/supporters/aztec-chamber-of-commerce.jpg',
    url: 'https://aztecchamber.com',
  },
  {
    name: 'Aztec Downtown Association',
    logo: '/images/supporters/aztec-downtown-association.jpg',
    url: 'https://www.facebook.com/61582277062139',
  },
  {
    name: 'Edgar Farms',
    logo: '/images/supporters/edgar-farms.jpg',
    url: 'https://www.edgarsfarm.com',
  },
  {
    name: 'Kinsey Forge',
    logo: '/images/supporters/kinsey-forge.jpg',
    url: 'https://www.kinseyforge.com',
  },
]

/**
 * Neighborhood Ally tier — the level above Friend of the Event. Listed ahead of
 * the friends on the Brought to You By page.
 */
export const neighborhoodAllies: Supporter[] = [
  {
    name: '100% San Juan Initiative',
    logo: '/images/supporters/100-san-juan-initiative.png',
    url: 'https://www.100nm.org/sanjuan/',
  },
  {
    name: 'Anchorpoint Insurance',
    logo: '/images/supporters/anchorpoint-insurance.jpg',
    url: 'https://lassteragency.com',
  },
  {
    name: "Burnin' Barrels Dispensary",
    logo: '/images/supporters/burnin-barrels.jpg',
    url: 'https://www.facebook.com/p/Burnin-Barrels-100083582272199/',
  },
  {
    name: "Rubia's Fine Mexican Dining",
    logo: '/images/supporters/rubias.jpg',
    url: 'https://rubiasfinemexicandining.net',
  },
  {
    name: 'Waste Management',
    logo: '/images/supporters/waste-management.png',
    url: 'https://www.wm.com',
  },
]

/** Friend of the Event tier — local businesses and organizations supporting the Revival. */
export const friendsOfTheEvent: Supporter[] = [
  {
    name: '550 Brewing Taproom',
    logo: '/images/supporters/550-brewing-taproom.jpg',
    url: 'https://www.550brew.com',
  },
  {
    name: '550 Pizzeria',
    logo: '/images/supporters/550-pizzeria.jpg',
    url: 'https://fivefiftypizzeria.com',
  },
  {
    name: 'Barefoot Bikes',
    logo: '/images/supporters/barefoot-bikes.jpg',
    url: 'https://www.barefoot.bike',
  },
  {
    name: 'Finish Line Graphics',
    logo: '/images/supporters/finish-line-graphics.jpg',
    url: 'https://finishlinegraphic.com',
  },
  {
    name: 'Four Corners Community Bank',
    logo: '/images/supporters/four-corners-community-bank.jpg',
    url: 'https://www.thebankforme.bank',
  },
  {
    name: 'Guzman Energy',
    logo: '/images/supporters/guzman-energy.png',
    url: 'https://www.guzmanenergy.com',
  },
  {
    name: "Jack's Plastic Welding",
    logo: '/images/supporters/jacks-plastic-welding.jpg',
    url: 'https://jpwinc.com',
  },
  {
    name: 'Kare Drug',
    logo: '/images/supporters/kare-drug.jpg',
    url: 'https://www.karedrug.com',
  },
  {
    name: 'Lil Aztec Flower Shop',
    logo: '/images/supporters/lil-aztec-flower-shop.jpg',
    url: 'https://www.facebook.com/lilaztecflowershop',
  },
  {
    name: 'Main Street Music',
    logo: '/images/supporters/main-street-music.jpg',
    url: 'https://www.mainstreetmusic.us',
  },
  {
    name: 'Noise Hub',
    logo: '/images/supporters/noise-hub.jpg',
    url: 'https://noise-hub.com',
  },
  {
    name: "Piper's Play Café",
    logo: '/images/supporters/pipers-play-cafe.jpg',
    url: 'https://www.pipersplaycafe.org',
  },
  {
    name: 'Round 2 Martial Arts',
    logo: '/images/supporters/round-2-martial-arts.jpg',
    url: 'https://round2martialarts.com',
  },
]
