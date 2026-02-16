"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface HistoryEntry {
  year: string;
  month: string;
  content: string;
}

interface LicenseEntry {
  year: string;
  month: string;
  content: string;
}

interface ResumeData {
  date: string;
  nameKana: string;
  nameKanji: string;
  birthDate: string;
  age: string;
  gender: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
  education: HistoryEntry[];
  career: HistoryEntry[];
  licenses: LicenseEntry[];
  motivation: string;
  request: string;
}

function ResumePreview() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");
  const [isReady, setIsReady] = useState(false);

  let resumeData: ResumeData | null = null;

  if (dataParam) {
    try {
      // Base64url デコーディング
      let base64 = dataParam.replace(/-/g, "+").replace(/_/g, "/");
      // パディングを追加
      while (base64.length % 4) {
        base64 += "=";
      }
      const jsonString = decodeURIComponent(escape(atob(base64)));
      resumeData = JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse resume data:", error);
    }
  }

  useEffect(() => {
    // フォントとコンテンツの読み込みを待つ
    const prepareForRendering = async () => {
      try {
        // フォントの読み込みを待つ
        if (document.fonts) {
          await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 5000)), // 5秒タイムアウト
          ]);
        }

        // 画像などの読み込みを待つ
        await new Promise((resolve) => {
          if (document.readyState === "complete") {
            resolve(null);
          } else {
            const loadHandler = () => {
              resolve(null);
              window.removeEventListener("load", loadHandler);
            };
            window.addEventListener("load", loadHandler);

            // タイムアウト設定
            setTimeout(() => resolve(null), 5000);
          }
        });

        // 少し余裕を持たせる（レイアウトシフト対策）
        await new Promise((resolve) => setTimeout(resolve, 300));

        // レンダリング完了をマーク
        setIsReady(true);
        document.body.setAttribute("data-ready", "true");
        console.log("Resume rendering ready");
      } catch (error) {
        console.error("Error preparing for rendering:", error);
        // エラーがあっても表示する
        setIsReady(true);
        document.body.setAttribute("data-ready", "true");
      }
    };

    prepareForRendering();
  }, []);

  if (!resumeData) {
    return (
      <div className="error-container">
        <h1>データが見つかりません</h1>
        <p>履歴書データを読み込めませんでした。</p>
        <a href="/">入力フォームに戻る</a>
      </div>
    );
  }

  return (
    <>
      {!isReady && (
        <div className="rendering-loader">
          <div className="loader-content">
            <div className="spinner"></div>
            <p>履歴書を準備中...</p>
          </div>
        </div>
      )}
      <div className={`resume-container ${isReady ? "ready" : "loading"}`}>
        <div className="resume-page">
        {/* ヘッダー部分 */}
        <div className="resume-header">
          <h1 className="resume-title">履歴書</h1>
          <div className="resume-date">
            <span className="text-sm">{resumeData.date || "令和　　年　　月　　日"}現在</span>
          </div>
        </div>

        {/* 基本情報セクション */}
        <div className="basic-info-section">
          <div className="info-left">
            {/* 氏名・フリガナ */}
            <div className="name-section">
              <div className="field-row">
                <div className="field-label">フリガナ</div>
                <div className="field-value name-kana">{resumeData.nameKana}</div>
              </div>
              <div className="field-row">
                <div className="field-label">氏名</div>
                <div className="field-value name-kanji">{resumeData.nameKanji}</div>
              </div>
            </div>

            {/* 生年月日・性別 */}
            <div className="birth-gender-section">
              <div className="field-row">
                <div className="field-label">生年月日</div>
                <div className="field-value birth-date">
                  <span className="text-sm">
                    {resumeData.birthDate}（{resumeData.age}）
                  </span>
                </div>
              </div>
              <div className="field-row">
                <div className="field-label">性別</div>
                <div className="field-value gender">
                  <span className="text-sm">{resumeData.gender}</span>
                </div>
              </div>
            </div>

            {/* 住所 */}
            <div className="address-section">
              <div className="field-row">
                <div className="field-label">現住所</div>
                <div className="field-value">
                  <div className="postal-code">〒 {resumeData.postalCode}</div>
                  <div className="address-detail">{resumeData.address}</div>
                </div>
              </div>
              <div className="field-row">
                <div className="field-label">電話</div>
                <div className="field-value phone">{resumeData.phone}</div>
              </div>
              <div className="field-row">
                <div className="field-label">E-mail</div>
                <div className="field-value email">{resumeData.email}</div>
              </div>
            </div>
          </div>

          {/* 写真欄 */}
          <div className="photo-section">
            <div className="photo-box">
              <span className="photo-placeholder">写真を貼る位置</span>
              <span className="photo-size">縦4cm×横3cm</span>
            </div>
          </div>
        </div>

        {/* 学歴・職歴 */}
        <div className="history-section">
          <table className="history-table">
            <thead>
              <tr>
                <th className="year-column">年</th>
                <th className="month-column">月</th>
                <th className="content-column">学歴・職歴（各別にまとめて書く）</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="section-title">
                  学歴
                </td>
              </tr>
              {resumeData.education.map((entry, index) => (
                <tr key={`edu-${index}`}>
                  <td>{entry.year}</td>
                  <td>{entry.month}</td>
                  <td>{entry.content}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="section-title">
                  職歴
                </td>
              </tr>
              {resumeData.career.map((entry, index) => (
                <tr key={`career-${index}`}>
                  <td>{entry.year}</td>
                  <td>{entry.month}</td>
                  <td>{entry.content}</td>
                </tr>
              ))}
              {resumeData.career.length > 0 && (
                <tr>
                  <td></td>
                  <td></td>
                  <td className="text-right">以上</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 免許・資格 */}
        <div className="license-section">
          <table className="license-table">
            <thead>
              <tr>
                <th className="year-column">年</th>
                <th className="month-column">月</th>
                <th className="content-column">免許・資格</th>
              </tr>
            </thead>
            <tbody>
              {resumeData.licenses.length > 0 ? (
                resumeData.licenses.map((entry, index) => (
                  <tr key={`license-${index}`}>
                    <td>{entry.year}</td>
                    <td>{entry.month}</td>
                    <td>{entry.content}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* 志望動機・自己PR */}
        <div className="motivation-section">
          <div className="section-header">志望の動機、自己PR、趣味、特技など</div>
          <div className="motivation-content">{resumeData.motivation}</div>
        </div>

        {/* 本人希望欄 */}
        <div className="request-section">
          <div className="section-header">
            本人希望記入欄（特に給料・職種・勤務時間・その他についての希望などがあれば記入）
          </div>
          <div className="request-content">{resumeData.request}</div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-container">
          <p>読み込み中...</p>
        </div>
      }
    >
      <ResumePreview />
    </Suspense>
  );
}
