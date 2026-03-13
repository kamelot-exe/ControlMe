"use client";

import Link from "next/link";
import { useAppUi } from "@/components/ui";
import { translate } from "@/lib/i18n";

export function TermsContent() {
  const { language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, (values ?? {}) as Record<typeof language, string>, fallback);

  const sections = [
    {
      title: t("1. Acceptance", { FR: "1. Acceptation", RU: "1. Принятие условий", ES: "1. Aceptacion", PT: "1. Aceitacao" }),
      body: t("By using ControlMe, you agree to these Terms of Service.", { FR: "En utilisant ControlMe, vous acceptez ces conditions.", RU: "Используя ControlMe, вы принимаете эти условия.", ES: "Al usar ControlMe, aceptas estos terminos.", PT: "Ao usar o ControlMe, voce aceita estes termos." }),
    },
    {
      title: t("2. Free web access", { FR: "2. Acces web gratuit", RU: "2. Бесплатный веб-доступ", ES: "2. Acceso web gratuito", PT: "2. Acesso web gratuito" }),
      body: t("The public web version of ControlMe is free to use.", { FR: "La version web publique de ControlMe est gratuite.", RU: "Публичная веб-версия ControlMe бесплатна.", ES: "La version web publica de ControlMe es gratuita.", PT: "A versao web publica do ControlMe e gratuita." }),
    },
    {
      title: t("3. Contact", { FR: "3. Contact", RU: "3. Контакты", ES: "3. Contacto", PT: "3. Contato" }),
      body: "support@controlme.app",
    },
  ];

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#060B16]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-[#F9FAFB]">ControlMe</Link>
          <Link href="/login" className="text-sm text-[#9CA3AF] transition-colors hover:text-[#F9FAFB]">
            {t("Sign in", { FR: "Connexion", RU: "Войти", ES: "Iniciar sesion", PT: "Entrar" })}
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="animate-fade-in space-y-10">
          <div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-[#F9FAFB]">
              {t("Terms of Service", { FR: "Conditions d'utilisation", RU: "Условия использования", ES: "Terminos de servicio", PT: "Termos de servico" })}
            </h1>
            <p className="text-sm text-[#9CA3AF]">March 11, 2026</p>
          </div>
          {sections.map(({ title, body }) => (
            <section key={title} className="glass space-y-3 rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-[#F9FAFB]">{title}</h2>
              <div className="text-sm leading-relaxed text-[#9CA3AF]">{body}</div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
