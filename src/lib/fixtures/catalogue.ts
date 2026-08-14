import type { Author, Book, BookStatus, Category } from "@/types";

/**
 * Catalogue fixtures for the Pediatric Book Bank.
 *
 * A compact seed list is expanded into full `Book` records by `buildBook`
 * below, so the verified metadata stays readable and the derived fields
 * (codes, shelves, counts) stay internally consistent.
 *
 * Everything here is deterministic — no Math.random — so server and client
 * renders always agree and there are no hydration mismatches.
 *
 * All metadata was read off the files themselves (pdfinfo + the copyright page
 * via pdftotext), not from the file names — several file names are wrong. The
 * discrepancy is noted per book where it matters.
 */

export const categories: Category[] = [
  {
    id: "cat-general-pediatrics",
    slug: "general-pediatrics",
    name: "General Pediatrics",
    nameBn: "সাধারণ শিশুরোগবিদ্যা",
    description:
      "Comprehensive textbooks covering the full breadth of clinical paediatrics — diagnosis, management and the evidence behind it.",
    descriptionBn:
      "শিশুরোগবিদ্যার সামগ্রিক পাঠ্যপুস্তক — রোগনির্ণয়, চিকিৎসা ব্যবস্থাপনা ও তার প্রমাণভিত্তি।",
    icon: "Stethoscope",
    bookCount: 0,
  },
  {
    id: "cat-neonatology",
    slug: "neonatology",
    name: "Neonatology",
    nameBn: "নবজাতক চিকিৎসা",
    description:
      "Clinical references for the newborn — intensive care, pharmacology and the first year of life.",
    descriptionBn:
      "নবজাতকের জন্য চিকিৎসা তথ্যসূত্র — নিবিড় পরিচর্যা, ওষুধবিদ্যা ও জীবনের প্রথম বছর।",
    icon: "Baby",
    bookCount: 0,
  },
  {
    id: "cat-infectious-disease",
    slug: "infectious-disease",
    name: "Infectious Disease",
    nameBn: "সংক্রামক ব্যাধি",
    description:
      "Antimicrobial therapy and the full reference for paediatric infectious diseases.",
    descriptionBn:
      "অ্যান্টিমাইক্রোবিয়াল চিকিৎসা এবং শিশুদের সংক্রামক রোগের সম্পূর্ণ তথ্যসূত্র।",
    icon: "Bug",
    bookCount: 0,
  },
  {
    id: "cat-subspecialties",
    slug: "subspecialties",
    name: "Subspecialties & Atlases",
    nameBn: "বিশেষায়িত শাখা ও চিত্রকোষ",
    description:
      "Nephrology, ophthalmology, dermatology, neurology and visual atlases across the paediatric subspecialties.",
    descriptionBn:
      "বৃক্করোগ, চক্ষুরোগ, চর্মরোগ, স্নায়ুরোগ এবং শিশুরোগের বিশেষায়িত শাখার চিত্রকোষ।",
    icon: "Microscope",
    bookCount: 0,
  },
  {
    id: "cat-reviews",
    slug: "reviews",
    name: "Reviews, Cases & Exam Prep",
    nameBn: "রিভিউ, কেস ও পরীক্ষা প্রস্তুতি",
    description:
      "Question banks, case-based learning and exam-preparation tools for paediatric trainees.",
    descriptionBn:
      "প্রশ্নসংকলন, কেস-ভিত্তিক শিক্ষা ও শিশুরোগ প্রশিক্ষণার্থীদের পরীক্ষা প্রস্তুতির সরঞ্জাম।",
    icon: "ClipboardList",
    bookCount: 0,
  },
  {
    id: "cat-clinical-reference",
    slug: "clinical-reference",
    name: "Clinical Reference",
    nameBn: "চিকিৎসা তথ্যসূত্র",
    description:
      "Broad clinical references for internal medicine and general practice — the bedside companions.",
    descriptionBn:
      "অভ্যন্তরীণ চিকিৎসা ও সাধারণ অনুশীলনের জন্য বিস্তৃত ক্লিনিক্যাল তথ্যসূত্র।",
    icon: "Library",
    bookCount: 0,
  },
];

export const authors: Author[] = [
  {
    id: "a-kliegman",
    slug: "robert-kliegman",
    name: "Robert M. Kliegman",
    nameBn: "রবার্ট এম. ক্লিগম্যান",
    bio: "Professor and former Chair of Pediatrics at the Medical College of Wisconsin and lead editor of Nelson Textbook of Pediatrics across multiple editions.",
    bioBn:
      "উইসকনসিন মেডিকেল কলেজের শিশুরোগবিদ্যার অধ্যাপক ও সাবেক বিভাগীয় প্রধান এবং নেলসন টেক্সটবুক অব পেডিয়াট্রিক্স-এর একাধিক সংস্করণের প্রধান সম্পাদক।",
    bookCount: 0,
  },
  /**
   * Corporate author. The Harriet Lane Handbook has been compiled by the
   * paediatric house staff at Johns Hopkins across twenty-four editions; no
   * single editor stands in as the author. No `era` — an institution has no
   * birth or death dates.
   */
  {
    id: "a-jhh",
    slug: "johns-hopkins-hospital",
    name: "Johns Hopkins Hospital",
    nameBn: "জনস হপকিন্স হসপিটাল",
    bio: "The Baltimore teaching hospital whose paediatric house staff have compiled the Harriet Lane Handbook since 1953. The twenty-fourth edition (2027) was edited by Tolulope Fatola, Jillian Heckman and Nathaniel Silvestri.",
    bioBn:
      "বাল্টিমোরের শিক্ষাদানকারী হাসপাতাল, যার শিশুরোগ বিভাগের চিকিৎসকেরা ১৯৫৩ সাল থেকে হ্যারিয়েট লেন হ্যান্ডবুক সংকলন করে আসছেন। চব্বিশতম সংস্করণ (২০২৭) সম্পাদনা করেছেন তোলুলোপে ফাতোলা, জিলিয়ান হেকম্যান ও নাথানিয়েল সিলভেস্ট্রি।",
    bookCount: 0,
  },
  {
    id: "a-gomella",
    slug: "tricia-lacy-gomella",
    name: "Tricia Lacy Gomella",
    nameBn: "ট্রিসিয়া লেসি গোমেল্লা",
    bio: "Neonatologist at Johns Hopkins and primary author of Gomella's Neonatology, the standard clinical reference for newborn intensive care.",
    bioBn:
      "জনস হপকিন্সের নিওনাটোলজিস্ট এবং গোমেল্লার নিওনাটোলজির প্রধান লেখক, যা নবজাতক নিবিড় পরিচর্যার মানক ক্লিনিক্যাল তথ্যসূত্র।",
    bookCount: 0,
  },
  {
    id: "a-hay",
    slug: "william-hay",
    name: "William W. Hay Jr",
    nameBn: "উইলিয়াম ডব্লিউ. হেই জুনিয়র",
    bio: "Professor of Paediatrics at the University of Colorado and lead editor of CURRENT Diagnosis & Treatment: Pediatrics.",
    bioBn:
      "কলোরাডো বিশ্ববিদ্যালয়ের শিশুরোগবিদ্যার অধ্যাপক এবং CURRENT ডায়াগনোসিস ও ট্রিটমেন্ট: পেডিয়াট্রিক্স-এর প্রধান সম্পাদক।",
    bookCount: 0,
  },
  {
    id: "a-eichenwald",
    slug: "eric-eichenwald",
    name: "Eric C. Eichenwald",
    nameBn: "এরিক সি. আইখেনওয়াল্ড",
    bio: "Chief of Newborn Services at Children's Hospital of Philadelphia and lead editor of Cloherty and Stark's Manual of Neonatal Care.",
    bioBn:
      "ফিলাডেলফিয়া চিলড্রেন্স হাসপাতালের নবজাতক বিভাগের প্রধান এবং ক্লোহার্টি ও স্টার্কের ম্যানুয়াল অব নিওনেটাল কেয়ার-এর প্রধান সম্পাদক।",
    bookCount: 0,
  },
  {
    id: "a-strachan",
    slug: "mark-strachan",
    name: "Mark W. J. Strachan",
    nameBn: "মার্ক ডব্লিউ. জে. স্ট্রাচান",
    bio: "Consultant physician and endocrinologist at the Western General Hospital, Edinburgh, and co-editor of Davidson's Principles and Practice of Medicine.",
    bioBn:
      "এডিনবরার ওয়েস্টার্ন জেনারেল হাসপাতালের পরামর্শদাতা চিকিৎসক ও এন্ডোক্রিনোলজিস্ট এবং ডেভিডসনের প্রিন্সিপলস অ্যান্ড প্র্যাকটিস অব মেডিসিন-এর সহ-সম্পাদক।",
    bookCount: 0,
  },
  /**
   * Corporate author. AAP publishes both the PREP self-assessment series and
   * Nelson's Pediatric Antimicrobial Therapy under its own name.
   */
  {
    id: "a-aap",
    slug: "american-academy-of-pediatrics",
    name: "American Academy of Pediatrics",
    nameBn: "আমেরিকান একাডেমি অব পেডিয়াট্রিক্স",
    bio: "The professional organisation representing 67,000 paediatricians in the United States. Publisher of the PREP self-assessment series and Nelson's Pediatric Antimicrobial Therapy.",
    bioBn:
      "মার্কিন যুক্তরাষ্ট্রের ৬৭,০০০ শিশুরোগ বিশেষজ্ঞের পেশাদার সংস্থা। PREP স্ব-মূল্যায়ন সিরিজ এবং নেলসনের পেডিয়াট্রিক অ্যান্টিমাইক্রোবিয়াল থেরাপির প্রকাশক।",
    bookCount: 0,
  },
  {
    id: "a-marcdante",
    slug: "karen-marcdante",
    name: "Karen J. Marcdante",
    nameBn: "কারেন জে. মার্কড্যান্টে",
    bio: "Professor of Paediatrics at the Medical College of Wisconsin and lead editor of Nelson Essentials of Pediatrics.",
    bioBn:
      "উইসকনসিন মেডিকেল কলেজের শিশুরোগবিদ্যার অধ্যাপক এবং নেলসন এসেনশিয়ালস অব পেডিয়াট্রিক্স-এর প্রধান সম্পাদক।",
    bookCount: 0,
  },
  {
    id: "a-kher",
    slug: "kanwal-kher",
    name: "Kanwal K. Kher",
    nameBn: "কানওয়াল কে. খের",
    bio: "Paediatric nephrologist and lead editor of Clinical Pediatric Nephrology, the standard reference in the subspecialty.",
    bioBn:
      "শিশু বৃক্করোগ বিশেষজ্ঞ এবং ক্লিনিক্যাল পেডিয়াট্রিক নেফ্রোলজির প্রধান সম্পাদক।",
    bookCount: 0,
  },
  {
    id: "a-zitelli",
    slug: "basil-zitelli",
    name: "Basil J. Zitelli",
    nameBn: "বাসিল জে. জিটেলি",
    bio: "Emeritus professor of paediatrics at the University of Pittsburgh and founding editor of the Atlas of Pediatric Physical Diagnosis.",
    bioBn:
      "পিটসবার্গ বিশ্ববিদ্যালয়ের শিশুরোগবিদ্যার ইমেরিটাস অধ্যাপক এবং অ্যাটলাস অব পেডিয়াট্রিক ফিজিক্যাল ডায়াগনোসিসের প্রতিষ্ঠাতা সম্পাদক।",
    bookCount: 0,
  },
  {
    id: "a-kristal",
    slug: "leonard-kristal",
    name: "Leonard Kristal",
    nameBn: "লিওনার্ড ক্রিস্টাল",
    bio: "Clinical associate professor of dermatology at SUNY Stony Brook and co-author of Weinberg's Color Atlas of Pediatric Dermatology.",
    bioBn:
      "SUNY স্টোনি ব্রুকের চর্মরোগবিদ্যার ক্লিনিক্যাল সহযোগী অধ্যাপক এবং ওয়েইনবার্গের কালার অ্যাটলাস অব পেডিয়াট্রিক ডার্মাটোলজির সহ-লেখক।",
    bookCount: 0,
  },
  /**
   * Corporate author. AAO's BCSC series is produced under the Academy's name
   * with rotating editorial committees; no individual editor is credited on
   * the cover.
   */
  {
    id: "a-aao",
    slug: "american-academy-of-ophthalmology",
    name: "American Academy of Ophthalmology",
    nameBn: "আমেরিকান একাডেমি অব অপথালমোলজি",
    bio: "Publisher of the Basic and Clinical Science Course (BCSC), the ophthalmic residency curriculum. Section 6 covers Pediatric Ophthalmology and Strabismus.",
    bioBn:
      "বেসিক অ্যান্ড ক্লিনিক্যাল সায়েন্স কোর্সের (BCSC) প্রকাশক, যা চক্ষুরোগ রেসিডেন্সি পাঠ্যক্রম। সেকশন ৬ পেডিয়াট্রিক অপথালমোলজি ও স্ট্র্যাবিসমাস বিষয়ক।",
    bookCount: 0,
  },
  {
    id: "a-hasan",
    slug: "rashed-hasan",
    name: "Rashed A. Hasan",
    nameBn: "রাশেদ এ. হাসান",
    bio: "Paediatric intensivist and lead author of Pediatric Critical Care Review, a case-based board preparation text.",
    bioBn:
      "শিশু ক্রিটিক্যাল কেয়ার বিশেষজ্ঞ এবং পেডিয়াট্রিক ক্রিটিক্যাল কেয়ার রিভিউ-এর প্রধান লেখক।",
    bookCount: 0,
  },
  {
    id: "a-cheung",
    slug: "ronny-cheung",
    name: "Ronny Cheung",
    nameBn: "রনি চেউং",
    bio: "Paediatric consultant and lead author of 100 Cases in Paediatrics, a case-based learning resource for undergraduates and junior doctors.",
    bioBn:
      "শিশুরোগ পরামর্শদাতা এবং ১০০ কেসেস ইন পেডিয়াট্রিক্স-এর প্রধান লেখক।",
    bookCount: 0,
  },
  {
    id: "a-ainsworth",
    slug: "sean-ainsworth",
    name: "Sean Ainsworth",
    nameBn: "শন এইনসওয়ার্থ",
    bio: "Consultant neonatologist at Victoria Hospital, Kirkcaldy, and lead editor of Neonatal Formulary, the reference for drug use in pregnancy and the first year of life.",
    bioBn:
      "কিরকালডির ভিক্টোরিয়া হাসপাতালের পরামর্শদাতা নিওনাটোলজিস্ট এবং নিওনেটাল ফর্মুলারির প্রধান সম্পাদক।",
    bookCount: 0,
  },
  {
    id: "a-cherry",
    slug: "james-cherry",
    name: "James D. Cherry",
    nameBn: "জেমস ডি. চেরি",
    bio: "Distinguished professor of paediatric infectious diseases at UCLA and founding editor of Feigin and Cherry's Textbook of Pediatric Infectious Diseases.",
    bioBn:
      "UCLA-র শিশু সংক্রামক রোগবিদ্যার বিশিষ্ট অধ্যাপক এবং ফেইগিন ও চেরির টেক্সটবুক অব পেডিয়াট্রিক ইনফেকশাস ডিজিজেস-এর প্রতিষ্ঠাতা সম্পাদক।",
    bookCount: 0,
  },
  {
    id: "a-bale",
    slug: "james-bale",
    name: "James F. Bale Jr",
    nameBn: "জেমস এফ. বেল জুনিয়র",
    bio: "Professor of paediatric neurology at the University of Utah and lead author of Pediatric Neurology: A Color Handbook.",
    bioBn:
      "ইউটা বিশ্ববিদ্যালয়ের শিশু স্নায়ুরোগবিদ্যার অধ্যাপক এবং পেডিয়াট্রিক নিউরোলজি: এ কালার হ্যান্ডবুকের প্রধান লেখক।",
    bookCount: 0,
  },
  {
    id: "a-passi",
    slug: "gouri-rao-passi",
    name: "Gouri Rao Passi",
    nameBn: "গৌরী রাও পাসি",
    bio: "Paediatric neurologist at Choithram Hospital, Indore, and author of Algorithms in Pediatric Neurology, a decision-tree guide for trainees.",
    bioBn:
      "ইন্দোরের চৈতরাম হাসপাতালের শিশু স্নায়ুরোগ বিশেষজ্ঞ এবং অ্যালগরিদমস ইন পেডিয়াট্রিক নিউরোলজির লেখক।",
    bookCount: 0,
  },
  {
    id: "a-loscalzo",
    slug: "joseph-loscalzo",
    name: "Joseph Loscalzo",
    nameBn: "জোসেফ লোসকালজো",
    bio: "Hersey Professor of the Theory and Practice of Medicine at Harvard Medical School and editor-in-chief of Harrison's Principles of Internal Medicine.",
    bioBn:
      "হার্ভার্ড মেডিকেল স্কুলের চিকিৎসাবিদ্যার অধ্যাপক এবং হ্যারিসনস প্রিন্সিপলস অব ইন্টার্নাল মেডিসিনের প্রধান সম্পাদক।",
    bookCount: 0,
  },
];

/**
 * A book that has a real file behind it.
 *
 * All fields are present for every one of the 20 real titles.
 * `isbn` is optional because four books have no readable ISBN, and a
 * fabricated one on a downloadable file is worse than none.
 */
interface SeedFile {
  /**
   * The file's name in private storage — the slug-named symlink in
   * `private/books/`. Never a URL a browser could ask for: the file is
   * reached only through `/api/file/[slug]`, which checks for an account
   * first.
   */
  url: string;
  sizeMb: number;
  isbn?: string;
  /** ISO date. Real uploads sort by when they actually landed. */
  addedAt: string;
  uploadedBy?: string;
}

/** Seed tuple: keeps the fixture list scannable. */
interface Seed {
  title: string;
  titleBn?: string;
  authorId: string;
  categoryId: string;
  year: number;
  publisher: string;
  pages: number;
  description: string;
  descriptionBn?: string;
  featured?: boolean;
  status?: BookStatus;
  /** Cover hue in degrees; drives the 3D spine and fallback generated art. */
  hue: number;
  /** Edition label as printed on the copyright page. */
  edition?: string;
  /**
   * Served path to the real cover WebP built by `scripts/build-covers.mjs`.
   * Present for all 20 real books.
   */
  coverImage?: string;
  /**
   * Language is always explicit here — `buildBook` no longer infers it from
   * `titleBn`. These are English-language books that happen to have Bengali
   * display titles. The `?language=bn` filter legitimately returns nothing.
   */
  language: "bn" | "en";
  file: SeedFile;
}

const seeds: Seed[] = [
  // ── 01 Nelson Textbook of Pediatrics ─────────────────────────────────────
  {
    title: "Nelson Textbook of Pediatrics",
    titleBn: "নেলসন টেক্সটবুক অব পেডিয়াট্রিক্স",
    authorId: "a-kliegman",
    categoryId: "cat-general-pediatrics",
    year: 2025,
    publisher: "Elsevier",
    pages: 4535,
    edition: "22nd",
    coverImage: "/covers/nelson-textbook-of-pediatrics.webp",
    language: "en",
    description:
      "The definitive two-volume reference in paediatrics, covering every subspecialty from neonatology to adolescent medicine. Twenty-second edition, edited by Kliegman, St Geme, Blum, Tasker, Wilson, Schuh and Mack.",
    descriptionBn:
      "শিশুরোগবিদ্যার নির্ধারক দুই-খণ্ডের তথ্যসূত্র — নবজাতক থেকে কিশোর চিকিৎসা পর্যন্ত প্রতিটি বিশেষায়িত শাখা অন্তর্ভুক্ত। বাইশতম সংস্করণ।",
    featured: true,
    hue: 210,
    file: {
      url: "/books/nelson-textbook-of-pediatrics.pdf",
      sizeMb: 154.1,
      isbn: "978-0-323-88305-4",
      addedAt: "2026-08-14",
    },
  },

  // ── 02 The Harriet Lane Handbook ─────────────────────────────────────────
  {
    title: "The Harriet Lane Handbook",
    titleBn: "হ্যারিয়েট লেন হ্যান্ডবুক",
    authorId: "a-jhh",
    categoryId: "cat-clinical-reference",
    year: 2027,
    publisher: "Elsevier",
    pages: 1549,
    edition: "24th",
    coverImage: "/covers/the-harriet-lane-handbook.webp",
    language: "en",
    description:
      "The paediatric house officer's pocket reference, compiled at the Johns Hopkins Children's Center since 1953. Twenty-fourth edition (© 2027), edited by Tolulope Fatola, Jillian Heckman and Nathaniel Silvestri. Covers assessment and procedures, emergency management, growth and development, and a full drug formulary.",
    descriptionBn:
      "শিশুরোগ চিকিৎসকদের হাতের কাছে রাখার তথ্যসূত্র — ১৯৫৩ সাল থেকে জনস হপকিন্স চিলড্রেন্স সেন্টারে সংকলিত। চব্বিশতম সংস্করণ (© ২০২৭)।",
    featured: true,
    hue: 337,
    file: {
      url: "/books/the-harriet-lane-handbook.pdf",
      sizeMb: 17.1,
      isbn: "978-0-443-28751-0",
      addedAt: "2026-08-14",
    },
  },

  // ── 03 Gomella's Neonatology ──────────────────────────────────────────────
  {
    title: "Gomella's Neonatology",
    titleBn: "গোমেল্লার নিওনাটোলজি",
    authorId: "a-gomella",
    categoryId: "cat-neonatology",
    year: 2020,
    publisher: "McGraw Hill",
    pages: 1474,
    edition: "8th",
    coverImage: "/covers/gomellas-neonatology.webp",
    language: "en",
    description:
      "The standard clinical reference for neonatal intensive care, covering diagnosis, management and pharmacology of newborn conditions. Eighth edition in the LANGE series.",
    descriptionBn:
      "নবজাতক নিবিড় পরিচর্যার মানক ক্লিনিক্যাল তথ্যসূত্র — নবজাতকের রোগনির্ণয়, চিকিৎসা ও ওষুধবিদ্যা। LANGE সিরিজের অষ্টম সংস্করণ।",
    featured: true,
    hue: 96,
    file: {
      url: "/books/gomellas-neonatology.pdf",
      sizeMb: 30.2,
      isbn: "978-1-259-64481-8",
      addedAt: "2026-08-14",
    },
  },

  // ── 04 CURRENT Diagnosis & Treatment: Pediatrics ──────────────────────────
  // File name says "CURRENT Diagnosis and Treatment of Pediatric".
  // The PDF is the 23rd edition (2016). The supplied cover image shows the
  // 27th edition — cover was rendered from the PDF instead.
  {
    title: "CURRENT Diagnosis & Treatment: Pediatrics",
    titleBn: "কারেন্ট ডায়াগনোসিস ও ট্রিটমেন্ট: পেডিয়াট্রিক্স",
    authorId: "a-hay",
    categoryId: "cat-general-pediatrics",
    year: 2016,
    publisher: "McGraw-Hill Education",
    pages: 1504,
    edition: "23rd",
    coverImage: "/covers/current-diagnosis-treatment-pediatrics.webp",
    language: "en",
    description:
      "A comprehensive single-volume clinical reference for paediatric diagnosis and management across all organ systems. Twenty-third edition (2016); note the cover was rendered from the PDF — the file name and supplied image both reference a different edition.",
    descriptionBn:
      "শিশুরোগ নির্ণয় ও চিকিৎসার সামগ্রিক একক-খণ্ড তথ্যসূত্র। তেইশতম সংস্করণ (২০১৬)।",
    hue: 28,
    file: {
      url: "/books/current-diagnosis-treatment-pediatrics.pdf",
      sizeMb: 212.7,
      isbn: "978-1-259-25125-2",
      addedAt: "2026-08-14",
    },
  },

  // ── 05 Cloherty and Stark's Manual of Neonatal Care ──────────────────────
  {
    title: "Cloherty and Stark's Manual of Neonatal Care",
    titleBn: "ক্লোহার্টি ও স্টার্কের ম্যানুয়াল অব নিওনেটাল কেয়ার",
    authorId: "a-eichenwald",
    categoryId: "cat-neonatology",
    year: 2023,
    publisher: "Wolters Kluwer",
    pages: 1183,
    edition: "9th",
    coverImage: "/covers/cloherty-and-starks-manual-of-neonatal-care.webp",
    language: "en",
    description:
      "The practical bedside manual for neonatal intensive care, covering every common and complex newborn problem. Ninth edition, edited by Eichenwald, Hansen, Martin and Stark.",
    descriptionBn:
      "নবজাতক নিবিড় পরিচর্যার ব্যবহারিক হ্যান্ডবুক — সাধারণ ও জটিল সব নবজাতকের সমস্যার সমাধান। নবম সংস্করণ।",
    featured: true,
    hue: 172,
    file: {
      url: "/books/cloherty-and-starks-manual-of-neonatal-care.pdf",
      sizeMb: 16.0,
      isbn: "978-1-9751-5952-8",
      addedAt: "2026-08-14",
    },
  },

  // ── 06 Davidson's Principles and Practice of Medicine ────────────────────
  {
    title: "Davidson's Principles and Practice of Medicine",
    titleBn: "ডেভিডসনের প্রিন্সিপলস অ্যান্ড প্র্যাকটিস অব মেডিসিন",
    authorId: "a-strachan",
    categoryId: "cat-clinical-reference",
    year: 2027,
    publisher: "Elsevier",
    pages: 1412,
    edition: "25th",
    coverImage: "/covers/davidsons-principles-and-practice-of-medicine.webp",
    language: "en",
    description:
      "The leading single-volume textbook of internal medicine for undergraduates and junior doctors, covering pathophysiology, clinical features and management across all systems. Twenty-fifth edition (© 2027).",
    descriptionBn:
      "মেডিকেল শিক্ষার্থী ও জুনিয়র চিকিৎসকদের জন্য অভ্যন্তরীণ চিকিৎসার শীর্ষস্থানীয় পাঠ্যপুস্তক। পঁচিশতম সংস্করণ (© ২০২৭)।",
    hue: 240,
    file: {
      url: "/books/davidsons-principles-and-practice-of-medicine.pdf",
      sizeMb: 245.6,
      isbn: "978-0-443-28760-2",
      addedAt: "2026-08-14",
    },
  },

  // ── 07 PREP 2026 — Self-Assessment ────────────────────────────────────────
  // File name: "American association of pediatric 2026".
  // This is the AAP PREP 2026 Self-Assessment (200 questions).
  // No readable ISBN in the file.
  {
    title: "PREP 2026 — Self-Assessment",
    titleBn: "PREP ২০২৬ — স্ব-মূল্যায়ন",
    authorId: "a-aap",
    categoryId: "cat-reviews",
    year: 2026,
    publisher: "AAP",
    pages: 975,
    edition: "2026",
    coverImage: "/covers/prep-2026-self-assessment.webp",
    language: "en",
    description:
      "The American Academy of Pediatrics annual self-assessment programme — 200 board-style questions with detailed critiques covering the full paediatric curriculum.",
    descriptionBn:
      "আমেরিকান একাডেমি অব পেডিয়াট্রিক্সের বার্ষিক স্ব-মূল্যায়ন কার্যক্রম — বোর্ড-স্টাইলের ২০০টি প্রশ্ন ও বিস্তারিত ব্যাখ্যা।",
    hue: 44,
    // isbn absent — no readable ISBN in this file
    file: {
      url: "/books/prep-2026-self-assessment.pdf",
      sizeMb: 13.1,
      addedAt: "2026-08-14",
    },
  },

  // ── 08 Nelson's Pediatric Antimicrobial Therapy ───────────────────────────
  // File name says "29th Edition"; the PDF is indeed the 29th (2023).
  // The supplied cover image shows the 2026/32nd edition — cover was rendered
  // from the PDF instead.
  {
    title: "Nelson's Pediatric Antimicrobial Therapy",
    titleBn: "নেলসনের পেডিয়াট্রিক অ্যান্টিমাইক্রোবিয়াল থেরাপি",
    authorId: "a-aap",
    categoryId: "cat-infectious-disease",
    year: 2023,
    publisher: "AAP",
    pages: 401,
    edition: "29th",
    coverImage: "/covers/nelsons-pediatric-antimicrobial-therapy.webp",
    language: "en",
    description:
      "The annual AAP pocket guide to antimicrobial selection and dosing for paediatric infections. Twenty-ninth edition (2023); note the supplied cover image shows the 32nd — the cover here was rendered from the PDF.",
    descriptionBn:
      "শিশুদের সংক্রামক রোগে অ্যান্টিমাইক্রোবিয়াল নির্বাচন ও মাত্রা নির্ধারণের AAP পকেট গাইড। উনত্রিশতম সংস্করণ (২০২৩)।",
    hue: 8,
    file: {
      url: "/books/nelsons-pediatric-antimicrobial-therapy.pdf",
      sizeMb: 4.5,
      isbn: "978-1-61002-650-5",
      addedAt: "2026-08-14",
    },
  },

  // ── 09 Nelson Essentials of Pediatrics ───────────────────────────────────
  {
    title: "Nelson Essentials of Pediatrics",
    titleBn: "নেলসন এসেনশিয়ালস অব পেডিয়াট্রিক্স",
    authorId: "a-marcdante",
    categoryId: "cat-general-pediatrics",
    year: 2023,
    publisher: "Elsevier",
    pages: 1010,
    edition: "9th",
    coverImage: "/covers/nelson-essentials-of-pediatrics.webp",
    language: "en",
    description:
      "The concise companion to the full Nelson Textbook, designed for medical students and residents. Covers the core paediatric curriculum in a single readable volume. Ninth edition.",
    descriptionBn:
      "মেডিকেল শিক্ষার্থী ও রেসিডেন্টদের জন্য নেলসনের সংক্ষিপ্ত সংস্করণ — মূল শিশুরোগ পাঠ্যক্রম একটি পাঠযোগ্য খণ্ডে। নবম সংস্করণ।",
    hue: 188,
    file: {
      url: "/books/nelson-essentials-of-pediatrics.pdf",
      sizeMb: 68.8,
      isbn: "978-0-323-77562-5",
      addedAt: "2026-08-14",
    },
  },

  // ── 10 Clinical Pediatric Nephrology ─────────────────────────────────────
  // No readable ISBN in the file.
  {
    title: "Clinical Pediatric Nephrology",
    titleBn: "ক্লিনিক্যাল পেডিয়াট্রিক নেফ্রোলজি",
    authorId: "a-kher",
    categoryId: "cat-subspecialties",
    year: 2017,
    publisher: "CRC Press",
    pages: 1110,
    edition: "3rd",
    coverImage: "/covers/clinical-pediatric-nephrology.webp",
    language: "en",
    description:
      "The comprehensive reference for paediatric kidney disease — glomerulonephritis, tubular disorders, hypertension, transplantation and dialysis. Third edition.",
    descriptionBn:
      "শিশুদের বৃক্করোগের সামগ্রিক তথ্যসূত্র — গ্লোমেরুলোনেফ্রাইটিস, টিউবুলার ডিজঅর্ডার, উচ্চ রক্তচাপ, প্রতিস্থাপন ও ডায়ালাইসিস। তৃতীয় সংস্করণ।",
    hue: 200,
    // isbn absent — no readable ISBN in this file
    file: {
      url: "/books/clinical-pediatric-nephrology.pdf",
      sizeMb: 50.1,
      addedAt: "2026-08-14",
    },
  },

  // ── 11 Zitelli and Davis' Atlas of Pediatric Physical Diagnosis ───────────
  {
    title: "Zitelli and Davis' Atlas of Pediatric Physical Diagnosis",
    titleBn: "জিটেলি ও ডেভিসের অ্যাটলাস অব পেডিয়াট্রিক ফিজিক্যাল ডায়াগনোসিস",
    authorId: "a-zitelli",
    categoryId: "cat-subspecialties",
    year: 2023,
    publisher: "Elsevier",
    pages: 1032,
    edition: "8th",
    coverImage: "/covers/zitelli-and-davis-atlas-of-pediatric-physical-diagnosis.webp",
    language: "en",
    description:
      "The atlas of clinical signs and physical findings in paediatrics — over 5,000 photographs covering the full spectrum of childhood illness. Eighth edition.",
    descriptionBn:
      "শিশুরোগের ক্লিনিক্যাল চিহ্ন ও শারীরিক অনুসন্ধানের চিত্রকোষ — শৈশব রোগের পূর্ণ পরিসরে ৫,০০০-এরও বেশি ছবি। অষ্টম সংস্করণ।",
    featured: true,
    hue: 280,
    file: {
      url: "/books/zitelli-and-davis-atlas-of-pediatric-physical-diagnosis.pdf",
      sizeMb: 121.7,
      isbn: "978-0-323-77788-9",
      addedAt: "2026-08-14",
    },
  },

  // ── 12 Weinberg's Color Atlas of Pediatric Dermatology ───────────────────
  {
    title: "Weinberg's Color Atlas of Pediatric Dermatology",
    titleBn: "ওয়েইনবার্গের কালার অ্যাটলাস অব পেডিয়াট্রিক ডার্মাটোলজি",
    authorId: "a-kristal",
    categoryId: "cat-subspecialties",
    year: 2017,
    publisher: "McGraw-Hill Education",
    pages: 287,
    edition: "5th",
    coverImage: "/covers/weinbergs-color-atlas-of-pediatric-dermatology.webp",
    language: "en",
    description:
      "A photographic reference for paediatric skin conditions — over 1,000 colour images covering rashes, infections, tumours and congenital disorders. Fifth edition.",
    descriptionBn:
      "শিশুদের চর্মরোগের ফটোগ্রাফিক তথ্যসূত্র — ফুসকুড়ি, সংক্রমণ, টিউমার ও জন্মগত ব্যাধির ১,০০০-এরও বেশি রঙিন ছবি। পঞ্চম সংস্করণ।",
    hue: 12,
    file: {
      url: "/books/weinbergs-color-atlas-of-pediatric-dermatology.pdf",
      sizeMb: 274.0,
      isbn: "978-0-07-179225-7",
      addedAt: "2026-08-14",
    },
  },

  // ── 13 Pediatric Ophthalmology and Strabismus (BCSC Section 6) ───────────
  // File name: "Pediatric Ophthalmology". This is BCSC Section 6, 2024–2025,
  // a 52-page section excerpt, not a full book. Cover rendered from the PDF.
  // No readable ISBN.
  {
    title: "Pediatric Ophthalmology and Strabismus",
    titleBn: "পেডিয়াট্রিক অপথালমোলজি ও স্ট্র্যাবিসমাস",
    authorId: "a-aao",
    categoryId: "cat-subspecialties",
    year: 2024,
    publisher: "AAO",
    pages: 52,
    edition: "2024–25",
    coverImage: "/covers/pediatric-ophthalmology-and-strabismus.webp",
    language: "en",
    description:
      "Basic and Clinical Science Course (BCSC) Section 6, 2024–2025 edition. This file is a 52-page section excerpt from the AAO ophthalmic residency curriculum, not a standalone full-length book.",
    descriptionBn:
      "বেসিক অ্যান্ড ক্লিনিক্যাল সায়েন্স কোর্স (BCSC) সেকশন ৬, ২০২৪–২০২৫। এটি AAO-র চক্ষুরোগ রেসিডেন্সি পাঠ্যক্রমের একটি ৫২ পৃষ্ঠার অংশ।",
    hue: 164,
    // isbn absent — no readable ISBN in this section excerpt
    file: {
      url: "/books/pediatric-ophthalmology-and-strabismus.pdf",
      sizeMb: 2.0,
      addedAt: "2026-08-14",
    },
  },

  // ── 14 Pediatric Critical Care Review ────────────────────────────────────
  {
    title: "Pediatric Critical Care Review",
    titleBn: "পেডিয়াট্রিক ক্রিটিক্যাল কেয়ার রিভিউ",
    authorId: "a-hasan",
    categoryId: "cat-reviews",
    year: 2006,
    publisher: "Humana Press",
    pages: 180,
    edition: "1st",
    coverImage: "/covers/pediatric-critical-care-review.webp",
    language: "en",
    description:
      "A case-based board review of paediatric critical care — respiratory, cardiovascular, neurological and metabolic emergencies. First edition.",
    descriptionBn:
      "শিশু ক্রিটিক্যাল কেয়ারের কেস-ভিত্তিক বোর্ড রিভিউ — শ্বাসযন্ত্র, হৃদ্‌রোগ, স্নায়বিক ও বিপাকীয় জরুরি অবস্থা। প্রথম সংস্করণ।",
    hue: 36,
    file: {
      url: "/books/pediatric-critical-care-review.pdf",
      sizeMb: 0.9,
      isbn: "1-58829-829-9",
      addedAt: "2026-08-14",
    },
  },

  // ── 15 100 Cases in Paediatrics ───────────────────────────────────────────
  // No readable ISBN in the file.
  {
    title: "100 Cases in Paediatrics",
    titleBn: "১০০ কেসেস ইন পেডিয়াট্রিক্স",
    authorId: "a-cheung",
    categoryId: "cat-reviews",
    year: 2017,
    publisher: "CRC Press",
    pages: 350,
    edition: "2nd",
    coverImage: "/covers/100-cases-in-paediatrics.webp",
    language: "en",
    description:
      "One hundred clinical cases covering the breadth of paediatric practice — structured for self-assessment and problem-based learning. Second edition.",
    descriptionBn:
      "স্ব-মূল্যায়ন ও সমস্যা-ভিত্তিক শিক্ষার জন্য শিশুরোগ অনুশীলনের পরিসর জুড়ে একশটি ক্লিনিক্যাল কেস। দ্বিতীয় সংস্করণ।",
    hue: 52,
    // isbn absent — no readable ISBN in this file
    file: {
      url: "/books/100-cases-in-paediatrics.pdf",
      sizeMb: 11.6,
      addedAt: "2026-08-14",
    },
  },

  // ── 16 Neonatal Formulary ─────────────────────────────────────────────────
  {
    title: "Neonatal Formulary",
    titleBn: "নিওনেটাল ফর্মুলারি",
    authorId: "a-ainsworth",
    categoryId: "cat-neonatology",
    year: 2026,
    publisher: "Oxford University Press",
    pages: 1041,
    edition: "9th",
    coverImage: "/covers/neonatal-formulary.webp",
    language: "en",
    description:
      "Drug use in pregnancy and the first year of life — dosing, safety data and clinical guidance for over 250 drugs. Ninth edition, subtitled Drug Use in Pregnancy and the First Year of Life.",
    descriptionBn:
      "গর্ভাবস্থা ও জীবনের প্রথম বছরে ওষুধ ব্যবহার — ২৫০-এরও বেশি ওষুধের মাত্রা, নিরাপত্তা তথ্য ও ক্লিনিক্যাল নির্দেশনা। নবম সংস্করণ।",
    hue: 128,
    file: {
      url: "/books/neonatal-formulary.pdf",
      sizeMb: 279.3,
      isbn: "978-0-19-887721-9",
      addedAt: "2026-08-14",
    },
  },

  // ── 17 Feigin and Cherry's Textbook of Pediatric Infectious Diseases ──────
  // File name: "Textbpook of Infectous Disease" (sic). The PDF is Feigin
  // and Cherry's, 8th edition.
  {
    title: "Feigin and Cherry's Textbook of Pediatric Infectious Diseases",
    titleBn: "ফেইগিন ও চেরির টেক্সটবুক অব পেডিয়াট্রিক ইনফেকশাস ডিজিজেস",
    authorId: "a-cherry",
    categoryId: "cat-infectious-disease",
    year: 2019,
    publisher: "Elsevier",
    pages: 3992,
    edition: "8th",
    coverImage: "/covers/feigin-and-cherrys-textbook-of-pediatric-infectious-diseases.webp",
    language: "en",
    description:
      "The comprehensive two-volume reference for paediatric infectious diseases — microbiology, epidemiology, clinical features and management of every major pathogen. Eighth edition.",
    descriptionBn:
      "শিশুদের সংক্রামক রোগের সামগ্রিক দুই-খণ্ডের তথ্যসূত্র — প্রতিটি প্রধান রোগজীবাণুর মাইক্রোবায়োলজি, মহামারিবিদ্যা ও চিকিৎসা ব্যবস্থাপনা। অষ্টম সংস্করণ।",
    hue: 348,
    file: {
      url: "/books/feigin-and-cherrys-textbook-of-pediatric-infectious-diseases.pdf",
      sizeMb: 103.0,
      isbn: "978-0-323-37692-1",
      addedAt: "2026-08-14",
    },
  },

  // ── 18 Pediatric Neurology: A Color Handbook ──────────────────────────────
  {
    title: "Pediatric Neurology: A Color Handbook",
    titleBn: "পেডিয়াট্রিক নিউরোলজি: এ কালার হ্যান্ডবুক",
    authorId: "a-bale",
    categoryId: "cat-subspecialties",
    year: 2012,
    publisher: "Manson Publishing",
    pages: 353,
    edition: "1st",
    coverImage: "/covers/pediatric-neurology-a-color-handbook.webp",
    language: "en",
    description:
      "A photographic colour handbook of paediatric neurological conditions — seizures, cerebrovascular disease, metabolic disorders and neuromuscular disease. First edition.",
    descriptionBn:
      "শিশু স্নায়বিক রোগের ফটোগ্রাফিক কালার হ্যান্ডবুক — খিঁচুনি, সেরিব্রোভাসকুলার রোগ, বিপাকীয় ব্যাধি ও নিউরোমাসকুলার রোগ। প্রথম সংস্করণ।",
    hue: 264,
    file: {
      url: "/books/pediatric-neurology-a-color-handbook.pdf",
      sizeMb: 10.0,
      isbn: "978-1-84076-134-4",
      addedAt: "2026-08-14",
    },
  },

  // ── 19 Algorithms in Pediatric Neurology ─────────────────────────────────
  {
    title: "Algorithms in Pediatric Neurology",
    titleBn: "অ্যালগরিদমস ইন পেডিয়াট্রিক নিউরোলজি",
    authorId: "a-passi",
    categoryId: "cat-subspecialties",
    year: 2011,
    publisher: "Jaypee Brothers",
    pages: 85,
    edition: "1st",
    coverImage: "/covers/algorithms-in-pediatric-neurology.webp",
    language: "en",
    description:
      "A decision-tree guide for trainees approaching paediatric neurological presentations — headache, seizures, weakness, movement disorders. First edition subtitled A Beginner's Guide.",
    descriptionBn:
      "শিশু স্নায়বিক উপস্থাপনায় প্রশিক্ষণার্থীদের জন্য সিদ্ধান্ত-বৃক্ষ গাইড। প্রথম সংস্করণ।",
    hue: 68,
    file: {
      url: "/books/algorithms-in-pediatric-neurology.pdf",
      sizeMb: 3.1,
      isbn: "978-93-5025-250-5",
      addedAt: "2026-08-14",
    },
  },

  // ── 20 Harrison's Principles of Internal Medicine ─────────────────────────
  // File name: "Harrison Internal Medicicne" (sic). The PDF is the 22nd
  // edition (2025), a two-volume set.
  {
    title: "Harrison's Principles of Internal Medicine",
    titleBn: "হ্যারিসনস প্রিন্সিপলস অব ইন্টার্নাল মেডিসিন",
    authorId: "a-loscalzo",
    categoryId: "cat-clinical-reference",
    year: 2025,
    publisher: "McGraw Hill",
    pages: 4273,
    edition: "22nd",
    coverImage: "/covers/harrisons-principles-of-internal-medicine.webp",
    language: "en",
    description:
      "The definitive two-volume reference in internal medicine, covering pathophysiology, clinical presentation and management across all specialties. Twenty-second edition (2025), edited by Loscalzo, Fauci, Kasper, Hauser, Longo, Jameson, Holland and Langford.",
    descriptionBn:
      "অভ্যন্তরীণ চিকিৎসার নির্ধারক দুই-খণ্ডের তথ্যসূত্র। বাইশতম সংস্করণ (২০২৫)।",
    featured: true,
    hue: 220,
    file: {
      url: "/books/harrisons-principles-of-internal-medicine.pdf",
      sizeMb: 276.7,
      isbn: "978-1-265-97387-2",
      addedAt: "2026-08-14",
    },
  },
];

/** Shelf-code prefix per category. Exported because newly catalogued books
 *  have to be given a shelf position by the same rule as the seed data. */
export const shelfPrefix: Record<string, string> = {
  "cat-general-pediatrics": "F1-GENP",
  "cat-neonatology": "F2-NEON",
  "cat-infectious-disease": "F3-INFD",
  "cat-subspecialties": "F4-SUBS",
  "cat-reviews": "F5-REVW",
  "cat-clinical-reference": "F6-REFR",
};

const uploaders = ["Apu Roy"];

function buildBook(seed: Seed, i: number): Book {
  const author = authors.find((a) => a.id === seed.authorId)!;
  const category = categories.find((c) => c.id === seed.categoryId)!;
  const status: BookStatus = seed.status ?? "available";

  // Real files — every one of these 20 has a single physical copy (the file).
  // Borrowed/damaged/lost states still work; they just aren't pre-salted here.
  const copiesTotal = 1;
  const copiesAvailable = status === "available" ? 1 : 0;

  const slug = seed.title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[&]/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id: `bk-${String(i + 1).padStart(3, "0")}`,
    code: `BK-${String(8000 + i * 37).padStart(5, "0")}`,
    slug,
    title: seed.title,
    titleBn: seed.titleBn,
    authorId: author.id,
    authorName: author.name,
    authorNameBn: author.nameBn,
    categoryId: category.id,
    categoryName: category.name,
    publisher: seed.publisher,
    year: seed.year,
    // Explicit: these are English-language books with Bengali *display* titles.
    // Inferring language from titleBn would label them all Bengali.
    language: seed.language,
    isbn: seed.file.isbn,
    edition: seed.edition,
    pages: seed.pages,
    description: seed.description,
    descriptionBn: seed.descriptionBn,
    status,
    copiesTotal,
    copiesAvailable,
    shelf: `${shelfPrefix[category.id]}-SH${(i % 6) + 1}-R${(i % 4) + 1}-P${String(
      (i % 12) + 1,
    ).padStart(2, "0")}`,
    coverHue: seed.hue,
    coverImage: seed.coverImage,
    format: "pdf",
    fileSizeMb: seed.file.sizeMb,
    // Not a path to the file — a request for it. Checked against an account
    // before the stream opens. What is behind this address is in `bookFiles`.
    fileUrl: `/api/file/${slug}`,
    downloads: 480 + ((i * 613) % 9200),
    rating: Math.round((3.6 + ((i * 7) % 14) / 10) * 10) / 10,
    featured: seed.featured ?? false,
    addedAt: seed.file.addedAt,
    uploadedBy: seed.file.uploadedBy ?? uploaders[i % uploaders.length],
  };
}

export const books: Book[] = seeds.map(buildBook);

/** The demo file served if a slug has no entry in `bookFiles`. */
export const sampleFileName = "sample.pdf";

/**
 * Slug → the file's name in private storage.
 *
 * Kept apart from `Book` deliberately. A `Book` is handed to Client
 * Components and therefore to the browser, and the one thing about a book that
 * must not travel with it is where the file actually is. The route handler
 * looks the name up here, on the server, after it has decided the reader is
 * entitled to it.
 */
export const bookFiles: Record<string, string> = Object.fromEntries(
  books.map((book, i) => [
    book.slug,
    seeds[i].file.url.split("/").pop() ?? sampleFileName,
  ]),
);

// Backfill the denormalised counts now that every book exists.
for (const c of categories) {
  c.bookCount = books.filter((b) => b.categoryId === c.id).length;
}
for (const a of authors) {
  a.bookCount = books.filter((b) => b.authorId === a.id).length;
}
