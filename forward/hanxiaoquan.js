// 韩小圈 (jennyhow.com) ForwardWidget 模块
// 提供：最新韩剧 / 韩国电影 / 韩国综艺 / 韩国动漫 列表，详情页解析，选集播放(m3u8)，以及搜索。
// 约定见 SKILL.md —— 字段名、link+loadDetail 机制、search 顶层块，均按规范实现。

WidgetMetadata = {
  id: "forward.jennyhow",
  title: "韩小圈",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "韩小圈 (jennyhow.com) 免费韩剧 / 韩影 / 综艺 / 动漫在线观看。",
  author: "Forward",
  site: "https://www.jennyhow.com",
  icon: "https://www.jennyhow.com/mxstatic/picture/logo.png",
  detailCacheDuration: 1800,
  modules: [
    {
      id: "hanju",
      title: "最新韩剧",
      functionName: "loadList",
      cacheDuration: 3600,
      params: [
        { name: "cat", type: "constant", value: "1" },
        { name: "page", type: "page" },
      ],
    },
    {
      id: "movie",
      title: "韩国电影",
      functionName: "loadList",
      cacheDuration: 3600,
      params: [
        { name: "cat", type: "constant", value: "2" },
        { name: "page", type: "page" },
      ],
    },
    {
      id: "variety",
      title: "韩国综艺",
      functionName: "loadList",
      cacheDuration: 3600,
      params: [
        { name: "cat", type: "constant", value: "3" },
        { name: "page", type: "page" },
      ],
    },
    {
      id: "anime",
      title: "韩国动漫",
      functionName: "loadList",
      cacheDuration: 3600,
      params: [
        { name: "cat", type: "constant", value: "4" },
        { name: "page", type: "page" },
      ],
    },
  ],
  search: {
    title: "搜索",
    functionName: "search",
    requiresWebView: true, // search.php 有 WAF 挑战页，需 WebView 执行 JS 绕过
    params: [
      { name: "keyword", title: "关键词", type: "input", placeholders: [{ title: "演员 / 剧名", value: "宋慧乔" }] },
      { name: "page", title: "页码", type: "page" },
    ],
  },
};

const BASE = "https://www.jennyhow.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function reqHeaders() {
  return { "User-Agent": UA, Referer: BASE + "/" };
}

// 列表页 HTML -> VideoItem[]
function parseList(html) {
  const $ = Widget.html.load(html);
  const items = [];
  $(".module-item").each((_, el) => {
    const $card = $(el);
    const $pic = $card.find("a.module-item-pic").first();
    const href = $pic.attr("href") || "";
    const m = href.match(/\/hanxiaoquan\/(\d+)\.html/);
    if (!m) return;
    const id = m[1];
    const title = ($pic.attr("title") || $card.find(".module-item-title").first().text() || "").trim();
    const $img = $pic.find("img").first();
    const poster = ($img.attr("data-src") || $img.attr("src") || "").trim();
    const sub = $card.find(".module-item-text").first().text().trim();
    if (!title) return;
    const item = {
      id: id,
      type: "url",
      title: title,
      link: id,
    };
    if (poster) item.posterPath = poster;
    if (sub) item.releaseDate = sub;
    items.push(item);
  });
  return items;
}

async function loadList(params = {}) {
  try {
    const cat = String(params.cat || "1");
    const page = Number(params.page || 1);
    const url = page <= 1 ? `${BASE}/hxq/${cat}.html` : `${BASE}/hxq/${cat}-${page}.html`;
    const res = await Widget.http.get(url, { headers: reqHeaders(), allow_redirects: true });
    const html = res && res.data ? res.data : "";
    return parseList(html);
  } catch (error) {
    console.error("[loadList] 失败:", error && error.message ? error.message : error);
    throw error;
  }
}

// 提取播放页内嵌的 m3u8 地址： var now="https://.../index.m3u8"
async function fetchM3u8(id, src, ep) {
  const url = `${BASE}/play/${id}-${src}-${ep}.html`;
  const res = await Widget.http.get(url, { headers: reqHeaders() });
  const html = res && res.data ? res.data : "";
  const m = html.match(/var\s+now\s*=\s*["']([^"']+\.m3u8)["']/i);
  return m ? m[1] : undefined;
}

async function loadEpisode(id, src, ep) {
  const videoUrl = await fetchM3u8(id, src, ep);
  return {
    id: `play:${id}:${src}:${ep}`,
    type: "url",
    title: `第${Number(ep) + 1}集`,
    link: `play:${id}:${src}:${ep}`,
    videoUrl: videoUrl || undefined,
    playerType: "system",
  };
}

async function loadDetail(link) {
  if (!link) return null;
  const s = String(link);

  // 选集回链：play:{id}:{src}:{ep} -> 直接返回该集 m3u8
  if (s.startsWith("play:")) {
    const parts = s.split(":");
    if (parts.length === 4) {
      return await loadEpisode(parts[1], parts[2], parts[3]);
    }
    return null;
  }

  const id = s;
  try {
    const res = await Widget.http.get(`${BASE}/hanxiaoquan/${id}.html`, { headers: reqHeaders() });
    const html = res && res.data ? res.data : "";
    const $ = Widget.html.load(html);

    const title = ($(".page-title").first().text() || "").trim();
    const aux = $(".video-info-aux").text() || "";
    const rm = aux.match(/豆瓣\s*([\d.]+)\s*分/);
    const rating = rm ? parseFloat(rm[1]) : undefined;
    const ym = aux.match(/(\d{4})/);
    const year = ym ? ym[1] : undefined;
    const catTitle = $(".video-info-aux a.tag-link").first().text().trim();

    const $desc = $(".content").first();
    const description = ($desc.length ? $desc.text() : $('meta[name="description"]').attr("content") || "").trim();

    const poster = $("img[data-src]")
      .filter((_, el) => {
        const src = $(el).attr("data-src") || "";
        return /yzzyimg|viptulz|lzipic|pic3|image\.v|\.online|doubanio/.test(src);
      })
      .first()
      .attr("data-src");

    const peoples = [];
    $(".video-info-actor a").each((_, a) => {
      const t = $(a).text().trim();
      if (t) peoples.push({ id: $(a).attr("href") || t, title: t });
    });

    // 选集：仅取当前剧的播放列表（playlist1/playlist2 两个源标签去重，按 源:集 去重避免重复）
    const seen = {};
    const episodeItems = [];
    $("#playlist1 a, #playlist2 a").each((_, a) => {
      const h = $(a).attr("href") || "";
      const mm = h.match(/\/play\/(\d+)-(\d+)-(\d+)\.html/);
      if (!mm || mm[1] !== id) return;
      const dedupe = mm[3]; // 按集数去重：playlist1/playlist2 为两路源，只保留一份选集
      if (seen[dedupe]) return;
      seen[dedupe] = true;
      const t = $(a).attr("title") || $(a).text().trim() || `第${Number(mm[3]) + 1}集`;
      episodeItems.push({
        id: `play:${mm[1]}:${mm[2]}:${mm[3]}`,
        type: "url",
        title: t,
        link: `play:${mm[1]}:${mm[2]}:${mm[3]}`,
      });
    });

    // 首集直接给出可播放 m3u8，方便立即播放
    let videoUrl;
    if (episodeItems.length) {
      const em = String(episodeItems[0].link).match(/play:(\d+):(\d+):(\d+)/);
      if (em) videoUrl = await fetchM3u8(em[1], em[2], em[3]);
    }

    const item = {
      id: id,
      type: "url",
      title: title,
      link: id,
      videoUrl: videoUrl || undefined,
      playerType: "system",
    };
    if (poster) {
      item.posterPath = poster;
      item.backdropPaths = [poster];
    }
    if (rating) item.rating = rating;
    if (year) item.releaseDate = year;
    if (description) item.description = description;
    if (catTitle) item.genreItems = [{ id: catTitle, title: catTitle }];
    if (peoples.length) item.peoples = peoples;
    if (episodeItems.length) item.episodeItems = episodeItems;
    return item;
  } catch (error) {
    console.error("[loadDetail] 失败:", error && error.message ? error.message : error);
    throw error;
  }
}

async function search(params = {}) {
  try {
    const kw = params.keyword;
    if (!kw) return [];
    const page = Number(params.page || 1);
    const url =
      `${BASE}/search.php?searchword=${encodeURIComponent(kw)}` + (page > 1 ? `&page=${page}` : "");
    const res = await Widget.http.get(url, { headers: reqHeaders() });
    const html = res && res.data ? res.data : "";
    return parseList(html);
  } catch (error) {
    console.error("[search] 失败:", error && error.message ? error.message : error);
    throw error;
  }
}
