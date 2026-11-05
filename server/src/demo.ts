const DEMO_NOTICE =
  "Demonstration mode is on because no Gemini API key is configured. This picture is a fixed style sample drawn for Margination. It is not an AI illustration of your passage.";

const demoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <rect width="1200" height="900" fill="#FFF7F0"/>
  <g fill="none" stroke="#243028" stroke-width="3" stroke-linejoin="round">
    <path d="M80 700c120-40 180-30 260-80s150-40 250-20 180 10 280-40 160-20 250 20" />
    <path d="M140 640c40-70 90-90 130-40s20 90-20 120-90 10-110-80z" fill="#2F9E62" stroke="#1D6B42"/>
    <path d="M860 610c50-90 120-100 160-30s10 120-40 150-130 0-120-120z" fill="#3CAF6E" stroke="#1D6B42"/>
    <path d="M430 470h250v170H430z" fill="#FFFDFB"/>
    <path d="M430 470l125-70 125 70" fill="#FF6B9A"/>
    <rect x="520" y="530" width="70" height="90" fill="#FFE3EE"/>
    <path d="M250 760c30-80 70-120 90-80s10 90-20 130" fill="#2F9E62" stroke="#1D6B42"/>
    <path d="M980 740c40-70 80-80 90-20s-20 90-50 100-70-10-40-80z" fill="#FF8FB3" stroke="#243028"/>
  </g>
  <path d="M600 150c6 46 26 66 72 72-46 6-66 26-72 72-6-46-26-66-72-72 46-6 66-26 72-72z" fill="#2F9E62"/>
  <path d="M600 186c3 24 14 35 38 38-24 3-35 14-38 38-3-24-14-35-38-38 24-3 35-14 38-38z" fill="#FF8FB3"/>
</svg>`;

export function demonstrationImage(): { mimeType: string; imageBase64: string; notice: string } {
  return {
    mimeType: "image/svg+xml",
    imageBase64: Buffer.from(demoSvg, "utf8").toString("base64"),
    notice: DEMO_NOTICE,
  };
}
