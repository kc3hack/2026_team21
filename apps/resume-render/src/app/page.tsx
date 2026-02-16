"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import { ja } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { toJapaneseDate, toJapaneseDateWithAge, getCurrentJapaneseDate } from "@/utils/japaneseDate";

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

export default function Home() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date | null>(new Date());
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    date: getCurrentJapaneseDate(),
    nameKana: "",
    nameKanji: "",
    birthDate: "",
    age: "",
    gender: "",
    postalCode: "",
    address: "",
    phone: "",
    email: "",
    education: [] as HistoryEntry[],
    career: [] as HistoryEntry[],
    licenses: [] as LicenseEntry[],
    motivation: "",
    request: "",
  });

  const addEducationRow = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { year: "", month: "", content: "" }],
    });
  };

  const addCareerRow = () => {
    setFormData({
      ...formData,
      career: [...formData.career, { year: "", month: "", content: "" }],
    });
  };

  const addLicenseRow = () => {
    setFormData({
      ...formData,
      licenses: [...formData.licenses, { year: "", month: "", content: "" }],
    });
  };

  const handleCurrentDateChange = (date: Date | null) => {
    setCurrentDate(date);
    if (date) {
      setFormData({ ...formData, date: toJapaneseDate(date) });
    }
  };

  const handleBirthDateChange = (date: Date | null) => {
    setBirthDate(date);
    if (date) {
      const { dateStr, age } = toJapaneseDateWithAge(date);
      setFormData({ ...formData, birthDate: `${dateStr}生`, age: `満${age}歳` });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Base64url エンコーディング
    const jsonString = JSON.stringify(formData);
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    router.push(`/preview?data=${base64url}`);
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1 className="form-title">履歴書入力フォーム</h1>

        <form onSubmit={handleSubmit} className="resume-form">
          {/* 基本情報 */}
          <section className="form-section">
            <h2 className="section-title-form">基本情報</h2>

            <div className="form-group">
              <label>作成日</label>
              <DatePicker
                selected={currentDate}
                onChange={handleCurrentDateChange}
                dateFormat="yyyy/MM/dd"
                locale={ja}
                className="datepicker-input"
                placeholderText="日付を選択"
              />
              <div className="japanese-date-display">{formData.date}現在</div>
            </div>

            <div className="form-group">
              <label>フリガナ</label>
              <input
                type="text"
                placeholder="ヤマダ タロウ"
                value={formData.nameKana}
                onChange={(e) => setFormData({ ...formData, nameKana: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>氏名</label>
              <input
                type="text"
                placeholder="山田 太郎"
                value={formData.nameKanji}
                onChange={(e) => setFormData({ ...formData, nameKanji: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>生年月日</label>
              <DatePicker
                selected={birthDate}
                onChange={handleBirthDateChange}
                dateFormat="yyyy/MM/dd"
                locale={ja}
                className="datepicker-input"
                placeholderText="生年月日を選択"
                showYearDropdown
                yearDropdownItemNumber={100}
                scrollableYearDropdown
              />
              <div className="japanese-date-display">
                {formData.birthDate && `${formData.birthDate}（${formData.age}）`}
              </div>
            </div>

            <div className="form-group">
              <label>性別</label>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                <option value="">選択してください</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>

            <div className="form-group">
              <label>郵便番号</label>
              <input
                type="text"
                placeholder="123-4567"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>住所</label>
              <input
                type="text"
                placeholder="東京都○○区○○ 1-2-3"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>電話番号</label>
              <input
                type="tel"
                placeholder="03-1234-5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>メールアドレス</label>
              <input
                type="email"
                placeholder="example@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </section>

          {/* 学歴 */}
          <section className="form-section">
            <h2 className="section-title-form">学歴</h2>
            {formData.education.map((entry, index) => (
              <div key={index} className="form-row history-row">
                <input
                  type="text"
                  placeholder="年"
                  value={entry.year}
                  onChange={(e) => {
                    const newEducation = [...formData.education];
                    newEducation[index].year = e.target.value;
                    setFormData({ ...formData, education: newEducation });
                  }}
                  className="year-input"
                />
                <input
                  type="text"
                  placeholder="月"
                  value={entry.month}
                  onChange={(e) => {
                    const newEducation = [...formData.education];
                    newEducation[index].month = e.target.value;
                    setFormData({ ...formData, education: newEducation });
                  }}
                  className="month-input"
                />
                <input
                  type="text"
                  placeholder="○○高等学校 卒業"
                  value={entry.content}
                  onChange={(e) => {
                    const newEducation = [...formData.education];
                    newEducation[index].content = e.target.value;
                    setFormData({ ...formData, education: newEducation });
                  }}
                  className="content-input"
                />
              </div>
            ))}
            <button type="button" onClick={addEducationRow} className="add-btn">
              + 学歴を追加
            </button>
          </section>

          {/* 職歴 */}
          <section className="form-section">
            <h2 className="section-title-form">職歴</h2>
            {formData.career.map((entry, index) => (
              <div key={index} className="form-row history-row">
                <input
                  type="text"
                  placeholder="年"
                  value={entry.year}
                  onChange={(e) => {
                    const newCareer = [...formData.career];
                    newCareer[index].year = e.target.value;
                    setFormData({ ...formData, career: newCareer });
                  }}
                  className="year-input"
                />
                <input
                  type="text"
                  placeholder="月"
                  value={entry.month}
                  onChange={(e) => {
                    const newCareer = [...formData.career];
                    newCareer[index].month = e.target.value;
                    setFormData({ ...formData, career: newCareer });
                  }}
                  className="month-input"
                />
                <input
                  type="text"
                  placeholder="株式会社○○ 入社"
                  value={entry.content}
                  onChange={(e) => {
                    const newCareer = [...formData.career];
                    newCareer[index].content = e.target.value;
                    setFormData({ ...formData, career: newCareer });
                  }}
                  className="content-input"
                />
              </div>
            ))}
            <button type="button" onClick={addCareerRow} className="add-btn">
              + 職歴を追加
            </button>
          </section>

          {/* 免許・資格 */}
          <section className="form-section">
            <h2 className="section-title-form">免許・資格</h2>
            {formData.licenses.map((entry, index) => (
              <div key={index} className="form-row history-row">
                <input
                  type="text"
                  placeholder="年"
                  value={entry.year}
                  onChange={(e) => {
                    const newLicenses = [...formData.licenses];
                    newLicenses[index].year = e.target.value;
                    setFormData({ ...formData, licenses: newLicenses });
                  }}
                  className="year-input"
                />
                <input
                  type="text"
                  placeholder="月"
                  value={entry.month}
                  onChange={(e) => {
                    const newLicenses = [...formData.licenses];
                    newLicenses[index].month = e.target.value;
                    setFormData({ ...formData, licenses: newLicenses });
                  }}
                  className="month-input"
                />
                <input
                  type="text"
                  placeholder="普通自動車第一種運転免許取得"
                  value={entry.content}
                  onChange={(e) => {
                    const newLicenses = [...formData.licenses];
                    newLicenses[index].content = e.target.value;
                    setFormData({ ...formData, licenses: newLicenses });
                  }}
                  className="content-input"
                />
              </div>
            ))}
            <button type="button" onClick={addLicenseRow} className="add-btn">
              + 免許・資格を追加
            </button>
          </section>

          {/* 志望動機・自己PR */}
          <section className="form-section">
            <h2 className="section-title-form">志望の動機、自己PR、趣味、特技など</h2>
            <div className="form-group">
              <textarea
                rows={6}
                placeholder="志望動機や自己PRを記入してください"
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              />
            </div>
          </section>

          {/* 本人希望欄 */}
          <section className="form-section">
            <h2 className="section-title-form">本人希望記入欄</h2>
            <div className="form-group">
              <textarea
                rows={4}
                placeholder="特に給料・職種・勤務時間・その他についての希望など"
                value={formData.request}
                onChange={(e) => setFormData({ ...formData, request: e.target.value })}
              />
            </div>
          </section>

          <button type="submit" className="submit-btn">
            プレビューを表示
          </button>
        </form>
      </div>
    </div>
  );
}
