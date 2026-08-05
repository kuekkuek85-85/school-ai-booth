'use client';
/** QR 코드 렌더 (qrcode 라이브러리 번들). 접속 QR·설문 QR 공용. */
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  value: string;
  size?: number;
  /** 아래 캡션 */
  caption?: string;
}

export default function QrCode({ value, size = 180, caption }: Props) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (alive) setDataUrl(url);
      })
      .catch(() => {
        if (alive) setDataUrl('');
      });
    return () => {
      alive = false;
    };
  }, [value, size]);

  return (
    <figure
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt={caption ? `${caption} QR 코드` : 'QR 코드'}
          width={size}
          height={size}
          style={{
            borderRadius: 'var(--radius-md)',
            background: '#fff',
            padding: 'var(--space-2)',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--fs-sm)',
          }}
        >
          QR 생성 중…
        </div>
      )}
      {caption && (
        <figcaption
          style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
