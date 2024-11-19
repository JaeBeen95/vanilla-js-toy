const xhr = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";

xhr.open("GET", NEWS_URL, false);
xhr.send();

const newsFeed = JSON.parse(xhr.response);
const ul = document.createElement("ul");

for (let i = 0; i < 10; i++) {
  const li = document.createElement("li");
  li.innerHTML = newsFeed[i].title;

  ul.appendChild(li);
}

document.getElementById("root").appendChild(ul);
