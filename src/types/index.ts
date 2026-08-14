/**
 * Domain types for the Pediatric Book Bank catalogue.
 *
 * These shapes are the contract between the data layer and every page.
 * When the mock fixtures are swapped for Postgres, only `lib/data/*`
 * changes — these types and the components that consume them do not.
 */

export type BookStatus = "available" | "borrowed" | "damaged" | "lost";

export type BookLanguage = "bn" | "en";

export type BookFormat = "pdf" | "epub";

export interface Author {
  id: string;
  slug: string;
  name: string;
  nameBn?: string;
  bio: string;
  bioBn?: string;
  era?: string;
  bookCount: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  description: string;
  /** Bengali readers see this; falls back to `description` when absent. */
  descriptionBn?: string;
  icon: string;
  bookCount: number;
}

export interface Book {
  id: string;
  /** Human-facing accession code shown in the admin table, e.g. BK-08745. */
  code: string;
  slug: string;

  title: string;
  titleBn?: string;
  subtitle?: string;

  authorId: string;
  authorName: string;
  authorNameBn?: string;

  categoryId: string;
  categoryName: string;

  publisher: string;
  year: number;
  language: BookLanguage;
  isbn: string;
  pages: number;

  description: string;
  descriptionBn?: string;

  /** Physical-inventory fields — these drive the admin table columns. */
  status: BookStatus;
  copiesTotal: number;
  copiesAvailable: number;
  shelf: string;

  /**
   * Base hue (degrees) for the generated cover art. Real covers will be
   * R2 image URLs later; until then every cover is drawn from this.
   */
  coverHue: number;

  /** File metadata. `fileUrl` points at R2 in production. */
  format: BookFormat;
  fileSizeMb: number;
  fileUrl: string;

  downloads: number;
  rating: number;
  featured: boolean;
  addedAt: string;
  uploadedBy: string;
}

/**
 * What the admin actually supplies when cataloguing a book. Everything else on
 * `Book` — accession code, slug, shelf position, counters — is derived by the
 * data layer, so two librarians can never disagree about the format of a code.
 */
export interface NewBookInput {
  title: string;
  titleBn?: string;
  authorId: string;
  categoryId: string;
  publisher: string;
  year: number;
  language: BookLanguage;
  isbn: string;
  pages: number;
  description: string;
  descriptionBn?: string;
  status: BookStatus;
  copiesTotal: number;
  format: BookFormat;
  fileSizeMb: number;
  featured: boolean;
  /** Cover scheme seed. See `lib/cover-theme`. */
  coverHue: number;
}

export interface NewAuthorInput {
  name: string;
  nameBn?: string;
  bio: string;
  bioBn?: string;
  era?: string;
}

export interface NewCategoryInput {
  name: string;
  nameBn: string;
  description: string;
  descriptionBn?: string;
  icon: string;
}

export interface CatalogueQuery {
  q?: string;
  category?: string;
  language?: BookLanguage;
  status?: BookStatus;
  sort?: "recent" | "popular" | "title" | "year";
  page?: number;
  perPage?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
