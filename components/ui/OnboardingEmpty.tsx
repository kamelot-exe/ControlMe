"use client";

import Link from "next/link";
import { ArrowRight, BarChart2, Bell, CreditCard, PlusCircle } from "lucide-react";
import { useAppUi } from "@/components/ui";
import { translate } from "@/lib/i18n";

export function OnboardingEmpty() {
  const { language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, values ?? {}, fallback);

  const steps = [
    {
      icon: CreditCard,
      title: t("Add subscriptions", { FR: "Ajoutez des abonnements", RU: "Добавьте подписки", UK: "Додайте підписки", GE: "Abos hinzufügen", ES: "Añade suscripciones", PT: "Adicione assinaturas", IT: "Aggiungi abbonamenti", PL: "Dodaj subskrypcje", TR: "Abonelik ekleyin", UZ: "Obunalar qo'shing" }),
      desc: t("Netflix, Spotify, AWS, anything recurring", { FR: "Netflix, Spotify, AWS, tout ce qui revient", RU: "Netflix, Spotify, AWS — всё, что списывается регулярно", UK: "Netflix, Spotify, AWS — усе, що списується регулярно", GE: "Netflix, Spotify, AWS – alles mit Wiederholung", ES: "Netflix, Spotify, AWS, cualquier servicio recurrente", PT: "Netflix, Spotify, AWS, qualquer servico recorrente", IT: "Netflix, Spotify, AWS, tutto ciò che si rinnova", PL: "Netflix, Spotify, AWS — wszystko cykliczne", TR: "Netflix, Spotify, AWS, tekrarlayan her şey", UZ: "Netflix, Spotify, AWS — muntazam to'lanadigan hamma narsa" }),
    },
    {
      icon: Bell,
      title: t("Get smart alerts", { FR: "Recevez des alertes intelligentes", RU: "Получайте умные напоминания", UK: "Отримуйте розумні нагадування", GE: "Smarte Hinweise erhalten", ES: "Recibe alertas inteligentes", PT: "Receba alertas inteligentes", IT: "Ricevi avvisi intelligenti", PL: "Otrzymuj inteligentne alerty", TR: "Akıllı uyarılar alın", UZ: "Aqlli ogohlantirishlarni oling" }),
      desc: t("ControlMe warns you before upcoming charges", { FR: "ControlMe vous avertit avant les prochains paiements", RU: "ControlMe предупредит вас перед ближайшими списаниями", UK: "ControlMe попередить вас перед найближчими списаннями", GE: "ControlMe warnt vor kommenden Abbuchungen", ES: "ControlMe te avisa antes de los próximos cargos", PT: "O ControlMe avisa antes das próximas cobranças", IT: "ControlMe ti avvisa prima dei prossimi addebiti", PL: "ControlMe ostrzega przed nadchodzącymi płatnościami", TR: "ControlMe yaklaşan ödemelerden önce uyarır", UZ: "ControlMe yaqinlashayotgan to'lovlardan oldin ogohlantiradi" }),
    },
    {
      icon: BarChart2,
      title: t("See the full picture", { FR: "Voyez l'ensemble", RU: "Видьте полную картину", UK: "Бачте повну картину", GE: "Gesamtbild sehen", ES: "Mira el panorama completo", PT: "Veja o quadro completo", IT: "Vedi il quadro completo", PL: "Zobacz pełny obraz", TR: "Genel tabloyu görün", UZ: "To'liq manzarani ko'ring" }),
      desc: t("Review trends, category mix, and savings potential", { FR: "Analysez les tendances, les catégories et les économies possibles", RU: "Анализируйте тренды, категории и потенциал экономии", UK: "Аналізуйте тренди, категорії та потенціал економії", GE: "Trends, Kategorien und Sparpotenzial prüfen", ES: "Revisa tendencias, categorías y potencial de ahorro", PT: "Revise tendencias, categorias e potencial de economia", IT: "Analizza trend, categorie e potenziale di risparmio", PL: "Sprawdzaj trendy, kategorie i potencjał oszczędności", TR: "Trendleri, kategorileri ve tasarruf potansiyelini inceleyin", UZ: "Trendlar, kategoriyalar va tejash imkoniyatini tahlil qiling" }),
    },
  ];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#4ADE80]/20 bg-[#4ADE80]/10">
        <CreditCard size={28} className="text-[#4ADE80]" />
      </div>

      <h2 className="mb-3 text-3xl font-black tracking-tight text-[#F9FAFB]">
        {t("Welcome to ControlMe", { FR: "Bienvenue dans ControlMe", RU: "Добро пожаловать в ControlMe", UK: "Ласкаво просимо до ControlMe", GE: "Willkommen bei ControlMe", ES: "Bienvenido a ControlMe", PT: "Bem-vindo ao ControlMe", IT: "Benvenuto in ControlMe", PL: "Witamy w ControlMe", TR: "ControlMe'ye hoş geldiniz", UZ: "ControlMe'ga xush kelibsiz" })}
      </h2>
      <p className="mb-10 max-w-md text-base leading-relaxed text-[#9CA3AF]">
        {t("You're all set. Add your first subscription to start tracking recurring spend and surface useful alerts.", { FR: "Tout est prêt. Ajoutez votre premier abonnement pour suivre vos dépenses récurrentes.", RU: "Всё готово. Добавьте первую подписку, чтобы начать отслеживать регулярные расходы.", UK: "Усе готово. Додайте першу підписку, щоб почати відстежувати регулярні витрати.", GE: "Alles ist bereit. Fügen Sie Ihr erstes Abo hinzu, um wiederkehrende Ausgaben zu verfolgen.", ES: "Todo está listo. Añade tu primera suscripción para seguir gastos recurrentes.", PT: "Tudo pronto. Adicione sua primeira assinatura para acompanhar gastos recorrentes.", IT: "È tutto pronto. Aggiungi il tuo primo abbonamento per seguire le spese ricorrenti.", PL: "Wszystko gotowe. Dodaj pierwszą subskrypcję, aby śledzić cykliczne wydatki.", TR: "Her şey hazır. Düzenli harcamaları takip etmek için ilk aboneliğinizi ekleyin.", UZ: "Hammasi tayyor. Muntazam xarajatlarni kuzatish uchun birinchi obunangizni qo'shing." })}
      </p>

      <div className="mb-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="glass-light rounded-2xl p-5 text-left">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4ADE80]/15 text-[10px] font-bold text-[#4ADE80]">
                  {index + 1}
                </div>
                <Icon size={16} className="text-[#4ADE80]" />
              </div>
              <p className="text-sm font-semibold text-[#F9FAFB]">{step.title}</p>
              <p className="mt-1 text-xs text-[#9CA3AF]">{step.desc}</p>
            </div>
          );
        })}
      </div>

      <Link
        href="/subscriptions/new"
        className="inline-flex items-center gap-2 rounded-xl bg-[#4ADE80] px-8 py-3.5 font-bold text-[#060B16] transition-all duration-150 hover:bg-[#4ADE80]/90"
      >
        <PlusCircle size={18} />
        {t("Add your first subscription", { FR: "Ajoutez votre premier abonnement", RU: "Добавьте первую подписку", UK: "Додайте першу підписку", GE: "Erstes Abo hinzufügen", ES: "Añade tu primera suscripción", PT: "Adicione sua primeira assinatura", IT: "Aggiungi il tuo primo abbonamento", PL: "Dodaj pierwszą subskrypcję", TR: "İlk aboneliğini ekle", UZ: "Birinchi obunani qo'shing" })}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
