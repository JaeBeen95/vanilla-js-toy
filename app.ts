interface Store {
  currentPage: number;
  feeds: NewsFeed[];
}

interface News {
  readonly id: number;
  readonly user: string;
  readonly time: number;
  readonly time_ago: string;
  readonly type: string;
  readonly url: string;
}

interface NewsFeed extends News {
  readonly title: string;
  readonly points: number;
  readonly comments_count: number;
  readonly domain: string;
  read?: boolean;
}

interface NewsDetail extends News {
  readonly title: string;
  readonly points: number;
  readonly content: string;
  readonly comments: NewsComments[];
  readonly comments_count: number;
  readonly domain: string;
}

interface NewsComments extends News {
  readonly content: string;
  readonly comments: NewsComments[];
  readonly level: number;
}

interface RouteInfo {
  path: string;
  page: View;
}

const container: HTMLElement | null = document.getElementById("root");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";
const store: Store = {
  currentPage: 1,
  feeds: [],
};

function parseIdFromHash(hash: string): string {
  const match = hash.match(/^#\/[^/]+\/(\d+)$/);
  return match ? match[1] : "";
}

class Api {
  url: string;
  ajax: XMLHttpRequest;

  constructor(url: string) {
    this.url = url;
    this.ajax = new XMLHttpRequest();
  }

  getRequest<ajaxResponse>(): ajaxResponse {
    this.ajax.open("GET", this.url, false);
    this.ajax.send();

    return JSON.parse(this.ajax.response);
  }
}

class NewsFeedApi extends Api {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>();
  }
}

class NewsDetailApi extends Api {
  getData(): NewsDetail {
    return this.getRequest<NewsDetail>();
  }
}

abstract class View {
  private container: HTMLElement;
  private template: string;
  private renderTemplate: string;
  private htmlList: string[];

  constructor(containerId: string, template: string) {
    const containerElement = document.getElementById(containerId);

    if (!containerElement) {
      throw "최상위 컨테이너가 없어 UI를 진행하지 못합니다.";
    }

    this.container = containerElement;
    this.template = template;
    this.renderTemplate = template;
    this.htmlList = [];
  }

  protected updateView(): void {
    this.container.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template;
  }

  protected addHtml(htmlString: string): void {
    this.htmlList.push(htmlString);
  }

  protected getHtml(): string {
    const snapshot = this.htmlList.join("");
    this.clearHtmlList();
    return snapshot;
  }

  protected setTemplateData(key: string, value: string): void {
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
  }

  private clearHtmlList(): void {
    this.htmlList = [];
  }

  abstract render(): void;
}

class NewsFeedView extends View {
  private api: NewsFeedApi;
  private feeds: NewsFeed[];

  constructor(containerId: string) {
    let template: string = `
      <div class="bg-gray-600 min-h-screen">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                  Previous
                </a>
                <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                  Next
                </a>
              </div>
            </div> 
          </div>
        </div>
        <div class="p-4 text-2xl text-gray-700">
          {{__news_feed__}}        
        </div>
      </div>
    `;

    super(containerId, template);

    this.api = new NewsFeedApi(NEWS_URL);
    this.feeds = store.feeds;

    if (store.feeds.length === 0) {
      this.feeds = store.feeds = this.api.getData();
      this.makeFeeds();
    }
  }

  render(): void {
    store.currentPage = Number(parseIdFromHash(location.hash) || 1);

    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
      const { read, id, title, comments_count, user, points, time_ago } = this.feeds[i];

      this.addHtml(`
        <div class="p-6 ${
          read ? "bg-red-500" : "bg-white"
        } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
          <div class="flex">
            <div class="flex-auto">
              <a href="#/show/${id}">${title}</a>  
            </div>
            <div class="text-center text-sm">
              <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
            </div>
          </div>
          <div class="flex mt-3">
            <div class="flex gap-5 text-sm text-gray-500 w-full items-center justify-start">
              <div class="flex items-center"><i class="fas fa-user mr-1"></i>${user}</div>
              <div class="flex items-center"><i class="fas fa-heart mr-1"></i>${points}</div>
              <div class="flex items-center"><i class="far fa-clock mr-1"></i>${time_ago}</div>
            </div>
          </div>
        </div>    
      `);
    }

    const totalPages: number = Math.ceil(this.feeds.length / 10);

    this.setTemplateData("news_feed", this.getHtml());
    this.setTemplateData("prev_page", String(store.currentPage <= 1 ? 1 : store.currentPage - 1));
    this.setTemplateData(
      "next_page",
      String(store.currentPage >= totalPages ? totalPages : store.currentPage + 1)
    );

    this.updateView();
  }

  makeFeeds(): void {
    for (let i = 0; i < this.feeds.length; i++) {
      this.feeds[i].read = false;
    }
  }
}

class NewsDetailView extends View {
  constructor(containerId: string) {
    let template: string = `
      <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/{{__current_page__}}" class="text-gray-500">
                  <i class="fa fa-times"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
  
        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
          <h2>{{__title__}}</h2>
          <div class="text-gray-400 h-20">{{__content__}}</div>
  
          {{__comments__}}
  
        </div>
      </div>
    `;

    super(containerId, template);
  }

  render(): void {
    const id = router.getIdFromHash();
    const api = new NewsDetailApi(CONTENT_URL.replace("@id", id));
    const newsDetail = api.getData();

    for (let i = 0; i < store.feeds.length; i++) {
      if (store.feeds[i].id === Number(id)) {
        store.feeds[i].read = true;
        break;
      }
    }

    this.setTemplateData("comments", this.makeComment(newsDetail.comments));
    this.setTemplateData("current_page", String(store.currentPage));
    this.setTemplateData("title", newsDetail.title);
    this.setTemplateData("content", newsDetail.content);

    this.updateView();
  }

  makeComment(comments: NewsComments[]): string {
    for (let i = 0; i < comments.length; i++) {
      const { level, user, time_ago, content, comments: childComments } = comments[i];
      this.addHtml(`
        <div style="padding-left: ${level * 40}px" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${user}</strong> ${time_ago}
          </div>
          <p class="text-gray-700">${content}</p>
        </div>      
      `);
      if (childComments.length > 0) {
        this.addHtml(this.makeComment(childComments));
      }
    }

    return this.getHtml();
  }
}

class Router {
  private routeTable: RouteInfo[];
  private defaultRoute: RouteInfo | null;

  constructor() {
    window.addEventListener("hashchange", this.route.bind(this));

    this.routeTable = [];
    this.defaultRoute = null;
  }

  setDefaultPage(page: View): void {
    this.defaultRoute = { path: "", page };
  }

  addRoutePath(path: string, page: View): void {
    this.routeTable.push({ path, page });
  }

  getIdFromHash(): string {
    return parseIdFromHash(location.hash);
  }

  route() {
    const routePath = location.hash;

    if (routePath === "" && this.defaultRoute) {
      this.defaultRoute?.page.render();
    }

    for (const routeInfo of this.routeTable) {
      if (routePath.indexOf(routeInfo.path) >= 0) {
        routeInfo.page.render();
        break;
      }
    }
  }
}

const router: Router = new Router();
const newsFeedView = new NewsFeedView("root");
const newsDetailView = new NewsDetailView("root");

router.setDefaultPage(newsFeedView);
router.addRoutePath("/page/", newsFeedView);
router.addRoutePath("/show/", newsDetailView);

router.route();
