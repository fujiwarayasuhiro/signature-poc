//
// URLパラメータ取得
//
const params = new URLSearchParams(window.location.search);

const workId =
  params.get("workId") || "";

const date =
  params.get("date") || "";

const summary =
  params.get("summary") || "";

const siteName =
  params.get("siteName") || "";

//
// 作業日表示用
//
const today = new Date();

const todayStr =
  today.getFullYear() + "-" +
  String(today.getMonth() + 1).padStart(2, "0") + "-" +
  String(today.getDate()).padStart(2, "0");

let displayDate = date;

if (date === todayStr) {

  const currentTime =
    String(today.getHours()).padStart(2, "0") + ":" +
    String(today.getMinutes()).padStart(2, "0") + ":" +
    String(today.getSeconds()).padStart(2, "0");

  displayDate =
    `${date} ${currentTime}`;
}

//
// 画面表示
//
document.getElementById("displayWorkId").textContent =
  workId || "－";

document.getElementById("displaySummary").textContent =
  summary || "－";

document.getElementById("displaySiteName").textContent =
  siteName || "－";

document.getElementById("displayDate").textContent =
  date || "－";

//
// Canvas初期化
//
const canvas =
  document.getElementById("signature");

const signaturePad =
  new SignaturePad(canvas, {
    backgroundColor: "rgb(255,255,255)",
    penColor: "rgb(0,0,0)"
  });

//
// 高解像度対応
//
function resizeCanvas() {

  const ratio =
    Math.max(window.devicePixelRatio || 1, 1);

  const data =
    signaturePad.toData();

  canvas.width =
    canvas.offsetWidth * ratio;

  canvas.height =
    canvas.offsetHeight * ratio;

  canvas
    .getContext("2d")
    .setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );

  signaturePad.clear();

  if (data.length > 0) {
    signaturePad.fromData(data);
  }
}

window.addEventListener(
  "resize",
  resizeCanvas
);

setTimeout(
  resizeCanvas,
  100
);

//
// スクロール誤動作防止
//
canvas.addEventListener(
  "touchstart",
  function(e) {

    if (e.target === canvas) {
      e.preventDefault();
    }

  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  function(e) {

    if (e.target === canvas) {
      e.preventDefault();
    }

  },
  { passive: false }
);

//
// 戻る
//
function goBack() {

  history.back();

}

//
// クリア
//
function clearPad() {

  signaturePad.clear();

}

//
// モーダル用
//
let previewDataURL = "";

//
// 保存ボタン
//
function saveSignature() {

  if (signaturePad.isEmpty()) {

    alert("サインをお願いします。");

    return;
  }

  //
  // 固定出力解像度の設定 (要件: 2424×1134)
  //
  const TARGET_WIDTH = 2424;
  const TARGET_HEIGHT = 1134;
  const TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT; // 約 2.137566

  const exportCanvas =
    document.createElement("canvas");
  exportCanvas.width = TARGET_WIDTH;
  exportCanvas.height = TARGET_HEIGHT;

  const ctx =
    exportCanvas.getContext("2d");

  //
  // 白背景描画
  //
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    0,
    0,
    TARGET_WIDTH,
    TARGET_HEIGHT
  );

  //
  // Bounding Rect (署名が存在する最小バウンディングボックス) の取得
  //
  const srcCtx = canvas.getContext("2d");
  const imgData = srcCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
  let hasContent = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      const red = data[(y * canvas.width + x) * 4];
      const green = data[(y * canvas.width + x) * 4 + 1];
      const blue = data[(y * canvas.width + x) * 4 + 2];
      
      // 白背景以外の描画部分を自動検出
      if (alpha > 0 && !(red === 255 && green === 255 && blue === 255)) {
        hasContent = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // 万が一描画が検出されない場合はCanvas全体を使用（フォールバック）
  let cropX = 0, cropY = 0, cropW = canvas.width, cropH = canvas.height;
  if (hasContent) {
    // 描画部分にわずかなマージンを追加
    const padding = 20;
    cropX = Math.max(0, minX - padding);
    cropY = Math.max(0, minY - padding);
    cropW = Math.min(canvas.width - cropX, (maxX - minX) + padding * 2);
    cropH = Math.min(canvas.height - cropY, (maxY - minY) + padding * 2);
  }

  //
  // 署名エリアおよび情報書き込みエリアの設定
  //
  const infoHeight = 220; // 文字情報領域
  const availableSignatureHeight = TARGET_HEIGHT - infoHeight;
  const availableSignatureWidth = TARGET_WIDTH - 80;

  //
  // アスペクト比を固定し、トリミングせずに収める拡大縮小と余白計算
  //
  const srcRatio = cropW / cropH;
  let drawW, drawH;

  if (srcRatio > (availableSignatureWidth / availableSignatureHeight)) {
    // 横長：左右に合わせ、上下に余白追加
    drawW = availableSignatureWidth;
    drawH = availableSignatureWidth / srcRatio;
  } else {
    // 縦長：上下に合わせ、左右に余白追加
    drawH = availableSignatureHeight;
    drawW = availableSignatureHeight * srcRatio;
  }

  const drawX = 40 + (availableSignatureWidth - drawW) / 2;
  const drawY = 20 + (availableSignatureHeight - drawH) / 2;

  // 署名を描画
  ctx.drawImage(
    canvas,
    cropX, cropY, cropW, cropH,
    drawX, drawY, drawW, drawH
  );

  //
  // 点検情報を下部に書き込む (高解像度 2424×1134 に合わせたフォントサイズ)
  //
  const infoTop = TARGET_HEIGHT - infoHeight + 20;
  ctx.fillStyle = "#333333";
  ctx.font = "bold 36px sans-serif";
  
  ctx.fillText(
    `点検No: ${workId || "－"}`,
    40,
    infoTop
  );
  
  ctx.fillText(
    `点検名: ${summary || "－"}`,
    40,
    infoTop + 48
  );
  
  ctx.fillText(
    `事業所名(施設名): ${siteName || "－"}`,
    40,
    infoTop + 96
  );
  
  ctx.fillText(
    `作業日: ${displayDate}`,
    40,
    infoTop + 144
  );

  //
  // プレビュー生成
  //
  previewDataURL =
    exportCanvas.toDataURL("image/png");

  document.getElementById(
    "previewImage"
  ).src = previewDataURL;

  document.getElementById(
    "previewModal"
  ).style.display = "flex";
}

//
// モーダル閉じる
//
function closeModal() {

  document.getElementById(
    "previewModal"
  ).style.display = "none";

}

//
// 保存確定
//
function confirmSave() {

  const now =
    new Date().toLocaleString("ja-JP");

  const safeSummary =
    (summary || "未分類")
      .replace(/[\\/?%*:|"<>]/g, "-");

  const formattedDate =
    now.replace(/[\/\s:]/g, "_");

  const fileName =
    `お客様手書きサイン_${safeSummary}_${formattedDate}.png`;

  const a =
    document.createElement("a");

  a.href = previewDataURL;

  a.download =
    fileName;

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);

  closeModal();

  setTimeout(() => {
    alert("保存完了\n\n画像を保存しました。");
    window.location.href = "url-generator.html";
  }, 200);

}
