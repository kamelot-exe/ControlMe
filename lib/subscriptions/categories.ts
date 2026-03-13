import type { AppLanguage } from "@/lib/i18n";

const CATEGORY_LABELS: Record<string, Partial<Record<AppLanguage, string>>> = {
  Subscription: { FR: "Abonnement", RU: "Подписка", UK: "Підписка", GE: "Abo", ES: "Suscripcion", PT: "Assinatura", IT: "Abbonamento", PL: "Subskrypcja", TR: "Abonelik", UZ: "Obuna" },
  "Video Streaming": { FR: "Streaming video", RU: "Видеостриминг", UK: "Вiдеостримiнг", GE: "Videostreaming", ES: "Streaming de video", PT: "Streaming de video", IT: "Streaming video", PL: "Streaming wideo", TR: "Video akisi", UZ: "Video striming" },
  "Music Streaming": { FR: "Streaming musical", RU: "Музыкальный стриминг", UK: "Музичний стримiнг", GE: "Musikstreaming", ES: "Streaming musical", PT: "Streaming musical", IT: "Streaming musicale", PL: "Streaming muzyki", TR: "Muzik akisi", UZ: "Musiqa striming" },
  Gaming: { FR: "Jeux", RU: "Игры", UK: "Iгри", GE: "Gaming", ES: "Gaming", PT: "Jogos", IT: "Gaming", PL: "Gaming", TR: "Oyunlar", UZ: "Oyinlar" },
  "AI Tools": { FR: "Outils IA", RU: "AI-инструменты", UK: "AI-iнструменти", GE: "KI-Tools", ES: "Herramientas IA", PT: "Ferramentas de IA", IT: "Strumenti IA", PL: "Narzędzia AI", TR: "Yapay zeka araclari", UZ: "AI vositalari" },
  Productivity: { FR: "Productivite", RU: "Продуктивность", UK: "Продуктивнiсть", GE: "Produktivitat", ES: "Productividad", PT: "Produtividade", IT: "Produttivita", PL: "Produktywnosc", TR: "Verimlilik", UZ: "Samaradorlik" },
  "Developer Tools": { FR: "Outils dev", RU: "Инструменты разработчика", UK: "Iнструменти розробника", GE: "Entwickler-Tools", ES: "Herramientas de desarrollo", PT: "Ferramentas de desenvolvimento", IT: "Strumenti per sviluppatori", PL: "Narzędzia deweloperskie", TR: "Gelistirici araclari", UZ: "Dasturchi vositalari" },
  "Design Tools": { FR: "Outils design", RU: "Дизайн-инструменты", UK: "Дизайн-iнструменти", GE: "Design-Tools", ES: "Herramientas de diseno", PT: "Ferramentas de design", IT: "Strumenti di design", PL: "Narzędzia projektowe", TR: "Tasarim araclari", UZ: "Dizayn vositalari" },
  "Cloud Storage": { FR: "Stockage cloud", RU: "Облачное хранилище", UK: "Хмарне сховище", GE: "Cloud-Speicher", ES: "Almacenamiento en la nube", PT: "Armazenamento em nuvem", IT: "Archiviazione cloud", PL: "Chmura", TR: "Bulut depolama", UZ: "Bulut saqlash" },
  Security: { FR: "Securite", RU: "Безопасность", UK: "Безпека", GE: "Sicherheit", ES: "Seguridad", PT: "Seguranca", IT: "Sicurezza", PL: "Bezpieczenstwo", TR: "Guvenlik", UZ: "Xavfsizlik" },
  "News and Media": { FR: "Actualites et medias", RU: "Новости и медиа", UK: "Новини та медiа", GE: "Nachrichten und Medien", ES: "Noticias y medios", PT: "Noticias e midia", IT: "Notizie e media", PL: "Wiadomosci i media", TR: "Haberler ve medya", UZ: "Yangiliklar va media" },
  Education: { FR: "Education", RU: "Образование", UK: "Освiта", GE: "Bildung", ES: "Educacion", PT: "Educacao", IT: "Istruzione", PL: "Edukacja", TR: "Egitim", UZ: "Talim" },
  "Fitness and Wellness": { FR: "Fitness et bien-etre", RU: "Фитнес и здоровье", UK: "Фiтнес i здоров'я", GE: "Fitness und Wellness", ES: "Fitness y bienestar", PT: "Fitness e bem-estar", IT: "Fitness e benessere", PL: "Fitness i wellness", TR: "Fitness ve saglik", UZ: "Fitness va sogliq" },
  Banking: { FR: "Banque", RU: "Банкинг", UK: "Банкiнг", GE: "Banking", ES: "Banca", PT: "Banco", IT: "Banca", PL: "Bankowosc", TR: "Bankacilik", UZ: "Bank xizmatlari" },
  Fintech: { FR: "Fintech", RU: "Финтех", UK: "Фiнтех", GE: "Fintech", ES: "Fintech", PT: "Fintech", IT: "Fintech", PL: "Fintech", TR: "Fintek", UZ: "Fintex" },
  "Mobile Carrier": { FR: "Operateur mobile", RU: "Мобильный оператор", UK: "Мобiльний оператор", GE: "Mobilfunk", ES: "Operador movil", PT: "Operadora movel", IT: "Operatore mobile", PL: "Operator komorkowy", TR: "Mobil operator", UZ: "Mobil operator" },
  "Internet Provider": { FR: "Fournisseur internet", RU: "Интернет-провайдер", UK: "Iнтернет-провайдер", GE: "Internetanbieter", ES: "Proveedor de internet", PT: "Provedor de internet", IT: "Provider internet", PL: "Dostawca internetu", TR: "Internet saglayici", UZ: "Internet provayderi" },
  "Delivery and Retail": { FR: "Livraison et retail", RU: "Доставка и ритейл", UK: "Доставка та retail", GE: "Lieferung und Retail", ES: "Entrega y retail", PT: "Entrega e varejo", IT: "Consegna e retail", PL: "Dostawa i retail", TR: "Teslimat ve perakende", UZ: "Yetkazib berish va retail" },
  Utilities: { FR: "Services", RU: "Сервисы", UK: "Сервiси", GE: "Versorger", ES: "Servicios", PT: "Servicos", IT: "Servizi", PL: "Uslugi", TR: "Servisler", UZ: "Xizmatlar" },
  Other: { FR: "Autre", RU: "Другое", UK: "Iнше", GE: "Andere", ES: "Otro", PT: "Outro", IT: "Altro", PL: "Inne", TR: "Diger", UZ: "Boshqa" },
};

export function normalizeCategory(category?: string | null, serviceGroup?: string | null) {
  const trimmedCategory = category?.trim();
  const trimmedGroup = serviceGroup?.trim();

  if (trimmedCategory && !["General", "Subscription"].includes(trimmedCategory)) {
    return trimmedCategory;
  }

  if (trimmedGroup) {
    return trimmedGroup;
  }

  return trimmedCategory || trimmedGroup || "Subscription";
}

export function getLocalizedCategoryName(
  category?: string | null,
  language: AppLanguage = "EN",
  serviceGroup?: string | null,
) {
  const normalized = normalizeCategory(category, serviceGroup);
  return CATEGORY_LABELS[normalized]?.[language] ?? normalized;
}
