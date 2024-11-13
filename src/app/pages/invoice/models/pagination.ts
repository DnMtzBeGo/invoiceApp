export interface Paginator {
  pageIndex: number;
  pageSize: number;
  pageTotal: number;
  pageSearch: string;
  total?: number;
  pages?: number;
}
