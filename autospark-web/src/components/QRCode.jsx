import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QRCodeImage({ value, size = 220 }) {
  const [dataUrl, setDataUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: '#0d466c', light: '#ffffff' } }).then(
      (url) => {
        if (!cancelled) setDataUrl(url)
      },
    )
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className="bg-slate-100 rounded-2xl animate-pulse" />
  }

  return <img src={dataUrl} width={size} height={size} alt="Check-in QR code" className="rounded-2xl" />
}
