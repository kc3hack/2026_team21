// 和暦変換ユーティリティ

export interface JapaneseEra {
  name: string;
  startYear: number;
  startDate: Date;
}

const eras: JapaneseEra[] = [
  { name: "令和", startYear: 2019, startDate: new Date(2019, 4, 1) },
  { name: "平成", startYear: 1989, startDate: new Date(1989, 0, 8) },
  { name: "昭和", startYear: 1926, startDate: new Date(1926, 11, 25) },
];

export function toJapaneseDate(date: Date): string {
  for (const era of eras) {
    if (date >= era.startDate) {
      const year = date.getFullYear() - era.startYear + 1;
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${era.name}${year}年${month}月${day}日`;
    }
  }
  return "";
}

export function toJapaneseDateWithAge(date: Date): { dateStr: string; age: number } {
  const dateStr = toJapaneseDate(date);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return { dateStr, age };
}

export function getCurrentJapaneseDate(): string {
  return toJapaneseDate(new Date());
}
