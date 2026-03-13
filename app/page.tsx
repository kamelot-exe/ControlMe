"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart2,
  Bell,
  CheckCircle2,
  CreditCard,
  Download,
  FolderOpen,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useMe } from "@/hooks/use-auth";
import { useAppUi } from "@/components/ui";
import { translate } from "@/lib/i18n";

export default function HomePage() {
  const router = useRouter();
  const { data: userData, isLoading } = useMe();
  const { language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, (values ?? {}) as Record<typeof language, string>, fallback);

  useEffect(() => {
    if (!isLoading && userData?.data) {
      router.push("/dashboard");
    }
  }, [userData, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-64 rounded-2xl skeleton" />
      </div>
    );
  }

  if (userData?.data) return null;

  const features = [
    {
      icon: CreditCard,
      color: "#38BDF8",
      title: t("Track recurring payments", { FR: "Suivre les paiements recurrents", RU: "Отслеживайте регулярные платежи", ES: "Rastrea pagos recurrentes", PT: "Acompanhe pagamentos recorrentes" }),
      desc: t("Keep streaming services, software renewals, memberships, and other recurring costs in one place.", { FR: "Gardez services, renouvellements et abonnements au meme endroit.", RU: "Храните стриминги, софт и членства в одном месте.", ES: "Mantén servicios, renovaciones y membresías en un solo lugar.", PT: "Mantenha servicos, renovacoes e assinaturas em um so lugar." }),
    },
    {
      icon: Bell,
      color: "#F59E0B",
      title: t("See upcoming charges", { FR: "Voir les paiements a venir", RU: "Смотрите будущие списания", ES: "Ve los cobros proximos", PT: "Veja cobrancas futuras" }),
      desc: t("Review what is about to renew so monthly spending does not catch you by surprise.", { FR: "Voyez ce qui va bientot se renouveler.", RU: "Смотрите, что скоро продлится, без неприятных сюрпризов.", ES: "Revisa que esta por renovarse.", PT: "Veja o que esta prestes a renovar." }),
    },
    {
      icon: BarChart2,
      color: "#38BDF8",
      title: t("Understand spending patterns", { FR: "Comprendre les depenses", RU: "Понимайте структуру расходов", ES: "Entiende tus gastos", PT: "Entenda seus gastos" }),
      desc: t("Use category and monthly views to see where recurring expenses are growing.", { FR: "Utilisez les vues mensuelles et par categorie.", RU: "Используйте категории и месячные обзоры.", ES: "Usa categorias y vistas mensuales.", PT: "Use categorias e visoes mensais." }),
    },
    {
      icon: Shield,
      color: "#4ADE80",
      title: t("Reduce waste", { FR: "Reduire le gaspillage", RU: "Сокращайте лишние траты", ES: "Reduce desperdicio", PT: "Reduza desperdicio" }),
      desc: t("Spot duplicate tools, inactive services, and subscriptions that no longer justify their cost.", { FR: "Reperez doublons, services inactifs et couts inutiles.", RU: "Находите дубли, неактивные сервисы и лишние подписки.", ES: "Detecta duplicados e inactividad.", PT: "Detecte duplicatas e inatividade." }),
    },
    {
      icon: Download,
      color: "#8B5CF6",
      title: t("Export your data", { FR: "Exporter vos donnees", RU: "Экспортируйте данные", ES: "Exporta tus datos", PT: "Exporte seus dados" }),
      desc: t("Download CSV and PDF summaries when you want a portable record of your expenses.", { FR: "Telechargez des resumes CSV et PDF.", RU: "Скачивайте CSV и PDF-отчёты.", ES: "Descarga resúmenes CSV y PDF.", PT: "Baixe resumos em CSV e PDF." }),
    },
    {
      icon: FolderOpen,
      color: "#F87171",
      title: t("Open source foundation", { FR: "Base open source", RU: "Open source основа", ES: "Base open source", PT: "Base open source" }),
      desc: t("This web project is public and open source, so the codebase can be inspected, improved, and self-hosted.", { FR: "Le projet web est public, inspectable et auto-hebergeable.", RU: "Веб-проект публичный, открытый и пригоден для self-hosting.", ES: "El proyecto web es publico y autohospedable.", PT: "O projeto web e publico e pode ser auto-hospedado." }),
    },
  ];

  const highlights = [
    t("Free web application", { FR: "Application web gratuite", RU: "Бесплатное веб-приложение", ES: "Aplicacion web gratuita", PT: "Aplicacao web gratuita" }),
    t("Open source codebase", { FR: "Code open source", RU: "Открытая кодовая база", ES: "Codigo open source", PT: "Codigo open source" }),
    t("Recurring expense visibility", { FR: "Visibilite des depenses recurrentes", RU: "Видимость регулярных расходов", ES: "Visibilidad de gastos recurrentes", PT: "Visibilidade de gastos recorrentes" }),
    t("Exports and analytics included", { FR: "Exports et analyses inclus", RU: "Экспорт и аналитика включены", ES: "Exportaciones y analitica incluidas", PT: "Exportacoes e analises inclusas" }),
  ];

  return (
    <div className="min-h-screen overflow-x-hidden text-[#F9FAFB]">
      <header className="sticky top-0 z-50 border-b border-white/8" style={{ background: "rgba(6,11,22,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#4ADE80]/30 bg-[#4ADE80]/15">
              <Zap size={14} className="text-[#4ADE80]" />
            </div>
            <span className="font-bold tracking-tight text-[#F9FAFB]">ControlMe</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-[#9CA3AF] transition-colors hover:text-[#F9FAFB]">
              {t("Sign in", { FR: "Connexion", RU: "Войти", ES: "Iniciar sesion", PT: "Entrar" })}
            </Link>
            <Link href="/register" className="flex items-center gap-1.5 rounded-xl bg-[#4ADE80] px-4 py-2 text-sm font-semibold text-[#060B16] transition-all duration-150 hover:bg-[#4ADE80]/90 active:scale-[0.97]">
              {t("Create account", { FR: "Creer un compte", RU: "Создать аккаунт", ES: "Crear cuenta", PT: "Criar conta" })} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-32 pt-28 text-center animate-fade-in">
        <div className="glass-light mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1.5">
          <Sparkles size={12} className="text-[#38BDF8]" />
          <span className="text-xs font-medium tracking-wide text-[#38BDF8]">
            {t("Open source recurring expense tracker", { FR: "Suivi open source des depenses recurrentes", RU: "Open source трекер регулярных расходов", ES: "Tracker open source de gastos recurrentes", PT: "Rastreador open source de gastos recorrentes" })}
          </span>
        </div>
        <h1 className="mb-6 text-5xl font-black leading-tight tracking-tighter md:text-7xl">
          {t("Track, understand, and control every subscription.", { FR: "Suivez, comprenez et controlez chaque abonnement.", RU: "Отслеживайте, понимайте и контролируйте каждую подписку.", ES: "Controla y entiende cada suscripcion.", PT: "Controle e entenda cada assinatura." })}
        </h1>
        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#9CA3AF] md:text-xl">
          {t("ControlMe helps you record recurring expenses, review upcoming charges, and understand how subscription spending changes over time. The public web version is free and open source.", { FR: "ControlMe aide a suivre les depenses recurrentes et les paiements a venir. La version web publique est gratuite et open source.", RU: "ControlMe помогает учитывать регулярные расходы и будущие списания. Публичная веб-версия бесплатна и open source.", ES: "ControlMe te ayuda a seguir gastos recurrentes y cobros proximos. La version web publica es gratuita y open source.", PT: "ControlMe ajuda a acompanhar gastos recorrentes e cobrancas futuras. A versao web publica e gratuita e open source." })}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="flex items-center gap-2 rounded-xl bg-[#4ADE80] px-7 py-3.5 text-base font-bold text-[#060B16] transition-all duration-150 hover:bg-[#4ADE80]/90 active:scale-[0.97]">
            {t("Open the app", { FR: "Ouvrir l'app", RU: "Открыть приложение", ES: "Abrir la app", PT: "Abrir o app" })} <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="glass flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-medium transition-all duration-150 hover:border-white/30">
            {t("Sign in", { FR: "Connexion", RU: "Войти", ES: "Iniciar sesion", PT: "Entrar" })}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-32 animate-slide-up">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#38BDF8]">{t("Project Overview", { FR: "Vue d'ensemble", RU: "Обзор проекта", ES: "Resumen del proyecto", PT: "Visao geral" })}</p>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">{t("What this project does", { FR: "Ce que fait le projet", RU: "Что делает проект", ES: "Que hace el proyecto", PT: "O que o projeto faz" })}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="glass-hover rounded-3xl p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${feature.color}18`, border: `1px solid ${feature.color}30` }}>
                  <Icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-[#F9FAFB]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[#9CA3AF]">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-32 animate-slide-up">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#4ADE80]">{t("Why It Exists", { FR: "Pourquoi il existe", RU: "Зачем он нужен", ES: "Por que existe", PT: "Por que existe" })}</p>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">{t("A simpler way to watch subscriptions", { FR: "Une facon plus simple de suivre les abonnements", RU: "Более простой способ следить за подписками", ES: "Una forma simple de seguir suscripciones", PT: "Uma forma simples de acompanhar assinaturas" })}</h2>
        </div>
        <div className="glass-hover mx-auto flex max-w-2xl flex-col rounded-3xl p-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">{t("Included", { FR: "Inclus", RU: "Включено", ES: "Incluye", PT: "Inclui" })}</p>
          <ul className="flex-1 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-[#F9FAFB]/90">
                <CheckCircle2 size={16} className="shrink-0 text-[#4ADE80]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="space-y-3 border-t border-white/8 py-8 text-center">
        <div className="flex justify-center gap-6 text-xs text-[#6B7280]">
          <Link href="/terms" className="transition-colors hover:text-[#9CA3AF]">Terms</Link>
          <Link href="/privacy" className="transition-colors hover:text-[#9CA3AF]">Privacy</Link>
        </div>
        <p className="text-sm text-[#6B7280]">© 2026 ControlMe</p>
      </footer>
    </div>
  );
}
