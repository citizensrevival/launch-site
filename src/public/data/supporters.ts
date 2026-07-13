export interface Supporter {
  name: string
  /** Path under `public/images/supporters/`. */
  logo: string
  /** Shown beneath the name in the featured row. */
  role?: string
  url?: string
}

/** The host city and the event's fiscal sponsor. Shown above the rest. */
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
]

/** Local businesses and organizations supporting the Revival. */
export const supporters: Supporter[] = [
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
    name: 'AK Manufacturing',
    logo: '/images/supporters/ak-manufacturing.jpg',
    url: 'https://www.ak-mfg.com',
  },
  {
    name: 'Anchorpoint Insurance',
    logo: '/images/supporters/anchorpoint-insurance.jpg',
    url: 'https://lassteragency.com',
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
    name: 'Barefoot Bikes',
    logo: '/images/supporters/barefoot-bikes.jpg',
    url: 'https://www.barefoot.bike',
  },
  {
    name: 'Edgar Farms',
    logo: '/images/supporters/edgar-farms.jpg',
    url: 'https://www.edgarsfarm.com',
  },
  {
    name: 'Finish Line Graphics',
    logo: '/images/supporters/finish-line-graphics.jpg',
    url: 'https://finishlinegraphic.com',
  },
  {
    name: "Jack's Plastic Welding",
    logo: '/images/supporters/jacks-plastic-welding.jpg',
    url: 'https://jpwinc.com',
  },
  {
    name: 'Kinsey Forge',
    logo: '/images/supporters/kinsey-forge.jpg',
    url: 'https://www.kinseyforge.com',
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
