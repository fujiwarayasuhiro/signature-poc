// 1. パラメータ取得と表示
const params = new URLSearchParams(window.location.search);
const workId  = params.get("workId")  || "（未指定）";
const date    = params.get("date")    || "";
const summary = params.get("summary") || "";

// index.htmlの新しいIDに合わせて表示
document.getElementById("displayWorkId").textContent = workId;
document.getElementById("displayDate").textContent = date;
document.getElementById("displaySummary").textContent = summary;

// 2. Canvas設定
const canvas = document.getElementById("signature");
const signaturePad = new SignaturePad(canvas, {
  backgroundColor: "rgb(255,255,255)",
  penColor: "rgb(0, 0, 0)"
});

// 3. 高解像度・リサイズ対応
function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  
  // 描画内容を一時保存（リサイズで消えるのを防ぐため）
  const data = signaturePad.toData();
  
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  
  signaturePad.clear(); // 内部バッファのリセット
  signaturePad.fromData(data); // 描画内容を復元
}

// 初期化時と画面回転時に実行
window.addEventListener("resize", resizeCanvas);
// 読み込み直後に実行（少し遅らせるとoffsetWidthが確実に取得できます）
setTimeout(resizeCanvas, 100);

// 4. スクロール抑止（iOS/Androidの誤動作防止）
canvas.addEventListener("touchstart", function (e) {
  if (e.target === canvas) e.preventDefault();
}, { passive: false });
canvas.addEventListener("touchmove", function (e) {
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

  // 焼き込み用の準備
  const ctx = canvas.getContext("2d");
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  
  // 焼き込む文字の設定
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#333";
  const now = new Date().toLocaleString('ja-JP');
  
  // 焼き込み位置の計算（左下付近）
  // 1行目: 点検No
  ctx.fillText(`点検No: ${workId}`, 10, (canvas.height / ratio) - 35);
  // 2行目: 点検名
  ctx.fillText(`点検名: ${summary}`, 10, (canvas.height / ratio) - 20);
  // 3行目: 署名日時
  ctx.fillText(`完了日時: ${now}`, 10, (canvas.height / ratio) - 5);

  // PNG化
  const dataURL = canvas.toDataURL("image/png");

  // ダウンロード処理
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = `signature_${workId}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  alert("署名画像を保存しました。\nJUST.DBへ画像を添付してください。");
}