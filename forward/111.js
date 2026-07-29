WidgetMetadata = {
  id: "forward.txh",
  title: "糖心",
  version: "2.0.0",
  requiredVersion: "0.0.1",
  description: "糖心视频 — 纯 Worker 代理模式，无需 Token。列表通过视频 ID 倒序扫描实现，播放直接获取完整 m3u8。",
  author: "Forward",
  site: "https://txh068.com",
  detailCacheDuration: 60,
  modules: [
    {
      id: "loadList",
      title: "最新",
      functionName: "loadList",
      cacheDuration: 300,
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

// ======================== Constants ========================
var AES_KEY = "fd14f9f8e38808fa";
var SIGN_KEY = "baby99119900";
var WORKER_URL = "https://tx.zzxu.de";
var BASE_URL = "https://tth.txh069.com";
var PAGE_SIZE = 12;

// ======================== AES-128-ECB (compact) ========================
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

function pkcs7Unpad(b) {
  if (b.length === 0) return b;
  var pad = b[b.length - 1];
  if (pad < 1 || pad > 16) throw new Error("Invalid PKCS7 padding");
  return b.slice(0, b.length - pad);
}

var _expandedKey = null;
function getExpandedKey() {
  if (!_expandedKey) _expandedKey = keyExpansion(strToBytes(AES_KEY));
  return _expandedKey;
}

function aesEcbDecrypt(cipherBytes) {
  var w = getExpandedKey();
  var out = [];
  for (var i = 0; i < cipherBytes.length; i += 16) {
    var block = cipherBytes.slice(i, i + 16);
    var dec = aesDecryptBlock(block, w);
    for (var j = 0; j < 16; j++) out.push(dec[j]);
  }
  return pkcs7Unpad(out);
}

function decryptB64(b64Str) {
  var cipherBytes = b64decode(b64Str);
  var plainBytes = aesEcbDecrypt(cipherBytes);
  var jsonStr = bytesToStr(plainBytes);
  return JSON.parse(jsonStr);
}

// ======================== MD5 (for Worker sign) ========================
function md5(s) {
  function rh(n) { var s2 = "", j; for (j = 0; j <= 3; j++) s2 += ((n >> (j * 8 + 4)) & 0x0f).toString(16) + ((n >> (j * 8)) & 0x0f).toString(16); return s2; }
  function ad(x, y) { var l = (x & 0xffff) + (y & 0xffff); var m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xffff); }
  function rl(n, c) { return (n << c) | (n >>> (32 - c)); }
  function cm(q, a, b, x, s2, t) { return ad(rl(ad(ad(a, q), ad(x, t)), s2), b); }
  function ff(a, b, c, d, x, s2, t) { return cm((b & c) | (~b & d), a, b, x, s2, t); }
  function gg(a, b, c, d, x, s2, t) { return cm((b & d) | (c & ~d), a, b, x, s2, t); }
  function hh(a, b, c, d, x, s2, t) { return cm(b ^ c ^ d, a, b, x, s2, t); }
  function ii(a, b, c, d, x, s2, t) { return cm(c ^ (b | ~d), a, b, x, s2, t); }
  function cv(s2) {
    var u = strToBytes(s2);
    var n = ((u.length + 8) >> 6) + 1;
    var b = new Array(n * 16).fill(0);
    for (var i = 0; i < u.length; i++) b[i >> 2] |= u[i] << ((i % 4) * 8);
    b[u.length >> 2] |= 0x80 << ((u.length % 4) * 8);
    b[n * 16 - 2] = u.length * 8;
    return b;
  }
  var x = cv(s);
  var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (var i = 0; i < x.length; i += 16) {
    var oa = a, ob = b, oc = c, od = d;
    a=ff(a,b,c,d,x[i],7,-680876936); d=ff(d,a,b,c,x[i+1],12,-389564586); c=ff(c,d,a,b,x[i+2],17,606105819); b=ff(b,c,d,a,x[i+3],22,-1044525330);
    a=ff(a,b,c,d,x[i+4],7,-176418897); d=ff(d,a,b,c,x[i+5],12,1200080426); c=ff(c,d,a,b,x[i+6],17,-1473231341); b=ff(b,c,d,a,x[i+7],22,-45705983);
    a=ff(a,b,c,d,x[i+8],7,1770035416); d=ff(d,a,b,c,x[i+9],12,-1958414417); c=ff(c,d,a,b,x[i+10],17,-42063); b=ff(b,c,d,a,x[i+11],22,-1990404162);
    a=ff(a,b,c,d,x[i+12],7,1804603682); d=ff(d,a,b,c,x[i+13],12,-40341101); c=ff(c,d,a,b,x[i+14],17,-1502002290); b=ff(b,c,d,a,x[i+15],22,1236535329);
    a=gg(a,b,c,d,x[i+1],5,-165796510); d=gg(d,a,b,c,x[i+6],9,-1069501632); c=gg(c,d,a,b,x[i+11],14,643717713); b=gg(b,c,d,a,x[i],20,-373897302);
    a=gg(a,b,c,d,x[i+5],5,-701558691); d=gg(d,a,b,c,x[i+10],9,38016083); c=gg(c,d,a,b,x[i+15],14,-660478335); b=gg(b,c,d,a,x[i+4],20,-405537848);
    a=gg(a,b,c,d,x[i+9],5,568446438); d=gg(d,a,b,c,x[i+14],9,-1019803690); c=gg(c,d,a,b,x[i+3],14,-187363961); b=gg(b,c,d,a,x[i+8],20,1163531501);
    a=gg(a,b,c,d,x[i+13],5,-1444681467); d=gg(d,a,b,c,x[i+2],9,-51403784); c=gg(c,d,a,b,x[i+7],14,1735328473); b=gg(b,c,d,a,x[i+12],20,-1926607734);
    a=hh(a,b,c,d,x[i+5],4,-378558); d=hh(d,a,b,c,x[i+8],11,-2022574463); c=hh(c,d,a,b,x[i+11],16,1839030562); b=hh(b,c,d,a,x[i+14],23,-35309556);
    a=hh(a,b,c,d,x[i+1],4,-1530992060); d=hh(d,a,b,c,x[i+4],11,1272893353); c=hh(c,d,a,b,x[i+7],16,-155497632); b=hh(b,c,d,a,x[i+10],23,-1094730640);
    a=hh(a,b,c,d,x[i+13],4,681279174); d=hh(d,a,b,c,x[i],11,-358537222); c=hh(c,d,a,b,x[i+3],16,-722521979); b=hh(b,c,d,a,x[i+6],23,76029189);
    a=hh(a,b,c,d,x[i+9],4,-640364487); d=hh(d,a,b,c,x[i+12],11,-421815835); c=hh(c,d,a,b,x[i+15],16,530742520); b=hh(b,c,d,a,x[i+2],23,-995338651);
    a=ii(a,b,c,d,x[i],6,-198630844); d=ii(d,a,b,c,x[i+7],10,1126891415); c=ii(c,d,a,b,x[i+14],15,-1416354905); b=ii(b,c,d,a,x[i+5],21,-57434055);
    a=ii(a,b,c,d,x[i+12],6,1700485571); d=ii(d,a,b,c,x[i+3],10,-1894986606); c=ii(c,d,a,b,x[i+10],15,-1051523); b=ii(b,c,d,a,x[i+1],21,-2054922799);
    a=ii(a,b,c,d,x[i+8],6,1873313359); d=ii(d,a,b,c,x[i+15],10,-30611744); c=ii(c,d,a,b,x[i+6],15,-1560198380); b=ii(b,c,d,a,x[i+13],21,1309151649);
    a=ii(a,b,c,d,x[i+4],6,-145523070); d=ii(d,a,b,c,x[i+11],10,-1120210379); c=ii(c,d,a,b,x[i+2],15,718787259); b=ii(b,c,d,a,x[i+9],21,-343485551);
    a=ad(a,oa); b=ad(b,ob); c=ad(c,oc); d=ad(d,od);
  }
  return rh(a) + rh(b) + rh(c) + rh(d);
}

// ======================== Worker API ========================

function normalizeM3u8(url) {
  if (!url) return url;
  if (url.indexOf("http") === 0) return url;
  return BASE_URL + (url.charAt(0) === "/" ? "" : "/") + url;
}

async function fetchFromWorker(videoId) {
  var t = Math.floor(Date.now() / 1000);
  var sign = md5(String(videoId) + t + SIGN_KEY);
  var body = JSON.stringify({ id: String(videoId), t: t, sign: sign });
  var headers = {
    "Content-Type": "application/json",
    "User-Agent": "TX_App_Script",
  };
  var resp = await Widget.http.post(WORKER_URL, body, { headers: headers });
  var text = resp.data;

  // Worker response can be: (A) pure base64 encrypted string,
  // (B) JSON wrapper with encrypted data field, or (C) standard {status,data} format.
  var outer;
  try {
    outer = JSON.parse(text);
  } catch (e) {
    // Not JSON — pure base64, decrypt directly
    var raw = decryptB64(text);
    if (raw && raw.status === "y") return raw.data;
    return null;
  }

  // JSON — check standard status format first
  if (outer && outer.status === "y") return outer.data;

  // Check for encrypted data/body/result field
  var keys = ["data", "body", "result"];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (outer && typeof outer[k] === "string") {
      var inner = decryptB64(outer[k]);
      if (inner && inner.status === "y") return inner.data;
      if (inner) return inner;
    }
  }

  // data is already a plain object
  if (outer && typeof outer.data === "object") return outer.data;

  return null;
}

// ======================== Max ID management ========================

async function findMaxId() {
  // Check cache (refresh every 6 hours)
  var cached = Widget.storage.get("txh_max_id");
  var cachedTime = Widget.storage.get("txh_max_id_time");
  var now = Date.now();
  if (cached && cachedTime && (now - parseInt(cachedTime)) < 6 * 3600 * 1000) {
    // Quick check: try cached + 1 to see if new videos exist
    var nextId = parseInt(cached) + 1;
    var testData = await fetchFromWorker(nextId);
    if (testData && testData.id) {
      // New video found — do a quick upward search (max 50 steps)
      var newMax = nextId;
      for (var i = nextId + 1; i <= nextId + 50; i++) {
        var d = await fetchFromWorker(i);
        if (d && d.id) newMax = i;
        else break;
      }
      Widget.storage.set("txh_max_id", String(newMax));
      Widget.storage.set("txh_max_id_time", String(now));
      return newMax;
    }
    return parseInt(cached);
  }

  // Full binary search
  var lo = 35000;
  var hi = lo + 2000;

  // Find an invalid hi
  var testData = await fetchFromWorker(hi);
  while (testData) {
    lo = hi;
    hi = hi + 2000;
    testData = await fetchFromWorker(hi);
  }

  // Binary search between lo (valid) and hi (invalid)
  while (hi - lo > 1) {
    var mid = Math.floor((lo + hi) / 2);
    var d = await fetchFromWorker(mid);
    if (d) lo = mid;
    else hi = mid;
  }

  Widget.storage.set("txh_max_id", String(lo));
  Widget.storage.set("txh_max_id_time", String(now));
  return lo;
}

// ======================== VideoItem mapping ========================

function mapVideoItem(raw) {
  if (!raw || !raw.id) return null;
  return {
    id: String(raw.id),
    type: "url",
    title: raw.name || raw.title || "",
    posterPath: raw.img || raw.pic || raw.cover || "",
    backdropPath: raw.img || raw.pic || raw.cover || "",
    rating: raw.score ? parseFloat(raw.score) : undefined,
    durationText: raw.duration || "",
    duration: raw.duration_time ? parseInt(raw.duration_time, 10) : undefined,
    releaseDate: raw.time ? raw.time.split(" ")[0] : undefined,
    link: String(raw.id),
  };
}

function mapDetail(raw) {
  if (!raw) return null;
  var item = mapVideoItem(raw);
  if (!item) return null;

  item.description = raw.description || raw.content || "";

  // Tags → genreItems
  if (raw.tags && raw.tags.length) {
    item.genreItems = raw.tags.map(function (t) {
      return { id: String(t.id || ""), title: (t.name || "").trim() };
    });
  }

  // Peoples
  if (raw.nickname) {
    item.peoples = [{
      id: String(raw.user_id || raw.nickname || ""),
      title: raw.nickname || "",
      avatar: raw.headico || "",
      role: "UP主",
    }];
  }

  // Video URL — check multiple possible fields
  var playLink = raw.play_link || raw.play_url ||
    (raw.lines && raw.lines.length ? raw.lines[0].link : "") ||
    (raw.line_list && raw.line_list.length ? raw.line_list[0].link : "");
  if (playLink) {
    item.videoUrl = normalizeM3u8(playLink);
  }

  // Backup link
  var backupLink = raw.backup_link || raw.backup_url || "";
  if (backupLink) {
    item.previewUrl = normalizeM3u8(backupLink);
  }

  // If no videoUrl found, scan for any m3u8 URL in the raw data
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

async function loadList(params) {
  params = params || {};
  var page = Number(params.page || 1);

  try {
    var maxId = await findMaxId();
    var startId = maxId - (page - 1) * PAGE_SIZE;

    if (startId < 1) return [];

    // Fetch PAGE_SIZE videos in parallel
    var promises = [];
    for (var i = 0; i < PAGE_SIZE; i++) {
      var id = startId - i;
      if (id < 1) break;
      promises.push(
        fetchFromWorker(id).catch(function () { return null; })
      );
    }

    var results = await Promise.all(promises);

    // Map to VideoItems, filter out nulls
    var items = [];
    for (var j = 0; j < results.length; j++) {
      var item = mapVideoItem(results[j]);
      if (item) items.push(item);
    }

    return items;
  } catch (error) {
    console.error("[loadList] " + (error.message || error));
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

  // Worker mode: scan a batch of videos and filter by keyword locally
  // This is limited but provides basic search functionality
  try {
    var maxId = await findMaxId();
    // Scan 60 videos per search page (fetch in parallel, filter by keyword)
    var scanCount = 60;
    var startId = maxId - (page - 1) * scanCount;
    if (startId < 1) return [];

    var promises = [];
    for (var i = 0; i < scanCount; i++) {
      var id = startId - i;
      if (id < 1) break;
      promises.push(
        fetchFromWorker(id).catch(function () { return null; })
      );
    }

    var results = await Promise.all(promises);

    var items = [];
    var kw = keyword.toLowerCase();
    for (var j = 0; j < results.length; j++) {
      var raw = results[j];
      if (!raw || !raw.id) continue;
      var title = (raw.name || raw.title || "").toLowerCase();
      var desc = (raw.description || "").toLowerCase();
      var nick = (raw.nickname || "").toLowerCase();
      // Check tags
      var tagMatch = false;
      if (raw.tags && raw.tags.length) {
        for (var t = 0; t < raw.tags.length; t++) {
          if ((raw.tags[t].name || "").toLowerCase().indexOf(kw) !== -1) {
            tagMatch = true;
            break;
          }
        }
      }
      if (title.indexOf(kw) !== -1 || desc.indexOf(kw) !== -1 ||
          nick.indexOf(kw) !== -1 || tagMatch) {
        var item = mapVideoItem(raw);
        if (item) items.push(item);
      }
    }

    return items;
  } catch (error) {
    console.error("[search] " + (error.message || error));
    throw error;
  }
}

async function loadDetail(link) {
  var videoId = String(link);
  if (videoId.indexOf(":") !== -1) videoId = videoId.split(":").pop();
  if (videoId.indexOf("/") !== -1) videoId = videoId.split("/").pop();

  try {
    var data = await fetchFromWorker(videoId);
    if (!data) throw new Error("视频不存在或已删除");
    return mapDetail(data);
  } catch (error) {
    console.error("[loadDetail] " + (error.message || error));
    throw error;
  }
}
