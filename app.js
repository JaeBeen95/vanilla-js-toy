const xhr = new XMLHttpRequest();
const container = document.getElementById("root");
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

function getData(url) {
  xhr.open("GET", url, false);
  xhr.send();

  return JSON.parse(xhr.response);
}

const newsFeed = getData(NEWS_URL);
const ul = document.createElement("ul");

window.addEventListener("hashchange", function () {
  const id = location.hash.substring(1);

  const newsContent = getData(CONTENT_URL.replace("@id", id));
  const title = document.createElement("h1");

  title.innerHTML = newsContent.title;
  content.appendChild(title);
});

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
