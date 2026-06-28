/**
 * Client-safe barrel: types and validation helpers only.
 * Server functions — import from their module paths (e.g. `./list-texts`).
 */
export type { ReaderTextData } from "./get-text-for-reader";
export type { ListTextsFilters, TextListItem } from "./list-texts";
export type { DeleteTextResult } from "./delete-text";
export type { TextEditorialMeta } from "./lookup-text-editorial-meta";
export { validateTextTitle, TEXT_TITLE_MAX_LENGTH } from "./text-title-validation";
