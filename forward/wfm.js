// 网飞猫 ncat21 影视模块 - 诊断版 v4
// 关键修复：使用 http:// 而非 https://（API 端口 51080/51122/51172 是 HTTP 端口）
// 改进：1) http:// 请求 + 签名 探测所有已知路径
//       2) 探测网站 HTML 也改用 http:// 尝试
//       3) 增加更多路径变体

const HASH = "te@9fs#5tbf8#dx7zw8nx";
const AES_KEY = "ayt5wy5afwmwrpb19k9s3psx3dymyd0n";
const AES_IV = "b3t069ijy7pirw0j";
const APP_ID = "ncat";
const USER_CHANNEL = "c200000";
const DEVICE_ID = (function () {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
})();
const DEVICE_CREATED_AT = String(Date.now());

// ============ 纯 JS crypto ============
function utf8ToBytes(str) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
    else if (c < 0xd800 || c >= 0xe000) { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
    else { i++; c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff)); out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
  }
  return out;
}
function bytesToUtf8(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length;) {
    const c = bytes[i++];
    if (c < 0x80) s += String.fromCharCode(c);
    else if (c < 0xe0) s += String.fromCharCode(((c & 0x1f) << 6) | (bytes[i++] & 0x3f));
    else if (c < 0xf0) s += String.fromCharCode(((c & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
    else { let cp = ((c & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f); cp -= 0x10000; s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff)); }
  }
  return s;
}
function b64ToBytes(b64) {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = {};
  for (let i = 0; i < abc.length; i++) lookup[abc[i]] = i;
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, "");
  const out = [];
  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup[clean[i]], b = lookup[clean[i + 1]], c = lookup[clean[i + 2]], d = lookup[clean[i + 3]];
    out.push((a << 2) | (b >> 4), ((b & 15) << 4) | (c >> 2), ((c & 3) << 6) | d);
  }
  while (out.length && out[out.length - 1] === undefined) out.pop();
  return out;
}
function sha1(bytes) {
  const l = bytes.length, bitLen = l * 8;
  const p = bytes.slice();
  p.push(0x80);
  while (p.length % 64 !== 56) p.push(0);
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  for (let i = 0; i < 4; i++) p.push((hi >>> ((3 - i) * 8)) & 0xff);
  for (let i = 0; i < 4; i++) p.push((lo >>> ((3 - i) * 8)) & 0xff);
  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
  const K = [0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xCA62C1D6];
  for (let i = 0; i < p.length; i += 64) {
    const w = new Array(80);
    for (let j = 0; j < 16; j++) w[j] = ((p[i + j * 4] << 24) | (p[i + j * 4 + 1] << 16) | (p[i + j * 4 + 2] << 8) | p[i + j * 4 + 3]) >>> 0;
    for (let j = 16; j < 80; j++) { const v = (w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16]) >>> 0; w[j] = (((v << 1) | (v >>> 31)) >>> 0); }
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20) { f = (b & c) | (~b & d); k = K[0]; }
      else if (j < 40) { f = b ^ c ^ d; k = K[1]; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = K[2]; }
      else { f = b ^ c ^ d; k = K[3]; }
      f = f >>> 0;
      const temp = (((((a << 5) | (a >>> 27)) >>> 0) + f + e + k + w[j]) | 0);
      e = d; d = c; c = (((b << 30) | (b >>> 2)) >>> 0); b = a; a = temp;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
  }
  return [h0, h1, h2, h3, h4].flatMap(x => [(x >>> 24) & 0xff, (x >>> 16) & 0xff, (x >>> 8) & 0xff, x & 0xff]);
}
function hmacSha1(msg, key) {
  const block = 64;
  let k = utf8ToBytes(key);
  if (k.length > block) k = sha1(k);
  while (k.length < block) k.push(0);
  const oKey = k.map(b => b ^ 0x5c);
  const iKey = k.map(b => b ^ 0x36);
  return sha1(oKey.concat(sha1(iKey.concat(utf8ToBytes(msg))))).map(b => b.toString(16).padStart(2, "0")).join("");
}
const SBOX = [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16];
const SBOXI = [0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d];
function gmul(a, b) { let p = 0; for (let i = 0; i < 8; i++) { if (b & 1) p ^= a; const hi = a & 0x80; a = (a << 1) & 0xff; if (hi) a ^= 0x1b; b >>= 1; } return p & 0xff; }
function aesKeyExpansion(key) {
  const Nk = key.length / 4, Nr = Nk + 6, Nb = 4;
  const w = new Array(Nb * (Nr + 1));
  for (let i = 0; i < Nk; i++) w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
  const Rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d];
  for (let i = Nk; i < Nb * (Nr + 1); i++) {
    let t = w[i - 1].slice();
    if (i % Nk === 0) { t.push(t.shift()); for (let j = 0; j < 4; j++) t[j] = SBOX[t[j]]; t[0] ^= Rcon[(i / Nk) - 1]; }
    else if (Nk > 6 && i % Nk === 4) { for (let j = 0; j < 4; j++) t[j] = SBOX[t[j]]; }
    const prev = w[i - Nk];
    w[i] = [t[0] ^ prev[0], t[1] ^ prev[1], t[2] ^ prev[2], t[3] ^ prev[3]];
  }
  return { w, Nr };
}
function aesDecryptBlock(block, key) {
  const { w, Nr } = aesKeyExpansion(key);
  const state = [[block[0], block[4], block[8], block[12]], [block[1], block[5], block[9], block[13]], [block[2], block[6], block[10], block[14]], [block[3], block[7], block[11], block[15]]];
  const addRK = (r) => { for (let c = 0; c < 4; c++) { const word = w[r * 4 + c]; for (let row = 0; row < 4; row++) state[row][c] ^= word[row]; } };
  const invShift = () => { const t = state.map(r => r.slice()); for (let r = 1; r < 4; r++) for (let c = 0; c < 4; c++) state[r][c] = t[r][(c - r + 4) % 4]; };
  const invSub = () => { for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) state[r][c] = SBOXI[state[r][c]]; };
  const invMix = () => { for (let c = 0; c < 4; c++) { const a = [state[0][c], state[1][c], state[2][c], state[3][c]]; state[0][c] = gmul(a[0], 14) ^ gmul(a[1], 11) ^ gmul(a[2], 13) ^ gmul(a[3], 9); state[1][c] = gmul(a[0], 9) ^ gmul(a[1], 14) ^ gmul(a[2], 11) ^ gmul(a[3], 13); state[2][c] = gmul(a[0], 13) ^ gmul(a[1], 9) ^ gmul(a[2], 14) ^ gmul(a[3], 11); state[3][c] = gmul(a[0], 11) ^ gmul(a[1], 13) ^ gmul(a[2], 9) ^ gmul(a[3], 14); } };
  addRK(Nr);
  for (let r = Nr - 1; r > 0; r--) { invShift(); invSub(); addRK(r); invMix(); }
  invShift(); invSub(); addRK(0);
  return [state[0][0], state[1][0], state[2][0], state[3][0], state[0][1], state[1][1], state[2][1], state[3][1], state[0][2], state[1][2], state[2][2], state[3][2], state[0][3], state[1][3], state[2][3], state[3][3]];
}
function aes256CbcDecrypt(base64Cipher, keyStr, ivStr) {
  const key = utf8ToBytes(keyStr);
  const iv = utf8ToBytes(ivStr);
  const bin = b64ToBytes(base64Cipher);
  const out = [];
  let prev = iv.slice();
  for (let off = 0; off < bin.length; off += 16) {
    const block = bin.slice(off, off + 16);
    if (block.length < 16) break;
    const dec = aesDecryptBlock(block, key);
    for (let i = 0; i < 16; i++) out.push(dec[i] ^ prev[i]);
    prev = block.slice();
  }
  let len = out.length;
  const pad = out[len - 1];
  if (pad > 0 && pad <= 16) len -= pad;
  return bytesToUtf8(out.slice(0, len));
}

// ============ 签名 ============
function makeSign(urlPath, paramsObj, method) {
  method = method || "GET";
  const ts = Date.now();
  const queryString = Object.keys(paramsObj).sort().map(k => k + "=" + paramsObj[k]).join("&");
  const prefix = "appId=" + APP_ID + "&deviceCreatedAt=" + DEVICE_CREATED_AT + "&deviceId=" + DEVICE_ID;
  const msg = method + "|" + urlPath + "|" + queryString + "|" + ts + "|" + prefix + "|";
  return { ts: String(ts), sign: hmacSha1(msg, HASH), queryString };
}

// ============ 请求工具 ============
async function apiGet(apiBase, urlPath, params) {
  const { ts, sign, queryString } = makeSign(urlPath, params);
  const fullUrl = apiBase + urlPath + (queryString ? "?" + queryString : "");
  const resp = await Widget.http.get(fullUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 Chrome/120.0",
      "Accept": "application/json, text/plain, */*",
      "ts": ts,
      "sign": sign,
      "Content-Type": "application/json;charset=UTF-8"
    },
    timeout: 10000
  });
  let raw = resp.data;
  if (raw && typeof raw === "object" && raw.data !== undefined) raw = raw.data;
  return raw;
}

async function apiPost(apiBase, urlPath, params) {
  const { ts, sign } = makeSign(urlPath, params, "POST");
  const fullUrl = apiBase + urlPath;
  const resp = await Widget.http.post(fullUrl, JSON.stringify(params), {
    headers: {
      "User-Agent": "Mozilla/5.0 Chrome/120.0",
      "Accept": "application/json, text/plain, */*",
      "ts": ts,
      "sign": sign,
      "Content-Type": "application/json;charset=UTF-8"
    },
    timeout: 10000
  });
  let raw = resp.data;
  if (raw && typeof raw === "object" && raw.data !== undefined) raw = raw.data;
  return raw;
}

async function safeDecrypt(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/\n/g, "");
  if (s.length < 5) return null;
  try {
    const json = aes256CbcDecrypt(s, AES_KEY, AES_IV);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// ============ 第1步：动态提取 API 域名 ============
async function extractApiDomain() {
  let report = "";
  const candidates = [];

  // 尝试从网站 HTML 提取 - 先用 http://
  try {
    report += "[1] 尝试从 http://www.ncat21.com 提取 whatTMDwhatTMDApiDomain...\n";
    const resp = await Widget.http.get("http://www.ncat21.com/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
      },
      timeout: 15000
    });
    const html = String(resp.data);
    const m = html.match(/whatTMDwhatTMDApiDomain\s*=\s*["']([^"']+)["']/);
    if (m && m[1]) {
      const domain = m[1];
      report += "  ✓ 找到: " + domain + "\n";
      candidates.push(domain);
    } else {
      report += "  ✗ HTML 中未找到 whatTMDwhatTMDApiDomain\n";
      // 也输出 script src 帮助分析
      const scripts = html.match(/<script[^>]*src=["']([^"']+)["']/g) || [];
      if (scripts.length) {
        report += "  script src: " + scripts.slice(0, 5).join(", ").replace(/<[^>]*>/g, "") + "\n";
      }
    }
  } catch (e) {
    report += "  ✗ 获取网站失败: " + (e.message || String(e)).slice(0, 100) + "\n";
  }

  // 其他可能站点 - 也用 http://
  const siteUrls = [
    "http://ncat21.com/",
    "http://103.194.185.51:51122/",
  ];
  
  for (const url of siteUrls) {
    if (url === "https://www.ncat21.com/") continue; // already tried
    try {
      const resp = await Widget.http.get(url, {
        headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0", "Accept": "text/html" },
        timeout: 10000
      });
      const html = String(resp.data);
      const m = html.match(/whatTMDwhatTMDApiDomain\s*=\s*["']([^"']+)["']/);
      if (m && m[1]) {
        report += "  ✓ " + url + " → " + m[1] + "\n";
        if (!candidates.includes(m[1])) candidates.push(m[1]);
      }
    } catch (e) {
      // skip
    }
  }

  // 后备：使用 http://（这些是 HTTP 端口，非 HTTPS）
  const fallbacks = [
    "http://43.248.100.69:51080",
    "http://103.194.185.51:51122",
    "http://103.194.185.51:51172",
    "http://43.248.100.69:51030",
    "http://43.248.100.69:51050",
  ];
  for (const fb of fallbacks) {
    if (!candidates.includes(fb)) candidates.push(fb);
  }

  return { candidates, report };
}

// ============ 第2步：探测 API ============
async function probeApi(apiBase) {
  // 先试 kkys 确认路径 - 这些路径不加密，直接返回 JSON
  const testPaths = [
    { path: "/vod/copyright", label: "copyright", params: { appId: APP_ID } },
    { path: "/vod/copyr", label: "copyr(简写)", params: { appId: APP_ID } },
    { path: "/vod/history", label: "history", params: { appId: APP_ID, page: "1" } },
    { path: "/vod/histo", label: "histo(简写)", params: { appId: APP_ID, page: "1" } },
    { path: "/vod/favorite", label: "favorite", params: { appId: APP_ID } },
    { path: "/vod/favor", label: "favor(简写)", params: { appId: APP_ID } },
    { path: "/user/login", label: "login", params: { appId: APP_ID } },
    { path: "/user/logi", label: "logi(简写)", params: { appId: APP_ID } },
    { path: "/user/info", label: "userInfo", params: { appId: APP_ID } },
    { path: "/app/announcements", label: "announcements", params: { appId: APP_ID } },
    { path: "/app/annou", label: "annou(简写)", params: { appId: APP_ID } },
    { path: "/config/unknown", label: "config", params: { appId: APP_ID } },
  ];

  let report = "";
  let working = false;

  for (const tp of testPaths) {
    for (const method of ["GET", "POST"]) {
      try {
        let raw;
        if (method === "GET") {
          raw = await apiGet(apiBase, tp.path, tp.params);
        } else {
          raw = await apiPost(apiBase, tp.path, tp.params);
        }
        
        if (raw && String(raw).length > 2) {
          // 尝试解密
          const dec = await safeDecrypt(raw);
          if (dec) {
            report += "  ✓ " + method + " " + tp.path + " (解密成功) keys:{" + Object.keys(dec).join(",") + "}\n";
            working = true;
            return { working: true, report, foundPath: tp.path, foundMethod: method, foundData: dec };
          } else {
            report += "  ~ " + method + " " + tp.path + " 响应:" + String(raw).slice(0, 80) + "\n";
            working = true; // 有响应就算通
          }
        }
      } catch (e) {
        const em = (e.message || String(e)).slice(0, 60);
        if (!em.includes("404")) {
          report += "  ✗ " + method + " " + tp.path + " => " + em + "\n";
        }
      }
    }
  }

  return { working: false, report };
}

// ============ 主诊断流程 ============
async function loadHome() {
  let report = "===== 网飞猫 诊断 v3 =====\n\n";

  // Step 1: 获取 API 域名
  report += "【Step 1】动态获取 API 域名:\n";
  const { candidates, report: domainReport } = await extractApiDomain();
  report += domainReport;

  if (!candidates.length) {
    report += "\n❌ 未能获取任何 API 域名候选！\n";
    throw new Error(report);
  }

  // Step 2: 依次测试每个候选
  report += "\n【Step 2】探测 API (先测 kkys 确认路径):\n";
  let found = null;

  for (const apiBase of candidates) {
    report += "\n--- 测试 " + apiBase + " ---\n";
    const result = await probeApi(apiBase);
    report += result.report;
    if (result.working) {
      found = result;
      break;
    }
  }

  if (!found || !found.working) {
    report += "\n❌ 所有 API 候选均失败！\n";
    // 试试不带签名的简单探测
    report += "\n【Step 3】不带签名直接探测各 API 根路径:\n";
    for (const apiBase of candidates) {
      try {
        const r = await Widget.http.get(apiBase + "/", { timeout: 5000 });
        report += "  ✓ " + apiBase + "/ → " + String(r.data).slice(0, 100) + "\n";
      } catch (e) {
        report += "  ✗ " + apiBase + "/ → " + (e.message || e).slice(0, 80) + "\n";
      }
    }
    
    report += "\n【Step 4】尝试 ncat21.com 页面请求详情:\n";
    try {
      const r = await Widget.http.get("http://www.ncat21.com/", {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0", "Accept": "text/html" },
        timeout: 15000
      });
      const html = String(r.data).slice(0, 3000);
      report += "  首页 HTML 前 3000 字符:\n" + html + "\n";
      
      // 分析重要的全局赋值
      const vars = html.match(/(?:window\.)?(\w+(?:TMD|tmd)\w*)\s*=\s*["'][^"']+["']/g) || [];
      if (vars.length) {
        report += "  找到的相关变量:\n";
        vars.forEach(v => report += "    " + v + "\n");
      }
      
      // key 值
      const keyMatch = html.match(/\bkey\s*:\s*["']([^"']+)["']/g);
      if (keyMatch) report += "  key 值: " + keyMatch.join(", ") + "\n";
    } catch (e) {
      report += "  ✗ " + (e.message || e).slice(0, 100) + "\n";
    }

    throw new Error(report.slice(0, 5000));
  }

  // 如果找到了工作路径，进一步探测内容端点
  if (found.foundData) {
    report += "\n✓ 找到工作路径: " + (found.foundMethod || "GET") + " " + found.foundPath + "\n";
    report += "  解密数据: " + JSON.stringify(found.foundData).slice(0, 500) + "\n";
  }

  throw new Error(report.slice(0, 5000));
}

// 临时 stubs
async function loadMovies() { return { items: [] }; }
async function loadSeries() { return { items: [] }; }
async function loadAnime() { return { items: [] }; }
async function loadVariety() { return { items: [] }; }
async function loadDetail(id) { throw new Error("待端点确认"); }
async function search(kw) { return { items: [] }; }

WidgetMetadata = {
  id: "ncat21",
  title: "网飞猫 ncat21 [诊断v4]",
  description: "v4:用http://替代https://(SSL修复)+更多端口",
  version: "1.4.1-diag4",
  requiredVersion: "0.0.1",
  modules: [
    { id: "home", title: "诊断/首页", functionName: "loadHome", cacheDuration: 60, params: [] },
    { id: "movie", title: "电影(待修复)", functionName: "loadMovies", cacheDuration: 3600, params: [] },
    { id: "tv", title: "剧集(待修复)", functionName: "loadSeries", cacheDuration: 3600, params: [] },
    { id: "anime", title: "动漫(待修复)", functionName: "loadAnime", cacheDuration: 3600, params: [] },
    { id: "variety", title: "综艺(待修复)", functionName: "loadVariety", cacheDuration: 3600, params: [] },
  ],
  supportedSearch: true,
  searchTab: { title: "搜索(待修复)", placeholder: "请输入影片名" },
  iconBase64: "",
};
