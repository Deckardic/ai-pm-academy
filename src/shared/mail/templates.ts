import { siteConfig } from "@/shared/config";

function layout(title: string, body: string, action: { label: string; url: string }) {
  const html = `<!doctype html>
<html lang="ru"><body style="margin:0;background:#f6f6f8;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1c1d22">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:16px;padding:32px">
<tr><td style="font-size:15px;font-weight:600;padding-bottom:24px">${siteConfig.name}</td></tr>
<tr><td style="font-size:22px;font-weight:600;line-height:1.3;padding-bottom:12px">${title}</td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#4a4c57;padding-bottom:28px">${body}</td></tr>
<tr><td><a href="${action.url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 20px;border-radius:10px">${action.label}</a></td></tr>
<tr><td style="font-size:13px;line-height:1.5;color:#8a8c97;padding-top:28px">Если вы не запрашивали это письмо, просто проигнорируйте его.</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${title}\n\n${body.replace(/<[^>]+>/g, "")}\n\n${action.label}: ${action.url}`;
  return { html, text };
}

export const mailTemplates = {
  magicLink: (url: string) => ({
    subject: "Вход в AI PM Academy",
    ...layout("Ваша ссылка для входа", "Нажмите кнопку, чтобы войти. Ссылка действует 10 минут.", {
      label: "Войти",
      url,
    }),
  }),
  verifyEmail: (url: string) => ({
    subject: "Подтвердите email",
    ...layout(
      "Подтвердите адрес почты",
      "Это нужно, чтобы вы могли восстановить доступ и получить сертификат.",
      { label: "Подтвердить", url },
    ),
  }),
  resetPassword: (url: string) => ({
    subject: "Сброс пароля",
    ...layout(
      "Сброс пароля",
      "Нажмите кнопку, чтобы задать новый пароль. Ссылка действует 1 час.",
      {
        label: "Задать пароль",
        url,
      },
    ),
  }),
  certificateIssued: (url: string, level: string) => ({
    subject: `Сертификат уровня ${level}`,
    ...layout(
      `Поздравляем: уровень ${level} пройден`,
      "Ваш сертификат готов. Им можно поделиться — у него есть публичная страница проверки.",
      { label: "Открыть сертификат", url },
    ),
  }),
};
