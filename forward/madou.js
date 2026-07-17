WidgetMetadata = {
  id: "forward.madou",
  title: "麻豆社",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  description: "麻豆社 - madou.club 国产剧情中文对白视频聚合",
  author: "Forward",
  site: "https://madou.club",
  icon: "https://madou.club/showcase/img/logo.png",
  detailCacheDuration: 300,
  modules: [
    {
      id: "loadList",
      title: "最新",
      functionName: "loadList",
      cacheDuration: 3600,
      params: [
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "loadCategory",
      title: "分类",
      functionName: "loadCategory",
      cacheDuration: 3600,
      params: [
        {
          name: "category",
          title: "分类",
          type: "enumeration",
          enumOptions: [
            { title: "麻豆传媒", value: "麻豆传媒" },
            { title: "麻豆番外篇", value: "麻豆番外篇" },
            { title: "麻豆花絮", value: "麻豆花絮" },
            { title: "HongKongDoll", value: "hongkongdoll" },
            { title: "PsychopornTW", value: "psychoporntw" },
            { title: "91制片厂", value: "91制片厂" },
            { title: "果冻传媒", value: "果冻传媒" },
            { title: "蜜桃影像", value: "蜜桃影像" },
            { title: "天美传媒", value: "天美传媒" },
            { title: "皇家华人", value: "皇家华人" },
            { title: "兔子先生", value: "兔子先生" },
            { title: "星空无限传媒", value: "星空无限传媒" },
            { title: "爱豆", value: "爱豆" },
            { title: "麻豆导演系列", value: "麻豆导演系列" },
            { title: "大象传媒", value: "大象传媒" },
            { title: "猫爪影像", value: "猫爪影像" },
            { title: "精东影业", value: "精东影业" },
            { title: "杏吧", value: "杏吧" },
            { title: "乐播传媒", value: "乐播传媒" },
            { title: "草莓", value: "草莓" },
            { title: "抖阴", value: "抖阴" },
            { title: "SA国际传媒", value: "sa国际传媒" },
            { title: "起点传媒/性视界传媒", value: "起点传媒-性视界传媒" },
            { title: "大鸟十八", value: "大鸟十八" },
            { title: "小鹏奇啪行", value: "小鹏奇啪行" },
            { title: "女优淫娃培训营", value: "女优淫娃培训营" },
            { title: "淫欲游戏王", value: "淫欲游戏王" },
            { title: "女神羞羞研究所", value: "女神羞羞研究所" },
            { title: "突袭女优家", value: "突袭女优家" },
            { title: "情趣K歌房", value: "情趣K歌房" },
            { title: "KISS糖果屋", value: "kiss糖果屋" },
          ],
        },
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "loadTags",
      title: "标签",
      functionName: "loadTags",
      cacheDuration: 3600,
      params: [
        {
          name: "tag",
          title: "标签",
          type: "enumeration",
          enumOptions: [
            { title: "白虎", value: "白虎" },
            { title: "后入", value: "后入" },
            { title: "少妇", value: "少妇" },
            { title: "无套", value: "无套" },
            { title: "口交", value: "口交" },
            { title: "乱伦", value: "乱伦" },
            { title: "黑丝", value: "黑丝" },
            { title: "痴女", value: "痴女" },
            { title: "爆乳", value: "爆乳" },
            { title: "巨乳", value: "巨乳" },
            { title: "骑乘位", value: "骑乘位" },
            { title: "人妻", value: "人妻" },
            { title: "美臀", value: "美臀" },
            { title: "日本", value: "日本" },
            { title: "内射", value: "内射" },
            { title: "制服", value: "制服" },
            { title: "丝袜", value: "丝袜" },
            { title: "御姐", value: "御姐" },
            { title: "美乳", value: "美乳" },
            { title: "开裆", value: "开裆" },
            { title: "NTR", value: "ntr" },
            { title: "约炮", value: "约炮" },
            { title: "贫乳", value: "贫乳" },
            { title: "自慰", value: "自慰" },
            { title: "女优", value: "女优" },
            { title: "高潮", value: "高潮" },
            { title: "调教", value: "调教" },
            { title: "企划", value: "企划" },
            { title: "熟女", value: "熟女" },
            { title: "兄妹", value: "兄妹" },
            { title: "反差婊", value: "反差婊" },
            { title: "创意", value: "创意" },
            { title: "清纯", value: "清纯" },
            { title: "近亲", value: "近亲" },
            { title: "美少女", value: "美少女" },
            { title: "OL", value: "ol" },
            { title: "3P", value: "3p" },
            { title: "白丝", value: "白丝" },
            { title: "女教师", value: "女教师" },
            { title: "姐弟", value: "姐弟" },
            { title: "强奸", value: "强奸" },
            { title: "足交", value: "足交" },
            { title: "斑斑", value: "斑斑" },
            { title: "女友", value: "女友" },
            { title: "新人", value: "新人" },
            { title: "师生", value: "师生" },
            { title: "中出", value: "中出" },
            { title: "69", value: "69" },
            { title: "迷奸", value: "迷奸" },
            { title: "双马尾", value: "双马尾" },
          ],
        },
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "loadRanking",
      title: "点赞排行",
      functionName: "loadRanking",
      cacheDuration: 3600,
      params: [
        { name: "page", title: "页码", type: "page" },
      ],
    },
  ],
  search: {
    title: "搜索",
    functionName: "search",
    params: [
      { name: "keyword", title: "关键词", type: "input" },
      { name: "page", title: "页码", type: "page" },
    ],
  },
};

// --- Constants ---

const BASE_URL = "https://madou.club";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: BASE_URL,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
};

// --- Utility Functions ---

/**
 * Build list page URL
 * @param {number} page - Page number (1-based)
 * @param {string|null} categorySlug - Category slug (decoded)
 * @param {string|null} tagSlug - Tag slug (decoded)
 * @param {string|null} keyword - Search keyword
 * @returns {string} Full URL
 */
function buildListUrl(page, categorySlug, tagSlug, keyword) {
  if (keyword) {
    const q = "s=" + encodeURIComponent(keyword);
    if (page <= 1) return BASE_URL + "/?" + q;
    return BASE_URL + "/page/" + page + "/?" + q;
  }
  if (tagSlug) {
    const slug = encodeURIComponent(tagSlug);
    if (page <= 1) return BASE_URL + "/tag/" + slug;
    return BASE_URL + "/tag/" + slug + "/page/" + page + "/";
  }
  if (categorySlug) {
    const slug = encodeURIComponent(categorySlug);
    if (page <= 1) return BASE_URL + "/category/" + slug;
    return BASE_URL + "/category/" + slug + "/page/" + page + "/";
  }
  if (page <= 1) return BASE_URL + "/";
  return BASE_URL + "/page/" + page + "/";
}

/**
 * Parse list items from HTML
 * Selector: article.excerpt
 *   - a.thumbnail[href] -> detail link
 *   - img.thumb[data-src] -> poster (lazy-loaded real URL)
 *   - h2 a -> title
 *   - a.post-like[data-pid] -> post ID
 *   - .post-view -> view count text
 *   - footer a[href*="/category/"] -> category link
 * @param {string} html
 * @returns {VideoItem[]}
 */
function parseList(html) {
  const $ = Widget.html.load(html);
  const items = [];

  $("article.excerpt").each(function (i, el) {
    const $el = $(this);
    const $thumb = $el.find("a.thumbnail");
    const $titleA = $el.find("h2 a");
    const $img = $el.find("img.thumb");
    const $like = $el.find("a.post-like");
    const $view = $el.find(".post-view");
    const $catLink = $el.find("footer a[href*='/category/']");

    const link = $thumb.attr("href") || $titleA.attr("href");
    if (!link) return;

    const posterPath =
      $img.attr("data-src") || $img.attr("src") || "";

    const title = $titleA.text().trim();
    const postId = $like.attr("data-pid") || "";
    const viewText = $view.text().trim();

    const descParts = [];
    if (viewText) descParts.push(viewText);
    const catName = $catLink.text().trim();
    if (catName) descParts.push(catName);

    items.push({
      id: postId || link,
      type: "url",
      title: title,
      posterPath: posterPath,
      link: link,
      description: descParts.join(" · ") || undefined,
    });
  });

  return items;
}

/**
 * Parse view count text "观看(52.38K)" -> 52380
 */
function parseViewCount(text) {
  if (!text) return 0;
  const m = text.match(/([\d.]+)\s*([KM]?)/i);
  if (!m) return 0;
  let n = parseFloat(m[1]);
  const unit = (m[2] || "").toUpperCase();
  if (unit === "K") n *= 1000;
  else if (unit === "M") n *= 1000000;
  return Math.round(n);
}

// --- Handler Functions ---

/**
 * Latest list (homepage)
 * Supports genreId redirect from detail page:
 *   - plain slug -> category filter
 *   - "tag:{slug}" -> tag filter
 */
async function loadList(params = {}) {
  try {
    const page = Number(params.page || 1);
    const genreId = params.genreId || "";

    let categorySlug = null;
    let tagSlug = null;

    if (genreId) {
      if (genreId.startsWith("tag:")) {
        tagSlug = genreId.substring(4);
      } else {
        categorySlug = genreId;
      }
    }

    const url = buildListUrl(page, categorySlug, tagSlug, null);
    const res = await Widget.http.get(url, { headers: HEADERS });
    const items = parseList(res.data);
    if (!items.length) throw new Error("空响应或无更多内容");
    return items;
  } catch (error) {
    console.error("[loadList] 失败:", error.message || error);
    throw error;
  }
}

/**
 * Category list
 * Also supports genreId redirect (overrides category param)
 */
async function loadCategory(params = {}) {
  try {
    const page = Number(params.page || 1);
    let category = params.category || "麻豆传媒";
    let tagSlug = null;

    const genreId = params.genreId || "";
    if (genreId) {
      if (genreId.startsWith("tag:")) {
        tagSlug = genreId.substring(4);
        category = null;
      } else {
        category = genreId;
      }
    }

    const url = buildListUrl(page, category, tagSlug, null);
    const res = await Widget.http.get(url, { headers: HEADERS });
    const items = parseList(res.data);
    if (!items.length) throw new Error("空响应或无更多内容");
    return items;
  } catch (error) {
    console.error("[loadCategory] 失败:", error.message || error);
    throw error;
  }
}

/**
 * Tag list
 * @param params.tag - tag slug (decoded)
 * @param params.page - page number
 */
async function loadTags(params = {}) {
  try {
    const page = Number(params.page || 1);
    const tagSlug = params.tag || "";

    // genreId redirect (overrides tag param)
    const genreId = params.genreId || "";
    let finalTag = tagSlug;
    let categorySlug = null;
    if (genreId) {
      if (genreId.startsWith("tag:")) {
        finalTag = genreId.substring(4);
      } else {
        categorySlug = genreId;
        finalTag = null;
      }
    }

    const url = buildListUrl(page, categorySlug, finalTag, null);
    const res = await Widget.http.get(url, { headers: HEADERS });
    const items = parseList(res.data);
    if (!items.length) throw new Error("空响应或无更多内容");
    return items;
  } catch (error) {
    console.error("[loadTags] 失败:", error.message || error);
    throw error;
  }
}

/**
 * Likes ranking (single page, 100 items, no pagination)
 * URL: /likes
 */
async function loadRanking(params = {}) {
  try {
    const url = BASE_URL + "/likes";
    const res = await Widget.http.get(url, { headers: HEADERS });
    const items = parseList(res.data);
    if (!items.length) throw new Error("空响应或无更多内容");
    return items;
  } catch (error) {
    console.error("[loadRanking] 失败:", error.message || error);
    throw error;
  }
}

/**
 * Search
 * URL: /?s=keyword (page 1)  /page/N/?s=keyword (page N)
 */
async function search(params = {}) {
  try {
    const keyword = (params.keyword || "").trim();
    const page = Number(params.page || 1);
    if (!keyword) return [];

    const url = buildListUrl(page, null, null, keyword);
    const res = await Widget.http.get(url, { headers: HEADERS });
    const items = parseList(res.data);
    return items;
  } catch (error) {
    console.error("[search] 失败:", error.message || error);
    throw error;
  }
}

/**
 * Detail page (receives link string)
 *
 * Parses:
 *   - h1.article-title -> title
 *   - article.article-content iframe[src] -> video URL
 *   - div.article-meta .item-3 a -> category (genreItems[0])
 *   - div.article-tags a -> tags (genreItems[1..N])
 *   - div.article-meta .item-4 -> view count
 *   - div.postitems li -> related items
 *   - meta[name=description] -> synopsis
 *   - meta[name=keywords] -> keywords
 *
 * @param {string} link - Detail page URL
 * @returns {VideoItem|null}
 */
async function loadDetail(link) {
  try {
    const url = String(link);
    const res = await Widget.http.get(url, { headers: HEADERS });
    const $ = Widget.html.load(res.data);

    const title = $("h1.article-title").text().trim() || url;

    let videoUrl = "";
    const iframeSrc = $("article.article-content iframe").attr("src");
    if (iframeSrc) {
      videoUrl = iframeSrc.trim();
    }

    const genreItems = [];

    // Main category
    const $catLink = $("div.article-meta .item-3 a");
    const catName = $catLink.text().trim();
    const catHref = $catLink.attr("href") || "";
    const catMatch = catHref.match(/\/category\/([^\/]+)/);
    if (catName) {
      genreItems.push({
        id: catMatch ? decodeURIComponent(catMatch[1]) : catName,
        title: catName,
      });
    }

    // Tags (id with "tag:" prefix for loadList/loadCategory/loadTags redirect)
    $("div.article-tags a").each(function () {
      const $tag = $(this);
      const tagText = $tag.text().trim();
      const tagHref = $tag.attr("href") || "";
      const tagMatch = tagHref.match(/\/tag\/([^\/]+)/);
      if (tagText) {
        genreItems.push({
          id: "tag:" + (tagMatch ? decodeURIComponent(tagMatch[1]) : tagText),
          title: tagText,
        });
      }
    });

    const viewText = $("div.article-meta .item-4").text().trim();
    const viewCount = parseViewCount(viewText);

    // Related items
    const relatedItems = [];
    $("div.postitems li").each(function () {
      const $li = $(this);
      const $a = $li.find("a");
      const href = $a.attr("href");
      if (!href) return;
      const $img = $li.find("img.thumb");
      const imgSrc = $img.attr("data-src") || $img.attr("src") || "";
      const relTitle = $a.text().trim();
      relatedItems.push({
        id: href,
        type: "url",
        title: relTitle,
        posterPath: imgSrc,
        link: href,
      });
    });

    const descParts = [];
    const metaDesc = $('meta[name="description"]').attr("content") || "";
    if (metaDesc) descParts.push(metaDesc);
    const metaKeywords = $('meta[name="keywords"]').attr("content") || "";
    if (metaKeywords) descParts.push("标签: " + metaKeywords);
    if (viewText) descParts.push(viewText);
    const description = descParts.join("\n") || undefined;

    return {
      id: url,
      type: "url",
      title: title,
      link: url,
      description: description,
      videoUrl: videoUrl || undefined,
      playerType: "system",
      genreItems: genreItems.length ? genreItems : undefined,
      relatedItems: relatedItems.length ? relatedItems : undefined,
    };
  } catch (error) {
    console.error("[loadDetail] 失败:", error.message || error);
    throw error;
  }
}
