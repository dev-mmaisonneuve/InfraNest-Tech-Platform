export const company = {
  name: "InfraNest Technologies",
  shortName: "InfraNest",
  email: process.env.NEXT_PUBLIC_FORMSPREE_FALLBACK_EMAIL ?? "info@infranests.com",
  phone: "(617) 302-7580",
  serviceArea: "Greater Boston, MA and remote support across the U.S.",
  schedulingNote: "Most inquiries receive a response within 24 hours.",
};

export const navigation = [
  { href: "/#hero", label: "Home", section: "hero" },
  // Services and About point at the full pages rather than homepage anchors:
  // both pages carry substantially more detail, and having the nav land on a
  // scroll position meant the same label went to two different places
  // depending on which page you clicked it from.
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
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
    { value: "24 hrs", label: "Typical response time", icon: "clock" },
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
  { value: "IT operations & technology management" },
  { value: "Cloud & platform engineering" },
  { value: "SaaS & workspace administration" },
  { value: "Managed IT services & support" },
  { value: "Workplace technology & collaboration" },
  { value: "Web presence & managed hosting" },
  { value: "Security & access foundations" },
  { value: "Flexible engagement models" },
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

/**
 * What a client can expect, stated in InfraNest's own voice.
 *
 * Deliberately not testimonials. Anonymous quotes attributed to unnamed people
 * read as invented, and the previous section undercut itself by explaining that
 * the quotes were only representative. These make the same points as claims we
 * stand behind rather than as words put in a customer's mouth.
 */
export const expectations = [
  {
    title: "A clear picture in the first week",
    body: "We start by mapping what you actually run: accounts, access, devices, and the issues that keep resurfacing. You get a straight assessment, not a sales document.",
  },
  {
    title: "One point of contact",
    body: "Device setup, SaaS administration, cloud questions, and vendor coordination all go to the same place, so nothing falls between providers.",
  },
  {
    title: "Fewer recurring problems",
    body: "The work targets causes rather than symptoms: consistent onboarding and offboarding, tidy access, and documentation your team can follow without us.",
  },
];

export const platforms = [
  "Google Workspace", "Microsoft 365", "AWS", "Azure",
  "Slack", "Zoom", "Okta", "Terraform",
  "GitHub", "Jamf", "Kubernetes", "Docker",
];

export const nextSteps = [
  { step: "Send your message", detail: "Tell us what you need help with and include any relevant details." },
  { step: "We review and reply", detail: "You'll hear back within 24 hours." },
  { step: "Discuss next steps", detail: "If a call makes sense, we'll schedule a short one to understand your needs and recommend a path forward." },
];

/**
 * Copy for the automatic acknowledgment sent to a visitor after they submit a form.
 *
 * Deliberately contains no field the visitor typed. The forms accept free text
 * from anyone, so reflecting it back would let the site be used to deliver a
 * message to a third party under the InfraNest domain.
 */
export const acknowledgment = {
  contact: {
    subject: "Thanks for contacting InfraNest Technologies",
    heading: "Thanks for reaching out.",
    body: "We've received your message and will follow up within 24 hours.",
  },
  quote: {
    subject: "Thanks for your quote request — InfraNest Technologies",
    heading: "Thanks for reaching out.",
    body: "We've received your quote request. We'll review the details and follow up within 24 hours with a suggested starting point.",
  },
  footer: "If you'd like to add anything in the meantime, simply reply to this email.",
  signOff: "Best,",
};

export const faqItems = [
  {
    question: "How quickly does InfraNest respond?",
    answer: "Most new inquiries receive a reply within 24 hours. Ongoing clients have a direct line for faster turnaround on urgent issues.",
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
