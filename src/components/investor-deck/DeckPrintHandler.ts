export const openPrintWindow = (contentHtml: string) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Unison Tasks — Platform Overview</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #fff; line-height: 1.6; }
    .deck-container { max-width: 900px; margin: 0 auto; padding: 48px 40px; }
    h2 { font-size: 22px; font-weight: 800; margin-bottom: 8px; padding-bottom: 8px;
         border-bottom: 3px solid #7c5cfc; display: inline-block; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; font-weight: 700; color: #7c5cfc; padding: 10px 12px;
         border-bottom: 2px solid #e8e5f7; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #f0f0f5; color: #374151; }
    pre { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; line-height: 1.7; white-space: pre; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>${contentHtml}</body>
</html>`);

  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
};
