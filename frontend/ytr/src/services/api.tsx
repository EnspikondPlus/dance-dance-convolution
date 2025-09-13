export async function sendLinkFlask(link: string) {
  const res = await fetch("http://127.0.0.1:5000/api/process_link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link }),
  });
  return res.json();
}

export async function sendProcessing(link: string) {
  const res = await fetch("http://127.0.0.1:5000/api/process_video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link }),
  });
  return res.json();
}

export async function sendFrameFlask(image: string) {
  const res = await fetch("http://127.0.0.1:5000/api/upload_frame", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image }),
  });
  return res.json();
}

export async function sendTrackFlask(image: string) {
  const res = await fetch("http://127.0.0.1:5000/api/upload_track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image }), // <-- must match backend key
  });
  return res.json();
}

export async function calculateScores(pose: any, track: any) {
  const res = await fetch("http://127.0.0.1:5000/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pose, track}), // <-- must match backend key
  });
  return res.json();
}
