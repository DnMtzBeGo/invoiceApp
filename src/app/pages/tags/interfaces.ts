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
  hide?: boolean;
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
  selectRow?: {
    selectAll?: string;
  };
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

export interface TagFormParams {
  tag_id?: string;
}

export interface Tag {
  _id?: string;
  name: string;
  carriers?: string[];
  date_created?: string | number;
  last_update?: string | number;
  number_of_drivers?: number;
}

export interface TagDriver {
  selection_check?: boolean;
  _id: string;
  nickname: string;
  email: string;
  telephone?: string;
  thumbnail?: string;
  tags: string[];
}
