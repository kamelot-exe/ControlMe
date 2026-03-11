"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useAppUi } from "@/components/ui";
import { useResetPassword } from "@/hooks/use-auth";
import { translate } from "@/lib/i18n";

function ResetPasswordForm() {
  const { language } = useAppUi();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const resetPassword = useResetPassword();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError(
        translate(language, {
          FR: "Jeton invalide ou manquant. Demandez un nouveau lien.",
          RU: "Неверный или отсутствующий токен. Запросите новую ссылку.",
          UK: "Недійсний або відсутній токен. Запросіть нове посилання.",
          GE: "Ungültiges oder fehlendes Token. Fordern Sie einen neuen Link an.",
          ES: "Token inválido o ausente. Solicita un nuevo enlace.",
          PT: "Token inválido ou ausente. Solicite um novo link.",
          IT: "Token non valido o mancante. Richiedi un nuovo link.",
          PL: "Nieprawidłowy lub brakujący token. Poproś o nowy link.",
          TR: "Geçersiz veya eksik token. Yeni bir bağlantı isteyin.",
          UZ: "Token noto‘g‘ri yoki yo‘q. Yangi havola so‘rang.",
        }, "Invalid or missing reset token. Please request a new link."),
      );
      return;
    }

    if (password.length < 8) {
      setError(
        translate(language, {
          FR: "Le mot de passe doit contenir au moins 8 caractères",
          RU: "Пароль должен быть не короче 8 символов",
          UK: "Пароль має містити щонайменше 8 символів",
          GE: "Das Passwort muss mindestens 8 Zeichen lang sein",
          ES: "La contraseña debe tener al menos 8 caracteres",
          PT: "A senha deve ter pelo menos 8 caracteres",
          IT: "La password deve contenere almeno 8 caratteri",
          PL: "Hasło musi mieć co najmniej 8 znaków",
          TR: "Şifre en az 8 karakter olmalı",
          UZ: "Parol kamida 8 ta belgidan iborat bo‘lishi kerak",
        }, "Password must be at least 8 characters"),
      );
      return;
    }

    if (password !== confirm) {
      setError(
        translate(language, {
          FR: "Les mots de passe ne correspondent pas",
          RU: "Пароли не совпадают",
          UK: "Паролі не збігаються",
          GE: "Passwörter stimmen nicht überein",
          ES: "Las contraseñas no coinciden",
          PT: "As senhas não coincidem",
          IT: "Le password non coincidono",
          PL: "Hasła nie są zgodne",
          TR: "Şifreler eşleşmiyor",
          UZ: "Parollar mos kelmadi",
        }, "Passwords do not match"),
      );
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, password });
      setSuccess(true);
      window.setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(
        (err as Error).message ??
          translate(language, {
            FR: "Un problème est survenu. Demandez un nouveau lien.",
            RU: "Что-то пошло не так. Запросите новую ссылку.",
            UK: "Щось пішло не так. Запросіть нове посилання.",
            GE: "Etwas ist schiefgelaufen. Fordern Sie einen neuen Link an.",
            ES: "Algo salió mal. Solicita un nuevo enlace.",
            PT: "Algo deu errado. Solicite um novo link.",
            IT: "Qualcosa è andato storto. Richiedi un nuovo link.",
            PL: "Coś poszło nie tak. Poproś o nowy link.",
            TR: "Bir şeyler ters gitti. Yeni bir bağlantı isteyin.",
            UZ: "Nimadir xato ketdi. Yangi havola so‘rang.",
          }, "Something went wrong. Please request a new reset link."),
      );
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#4ADE80]/25 bg-[#4ADE80]/15">
            <CheckCircle size={26} className="text-[#4ADE80]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB]">
          {translate(language, {
            FR: "Mot de passe mis à jour",
            RU: "Пароль обновлён",
            UK: "Пароль оновлено",
            GE: "Passwort aktualisiert",
            ES: "Contraseña actualizada",
            PT: "Senha atualizada",
            IT: "Password aggiornata",
            PL: "Hasło zaktualizowane",
            TR: "Şifre güncellendi",
            UZ: "Parol yangilandi",
          }, "Password updated!")}
        </h1>
        <p className="text-sm text-[#9CA3AF]">
          {translate(language, {
            FR: "Redirection vers la connexion...",
            RU: "Перенаправление ко входу...",
            UK: "Переадресація до входу...",
            GE: "Weiterleitung zur Anmeldung...",
            ES: "Redirigiendo al inicio de sesión...",
            PT: "Redirecionando para o login...",
            IT: "Reindirizzamento al login...",
            PL: "Przekierowanie do logowania...",
            TR: "Giriş sayfasına yönlendiriliyor...",
            UZ: "Kirish sahifasiga yo‘naltirilmoqda...",
          }, "Redirecting you to sign in...")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#4ADE80]/25 bg-[#4ADE80]/15">
          <Lock size={18} className="text-[#4ADE80]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F9FAFB]">
            {translate(language, {
              FR: "Définir un nouveau mot de passe",
              RU: "Установить новый пароль",
              UK: "Встановити новий пароль",
              GE: "Neues Passwort festlegen",
              ES: "Establecer nueva contraseña",
              PT: "Definir nova senha",
              IT: "Imposta una nuova password",
              PL: "Ustaw nowe hasło",
              TR: "Yeni şifre belirle",
              UZ: "Yangi parol o‘rnating",
            }, "Set new password")}
          </h1>
          <p className="text-xs text-[#9CA3AF]">
            {translate(language, {
              FR: "Au moins 8 caractères",
              RU: "Минимум 8 символов",
              UK: "Щонайменше 8 символів",
              GE: "Mindestens 8 Zeichen",
              ES: "Al menos 8 caracteres",
              PT: "Pelo menos 8 caracteres",
              IT: "Almeno 8 caratteri",
              PL: "Co najmniej 8 znaków",
              TR: "En az 8 karakter",
              UZ: "Kamida 8 ta belgi",
            }, "Must be at least 8 characters")}
          </p>
        </div>
      </div>

      {!token ? (
        <div className="mb-4 rounded-xl border border-[#F97373]/30 bg-[#F97373]/10 p-3 text-sm text-[#F97373]">
          {translate(language, {
            FR: "Aucun jeton trouvé. Utilisez le lien reçu par e-mail.",
            RU: "Токен не найден. Используйте ссылку из письма.",
            UK: "Токен не знайдено. Використайте посилання з листа.",
            GE: "Kein Token gefunden. Verwenden Sie den Link aus Ihrer E-Mail.",
            ES: "No se encontró token. Usa el enlace de tu correo.",
            PT: "Nenhum token encontrado. Use o link do e-mail.",
            IT: "Token non trovato. Usa il link ricevuto via email.",
            PL: "Nie znaleziono tokenu. Użyj linku z e-maila.",
            TR: "Token bulunamadı. E-postadaki bağlantıyı kullanın.",
            UZ: "Token topilmadi. E-pochtadagi havoladan foydalaning.",
          }, "No reset token found. Please use the link from your email.")}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            {translate(language, {
              FR: "Nouveau mot de passe",
              RU: "Новый пароль",
              UK: "Новий пароль",
              GE: "Neues Passwort",
              ES: "Nueva contraseña",
              PT: "Nova senha",
              IT: "Nuova password",
              PL: "Nowe hasło",
              TR: "Yeni şifre",
              UZ: "Yangi parol",
            }, "New password")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-[#F9FAFB] placeholder:text-[#6B7280] transition-all duration-150 focus:border-[#4ADE80]/50 focus:outline-none"
              placeholder={translate(language, {
                FR: "Min. 8 caractères",
                RU: "Мин. 8 символов",
                UK: "Мін. 8 символів",
                GE: "Mind. 8 Zeichen",
                ES: "Mín. 8 caracteres",
                PT: "Mín. 8 caracteres",
                IT: "Min. 8 caratteri",
                PL: "Min. 8 znaków",
                TR: "Min. 8 karakter",
                UZ: "Kamida 8 belgi",
              }, "Min. 8 characters")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] transition-colors hover:text-[#9CA3AF]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            {translate(language, {
              FR: "Confirmer le mot de passe",
              RU: "Подтвердите пароль",
              UK: "Підтвердьте пароль",
              GE: "Passwort bestätigen",
              ES: "Confirmar contraseña",
              PT: "Confirmar senha",
              IT: "Conferma password",
              PL: "Potwierdź hasło",
              TR: "Şifreyi onayla",
              UZ: "Parolni tasdiqlang",
            }, "Confirm password")}
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[#F9FAFB] placeholder:text-[#6B7280] transition-all duration-150 focus:border-[#4ADE80]/50 focus:outline-none"
            placeholder={translate(language, {
              FR: "Répéter le mot de passe",
              RU: "Повторите пароль",
              UK: "Повторіть пароль",
              GE: "Passwort wiederholen",
              ES: "Repite la contraseña",
              PT: "Repita a senha",
              IT: "Ripeti la password",
              PL: "Powtórz hasło",
              TR: "Şifreyi tekrar edin",
              UZ: "Parolni takrorlang",
            }, "Repeat password")}
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-[#F97373]/10 px-3 py-2 text-sm text-[#F97373]">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={resetPassword.isPending || !token}
          className="w-full rounded-xl bg-[#4ADE80] py-3 font-bold text-[#060B16] transition-all duration-150 hover:bg-[#4ADE80]/90 disabled:opacity-50"
        >
          {resetPassword.isPending
            ? translate(language, {
                FR: "Mise à jour...",
                RU: "Обновление...",
                UK: "Оновлення...",
                GE: "Aktualisierung...",
                ES: "Actualizando...",
                PT: "Atualizando...",
                IT: "Aggiornamento...",
                PL: "Aktualizacja...",
                TR: "Güncelleniyor...",
                UZ: "Yangilanmoqda...",
              }, "Updating...")
            : translate(language, {
                FR: "Mettre à jour le mot de passe",
                RU: "Обновить пароль",
                UK: "Оновити пароль",
                GE: "Passwort aktualisieren",
                ES: "Actualizar contraseña",
                PT: "Atualizar senha",
                IT: "Aggiorna password",
                PL: "Zaktualizuj hasło",
                TR: "Şifreyi güncelle",
                UZ: "Parolni yangilash",
              }, "Update password")}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  const { language } = useAppUi();

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
          <Suspense
            fallback={
              <p className="text-sm text-[#9CA3AF]">
                {translate(language, {
                  FR: "Chargement...",
                  RU: "Загрузка...",
                  UK: "Завантаження...",
                  GE: "Laden...",
                  ES: "Cargando...",
                  PT: "Carregando...",
                  IT: "Caricamento...",
                  PL: "Ładowanie...",
                  TR: "Yükleniyor...",
                  UZ: "Yuklanmoqda...",
                }, "Loading...")}
              </p>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
