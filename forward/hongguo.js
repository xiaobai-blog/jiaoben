// 红果短剧 Widget 模块
var BASE = "https://www.phpks.com/api/duanju/api";
var UA = "Dart/3.0 (dart:io)";
var PAGE_SIZE = 20;

// ===== 在此填写你的 key（如果需要鉴权）=====
// 留空字符串 "" 表示不携带 key
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
  // 如果填写了 KEY，则作为 query 参数 key 自动附加到每个请求
  if (KEY) {
    params = Object.assign({ key: KEY }, params);
  }
  return Widget.http.get(buildUrl(params), {
    headers: {
      "User-Agent": UA,
      "Accept": "application/json, text/plain, */*"
    },
    timeout: 15000
  }).then(function(resp) {
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
  // 可能的字段: data.list / data.data / data.items / data.videos / res.data / list
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.data && data.data.list) return data.data.list;
  if (data.data && data.data.videos) return data.data.videos;
  if (data.data && data.data.items) return data.data.items;
  if (data.list) return data.list;
  if (data.data && Array.isArray(data.data.data)) return data.data.data;
  if (Array.isArray(data)) return data;
  return [];
}

function extractNext(data) {
  if (!data) return null;
  if (data.data && data.data.next_offset !== undefined) return data.data.next_offset;
  if (data.data && data.data.offset !== undefined) return data.data.offset;
  if (data.next_offset !== undefined) return data.next_offset;
  return null;
}

function extractPassback(data) {
  if (!data) return null;
  if (data.data && data.data.passback) return data.data.passback;
  if (data.passback) return data.passback;
  return null;
}

// 列表项转统一格式
function toItem(raw, idx) {
  var id = raw.series_id || raw.id || raw.video_id || ("item_" + idx);
  var title = raw.title || raw.name || raw.series_name || "";
  var cover = raw.cover || raw.cover_url || raw.poster_url || raw.image_url || raw.thumb || "";
  var desc = raw.description || raw.desc || raw.intro || "";
  var badge = raw.badge || raw.type || "";
  return { id: String(id), title: title, cover: cover, desc: desc, badge: String(badge), raw: raw };
}

// ========== 首页 真人推荐 ==========
function loadHome() {
  return api({ action: "feed", tab_type: "38", cell_id: "7641597426175836222", offset: "0" }).then(function(data) {
    var list = extractList(data);
    var items = [];
    for (var i = 0; i < list.length; i++) items.push(toItem(list[i], i));
    if (items.length === 0) throw new Error("推荐流无数据，raw:" + JSON.stringify(data).slice(0, 500));
    return { items: items, next: extractNext(data), passback: extractPassback(data) };
  });
}

// ========== 漫剧推荐 ==========
function loadManhua() {
  return api({ action: "feed", tab_type: "32", cell_id: "7529494301202448446", offset: "0" }).then(function(data) {
    var list = extractList(data);
    var items = [];
    for (var i = 0; i < list.length; i++) items.push(toItem(list[i], i));
    if (items.length === 0) throw new Error("漫剧无数据，raw:" + JSON.stringify(data).slice(0, 500));
    return { items: items, next: extractNext(data), passback: extractPassback(data) };
  });
}

// ========== 新剧推荐 ==========
function loadNew() {
  return api({ action: "new_rec", offset: "0" }).then(function(data) {
    var list = extractList(data);
    var items = [];
    for (var i = 0; i < list.length; i++) items.push(toItem(list[i], i));
    if (items.length === 0) throw new Error("新剧无数据，raw:" + JSON.stringify(data).slice(0, 500));
    return { items: items, next: extractNext(data), passback: extractPassback(data) };
  });
}

// ========== 热播榜 ==========
function loadHotRank() {
  return api({ action: "rank", type: "hot_play", offset: "0" }).then(function(data) {
    var list = extractList(data);
    var items = [];
    for (var i = 0; i < list.length; i++) items.push(toItem(list[i], i));
    if (items.length === 0) throw new Error("热播榜无数据，raw:" + JSON.stringify(data).slice(0, 500));
    return { items: items, next: extractNext(data), passback: extractPassback(data) };
  });
}

// ========== 新剧榜 ==========
function loadNewRank() {
  return api({ action: "rank", type: "new_rank", offset: "0" }).then(function(data) {
    var list = extractList(data);
    var items = [];
    for (var i = 0; i < list.length; i++) items.push(toItem(list[i], i));
    if (items.length === 0) throw new Error("新剧榜无数据，raw:" + JSON.stringify(data).slice(0, 500));
    return { items: items, next: extractNext(data), passback: extractPassback(data) };
  });
}

// ========== 热搜榜 ==========
function loadSearchRank() {
  return api({ action: "rank", type: "hot_search", offset: "0" }).then(function(data) {
    var list = extractList(data);
    var items = [];
    for (var i = 0; i < list.length; i++) items.push(toItem(list[i], i));
    if (items.length === 0) throw new Error("热搜榜无数据，raw:" + JSON.stringify(data).slice(0, 500));
    return { items: items, next: extractNext(data), passback: extractPassback(data) };
  });
}

// ========== 必看榜 ==========
function loadMustRank() {
  return api({ action: "rank", type: "must_watch", offset: "0" }).then(function(data) {
    var list = extractList(data);
    var items = [];
    for (var i = 0; i < list.length; i++) items.push(toItem(list[i], i));
    if (items.length === 0) throw new Error("必看榜无数据，raw:" + JSON.stringify(data).slice(0, 500));
    return { items: items, next: extractNext(data), passback: extractPassback(data) };
  });
}

// ========== 搜索 ==========
function search(kw) {
  return api({ action: "search_v1", query: kw, offset: "0" }).then(function(data) {
    var list = extractList(data);
    var items = [];
    for (var i = 0; i < list.length; i++) items.push(toItem(list[i], i));
    return { items: items };
  });
}

// ========== 详情 + 选集 + 播放地址 ==========
function loadDetail(id) {
  // 先获取详情
  return api({ action: "detail", series_id: id, badge: "1" }).then(function(detailData) {
    var info = (detailData && detailData.data) || detailData || {};
    var title = info.title || info.series_name || info.name || "";
    var cover = info.cover || info.cover_url || info.poster_url || "";
    var desc = info.description || info.desc || info.intro || "";

    // 提取选集列表
    var eps = [];
    var epList = info.episodes || info.episode_list || info.list || [];
    if (info.data && info.data.episodes) epList = info.data.episodes;
    if (info.data && info.data.list) epList = info.data.list;

    for (var i = 0; i < epList.length; i++) {
      var ep = epList[i];
      eps.push({
        id: String(ep.video_id || ep.id || ("ep_" + i)),
        title: ep.title || ep.name || ("第" + (i + 1) + "集"),
        videoId: String(ep.video_id || ""),
        index: i
      });
    }

    // 如果有选集，取第一集的播放地址
    if (eps.length > 0 && eps[0].videoId) {
      return api({ action: "video_direct_fq", video_id: eps[0].videoId }).then(function(videoData) {
        var vid = videoData && videoData.data ? videoData.data : videoData;
        var playUrl = "";
        if (typeof vid === "string") playUrl = vid;
        else if (vid && vid.video_url) playUrl = vid.video_url;
        else if (vid && vid.url) playUrl = vid.url;
        else if (vid && vid.play_url) playUrl = vid.play_url;
        return {
          id: id,
          title: title,
          cover: cover,
          desc: desc,
          episodes: eps,
          playUrl: playUrl,
          rawInfo: JSON.stringify(info).slice(0, 500),
          rawVideo: JSON.stringify(vid).slice(0, 500)
        };
      }).catch(function() {
        return {
          id: id, title: title, cover: cover, desc: desc,
          episodes: eps, playUrl: ""
        };
      });
    }

    return { id: id, title: title, cover: cover, desc: desc, episodes: eps, playUrl: "" };
  });
}

// 为了兼容 Widget 旧模块接口，提供空的 fallback
function loadMovies() { return loadHome(); }
function loadSeries() { return loadManhua(); }
function loadAnime() { return loadNew(); }
function loadVariety() { return loadHotRank(); }

WidgetMetadata = {
  id: "hongguo",
  title: "红果短剧",
  description: "全网短剧/漫剧-清爽无加密",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    { id: "home", title: "真人推荐", functionName: "loadHome", cacheDuration: 1800, params: [] },
    { id: "movie", title: "漫剧推荐", functionName: "loadManhua", cacheDuration: 1800, params: [] },
    { id: "tv", title: "新剧推荐", functionName: "loadNew", cacheDuration: 1800, params: [] },
    { id: "anime", title: "热播榜", functionName: "loadHotRank", cacheDuration: 1800, params: [] },
    { id: "variety", title: "新剧榜", functionName: "loadNewRank", cacheDuration: 1800, params: [] },
    { id: "hotsearch", title: "热搜榜", functionName: "loadSearchRank", cacheDuration: 1800, params: [] },
    { id: "mustwatch", title: "必看榜", functionName: "loadMustRank", cacheDuration: 1800, params: [] },
  ],
  supportedSearch: true,
  searchTab: { title: "搜索短剧", placeholder: "请输入短剧/漫剧名称" },
  iconBase64: "",
};
