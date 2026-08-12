/**
 * Site constants.
 *
 * Anything with a Bengali counterpart carries it here rather than in the
 * dictionaries: these are facts about the library, not interface strings, and
 * the sitemap and metadata builders need them without a locale in hand.
 */
export const site = {
  name: "Cef 3 Book Bank",
  /**
   * The short form, for places the full name will not fit: the imprint line on
   * a grid-size cover, mostly. Not an abbreviation to use in prose.
   */
  nameLead: "Cef 3",
  nameBn: "সেফ ৩ বুক ব্যাংক",
  tagline: "Every page opens a new world",
  taglineBn: "প্রতিটি পৃষ্ঠা খুলে দেয় নতুন এক জগৎ",
  description:
    "Cef 3 Book Bank is a free public digital library. Browse, read in your browser, and download thousands of Bengali and English books — no account, no paywall.",
  descriptionBn:
    "সেফ ৩ বুক ব্যাংক একটি উন্মুক্ত ডিজিটাল গ্রন্থাগার। হাজারো বাংলা ও ইংরেজি বই পড়ুন ও ডাউনলোড করুন — বিনামূল্যে, কোনো অ্যাকাউন্ট ছাড়াই।",
  url: "https://cef3.example.org",
  email: "hello@cef3.example.org",
  phone: "+880 1700 000000",
  /**
   * Navigation is defined by route and dictionary key; the labels themselves
   * live in the dictionaries so a new language does not have to edit this file.
   */
  nav: [
    { href: "/books", key: "discover" },
    { href: "/categories", key: "categories" },
    { href: "/authors", key: "authors" },
    { href: "/about", key: "about" },
    { href: "/contact", key: "contact" },
  ],
  social: {
    facebook: "https://facebook.com",
    x: "https://x.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
  },
} as const;

export type NavKey = (typeof site.nav)[number]["key"];
