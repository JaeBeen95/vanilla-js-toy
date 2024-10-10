const xhr = new XMLHttpRequest();
const container = document.getElementById("root");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

function getData(url) {
  xhr.open("GET", url, false);
  xhr.send();

  return JSON.parse(xhr.response);
}

function newsDetail() {
  const id = location.hash.substring(1);

  const newsContent = getData(CONTENT_URL.replace("@id", id));

  container.innerHTML = `
    <h1>${newsContent.title}</h1>
    
    <div>
      <a href='#'>목록으로</a>
    </div>
  `;
}

function newsFeed() {
  const newsFeed = getData(NEWS_URL);
  const newsList = [];

  newsList.push("<ul>");

  for (let i = 0; i < 10; i++) {
    newsList.push(`
      <li>
        <a href='#${newsFeed[i].id}'>
          ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
      </li>
    `);
  }

  newsList.push("</ul>");

  container.innerHTML = newsList.join("");
}

function router() {
  const routerPath = location.hash;

  if (routerPath === "") {
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener("hashchange", router);

router();
