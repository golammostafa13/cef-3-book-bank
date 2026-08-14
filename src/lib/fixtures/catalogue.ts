import type { Author, Book, BookStatus, Category } from "@/types";

/**
 * Demo fixtures for the Pediatric Book Bank catalogue.
 *
 * A compact seed list is expanded into full `Book` records by `buildBook`
 * below, so the interesting data stays readable and the derived fields
 * (codes, shelves, counts) stay internally consistent.
 *
 * Everything here is deterministic — no Math.random — so server and client
 * renders always agree and there are no hydration mismatches.
 */

export const categories: Category[] = [
  {
    id: "cat-fiction",
    slug: "fiction",
    name: "Fiction",
    nameBn: "কথাসাহিত্য",
    description:
      "Novels and novellas — the long-form storytelling at the heart of the collection.",
    descriptionBn:
      "উপন্যাস ও উপন্যাসিকা — সংগ্রহের কেন্দ্রে থাকা দীর্ঘ আখ্যানের ধারা।",
    icon: "BookOpen",
    bookCount: 0,
  },
  {
    id: "cat-poetry",
    slug: "poetry",
    name: "Poetry",
    nameBn: "কবিতা",
    description: "Verse collections, from classical forms to modern free verse.",
    descriptionBn:
      "কাব্যসংকলন — ধ্রুপদী ছন্দ থেকে আধুনিক মুক্তছন্দ পর্যন্ত।",
    icon: "Feather",
    bookCount: 0,
  },
  {
    id: "cat-history",
    slug: "history",
    name: "History",
    nameBn: "ইতিহাস",
    description: "Political, social and cultural history of Bengal and beyond.",
    descriptionBn:
      "বাংলা ও বাংলার বাইরের রাজনৈতিক, সামাজিক ও সাংস্কৃতিক ইতিহাস।",
    icon: "Landmark",
    bookCount: 0,
  },
  {
    id: "cat-science",
    slug: "science",
    name: "Science",
    nameBn: "বিজ্ঞান",
    description: "Popular science, mathematics and the history of ideas.",
    descriptionBn: "জনপ্রিয় বিজ্ঞান, গণিত এবং চিন্তার ইতিহাস।",
    icon: "Atom",
    bookCount: 0,
  },
  {
    id: "cat-children",
    slug: "children",
    name: "Children",
    nameBn: "শিশুসাহিত্য",
    description: "Picture books, fables and early readers for young borrowers.",
    descriptionBn:
      "ছোট পাঠকদের জন্য ছবির বই, রূপকথা আর প্রথম পাঠের বই।",
    icon: "Baby",
    bookCount: 0,
  },
  {
    id: "cat-reference",
    slug: "reference",
    name: "Reference",
    nameBn: "তথ্যসূত্র",
    description: "Dictionaries, encyclopaedias and scholarly reference works.",
    descriptionBn: "অভিধান, বিশ্বকোষ ও গবেষণার তথ্যসূত্র।",
    icon: "Library",
    bookCount: 0,
  },
];

export const authors: Author[] = [
  {
    id: "a-tagore",
    slug: "rabindranath-tagore",
    name: "Rabindranath Tagore",
    nameBn: "রবীন্দ্রনাথ ঠাকুর",
    era: "1861–1941",
    bio: "Poet, novelist and composer; the first non-European to be awarded the Nobel Prize in Literature, in 1913.",
    bioBn:
      "কবি, ঔপন্যাসিক ও সঙ্গীতস্রষ্টা; ১৯১৩ সালে সাহিত্যে নোবেল পুরস্কার লাভকারী প্রথম অ-ইউরোপীয়।",
    bookCount: 0,
  },
  {
    id: "a-nazrul",
    slug: "kazi-nazrul-islam",
    name: "Kazi Nazrul Islam",
    nameBn: "কাজী নজরুল ইসলাম",
    era: "1899–1976",
    bio: "The rebel poet, whose verse fused revolutionary politics with devotional lyricism.",
    bioBn: "বিদ্রোহী কবি, যাঁর কবিতায় বিপ্লবী চেতনা ও ভক্তিরস একসূত্রে গাঁথা।",
    bookCount: 0,
  },
  {
    id: "a-bibhuti",
    slug: "bibhutibhushan-bandyopadhyay",
    name: "Bibhutibhushan Bandyopadhyay",
    nameBn: "বিভূতিভূষণ বন্দ্যোপাধ্যায়",
    era: "1894–1950",
    bio: "Novelist of rural Bengal, best known for the Apu trilogy that Satyajit Ray brought to the screen.",
    bioBn:
      "গ্রামবাংলার ঔপন্যাসিক; সত্যজিৎ রায়ের চলচ্চিত্রে রূপ পাওয়া অপু ত্রয়ীর জন্য সবচেয়ে পরিচিত।",
    bookCount: 0,
  },
  {
    id: "a-sarat",
    slug: "sarat-chandra-chattopadhyay",
    name: "Sarat Chandra Chattopadhyay",
    nameBn: "শরৎচন্দ্র চট্টোপাধ্যায়",
    era: "1876–1938",
    bio: "Chronicler of domestic life and social reform, and among the most widely read Bengali novelists.",
    bioBn:
      "সংসারজীবন ও সমাজসংস্কারের রূপকার; বাংলা সাহিত্যের সর্বাধিক পঠিত ঔপন্যাসিকদের একজন।",
    bookCount: 0,
  },
  {
    id: "a-humayun",
    slug: "humayun-ahmed",
    name: "Humayun Ahmed",
    nameBn: "হুমায়ূন আহমেদ",
    era: "1948–2012",
    bio: "Bangladesh's most popular modern novelist and dramatist; creator of Himu and Misir Ali.",
    bioBn:
      "বাংলাদেশের সর্বাধিক জনপ্রিয় আধুনিক ঔপন্যাসিক ও নাট্যকার; হিমু ও মিসির আলির স্রষ্টা।",
    bookCount: 0,
  },
  {
    id: "a-manik",
    slug: "manik-bandyopadhyay",
    name: "Manik Bandyopadhyay",
    nameBn: "মানিক বন্দ্যোপাধ্যায়",
    era: "1908–1956",
    bio: "Modernist novelist whose work turned an unsentimental eye on poverty and labour.",
    bioBn:
      "আধুনিক ঔপন্যাসিক; দারিদ্র্য ও শ্রমজীবী মানুষের জীবনকে আবেগহীন সত্যদৃষ্টিতে দেখেছেন।",
    bookCount: 0,
  },
  {
    id: "a-bankim",
    slug: "bankim-chandra-chattopadhyay",
    name: "Bankim Chandra Chattopadhyay",
    nameBn: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়",
    era: "1838–1894",
    bio: "Author of the first major Bengali novels and of the poem 'Vande Mataram'.",
    bioBn:
      "বাংলা ভাষার প্রথম বড় উপন্যাসগুলোর রচয়িতা এবং ‘বন্দে মাতরম্‌’ কবিতার কবি।",
    bookCount: 0,
  },
  {
    id: "a-jibanananda",
    slug: "jibanananda-das",
    name: "Jibanananda Das",
    nameBn: "জীবনানন্দ দাশ",
    era: "1899–1954",
    bio: "The most quietly influential Bengali poet after Tagore; a founder of Bengali modernism.",
    bioBn:
      "রবীন্দ্রনাথের পরে বাংলা কবিতার সবচেয়ে নিঃশব্দ প্রভাবশালী কবি; বাংলা আধুনিকতার এক প্রতিষ্ঠাতা।",
    bookCount: 0,
  },
  {
    id: "a-carroll",
    slug: "lewis-carroll",
    name: "Lewis Carroll",
    nameBn: "লুইস ক্যারল",
    era: "1832–1898",
    bio: "Mathematician and author whose nonsense fiction reshaped children's literature.",
    bioBn:
      "গণিতজ্ঞ ও লেখক; তাঁর ননসেন্স সাহিত্য শিশুসাহিত্যের ধারা বদলে দিয়েছে।",
    bookCount: 0,
  },
  {
    id: "a-austen",
    slug: "jane-austen",
    name: "Jane Austen",
    nameBn: "জেন অস্টেন",
    era: "1775–1817",
    bio: "Novelist of manners whose six major novels remain continuously in print.",
    bioBn:
      "সমাজ-আচারের ঔপন্যাসিক; তাঁর ছয়টি প্রধান উপন্যাস আজও অবিরাম মুদ্রিত হয়ে চলেছে।",
    bookCount: 0,
  },
  {
    id: "a-sagan",
    slug: "carl-sagan",
    name: "Carl Sagan",
    nameBn: "কার্ল সেগান",
    era: "1934–1996",
    bio: "Astronomer and science communicator who brought cosmology to a general readership.",
    bioBn:
      "জ্যোতির্বিজ্ঞানী ও বিজ্ঞান-লেখক; মহাবিশ্বতত্ত্বকে সাধারণ পাঠকের কাছে পৌঁছে দিয়েছেন।",
    bookCount: 0,
  },
  {
    id: "a-hossain",
    slug: "begum-rokeya",
    name: "Begum Rokeya",
    nameBn: "বেগম রোকেয়া",
    era: "1880–1932",
    bio: "Writer and pioneering advocate for women's education in Bengal.",
    bioBn: "লেখিকা এবং বাংলায় নারীশিক্ষার অগ্রপথিক।",
    bookCount: 0,
  },
  /**
   * A corporate author, which is how reference works of this kind are actually
   * catalogued: the handbook has been compiled by the hospital's house officers
   * across twenty-three editions, and each edition's editors are credited in
   * the book's own description rather than standing in as its author. No `era`
   * for the same reason — an institution has no dates in the sense the author
   * pages mean them.
   */
  {
    id: "a-jhh",
    slug: "johns-hopkins-hospital",
    name: "Johns Hopkins Hospital",
    nameBn: "জনস হপকিন্স হসপিটাল",
    bio: "The Baltimore teaching hospital whose paediatric house staff have compiled the Harriet Lane Handbook since 1953.",
    bioBn:
      "বাল্টিমোরের শিক্ষাদানকারী হাসপাতাল, যার শিশুরোগ বিভাগের চিকিৎসকেরা ১৯৫৩ সাল থেকে হ্যারিয়েট লেন হ্যান্ডবুক সংকলন করে আসছেন।",
    bookCount: 0,
  },
];

/**
 * A book that has a real file behind it rather than the shared sample.
 *
 * Everything `buildBook` would otherwise invent — ISBN, file size, the date it
 * arrived — has a true value for these, and a made-up ISBN on a book someone
 * can actually download is worse than no fixture at all. Present means real;
 * absent means demo.
 */
interface SeedFile {
  /**
   * The file's name in private storage — `private/books/` in development, an
   * R2 key in production. Never a URL a browser could ask for: the file is
   * reached only through `/api/file/[slug]`, which checks for an account
   * first. See `bookFiles` at the foot of this module.
   */
  url: string;
  sizeMb: number;
  isbn: string;
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
  /** Cover hue in degrees; drives the generated cover art. */
  hue: number;
  file?: SeedFile;
}

const seeds: Seed[] = [
  {
    title: "Gitanjali",
    titleBn: "গীতাঞ্জলি",
    authorId: "a-tagore",
    categoryId: "cat-poetry",
    year: 1910,
    publisher: "Indian Press",
    pages: 168,
    description:
      "The song-offerings that carried Bengali verse to a world audience, in the poet's own English rendering.",
    descriptionBn:
      "গীতাঞ্জলি রবীন্দ্রনাথ ঠাকুরের কাব্যগ্রন্থ, যার ইংরেজি অনুবাদের জন্য তিনি নোবেল পুরস্কার লাভ করেন।",
    featured: true,
    hue: 28,
  },
  {
    title: "Shesher Kobita",
    titleBn: "শেষের কবিতা",
    authorId: "a-tagore",
    categoryId: "cat-fiction",
    year: 1929,
    publisher: "Visva-Bharati",
    pages: 214,
    description:
      "A late, unusually modern novel about love that argues with itself in essays and verse.",
    descriptionBn:
      "রবীন্দ্রনাথের অন্যতম আধুনিক উপন্যাস, যেখানে প্রেম ও যুক্তি পরস্পরের মুখোমুখি।",
    featured: true,
    hue: 340,
  },
  {
    title: "Gora",
    titleBn: "গোরা",
    authorId: "a-tagore",
    categoryId: "cat-fiction",
    year: 1909,
    publisher: "Indian Press",
    pages: 476,
    description:
      "A sprawling novel of identity, orthodoxy and nationalism in colonial Bengal.",
    hue: 18,
  },
  {
    title: "Chokher Bali",
    titleBn: "চোখের বালি",
    authorId: "a-tagore",
    categoryId: "cat-fiction",
    year: 1903,
    publisher: "Indian Press",
    pages: 288,
    description:
      "One of the first psychological novels in Bengali, centred on widowhood and desire.",
    status: "borrowed",
    hue: 4,
  },
  {
    title: "Agnibina",
    titleBn: "অগ্নিবীণা",
    authorId: "a-nazrul",
    categoryId: "cat-poetry",
    year: 1922,
    publisher: "Arya Publishing",
    pages: 96,
    description:
      "The collection that opens with 'Bidrohi' and announced a new voice in Bengali poetry.",
    descriptionBn:
      "‘বিদ্রোহী’ কবিতা দিয়ে শুরু হওয়া এই সংকলন বাংলা কাব্যে নতুন কণ্ঠস্বরের ঘোষণা।",
    featured: true,
    hue: 12,
  },
  {
    title: "Bisher Banshi",
    titleBn: "বিষের বাঁশি",
    authorId: "a-nazrul",
    categoryId: "cat-poetry",
    year: 1924,
    publisher: "Arya Publishing",
    pages: 88,
    description:
      "Banned on publication for its politics; a poison flute aimed squarely at empire.",
    hue: 350,
  },
  {
    title: "Pather Panchali",
    titleBn: "পথের পাঁচালী",
    authorId: "a-bibhuti",
    categoryId: "cat-fiction",
    year: 1929,
    publisher: "Ranjan Publishing",
    pages: 352,
    description:
      "Apu and Durga's childhood in a Bengal village, told with almost documentary tenderness.",
    descriptionBn:
      "অপু ও দুর্গার শৈশব, বাংলার গ্রামজীবনের এক অনন্য চিত্র।",
    featured: true,
    hue: 96,
  },
  {
    title: "Aranyak",
    titleBn: "আরণ্যক",
    authorId: "a-bibhuti",
    categoryId: "cat-fiction",
    year: 1939,
    publisher: "Ranjan Publishing",
    pages: 264,
    description:
      "A forest officer watches the wilderness he is paid to parcel out disappear.",
    hue: 128,
  },
  {
    title: "Devdas",
    titleBn: "দেবদাস",
    authorId: "a-sarat",
    categoryId: "cat-fiction",
    year: 1917,
    publisher: "Gurudas Chattopadhyay & Sons",
    pages: 186,
    description:
      "The short novel of thwarted love that has been filmed more often than any other Bengali book.",
    hue: 264,
  },
  {
    title: "Srikanta",
    titleBn: "শ্রীকান্ত",
    authorId: "a-sarat",
    categoryId: "cat-fiction",
    year: 1917,
    publisher: "Gurudas Chattopadhyay & Sons",
    pages: 420,
    description:
      "A wandering narrator's four-part account of the people he meets and fails to hold onto.",
    status: "damaged",
    hue: 200,
  },
  {
    title: "Nondito Noroke",
    titleBn: "নন্দিত নরকে",
    authorId: "a-humayun",
    categoryId: "cat-fiction",
    year: 1972,
    publisher: "Khan Brothers",
    pages: 104,
    description:
      "The debut novella that introduced a plain, devastating new register to Bangladeshi fiction.",
    descriptionBn:
      "হুমায়ূন আহমেদের প্রথম উপন্যাস, যা বাংলা কথাসাহিত্যে সহজ অথচ মর্মভেদী ভাষা এনেছিল।",
    featured: true,
    hue: 216,
  },
  {
    title: "Himu",
    titleBn: "হিমু",
    authorId: "a-humayun",
    categoryId: "cat-fiction",
    year: 1993,
    publisher: "Anyaprokash",
    pages: 142,
    description:
      "The barefoot young man in a yellow panjabi who refuses every sensible thing.",
    hue: 44,
  },
  {
    title: "Misir Ali",
    titleBn: "মিসির আলি",
    authorId: "a-humayun",
    categoryId: "cat-fiction",
    year: 1985,
    publisher: "Anyaprokash",
    pages: 158,
    description:
      "A psychology lecturer applies pure logic to problems that decline to stay rational.",
    status: "borrowed",
    hue: 172,
  },
  {
    title: "Padma Nadir Majhi",
    titleBn: "পদ্মা নদীর মাঝি",
    authorId: "a-manik",
    categoryId: "cat-fiction",
    year: 1936,
    publisher: "Bengal Publishers",
    pages: 232,
    description:
      "Fishermen on the Padma, drawn without a trace of romance about poverty.",
    descriptionBn: "পদ্মা নদীর জেলেজীবনের নির্মম ও বাস্তব চিত্র।",
    featured: true,
    hue: 188,
  },
  {
    title: "Putul Nacher Itikatha",
    titleBn: "পুতুল নাচের ইতিকথা",
    authorId: "a-manik",
    categoryId: "cat-fiction",
    year: 1936,
    publisher: "Bengal Publishers",
    pages: 276,
    description:
      "A village doctor discovers how little of his own life he actually directs.",
    hue: 288,
  },
  {
    title: "Anandamath",
    titleBn: "আনন্দমঠ",
    authorId: "a-bankim",
    categoryId: "cat-history",
    year: 1882,
    publisher: "Bangadarshan",
    pages: 208,
    description:
      "The novel of the sannyasi rebellion that gave the subcontinent 'Vande Mataram'.",
    hue: 36,
  },
  {
    title: "Kapalkundala",
    titleBn: "কপালকুণ্ডলা",
    authorId: "a-bankim",
    categoryId: "cat-fiction",
    year: 1866,
    publisher: "Bangadarshan",
    pages: 164,
    description:
      "An early Bengali romance, part gothic and part folk tale, set on the Bay coast.",
    hue: 312,
  },
  {
    title: "Banalata Sen",
    titleBn: "বনলতা সেন",
    authorId: "a-jibanananda",
    categoryId: "cat-poetry",
    year: 1942,
    publisher: "Kabita Bhavan",
    pages: 72,
    description:
      "Bengali modernism's quietest and most quoted book; a thousand years of walking the earth.",
    descriptionBn:
      "‘হাজার বছর ধরে আমি পথ হাঁটিতেছি পৃথিবীর পথে’ — বাংলা আধুনিক কবিতার মাইলফলক।",
    featured: true,
    hue: 152,
  },
  {
    title: "Rupasi Bangla",
    titleBn: "রূপসী বাংলা",
    authorId: "a-jibanananda",
    categoryId: "cat-poetry",
    year: 1957,
    publisher: "Signet Press",
    pages: 84,
    description:
      "Sonnets to a countryside the poet did not live to see published.",
    hue: 108,
  },
  {
    title: "Sultana's Dream",
    titleBn: "সুলতানার স্বপ্ন",
    authorId: "a-hossain",
    categoryId: "cat-fiction",
    year: 1905,
    publisher: "The Indian Ladies' Magazine",
    pages: 48,
    description:
      "A feminist utopia written in English in 1905, in which men are the ones kept indoors.",
    featured: true,
    hue: 300,
  },
  {
    title: "Aborodhbasini",
    titleBn: "অবরোধবাসিনী",
    authorId: "a-hossain",
    categoryId: "cat-history",
    year: 1931,
    publisher: "Mohammadi Press",
    pages: 96,
    description:
      "Forty-seven short, furious sketches of life in seclusion.",
    hue: 328,
  },
  {
    title: "Alice's Adventures in Wonderland",
    authorId: "a-carroll",
    categoryId: "cat-children",
    year: 1865,
    publisher: "Macmillan",
    pages: 192,
    description:
      "A girl follows a waistcoated rabbit underground and logic stops applying.",
    featured: true,
    hue: 320,
  },
  {
    title: "Through the Looking-Glass",
    authorId: "a-carroll",
    categoryId: "cat-children",
    year: 1871,
    publisher: "Macmillan",
    pages: 208,
    description: "The sequel, arranged as a chess problem that Alice wins by promotion.",
    hue: 232,
  },
  {
    title: "Pride and Prejudice",
    authorId: "a-austen",
    categoryId: "cat-fiction",
    year: 1813,
    publisher: "T. Egerton",
    pages: 432,
    description:
      "Elizabeth Bennet, Fitzwilliam Darcy, and the slow correction of two first impressions.",
    featured: true,
    hue: 210,
  },
  {
    title: "Emma",
    authorId: "a-austen",
    categoryId: "cat-fiction",
    year: 1815,
    publisher: "John Murray",
    pages: 474,
    description:
      "A heroine 'whom no one but myself will much like', and a village she keeps rearranging.",
    status: "borrowed",
    hue: 164,
  },
  {
    title: "Sense and Sensibility",
    authorId: "a-austen",
    categoryId: "cat-fiction",
    year: 1811,
    publisher: "T. Egerton",
    pages: 384,
    description: "Two sisters test opposite theories of how much feeling to show.",
    hue: 276,
  },
  {
    title: "Cosmos",
    authorId: "a-sagan",
    categoryId: "cat-science",
    year: 1980,
    publisher: "Random House",
    pages: 396,
    description:
      "Thirteen chapters on the universe and our very short time paying attention to it.",
    featured: true,
    hue: 240,
  },
  {
    title: "The Demon-Haunted World",
    authorId: "a-sagan",
    categoryId: "cat-science",
    year: 1995,
    publisher: "Random House",
    pages: 458,
    description:
      "Science as a candle in the dark, and a toolkit for detecting baloney.",
    hue: 256,
  },
  {
    title: "Pale Blue Dot",
    authorId: "a-sagan",
    categoryId: "cat-science",
    year: 1994,
    publisher: "Random House",
    pages: 384,
    description: "A vision of the human future in space, starting from one pixel.",
    status: "lost",
    hue: 220,
  },
  {
    title: "Sanchayita",
    titleBn: "সঞ্চয়িতা",
    authorId: "a-tagore",
    categoryId: "cat-poetry",
    year: 1931,
    publisher: "Visva-Bharati",
    pages: 812,
    description: "The poet's own selection from fifty years of verse.",
    hue: 20,
  },
  {
    title: "Galpaguchchha",
    titleBn: "গল্পগুচ্ছ",
    authorId: "a-tagore",
    categoryId: "cat-fiction",
    year: 1912,
    publisher: "Indian Press",
    pages: 640,
    description:
      "The collected short stories — arguably where Tagore's prose is at its sharpest.",
    hue: 60,
  },
  {
    title: "Sonar Tori",
    titleBn: "সোনার তরী",
    authorId: "a-tagore",
    categoryId: "cat-poetry",
    year: 1894,
    publisher: "Indian Press",
    pages: 128,
    description: "The golden boat takes the harvest and leaves the farmer behind.",
    hue: 48,
  },
  {
    title: "Sanchita",
    titleBn: "সঞ্চিতা",
    authorId: "a-nazrul",
    categoryId: "cat-poetry",
    year: 1928,
    publisher: "D. M. Library",
    pages: 320,
    description: "Nazrul's own anthology of his best-known poems.",
    hue: 8,
  },
  {
    title: "Chandranath",
    titleBn: "চন্দ্রনাথ",
    authorId: "a-sarat",
    categoryId: "cat-fiction",
    year: 1916,
    publisher: "Gurudas Chattopadhyay & Sons",
    pages: 148,
    description: "Caste, pride and a marriage that neither party can quite abandon.",
    hue: 292,
  },
  {
    title: "Parineeta",
    titleBn: "পরিণীতা",
    authorId: "a-sarat",
    categoryId: "cat-fiction",
    year: 1914,
    publisher: "Gurudas Chattopadhyay & Sons",
    pages: 132,
    description: "A childhood attachment quietly hardens into an unspoken marriage.",
    hue: 336,
  },
  {
    title: "Ichhapuran",
    titleBn: "ইচ্ছাপূরণ",
    authorId: "a-tagore",
    categoryId: "cat-children",
    year: 1895,
    publisher: "Indian Press",
    pages: 64,
    description:
      "A father and son swap ages for a day and both regret it by evening.",
    hue: 76,
  },
  {
    title: "Thakurmar Jhuli",
    titleBn: "ঠাকুরমার ঝুলি",
    authorId: "a-bibhuti",
    categoryId: "cat-children",
    year: 1907,
    publisher: "Bhattacharya & Sons",
    pages: 176,
    description:
      "Grandmother's bag of Bengali folk tales — princes, rakkhoshes and talking birds.",
    descriptionBn: "বাংলার রূপকথার সংকলন — রাজপুত্র, রাক্ষস আর কথা বলা পাখির গল্প।",
    featured: true,
    hue: 140,
  },
  {
    title: "Bangla Bhashar Abhidhan",
    titleBn: "বাংলা ভাষার অভিধান",
    authorId: "a-bankim",
    categoryId: "cat-reference",
    year: 1917,
    publisher: "Bangiya Sahitya Parishad",
    pages: 1240,
    description: "A standard reference dictionary of the Bengali language.",
    hue: 200,
  },
  {
    title: "Bharatbarsher Itihas",
    titleBn: "ভারতবর্ষের ইতিহাস",
    authorId: "a-bankim",
    categoryId: "cat-history",
    year: 1888,
    publisher: "Bangadarshan",
    pages: 528,
    description: "An early attempt at a history of India written from within it.",
    status: "damaged",
    hue: 32,
  },
  {
    title: "Jibansmriti",
    titleBn: "জীবনস্মৃতি",
    authorId: "a-tagore",
    categoryId: "cat-history",
    year: 1912,
    publisher: "Indian Press",
    pages: 244,
    description: "Reminiscences of a Jorasanko childhood, written at fifty.",
    hue: 88,
  },
  /**
   * The one book on the shelf with a real file behind it. Appended rather than
   * slotted in: `buildBook` derives ids, codes and shelf positions from array
   * position, so inserting anywhere else would renumber every book after it and
   * break links people may already have.
   *
   * Page count, file size, ISBN, edition, year and editors are all read off the
   * file itself rather than from its file name, which credited the editors of a
   * different edition.
   */
  {
    title: "The Harriet Lane Handbook",
    authorId: "a-jhh",
    categoryId: "cat-reference",
    year: 2024,
    publisher: "Elsevier",
    pages: 1512,
    description:
      "The paediatric house officer's pocket reference, compiled at the Johns Hopkins Children's Center since 1953 and named for the Harriet Lane Home: assessment and procedures, emergency management, growth and development, and a full drug formulary. Twenty-third edition, edited by Camille C. Anderson, Sunaina Kapoor and Tiffany E. Mark.",
    descriptionBn:
      "শিশুরোগ চিকিৎসকদের জন্য হাতের কাছে রাখার তথ্যসূত্র — ১৯৫৩ সাল থেকে জনস হপকিন্স চিলড্রেন্স সেন্টারে সংকলিত। রোগনির্ণয় ও চিকিৎসাপদ্ধতি, আপৎকালীন ব্যবস্থাপনা, শিশুর বৃদ্ধি ও বিকাশ এবং সম্পূর্ণ ওষুধপঞ্জি এখানে আছে। ২৩তম সংস্করণ।",
    // Slate: the one cool scheme in the set, which is where a clinical
    // reference belongs on a shelf of warm literary covers.
    hue: 337,
    file: {
      url: "/books/harriet-lane-handbook.pdf",
      sizeMb: 35,
      isbn: "978-0-323-87698-8",
      addedAt: "2026-08-12",
    },
  },
];

/** Shelf-code prefix per category. Exported because newly catalogued books
 *  have to be given a shelf position by the same rule as the seed data. */
export const shelfPrefix: Record<string, string> = {
  "cat-fiction": "F1-FICT",
  "cat-poetry": "F2-POET",
  "cat-history": "F3-HIST",
  "cat-science": "F4-SCIE",
  "cat-children": "F5-CHLD",
  "cat-reference": "F6-REFR",
};

const uploaders = ["Sylvia North", "Apu Roy", "Noah Tanaka", "Mira Sen"];

function buildBook(seed: Seed, i: number): Book {
  const author = authors.find((a) => a.id === seed.authorId)!;
  const category = categories.find((c) => c.id === seed.categoryId)!;
  const status: BookStatus = seed.status ?? "available";

  // Deterministic pseudo-variation so the demo data looks alive without
  // Math.random (which would break SSR/CSR agreement).
  const spin = (i * 37) % 100;
  const copiesTotal = status === "lost" ? 1 : (spin % 3) + 1;
  const copiesAvailable =
    status === "available" ? copiesTotal : status === "borrowed" ? 0 : 0;

  const slug = seed.title
    .toLowerCase()
    .replace(/['’]/g, "")
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
    language: seed.titleBn ? "bn" : "en",
    isbn: seed.file?.isbn ?? `978-984-${String(10000 + i * 131).slice(0, 5)}-${(i % 9) + 1}`,
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
    // `format` describes the file that is actually served, and the only sample
    // in private storage is a PDF — so every seeded book is a PDF. Labelling
    // one in seven as EPUB would put "Download EPUB" on a button that hands
    // over a .pdf. The admin form still offers both for real uploads.
    format: "pdf",
    fileSizeMb: seed.file?.sizeMb ?? Math.round((1.4 + ((i * 17) % 90) / 10) * 10) / 10,
    // Not a path to the file — a request for it. Every book is served by the
    // same route, which checks for an account before it opens anything. What
    // is behind this address is in `bookFiles` below, and never leaves the
    // server.
    fileUrl: `/api/file/${slug}`,
    downloads: 480 + ((i * 613) % 9200),
    rating: Math.round((3.6 + ((i * 7) % 14) / 10) * 10) / 10,
    featured: seed.featured ?? false,
    addedAt:
      seed.file?.addedAt ??
      new Date(Date.UTC(2025, (i * 5) % 12, ((i * 3) % 27) + 1))
        .toISOString()
        .slice(0, 10),
    uploadedBy: seed.file?.uploadedBy ?? uploaders[i % uploaders.length],
  };
}

export const books: Book[] = seeds.map(buildBook);

/** The demo file every book without one of its own is served from. */
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
    seeds[i].file?.url.split("/").pop() ?? sampleFileName,
  ]),
);

// Backfill the denormalised counts now that every book exists.
for (const c of categories) {
  c.bookCount = books.filter((b) => b.categoryId === c.id).length;
}
for (const a of authors) {
  a.bookCount = books.filter((b) => b.authorId === a.id).length;
}
