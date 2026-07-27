/**
 * Forward Widget: TXH视频站
 * 视频站点: txh068.com
 * 
 * 原理:
 *   - Forward 运行在 iOS/macOS 上，HTTP 栈 = URLSession (TLS指纹=Safari)
 *   - 直接调视频站 API（AES-ECB 加密），不需要中间代理
 *   - API 响应是 base64(AES加密) → 纯 JS 解密 → JSON → VideoItem
 * 
 * 已知限制: m3u8 代理在服务器端根据 HASH 鉴权，返回预览版(15s)。
 *   完整视频需要实际购买/VIP。本 Widget 提供浏览/搜索/详情功能，
 *   videoUrl 指向 CF Worker m3u8 代理以获得稳定 URL。
 */

WidgetMetadata = {
  id: "forward.txh",
  title: "TXH视频",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "TXH视频站点 - 浏览/搜索影片",
  author: "Forward",
  site: "https://txh068.com",
  detailCacheDuration: 300,
  globalParams: [
    { name: "workerUrl", title: "Worker地址", type: "input", value: "" },
  ],
  modules: [
    {
      id: "hotList",
      title: "热门推荐",
      functionName: "loadHotList",
      params: [
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "categoryList",
      title: "分类浏览",
      functionName: "loadCategoryList",
      params: [
        { name: "category", title: "分类", type: "enumeration", enumOptions: [
          { title: "全部", value: "" },
          { title: "国产", value: "1" },
          { title: "日本", value: "2" },
          { title: "欧美", value: "3" },
          { title: "动漫", value: "4" },
          { title: "三级", value: "5" },
          { title: "其他", value: "6" },
        ]},
        { name: "page", title: "页码", type: "page" },
      ],
    },
    {
      id: "newList",
      title: "最新更新",
      functionName: "loadNewList",
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

// ============================================================
//  常量
// ============================================================
var AES_KEY = "fd14f9f8e38808fa";
var BASE_URL = "https://txh068.com";
var API_VERSION = "4.76";

// ============================================================
//  纯 JS Base64 (不依赖 btoa/atob)
// ============================================================
var B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64(bytes) {
  var r = "", i, b0, b1, b2, t;
  for (i = 0; i < bytes.length; i += 3) {
    b0 = bytes[i];
    b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    t = (b0 << 16) | (b1 << 8) | b2;
    r += B64_CHARS[(t >> 18) & 63] + B64_CHARS[(t >> 12) & 63];
    r += i + 1 < bytes.length ? B64_CHARS[(t >> 6) & 63] : "=";
    r += i + 2 < bytes.length ? B64_CHARS[t & 63] : "=";
  }
  return r;
}

function base64ToBytes(s) {
  s = (s || "").replace(/[^A-Za-z0-9\+\/\=]/g, "");
  var o = [], i, c0, c1, c2, c3, t, len = s.length;
  for (i = 0; i < len; i += 4) {
    c0 = B64_CHARS.indexOf(s[i]);
    c1 = B64_CHARS.indexOf(s[i + 1]);
    c2 = i + 2 < len && s[i + 2] !== "=" ? B64_CHARS.indexOf(s[i + 2]) : 0;
    c3 = i + 3 < len && s[i + 3] !== "=" ? B64_CHARS.indexOf(s[i + 3]) : 0;
    t = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
    o.push((t >> 16) & 255);
    if (s[i + 2] !== "=") o.push((t >> 8) & 255);
    if (s[i + 3] !== "=") o.push(t & 255);
  }
  return new Uint8Array(o);
}

// ============================================================
//  纯 JS AES-128-ECB
// ============================================================
var SBOX = new Uint8Array([
  99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,
  202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,
  183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,
  4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,
  9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,
  83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,
  208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,
  81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,
  205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,
  96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,
  224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,
  231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,
  186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,
  112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,
  225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,
  140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22
]);

var INV_SBOX = new Uint8Array([
  82,9,106,213,48,54,165,56,191,64,163,158,129,243,215,251,
  124,227,57,130,155,47,255,135,52,142,67,68,196,222,233,203,
  84,123,148,50,166,194,35,61,238,76,149,11,66,250,195,78,
  8,46,161,102,40,217,36,178,118,91,162,73,109,139,209,37,
  114,248,246,100,134,104,152,22,212,164,92,204,93,101,182,146,
  108,112,72,80,253,237,185,218,94,21,70,87,167,141,157,132,
  144,216,171,0,140,188,211,10,247,228,88,5,184,179,69,6,
  208,44,30,143,202,63,15,2,193,175,189,3,1,19,138,107,
  58,145,17,65,79,103,220,234,151,242,207,206,240,180,230,115,
  150,172,116,34,231,173,53,133,226,249,55,232,28,117,223,110,
  71,241,26,113,29,41,197,137,111,183,98,14,170,24,190,27,
  252,86,62,75,198,210,121,32,154,219,192,254,120,205,90,244,
  31,221,168,51,136,7,199,49,177,18,16,89,39,128,236,95,
  96,81,127,169,25,181,74,13,45,229,122,159,147,201,156,239,
  160,224,59,77,174,42,245,176,200,235,187,60,131,83,153,97,
  23,43,4,126,186,119,214,38,225,105,20,99,85,33,12,125
]);

function xtime(a) { return ((a << 1) ^ (((a >> 7) & 1) * 27)) & 255; }

function keyExpansion(key) {
  var Nk = 4, Nr = 10;
  var w = new Uint8Array(16 * (Nr + 1));
  for (var i = 0; i < 16; i++) w[i] = key[i];
  var rc = [1,2,4,8,16,32,64,128,27,54];
  for (var i = Nk; i < 4 * (Nr + 1); i++) {
    var t0 = w[4*(i-1)], t1 = w[4*(i-1)+1], t2 = w[4*(i-1)+2], t3 = w[4*(i-1)+3];
    if (i % Nk === 0) {
      var x = t0; t0 = t1; t1 = t2; t2 = t3; t3 = x;
      t0 = SBOX[t0]; t1 = SBOX[t1]; t2 = SBOX[t2]; t3 = SBOX[t3];
      t0 ^= rc[i/Nk - 1];
    }
    w[4*i] = w[4*(i-Nk)] ^ t0;
    w[4*i+1] = w[4*(i-Nk)+1] ^ t1;
    w[4*i+2] = w[4*(i-Nk)+2] ^ t2;
    w[4*i+3] = w[4*(i-Nk)+3] ^ t3;
  }
  return w;
}

function aesEncryptBlock(block, rk) {
  var s = new Uint8Array(block);
  for (var i = 0; i < 16; i++) s[i] ^= rk[i];
  for (var r = 1; r < 10; r++) {
    for (i = 0; i < 16; i++) s[i] = SBOX[s[i]];
    var t = new Uint8Array(s);
    s[1]=t[5]; s[5]=t[9]; s[9]=t[13]; s[13]=t[1];
    s[2]=t[10]; s[10]=t[2]; s[6]=t[14]; s[14]=t[6];
    s[3]=t[15]; s[15]=t[11]; s[11]=t[7]; s[7]=t[3];
    for (i = 0; i < 4; i++) {
      var ci = i * 4;
      var a0=s[ci], a1=s[ci+1], a2=s[ci+2], a3=s[ci+3];
      s[ci]=xtime(a0)^(xtime(a1)^a1)^a2^a3;
      s[ci+1]=a0^xtime(a1)^(xtime(a2)^a2)^a3;
      s[ci+2]=a0^a1^xtime(a2)^(xtime(a3)^a3);
      s[ci+3]=(xtime(a0)^a0)^a1^a2^xtime(a3);
    }
    for (i = 0; i < 16; i++) s[i] ^= rk[r*16 + i];
  }
  for (i = 0; i < 16; i++) s[i] = SBOX[s[i]]; t = new Uint8Array(s);
  s[1]=t[5]; s[5]=t[9]; s[9]=t[13]; s[13]=t[1];
  s[2]=t[10]; s[10]=t[2]; s[6]=t[14]; s[14]=t[6];
  s[3]=t[15]; s[15]=t[11]; s[11]=t[7]; s[7]=t[3];
  for (i = 0; i < 16; i++) s[i] ^= rk[160 + i];
  return s;
}

function aesEncryptECB(plaintext) {
  var keyBytes = stringToBytes(AES_KEY);
  var rk = keyExpansion(keyBytes);
  var textBytes = stringToBytes(plaintext);
  var padLen = 16 - (textBytes.length % 16);
  var padded = new Uint8Array(textBytes.length + padLen);
  padded.set(textBytes);
  for (var i = textBytes.length; i < padded.length; i++) padded[i] = padLen;
  var result = new Uint8Array(padded.length);
  for (var i = 0; i < padded.length; i += 16) {
    result.set(aesEncryptBlock(padded.slice(i, i + 16), rk), i);
  }
  return bytesToBase64(result);
}

function aesDecryptECB(cipherB64) {
  var keyBytes = stringToBytes(AES_KEY);
  var rk = keyExpansion(keyBytes);
  var ct = base64ToBytes(cipherB64);
  if (ct.length % 16 !== 0) return null;
  var result = new Uint8Array(ct.length);
  for (var i = 0; i < ct.length; i += 16) {
    var block = ct.slice(i, i + 16);
    var s = new Uint8Array(block);
    for (var j = 0; j < 16; j++) s[j] ^= rk[160 + j];
    for (var r = 9; r >= 1; r--) {
      var t = new Uint8Array(s);
      s[1]=t[13]; s[5]=t[1]; s[9]=t[5]; s[13]=t[9];
      s[2]=t[10]; s[10]=t[2]; s[6]=t[14]; s[14]=t[6];
      s[3]=t[7]; s[7]=t[11]; s[11]=t[15]; s[15]=t[3];
      for (j = 0; j < 16; j++) s[j] = INV_SBOX[s[j]];
      for (j = 0; j < 16; j++) s[j] ^= rk[r*16 + j];
      for (j = 0; j < 4; j++) {
        var ci = j * 4;
        var a0 = s[ci], a1 = s[ci+1], a2 = s[ci+2], a3 = s[ci+3];
        s[ci] = gmul(a0,14) ^ gmul(a1,11) ^ gmul(a2,13) ^ gmul(a3,9);
        s[ci+1] = gmul(a0,9) ^ gmul(a1,14) ^ gmul(a2,11) ^ gmul(a3,13);
        s[ci+2] = gmul(a0,13) ^ gmul(a1,9) ^ gmul(a2,14) ^ gmul(a3,11);
        s[ci+3] = gmul(a0,11) ^ gmul(a1,13) ^ gmul(a2,9) ^ gmul(a3,14);
      }
    }
    t = new Uint8Array(s);
    s[1]=t[13]; s[5]=t[1]; s[9]=t[5]; s[13]=t[9];
    s[2]=t[10]; s[10]=t[2]; s[6]=t[14]; s[14]=t[6];
    s[3]=t[7]; s[7]=t[11]; s[11]=t[15]; s[15]=t[3];
    for (j = 0; j < 16; j++) s[j] = INV_SBOX[s[j]];
    for (j = 0; j < 16; j++) s[j] ^= rk[j];
    result.set(s, i);
  }
  var padLen = result[result.length - 1];
  if (padLen < 1 || padLen > 16) padLen = 0;
  return bytesToString(result.slice(0, result.length - padLen));
}

function gmul(a, b) {
  var p = 0;
  for (var i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    var hi = a & 128;
    a = (a << 1) & 255;
    if (hi) a ^= 27;
    b >>= 1;
  }
  return p;
}

function stringToBytes(str) {
  var bytes = new Uint8Array(str.length);
  for (var i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 255;
  return bytes;
}

function bytesToString(bytes) {
  var str = "";
  for (var i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return str;
}

// ============================================================
//  API 调用（直接调视频站）
// ============================================================

var _sessionDeviceId = null;
var _sessionInitialized = false;

function randomHex(len) {
  var chars = "0123456789abcdef", s = "";
  for (var i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

/**
 * 初始化会话：调用 system/info 获取 deviceId
 * Forward Widget 在 iOS/macOS 上的 URLSession TLS 指纹 = Safari，能通过认证
 */
async function initSession() {
  if (_sessionInitialized) return;
  var body = JSON.stringify({
    data: "",
    token: "",
    deviceId: null,
    device: "MacIntel",
    source: "Apple Computer, Inc.",
    driver: "",
  });
  var now = Math.floor(Date.now() / 1000);
  var encryptedBody = aesEncryptECB(body);
  try {
    var res = await Widget.http.post(BASE_URL + "/h5/system/info", encryptedBody, {
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "deviceType": "web",
        "time": String(now),
        "version": API_VERSION,
      },
    });
    var decrypted = aesDecryptECB(res.data || "");
    if (decrypted) {
      var data = JSON.parse(decrypted);
      if (data.status === "y" && data.data && data.data.deviceId) {
        _sessionDeviceId = data.data.deviceId;
        _sessionInitialized = true;
      }
    }
  } catch (e) {
    console.error("[txh] initSession failed:", e.message || e);
  }
}

/**
 * 调用视频站 API
 */
async function apiCall(path, dataObj) {
  await initSession();
  var now = Math.floor(Date.now() / 1000);
  var body = JSON.stringify({
    data: dataObj || "",
    token: "_",
    deviceId: _sessionDeviceId || null,
    device: "MacIntel",
    source: "Apple Computer, Inc.",
    driver: "",
  });
  var encryptedBody = aesEncryptECB(body);
  var res = await Widget.http.post(BASE_URL + path, encryptedBody, {
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "deviceType": "web",
      "time": String(now),
      "version": API_VERSION,
    },
  });
  var decrypted = aesDecryptECB(res.data || "");
  if (!decrypted) throw new Error("AES decrypt failed for " + path);
  var data = JSON.parse(decrypted);
  if (data.status !== "y") throw new Error((data.error || data.msg || "unknown") + " (" + path + ")");
  return data.data || {};
}

/**
 * 构造海报完整 URL
 */
function posterUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return BASE_URL + (path.startsWith("/") ? "" : "/") + path;
}

/**
 * 构造 Worker m3u8 代理 URL（可选，用于获得稳定URL）
 */
function m3u8ProxyUrl(movieId, params) {
  var worker = (params && params.workerUrl) || "";
  if (!worker) return BASE_URL + "/h5/m3u8/link/" + movieId + ".m3u8";  // 直连
  return worker.replace(/\/$/, "") + "/m3u8?id=" + movieId;
}

/**
 * 构造 VideoItem 的 link（用于 loadDetail）
 */
function makeLink(movieId) {
  return "txh:" + movieId;
}

/**
 * 从 link 中提取 movieId
 */
function parseLink(link) {
  var s = String(link);
  if (s.indexOf("txh:") === 0) return s.substring(4);
  return s;
}

// ============================================================
//  模块处理函数
// ============================================================

/**
 * 热门推荐列表
 */
async function loadHotList(params) {
  params = params || {};
  var page = Number(params.page || 1);
  try {
    var res = await Widget.http.get(BASE_URL + "/h5/movie/list?page=" + page + "&type=hot", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    var html = res.data || "";
    return parseMovieList(html, params);
  } catch (e) {
    console.error("[txh] loadHotList:", e.message || e);
  }
  // 回退: 尝试 API
  try {
    var data = await apiCall("/h5/movie/list", { page: page, type: "hot" });
    return (data.list || data.data || []).map(function(m) { return toVideoItem(m, params); });
  } catch (e2) {
    console.error("[txh] loadHotList fallback:", e2.message || e2);
    throw e2;
  }
}

/**
 * 分类浏览
 */
async function loadCategoryList(params) {
  params = params || {};
  var page = Number(params.page || 1);
  var category = params.category || "";
  try {
    var data = await apiCall("/h5/movie/list", { page: page, category_id: category });
    var list = data.list || data.data || [];
    return list.map(function(m) { return toVideoItem(m, params); });
  } catch (e) {
    console.error("[txh] loadCategoryList:", e.message || e);
    throw e;
  }
}

/**
 * 最新更新
 */
async function loadNewList(params) {
  params = params || {};
  var page = Number(params.page || 1);
  try {
    var data = await apiCall("/h5/movie/list", { page: page, type: "new" });
    var list = data.list || data.data || [];
    return list.map(function(m) { return toVideoItem(m, params); });
  } catch (e) {
    console.error("[txh] loadNewList:", e.message || e);
    throw e;
  }
}

/**
 * 影片详情（Forward 调用 loadDetail(link) 时触发）
 * link 格式: "txh:35614"
 */
async function loadDetail(link) {
  var movieId = parseLink(link);
  if (!movieId) return null;
  try {
    var data = await apiCall("/h5/movie/detail", { id: movieId });
    return toVideoItem(data, {});
  } catch (e) {
    console.error("[txh] loadDetail:", e.message || e);
    return null;
  }
}

/**
 * 搜索
 */
async function search(params) {
  params = params || {};
  var keyword = String(params.keyword || "").trim();
  if (!keyword) return [];
  var page = Number(params.page || 1);
  try {
    var data = await apiCall("/h5/movie/list", { page: page, keyword: keyword });
    var list = data.list || data.data || [];
    return list.map(function(m) { return toVideoItem(m, params); });
  } catch (e) {
    console.error("[txh] search:", e.message || e);
    throw e;
  }
}

// ============================================================
//  HTML 解析回退（用于 API 不可用时，解析网页列表）
// ============================================================
function parseMovieList(html, params) {
  var items = [];
  if (!html) return items;
  var pattern = /<a[^>]*href="\/movie\/detail\/(\d+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]*)</g;
  var match;
  while ((match = pattern.exec(html)) !== null) {
    items.push({
      id: "txh:" + match[1],
      type: "url",
      title: (match[3] || "").trim(),
      posterPath: posterUrl(match[2]),
      link: makeLink(match[1]),
    });
  }
  return items;
}

// ============================================================
//  API 数据 → VideoItem 格式
// ============================================================
function toVideoItem(movie, params) {
  if (!movie) return null;
  var movieId = movie.id || movie.movie_id || "";
  var item = {
    id: "txh:" + movieId,
    type: "url",
    title: movie.title || movie.name || "",
    posterPath: posterUrl(movie.thumb || movie.poster || movie.cover || ""),
    description: movie.description || movie.des || "",
    link: makeLink(movieId),
    playerType: "system",
  };
  if (movie.duration) {
    item.duration = Number(movie.duration);
    item.durationText = formatDuration(movie.duration);
  }
  if (movie.score || movie.rating) {
    item.rating = Number(movie.score || movie.rating);
  }
  var genres = movie.tags || movie.category || [];
  if (genres.length > 0) {
    item.genreItems = genres.map(function(g) {
      var name = typeof g === "string" ? g : (g.title || g.name || "");
      return { id: String(name), title: name };
    });
  }
  var videoId = movie.play_link || movie.m3u8_id || movieId;
  item.videoUrl = m3u8ProxyUrl(videoId, params);
  return item;
}

function formatDuration(seconds) {
  var s = Number(seconds) || 0;
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var sec = s % 60;
  if (h > 0) return pad(h) + ":" + pad(m) + ":" + pad(sec);
  return pad(m) + ":" + pad(sec);
}

function pad(n) {
  return n < 10 ? "0" + n : String(n);
}
