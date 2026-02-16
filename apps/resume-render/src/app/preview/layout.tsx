import { Metadata } from "next";

export const metadata: Metadata = {
  title: "履歴書プレビュー",
  description: "履歴書のプレビューとPDF出力",
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
