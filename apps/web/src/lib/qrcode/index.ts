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
    // dotsOptionsHelper: {
    //   colorType: {
    //     single: true,
    //     gradient: false,
    //   },
    //   gradient: {
    //     linear: true,
    //     radial: false,
    //     color1: "#6a1a4c",
    //     color2: "#6a1a4c",
    //     rotation: "0",
    //   },
    // },
    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#000000",
    },
    // cornersSquareOptionsHelper: {
    //   colorType: {
    //     single: true,
    //     gradient: false,
    //   },
    //   gradient: {
    //     linear: true,
    //     radial: false,
    //     color1: "#000000",
    //     color2: "#000000",
    //     rotation: "0",
    //   },
    // },
    cornersDotOptions: {
      type: "extra-rounded",
      color: "#000000",
    },
    // cornersDotOptionsHelper: {
    //   colorType: {
    //     single: true,
    //     gradient: false,
    //   },
    //   gradient: {
    //     linear: true,
    //     radial: false,
    //     color1: "#000000",
    //     color2: "#000000",
    //     rotation: "0",
    //   },
    // },
    // backgroundOptionsHelper: {
    //   colorType: {
    //     single: true,
    //     gradient: false,
    //   },
    //   gradient: {
    //     linear: true,
    //     radial: false,
    //     color1: "#ffffff",
    //     color2: "#ffffff",
    //     rotation: "0",
    //   },
    // },
  });
};
