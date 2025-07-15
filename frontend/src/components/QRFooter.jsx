import React from 'react';
import QRCode from 'react-qr-code';

const QRFooter = ({ url }) => (
  <div className="qr-footer">
    <QRCode
      value={url}
      size={128}
      bgColor="transparent"
      fgColor="#1DA1F2"
      className="qr-code"
    />
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="tweet-link"
    >
      View on Twitter
    </a>
  </div>
);

export default QRFooter;
