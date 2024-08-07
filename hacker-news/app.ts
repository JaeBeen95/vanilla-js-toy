interface Store {
  currentPage: number;
  feeds: NewsFeed[];
}

interface News {
  readonly id: number;
  readonly time_ago: string;
  readonly title: string;
  readonly url: string;
  readonly user: string;
  readonly content: string;
}

interface NewsFeed extends News {
  readonly comments_count: number;
  readonly points: number;
  read?: boolean;
}

interface NewsDetail extends News {
  readonly comments: [];
}

interface NewsComment extends News {
  readonly comments: [];
  readonly level: number;
}

const container: HTMLElement | null = document.getElementById("root");
const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";
const store: Store = {
  currentPage: 1,
  feeds: [],
};

function getData<AjaxResponse>(url: string): AjaxResponse {
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function makeFeed(feeds: NewsFeed[]): NewsFeed[] {
  feeds.forEach((feed) => {
    feed.read = false;
  });

  return feeds;
}

function updateView(html: string): void {
  if (container) {
    container.innerHTML = html;
  } else {
    console.error("최상위 컨테이너가 없어 UI를 진행하지 못합니다.");
  }
}

function newsFeed(): void {
  let newsFeed: NewsFeed[] = store.feeds;
  let template = `
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

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeed(getData<NewsFeed[]>(NEWS_URL));
  }

  const newsList = newsFeed
    .slice((store.currentPage - 1) * 10, store.currentPage * 10)
    .map((news) => {
      const { id, title, comments_count, user, points, time_ago, read } = news;
      return `
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
            <div class="grid grid-cols-3 text-sm text-gray-500">
              <div><i class="fas fa-user mr-1"></i>${user}</div>
              <div><i class="fas fa-heart mr-1"></i>${points}</div>
              <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
            </div>  
          </div>
        </div>    
      `;
    })
    .join("");

  const totalPages = Math.ceil(newsFeed.length / 10);
  const prevPage = String(store.currentPage > 1 ? store.currentPage - 1 : 1);
  const nextPage = String(
    store.currentPage < totalPages ? store.currentPage + 1 : totalPages
  );

  template = template.replace("{{__news_feed__}}", newsList);
  template = template.replace("{{__prev_page__}}", prevPage);
  template = template.replace("{{__next_page__}}", nextPage);

  updateView(template);
}

function newsDetail(): void {
  const id = location.hash.substring(7);
  const newsContent = getData<NewsDetail>(CONTENT_URL.replace("@id", id));
  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>

        {{__comments__}}

      </div>
    </div>
  `;

  const feedToUpdate = store.feeds.filter((feed) => feed.id === Number(id))[0];
  if (feedToUpdate) {
    feedToUpdate.read = true;
  }

  updateView(
    template.replace("{{__comments__}}", makeComment(newsContent.comments))
  );
}

function makeComment(comments: NewsComment[]): string {
  const commentString = comments
    .map((comment) => {
      const { level, user, time_ago, content, comments } = comment;

      return `
      <div style="padding-left: ${level * 40}px;" class="mt-4">
        <div class="text-gray-400">
          <i class="fa fa-sort-up mr-2"></i>
          <strong>${user}</strong> ${time_ago}
        </div>
        <p class="text-gray-700">${content}</p>
      </div>
      ${comments.length > 0 ? makeComment(comments) : ""}
    `;
    })
    .join("");

  return commentString;
}

function router(): void {
  const routePath = location.hash;

  if (routePath === "") {
    newsFeed();
  } else if (routePath.indexOf("#/page/") >= 0) {
    store.currentPage = Number(routePath.substring(7));
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener("hashchange", router);

router();
