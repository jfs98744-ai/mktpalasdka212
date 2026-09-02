import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

export function buildPublicPropertyUrl(propertyId: string): string {
  const origin = window.location.origin;
  return `${origin}/#public-property=${propertyId}`;
}

export function buildPublicContractUrl(contractId: string): string {
  const origin = window.location.origin;
  return `${origin}/#public-contract=${contractId}`;
}
