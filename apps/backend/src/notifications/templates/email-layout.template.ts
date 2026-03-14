function buildAbsoluteUrl(appUrl: string, path: string) {
  const base = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildEmailShell(params: {
  title: string;
  intro: string;
  body: string;
  footer: string;
  appUrl: string;
  ctaLabel?: string;
  ctaPath?: string;
  eyebrow?: string;
  preheader?: string;
}) {
  const ctaLabel = escapeHtml(params.ctaLabel ?? "Open ControlMe");
  const ctaHref = escapeHtml(
    buildAbsoluteUrl(params.appUrl, params.ctaPath ?? "/dashboard"),
  );
  const settingsHref = escapeHtml(buildAbsoluteUrl(params.appUrl, "/settings"));

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(params.title)}</title>
  <style>
    body, table, td, a {
      font-family: "Segoe UI", Helvetica, Arial, sans-serif;
    }

    @media only screen and (max-width: 620px) {
      .shell {
        width: 100% !important;
      }

      .section {
        padding: 24px 20px !important;
      }

      .stack,
      .stack td {
        display: block !important;
        width: 100% !important;
      }

      .stack td {
        padding-right: 0 !important;
        padding-bottom: 12px !important;
      }

      .responsive-table thead {
        display: none !important;
      }

      .responsive-table tr,
      .responsive-table td {
        display: block !important;
        width: 100% !important;
      }

      .responsive-table td {
        padding: 8px 0 !important;
        border-bottom: none !important;
      }

      .responsive-table td::before {
        content: attr(data-label);
        display: block;
        margin-bottom: 4px;
        color: #6b7280;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .title {
        font-size: 28px !important;
        line-height: 34px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#eef2f7;color:#111827;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(params.preheader ?? params.intro)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="shell" style="width:600px;max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dbe4ef;">
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f172a,#1d4ed8);">
                <tr>
                  <td class="section" style="padding:32px 36px;">
                    <div style="font-size:12px;line-height:18px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#bfdbfe;">
                      ${escapeHtml(params.eyebrow ?? "ControlMe notifications")}
                    </div>
                    <div class="title" style="margin-top:12px;font-size:32px;line-height:38px;font-weight:800;color:#ffffff;">
                      ${escapeHtml(params.title)}
                    </div>
                    <div style="margin-top:12px;font-size:15px;line-height:24px;color:#dbeafe;">
                      ${escapeHtml(params.intro)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="section" style="padding:32px 36px 24px;">
              ${params.body}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td style="border-radius:14px;background:#2563eb;">
                    <a href="${ctaHref}" style="display:inline-block;padding:14px 20px;font-size:14px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="section" style="padding:20px 36px 28px;border-top:1px solid #e5e7eb;background:#f8fafc;">
              <div style="font-size:12px;line-height:20px;color:#6b7280;">
                ${escapeHtml(params.footer)}
                <a href="${settingsHref}" style="color:#2563eb;text-decoration:none;">Manage email preferences</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildMetricGrid(
  items: Array<{ label: string; value: string; tone?: string }>,
) {
  if (items.length === 0) {
    return "";
  }

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack" style="margin:0 0 24px;">
      <tr>
        ${items
          .map(
            (item, index) => `
              <td style="width:${100 / items.length}%;padding-right:${index === items.length - 1 ? 0 : 12}px;vertical-align:top;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dbe4ef;border-radius:18px;background:#f8fafc;">
                  <tr>
                    <td style="padding:18px 18px 16px;">
                      <div style="font-size:11px;line-height:16px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">
                        ${escapeHtml(item.label)}
                      </div>
                      <div style="margin-top:10px;font-size:24px;line-height:30px;font-weight:800;color:${escapeHtml(item.tone ?? "#111827")};">
                        ${escapeHtml(item.value)}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>`,
          )
          .join("")}
      </tr>
    </table>`;
}

export function buildCallout(params: {
  title: string;
  body: string;
  tone?: "info" | "warning" | "success";
}) {
  const tone =
    params.tone === "warning"
      ? {
          border: "#f59e0b",
          background: "#fffbeb",
          title: "#92400e",
          body: "#78350f",
        }
      : params.tone === "success"
        ? {
            border: "#22c55e",
            background: "#f0fdf4",
            title: "#166534",
            body: "#166534",
          }
        : {
            border: "#60a5fa",
            background: "#eff6ff",
            title: "#1d4ed8",
            body: "#1e3a8a",
          };

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${tone.border};border-radius:18px;background:${tone.background};">
      <tr>
        <td style="padding:18px 20px;">
          <div style="font-size:14px;line-height:20px;font-weight:700;color:${tone.title};">
            ${escapeHtml(params.title)}
          </div>
          <div style="margin-top:6px;font-size:14px;line-height:22px;color:${tone.body};">
            ${escapeHtml(params.body)}
          </div>
        </td>
      </tr>
    </table>`;
}

export function buildTable(params: {
  headers: string[];
  rows: string[][];
  emptyMessage?: string;
}) {
  if (params.rows.length === 0) {
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;border:1px dashed #cbd5e1;border-radius:18px;background:#f8fafc;">
        <tr>
          <td style="padding:18px 20px;font-size:14px;line-height:22px;color:#475569;">
            ${escapeHtml(params.emptyMessage ?? "Nothing to review right now.")}
          </td>
        </tr>
      </table>`;
  }

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="responsive-table" style="border-collapse:separate;border-spacing:0;border:1px solid #dbe4ef;border-radius:18px;overflow:hidden;background:#ffffff;">
      <thead>
        <tr style="background:#f8fafc;">
          ${params.headers
            .map(
              (header) => `
                <th style="padding:14px 16px;border-bottom:1px solid #dbe4ef;text-align:left;font-size:11px;line-height:16px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">
                  ${escapeHtml(header)}
                </th>`,
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${params.rows
          .map(
            (row) => `
              <tr>
                ${row
                  .map(
                    (cell, index) => `
                      <td data-label="${escapeHtml(params.headers[index] ?? "")}" style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;line-height:22px;color:#111827;">
                        ${escapeHtml(cell)}
                      </td>`,
                  )
                  .join("")}
              </tr>`,
          )
          .join("")}
      </tbody>
    </table>`;
}
