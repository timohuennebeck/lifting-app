// The emails Supabase Auth sends through the send-email hook, in the user's app language: the
// code for a new password (recovery) and the link that confirms a new account's email (signup,
// only while "Confirm email" is on). Plain TypeScript without Deno APIs, so tests can read it.
import type { AppLanguage } from '../_shared/plan-events.ts';

/** The email types this hook writes; Supabase's other types (magic link, invite …) aren't used. */
export type EmailType = 'recovery' | 'signup';

export const isEmailType = (value: unknown): value is EmailType =>
  value === 'recovery' || value === 'signup';

interface RecoveryTexts {
  subject: string;
  title: string;
  intro: string;
  /** Matches the project's email OTP expiry (3600 s). */
  expiry: string;
  ignore: string;
}

interface SignupTexts {
  subject: string;
  title: string;
  intro: string;
  button: string;
  ignore: string;
}

const TEXTS: Record<AppLanguage, { recovery: RecoveryTexts; signup: SignupTexts }> = {
  en: {
    recovery: {
      subject: 'Your code for a new Loqqa password',
      title: 'Your code for a new password',
      intro: 'Enter this code in Loqqa to set a new password:',
      expiry: 'The code is valid for one hour.',
      ignore: "If you didn't ask for a new password, you can ignore this email.",
    },
    signup: {
      subject: 'Confirm your email for Loqqa',
      title: 'Confirm your email',
      intro: 'Tap the button to confirm your email address. Then sign in to Loqqa.',
      button: 'Confirm email',
      ignore: "If you didn't create a Loqqa account, you can ignore this email.",
    },
  },
  de: {
    recovery: {
      subject: 'Dein Code für ein neues Loqqa-Passwort',
      title: 'Dein Code für ein neues Passwort',
      intro: 'Gib diesen Code in Loqqa ein, um ein neues Passwort zu setzen:',
      expiry: 'Der Code gilt eine Stunde.',
      ignore: 'Hast du kein neues Passwort angefordert, kannst du diese E-Mail ignorieren.',
    },
    signup: {
      subject: 'Bestätige deine E-Mail für Loqqa',
      title: 'Bestätige deine E-Mail',
      intro:
        'Tippe auf den Button, um deine E-Mail-Adresse zu bestätigen. Melde dich dann in Loqqa an.',
      button: 'E-Mail bestätigen',
      ignore: 'Hast du kein Loqqa-Konto erstellt, kannst du diese E-Mail ignorieren.',
    },
  },
  'pt-PT': {
    recovery: {
      subject: 'O teu código para uma nova palavra-passe do Loqqa',
      title: 'O teu código para uma nova palavra-passe',
      intro: 'Introduz este código no Loqqa para definires uma nova palavra-passe:',
      expiry: 'O código é válido durante uma hora.',
      ignore: 'Se não pediste uma nova palavra-passe, podes ignorar este e-mail.',
    },
    signup: {
      subject: 'Confirma o teu e-mail para o Loqqa',
      title: 'Confirma o teu e-mail',
      intro:
        'Toca no botão para confirmares o teu endereço de e-mail. Depois inicia sessão no Loqqa.',
      button: 'Confirmar e-mail',
      ignore: 'Se não criaste uma conta Loqqa, podes ignorar este e-mail.',
    },
  },
  'pt-BR': {
    recovery: {
      subject: 'Seu código para uma nova senha do Loqqa',
      title: 'Seu código para uma nova senha',
      intro: 'Digite este código no Loqqa para criar uma nova senha:',
      expiry: 'O código é válido por uma hora.',
      ignore: 'Se você não pediu uma nova senha, pode ignorar este e-mail.',
    },
    signup: {
      subject: 'Confirme seu e-mail para o Loqqa',
      title: 'Confirme seu e-mail',
      intro: 'Toque no botão para confirmar seu endereço de e-mail. Depois entre no Loqqa.',
      button: 'Confirmar e-mail',
      ignore: 'Se você não criou uma conta no Loqqa, pode ignorar este e-mail.',
    },
  },
  ko: {
    recovery: {
      subject: 'Loqqa 새 비밀번호 설정 코드',
      title: '새 비밀번호 설정 코드',
      intro: 'Loqqa에 이 코드를 입력하고 새 비밀번호를 설정하세요:',
      expiry: '코드는 1시간 동안 유효해요.',
      ignore: '새 비밀번호를 요청하지 않았다면 이 이메일은 무시하셔도 돼요.',
    },
    signup: {
      subject: 'Loqqa 이메일 인증',
      title: '이메일을 인증해 주세요',
      intro: '버튼을 눌러 이메일 주소를 인증한 다음 Loqqa에 로그인해 주세요.',
      button: '이메일 인증',
      ignore: 'Loqqa 계정을 만들지 않았다면 이 이메일은 무시하셔도 돼요.',
    },
  },
  es: {
    recovery: {
      subject: 'Tu código para una contraseña nueva de Loqqa',
      title: 'Tu código para una contraseña nueva',
      intro: 'Introduce este código en Loqqa para crear una contraseña nueva:',
      expiry: 'El código es válido durante una hora.',
      ignore: 'Si no pediste una contraseña nueva, puedes ignorar este correo.',
    },
    signup: {
      subject: 'Confirma tu correo para Loqqa',
      title: 'Confirma tu correo',
      intro: 'Toca el botón para confirmar tu dirección de correo. Luego inicia sesión en Loqqa.',
      button: 'Confirmar correo',
      ignore: 'Si no creaste una cuenta de Loqqa, puedes ignorar este correo.',
    },
  },
  fr: {
    recovery: {
      subject: 'Ton code pour un nouveau mot de passe Loqqa',
      title: 'Ton code pour un nouveau mot de passe',
      intro: 'Saisis ce code dans Loqqa pour définir un nouveau mot de passe :',
      expiry: 'Le code est valable une heure.',
      ignore: 'Si tu n’as pas demandé de nouveau mot de passe, tu peux ignorer cet e-mail.',
    },
    signup: {
      subject: 'Confirme ton e-mail pour Loqqa',
      title: 'Confirme ton e-mail',
      intro: 'Touche le bouton pour confirmer ton adresse e-mail, puis connecte-toi à Loqqa.',
      button: 'Confirmer l’e-mail',
      ignore: 'Si tu n’as pas créé de compte Loqqa, tu peux ignorer cet e-mail.',
    },
  },
};

/** The footer's line before the support address. */
const HELP: Record<AppLanguage, string> = {
  en: 'Questions? Write to us at',
  de: 'Fragen? Schreib uns an',
  'pt-PT': 'Dúvidas? Escreve-nos para',
  'pt-BR': 'Dúvidas? Escreva para',
  ko: '궁금한 점이 있으면 메일 주세요:',
  es: '¿Preguntas? Escríbenos a',
  fr: 'Des questions ? Écris-nous à',
};

/** Where replies go and the footer points; the emails come from a no-reply address. */
export const SUPPORT_EMAIL = 'support@useloqqa.com';

export interface Email {
  subject: string;
  html: string;
  text: string;
}

/** What an email needs from the hook's payload: the 6-digit code or the confirmation link. */
export interface EmailInput {
  code: string;
  link: string;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

// The app's look: black ground, off-white text, the neon accent, Inter (system fonts where mail
// apps don't load it), no borders or rules, semibold at most.
const BG = '#0A0A0A';
const TILE = '#1A1A1A';
const FG = '#F4F4F0';
const FG_MID = '#D6D6D1';
const MUTED = '#A3A39E';
const DIM = '#6E6E6A';
const ACCENT = '#DFFF1F';
const FONT = "Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * The app icon drawn with table cells (its two off-white bars on black), so it shows without an
 * image to host or a mail app that blocks images; the 300-unit icon at 50 px.
 */
const LOGO =
  `<table role="presentation" cellspacing="0" cellpadding="0" width="50" style="width:50px;border-collapse:collapse;background:${BG}">` +
  `<tr><td colspan="3" height="9" style="height:9px;font-size:0;line-height:0">&nbsp;</td></tr>` +
  `<tr><td width="14" height="21" style="width:14px;height:21px;font-size:0;line-height:0">&nbsp;</td><td width="12" height="21" bgcolor="#F2F1EC" style="width:12px;height:21px;background:#F2F1EC;font-size:0;line-height:0">&nbsp;</td><td width="24" style="width:24px;font-size:0;line-height:0">&nbsp;</td></tr>` +
  `<tr><td colspan="3" height="2" style="height:2px;font-size:0;line-height:0">&nbsp;</td></tr>` +
  `<tr><td width="14" height="9" style="width:14px;height:9px;font-size:0;line-height:0">&nbsp;</td><td colspan="2" style="font-size:0;line-height:0"><table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tr><td width="23" height="9" bgcolor="#F2F1EC" style="width:23px;height:9px;background:#F2F1EC;font-size:0;line-height:0">&nbsp;</td></tr></table></td></tr>` +
  `<tr><td colspan="3" height="9" style="height:9px;font-size:0;line-height:0">&nbsp;</td></tr>` +
  `</table>`;

const paragraph = (text: string, color: string, size: number, bottom: number) =>
  `<p style="margin:0 0 ${bottom}px;color:${color};font-size:${size}px;line-height:1.5">${text}</p>`;

/** The whole email around its main part: preview text, logo, headline, footer. */
function layout(language: AppLanguage, title: string, preview: string, main: string) {
  return (
    `<!doctype html><html lang="${language}"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">` +
    `<title>${title}</title></head>` +
    `<body style="margin:0;padding:0;background:${BG};-webkit-font-smoothing:antialiased">` +
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BG}">${preview}</div>` +
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${BG}" style="background:${BG}"><tr>` +
    `<td align="center" style="padding:36px 28px 40px">` +
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px"><tr>` +
    `<td align="left" style="font-family:${FONT};color:${FG}">` +
    `<div style="margin:0 0 36px">${LOGO}</div>` +
    `<h1 style="margin:0 0 14px;font-family:${FONT};font-size:30px;line-height:1.15;font-weight:600;letter-spacing:-0.01em;text-transform:uppercase;color:${FG}">${title}</h1>` +
    main +
    `<p style="margin:44px 0 0;color:${DIM};font-size:12px;line-height:1.6">${HELP[language]} ` +
    `<a href="mailto:${SUPPORT_EMAIL}" style="color:${MUTED};text-decoration:none">${SUPPORT_EMAIL}</a><br>Loqqa</p>` +
    `</td></tr></table></td></tr></table></body></html>`
  );
}

/** The email of a type in a language, as HTML with a plain-text twin. */
export function buildEmail(type: EmailType, language: AppLanguage, input: EmailInput): Email {
  const help = `${HELP[language]} ${SUPPORT_EMAIL}`;
  if (type === 'recovery') {
    const t = TEXTS[language].recovery;
    const code = escapeHtml(input.code);
    // One piece of text, not a box per digit: it copies whole, and iOS can offer it as the code.
    const codeBlock =
      `<div style="margin:0 0 24px"><span style="display:inline-block;background:${TILE};border-radius:14px;padding:14px 12px 14px 22px;` +
      `font-family:${FONT};font-size:32px;line-height:1.2;font-weight:600;letter-spacing:10px;color:${ACCENT}">${code}</span></div>`;
    return {
      subject: t.subject,
      html: layout(
        language,
        t.title,
        `${code} · ${t.expiry}`,
        paragraph(t.intro, FG_MID, 16, 20) +
          codeBlock +
          paragraph(`${t.expiry} ${t.ignore}`, MUTED, 14, 0),
      ),
      text: `${t.title}\n\n${t.intro}\n\n${input.code}\n\n${t.expiry} ${t.ignore}\n\n${help}\n`,
    };
  }
  const t = TEXTS[language].signup;
  const link = escapeHtml(input.link);
  const button =
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px"><tr>` +
    `<td align="center" bgcolor="${ACCENT}" style="background:${ACCENT};border-radius:14px">` +
    `<a href="${link}" style="display:block;padding:16px 20px;font-family:${FONT};font-size:15px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${BG};text-decoration:none">${t.button}</a>` +
    `</td></tr></table>`;
  return {
    subject: t.subject,
    html: layout(
      language,
      t.title,
      t.intro,
      paragraph(t.intro, FG_MID, 16, 24) + button + paragraph(t.ignore, MUTED, 14, 0),
    ),
    text: `${t.title}\n\n${t.intro}\n\n${input.link}\n\n${t.ignore}\n\n${help}\n`,
  };
}

/**
 * The link that confirms an email: Supabase Auth's verify endpoint, which then opens
 * `redirectTo` (the project's Site URL when the app sends none).
 */
export function confirmationLink(
  supabaseUrl: string,
  data: { token_hash: string; email_action_type: string; redirect_to: string; site_url: string },
) {
  const params = new URLSearchParams({
    token: data.token_hash,
    type: data.email_action_type,
    redirect_to: data.redirect_to || data.site_url,
  });
  return `${supabaseUrl.replace(/\/$/, '')}/auth/v1/verify?${params}`;
}
