const container = document.getElementById("root");
const xhr = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";
const store = {
  currentPage: 1,
};

function getData(url) {
  xhr.open("GET", url, false);
  xhr.send();

  return JSON.parse(xhr.response);
}

function newsDetail() {
  const id = location.hash.substring(7);

  const newsContent = getData(CONTENT_URL.replace("@id", id));

  container.innerHTML = `
    <h1>${newsContent.title}</h1>
    
    <div>
      <a href='#/page/${store.currentPage}'>목록으로</a>
    </div>
  `;
}

function newsFeed() {
  const newsFeed = getData(NEWS_URL);
  const newsList = [];

  newsList.push("<ul>");

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
      <li>
        <a href='#/show/${newsFeed[i].id}'>
          ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
      </li>
    `);
  }

  newsList.push("</ul>");
  newsList.push(`
      <div>
        <a href='#/page/${
          store.currentPage > 1 ? store.currentPage - 1 : 1
        }'>이전 페이지</a>
        <a href='#/page/${
          store.currentPage * 10 < newsFeed.length
            ? store.currentPage + 1
            : store.currentPage
        }'>다음 페이지</a>
      </div>
    `);

  container.innerHTML = newsList.join("");
}

function router() {
  const routerPath = location.hash;

  if (routerPath === "") {
    newsFeed();
  } else if (routerPath.indexOf("#/page/") >= 0) {
    store.currentPage = Number(routerPath.substring(7));
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener("hashchange", router);

router();
