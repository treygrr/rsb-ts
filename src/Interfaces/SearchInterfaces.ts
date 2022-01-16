export interface ItemData {
  image: string,
  name: string,
  id: string,
  members: boolean,
  price: string,
  change: string,
}

export interface PageData {
  currentPage: number,
  totalPageNumber: number,
}

export interface DataReturn {
  matchedResults: ItemData[],
  errors?: Boolean,
  errorMessages: string[],
  pageData?: PageData,
}