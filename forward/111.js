WidgetMetadata = {
  id: "forward.txh",
  title: "糖心",
  version: "3.5.1",
  requiredVersion: "0.0.1",
  description: "糖心视频 — 直连官方 API，自动获取游客 Token。播放通过 midorii.cc 代理获取完整视频（跳过 VIP/预览限制）。封面图通过 .bnc 解密代理显示（AES-128-ECB）。如加载失败请在下方手动填写 Token。",
  author: "Forward",
  site: "https://txh068.com",
  detailCacheDuration: 60,
  globalParams: [
    {
      name: "token",
      title: "Token（可选，自动获取失败时填写）",
      type: "input",
      description: "留空则自动获取游客Token。如自动获取失败，请登录 txh068.com 后从 localStorage 复制 fuck 的值。",
    },
  ],
  modules: [
    {
      id: "videoList",
      title: "视频",
      functionName: "loadList",
      cacheDuration: 300,
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "type",
          title: "分类",
          type: "select",
          defaultValue: "time",
          options: [
            { value: "time", title: "最新" },
            { value: "hot", title: "最热" },
            { value: "views", title: "播放最多" },
            { value: "score", title: "评分最高" },
            { value: "collect", title: "收藏最多" },
            { value: "daily", title: "每日精选" },
            { value: "recommend", title: "推荐" },
          ],
        },
      ],
    },
    {
      id: "ranking",
      title: "排行榜",
      functionName: "loadRank",
      cacheDuration: 300,
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "rankType",
          title: "排行",
          type: "select",
          defaultValue: "movie",
          options: [
            { value: "movie", title: "视频榜" },
            { value: "original", title: "原创榜" },
            { value: "movieBuy", title: "解锁榜" },
          ],
        },
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

// ======================== Constants ========================
var AES_KEY = "fd14f9f8e38808fa";
var API_BASE = "https://tth.txh069.com/h5";
var BASE_URL = "https://tth.txh069.com";

// CDN: tangxinvlog.app mirror — serves full videos + standard JPEG covers
// All CDN resources (m3u8, key, TS segments, cover.jpg) require Referer header
var CDN_BASE = "https://t.5gcdn.xyz/videos";
var CDN_REFERER = "https://tangxinvlog.app/";

// midorii.cc: shared VIP proxy — returns full video m3u8 without preview restriction
// TS segments are PNG-disguised + AES-128 encrypted, needs hls_proxy.js to decode
var MIDORI_API = "https://midorii.cc/api/parse?id=";

// ======================== AES-128-ECB ========================
var SBOX = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
];
var INV_SBOX = [
  0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,
  0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,
  0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,
  0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,
  0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,
  0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,
  0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,
  0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,
  0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,
  0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,
  0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,
  0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,
  0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,
  0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,
  0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,
  0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d,
];
var RCON = [0x00,0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

function strToBytes(s) {
  var b = [];
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c < 0x80) b.push(c);
    else if (c < 0x800) { b.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
    else if (c < 0xd800 || c >= 0xe000) { b.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
    else { i++; c = 0x10000 + (((c & 0x3ff) << 10) | (s.charCodeAt(i) & 0x3ff)); b.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
  }
  return b;
}

function bytesToStr(b) {
  var s = "";
  for (var i = 0; i < b.length; ) {
    var c = b[i++];
    if (c < 0x80) s += String.fromCharCode(c);
    else if (c < 0xe0) s += String.fromCharCode(((c & 0x1f) << 6) | (b[i++] & 0x3f));
    else if (c < 0xf0) s += String.fromCharCode(((c & 0x0f) << 12) | ((b[i++] & 0x3f) << 6) | (b[i++] & 0x3f));
    else { var cp = ((c & 0x07) << 18) | ((b[i++] & 0x3f) << 12) | ((b[i++] & 0x3f) << 6) | (b[i++] & 0x3f); cp -= 0x10000; s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff)); }
  }
  return s;
}

var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function b64encode(bytes) {
  var s = "";
  for (var i = 0; i < bytes.length; i += 3) {
    var a = bytes[i] << 16 | (bytes[i+1] || 0) << 8 | (bytes[i+2] || 0);
    s += B64[(a >> 18) & 63];
    s += B64[(a >> 12) & 63];
    s += i + 1 < bytes.length ? B64[(a >> 6) & 63] : "=";
    s += i + 2 < bytes.length ? B64[a & 63] : "=";
  }
  return s;
}
function b64decode(s) {
  s = s.replace(/[^A-Za-z0-9+/]/g, "");
  var b = [];
  for (var i = 0; i < s.length; i += 4) {
    var c0 = B64.indexOf(s[i]);
    var c1 = i + 1 < s.length ? B64.indexOf(s[i + 1]) : 0;
    var c2 = i + 2 < s.length ? B64.indexOf(s[i + 2]) : 0;
    var c3 = i + 3 < s.length ? B64.indexOf(s[i + 3]) : 0;
    var a = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
    b.push((a >> 16) & 255);
    if (i + 2 < s.length) b.push((a >> 8) & 255);
    if (i + 3 < s.length) b.push(a & 255);
  }
  return b;
}

function keyExpansion(key) {
  var w = [];
  for (var i = 0; i < 4; i++) w.push([key[4*i], key[4*i+1], key[4*i+2], key[4*i+3]]);
  for (var i = 4; i < 44; i++) {
    var t = w[i-1].slice();
    if (i % 4 === 0) {
      t = [SBOX[t[1]] ^ RCON[i/4], SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]];
    }
    w.push([w[i-4][0] ^ t[0], w[i-4][1] ^ t[1], w[i-4][2] ^ t[2], w[i-4][3] ^ t[3]]);
  }
  return w;
}

function gmul(a, b) { var r = 0; for (var i = 0; i < 8; i++) { if (b & 1) r ^= a; var h = a & 0x80; a = (a << 1) & 0xff; if (h) a ^= 0x1b; b >>= 1; } return r; }

function aesDecryptBlock(block, w) {
  var s = block.slice();
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s[r + 4*c] ^= w[40 + c][r];
  var t = s.slice();
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s[r + 4*c] = t[r + 4*((c-r+4)%4)];
  for (var i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
  for (var rd = 9; rd >= 1; rd--) {
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s[r + 4*c] ^= w[4*rd + c][r];
    for (var c = 0; c < 4; c++) {
      var a = [s[4*c], s[4*c+1], s[4*c+2], s[4*c+3]];
      s[4*c]   = gmul(a[0],14) ^ gmul(a[1],11) ^ gmul(a[2],13) ^ gmul(a[3],9);
      s[4*c+1] = gmul(a[0],9) ^ gmul(a[1],14) ^ gmul(a[2],11) ^ gmul(a[3],13);
      s[4*c+2] = gmul(a[0],13) ^ gmul(a[1],9) ^ gmul(a[2],14) ^ gmul(a[3],11);
      s[4*c+3] = gmul(a[0],11) ^ gmul(a[1],13) ^ gmul(a[2],9) ^ gmul(a[3],14);
    }
    var t = s.slice();
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s[r + 4*c] = t[r + 4*((c-r+4)%4)];
    for (var i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]];
  }
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s[r + 4*c] ^= w[c][r];
  return s;
}

function aesEncryptBlock(block, w) {
  var s = block.slice();
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s[r + 4*c] ^= w[c][r];
  for (var rd = 1; rd <= 9; rd++) {
    for (var i = 0; i < 16; i++) s[i] = SBOX[s[i]];
    var t = s.slice();
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s[r + 4*c] = t[r + 4*((c+r) % 4)];
    for (var c = 0; c < 4; c++) {
      var a = [s[4*c], s[4*c+1], s[4*c+2], s[4*c+3]];
      s[4*c]   = gmul(a[0],2) ^ gmul(a[1],3) ^ a[2] ^ a[3];
      s[4*c+1] = a[0] ^ gmul(a[1],2) ^ gmul(a[2],3) ^ a[3];
      s[4*c+2] = a[0] ^ a[1] ^ gmul(a[2],2) ^ gmul(a[3],3);
      s[4*c+3] = gmul(a[0],3) ^ a[1] ^ a[2] ^ gmul(a[3],2);
    }
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s[r + 4*c] ^= w[4*rd + c][r];
  }
  for (var i = 0; i < 16; i++) s[i] = SBOX[s[i]];
  var t = s.slice();
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s[r + 4*c] = t[r + 4*((c+r) % 4)];
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s[r + 4*c] ^= w[40 + c][r];
  return s;
}

function pkcs7Pad(b) {
  var pad = 16 - (b.length % 16);
  for (var i = 0; i < pad; i++) b.push(pad);
  return b;
}
function pkcs7Unpad(b) {
  if (b.length === 0) return b;
  var pad = b[b.length - 1];
  if (pad < 1 || pad > 16) return b;
  return b.slice(0, b.length - pad);
}

var _expandedKey = null;
var _expandedDecKey = null;
function getEncKey() {
  if (!_expandedKey) _expandedKey = keyExpansion(strToBytes(AES_KEY));
  return _expandedKey;
}

function aesEncrypt(obj) {
  var bytes = strToBytes(JSON.stringify(obj));
  bytes = pkcs7Pad(bytes);
  var w = getEncKey();
  var out = [];
  for (var i = 0; i < bytes.length; i += 16) {
    var block = bytes.slice(i, i + 16);
    var enc = aesEncryptBlock(block, w);
    for (var j = 0; j < 16; j++) out.push(enc[j]);
  }
  return b64encode(out);
}

function aesDecryptB64(b64Str) {
  var cipherBytes = b64decode(b64Str);
  var w = getEncKey();
  var out = [];
  for (var i = 0; i < cipherBytes.length; i += 16) {
    var block = cipherBytes.slice(i, i + 16);
    var dec = aesDecryptBlock(block, w);
    for (var j = 0; j < 16; j++) out.push(dec[j]);
  }
  out = pkcs7Unpad(out);
  return JSON.parse(bytesToStr(out));
}

// ======================== Token / DeviceId Management ========================

function getUserToken() {
  try {
    var params = Widget.globalParams || {};
    return (params.token || "").trim();
  } catch (e) {
    return "";
  }
}

// Generate deviceId locally — format: web_<13 hex chars>
// No need to call /system/info (saves a network round-trip and avoids parsing issues)
function getDeviceId() {
  var cached = Widget.storage.get("txh_device_id");
  if (cached) return cached;

  var hex = "";
  var chars = "0123456789abcdef";
  for (var i = 0; i < 13; i++) {
    hex += chars[Math.floor(Math.random() * 16)];
  }
  var deviceId = "web_" + hex;
  Widget.storage.set("txh_device_id", deviceId);
  return deviceId;
}

// In-flight promise sharing: prevents parallel calls from making redundant API requests
var _guestTokenPromise = null;

async function getGuestToken() {
  var cached = Widget.storage.get("txh_guest_token");
  var cachedTime = Widget.storage.get("txh_guest_token_time");
  var now = Date.now();
  // Cache guest token for 30 minutes
  if (cached && cachedTime && (now - parseInt(cachedTime)) < 30 * 60 * 1000) {
    return cached;
  }

  // Negative cache: if last attempt failed, wait 5 min before retrying
  var failTime = Widget.storage.get("txh_guest_fail_time");
  if (failTime && (now - parseInt(failTime)) < 5 * 60 * 1000) {
    return "";
  }

  // In-flight dedup: if another call is already fetching, wait for it
  if (_guestTokenPromise) return _guestTokenPromise;

  _guestTokenPromise = (async function () {
    try {
      var deviceId = getDeviceId();
      // /system/menu expects {channel_code, share_code} per Nuxt.js source
      // On web this endpoint is normally skipped, but it can still return a guest token
      var resp = await apiPost("/system/menu", { channel_code: "", share_code: "" }, "", deviceId);
      console.log("[getGuestToken] resp: " + JSON.stringify(resp));
      if (resp && resp.status === "y" && resp.data && resp.data.token) {
        var token = resp.data.token + "_" + resp.data.user_id;
        Widget.storage.set("txh_guest_token", token);
        Widget.storage.set("txh_guest_token_time", String(Date.now()));
        Widget.storage.set("txh_guest_fail_time", "");
        return token;
      }
      // Failed — record to prevent retry storms
      Widget.storage.set("txh_guest_fail_time", String(Date.now()));
      return "";
    } catch (e) {
      console.error("[getGuestToken] error: " + (e.message || e));
      Widget.storage.set("txh_guest_fail_time", String(Date.now()));
      return "";
    } finally {
      _guestTokenPromise = null;
    }
  })();

  return _guestTokenPromise;
}

async function getToken() {
  // Priority 1: user-provided token
  var userToken = getUserToken();
  if (userToken) {
    console.log("[getToken] using user token");
    return userToken;
  }

  // Priority 2: auto guest token
  var guestToken = await getGuestToken();
  if (guestToken) {
    console.log("[getToken] using guest token");
    return guestToken;
  }

  console.log("[getToken] no token available");
  return "";
}

// ======================== API Layer ========================

async function apiPost(path, params, tokenOverride, deviceIdOverride) {
  try {
    var token = tokenOverride !== undefined ? tokenOverride : await getToken();
    var deviceId = deviceIdOverride !== undefined ? deviceIdOverride : getDeviceId();

    var envelope = {
      data: params != null ? params : "",
      token: token || "",
      deviceId: deviceId || "",
      device: "Win32",
      source: "Apple Computer, Inc.",
      driver: false,
    };

    var encrypted = aesEncrypt(envelope);
    var ts = Math.floor(Date.now() / 1000);
    var headers = {
      "Content-Type": "text/plain",
      "time": String(ts),
      "deviceType": "web",
      "version": "4.76",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    var resp = await Widget.http.post(API_BASE + path, encrypted, { headers: headers });

    // Debug: log raw response to help diagnose issues
    var text = resp ? resp.data : null;
    if (typeof text === "undefined" || text === null) {
      // Maybe resp itself is the data (some runtimes return body directly)
      if (resp && typeof resp === "string") {
        text = resp;
      } else {
        console.error("[apiPost:" + path + "] empty response, resp type: " + typeof resp);
        return null;
      }
    }

    // Response might be a string (base64 encrypted) or already an object
    if (typeof text === "object" && text !== null) {
      // Already parsed as object — check if it has status
      if (text.status === "y" || text.status === "n") return text;
      // Maybe the actual data is nested
      if (text.data && typeof text.data === "string") {
        return aesDecryptB64(text.data);
      }
      return text;
    }

    // String — should be base64 encrypted, decrypt it
    if (typeof text === "string") {
      text = text.trim();
      if (text.length === 0) {
        console.error("[apiPost:" + path + "] empty response string");
        return null;
      }
      return aesDecryptB64(text);
    }

    console.error("[apiPost:" + path + "] unexpected response type: " + typeof text);
    return null;
  } catch (error) {
    console.error("[apiPost:" + path + "] " + (error.message || error));
    return null;
  }
}

// ======================== VideoItem Mapping ========================

function normalizeM3u8(url) {
  if (!url) return url;
  if (url.indexOf("http") === 0) return url;
  return BASE_URL + (url.charAt(0) === "/" ? "" : "/") + url;
}

function mapVideoItem(raw) {
  if (!raw || (!raw.id && !raw.movie_id)) return null;
  var id = raw.id || raw.movie_id;
  var videoId = String(id);

  // Cover image: txh068.com returns .bnc encrypted images (AES-128-ECB)
  // hls_proxy.js /bnc endpoint fetches + decrypts them to standard JPEG
  // Falls back to CDN cover.jpg if .bnc URL is missing
  var proxyCover = "";
  if (raw.img) {
    proxyCover = "http://localhost:8888/bnc?url=" + encodeURIComponent(raw.img);
  } else {
    proxyCover = "http://localhost:8888/img/" + videoId;
  }

  return {
    id: videoId,
    type: "url",
    title: raw.name || raw.title || "",
    posterPath: proxyCover,
    backdropPath: proxyCover,
    coverUrl: proxyCover,
    imageUrl: proxyCover,
    rating: raw.score ? parseFloat(raw.score) : undefined,
    durationText: raw.duration || "",
    duration: raw.duration_time ? parseInt(raw.duration_time, 10) : undefined,
    releaseDate: raw.time ? raw.time.split(" ")[0] : undefined,
    link: videoId,
    headers: { Referer: CDN_REFERER },
  };
}

function mapDetail(raw) {
  if (!raw) return null;
  var item = mapVideoItem(raw);
  if (!item) return null;

  item.description = raw.description || raw.content || "";

  // Use .bnc decrypted image for detail page
  if (raw.img) {
    var bncCover = "http://localhost:8888/bnc?url=" + encodeURIComponent(raw.img);
    item.posterPath = bncCover;
    item.backdropPath = bncCover;
    item.coverUrl = bncCover;
    item.imageUrl = bncCover;
  }

  if (raw.tags && raw.tags.length) {
    item.genreItems = raw.tags.map(function (t) {
      return { id: String(t.id || ""), title: (t.name || "").trim() };
    });
  }

  if (raw.nickname) {
    var avatarUrl = "";
    if (raw.headico) {
      avatarUrl = "http://localhost:8888/bnc?url=" + encodeURIComponent(raw.headico);
    }
    item.peoples = [{
      id: String(raw.user_id || raw.nickname || ""),
      title: raw.nickname || "",
      avatar: avatarUrl,
      role: "UP主",
    }];
  }

  // Play URL — VIP skip logic (replicates site's player behavior)
  // The API returns:
  //   play_link: default m3u8 path (may be a VIP-only line)
  //   lines: [{id, name, is_vip, link}, ...]  — is_vip "n" = free, "y" = VIP
  // Strategy: prefer the first non-VIP line, fall back to play_link, then any line.
  var playLink = "";

  if (raw.lines && Array.isArray(raw.lines) && raw.lines.length > 0) {
    // Step 1: find first non-VIP line (is_vip === "n")
    for (var i = 0; i < raw.lines.length; i++) {
      if (raw.lines[i].link && raw.lines[i].is_vip === "n") {
        playLink = raw.lines[i].link;
        console.log("[mapDetail] using non-VIP line: " + raw.lines[i].name + " -> " + playLink);
        break;
      }
    }
    // Step 2: if no non-VIP line, use play_link
    if (!playLink) {
      playLink = raw.play_link || raw.play_url || "";
      if (playLink) console.log("[mapDetail] no free line, using play_link: " + playLink);
    }
    // Step 3: if still nothing, use first line with a link
    if (!playLink) {
      for (var i = 0; i < raw.lines.length; i++) {
        if (raw.lines[i].link) {
          playLink = raw.lines[i].link;
          console.log("[mapDetail] fallback to first line: " + playLink);
          break;
        }
      }
    }
  } else {
    // No lines array — use play_link directly
    playLink = raw.play_link || raw.play_url || "";
    if (playLink) console.log("[mapDetail] no lines, using play_link: " + playLink);
  }

  if (playLink) {
    item.videoUrl = normalizeM3u8(playLink);
    console.log("[mapDetail] final videoUrl: " + item.videoUrl);
  }

  // Backup link (alternative stream)
  var backupLink = raw.backup_link || raw.backup_url || "";
  if (backupLink) {
    item.previewUrl = normalizeM3u8(backupLink);
  }

  // Fallback: scan for m3u8
  if (!item.videoUrl) {
    function scanM3u8(obj) {
      if (!obj || typeof obj !== "object") return null;
      if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
          var r = scanM3u8(obj[i]);
          if (r) return r;
        }
        return null;
      }
      for (var k in obj) {
        if (typeof obj[k] === "string" && obj[k].indexOf("m3u8") !== -1) {
          return obj[k];
        }
        if (typeof obj[k] === "object") {
          var r = scanM3u8(obj[k]);
          if (r) return r;
        }
      }
      return null;
    }
    var found = scanM3u8(raw);
    if (found) item.videoUrl = normalizeM3u8(found);
  }

  return item;
}

// ======================== Handlers ========================

function extractVideoList(data) {
  if (!data) return [];
  // The API might return the list under various keys
  var keys = ["list", "data", "movies", "items", "recommend"];
  for (var i = 0; i < keys.length; i++) {
    if (Array.isArray(data[keys[i]])) {
      return data[keys[i]];
    }
  }
  // If data itself is an array
  if (Array.isArray(data)) return data;
  // API returns array-like object with numeric keys {0: {...}, 1: {...}, ...}
  if (typeof data === "object") {
    var arr = [];
    var idx = 0;
    while (data[idx] !== undefined) {
      arr.push(data[idx]);
      idx++;
    }
    if (arr.length > 0) return arr;
  }
  return [];
}

async function loadList(params) {
  params = params || {};
  var page = Number(params.page || 1);
  var type = params.type || "time";

  try {
    var resp = await apiPost("/movie/search", { page: page, type: type });
    if (!resp || resp.status !== "y") {
      // Try /movie/filter as fallback (may work without token)
      resp = await apiPost("/movie/filter", { page: page });
    }

    if (!resp || resp.status !== "y") {
      var errMsg = resp && resp.error ? resp.error : "获取列表失败";
      // If security error, likely token is missing or invalid
      if (errMsg.indexOf("安全") !== -1 || errMsg.indexOf("token") !== -1 || errMsg.indexOf("授权") !== -1) {
        throw new Error("Token 无效或已过期。请在模块设置中手动填写 Token。\n获取方式：浏览器登录 txh068.com → F12 → Application → Local Storage → 复制 fuck 的值");
      }
      throw new Error(errMsg);
    }

    var rawList = extractVideoList(resp.data);
    var items = [];
    for (var i = 0; i < rawList.length; i++) {
      var item = mapVideoItem(rawList[i]);
      if (item) items.push(item);
    }
    return items;
  } catch (error) {
    console.error("[loadList] " + (error.message || error));
    throw error;
  }
}

// Ranking: /ranking/movie, /ranking/original, /ranking/movieBuy
async function loadRank(params) {
  params = params || {};
  var page = Number(params.page || 1);
  var rankType = params.rankType || "movie";

  try {
    var resp = await apiPost("/ranking/" + rankType, { page: page });
    if (!resp || resp.status !== "y") {
      var errMsg = resp && resp.error ? resp.error : "获取排行失败";
      if (errMsg.indexOf("安全") !== -1 || errMsg.indexOf("token") !== -1 || errMsg.indexOf("授权") !== -1) {
        throw new Error("Token 无效或已过期。请在模块设置中手动填写 Token。");
      }
      throw new Error(errMsg);
    }

    var rawList = extractVideoList(resp.data);
    var items = [];
    for (var i = 0; i < rawList.length; i++) {
      var item = mapVideoItem(rawList[i]);
      if (item) items.push(item);
    }
    return items;
  } catch (error) {
    console.error("[loadRank] " + (error.message || error));
    throw error;
  }
}

  async function search(params) {
  params = params || {};
  var keyword = (params.keyword || "").trim();
  var page = Number(params.page || 1);

  if (!keyword) {
    throw new Error("请输入搜索关键词");
  }

  try {
    var resp = await apiPost("/movie/search", { page: page, keyword: keyword });
    if (!resp || resp.status !== "y") {
      var errMsg = resp && resp.error ? resp.error : "搜索失败";
      if (errMsg.indexOf("安全") !== -1 || errMsg.indexOf("token") !== -1 || errMsg.indexOf("授权") !== -1) {
        throw new Error("Token 无效或已过期。请在模块设置中手动填写 Token。");
      }
      throw new Error(errMsg);
    }

    var rawList = extractVideoList(resp.data);
    var items = [];
    for (var i = 0; i < rawList.length; i++) {
      var item = mapVideoItem(rawList[i]);
      if (item) items.push(item);
    }
    return items;
  } catch (error) {
    console.error("[search] " + (error.message || error));
    throw error;
  }
}

// ======================== CDN Full Video ========================

// Check if a video is available on the CDN mirror (t.5gcdn.xyz)
// CDN serves full videos without VIP/preview restriction, but requires Referer header.
// Results are cached to avoid redundant network checks.
async function checkCdnVideo(videoId) {
  var cacheKey = "txh_cdn_" + videoId;
  var cached = Widget.storage.get(cacheKey);
  if (cached === "yes" || cached === "no") {
    return cached === "yes";
  }

  var cdnUrl = CDN_BASE + "/" + videoId + "/index.m3u8";
  try {
    var resp = await Widget.http.get(cdnUrl, {
      headers: {
        "Referer": CDN_REFERER,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    var text = "";
    if (typeof resp === "string") {
      text = resp;
    } else if (resp && typeof resp.data === "string") {
      text = resp.data;
    } else if (resp && typeof resp.data === "object") {
      text = JSON.stringify(resp.data);
    }
    var exists = text.indexOf("#EXTM3U") !== -1;
    Widget.storage.set(cacheKey, exists ? "yes" : "no");
    console.log("[checkCdnVideo] video " + videoId + " on CDN: " + exists);
    return exists;
  } catch (e) {
    console.log("[checkCdnVideo] error for video " + videoId + ": " + (e.message || e));
    // Negative cache for 1 hour to avoid retrying on every load
    Widget.storage.set(cacheKey, "no");
    return false;
  }
}

// Build CDN m3u8 URL for a video
function getCdnUrl(videoId) {
  return CDN_BASE + "/" + videoId + "/index.m3u8";
}

// ======================== Full Video (midorii.cc) ========================

// Fetch full video m3u8 URL from midorii.cc shared VIP proxy
// Returns empty string if failed
async function getFullVideoUrl(videoId) {
  try {
    var resp = await Widget.http.get(MIDORI_API + videoId + "&source=tx", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    var text = "";
    if (typeof resp === "string") {
      text = resp;
    } else if (resp && typeof resp.data === "string") {
      text = resp.data;
    } else if (resp && typeof resp.data === "object") {
      text = JSON.stringify(resp.data);
    }
    var match = text.match(/"play_url"\s*:\s*"([^"]+)"/);
    if (match && match[1]) {
      console.log("[getFullVideoUrl] midorii.cc success: " + match[1]);
      return match[1];
    }
    console.log("[getFullVideoUrl] midorii.cc no play_url in response");
    return "";
  } catch (e) {
    console.log("[getFullVideoUrl] midorii.cc error: " + (e.message || e));
    return "";
  }
}

async function loadDetail(link) {
  var videoId = String(link).replace(/[^0-9]/g, "");

  try {
    var resp = await apiPost("/movie/detail", { id: parseInt(videoId, 10) });
    if (!resp || resp.status !== "y") {
      throw new Error(resp && resp.error ? resp.error : "获取详情失败");
    }

    var item = mapDetail(resp.data);
    if (!item) {
      throw new Error("无法解析视频数据");
    }

    // Use .bnc decrypted image (already set in mapDetail)
    item.headers = { Referer: CDN_REFERER };

    // Save the original txh068.com play URL as fallback (playable preview)
    var originalUrl = item.videoUrl || "";

    // Try midorii.cc for full video (no preview restriction)
    var fullUrl = await getFullVideoUrl(videoId);
    if (fullUrl) {
      // midorii.cc m3u8 has PNG-disguised + AES-encrypted TS segments
      // Player needs hls_proxy.js running at localhost:8888 to decode
      item.videoUrl = "http://localhost:8888/m3u8/" + videoId;
      // Keep original txh068.com URL as fallback (playable without proxy)
      if (originalUrl) item.previewUrl = originalUrl;
      console.log("[loadDetail] using midorii.cc full video via proxy, fallback: " + (originalUrl || "none"));
    } else {
      // Fallback: try CDN (t.5gcdn.xyz) — works for ~500 videos in sitemap
      var cdnAvailable = await checkCdnVideo(videoId);
      if (cdnAvailable) {
        item.videoUrl = getCdnUrl(videoId);
        if (originalUrl) item.previewUrl = originalUrl;
        console.log("[loadDetail] using CDN full video: " + item.videoUrl);
      } else {
        // Last resort: keep txh068.com preview m3u8 (already set by mapDetail)
        console.log("[loadDetail] no full video source, using txh068.com preview: " + (item.videoUrl || "none"));
      }
    }

    return item;
  } catch (error) {
    console.error("[loadDetail] " + (error.message || error));
    throw error;
  }
}
