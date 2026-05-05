// 1. パラメータ取得と表示
const params = new URLSearchParams(window.location.search);
const workId  = params.get("workId")  || "（未指定）";
const date    = params.get("date")    || "";
const summary = params.get("summary") || "";

document.getElementById("workId").textContent = workId;
document.getElementById("date").textContent = date;
document.getElementById("summary").textContent = summary;

// 2. Canvas設定
const canvas = document.getElementById("signature");
const signaturePad = new SignaturePad(canvas, {
  backgroundColor: "rgb(255,255,255)"
});

// 3. 高解像度・リサイズ対応
function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  // 表示サイズを保持したまま内部解像度を上げる
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
  signaturePad.clear(); // リサイズで内容が消えるためリセット
}

// 初期化時と画面回転時に実行
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 4. スクロール抑止（iOS/Androidの誤動作防止）
document.body.addEventListener("touchmove", function (e) {
  if (e.target === canvas) e.preventDefault();
}, { passive: false });

// 5. クリア
function clearPad() {
  signaturePad.clear();
}

// 6. 保存（焼き込み処理付き）
function saveSignature() {
  if (signaturePad.isEmpty()) {
    alert("サインをお願いします。");
    return;
  }

  // 焼き込み用のコンテキスト（高解像度対応済み）
  const ctx = canvas.getContext("2d");
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  
  // 焼き込む文字の設定（高解像度を考慮したフォントサイズ）
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#333";
  const now = new Date().toLocaleString('ja-JP');
  
  // 焼き込み位置の計算（左下付近）
  // CSS上の座標(10, 230)付近に描画されるよう調整
  ctx.fillText(`作業番号: ${workId}`, 10, (canvas.height / ratio) - 30);
  ctx.fillText(`署名日時: ${now}`, 10, (canvas.height / ratio) - 12);

  // PNG化
  const dataURL = canvas.toDataURL("image/png");

  // ダウンロード処理
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = `signature_${workId}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  alert("署名画像を保存しました。\n既存システムへ画像を添付してください。");
}
