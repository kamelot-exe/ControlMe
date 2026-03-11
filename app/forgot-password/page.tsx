"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { useAppUi } from "@/components/ui";
import { useForgotPassword } from "@/hooks/use-auth";
import { translate } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { language } = useAppUi();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(
        translate(
          language,
          {
            FR: "Veuillez saisir votre e-mail",
            RU: "Введите адрес электронной почты",
            UK: "Введіть адресу електронної пошти",
            GE: "Bitte E-Mail-Adresse eingeben",
            ES: "Introduce tu correo electrónico",
            PT: "Digite seu e-mail",
            IT: "Inserisci la tua email",
            PL: "Wpisz adres e-mail",
            TR: "Lütfen e-posta adresinizi girin",
            UZ: "Elektron pochta manzilini kiriting",
          },
          "Please enter your email address",
        ),
      );
      return;
    }

    try {
      const result = await forgotPassword.mutateAsync({
        email: email.trim().toLowerCase(),
      });
      setSent(true);
      if (result.data?.token) {
        setDevToken(result.data.token);
      }
    } catch {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#9CA3AF] transition-colors hover:text-[#F9FAFB]"
        >
          <ArrowLeft size={15} />
          {translate(language, {
            FR: "Retour à la connexion",
            RU: "Назад ко входу",
            UK: "Назад до входу",
            GE: "Zurück zur Anmeldung",
            ES: "Volver al inicio de sesión",
            PT: "Voltar ao login",
            IT: "Torna al login",
            PL: "Wróć do logowania",
            TR: "Girişe dön",
            UZ: "Kirishga qaytish",
          }, "Back to sign in")}
        </Link>

        <div className="glass rounded-3xl p-8">
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#4ADE80]/25 bg-[#4ADE80]/15">
                  <CheckCircle size={26} className="text-[#4ADE80]" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB]">
                {translate(language, {
                  FR: "Vérifiez votre boîte mail",
                  RU: "Проверьте почту",
                  UK: "Перевірте пошту",
                  GE: "Posteingang prüfen",
                  ES: "Revisa tu correo",
                  PT: "Verifique sua caixa de entrada",
                  IT: "Controlla la posta",
                  PL: "Sprawdź skrzynkę",
                  TR: "Gelen kutunuzu kontrol edin",
                  UZ: "Pochtangizni tekshiring",
                }, "Check your inbox")}
              </h1>
              <p className="text-sm leading-relaxed text-[#9CA3AF]">
                {translate(language, {
                  FR: "Si l'adresse est enregistrée, un lien de réinitialisation sera envoyé dans quelques minutes.",
                  RU: "Если адрес зарегистрирован, ссылка для сброса придёт в течение нескольких минут.",
                  UK: "Якщо адресу зареєстровано, посилання для скидання прийде за кілька хвилин.",
                  GE: "Wenn die Adresse registriert ist, erhalten Sie in wenigen Minuten einen Link.",
                  ES: "Si la dirección está registrada, recibirás un enlace en unos minutos.",
                  PT: "Se o endereço estiver registrado, você receberá um link em alguns minutos.",
                  IT: "Se l'indirizzo è registrato, riceverai un link entro pochi minuti.",
                  PL: "Jeśli adres jest zarejestrowany, link otrzymasz w ciągu kilku minut.",
                  TR: "Adres kayıtlıysa birkaç dakika içinde bir bağlantı alırsınız.",
                  UZ: "Agar manzil ro‘yxatdan o‘tgan bo‘lsa, bir necha daqiqada havola keladi.",
                }, "If the address is registered, a password reset link will arrive within a few minutes.")}
              </p>

              {devToken ? (
                <div className="rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-left">
                  <p className="mb-1 text-xs font-semibold text-[#F59E0B]">Dev mode token</p>
                  <Link
                    href={`/reset-password?token=${devToken}`}
                    className="break-all text-xs text-[#FF7355] hover:underline"
                  >
                    /reset-password?token={devToken}
                  </Link>
                </div>
              ) : null}

              <Link
                href="/login"
                className="inline-block text-sm text-[#4ADE80] transition-colors hover:text-[#4ADE80]/80"
              >
                {translate(language, {
                  FR: "Retour à la connexion",
                  RU: "Вернуться ко входу",
                  UK: "Повернутися до входу",
                  GE: "Zurück zur Anmeldung",
                  ES: "Volver al inicio",
                  PT: "Voltar ao login",
                  IT: "Torna al login",
                  PL: "Wróć do logowania",
                  TR: "Girişe dön",
                  UZ: "Kirishga qaytish",
                }, "Return to sign in")}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FF7355]/25 bg-[#FF7355]/15">
                  <Mail size={18} className="text-[#FF7355]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#F9FAFB]">
                    {translate(language, {
                      FR: "Mot de passe oublié ?",
                      RU: "Забыли пароль?",
                      UK: "Забули пароль?",
                      GE: "Passwort vergessen?",
                      ES: "¿Olvidaste tu contraseña?",
                      PT: "Esqueceu sua senha?",
                      IT: "Password dimenticata?",
                      PL: "Nie pamiętasz hasła?",
                      TR: "Şifrenizi mi unuttunuz?",
                      UZ: "Parolni unutdingizmi?",
                    }, "Forgot password?")}
                  </h1>
                  <p className="text-xs text-[#9CA3AF]">
                    {translate(language, {
                      FR: "Nous vous enverrons un lien de réinitialisation",
                      RU: "Мы отправим ссылку для сброса",
                      UK: "Ми надішлемо посилання для скидання",
                      GE: "Wir senden Ihnen einen Zurücksetzungslink",
                      ES: "Te enviaremos un enlace de restablecimiento",
                      PT: "Enviaremos um link de redefinição",
                      IT: "Ti invieremo un link di reimpostazione",
                      PL: "Wyślemy link do resetu",
                      TR: "Size sıfırlama bağlantısı göndereceğiz",
                      UZ: "Tiklash havolasini yuboramiz",
                    }, "We'll send you a reset link")}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    {translate(language, {
                      FR: "Adresse e-mail",
                      RU: "Электронная почта",
                      UK: "Електронна пошта",
                      GE: "E-Mail-Adresse",
                      ES: "Correo electrónico",
                      PT: "Endereço de e-mail",
                      IT: "Indirizzo email",
                      PL: "Adres e-mail",
                      TR: "E-posta adresi",
                      UZ: "Elektron pochta",
                    }, "Email address")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    autoFocus
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] placeholder:text-[#6B7280] transition-all duration-150 focus:border-[#4ADE80]/50 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                {error ? (
                  <p className="rounded-lg bg-[#F97373]/10 px-3 py-2 text-sm text-[#F97373]">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={forgotPassword.isPending}
                  className="w-full rounded-xl bg-[#4ADE80] py-3 font-bold text-[#060B16] transition-all duration-150 hover:bg-[#4ADE80]/90 disabled:opacity-50"
                >
                  {forgotPassword.isPending
                    ? translate(language, {
                        FR: "Envoi...",
                        RU: "Отправка...",
                        UK: "Надсилання...",
                        GE: "Senden...",
                        ES: "Enviando...",
                        PT: "Enviando...",
                        IT: "Invio...",
                        PL: "Wysyłanie...",
                        TR: "Gönderiliyor...",
                        UZ: "Yuborilmoqda...",
                      }, "Sending...")
                    : translate(language, {
                        FR: "Envoyer le lien",
                        RU: "Отправить ссылку",
                        UK: "Надіслати посилання",
                        GE: "Link senden",
                        ES: "Enviar enlace",
                        PT: "Enviar link",
                        IT: "Invia link",
                        PL: "Wyślij link",
                        TR: "Bağlantıyı gönder",
                        UZ: "Havolani yuborish",
                      }, "Send reset link")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
