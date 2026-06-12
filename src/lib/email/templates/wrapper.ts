export function wrapEmailHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin:0; padding:0; background:#f0f2f5; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrapper { max-width:600px; margin:40px auto; border-radius:10px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.12); }
  .header { background:#050b14; padding:24px 32px; }
  .header-title { font-size:18px; font-weight:700; color:#f59e0b; letter-spacing:3px; }
  .header-sub { font-size:11px; color:#64748b; margin-top:2px; }
  .body { background:#ffffff; padding:32px; color:#1a202c; font-size:15px; line-height:1.7; }
  .body a { color:#d97706; text-decoration:none; font-weight:600; }
  .body a:hover { text-decoration:underline; }
  .footer { background:#f8fafc; padding:16px 32px; border-top:1px solid #e2e8f0; }
  .footer p { margin:0; color:#94a3b8; font-size:11px; }
  .accent-bar { height:3px; background:linear-gradient(90deg, #f59e0b, #d97706, #92400e); }
</style></head>
<body>
  <div class="wrapper">
    <div class="accent-bar"></div>
    <div class="header">
      <div class="header-title">HIREFLOW</div>
      <div class="header-sub">Avenir International Engineers — Talent Acquisition</div>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>This email was sent from the HireFlow internal HR platform.<br>
      Avenir International Engineers &nbsp;·&nbsp; Confidential &nbsp;·&nbsp; Do not forward</p>
    </div>
  </div>
</body></html>`;
}
