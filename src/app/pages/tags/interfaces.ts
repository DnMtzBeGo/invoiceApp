export interface Action {
  label: string;
  id: string;
  icon: string;
}

export interface StatusOptions {
  label: string;
  value: string;
  id: number;
}

export interface Column {
  id: string;
  label: string;
  filter?: string;
  input?: string;
  sort?: boolean;
  options?: StatusOptions[];
}

export interface Page {
  size: number;
  index: number;
  total: number;
}

export interface Lang {
  selected: string;
  paginator: LangPaginator;
  filter: LangFilter;
}

export interface LangFilter {
  input: string;
  selector: string;
}

export interface LangPaginator {
  total: string;
  totalOf: string;
  nextPage: string;
  prevPage: string;
  itemsPerPage: string;
}

export interface SelectedRow {
  showColumnSelection: boolean;
  selectionLimit: number;
  keyPrimaryRow: string;
}

export interface SearchQuery {
  limit: number;
  page: number;
  sort: string;
  match: string;
}
