/**
 * tx-forward-worker — Forward Widget 配套 CF Worker
 * 
 * 角色: m3u8 代理 + API 中继(可选) + 缓存
 * 
 * 路由:
 *   GET  /m3u8?id=35614       → 代理 m3u8 播放列表 (CORS)
 *   POST /api/proxy            → API 中继 (AES 加解密)
 *   GET  /health               → 健康检查
 */

const BASE_URL = "https://txh068.com";
const AES_KEY = "fd14f9f8e38808fa";

// ========== 纯 JS AES-128-ECB (内联，不依赖 Web Crypto) ==========
const SBOX = new Uint8Array([99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22]);
const INV_SBOX = new Uint8Array([82,9,106,213,48,54,165,56,191,64,163,158,129,243,215,251,124,227,57,130,155,47,255,135,52,142,67,68,196,222,233,203,84,123,148,50,166,194,35,61,238,76,149,11,66,250,195,78,8,46,161,102,40,217,36,178,118,91,162,73,109,139,209,37,114,248,246,100,134,104,152,22,212,164,92,204,93,101,182,146,108,112,72,80,253,237,185,218,94,21,70,87,167,141,157,132,144,216,171,0,140,188,211,10,247,228,88,5,184,179,69,6,208,44,30,143,202,63,15,2,193,175,189,3,1,19,138,107,58,145,17,65,79,103,220,234,151,242,207,206,240,180,230,115,150,172,116,34,231,173,53,133,226,249,55,232,28,117,223,110,71,241,26,113,29,41,197,137,111,183,98,14,170,24,190,27,252,86,62,75,198,210,121,32,154,219,192,254,120,205,90,244,31,221,168,51,136,7,199,49,177,18,16,89,39,128,236,95,96,81,127,169,25,181,74,13,45,229,122,159,147,201,156,239,160,224,59,77,174,42,245,176,200,235,187,60,131,83,153,97,23,43,4,126,186,119,214,38,225,105,20,99,85,33,12,125]);

function xtime(a){return((a<<1)^(((a>>7)&1)*27))&255;}
function gmul(a,b){let p=0;for(let i=0;i<8;i++){if(b&1)p^=a;const hi=a&128;a=(a<<1)&255;if(hi)a^=27;b>>=1;}return p;}

function keyExpansion(key) {
  const w=new Uint8Array(176);
  w.set(key);
  const rc=[1,2,4,8,16,32,64,128,27,54];
  for(let i=4;i<44;i++){
    const j=4*i;
    let t0=w[j-4],t1=w[j-3],t2=w[j-2],t3=w[j-1];
    if(i%4===0){
      const x=t0;t0=t1;t1=t2;t2=t3;t3=x;
      t0=SBOX[t0];t1=SBOX[t1];t2=SBOX[t2];t3=SBOX[t3];
      t0^=rc[i/4-1];
    }
    w[j]=w[j-16]^t0;w[j+1]=w[j-15]^t1;w[j+2]=w[j-14]^t2;w[j+3]=w[j-13]^t3;
  }
  return w;
}

function aesEncryptECB(plain) {
  const rk=keyExpansion(new TextEncoder().encode(AES_KEY));
  const data=new TextEncoder().encode(plain);
  const pad=16-(data.length%16);
  const padded=new Uint8Array(data.length+pad);
  padded.set(data);padded.fill(pad,data.length);
  const out=new Uint8Array(padded.length);
  for(let i=0;i<padded.length;i+=16){
    const s=new Uint8Array(padded.buffer,i,16);
    for(let j=0;j<16;j++)s[j]^=rk[j];
    for(let r=1;r<10;r++){
      for(let j=0;j<16;j++)s[j]=SBOX[s[j]];
      const t=new Uint8Array(s);
      s[1]=t[5];s[5]=t[9];s[9]=t[13];s[13]=t[1];
      s[2]=t[10];s[10]=t[2];s[6]=t[14];s[14]=t[6];
      s[3]=t[15];s[15]=t[11];s[11]=t[7];s[7]=t[3];
      for(let c=0;c<4;c++){
        const ci=c*4,a0=s[ci],a1=s[ci+1],a2=s[ci+2],a3=s[ci+3];
        s[ci]=xtime(a0)^(xtime(a1)^a1)^a2^a3;
        s[ci+1]=a0^xtime(a1)^(xtime(a2)^a2)^a3;
        s[ci+2]=a0^a1^xtime(a2)^(xtime(a3)^a3);
        s[ci+3]=(xtime(a0)^a0)^a1^a2^xtime(a3);
      }
      for(let j=0;j<16;j++)s[j]^=rk[r*16+j];
    }
    for(let j=0;j<16;j++)s[j]=SBOX[s[j]];const t=new Uint8Array(s);
    s[1]=t[5];s[5]=t[9];s[9]=t[13];s[13]=t[1];
    s[2]=t[10];s[10]=t[2];s[6]=t[14];s[14]=t[6];
    s[3]=t[15];s[15]=t[11];s[11]=t[7];s[7]=t[3];
    for(let j=0;j<16;j++)s[j]^=rk[160+j];
    out.set(s,i);
  }
  return btoa(String.fromCharCode(...out));
}

function aesDecryptECB(b64) {
  const rk=keyExpansion(new TextEncoder().encode(AES_KEY));
  const raw=atob(b64.replace(/\s/g,""));
  const ct=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)ct[i]=raw.charCodeAt(i);
  const out=new Uint8Array(ct.length);
  for(let i=0;i<ct.length;i+=16){
    const s=new Uint8Array(ct.buffer,i,16);
    for(let j=0;j<16;j++)s[j]^=rk[160+j];
    for(let r=9;r>=1;r--){
      const t=new Uint8Array(s);
      s[1]=t[13];s[5]=t[1];s[9]=t[5];s[13]=t[9];
      s[2]=t[10];s[10]=t[2];s[6]=t[14];s[14]=t[6];
      s[3]=t[7];s[7]=t[11];s[11]=t[15];s[15]=t[3];
      for(let j=0;j<16;j++)s[j]=INV_SBOX[s[j]];
      for(let j=0;j<16;j++)s[j]^=rk[r*16+j];
      for(let c=0;c<4;c++){
        const ci=c*4,a0=s[ci],a1=s[ci+1],a2=s[ci+2],a3=s[ci+3];
        s[ci]=gmul(a0,14)^gmul(a1,11)^gmul(a2,13)^gmul(a3,9);
        s[ci+1]=gmul(a0,9)^gmul(a1,14)^gmul(a2,11)^gmul(a3,13);
        s[ci+2]=gmul(a0,13)^gmul(a1,9)^gmul(a2,14)^gmul(a3,11);
        s[ci+3]=gmul(a0,11)^gmul(a1,13)^gmul(a2,9)^gmul(a3,14);
      }
    }
    const t=new Uint8Array(s);
    s[1]=t[13];s[5]=t[1];s[9]=t[5];s[13]=t[9];
    s[2]=t[10];s[10]=t[2];s[6]=t[14];s[14]=t[6];
    s[3]=t[7];s[7]=t[11];s[11]=t[15];s[15]=t[3];
    for(let j=0;j<16;j++){const sb=SBOX[s[j]];s[j]=((sb>>4)|(sb<<4))&255;}
    for(let j=0;j<16;j++)s[j]^=rk[j];
    out.set(s,i);
  }
  const pad=out[out.length-1];
  return new TextDecoder().decode(out.slice(0,out.length-(pad>0&&pad<=16?pad:0)));
}

// ========== Handler ==========
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === "/health") {
      return jsonResponse({ ok: true, time: Date.now() });
    }

    // ── m3u8 proxy ──
    if (path === "/m3u8" || path.startsWith("/m3u8")) {
      return handleM3u8(url, request);
    }

    // ── API relay ──
    if (path === "/api/proxy") {
      return handleApiProxy(request);
    }

    // ── AES helper ──
    if (path === "/aes/decrypt" && request.method === "POST") {
      return handleAesDecrypt(request);
    }
    if (path === "/aes/encrypt" && request.method === "POST") {
      return handleAesEncrypt(request);
    }

    // Default
    return jsonResponse({
      ok: true,
      service: "tx-forward-worker",
      endpoints: ["/m3u8?id=MOVIE_ID", "/api/proxy", "/aes/decrypt", "/aes/encrypt", "/health"],
    });
  },
};

// ── m3u8 proxy ──
async function handleM3u8(url, request) {
  const movieId = url.searchParams.get("id");
  if (!movieId) {
    return jsonResponse({ ok: false, error: "missing id param" }, 400);
  }

  // 尝试从缓存读取
  const cacheKey = new Request("https://tx-cache/m3u8/" + movieId);
  const cache = caches.default;
  let cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  // 从视频站获取 m3u8
  try {
    const resp = await fetch(BASE_URL + "/h5/m3u8/link/" + movieId + ".m3u8", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!resp.ok) {
      return jsonResponse({ ok: false, error: "upstream " + resp.status }, 502);
    }

    let m3u8Content = await resp.text();

    // 如果是预览版，标记在注释中
    const isPreview = m3u8Content.includes("m3u8-preview");
    const segCount = (m3u8Content.match(/#EXTINF/g) || []).length;

    const response = new Response(m3u8Content, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
        "X-Preview": isPreview ? "1" : "0",
        "X-Segments": String(segCount),
      },
    });

    // 缓存 5 分钟
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 502);
  }
}

// ── API relay (Forward Widget → Worker → 视频站) ──
async function handleApiProxy(request) {
  try {
    const body = await request.json();
    const { path, data, method } = body;

    if (!path) {
      return jsonResponse({ ok: false, error: "missing path" }, 400);
    }

    const now = Math.floor(Date.now() / 1000);
    const reqBody = JSON.stringify({
      data: data || "",
      token: body.token || "_",
      deviceId: body.deviceId || null,
      device: "MacIntel",
      source: "Apple Computer, Inc.",
      driver: "",
    });

    const encryptedBody = aesEncryptECB(reqBody);

    const resp = await fetch(BASE_URL + path, {
      method: method || "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "deviceType": "web",
        "time": String(now),
        "version": "4.76",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      body: encryptedBody,
    });

    const encryptedResp = await resp.text();
    if (!encryptedResp) {
      return jsonResponse({ ok: false, error: "empty response" }, 502);
    }

    const decrypted = aesDecryptECB(encryptedResp);

    return jsonResponse({
      ok: true,
      data: JSON.parse(decrypted),
    });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

// ── AES helpers (供 Forward Widget 离线使用) ──
async function handleAesDecrypt(request) {
  try {
    const body = await request.json();
    const decrypted = aesDecryptECB(body.data || "");
    return jsonResponse({ ok: true, data: decrypted });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 400);
  }
}

async function handleAesEncrypt(request) {
  try {
    const body = await request.json();
    const encrypted = aesEncryptECB(body.data || "");
    return jsonResponse({ ok: true, data: encrypted });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 400);
  }
}

// ── helpers ──
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
