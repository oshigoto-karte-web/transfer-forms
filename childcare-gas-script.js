/**
 * コード.gs（修正版）
 *
 * ■ 変更点
 *   doPost の先頭に「簡易版」への振り分けを追加。
 *   data.source === "kantan" の場合のみ「簡易版」シートに書き込み、
 *   それ以外は既存の処理（シート1への書き込み）をそのまま実行する。
 *
 * ■ 対応する「簡易版｜アンケート回収.gs」の修正
 *   このファイルに doPost を集約したため、
 *   「簡易版｜アンケート回収.gs」の doPost と doGet は削除してください。
 *   （ファイル自体は残しておいてもOKです）
 *
 * ■ 再デプロイ手順
 *   1. このコードで「コード.gs」を上書き保存
 *   2. 「デプロイ」→「デプロイを管理」→鉛筆アイコン（編集）
 *   3. バージョンを「新しいバージョン」に変更して「デプロイ」
 *   4. URLは変わらないので VITE_GAS_WEBHOOK_URL の更新は不要
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ===== ★ ピンク版フォーム（簡易版）からの送信 =====
    // source: "kantan" が含まれる場合は「簡易版」シートへ書き込む
    if (data.source === "kantan") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName("簡易版");

      if (!sheet) {
        return ContentService.createTextOutput(
          JSON.stringify({ status: "error", message: "シートが見つかりません: 簡易版" })
        ).setMimeType(ContentService.MimeType.JSON);
      }

      const dateStr = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");

      // A=送信日時, B=記入者のお名前, C=電話番号, D=ご連絡希望日程, E=ご連絡希望時間
      sheet.appendRow([
        dateStr,
        data.name  || "",
        data.phone || "",
        data.date  || "",
        data.time  || "",
      ]);

      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "簡易版シートに保存しました" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // ===== 既存の処理（シート1への書き込み）=====
    // childcare.html からの送信はここで処理される（変更なし）
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const timestamp = new Date();
    
    const rowData = [
      timestamp,                    // 送信日時
      data.name || '',              // 記入者のお名前
      data.age || '',               // 年齢 ★修正: data.age + '' を data.age に変更
      data.trigger || '',           // 転職のきっかけ
      data.must1 || '',             // マスト条件1
      data.must2 || '',             // マスト条件2
      data.must3 || '',             // マスト条件3
      data.facility || '',          // 希望施設・職場
      data.other_facility || '',    // その他の希望施設
      data.employment || '',        // ご希望の雇用形態
      data.weekend || '',           // 休日、土日出勤可否
      data.weekend_details || '',   // 土曜日出勤の詳細
      data.salary || '',            // 現職年収
      data.commute || '',           // 通勤可能エリア
      data.career || '',            // 新卒からのご経歴
      data.interview_time || '',    // 面接可能日時
      data.timing || '',            // 転職タイミング
      data.license || '',           // 資格
      data.other_license || '',     // その他の資格
      data.interested_jobs || '',   // 気になる求人
      data.ng_jobs || '',           // NG求人
      data.contact_time || ''       // 連絡しやすい時間帯
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'データを保存しました'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
