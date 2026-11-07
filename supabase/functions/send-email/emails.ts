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

const page = (language: AppLanguage, body: string) =>
  `<!doctype html><html lang="${language}"><body style="font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111; line-height: 1.5">${body}</body></html>`;

/** The email of a type in a language, as HTML with a plain-text twin. */
export function buildEmail(type: EmailType, language: AppLanguage, input: EmailInput): Email {
  if (type === 'recovery') {
    const t = TEXTS[language].recovery;
    const code = escapeHtml(input.code);
    return {
      subject: t.subject,
      html: page(
        language,
        `<h2>${t.title}</h2><p>${t.intro}</p>` +
          `<p style="font-size: 28px; font-weight: 700; letter-spacing: 6px">${code}</p>` +
          `<p>${t.expiry} ${t.ignore}</p>`,
      ),
      text: `${t.intro}\n\n${input.code}\n\n${t.expiry} ${t.ignore}\n`,
    };
  }
  const t = TEXTS[language].signup;
  const link = escapeHtml(input.link);
  return {
    subject: t.subject,
    html: page(
      language,
      `<h2>${t.title}</h2><p>${t.intro}</p>` +
        `<p><a href="${link}" style="display: inline-block; padding: 12px 20px; background: #111; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600">${t.button}</a></p>` +
        `<p>${t.ignore}</p>`,
    ),
    text: `${t.intro}\n\n${input.link}\n\n${t.ignore}\n`,
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
