import { useEffect, useMemo, useRef, useState } from "hono/jsx";
import QRCodeStyling from "qr-code-styling";
import { createQRCodeOptions } from "@/lib/qrcode";

export const useQRCode = (text: string) => {
  const options = useMemo(() => createQRCodeOptions(text), [text]);
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling(options));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      qrCode.append(ref.current);
      qrCode.update(options);
    }
  }, [options, qrCode, ref.current]);

  return { ref };
};
