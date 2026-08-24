export interface TmdbResponse<ItemType> {
  page: number;
  results: ItemType[];
  total_pages: number;
  total_results: number;
}