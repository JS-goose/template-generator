import { Buffer } from 'buffer';

function generateMimeEmail({from, to, subject, html}) {
    const mime = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset=UTF-8`,
        '',
        html,
    ].join('\r\n');

    const base64Encoded = Buffer.from(mime).toString('base64').replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

    return base64Encoded;
}