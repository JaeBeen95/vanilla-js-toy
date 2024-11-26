import { NewsFeed, NewsStore } from "./types";

export default class Store implements NewsStore {
  private feeds: NewsFeed[];
  private _currentPage: number;
  private itemsPerPage: number = 10;

  constructor() {
    this.feeds = [];
    this._currentPage = 1;
  }

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(page: number) {
    this._currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.feeds.length / this.itemsPerPage);
  }

  get nextPage(): number {
    return this._currentPage < this.totalPages ? this._currentPage + 1 : this.totalPages;
  }

  get prevPage(): number {
    return this._currentPage <= 1 ? 1 : this._currentPage - 1;
  }

  get numberOfFeeds(): number {
    return this.feeds.length;
  }

  get hasFeeds(): boolean {
    return this.feeds.length > 0;
  }

  getAllFeeds(): NewsFeed[] {
    return this.feeds;
  }

  getFeed(position: number): NewsFeed {
    return this.feeds[position];
  }

  setFeeds(feeds: NewsFeed[]): void {
    this.feeds = feeds.map((feed) => ({
      ...feed,
      read: false,
    }));
  }

  makeRead(id: number): void {
    const feed = this.feeds.find((feed: NewsFeed) => feed.id === id);

    if (feed) {
      feed.read = true;
    }
  }
}
