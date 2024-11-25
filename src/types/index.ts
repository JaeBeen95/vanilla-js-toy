import View from "../core/view";

export interface Store {
  currentPage: number;
  feeds: NewsFeed[];
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
