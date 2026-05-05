// URLパラメータ取得
const params = new URLSearchParams(window.location.search);

const workId   = params.get("workId")   || "（未指定）";
const date     = params.get("date")     || "";
const summary  = params.get("summary")  || "";

// 表示
document.getElementById("workId").textContent = workId;
document.getElementById("date").textContent = date;
document.getElementById("summary").textContent = summary;

// Canvas設定
const canvas = document.getElementById("signature");

// 高解像度対応（iPhone対策）
function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
}
resizeCanvas();

const signaturePad = new SignaturePad(canvas, {
  backgroundColor: "rgb(255,255,255)"
});

// スクロール抑止（署名中）
document.body.addEventListener("touchmove", function (e) {
  if (e.target === canvas) e.preventDefault();
}, { passive: false });

// クリア
function clearPad() {
  signaturePad.clear();
}

// 保存
function saveSignature() {
  if (signaturePad.isEmpty()) {
    alert("サインをお願いします。");
    return;
  }

  // 作業情報を画像に焼き込み
  const ctx = canvas.getContext("2d");
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#000";
  const now = new Date().toLocaleString();
  ctx.fillText(`作業番号: ${workId}`, 10, canvas.height - 30);
  ctx.fillText(`署名日時: ${now}`, 10, canvas.height - 14);

  // PNG化
  const dataURL = canvas.toDataURL("image/png");

  // ダウンロード
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = `signature_${workId}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  alert("署名画像を保存しました。\n既存システムへ画像を添付してください。");
}
