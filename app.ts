interface News {
  id: number;
  user: string;
  time: number;
  time_ago: string;
  type: string;
  url: string;
}

interface NewsFeed extends News {
  title: string;
  points: number;
  comments_count: number;
  domain: string;
  read?: boolean;
}

interface NewsDetail extends News {
  title: string;
  points: number;
  content: string;
  comments: NewsComments[];
  comments_count: number;
  domain: string;
}

interface NewsComments extends News {
  content: string;
  comments: NewsComments[];
  level: number;
}

interface Store {
  currentPage: number;
  feeds: NewsFeed[];
}

const container: HTMLElement | null = document.getElementById("root");
const ajax: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";
const store: Store = {
  currentPage: 1,
  feeds: [],
};

function getData<ajaxResponse>(url: string): ajaxResponse {
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}

function updateView(html: string): void {
  if (container !== null) {
    container.innerHTML = html;
  } else {
    console.error("최상위 컨테이너가 없어 UI를 진행하지 못합니다.");
  }
}

function newsFeed(): void {
  let newsFeed = store.feeds;
  const newsList = [];
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

  if (store.feeds.length === 0) {
    newsFeed = store.feeds = makeFeeds(getData<NewsFeed[]>(NEWS_URL));
  }

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
      <div class="p-6 ${
        newsFeed[i].read ? "bg-red-500" : "bg-white"
      } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
              newsFeed[i].comments_count
            }</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="flex gap-5 text-sm text-gray-500 w-full items-center justify-start">
            <div class="flex items-center"><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
            <div class="flex items-center"><i class="fas fa-heart mr-1"></i>${
              newsFeed[i].points
            }</div>
            <div class="flex items-center"><i class="far fa-clock mr-1"></i>${
              newsFeed[i].time_ago
            }</div>
          </div>
        </div>
      </div>    
    `);
  }

  const totalPages: number = Math.ceil(newsFeed.length / 10);

  template = template.replace("{{__news_feed__}}", newsList.join(""));
  template = template.replace(
    "{{__prev_page__}}",
    String(store.currentPage <= 1 ? 1 : store.currentPage - 1)
  );
  template = template.replace(
    "{{__next_page__}}",
    String(store.currentPage >= totalPages ? totalPages : store.currentPage + 1)
  );

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

  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  function makeComment(comments: NewsComments[]): string {
    const commentsList = [];

    for (let i = 0; i < comments.length; i++) {
      const comment: NewsComments = comments[i];
      commentsList.push(`
        <div style="padding-left: ${comment.level}px" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>      
      `);
      if (comment.comments.length > 0) {
        commentsList.push(makeComment(comment.comments));
      }
    }

    return commentsList.join("");
  }

  updateView(template.replace("{{__comments__}}", makeComment(newsContent.comments)));
}

function router(): void {
  const routePath = location.hash;

  if (routePath === "") {
    newsFeed();
  } else if (routePath.indexOf("#/page/") >= 0) {
    store.currentPage = +routePath.substring(7);
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener("hashchange", router);
router();
