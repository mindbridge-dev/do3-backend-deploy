// shared constants — the single source of truth for the do³ pricing ladder,
// competitor price anchors and campaign targets. used by both api and ui.

export const BRAND = {
  name: "do³",
  full: "dodo & do",
  ritual: "pause. recharge. do.",
  tagline: "a bed is closer than you think.",
  city: "doha, qatar",
  email: "hello@dodo-do.com",
  website: "www.dodo-do.com",
} as const;

// five-tier pricing ladder — investor plan §6.1 / pitch-deck appendix.
// prices in QAR. `unit` is what one unit of booking means.
export const TIERS = {
  focus: {
    id: "focus",
    name: "focus hour pass",
    unit: "hour",
    unitLabel: "hour",
    minUnits: 1,
    maxUnits: 8,
    priceFrom: 25,
    priceTo: 35,
    listPrice: 30, // indicative mid rate used for quotes
    who: "coworkers, layover travelers, daytime freelancers",
    blurb:
      "a pod sitting empty between checkouts is dead inventory — so it isn't empty. book by the hour, day use, wake-up light included.",
    voucherPct: 20, // first-visit voucher
    accent: "honey",
  },
  overnight: {
    id: "overnight",
    name: "overnight pod",
    unit: "night",
    unitLabel: "night",
    minUnits: 1,
    maxUnits: 14,
    priceFrom: 150,
    priceTo: 525,
    listPrice: 205, // year-1 blended adr
    who: "solo founders, engineers, conference attendees",
    blurb:
      "one person, one round door, total dark. event-calendar dynamic rate with length-of-stay discounting.",
    voucherPct: 15,
    accent: "terracotta",
  },
  sprint: {
    id: "sprint",
    name: "sprint pass",
    unit: "night",
    unitLabel: "night",
    minUnits: 3,
    maxUnits: 6,
    priceFrom: 165,
    priceTo: 472,
    listPrice: 185, // ~10% below à-la-carte
    who: "teams on a build sprint",
    blurb:
      "3–6 nights bundled: pod + coworking floor + one mentor credit. ~10% below booking each night à la carte.",
    voucherPct: 10,
    accent: "moss",
  },
  pass: {
    id: "pass",
    name: "do³ pass",
    unit: "month",
    unitLabel: "month",
    minUnits: 1,
    maxUnits: 12,
    priceFrom: 1800,
    priceTo: 2400,
    listPrice: 2100,
    who: "remote workers, repeat visitors",
    blurb:
      "a flat monthly membership: a bank of nights + year-round coworking. the citizenM-style subscription, applied to one flagship.",
    voucherPct: 0, // memberships are never discounted — the lock is the story
    accent: "dusk",
  },
} as const;
export type TierId = keyof typeof TIERS;

// founding membership — launch campaign: 250 capped, founding pricing locked for life.
export const FOUNDING = {
  cap: 250,
  pricePerMonth: 1800, // founding rate = bottom of the pass ladder, locked for life
  campaign: "find your third place",
  campaignAr: "مكانك الثالث",
} as const;

// competitor price anchors — competitor analysis & launch plan (quarterly refresh).
export const COMPARISONS = [
  {
    id: "hotel",
    label: "hotel night near the airport",
    example: "oryx airport hotel, doha",
    price: 1158, // QAR ≈ $318
    per: "night",
    note: "priced for tourists, not for a 26-minute reset",
  },
  {
    id: "coworking",
    label: "coworking day pass",
    example: "premium coworking, doha",
    price: 219,
    per: "day",
    note: "sells you a desk. no bed, no shower, no dark.",
  },
  {
    id: "airport-pod",
    label: "airside transit pod",
    example: "sleep 'n fly / sleepover, hamad intl",
    price: 150,
    per: "night",
    note: "locked airside — transit passengers only",
  },
] as const;

// dto shapes crossing the api boundary (superjson keeps Date as Date)
// voucher lifecycle: pending_payment → active → redeemed (or expired).
// generation/reservation is decoupled from payment — a voucher is minted
// instantly and only becomes usable once the team confirms payment.
export type VoucherStatus = "pending_payment" | "active" | "redeemed" | "expired";
export type VoucherBuyerType = "self" | "gift" | "institution";
export type VoucherDTO = {
  id: number;
  code: string;
  tier: string;
  discountPct: number;
  baselineLabel: string;
  baselinePrice: number;
  do3Price: number;
  email: string | null; // purchaser email (payment + reservation mail go here)
  buyerName: string | null;
  buyerPhone: string | null;
  buyerType: VoucherBuyerType;
  orgName: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  lang: "en" | "ar";
  status: VoucherStatus;
  paidVia: string | null; // onsite | link
  activatedAt: Date | null;
  expiresAt: Date; // set to activation + 30d when the voucher goes live
  redeemedAt: Date | null;
  createdAt: Date;
};

export type BookingDTO = {
  id: number;
  ref: string;
  name: string;
  email: string;
  tier: string;
  location: string;
  startDate: string;
  startTime: string | null;
  units: number;
  unitPrice: number;
  discountPct: number;
  total: number;
  status: "confirmed" | "waitlist";
  createdAt: Date;
};

// bookable locations — the flagship opens for pre-booking first; every other
// pin is a target we are dreaming toward, NOT a signed venue. ids stay stable
// for db compatibility (bookings.location references them).
export const LOCATIONS = {
  flagship: { id: "flagship", name: "do³ flagship", place: "doha city centre", status: "prebooking" },
  firestation: { id: "firestation", name: "do³ museum", place: "a cultural venue", status: "soon" },
  qstp: { id: "qstp", name: "do³ campus", place: "a science park", status: "soon" },
  mall: { id: "mall", name: "do³ mall", place: "a shopping mall", status: "soon" },
  metro: { id: "metro", name: "do³ metro", place: "a metro station", status: "soon" },
  hospital: { id: "hospital", name: "do³ hospital", place: "a care district", status: "soon" },
  library: { id: "library", name: "do³ library", place: "a reading hall", status: "soon" },
} as const;
export type LocationId = keyof typeof LOCATIONS;

// program vouchers — venue passes for do³ placements beyond the flagship.
// same endorsed-pass logic as do³ fire station / do³ qstp / do³ mall.
export const PROGRAMS = {
  metro: {
    id: "metro",
    name: "do³ metro pass",
    venue: "metro stations · pilot",
    minutes: 25,
    listPrice: 35,
    price: 25,
    discountPct: 30,
    baselineLabel: "airport lounge entry",
    baselinePrice: 150,
    unit: "25 min",
    accent: "#E5B04A",
    blurb:
      "a 25-minute pause at the station pod — step off the red line, close the round door, and ride on sharper.",
  },
  hospital: {
    id: "hospital",
    name: "do³ hospital pass",
    venue: "hospital districts · pilot",
    minutes: 120,
    listPrice: 60,
    price: 45,
    discountPct: 25,
    baselineLabel: "hotel day room nearby",
    baselinePrice: 300,
    unit: "2 hours",
    accent: "#8E7CA6",
    blurb:
      "for families keeping vigil and night-shift staff — a real bed two corridors away, not a waiting-room chair.",
  },
} as const;
export type ProgramId = keyof typeof PROGRAMS;

// ── b2b revenue architecture — investor plan §6.3, §11, §12.
export const B2B = {
  placement: {
    name: "do³ flex placement",
    model: "equipment rental, not sale",
    detail:
      "fixed monthly rental per pod, invoiced quarterly. 12-month term, 3-month pilot first. we own, install, maintain and upgrade — the host provides space and power.",
    proof: "pilot conversations open with doha's cultural venues — announced the day one is signed",
  },
  corporateBlock: {
    name: "corporate block contract",
    blendedRate: "QAR 190–200 blended / night",
    detail:
      "pre-negotiated guaranteed room-nights at a fixed blended rate, quarterly or annual. built for vcs, accelerators and corporates with rotating visitors.",
    proof: "science-park ecosystems alone hold 2,050–3,350 room-nights / year of potential",
  },
  licensing: {
    name: "do³ flex design licensing",
    detail:
      "license the convertible pod design + manufacturing specs. one-time design license QAR 50,000–100,000 + QAR 200–300 per unit manufactured.",
    proof: "same physical pod sells as solo or companion — one sku, two room-types",
  },
  franchise: {
    name: "regional franchise",
    detail:
      "full-property franchising for riyadh, dubai, kuwait, bahrain. min. net worth QAR 2M, 800+ sqm site. buyback option at 5–7× ebitda.",
    proof: "franchise documentation completes at month 18",
  },
} as const;

// 12-month strategy — launch campaign (T-8 → T+8) + investor plan §16 roadmap.
export const ROADMAP = [
  {
    phase: "t-8 → t-5",
    title: "foundation & tease",
    items: [
      "landing pages live (this site) + waitlist opens",
      "google business profile + analytics baseline",
      "'something is missing in doha' teaser series",
      "brand reveal + 60s pod tour film",
    ],
  },
  {
    phase: "t-4 → t-0",
    title: "convert & countdown",
    items: [
      "founding membership sale opens — 250 capped",
      "comparison page + paid search live",
      "creator preview stays + press wave 1",
      "press & creator preview evening, then opening night",
    ],
  },
  {
    phase: "months 1–4",
    title: "build & soft launch",
    items: [
      "civil defense fit-out + pod manufacturing (30 units)",
      "soft launch: 10 pods, friends & family",
      "fire station pilot pods installed for the air cohort",
      "whatsapp-native guest journey live",
    ],
  },
  {
    phase: "months 5–8",
    title: "grand opening & ramp",
    items: [
      "grand opening at 30 pods",
      "occupancy ramps toward 58% average",
      "100+ google reviews at ≥4.5",
      "fire station air case study — first b2b proof asset",
    ],
  },
  {
    phase: "months 9–12",
    title: "stabilize & seed phase 2",
    items: [
      "first corporate block contract activation (qstp)",
      "b2b placement pipeline: qstp, qatar national library, malls",
      "design awards: a' design + if design results",
      "phase 2 doubling to 60 keys prepared from reserve",
    ],
  },
] as const;
