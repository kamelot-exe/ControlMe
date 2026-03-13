"use client";

import { useMemo, useRef } from "react";
import { useAppUi } from "@/components/ui";
import { translate } from "@/lib/i18n";

interface NeedScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
}

function getNeedLabel(value: number, t: (fallback: string, values?: Record<string, string>) => string) {
  if (value >= 80) return t("Essential", { FR: "Essentiel", RU: "Очень нужна", UK: "Дуже потрібна", GE: "Wesentlich", ES: "Esencial", PT: "Essencial", IT: "Essenziale", PL: "Niezbędna", TR: "Temel", UZ: "Juda zarur" });
  if (value >= 60) return t("Useful", { FR: "Utile", RU: "Полезна", UK: "Корисна", GE: "Nützlich", ES: "Útil", PT: "Útil", IT: "Utile", PL: "Przydatna", TR: "Yararlı", UZ: "Foydali" });
  if (value >= 40) return t("Optional", { FR: "Optionnel", RU: "Необязательна", UK: "Необов'язкова", GE: "Optional", ES: "Opcional", PT: "Opcional", IT: "Opzionale", PL: "Opcjonalna", TR: "İsteğe bağlı", UZ: "Ixtiyoriy" });
  return t("Easy to cut", { FR: "Facile à couper", RU: "Легко отказаться", UK: "Легко відмовитись", GE: "Leicht zu streichen", ES: "Fácil de cancelar", PT: "Fácil de cortar", IT: "Facile da tagliare", PL: "Łatwa do usunięcia", TR: "Kolayca iptal edilir", UZ: "Oson bekor qilinadi" });
}

export function NeedScoreSlider({
  value,
  onChange,
}: NeedScoreSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { language } = useAppUi();
  const t = (fallback: string, values?: Record<string, string>) =>
    translate(language, values ?? {}, fallback);
  const label = getNeedLabel(value, t);
  const fillColor = useMemo(() => {
    const hue = Math.round((value / 100) * 120);
    return `hsl(${hue} 84% 58%)`;
  }, [value]);

  function updateFromClientY(clientY: number) {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relative = 1 - (clientY - rect.top) / rect.height;
    const next = Math.max(0, Math.min(100, Math.round(relative * 20) * 5));
    onChange(next);
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.88),rgba(7,12,23,0.96))] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.26)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#F9FAFB]">
            {t("Need score", { FR: "Utilité", RU: "Полезность", UK: "Корисність", GE: "Nutzen", ES: "Utilidad", PT: "Utilidade", IT: "Utilità", PL: "Przydatność", TR: "Gereklilik", UZ: "Foydalilik" })}
          </p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {t("Drag the vertical scale to show how necessary this subscription feels in real life.", { FR: "Faites glisser l'échelle verticale pour indiquer l'utilité réelle de cet abonnement.", RU: "Передвиньте вертикальную шкалу, чтобы показать, насколько эта подписка нужна в реальной жизни.", UK: "Пересуньте вертикальну шкалу, щоб показати, наскільки ця підписка потрібна в реальному житті.", GE: "Ziehen Sie die vertikale Skala, um zu zeigen, wie wichtig dieses Abo im Alltag ist.", ES: "Desliza la escala vertical para mostrar cuánto necesitas realmente esta suscripción.", PT: "Arraste a escala vertical para mostrar o quanto esta assinatura é necessária na vida real.", IT: "Trascina la scala verticale per indicare quanto questo abbonamento è davvero necessario.", PL: "Przesuń pionową skalę, aby pokazać, jak bardzo ta subskrypcja jest potrzebna.", TR: "Bu aboneliğin gerçek hayatta ne kadar gerekli olduğunu göstermek için dikey ölçeği sürükleyin.", UZ: "Bu obuna haqiqiy hayotda qanchalik kerakligini ko'rsatish uchun vertikal shkalani suring." })}
          </p>
        </div>
        <div className="min-w-[132px] text-right">
          <p className="text-3xl font-semibold text-[#F9FAFB]">{value}%</p>
          <p className="min-h-[20px] text-sm font-medium" style={{ color: fillColor }}>
            {label}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex items-center gap-4">
          <div className="flex h-64 flex-col justify-between py-1 text-xs text-[#6B7280]">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-label={t("Need score", { FR: "Utilité", RU: "Полезность", UK: "Корисність", GE: "Nutzen", ES: "Utilidad", PT: "Utilidade", IT: "Utilità", PL: "Przydatność", TR: "Gereklilik", UZ: "Foydalilik" })}
            onMouseDown={(event) => {
              updateFromClientY(event.clientY);

              const handleMove = (moveEvent: MouseEvent) =>
                updateFromClientY(moveEvent.clientY);
              const handleUp = () => {
                window.removeEventListener("mousemove", handleMove);
                window.removeEventListener("mouseup", handleUp);
              };

              window.addEventListener("mousemove", handleMove);
              window.addEventListener("mouseup", handleUp);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                onChange(Math.min(100, value + 5));
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                onChange(Math.max(0, value - 5));
              }
            }}
            className="relative h-72 w-8 cursor-pointer rounded-full border border-white/10 bg-[#0A1220] shadow-[inset_0_8px_24px_rgba(0,0,0,0.35),0_12px_30px_rgba(0,0,0,0.18)] outline-none"
          >
            <div className="absolute inset-[3px] rounded-full bg-white/[0.03]" />
            <div
              className="absolute bottom-[3px] left-[3px] right-[3px] rounded-full transition-[height,background-color] duration-150 ease-out"
              style={{
                height: `calc(${value}% - 6px)`,
                minHeight: value > 0 ? "14px" : "0px",
                backgroundColor: fillColor,
                boxShadow: `0 0 24px color-mix(in srgb, ${fillColor} 35%, transparent)`,
              }}
            />
            <div
              className="absolute left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border-2 border-[#F9FAFB] bg-[#0B1424] shadow-[0_0_0_6px_rgba(255,255,255,0.06)] transition-[bottom] duration-150 ease-out"
              style={{ bottom: `calc(${value}% - 16px)` }}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#DCE6EE]">
            <span className="font-medium text-[#4ADE80]">80-100%</span>{" "}
            {t("Keep this unless price or overlap becomes a problem.", { FR: "Gardez-la sauf si le prix ou le doublon devient un problème.", RU: "Оставьте её, если только цена или дублирование не станут проблемой.", UK: "Залишайте її, якщо ціна або дублювання не стануть проблемою.", GE: "Behalten Sie sie, solange Preis oder Überschneidung kein Problem werden.", ES: "Mantenla salvo que el precio o el solapamiento sean un problema.", PT: "Mantenha-a, a menos que preco ou sobreposição virem um problema.", IT: "Tienila finché prezzo o sovrapposizione non diventano un problema.", PL: "Zostaw ją, chyba że problemem stanie się cena lub nakładanie usług.", TR: "Fiyat veya çakışma sorun yaratmadıkça bunu koruyun.", UZ: "Narx yoki takrorlanish muammo bo'lmaguncha saqlab qoling." })}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#DCE6EE]">
            <span className="font-medium text-[#7DD3FC]">60-75%</span>{" "}
            {t("Useful, but still worth reviewing against alternatives.", { FR: "Utile, mais à comparer avec des alternatives.", RU: "Полезна, но её всё ещё стоит сравнить с альтернативами.", UK: "Корисна, але її варто порівняти з альтернативами.", GE: "Nützlich, aber ein Vergleich mit Alternativen lohnt sich.", ES: "Útil, pero aún conviene revisarla frente a alternativas.", PT: "Útil, mas ainda vale revisar com alternativas.", IT: "Utile, ma vale comunque confrontarla con alternative.", PL: "Przydatna, ale warto porównać ją z alternatywami.", TR: "Yararlı, ancak alternatiflerle yine de gözden geçirilmeli.", UZ: "Foydali, lekin baribir alternativalar bilan solishtirish kerak." })}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#DCE6EE]">
            <span className="font-medium text-[#F59E0B]">40-55%</span>{" "}
            {t("Optional and should be checked before the next renewal.", { FR: "Optionnelle et à vérifier avant le prochain renouvellement.", RU: "Необязательна, её стоит проверить до следующего продления.", UK: "Необов'язкова, її варто перевірити до наступного продовження.", GE: "Optional und vor der nächsten Verlängerung zu prüfen.", ES: "Opcional y conviene revisarla antes de la próxima renovación.", PT: "Opcional e deve ser revista antes da próxima renovação.", IT: "Opzionale e da controllare prima del prossimo rinnovo.", PL: "Opcjonalna i warto ją sprawdzić przed kolejnym odnowieniem.", TR: "İsteğe bağlıdır ve bir sonraki yenilemeden önce kontrol edilmelidir.", UZ: "Ixtiyoriy va keyingi yangilanishdan oldin tekshirilishi kerak." })}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#DCE6EE]">
            <span className="font-medium text-[#F97373]">0-35%</span>{" "}
            {t("Low-value subscription and likely a cancellation candidate.", { FR: "Abonnement de faible valeur et probablement à résilier.", RU: "Подписка с низкой ценностью и вероятный кандидат на отмену.", UK: "Підписка з низькою цінністю та кандидат на скасування.", GE: "Abo mit geringem Wert und wahrscheinlich kündbar.", ES: "Suscripción de bajo valor y probable candidata a cancelación.", PT: "Assinatura de baixo valor e provável candidata a cancelamento.", IT: "Abbonamento di scarso valore e probabile candidato alla cancellazione.", PL: "Subskrypcja o niskiej wartości i prawdopodobny kandydat do anulowania.", TR: "Düşük değerli abonelik ve muhtemel iptal adayı.", UZ: "Past qiymatli obuna va bekor qilish uchun kuchli nomzod." })}
          </div>
        </div>
      </div>
    </div>
  );
}
