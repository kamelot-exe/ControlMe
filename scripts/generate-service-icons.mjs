import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ICON_DIR = path.join(ROOT, "public", "icons", "services");
const REGISTRY_PATH = path.join(ROOT, "lib", "services", "icon-registry.ts");

const CATEGORY_META = {
  streaming: {
    label: "Streaming",
    hue: 352,
    sat: 82,
    light: 58,
    motif: '<path d="M42 41v14l12-7-12-7Z"/>',
  },
  music: {
    label: "Music",
    hue: 148,
    sat: 76,
    light: 52,
    motif:
      '<rect x="42" y="47" width="3" height="9" rx="1.5"/><rect x="47" y="43" width="3" height="13" rx="1.5"/><rect x="52" y="45" width="3" height="11" rx="1.5"/>',
  },
  gaming: {
    label: "Gaming",
    hue: 236,
    sat: 74,
    light: 60,
    motif:
      '<circle cx="45" cy="48" r="2"/><circle cx="51" cy="44" r="2"/><circle cx="51" cy="52" r="2"/><path d="M44 44v8M40 48h8" stroke="#F8FAFC" stroke-opacity=".18" stroke-width="2" stroke-linecap="round"/>',
  },
  productivity: {
    label: "Productivity",
    hue: 206,
    sat: 70,
    light: 58,
    motif:
      '<rect x="41" y="43" width="6" height="6" rx="1.5"/><rect x="49" y="43" width="6" height="6" rx="1.5"/><rect x="41" y="51" width="6" height="6" rx="1.5"/><rect x="49" y="51" width="6" height="6" rx="1.5"/>',
  },
  developer: {
    label: "Developer",
    hue: 222,
    sat: 70,
    light: 58,
    motif:
      '<path d="M43 45 39 49l4 4M53 45l4 4-4 4M47 56l3-14" stroke="#F8FAFC" stroke-opacity=".18" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  ai: {
    label: "AI",
    hue: 38,
    sat: 88,
    light: 58,
    motif:
      '<path d="m48 42 2.3 5.7L56 50l-5.7 2.3L48 58l-2.3-5.7L40 50l5.7-2.3L48 42Z"/>',
  },
  security: {
    label: "Security",
    hue: 168,
    sat: 68,
    light: 52,
    motif:
      '<path d="M48 42 56 45v5.5c0 4-2.6 6.4-8 8.5-5.4-2.1-8-4.5-8-8.5V45l8-3Z"/>',
  },
  finance: {
    label: "Finance",
    hue: 132,
    sat: 68,
    light: 52,
    motif:
      '<rect x="41" y="49" width="4" height="8" rx="1.5"/><rect x="47" y="45" width="4" height="12" rx="1.5"/><rect x="53" y="42" width="4" height="15" rx="1.5"/>',
  },
  telecom: {
    label: "Telecom",
    hue: 18,
    sat: 82,
    light: 58,
    motif:
      '<path d="M42 54c2.4-2.3 4.7-3.4 6.9-3.4S53.4 51.7 56 54M44 50c1.5-1.4 3.1-2.1 4.8-2.1 1.7 0 3.4.7 5.1 2.1M46.5 46.5c.7-.7 1.5-1 2.4-1s1.7.3 2.5 1" stroke="#F8FAFC" stroke-opacity=".18" stroke-width="2.2" stroke-linecap="round"/>',
  },
  retail: {
    label: "Retail",
    hue: 334,
    sat: 76,
    light: 60,
    motif:
      '<path d="M42 46h14l-1.2 9.5a2 2 0 0 1-2 1.7h-7.6a2 2 0 0 1-2-1.7L42 46ZM46 46v-2.2c0-1.5 1.2-2.8 2.8-2.8h.4c1.6 0 2.8 1.3 2.8 2.8V46" stroke="#F8FAFC" stroke-opacity=".18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  social: {
    label: "Social",
    hue: 286,
    sat: 70,
    light: 60,
    motif:
      '<path d="M41 44.5a3.5 3.5 0 0 1 3.5-3.5h8a3.5 3.5 0 0 1 3.5 3.5v4A3.5 3.5 0 0 1 52.5 52H49l-4 4v-4h-.5A3.5 3.5 0 0 1 41 48.5v-4Z"/>',
  },
  education: {
    label: "Education",
    hue: 44,
    sat: 82,
    light: 58,
    motif:
      '<path d="M40 45.5 48.5 41 57 45.5l-8.5 4.5L40 45.5Zm2.5 1.7v4.3c0 1.5 2.5 3.5 6 3.5s6-2 6-3.5v-4.3" stroke="#F8FAFC" stroke-opacity=".18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  health: {
    label: "Health",
    hue: 316,
    sat: 74,
    light: 60,
    motif:
      '<path d="M40 50h4l2.2-4.5 3.1 9 2.4-5H57" stroke="#F8FAFC" stroke-opacity=".18" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  travel: {
    label: "Travel",
    hue: 196,
    sat: 78,
    light: 58,
    motif:
      '<path d="M56 42.5 49.5 49H44l-3 3h5.5L49 58h2l-1.2-6H56l2-2.5-2-2.5Z"/>',
  },
  cloud: {
    label: "Cloud",
    hue: 204,
    sat: 74,
    light: 58,
    motif:
      '<path d="M43.5 55h10.5a5 5 0 0 0 .7-9.9 7.5 7.5 0 0 0-14.2-1.7A4.6 4.6 0 0 0 43.5 55Z"/>',
  },
  utility: {
    label: "Utility",
    hue: 12,
    sat: 74,
    light: 58,
    motif:
      '<path d="m48 42-6 9h5l-2 7 7-10h-4l2-6Z"/>',
  },
  generic: {
    label: "Generic",
    hue: 218,
    sat: 24,
    light: 56,
    motif:
      '<circle cx="44" cy="45" r="2.2"/><circle cx="52" cy="45" r="2.2"/><circle cx="44" cy="53" r="2.2"/><circle cx="52" cy="53" r="2.2"/>',
  },
};

const SERVICE_SOURCE = String.raw`
[streaming]
Netflix
YouTube Premium|youtube-premium|youtube
Prime Video|prime-video|amazon-prime-video
Disney+|disney-plus|disney
Hulu
Max|max|hbo-max,hbo
Paramount+|paramount-plus
Peacock
Crunchyroll
Apple TV+|apple-tv-plus|appletv+,appletv-plus
Discovery+
ESPN+
DAZN
MUBI|mubi
Viaplay
Movistar Plus+|movistar-plus|movistar,movistar-plus-plus
Canal+
BritBox
AMC+
Shudder
Starz
BET+
CuriosityStream
Nebula
Hayu
Crave
Stan
ITVX Premium|itvx-premium|itvx
Globoplay
ZEE5
Sony LIV|sony-liv
iQIYI
Viki Pass|viki-pass|rakuten-viki
Tencent Video
WeTV
Plex Pass|plex-pass|plex
YouTube TV|youtube-tv
Fubo|fubo
Philo
Rakuten TV
Yandex Plus|yandex-plus

[music]
Spotify
Apple Music
YouTube Music|youtube-music
SoundCloud
SoundCloud Go+|soundcloud-go-plus|soundcloud-go
Tidal
Deezer
Pandora
Amazon Music
Audible
Kindle Unlimited
Everand
Storytel
BookBeat
Kobo Plus|kobo-plus
Blinkist
Pocket Casts Plus|pocket-casts-plus|pocket-casts
TuneIn Premium|tunein-premium|tunein
Qobuz
Anghami Plus|anghami-plus|anghami
JioSaavn Pro|jiosaavn-pro|jiosaavn
Gaana Plus|gaana-plus|gaana
Audiomack+|audiomack-plus|audiomack
Podimo
Mixcloud Pro|mixcloud-pro|mixcloud
Ultimate Guitar Pro|ultimate-guitar-pro|ultimate-guitar
Audiobooks.com|audiobooks-com
Libro.fm|libro-fm
Castbox Premium|castbox-premium|castbox
KKBOX

[gaming]
Xbox Game Pass|xbox-game-pass|game-pass
PC Game Pass|pc-game-pass
Xbox Game Pass Ultimate|xbox-game-pass-ultimate
PlayStation Plus|playstation-plus|ps-plus
Nintendo Switch Online|nintendo-switch-online
EA Play|ea-play
Ubisoft+|ubisoft-plus
GeForce NOW|geforce-now
Luna+|luna-plus|amazon-luna
Apple Arcade
Google Play Pass|google-play-pass
Discord Nitro|discord-nitro|discord
Roblox Premium|roblox-premium|roblox
Minecraft Realms Plus|minecraft-realms-plus|minecraft-realms
Humble Choice|humble-choice
GameFly
Blacknut
Boosteroid
Shadow PC|shadow-pc|shadow
Steam
Epic Games|epic-games
Battle.net|battle-net|battlenet
Twitch Turbo|twitch-turbo|twitch
Riot Access|riot-access|riot
Final Fantasy XIV|final-fantasy-xiv|ffxiv
World of Warcraft|world-of-warcraft|wow
RuneScape Membership|runescape-membership|runescape
Old School RuneScape|old-school-runescape|osrs
GTA+|gta-plus
Nexus Mods Premium|nexus-mods-premium|nexus-mods

[productivity]
Notion
Slack
Microsoft 365|microsoft-365|office-365
Google Workspace|google-workspace|g-suite
Google One|google-one
Apple One|apple-one|apple
Dropbox
iCloud+|icloud-plus|icloud
Box
Adobe Creative Cloud|adobe-creative-cloud|creative-cloud
Figma
Canva
Grammarly
Miro
Airtable
Trello
Asana
ClickUp
Todoist
Monday.com|monday-com|monday
Evernote
Obsidian Sync|obsidian-sync|obsidian
Coda
Zoho One|zoho-one
WPS Office|wps-office
Lucidchart
Sketch
Framer
Webflow
Squarespace
Wix
Typeform
Calendly
Loom
Zoom
Microsoft Teams|microsoft-teams|teams
Zapier
Make
DocuSign
Confluence

[developer]
GitHub
GitLab
Bitbucket
JetBrains
Vercel
Netlify
Heroku
Railway
Render
DigitalOcean
Cloudflare
MongoDB Atlas|mongodb-atlas|mongodb
Supabase
Neon
PlanetScale
Firebase
AWS|aws|amazon-web-services
Google Cloud|google-cloud|gcp
Microsoft Azure|microsoft-azure|azure
Oracle Cloud|oracle-cloud
Linode
Vultr
Hetzner
Fly.io|fly-io
Postman
Insomnia
Docker Hub|docker-hub|docker
Sentry
Datadog
New Relic|new-relic
LaunchDarkly
Algolia
Contentful
Sanity
Clerk
Auth0
Okta
Twilio
SendGrid|sendgrid
Mailgun
Resend
Cloudinary
Fastly
Terraform Cloud|terraform-cloud
BrowserStack
CircleCI|circleci
PostHog
Expo
Pulumi Cloud|pulumi-cloud
HashiCorp Cloud|hashicorp-cloud
Bunny.net|bunny-net|bunny
Sauce Labs|sauce-labs
Plausible
Amplitude
Mixpanel
Segment
Redis Cloud|redis-cloud|redis
Convex
Appwrite
Meilisearch Cloud|meilisearch-cloud|meilisearch
Retool

[ai]
ChatGPT|chatgpt|chatgpt-plus
OpenAI API|openai-api|openai
Claude|claude|claude-pro,anthropic
Perplexity Pro|perplexity-pro|perplexity
Gemini Advanced|gemini-advanced|gemini
GitHub Copilot|github-copilot|githubcopilot,copilot
Copilot Pro|copilot-pro|microsoft-copilot
ElevenLabs|elevenlabs
Midjourney
Runway
Hugging Face|hugging-face
Notion AI|notion-ai
Jasper
Copy.ai|copy-ai
Poe
DeepL Pro|deepl-pro|deepl
Suno
Udio
Leonardo AI|leonardo-ai
HeyGen
Cursor

[security]
1Password|1password
Bitwarden Premium|bitwarden-premium|bitwarden
NordVPN|nordvpn
ExpressVPN|expressvpn
Surfshark
Proton VPN|proton-vpn|protonvpn
Proton Drive|proton-drive
Proton Mail|proton-mail
Dashlane
Keeper
LastPass
Malwarebytes
Norton 360|norton-360|norton
McAfee+|mcafee-plus|mcafee
Kaspersky Premium|kaspersky-premium|kaspersky
ESET Home|eset-home|eset
Avast One|avast-one|avast
TunnelBear
CyberGhost
Private Internet Access|private-internet-access|pia,pia-vpn
IPVanish
Windscribe Pro|windscribe-pro|windscribe
Mullvad
AdGuard
Setapp
Backblaze
Acronis
NordPass
Tutanota
DuckDuckGo Privacy Pro|duckduckgo-privacy-pro|duckduckgo

[finance]
Revolut
Monzo
N26
Curve
Robinhood
Robinhood Gold|robinhood-gold
American Express|american-express|amex,amex-platinum
PayPal
Venmo
Cash App|cash-app
Wise
Chime
SoFi
Coinbase One|coinbase-one|coinbase
Binance
Kraken
Gemini
TradingView
YNAB
Rocket Money|rocket-money
Credit Karma|credit-karma
Experian
Chase Sapphire|chase-sapphire|chase-sapphire-reserve,chase
Capital One|capital-one|capitalone,capitalone-venture-x
Bank of America|bank-of-america
Wells Fargo|wells-fargo
Citi
Discover
Fidelity
Charles Schwab|charles-schwab|schwab
Vanguard
Betterment
Wealthfront
Acorns
Stash
Interactive Brokers|interactive-brokers
Webull
Stripe
Square
QuickBooks
Xero
SberPrime|sberprime
T-Bank Pro|t-bank-pro|tbank-pro,tinkoff-pro

[telecom]
AT&T|att|at-and-t
T-Mobile|t-mobile
Verizon
Vodafone|vodafone|vodafone-uk
Orange|orange|orange-pl
Claro|claro|claro-br
Vivo
TIM
Movistar
O2
EE
Bell
Rogers
Telus
Telcel
Telmex
Xfinity
Spectrum
Cox
Frontier
CenturyLink
Telekom|telekom|deutsche-telekom
Airtel
Jio
MTN
Etisalat
Turkcell
Singtel
StarHub
Optus
Telstra
Kyivstar
Beeline|beeline|beeline-kz
MTS
Rostelecom
Virgin Media|virgin-media
Swisscom
Zain
Octopus Energy|octopus-energy
EDF Energy|edf-energy

[retail]
Amazon Prime|amazon-prime
Walmart+
Instacart+|instacart-plus|instacart
Uber One|uber-one
DoorDash DashPass|doordash-dashpass|dashpass,doordash
Grubhub+|grubhub-plus|grubhub
Deliveroo Plus|deliveroo-plus|deliveroo
Lyft Pink|lyft-pink|lyft
Wolt+|wolt-plus|wolt
Foodpanda Pro|foodpanda-pro|foodpanda
Glovo Prime|glovo-prime|glovo
Rappi Pro|rappi-pro|rappi
Mercado Libre Meli+|meli-plus|mercado-libre,meli
Costco
Sam's Club|sams-club|sams-club
Target Circle 360|target-circle-360|target-circle
eBay Plus|ebay-plus|ebay
Flipkart Plus|flipkart-plus|flipkart
Coupang WOW|coupang-wow|coupang
Shopee
Lazada
Rakuten
IKEA Family|ikea-family|ikea
Best Buy Total|best-buy-total|best-buy
GameStop Pro|gamestop-pro|gamestop
CVS CarePass|cvs-carepass|carepass,cvs
Walgreens Plus|walgreens-plus|walgreens
Kroger Boost|kroger-boost|kroger
Tesco Clubcard Plus|tesco-clubcard-plus|tesco
Ocado Smart Pass|ocado-smart-pass|ocado
Coles Plus Saver|coles-plus-saver|coles
Woolworths Everyday Extra|woolworths-everyday-extra|woolworths
Zepto Pass|zepto-pass|zepto
Swiggy One|swiggy-one|swiggy
Zomato Gold|zomato-gold|zomato
Shipt Everyday|shipt-everyday|shipt
Thrive Market|thrive-market
HelloFresh
Blue Apron
StockX

[social]
X Premium|x-premium|twitter-premium,twitter-blue,x
LinkedIn Premium|linkedin-premium|linkedin
Medium Membership|medium-membership|medium
Substack
The New York Times|the-new-york-times|new-york-times,nyt
The Wall Street Journal|the-wall-street-journal|wall-street-journal,wsj
The Washington Post|the-washington-post|washington-post
Bloomberg
The Economist|the-economist|economist
Financial Times|financial-times|ft
Patreon
Telegram Premium|telegram-premium|telegram
Snapchat+|snapchat-plus|snapchat
Reddit Premium|reddit-premium|reddit
Discord
Twitch
YouTube
Pinterest
TikTok
Instagram
Facebook
Messenger
WhatsApp
Threads
Signal
LINE
WeChat
Bumble Premium|bumble-premium|bumble
Tinder Gold|tinder-gold|tinder
HingeX|hingex|hinge
Grindr XTRA|grindr-xtra|grindr
OkCupid Premium|okcupid-premium|okcupid
Quora+|quora-plus
Flickr Pro|flickr-pro|flickr
Behance
Dribbble Pro|dribbble-pro|dribbble
VSCO
Letterboxd Patron|letterboxd-patron|letterboxd
Feedly Pro|feedly-pro|feedly
Mailchimp

[education]
Duolingo Super|duolingo-super|duolingo
Babbel
Rosetta Stone|rosetta-stone
Busuu Premium|busuu-premium|busuu
Memrise Pro|memrise-pro|memrise
Coursera Plus|coursera-plus|coursera
Udemy Personal Plan|udemy-personal-plan|udemy
Skillshare
MasterClass
Codecademy Pro|codecademy-pro|codecademy
Pluralsight
LinkedIn Learning|linkedin-learning
Brilliant
Quizlet Plus|quizlet-plus|quizlet
Chegg Study|chegg-study|chegg
Udacity
DataCamp
SoloLearn Pro|sololearn-pro|sololearn
Domestika Plus|domestika-plus|domestika
FutureLearn Unlimited|futurelearn-unlimited|futurelearn
edX
Mimo Pro|mimo-pro|mimo
Photomath Plus|photomath-plus|photomath
Study.com|study-com
Brainly Plus|brainly-plus|brainly
Lingoda
italki
Preply
Cambly
GoStudent

[health]
Headspace
Calm
Strava
Peloton
MyFitnessPal Premium|myfitnesspal-premium|myfitnesspal
Fitbod
Centr
Freeletics
Nike Training Club|nike-training-club
Oura
WHOOP|whoop
Noom
WeightWatchers|weight-watchers|ww
Flo Premium|flo-premium|flo
BetterHelp
Talkspace
Meditopia
Sleep Cycle Premium|sleep-cycle-premium|sleep-cycle
Zero Plus|zero-plus|zero
Down Dog|down-dog
FitOn Pro|fiton-pro|fiton
Sweat
Fabulous
Alo Moves|alo-moves
Zwift
AllTrails+|alltrails-plus|alltrails
Komoot Premium|komoot-premium|komoot
Garmin Connect+|garmin-connect-plus|garmin-connect
Lifesum Premium|lifesum-premium|lifesum
Fitbit Premium|fitbit-premium|fitbit

[travel]
Airbnb
Booking.com Genius|booking-com-genius|booking-com,booking
Expedia One Key|expedia-one-key|expedia
Hotels.com Rewards|hotels-com-rewards|hotels-com
Trip.com|trip-com
Hopper
Omio
Trainline
Uber
Zipcar
Turo
Sixt+|sixt-plus|sixt
Hertz Gold Plus Rewards|hertz-gold-plus-rewards|hertz
Avis Preferred|avis-preferred|avis
Delta SkyMiles|delta-skymiles|delta
United MileagePlus|united-mileageplus|united
American Airlines AAdvantage|american-airlines-aadvantage|american-airlines
Southwest Rapid Rewards|southwest-rapid-rewards|southwest
Emirates Skywards|emirates-skywards|emirates
Ryanair Prime|ryanair-prime|ryanair
Wizz Discount Club|wizz-discount-club|wizz-air
easyJet Plus|easyjet-plus|easyjet
Priority Pass|priority-pass
Marriott Bonvoy|marriott-bonvoy|marriott
Hilton Honors|hilton-honors|hilton
World of Hyatt|world-of-hyatt|hyatt
Accor Live Limitless|accor-live-limitless|accor
Airalo
Klook Pass|klook-pass|klook
GetYourGuide Plus|getyourguide-plus|getyourguide

[cloud]
Google Drive|google-drive
OneDrive
iCloud Drive|icloud-drive
Dropbox Backup|dropbox-backup
Sync.com|sync-com
pCloud Drive|pcloud-drive
MEGA|mega
Tresorit
Backblaze B2|backblaze-b2
IDrive
Nextcloud
ownCloud|owncloud
Egnyte
Wasabi Cloud|wasabi-cloud
Seafile
`;

const STOP_WORDS = new Set([
  "the",
  "and",
  "plus",
  "premium",
  "pro",
  "one",
  "tv",
  "video",
  "music",
  "cloud",
  "drive",
  "mail",
  "vpn",
  "app",
  "apps",
  "for",
  "of",
  "club",
  "pass",
  "plan",
  "membership",
  "member",
  "extra",
  "ultimate",
  "studio",
  "family",
  "business",
  "personal",
  "rewards",
  "gold",
  "standard",
]);

const PLAN_TOKENS = new Set([
  "basic",
  "business",
  "club",
  "core",
  "duo",
  "essential",
  "essentials",
  "extra",
  "family",
  "gold",
  "individual",
  "lite",
  "max",
  "member",
  "membership",
  "pass",
  "personal",
  "plan",
  "plus",
  "premium",
  "pro",
  "reserve",
  "standard",
  "starter",
  "student",
  "super",
  "team",
  "turbo",
  "ultimate",
  "unlimited",
]);

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ")
    .replace(/['.]/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function slugify(value) {
  return normalizeText(value)
    .replace(/\band\b/g, "and")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function compactSlug(slug) {
  return slug.replace(/-and-/g, "").replace(/-/g, "");
}

function stripPlanTokens(slug) {
  return slug
    .split("-")
    .filter((token) => token && !PLAN_TOKENS.has(token))
    .join("-");
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function hslToHex(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const light = Math.max(0, Math.min(100, l)) / 100;
  const chroma = (1 - Math.abs(2 * light - 1)) * sat;
  const sector = hue / 60;
  const x = chroma * (1 - Math.abs((sector % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (sector >= 0 && sector < 1) {
    red = chroma;
    green = x;
  } else if (sector < 2) {
    red = x;
    green = chroma;
  } else if (sector < 3) {
    green = chroma;
    blue = x;
  } else if (sector < 4) {
    green = x;
    blue = chroma;
  } else if (sector < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const match = light - chroma / 2;
  const toHex = (channel) =>
    Math.round((channel + match) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getInitials(name) {
  const capitalized = String(name).match(/[A-Z0-9]/g) ?? [];
  if (capitalized.length >= 2) {
    return capitalized.slice(0, 2).join("");
  }

  const tokens = normalizeText(name)
    .split(" ")
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token));

  if (tokens.length === 0) {
    return normalizeText(name).slice(0, 2).toUpperCase() || "CM";
  }

  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }

  const first = tokens[0][0] ?? "";
  const second = tokens[1][0] ?? "";
  return `${first}${second}`.toUpperCase();
}

function buildPalette(slug, category) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.generic;
  const hash = hashString(slug);
  const hue = (meta.hue + (hash % 18) - 9 + 360) % 360;
  const accent = hslToHex(hue, meta.sat, meta.light + ((hash >> 3) % 7) - 3);
  const accent2 = hslToHex(hue + 20, Math.max(meta.sat - 8, 35), Math.max(meta.light - 16, 28));
  const glow = hslToHex(hue + 6, Math.min(meta.sat + 8, 92), Math.min(meta.light + 10, 74));
  const base = hslToHex(hue + 8, 44, 16);
  const base2 = hslToHex(hue + 18, 52, 10);
  return { accent, accent2, glow, base, base2 };
}

function renderIcon({ name, slug, category, motifOverride, labelOverride }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.generic;
  const { accent, accent2, glow, base, base2 } = buildPalette(slug, category);
  const initials = labelOverride ?? getInitials(name);
  const fontSize = initials.length === 1 ? 23 : initials.length === 2 ? 18 : 14;
  const letterSpacing = initials.length === 1 ? ".5" : "1.2";
  const motif = motifOverride ?? meta.motif;
  const title = escapeXml(name);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><title>${title}</title><defs><linearGradient id="g" x1="7" y1="4" x2="58" y2="60"><stop stop-color="${accent}"/><stop offset="1" stop-color="${accent2}"/></linearGradient><linearGradient id="s" x1="10" y1="4" x2="34" y2="28"><stop stop-color="#FFFFFF" stop-opacity=".18"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient></defs><rect width="64" height="64" rx="18" fill="${base2}"/><rect x="3" y="3" width="58" height="58" rx="15" fill="url(#g)"/><path d="M7 10C17 -1 39 -1 57 10V3H7v7Z" fill="url(#s)"/><circle cx="51" cy="14" r="8" fill="${glow}" fill-opacity=".22"/><circle cx="14" cy="53" r="10" fill="#041019" fill-opacity=".24"/><g fill="#F8FAFC" fill-opacity=".18">${motif}</g><path d="M11 47h21" stroke="#FFFFFF" stroke-opacity=".18" stroke-width="4" stroke-linecap="round"/><text x="32" y="35" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="${letterSpacing}" fill="#F8FAFC">${escapeXml(initials)}</text><rect x="3.5" y="3.5" width="57" height="57" rx="14.5" stroke="#FFFFFF" stroke-opacity=".12"/></svg>`;
}

function parseServices() {
  let currentCategory = "";
  const services = [];

  for (const rawLine of SERVICE_SOURCE.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("[") && line.endsWith("]")) {
      currentCategory = line.slice(1, -1).trim();
      if (!CATEGORY_META[currentCategory]) {
        throw new Error(`Unknown category "${currentCategory}" in service source`);
      }
      continue;
    }

    const [name, slugOverride = "", aliasSource = ""] = line.split("|").map((part) => part.trim());
    if (!name || !currentCategory) {
      throw new Error(`Invalid service line "${line}"`);
    }

    const slug = slugOverride ? slugify(slugOverride) : slugify(name);
    const aliases = aliasSource
      ? aliasSource
          .split(",")
          .map((alias) => alias.trim())
          .filter(Boolean)
      : [];

    services.push({
      name,
      slug,
      category: currentCategory,
      aliases,
    });
  }

  const duplicateSlugs = new Map();
  for (const service of services) {
    duplicateSlugs.set(service.slug, (duplicateSlugs.get(service.slug) ?? 0) + 1);
  }

  const conflicts = [...duplicateSlugs.entries()].filter(([, count]) => count > 1);
  if (conflicts.length > 0) {
    throw new Error(`Duplicate slugs found: ${conflicts.map(([slug]) => slug).join(", ")}`);
  }

  return services.sort((left, right) => left.slug.localeCompare(right.slug));
}

function createRegistrySource(services, fallbacks) {
  const serviceEntries = services.map((service) => ({
    slug: service.slug,
    label: service.name,
    src: `/icons/services/${service.slug}.svg`,
    kind: "service",
    category: service.category,
    accent: buildPalette(service.slug, service.category).accent,
    aliases: service.aliases,
  }));

  const fallbackEntries = fallbacks.map((fallback) => ({
    slug: fallback.slug,
    label: fallback.label,
    src: `/icons/services/fallback-${fallback.slug}.svg`,
    kind: "fallback",
    category: fallback.slug,
    accent: buildPalette(`fallback-${fallback.slug}`, fallback.slug).accent,
  }));

  return `// Generated by npm run generate:service-icons

function normalize(value?: string | null) {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/\\([^)]*\\)/g, " ")
    .replace(/\\+/g, " plus ")
    .replace(/&/g, " and ")
    .replace(/['.]/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\\s+/g, " ")
    .toLowerCase();
}

function slugify(value?: string | null) {
  return normalize(value)
    .replace(/\\band\\b/g, "and")
    .replace(/\\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const PLAN_TOKENS = new Set(${JSON.stringify([...PLAN_TOKENS].sort())});

export interface ServiceIconEntry {
  slug: string;
  label: string;
  src: string;
  kind: "service" | "fallback";
  category?: string;
  accent: string;
  aliases?: string[];
}

export const SERVICE_ICON_ENTRIES: ServiceIconEntry[] = ${JSON.stringify(serviceEntries, null, 2)};

export const FALLBACK_ICON_ENTRIES: ServiceIconEntry[] = ${JSON.stringify(fallbackEntries, null, 2)};

const ALL_ICON_ENTRIES = [...SERVICE_ICON_ENTRIES, ...FALLBACK_ICON_ENTRIES];

export const SERVICE_ICON_REGISTRY = Object.freeze(
  Object.fromEntries(ALL_ICON_ENTRIES.map((entry) => [entry.slug, entry])),
) as Readonly<Record<string, ServiceIconEntry>>;

const LOOKUP_TO_SLUG = new Map<string, string>();

function registerLookup(rawValue: string | undefined, slug: string) {
  if (!rawValue) return;

  const normalized = normalize(rawValue);
  const slugValue = slugify(rawValue);
  const compact = slugValue.replace(/-and-/g, "").replace(/-/g, "");
  const stripped = slugValue
    .split("-")
    .filter((token) => token && !PLAN_TOKENS.has(token))
    .join("-");
  const values = [normalized, slugValue, compact, stripped, stripped.replace(/-/g, "")];

  for (const value of values) {
    if (value && !LOOKUP_TO_SLUG.has(value)) {
      LOOKUP_TO_SLUG.set(value, slug);
    }
  }
}

for (const entry of SERVICE_ICON_ENTRIES) {
  registerLookup(entry.slug, entry.slug);
  registerLookup(entry.label, entry.slug);
  for (const alias of entry.aliases ?? []) {
    registerLookup(alias, entry.slug);
  }
}

const FALLBACK_BY_CATEGORY = Object.freeze(
  Object.fromEntries(FALLBACK_ICON_ENTRIES.map((entry) => [entry.category ?? "generic", entry])),
) as Readonly<Record<string, ServiceIconEntry>>;

export function getServiceIconBySlug(slug?: string | null) {
  if (!slug) return undefined;
  return SERVICE_ICON_REGISTRY[slugify(slug)];
}

function inferCategory(name: string, serviceGroup?: string | null, logoHint?: string | null) {
  const source = [normalize(name), normalize(serviceGroup), normalize(logoHint)].filter(Boolean).join(" ");
  if (/(video|movie|tv|stream|cinema|sports|anime)/.test(source)) return "streaming";
  if (/(music|audio|podcast|radio|book|audiobook)/.test(source)) return "music";
  if (/(game|gaming|arcade|esport|console)/.test(source)) return "gaming";
  if (/(developer|hosting|deploy|database|observability|analytics|devops|infrastructure|api|backend|frontend)/.test(source)) return "developer";
  if (/(ai|assistant|gpt|claude|copilot|llm|generative)/.test(source)) return "ai";
  if (/(design|workspace|notes|office|document|project|collaboration|productivity)/.test(source)) return "productivity";
  if (/(cloud|storage|drive|backup|sync)/.test(source)) return "cloud";
  if (/(vpn|security|privacy|password|antivirus|utility)/.test(source)) return "security";
  if (/(bank|finance|card|wallet|cash|budget|crypto|accounting|fintech|billing|invoice)/.test(source)) return "finance";
  if (/(mobile|carrier|telecom|internet|fiber|broadband|energy|utilities)/.test(source)) return "telecom";
  if (/(retail|delivery|grocery|food|shopping|ecommerce|marketplace)/.test(source)) return "retail";
  if (/(news|media|social|newsletter|dating|community|messaging)/.test(source)) return "social";
  if (/(education|learning|course|language|study|student)/.test(source)) return "education";
  if (/(fitness|wellness|health|meditation|therapy|nutrition|sleep)/.test(source)) return "health";
  if (/(travel|airline|hotel|mobility|transport|tourism)/.test(source)) return "travel";
  return "generic";
}

export function getServiceIdentity(name: string) {
  const trimmed = name.trim();
  const match = trimmed.match(/^(.*?)\\s+\\(([^)]+)\\)\\s*$/);

  if (!match) {
    return { serviceName: trimmed, planName: "" };
  }

  return {
    serviceName: match[1].trim(),
    planName: match[2].trim(),
  };
}

function findIconByRawValue(value?: string | null) {
  if (!value) return undefined;
  const normalized = normalize(value);
  const slug = slugify(value);
  const compact = slug.replace(/-and-/g, "").replace(/-/g, "");
  const stripped = slug
    .split("-")
    .filter((token) => token && !PLAN_TOKENS.has(token))
    .join("-");
  const variants = [normalized, slug, compact, stripped, stripped.replace(/-/g, "")];

  for (const variant of variants) {
    const matchedSlug = LOOKUP_TO_SLUG.get(variant);
    if (matchedSlug) {
      return SERVICE_ICON_REGISTRY[matchedSlug];
    }
  }

  return undefined;
}

export function findServiceIcon({
  name,
  logoHint,
  serviceGroup,
}: {
  name: string;
  logoHint?: string | null;
  serviceGroup?: string | null;
}) {
  const { serviceName } = getServiceIdentity(name);
  const directMatches = [
    findIconByRawValue(logoHint),
    getServiceIconBySlug(logoHint),
    findIconByRawValue(serviceName),
    findIconByRawValue(name),
  ].filter(Boolean) as ServiceIconEntry[];

  if (directMatches[0]) {
    return directMatches[0];
  }

  const category = inferCategory(name, serviceGroup, logoHint);
  return FALLBACK_BY_CATEGORY[category] ?? FALLBACK_BY_CATEGORY.generic;
}
`;
}

async function main() {
  const services = parseServices();
  const fallbackCategories = [
    "streaming",
    "music",
    "gaming",
    "productivity",
    "developer",
    "ai",
    "security",
    "finance",
    "telecom",
    "retail",
    "social",
    "education",
    "health",
    "travel",
    "cloud",
    "utility",
    "generic",
  ].map((slug) => ({
    slug,
    label: CATEGORY_META[slug]?.label ?? "Generic",
  }));

  await fs.mkdir(ICON_DIR, { recursive: true });

  for (const service of services) {
    await fs.writeFile(
      path.join(ICON_DIR, `${service.slug}.svg`),
      renderIcon(service),
      "utf8",
    );
  }

  for (const fallback of fallbackCategories) {
    await fs.writeFile(
      path.join(ICON_DIR, `fallback-${fallback.slug}.svg`),
      renderIcon({
        name: fallback.label,
        slug: `fallback-${fallback.slug}`,
        category: fallback.slug,
        labelOverride: fallback.slug === "generic" ? "CM" : getInitials(fallback.label),
      }),
      "utf8",
    );
  }

  await fs.mkdir(path.dirname(REGISTRY_PATH), { recursive: true });
  await fs.writeFile(
    REGISTRY_PATH,
    createRegistrySource(services, fallbackCategories),
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        generatedServiceIcons: services.length,
        fallbackIcons: fallbackCategories.length,
        totalSvgFilesWritten: services.length + fallbackCategories.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
