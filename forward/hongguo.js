// 红果短剧 Widget 模块（ForwardWidget 规范）
WidgetMetadata = {
  id: "hongguo",
  title: "红果短剧",
  description: "全网短剧/漫剧-清爽无加密",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    { id: "home",      title: "真人推荐", functionName: "loadHome",      cacheDuration: 1800, params: [] },
    { id: "manhua",    title: "漫剧推荐", functionName: "loadManhua",    cacheDuration: 1800, params: [] },
    { id: "new",       title: "新剧推荐", functionName: "loadNew",       cacheDuration: 1800, params: [] },
    { id: "hot",       title: "热播榜",   functionName: "loadHotRank",   cacheDuration: 1800, params: [] },
    { id: "newrank",   title: "新剧榜",   functionName: "loadNewRank",   cacheDuration: 1800, params: [] },
    { id: "hotsearch", title: "热搜榜",   functionName: "loadSearchRank",cacheDuration: 1800, params: [] },
    { id: "mustwatch", title: "必看榜",   functionName: "loadMustRank",  cacheDuration: 1800, params: [] },
  ],
  search: {
    title: "搜索短剧",
    functionName: "search",
    params: [
      { name: "keyword", title: "关键词", type: "input", placeholders: [{ title: "短剧/漫剧名称", value: "" }] },
    ],
  },
};

var BASE = "https://www.phpks.com/api/duanju/api";
var UA = "Dart/3.0 (dart:io)";

// ===== 在此填写你的 key（若接口需要鉴权，留空 "" 表示不携带）=====
var KEY = "ExN8LYy2DNJstvFtR5KXj284p6";

function buildUrl(params) {
  var parts = [];
  var keys = Object.keys(params);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
  }
  return BASE + "?" + parts.join("&");
}

function api(params) {
  // 若填写了 KEY，则作为 query 参数 key 自动附加到每个请求
  if (KEY) {
    params = Object.assign({ key: KEY }, params);
  }
  return Widget.http.get(buildUrl(params), {
    headers: {
      "User-Agent": UA,
      "Accept": "application/json, text/plain, */*"
    },
    timeout: 15000
  }).then(function (resp) {
    var d = resp.data;
    if (typeof d === "string") {
      try { d = JSON.parse(d); } catch (e) { return null; }
    }
    return d;
  });
}

// 从响应中提取列表数据
function extractList(data) {
  if (!data) return [];
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.data && data.data.list) return data.data.list;
  if (data.data && data.data.videos) return data.data.videos;
  if (data.data && data.data.items) return data.data.items;
  if (data.list) return data.list;
  if (data.data && Array.isArray(data.data.data)) return data.data.data;
  if (Array.isArray(data)) return data;
  return [];
}

function extractPlayUrl(vid) {
  if (!vid) return "";
  if (typeof vid === "string") return vid;
  if (vid.video_url) return vid.video_url;
  if (vid.url) return vid.url;
  if (vid.play_url) return vid.play_url;
  return "";
}

// 统一列表项 -> VideoItem
function toItem(raw, idx) {
  var id = raw.series_id || raw.id || raw.video_id || ("item_" + idx);
  return {
    id: String(id),
    type: "url",
    title: raw.title || raw.name || raw.series_name || "",
    posterPath: raw.cover || raw.cover_url || raw.poster_url || raw.image_url || raw.thumb || "",
    description: raw.description || raw.desc || raw.intro || "",
    link: String(id),           // 点击 -> loadDetail(link)
  };
}

// ========== 列表模块（均需返回 VideoItem[]）==========
async function loadHome() {
  var data = await api({ action: "feed", tab_type: "38", cell_id: "7641597426175836222", offset: "0" });
  var list = extractList(data).map(toItem);
  if (list.length === 0) throw new Error("真人推荐无数据，请检查 KEY 或接口返回");
  return list;
}

async function loadManhua() {
  var data = await api({ action: "feed", tab_type: "32", cell_id: "7529494301202448446", offset: "0" });
  var list = extractList(data).map(toItem);
  if (list.length === 0) throw new Error("漫剧推荐无数据，请检查 KEY 或接口返回");
  return list;
}

async function loadNew() {
  var data = await api({ action: "new_rec", offset: "0" });
  var list = extractList(data).map(toItem);
  if (list.length === 0) throw new Error("新剧推荐无数据，请检查 KEY 或接口返回");
  return list;
}

async function loadHotRank() {
  var data = await api({ action: "rank", type: "hot_play", offset: "0" });
  var list = extractList(data).map(toItem);
  if (list.length === 0) throw new Error("热播榜无数据，请检查 KEY 或接口返回");
  return list;
}

async function loadNewRank() {
  var data = await api({ action: "rank", type: "new_rank", offset: "0" });
  var list = extractList(data).map(toItem);
  if (list.length === 0) throw new Error("新剧榜无数据，请检查 KEY 或接口返回");
  return list;
}

async function loadSearchRank() {
  var data = await api({ action: "rank", type: "hot_search", offset: "0" });
  var list = extractList(data).map(toItem);
  if (list.length === 0) throw new Error("热搜榜无数据，请检查 KEY 或接口返回");
  return list;
}

async function loadMustRank() {
  var data = await api({ action: "rank", type: "must_watch", offset: "0" });
  var list = extractList(data).map(toItem);
  if (list.length === 0) throw new Error("必看榜无数据，请检查 KEY 或接口返回");
  return list;
}

// ========== 搜索（顶层 search，params.keyword）==========
async function search(params) {
  var kw = (params && params.keyword) || "";
  var data = await api({ action: "search_v1", query: kw, offset: "0" });
  return extractList(data).map(toItem);
}

// ========== 详情（顶层 loadDetail(link)，link 为列表项的 id）==========
async function loadDetail(link) {
  var id = String(link);
  var detailData = await api({ action: "detail", series_id: id, badge: "1" });
  var info = (detailData && detailData.data) || detailData || {};
  var title = info.title || info.series_name || info.name || "";
  var cover = info.cover || info.cover_url || info.poster_url || "";
  var desc = info.description || info.desc || info.intro || "";

  var epList = info.episodes || info.episode_list || info.list || [];
  if (info.data && info.data.episodes) epList = info.data.episodes;
  if (info.data && info.data.list) epList = info.data.list;

  // 逐集解析播放地址，填充 episodeItems[].videoUrl
  var episodeItems = await Promise.all(epList.map(async function (ep, i) {
    var epId = String(ep.video_id || ep.id || ("ep_" + i));
    var epTitle = ep.title || ep.name || ("第" + (i + 1) + "集");
    var videoUrl = "";
    var vid = ep.video_id || ep.id;
    if (vid) {
      try {
        var vd = await api({ action: "video_direct_fq", video_id: String(vid) });
        videoUrl = extractPlayUrl(vd && vd.data ? vd.data : vd);
      } catch (e) { /* 忽略单集失败 */ }
    }
    return {
      id: epId,
      type: "url",
      title: epTitle,
      posterPath: cover,
      videoUrl: videoUrl,
      link: epId,
    };
  }));

  return {
    id: id,
    type: "url",
    title: title,
    posterPath: cover,
    description: desc,
    link: id,
    episodeItems: episodeItems,
  };
}
