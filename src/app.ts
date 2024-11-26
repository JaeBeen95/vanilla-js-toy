import Router from "./core/router";
import Store from "./store";
import { NewsFeedView, NewsDetailView } from "./page";
import { NewsStore } from "./types";

const store: NewsStore = new Store();
const router: Router = new Router();
const newsFeedView = new NewsFeedView("root", store);
const newsDetailView = new NewsDetailView("root", store);

router.setDefaultPage(newsFeedView);

router.addRoutePath("/page/", newsFeedView, /page\/(\d+)/);
router.addRoutePath("/show/", newsDetailView, /show\/(\d+)/);

router.go();
