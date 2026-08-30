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
  // プレビュー生成用Canvas
  //
  const exportCanvas =
  document.createElement("canvas");

  exportCanvas.width =
    canvas.width;
  
  /*
    下部に情報表示エリアを追加
  */
  exportCanvas.height =
    canvas.height + 120;

  const ctx =
    exportCanvas.getContext("2d");

  //
  // 白背景
  //
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    0,
    0,
    exportCanvas.width,
    exportCanvas.height
  );

  //
  // サイン画像をコピー
  //
  ctx.drawImage(
    canvas,
    0,
    0
  );

  //
  // 点検情報を書き込む
  //
  
  const ratio =
    Math.max(window.devicePixelRatio || 1, 1);
  
  const infoTop =
    (canvas.height / ratio) + 25;
  
  ctx.fillStyle = "#333";
  ctx.font = "14px sans-serif";
  
  ctx.fillText(
    `点検No: ${workId || "－"}`,
    10,
    infoTop
  );
  
  ctx.fillText(
    `点検名: ${summary || "－"}`,
    10,
    infoTop + 22
  );
  
  ctx.fillText(
    `事業所名(施設名): ${siteName || "－"}`,
    10,
    infoTop + 44
  );
  
  ctx.fillText(
    `作業日: ${displayDate}`,
    10,
    infoTop + 66
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
