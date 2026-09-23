const BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisCmd(cmd) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
  });

  if (!res.ok) {
    throw new Error(`Upstash error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.result;
}

export async function getJSON(key) {
  const val = await redisCmd(["GET", key]);
  return val ? JSON.parse(val) : null;
}

// Default TTL: 3 days, plenty for one shift's reminder lifecycle, keeps
// the store from accumulating stale keys forever.
export async function setJSON(key, value, exSeconds = 60 * 60 * 24 * 3) {
  await redisCmd(["SET", key, JSON.stringify(value), "EX", String(exSeconds)]);
}
