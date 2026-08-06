import { QRCodeSVG } from 'qrcode.react';

export default function QrPanel({ value, visible }) {
  return (
    <div className={`qr-panel ${visible ? 'qr-panel--visible' : ''}`} aria-hidden={!visible}>
      <div className="qr-panel__inner">
        {value && <QRCodeSVG value={value} size={168} bgColor="transparent" fgColor="currentColor" />}
      </div>
    </div>
  );
}
