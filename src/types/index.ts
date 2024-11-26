import View from "../core/view";

export interface NewsStore {
  currentPage: number;
  totalPages: number;
  nextPage: number;
  prevPage: number;
  numberOfFeeds: number;
  hasFeeds: boolean;
  getAllFeeds: () => NewsFeed[];
  getFeed: (position: number) => NewsFeed;
  setFeeds: (feeds: NewsFeed[]) => void;
  makeRead: (id: number) => void;
}

export interface News {
  readonly id: number;
  readonly user: string;
  readonly time: number;
  readonly time_ago: string;
  readonly type: string;
  readonly url: string;
}

export interface NewsFeed extends News {
  readonly title: string;
  readonly points: number;
  readonly comments_count: number;
  readonly domain: string;
  read?: boolean;
}

export interface NewsDetail extends News {
  readonly title: string;
  readonly points: number;
  readonly content: string;
  readonly comments: NewsComments[];
  readonly comments_count: number;
  readonly domain: string;
}

export interface NewsComments extends News {
  readonly content: string;
  readonly comments: NewsComments[];
  readonly level: number;
}

export interface RouteInfo {
  path: string;
  page: View;
  params: RegExp | null;
}
