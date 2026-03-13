"use client";

import Link from "next/link";
import { useAppUi } from "@/components/ui";
import { translate } from "@/lib/i18n";

export function PrivacyContent() {
  const { language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, (values ?? {}) as Record<typeof language, string>, fallback);

  const sections = [
    {
      title: t("1. Overview", { FR: "1. Vue d'ensemble", RU: "1. Обзор", ES: "1. Resumen", PT: "1. Visao geral" }),
      body: t("ControlMe is an open-source web project for tracking subscriptions and recurring expenses. This page explains what data the service uses and why.", { FR: "ControlMe est un projet web open source pour suivre les abonnements et depenses recurrentes.", RU: "ControlMe — это open source веб-проект для учёта подписок и регулярных расходов.", ES: "ControlMe es un proyecto web open source para seguir suscripciones y gastos recurrentes.", PT: "ControlMe e um projeto web open source para acompanhar assinaturas e gastos recorrentes." }),
    },
    {
      title: t("2. Data we use", { FR: "2. Donnees utilisees", RU: "2. Какие данные мы используем", ES: "2. Datos usados", PT: "2. Dados usados" }),
      body: t("We use only the data required to authenticate your account, store subscription records, generate analytics and exports, and keep the service stable.", { FR: "Nous utilisons seulement les donnees necessaires au fonctionnement du service.", RU: "Мы используем только данные, нужные для работы сервиса.", ES: "Usamos solo los datos necesarios para operar el servicio.", PT: "Usamos apenas os dados necessarios para operar o servico." }),
    },
    {
      title: t("3. Contact", { FR: "3. Contact", RU: "3. Контакты", ES: "3. Contacto", PT: "3. Contato" }),
      body: "privacy@controlme.app",
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
              {t("Privacy Policy", { FR: "Politique de confidentialite", RU: "Политика конфиденциальности", ES: "Politica de privacidad", PT: "Politica de privacidade" })}
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
