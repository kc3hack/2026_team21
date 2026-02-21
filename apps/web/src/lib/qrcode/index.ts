import QRCodeStyling from "qr-code-styling";

/**
 * QRコードを生成する関数。
 * スタイルについてはドキュメントを参照すること。
 *
 * @see https://github.com/kozakdenys/qr-code-styling
 * @param text QRコードに埋め込むテキスト
 * @returns {QRCodeStyling} 生成された QRコードオブジェクト
 */
export const createQRCode = (text: string) => {
  // TODO: text の内容を検証する

  return new QRCodeStyling({
    type: "canvas",
    shape: "square",
    width: 300,
    height: 300,
    data: text,
    margin: 0,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "Q",
    },
    imageOptions: {
      saveAsBlob: true,
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 0,
    },
    dotsOptions: {
      type: "extra-rounded",
      color: "#0af06e",
      roundSize: true,
      gradient: undefined,
    },
    backgroundOptions: {
      round: 0,
      color: "#ffffff",
    },
    image: undefined,
    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#000000",
    },
    cornersDotOptions: {
      type: "extra-rounded",
      color: "#000000",
    },
  });
};
