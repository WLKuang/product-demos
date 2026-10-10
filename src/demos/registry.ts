export const repoUrl = 'https://github.com/WLKuang/product-demos'

// The demos shown on the portfolio page. The case-study fields are filled in once a demo is finished.
export type DemoEntry = {
  path: string
  title: string
  tagline: string
  status: 'ready' | 'in-progress' | 'planned'
  brief?: string
  iterations?: string[]
  handover?: string
}

export const demos: DemoEntry[] = [
  {
    path: '/membership',
    title: 'Membership CRM',
    tagline: 'Dashboard and renewals workflow for a museum membership team.',
    status: 'ready',
    brief:
      "Membership team at a mid-size museum. They need to see who's due for renewal this month, find a member fast, and chase lapsed ones. Make it feel calm and premium, like the museum brand.",
    iterations: [
      "Added a 'Member since' column so long-standing members are easy to find, thank or invite to upgrade.",
      'Added short explanations to every column, figure and renewal stage, so new staff can use it without training.',
      'Changed the lapsed figure from a raw number to a percentage change, which is clearer at a glance.',
    ],
    handover:
      'Connect the member list to the real CRM and the reminder buttons to the email platform. In the demo, all changes stay in the browser and reset on reload.',
  },
  {
    path: '/venue-hire',
    title: 'Venue-hire client portal',
    tagline: 'Enquiry, quote and booking tracker for event clients.',
    status: 'ready',
    brief:
      'Museum hires out its spaces for weddings, corporate dinners and product launches. Clients currently email back and forth for weeks. Build a portal where a client picks a space and date, tells us guest numbers and catering, sees an instant estimated quote, and can then track their booking — deposit paid, contract signed, final numbers due. Should feel as polished as the venue itself.',
    handover:
      'Connect availability to the real events calendar, payments to a payment provider and the contract to an e-signature service. Add a staff view so the events team can review enquiries before quotes go out.',
  },
  {
    path: '/ops',
    title: 'Café operations dashboard',
    tagline: 'Morning dashboard, stock and staff rota for a three-shop bubble-tea chain.',
    status: 'ready',
    brief:
      "Small bubble-tea chain with three London shops. The owner wants one screen each morning: yesterday's sales by shop and best-selling drinks, which ingredients are running low and need ordering, and who's working today across all shops. Shift supervisors should be able to swap shifts and log stock deliveries from their phone. Keep it bright and friendly, not corporate.",
    handover:
      'Connect sales to the till system, stock to supplier ordering and the rota to the payroll or scheduling tool. Add sign-in so supervisors only see their own shop.',
  },
]
