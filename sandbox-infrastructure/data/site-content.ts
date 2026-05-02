export const company = {
  name: "InfraNest Technologies",
  shortName: "InfraNest",
  email: process.env.NEXT_PUBLIC_FORMSPREE_FALLBACK_EMAIL ?? "info@infranests.com",
  phone: "(617) 555-0199",
  serviceArea: "Greater Boston, MA and remote support across the U.S.",
  linkedIn: "https://www.linkedin.com",
  schedulingNote: "Most inquiries receive a response within one business day.",
};

export const navigation = [
  { href: "/#hero", label: "Home", section: "hero" },
  { href: "/#services", label: "Services", section: "services" },
  { href: "/#about-preview", label: "About", section: "about-preview" },
  { href: "/contact", label: "Contact" },
];

export const homeContent = {
  eyebrow: "Managed IT for lean, growing teams",
  title: "Keep your technology reliable, secure, and ready to scale.",
  description:
    "InfraNest gives lean teams dependable IT operations, cloud infrastructure, web presence, and managed business support, without the overhead of building a full internal IT department.",
  primaryCta: { href: "/quote", label: "Request a quote" },
  secondaryCta: { href: "/services", label: "View services" },
  stats: [
    { value: "1 day", label: "Typical first response", icon: "clock" },
    { value: "End-to-end IT", label: "From daily operations to cloud infrastructure", icon: "grid" },
    { value: "Boston + US remote", label: "Local anchor, nationwide reach", icon: "globe" },
  ],
  trustPoints: [
    {
      title: "Hands-on support, real results",
      body: "InfraNest focuses on the day-to-day systems, access, support, and operational reliability that small businesses actually depend on.",
    },
    {
      title: "Cloud and platform fluency",
      body: "Infrastructure, SaaS administration, device support, and internal workflows all work better when one partner understands how they connect.",
    },
    {
      title: "Built for lean teams",
      body: "You get steady operational coverage and thoughtful recommendations without committing to a large internal IT hire too early.",
    },
  ],
  process: [
    {
      title: "Assess the current setup",
      body: "We start with your tools, recurring issues, support gaps, and near-term business needs.",
    },
    {
      title: "Stabilize the core operations",
      body: "We tighten support workflows, SaaS administration, access controls, and platform reliability.",
    },
    {
      title: "Support growth deliberately",
      body: "As the business grows, we help the systems, cloud footprint, and support model scale with it.",
    },
  ],
};

export const services = [
  {
    title: "IT Operations & Technology Management",
    description:
      "Structure, consistency, and efficiency across your entire technology environment.",
    bullets: [
      "IT process improvement and roadmap planning",
      "Documentation and SOP development",
      "Workflow optimization and automation",
      "Ticketing system setup and optimization",
    ],
  },
  {
    title: "Cloud & Platform Engineering",
    description:
      "Cloud, DevOps, and reliability engineering to modernize how your systems are built and operated.",
    bullets: [
      "Cloud architecture, migrations, and optimization",
      "Infrastructure as code and automation (Terraform, Ansible)",
      "Containers and Kubernetes enablement and operations",
      "CI/CD, monitoring, alerting, and reliability improvements",
    ],
  },
  {
    title: "SaaS & Workspace Administration",
    description:
      "Access, security, and productivity management for the tools your team depends on daily.",
    bullets: [
      "Google Workspace and Microsoft 365 administration",
      "User lifecycle and access management",
      "Permissions audits and security reviews",
      "License management and optimization",
    ],
  },
  {
    title: "Managed IT Services & Support",
    description:
      "Contract-friendly IT support for tickets, calls, and day-to-day business operations.",
    bullets: [
      "Help desk and ticket-based support",
      "Phone support and shared inbox coverage",
      "Device setup, onboarding, and lifecycle support",
      "Software, access management, and vendor coordination",
    ],
  },
  {
    title: "Workplace Technology & Collaboration",
    description:
      "Conference rooms, AV systems, and collaboration tools that keep teams connected.",
    bullets: [
      "Conference room AV setup and deployment",
      "Video conferencing configuration (Zoom, Meet, Teams)",
      "Collaboration hardware and software setup",
      "Ongoing workplace technology support",
    ],
  },
  {
    title: "Web Presence & Managed Hosting",
    description:
      "Helping small businesses get online with a clean site, reliable hosting, and ongoing updates.",
    bullets: [
      "Website design and build (simple, modern, fast)",
      "Hosting, DNS, SSL, and go-live setup",
      "Ongoing edits, updates, and content changes",
      "Performance, monitoring, and basic security maintenance",
    ],
  },
  {
    title: "Security & Access Foundations",
    description:
      "Practical security improvements that reduce risk without slowing the business down.",
    bullets: [
      "Access audits and least-privilege cleanup",
      "MFA, SSO, and identity hardening guidance",
      "Endpoint and device management standardization (MDM baseline)",
      "Security baseline reviews and improvement plan",
    ],
  },
  {
    title: "Flexible Engagement Models",
    description:
      "Support structured around how your business prefers to work: project-based, advisory, or ongoing.",
    bullets: [
      "Hourly consulting and advisory",
      "Project-based engagements",
      "Retainers and support contracts",
      "Scalable service relationships",
    ],
  },
];

export const aboutPreview = {
  reasons: [
    "Operator mindset for daily reliability",
    "Clear, business-first communication",
    "Built for lean teams before chaos hits",
  ],
};

export const aboutContent = {
  story:
    "InfraNest was shaped around a simple need: small businesses deserve technology operations that feel steady, thoughtful, and professional without having to overbuild too early.",
  pillars: [
    {
      title: "Operator mindset",
      body: "We care about the repeatable systems behind support, access, infrastructure, and internal business tools.",
    },
    {
      title: "Clear communication",
      body: "We translate technical work into practical business decisions so leaders always know what is happening and why.",
    },
    {
      title: "Long-term manageability",
      body: "The goal is not just to fix issues today. It is to leave the environment easier to support tomorrow.",
    },
  ],
};

export const contactDetails = [
  { label: "Email", value: company.email, href: `mailto:${company.email}` },
  { label: "Phone", value: company.phone, href: `tel:${company.phone.replace(/[^\d]/g, "")}` },
  { label: "Service area", value: company.serviceArea },
];

export const quoteOptions = [
  {
    value: "IT operations & technology management",
    badge: "IT",
  },
  {
    value: "Cloud & platform engineering",
    badge: "CL",
  },
  {
    value: "SaaS & workspace administration",
    badge: "SA",
  },
  {
    value: "Managed IT services & support",
    badge: "MS",
  },
  {
    value: "Workplace technology & collaboration",
    badge: "WC",
  },
  {
    value: "Web presence & managed hosting",
    badge: "WH",
  },
  {
    value: "Security & access foundations",
    badge: "SF",
  },
  {
    value: "Flexible engagement models",
    badge: "FE",
  },
];

export const budgetRanges = [
  "Under $1,000",
  "$1,000 - $3,000",
  "$3,000 - $7,500",
  "$7,500+",
  "Not sure yet",
];

export const timelineOptions = [
  "As soon as possible",
  "Within 2 weeks",
  "This month",
  "This quarter",
  "Just exploring",
];

export const serviceBestFor = [
  "Teams that need better IT structure, documented processes, and smoother day-to-day operations",
  "Businesses running on inconsistent or unreviewed cloud infrastructure that needs modernizing",
  "Companies with sprawling SaaS stacks and unclear access or license ownership",
  "Teams that need reliable, contract-friendly IT support without building an internal function",
  "Organizations setting up or upgrading conference rooms, AV systems, and collaboration tools",
  "Small businesses that need a clean, fast website with reliable hosting and ongoing updates",
  "Teams that want practical security improvements without slowing down day-to-day operations",
  "Businesses that prefer project-based, advisory, or ongoing support structured around their workflow",
];

export const testimonials = [
  {
    quote: "InfraNest cleaned up our Google Workspace and finally gave us consistent user offboarding. Feels like we have a real IT team for the first time.",
    name: "Operations Manager",
    company: "35-person consulting firm, Boston",
  },
  {
    quote: "We moved from reactive panic to a stable support model in about three weeks. Fast onboarding, clear communication throughout.",
    name: "Founder",
    company: "Digital agency, remote",
  },
  {
    quote: "Having one reliable point of contact for everything from device setup to cloud billing reviews has saved us more time than we expected.",
    name: "VP of Operations",
    company: "SaaS startup, Greater Boston",
  },
];

export const platforms = [
  "Google Workspace", "Microsoft 365", "AWS", "Azure",
  "Slack", "Zoom", "Okta", "Terraform",
  "GitHub", "Jamf", "Kubernetes", "Docker",
];

export const nextSteps = [
  { step: "Submit your message", detail: "Goes directly to InfraNest — no ticket queue, no bot." },
  { step: "Receive a direct reply", detail: "You'll hear back within one business day." },
  { step: "Define the right path", detail: "A short call to shape the engagement if there's a fit." },
];

export const faqItems = [
  {
    question: "How quickly does InfraNest respond?",
    answer: "Most new inquiries receive a reply within one business day. Ongoing clients have a direct line for faster turnaround on urgent issues.",
  },
  {
    question: "Do you require long-term contracts?",
    answer: "No. InfraNest offers flexible engagements. Managed support partnerships can be structured month-to-month or on a longer-term basis.",
  },
  {
    question: "Can I start with just one service?",
    answer: "Absolutely. Most clients start with the area of highest friction and expand coverage from there as the relationship develops.",
  },
  {
    question: "Do you work with businesses outside of Boston?",
    answer: "Yes. InfraNest is based in Greater Boston but supports teams remotely across the U.S. for most services.",
  },
  {
    question: "What size businesses do you work with?",
    answer: "InfraNest is built for small to mid-sized teams (typically 5 to 75 people) that need professional IT operations without a large internal function.",
  },
];
