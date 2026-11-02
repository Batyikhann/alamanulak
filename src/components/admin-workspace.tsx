import Link from "next/link";
import {
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  FolderOpen,
  Landmark,
  LogOut,
  Images,
  Mail,
  Newspaper,
  Save,
  Settings2,
  ShieldCheck,
  Tag,
  Trash2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type {
  AboutPhoto,
  ContactInquiry,
  FederationMember,
  HistoryMilestone,
  MediaItem,
  HorseCategory,
  HorseListing,
  NewsArticle,
  Player,
  RuleSection,
  SiteSettings,
  Tournament,
} from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import AdminPreview, { AdminPreviewToggle } from "@/components/admin-preview";
import LocaleSync from "@/components/locale-sync";
import { kgRegions } from "@/lib/kg-regions";
import {
  deleteAboutPhotoAction,
  deleteCategoryAction,
  deleteHorseAction,
  deleteMediaAction,
  deleteMemberAction,
  deleteMilestoneAction,
  deleteNewsAction,
  deletePlayerAction,
  deleteRuleAction,
  deleteTournamentAction,
  logoutAction,
  markInquiryHandledAction,
  saveAboutPhotoAction,
  saveCategoryAction,
  saveHorseAction,
  saveMediaAction,
  saveMemberAction,
  saveMilestoneAction,
  saveNewsAction,
  savePlayerAction,
  saveRuleAction,
  saveSettingsAction,
  saveTournamentAction,
} from "@/app/admin/actions";

type HorseWithCategory = HorseListing & { category: HorseCategory };
type AdminWorkspaceProps = {
  locale: Locale;
  username: string;
  tab: AdminTab;
  saved?: string;
  error?: string;
  preview: { open: boolean; width: number; device: "desktop" | "phone" };
  data: {
    settings: SiteSettings;
    articles: NewsArticle[];
    tournaments: Tournament[];
    players: Player[];
    rules: RuleSection[];
    categories: HorseCategory[];
    horses: HorseWithCategory[];
    inquiries: ContactInquiry[];
    members: FederationMember[];
    aboutPhotos: AboutPhoto[];
    milestones: HistoryMilestone[];
    mediaItems: MediaItem[];
  };
};

export const adminTabs = ["overview", "settings", "news", "tournaments", "players", "media", "rules", "horses", "federation", "inquiries"] as const;
export type AdminTab = (typeof adminTabs)[number];

// The public page the preview pane opens for each admin section.
const previewPaths: Record<AdminTab, string> = {
  overview: "", settings: "", news: "/news", tournaments: "/calendar", players: "/players", media: "/media",
  rules: "/rules", horses: "/horses", federation: "/about", inquiries: "",
};

// Felt-panel symbols for rules (key matches components/rules-page.tsx).
const symbolOptions: [string, string, string][] = [
  ["", "Автоматтык", "Автоматически"], ["horn", "Кочкор мүйүз", "Бараньи рога"], ["rosette", "Төрт мүйүз", "Розетка"],
  ["tunduk", "Түндүк", "Тюндюк"], ["horse", "Ат башы", "Голова коня"], ["shyrdak", "Шырдак оюму", "Узор шырдака"], ["emblem", "Федерациянын белгиси", "Эмблема федерации"],
];

const mediaCategories: [string, string, string][] = [
  ["tournaments", "Турнирлер", "Турниры"], ["players", "Оюнчулар", "Игроки"], ["horses", "Жылкылар", "Лошади"], ["federation", "Федерация", "Федерация"],
];

function MediaFields({ item, labels, locale, nextOrder }: { item?: MediaItem; labels: typeof ui.ky | typeof ui.ru; locale: Locale; nextOrder: number }) {
  return <div className="admin-form-grid">
    <Field name="imageUrl" label={labels.image} value={item?.imageUrl} />
    <Field name="videoUrl" label={labels.videoUrl} value={item?.videoUrl} required={false} />
    <Pair field="caption" label={labels.caption} ky={item?.captionKy} ru={item?.captionRu} />
    <label className="admin-field">{labels.mediaCategory}<select name="category" defaultValue={item?.category ?? "tournaments"}>
      {mediaCategories.map(([key, ky, ru]) => <option key={key} value={key}>{locale === "ky" ? ky : ru}</option>)}
    </select></label>
    <Field name="sortOrder" label="#" type="number" value={item?.sortOrder ?? nextOrder} />
  </div>;
}

const ui = {
  ky: {
    panel: "ФЕДЕРАЦИЯНЫН БАШКАРУУСУ",
    overview: "Жалпы көрүнүш",
    settings: "Башкы бет",
    news: "Жаңылыктар",
    tournaments: "Мелдештер",
    players: "Оюнчулар",
    media: "Медиа",
    videoUrl: "YouTube шилтемеси (кааласаңыз)",
    mediaCategory: "Бөлүмү",
    mediaHint: "Медиа бөлүмү бош турганда, сайт сүрөттөрдү жаңылыктардан, оюнчулардан жана жылкылардан өзү чогултат.",
    rules: "Оюндун эрежелери",
    horses: "Ат каталогу",
    inquiries: "Билдирүүлөр",
    dashboard: "Башкаруу панели",
    welcome: "Кош келиңиз",
    account: "Аккаунт",
    publicSite: "Сайтты көрүү",
    logout: "Чыгуу",
    demo: "Демо маалымат · жарыялоодон мурда текшериңиз",
    saved: "Өзгөртүүлөр сакталды",
    categoryError: "Бул категорияда жарыялар бар. Адегенде жарыяларды башка категорияга өткөрүңүз.",
    settingsTitle: "Башкы бет жана байланыш",
    siteName: "Сайттын аталышы",
    heroTitle: "Башкы аталыш",
    heroText: "Башкы текст",
    aboutTitle: "Федерация бөлүмүнүн аталышы",
    aboutText: "Федерация жөнүндө",
    contact: "Байланыш маалыматы",
    image: "Сүрөттүн URL дареги",
    social: "Социалдык тармактын шилтемеси",
    phone: "Телефон",
    email: "Электрондук почта",
    address: "Дарек",
    articles: "Жарыяланган жаңылыктар",
    schedule: "Календарь жана жыйынтыктар",
    playersTitle: "Оюнчулар бөлүмүнүн аталышы",
    playersSection: "Оюнчулар",
    rulesSection: "Эреже бөлүмдөрү",
    categories: "Ат категориялары",
    listings: "Ат жарыялары",
    newItem: "Жаңы кошуу",
    edit: "Түзөтүү",
    title: "Аталышы",
    description: "Кыскача маалымат",
    body: "Толук маалымат",
    excerpt: "Кыскача текст",
    place: "Өткөрүлүүчү жер",
    starts: "Башталышы",
    ends: "Аякташы",
    results: "Мелдештин жыйынтыгы (кааласаңыз)",
    published: "Сайтка жарыялоо",
    active: "Категорияны колдонуу",
    save: "Сактоо",
    delete: "Өчүрүү",
    name: "Аты-жөнү",
    position: "Оюндагы орду",
    number: "Номер",
    biography: "Оюнчу жөнүндө",
    club: "Клубу (кааласаңыз)",
    city: "Шаары (карточканын алдында)",
    symbol: "Белгиси (кийиз панелинде)",
    birthYear: "Туулган жылы (кааласаңыз)",
    achievements: "Жетишкендиктери (карточканын артында)",
    age: "Жашы",
    location: "Жайгашкан жери",
    price: "Баасы · сом",
    sellerName: "Сатуучунун аты (кааласаңыз)",
    sellerPhone: "Сатуучунун телефону (сайтта көрсөтүлөт)",
    category: "Категория",
    unread: "Жаңы",
    handled: "Каралды",
    markHandled: "Каралды деп белгилөө",
    markNew: "Жаңы деп белгилөө",
    empty: "Азырынча маалымат жок",
    requiredNote: "Жарыялоо үчүн кыргызча жана орусча талаалардын баары толтурулушу керек.",
    countNews: "Жаңылык",
    countTournaments: "Мелдеш",
    countTeams: "Команда",
    countHorses: "Ат жарыясы",
    countMessages: "Билдирүү",
    federation: "Федерация жөнүндө",
    members: "Федерациянын мүчөлөрү",
    role: "Кызматы",
    memberBio: "Кыскача маалымат (кааласаңыз)",
    photo: "Сүрөттүн URL дареги (кааласаңыз)",
    kind: "Беттеги орду",
    kindLeader: "Төрага · түндүктүн ортосунда",
    kindBoard: "Башкаруу · уук",
    kindRegional: "Аймактык өкүл · картада гана",
    region: "Аймак (картада көрсөтүлөт)",
    noRegion: "— Аймаксыз —",
    memberPhone: "Байланыш телефону (кааласаңыз)",
    gallery: "Кереге · сүрөттөр",
    caption: "Сүрөттүн жазуусу",
    history: "Тарых · жол",
    year: "Жылы",
    milestoneText: "Кыскача маалымат (кааласаңыз)",
    preview: "Сайт",
    previewHide: "Сайтты жашыруу",
    previewReload: "Жаңылоо",
    previewBack: "Артка",
    previewDesktop: "Компьютер",
    previewPhone: "Телефон",
    previewOpen: "Жаңы өтмөктө ачуу",
    previewDrag: "Кеңдигин өзгөртүү үчүн сүйрөңүз",
  },
  ru: {
    panel: "УПРАВЛЕНИЕ ФЕДЕРАЦИЕЙ",
    overview: "Обзор",
    settings: "Главная страница",
    news: "Новости",
    tournaments: "Соревнования",
    players: "Игроки",
    media: "Медиа",
    videoUrl: "Ссылка YouTube (по желанию)",
    mediaCategory: "Раздел",
    mediaHint: "Пока раздел пуст, сайт сам собирает фото из новостей, игроков и лошадей.",
    rules: "Правила игры",
    horses: "Каталог лошадей",
    inquiries: "Обращения",
    dashboard: "Панель управления",
    welcome: "Добро пожаловать",
    account: "Аккаунт",
    publicSite: "Открыть сайт",
    logout: "Выйти",
    demo: "Демо-данные · проверьте перед публикацией",
    saved: "Изменения сохранены",
    categoryError: "В этой категории есть объявления. Сначала перенесите их в другую категорию.",
    settingsTitle: "Главная и контакты",
    siteName: "Название сайта",
    heroTitle: "Главный заголовок",
    heroText: "Главный текст",
    aboutTitle: "Заголовок раздела о федерации",
    aboutText: "О федерации",
    contact: "Контактные данные",
    image: "URL изображения",
    social: "Ссылка на соцсеть",
    phone: "Телефон",
    email: "Электронная почта",
    address: "Адрес",
    articles: "Опубликованные новости",
    schedule: "Календарь и результаты",
    playersTitle: "Заголовок раздела игроков",
    playersSection: "Игроки",
    rulesSection: "Разделы правил",
    categories: "Категории лошадей",
    listings: "Объявления о лошадях",
    newItem: "Добавить",
    edit: "Редактировать",
    title: "Название",
    description: "Краткое описание",
    body: "Полный текст",
    excerpt: "Короткий текст",
    place: "Место проведения",
    starts: "Начало",
    ends: "Окончание",
    results: "Результат турнира (если есть)",
    published: "Опубликовать на сайте",
    active: "Использовать категорию",
    save: "Сохранить",
    delete: "Удалить",
    name: "Имя",
    position: "Игровая позиция",
    number: "Номер",
    biography: "Об игроке",
    club: "Клуб (по желанию)",
    city: "Город (лицевая сторона карточки)",
    symbol: "Символ (на войлочной панели)",
    birthYear: "Год рождения (по желанию)",
    achievements: "Достижения (обратная сторона карточки)",
    age: "Возраст",
    location: "Местонахождение",
    price: "Цена · сом",
    sellerName: "Имя продавца (по желанию)",
    sellerPhone: "Телефон продавца (показывается на сайте)",
    category: "Категория",
    unread: "Новое",
    handled: "Обработано",
    markHandled: "Отметить обработанным",
    markNew: "Вернуть в новые",
    empty: "Пока нет данных",
    requiredNote: "Для публикации заполните поля на кыргызском и русском языках.",
    countNews: "Новостей",
    countTournaments: "Турниров",
    countTeams: "Команд",
    countHorses: "Объявлений",
    countMessages: "Обращений",
    federation: "О федерации",
    members: "Члены федерации",
    role: "Должность",
    memberBio: "Краткая информация (по желанию)",
    photo: "URL фотографии (по желанию)",
    kind: "Место на странице",
    kindLeader: "Президент · в центре түндүка",
    kindBoard: "Правление · уук",
    kindRegional: "Региональный представитель · только на карте",
    region: "Регион (показывается на карте)",
    noRegion: "— Без региона —",
    memberPhone: "Контактный телефон (по желанию)",
    gallery: "Кереге · фотографии",
    caption: "Подпись к фото",
    history: "История · путь",
    year: "Год",
    milestoneText: "Краткое описание (по желанию)",
    preview: "Сайт",
    previewHide: "Скрыть сайт",
    previewReload: "Обновить",
    previewBack: "Назад",
    previewDesktop: "Компьютер",
    previewPhone: "Телефон",
    previewOpen: "Открыть в новой вкладке",
    previewDrag: "Потяните, чтобы изменить ширину",
  },
} as const;

type FormAction = (formData: FormData) => void | Promise<void>;

function Field({
  name,
  label,
  value = "",
  type = "text",
  required = true,
  step,
}: {
  name: string;
  label: string;
  value?: string | number;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return <label className="admin-field">{label}<input name={name} type={type} defaultValue={value} required={required} step={step} /></label>;
}

function Area({
  name,
  label,
  value = "",
  required = true,
  rows = 3,
}: {
  name: string;
  label: string;
  value?: string;
  required?: boolean;
  rows?: number;
}) {
  return <label className="admin-field">{label}<textarea name={name} defaultValue={value} required={required} rows={rows} /></label>;
}

function Pair({
  field,
  label,
  ky,
  ru,
  multiline = false,
  required = true,
  rows = 3,
}: {
  field: string;
  label: string;
  ky?: string;
  ru?: string;
  multiline?: boolean;
  required?: boolean;
  rows?: number;
}) {
  const Control = multiline ? Area : Field;
  return <div className="admin-pair">
    <Control name={`${field}Ky`} label={`${label} · KY`} value={ky} required={required} rows={rows} />
    <Control name={`${field}Ru`} label={`${label} · RU`} value={ru} required={required} rows={rows} />
  </div>;
}

function PublishToggle({ label, checked = false }: { label: string; checked?: boolean }) {
  return <label className="publish-toggle"><input type="checkbox" name="published" defaultChecked={checked} /><span><Check size={13} /></span>{label}</label>;
}

function FormButtons({ save, isNew, action, id, labels }: {
  save: string;
  isNew: boolean;
  action?: FormAction;
  id?: string;
  labels: typeof ui.ky | typeof ui.ru;
}) {
  return <div className="admin-form-actions">
    <button className="admin-save" type="submit"><Save size={15} />{save}</button>
    {!isNew && action && id && <button className="admin-delete-button" type="submit" formAction={action} formNoValidate><Trash2 size={14} />{labels.delete}</button>}
  </div>;
}

function EditDetails({ title, children, isNew = false }: { title: string; children: React.ReactNode; isNew?: boolean }) {
  return <details className={`admin-edit-details${isNew ? " is-new" : ""}`}><summary>{title}<ChevronDown size={16} /></summary><div className="admin-edit-body">{children}</div></details>;
}

function MemberFields({ member, labels, locale }: { member?: FederationMember; labels: typeof ui.ky | typeof ui.ru; locale: Locale }) {
  return <div className="admin-form-grid">
    <Field name="name" label={labels.name} value={member?.name} />
    <Field name="sortOrder" label="#" type="number" value={member?.sortOrder ?? 0} />
    <Pair field="role" label={labels.role} ky={member?.roleKy} ru={member?.roleRu} />
    <label className="admin-field">{labels.kind}<select name="kind" required defaultValue={member?.kind ?? "board"}>
      <option value="leader">{labels.kindLeader}</option>
      <option value="board">{labels.kindBoard}</option>
      <option value="regional">{labels.kindRegional}</option>
    </select></label>
    <label className="admin-field">{labels.region}<select name="region" defaultValue={member?.region ?? ""}>
      <option value="">{labels.noRegion}</option>
      {kgRegions.map((region) => <option value={region.id} key={region.id}>{locale === "ky" ? region.nameKy : region.nameRu}</option>)}
    </select></label>
    <Field name="photoUrl" label={labels.photo} value={member?.photoUrl} required={false} />
    <Field name="phone" label={labels.memberPhone} value={member?.phone} required={false} />
    <Pair field="bio" label={labels.memberBio} ky={member?.bioKy} ru={member?.bioRu} multiline required={false} />
  </div>;
}

function datetimeLocal(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function AdminWorkspace({ locale, username, tab, saved, error, preview, data }: AdminWorkspaceProps) {
  const labels = ui[locale];
  const unread = data.inquiries.filter((inquiry) => !inquiry.handled).length;
  const tabHref = (id: AdminTab, lang: Locale = locale) => `/admin?lang=${lang}${id === "overview" ? "" : `&tab=${id}`}`;
  const nav: [AdminTab, string, LucideIcon, number?][] = [
    ["overview", labels.overview, FolderOpen],
    ["settings", labels.settings, Settings2],
    ["news", labels.news, Newspaper, data.articles.length],
    ["tournaments", labels.tournaments, CalendarDays, data.tournaments.length],
    ["players", labels.players, UsersRound, data.players.length],
    ["media", labels.media, Images, data.mediaItems.length],
    ["rules", labels.rules, FileText, data.rules.length],
    ["horses", labels.horses, Tag, data.horses.length],
    ["federation", labels.federation, Landmark, data.members.length],
    ["inquiries", labels.inquiries, Mail, data.inquiries.length],
  ];
  const titles: Record<AdminTab, string> = {
    overview: labels.dashboard, settings: labels.settingsTitle, news: labels.news, tournaments: labels.schedule,
    players: labels.players, media: labels.media, rules: labels.rulesSection, horses: labels.horses, federation: labels.federation, inquiries: labels.inquiries,
  };

  return (
    <main className="admin-app">
      <LocaleSync locale={locale} />
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">AU</span>
          <span><strong>{data.settings.brandName}</strong><small>{labels.panel}</small></span>
        </div>
        <nav className="admin-nav">
          {nav.map(([id, label, Icon, count]) => (
            <Link key={id} href={tabHref(id)} className={id === tab ? "is-active" : undefined} aria-current={id === tab ? "page" : undefined}>
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
              {id === "inquiries" && unread > 0 ? <i>{unread}</i> : count !== undefined && <small>{count}</small>}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="admin-user"><ShieldCheck size={16} aria-hidden="true" /><span><small>{labels.account}</small><strong>{username}</strong></span></span>
          <form action={logoutAction}><button className="admin-logout" type="submit" title={labels.logout} aria-label={labels.logout}><LogOut size={16} /></button></form>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title"><span className="admin-breadcrumb">{labels.panel}</span><h1>{titles[tab]}</h1></div>
          <div className="admin-top-actions">
            {saved && <p className="admin-toast" key={saved} role="status"><Check size={15} />{labels.saved}</p>}
            <Link className="language-switch" href={tabHref(tab, locale === "ky" ? "ru" : "ky")}>{locale === "ky" ? "RU" : "КЫР"}</Link>
            <AdminPreviewToggle label={labels.preview} />
          </div>
        </header>

        <div className="admin-content">
          {error === "category-used" && <p className="admin-flash admin-flash-error">{labels.categoryError}</p>}

          {tab === "overview" && <>
            <section className="admin-welcome">
              <p className="eyebrow">{labels.welcome}, {username}</p>
              <h2>{labels.dashboard}</h2>
              <p>{labels.demo}</p>
            </section>
            <div className="admin-metrics">
              {nav.filter(([, , , count]) => count !== undefined).map(([id, label, Icon, count]) => (
                <Link className="admin-metric" key={id} href={tabHref(id)}>
                  <Icon size={18} aria-hidden="true" />
                  <strong>{count}</strong>
                  <span>{label}</span>
                  {id === "inquiries" && unread > 0 && <i>{unread}</i>}
                </Link>
              ))}
            </div>
          </>}

          {tab === "settings" && <section className="admin-section">
            <form action={saveSettingsAction} className="admin-form">
              <input type="hidden" name="locale" value={locale} />
              <div className="admin-form-grid">
                <Field name="brandName" label={labels.siteName} value={data.settings.brandName} />
                <Field name="heroImageUrl" label={labels.image} value={data.settings.heroImageUrl} />
                <Pair field="heroTitle" label={labels.heroTitle} ky={data.settings.heroTitleKy} ru={data.settings.heroTitleRu} multiline rows={2} />
                <Pair field="heroText" label={labels.heroText} ky={data.settings.heroTextKy} ru={data.settings.heroTextRu} multiline />
                <Pair field="aboutTitle" label={labels.aboutTitle} ky={data.settings.aboutTitleKy} ru={data.settings.aboutTitleRu} />
                <Pair field="aboutText" label={labels.aboutText} ky={data.settings.aboutTextKy} ru={data.settings.aboutTextRu} multiline />
                <Pair field="calendarTitle" label={labels.tournaments} ky={data.settings.calendarTitleKy} ru={data.settings.calendarTitleRu} />
                <Pair field="teamTitle" label={labels.playersTitle} ky={data.settings.teamTitleKy} ru={data.settings.teamTitleRu} />
                <Pair field="newsTitle" label={labels.news} ky={data.settings.newsTitleKy} ru={data.settings.newsTitleRu} />
                <Pair field="rulesTitle" label={labels.rulesSection} ky={data.settings.rulesTitleKy} ru={data.settings.rulesTitleRu} />
                <Pair field="horsesTitle" label={labels.horses} ky={data.settings.horsesTitleKy} ru={data.settings.horsesTitleRu} />
              </div>
              <h3 className="admin-subheading">{labels.contact}</h3>
              <div className="admin-form-grid admin-form-grid-three">
                <Field name="contactPhone" label={labels.phone} value={data.settings.contactPhone} />
                <Field name="contactEmail" label={labels.email} value={data.settings.contactEmail} type="email" />
                <Field name="socialUrl" label={labels.social} value={data.settings.socialUrl} required={false} />
                <Pair field="address" label={labels.address} ky={data.settings.addressKy} ru={data.settings.addressRu} />
              </div>
              <div className="admin-form-actions"><button className="admin-save" type="submit"><Save size={15} />{labels.save}</button></div>
            </form>
          </section>}

          {tab === "news" && <section className="admin-section">
            <EditDetails title={`+ ${labels.newItem}`} isNew>
              <form action={saveNewsAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} />
                <div className="admin-form-grid">
                  <Pair field="title" label={labels.title} />
                  <Field name="imageUrl" label={labels.image} />
                  <Pair field="excerpt" label={labels.excerpt} multiline />
                  <Pair field="body" label={labels.body} multiline rows={5} />
                </div>
                <PublishToggle label={labels.published} />
                <FormButtons save={labels.save} isNew labels={labels} />
              </form>
            </EditDetails>
            {data.articles.map((article) => <EditDetails key={article.id} title={article.titleKy}>
              <form action={saveNewsAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={article.id} />
                <div className="admin-form-grid">
                  <Pair field="title" label={labels.title} ky={article.titleKy} ru={article.titleRu} />
                  <Field name="imageUrl" label={labels.image} value={article.imageUrl} />
                  <Pair field="excerpt" label={labels.excerpt} ky={article.excerptKy} ru={article.excerptRu} multiline />
                  <Pair field="body" label={labels.body} ky={article.bodyKy} ru={article.bodyRu} multiline rows={5} />
                </div>
                <PublishToggle label={labels.published} checked={article.published} />
                <FormButtons save={labels.save} isNew={false} action={deleteNewsAction} id={article.id} labels={labels} />
              </form>
            </EditDetails>)}
          </section>}

          {tab === "tournaments" && <section className="admin-section">
            <EditDetails title={`+ ${labels.newItem}`} isNew>
              <form action={saveTournamentAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} />
                <div className="admin-form-grid">
                  <Pair field="title" label={labels.title} />
                  <Pair field="location" label={labels.place} />
                  <Field name="startsAt" label={labels.starts} type="datetime-local" />
                  <Field name="endsAt" label={labels.ends} type="datetime-local" />
                  <Pair field="resultSummary" label={labels.results} required={false} multiline />
                </div>
                <PublishToggle label={labels.published} />
                <FormButtons save={labels.save} isNew labels={labels} />
              </form>
            </EditDetails>
            {data.tournaments.map((tournament) => <EditDetails key={tournament.id} title={tournament.titleKy}>
              <form action={saveTournamentAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={tournament.id} />
                <div className="admin-form-grid">
                  <Pair field="title" label={labels.title} ky={tournament.titleKy} ru={tournament.titleRu} />
                  <Pair field="location" label={labels.place} ky={tournament.locationKy} ru={tournament.locationRu} />
                  <Field name="startsAt" label={labels.starts} type="datetime-local" value={datetimeLocal(tournament.startsAt)} />
                  <Field name="endsAt" label={labels.ends} type="datetime-local" value={datetimeLocal(tournament.endsAt)} />
                  <Pair field="resultSummary" label={labels.results} ky={tournament.resultSummaryKy} ru={tournament.resultSummaryRu} required={false} multiline />
                </div>
                <PublishToggle label={labels.published} checked={tournament.published} />
                <FormButtons save={labels.save} isNew={false} action={deleteTournamentAction} id={tournament.id} labels={labels} />
              </form>
            </EditDetails>)}
          </section>}

          {tab === "players" && <section className="admin-section">
            <EditDetails title={`+ ${labels.newItem}`} isNew>
              <form action={savePlayerAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} />
                <div className="admin-form-grid">
                  <Field name="name" label={labels.name} />
                  <Field name="number" label={labels.number} type="number" required={false} />
                  <Pair field="position" label={labels.position} />
                  <Pair field="club" label={labels.club} required={false} />
                  <Pair field="city" label={labels.city} required={false} />
                  <Field name="birthYear" label={labels.birthYear} type="number" required={false} />
                  <Pair field="achievements" label={labels.achievements} multiline required={false} />
                  <Pair field="bio" label={labels.biography} multiline required={false} />
                  <Field name="imageUrl" label={labels.image} required={false} />
                </div>
                <PublishToggle label={labels.published} />
                <FormButtons save={labels.save} isNew labels={labels} />
              </form>
            </EditDetails>
            {data.players.map((player) => <EditDetails key={player.id} title={`${player.number !== null ? `${player.number} · ` : ""}${player.name}`}>
              <form action={savePlayerAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={player.id} />
                <div className="admin-form-grid">
                  <Field name="name" label={labels.name} value={player.name} />
                  <Field name="number" label={labels.number} type="number" value={player.number ?? ""} required={false} />
                  <Pair field="position" label={labels.position} ky={player.positionKy} ru={player.positionRu} />
                  <Pair field="club" label={labels.club} ky={player.clubKy} ru={player.clubRu} required={false} />
                  <Pair field="city" label={labels.city} ky={player.cityKy} ru={player.cityRu} required={false} />
                  <Field name="birthYear" label={labels.birthYear} type="number" value={player.birthYear ?? ""} required={false} />
                  <Pair field="achievements" label={labels.achievements} ky={player.achievementsKy} ru={player.achievementsRu} multiline required={false} />
                  <Pair field="bio" label={labels.biography} ky={player.bioKy} ru={player.bioRu} multiline required={false} />
                  <Field name="imageUrl" label={labels.image} value={player.imageUrl} required={false} />
                </div>
                <PublishToggle label={labels.published} checked={player.published} />
                <FormButtons save={labels.save} isNew={false} action={deletePlayerAction} id={player.id} labels={labels} />
              </form>
            </EditDetails>)}
            {!data.players.length && <p className="admin-empty-note">{labels.empty}</p>}
          </section>}

          {tab === "media" && <section className="admin-section">
            {!data.mediaItems.length && <p className="admin-empty-note">{labels.mediaHint}</p>}
            <EditDetails title={`+ ${labels.newItem}`} isNew>
              <form action={saveMediaAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} />
                <MediaFields labels={labels} locale={locale} nextOrder={data.mediaItems.length + 1} />
                <PublishToggle label={labels.published} /><FormButtons save={labels.save} isNew labels={labels} />
              </form>
            </EditDetails>
            {data.mediaItems.map((item) => <EditDetails key={item.id} title={`${item.sortOrder} · ${locale === "ky" ? item.captionKy : item.captionRu}`}>
              <form action={saveMediaAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={item.id} />
                <MediaFields item={item} labels={labels} locale={locale} nextOrder={item.sortOrder} />
                <PublishToggle label={labels.published} checked={item.published} /><FormButtons save={labels.save} isNew={false} action={deleteMediaAction} id={item.id} labels={labels} />
              </form>
            </EditDetails>)}
          </section>}

          {tab === "rules" && <section className="admin-section">
            <EditDetails title={`+ ${labels.newItem}`} isNew>
              <form action={saveRuleAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} />
                <div className="admin-form-grid"><Pair field="title" label={labels.title} /><Field name="sortOrder" label="#" type="number" value={data.rules.length + 1} /><label className="admin-field">{labels.symbol}<select name="symbol" defaultValue={""}>{symbolOptions.map(([key, ky, ru]) => <option key={key} value={key}>{locale === "ky" ? ky : ru}</option>)}</select></label><Pair field="body" label={labels.body} multiline rows={4} /></div>
                <PublishToggle label={labels.published} /><FormButtons save={labels.save} isNew labels={labels} />
              </form>
            </EditDetails>
            {data.rules.map((rule) => <EditDetails key={rule.id} title={rule.titleKy}>
              <form action={saveRuleAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={rule.id} />
                <div className="admin-form-grid"><Pair field="title" label={labels.title} ky={rule.titleKy} ru={rule.titleRu} /><Field name="sortOrder" label="#" type="number" value={rule.sortOrder} /><label className="admin-field">{labels.symbol}<select name="symbol" defaultValue={rule.symbol}>{symbolOptions.map(([key, ky, ru]) => <option key={key} value={key}>{locale === "ky" ? ky : ru}</option>)}</select></label><Pair field="body" label={labels.body} ky={rule.bodyKy} ru={rule.bodyRu} multiline rows={4} /></div>
                <PublishToggle label={labels.published} checked={rule.published} /><FormButtons save={labels.save} isNew={false} action={deleteRuleAction} id={rule.id} labels={labels} />
              </form>
            </EditDetails>)}
          </section>}

          {tab === "horses" && <section className="admin-section">
            <h3 className="admin-subheading">{labels.categories} <span>{data.categories.length}</span></h3>
            <EditDetails title={`+ ${labels.newItem}`} isNew>
              <form action={saveCategoryAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} />
                <div className="admin-form-grid"><Pair field="name" label={labels.category} /><Field name="sortOrder" label="#" type="number" value={data.categories.length + 1} /></div>
                <PublishToggle label={labels.active} checked /><FormButtons save={labels.save} isNew labels={labels} />
              </form>
            </EditDetails>
            {data.categories.map((category) => <EditDetails key={category.id} title={category.nameKy}>
              <form action={saveCategoryAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={category.id} />
                <div className="admin-form-grid"><Pair field="name" label={labels.category} ky={category.nameKy} ru={category.nameRu} /><Field name="sortOrder" label="#" type="number" value={category.sortOrder} /></div>
                <PublishToggle label={labels.active} checked={category.active} /><FormButtons save={labels.save} isNew={false} action={deleteCategoryAction} id={category.id} labels={labels} />
              </form>
            </EditDetails>)}

            <h3 className="admin-subheading admin-subheading-spaced">{labels.listings} <span>{data.horses.length}</span></h3>
            {data.categories.some((category) => category.active) ? <>
              <EditDetails title={`+ ${labels.newItem}`} isNew>
                <form action={saveHorseAction} className="admin-form">
                  <input type="hidden" name="locale" value={locale} />
                  <div className="admin-form-grid">
                    <Pair field="name" label={labels.name} /><Pair field="age" label={labels.age} />
                    <Pair field="location" label={labels.location} /><Pair field="description" label={labels.description} multiline />
                    <Field name="price" label={labels.price} type="number" required={false} />
                    <Field name="sellerName" label={labels.sellerName} required={false} />
                    <Field name="sellerPhone" label={labels.sellerPhone} type="tel" required={false} />
                    <Field name="imageUrl" label={labels.image} />
                    <label className="admin-field">{labels.category}<select name="categoryId" required defaultValue=""><option value="" disabled>—</option>{data.categories.filter((category) => category.active).map((category) => <option value={category.id} key={category.id}>{category.nameKy} / {category.nameRu}</option>)}</select></label>
                  </div>
                  <PublishToggle label={labels.published} /><FormButtons save={labels.save} isNew labels={labels} />
                </form>
              </EditDetails>
              {data.horses.map((horse) => <EditDetails key={horse.id} title={horse.nameKy}>
                <form action={saveHorseAction} className="admin-form">
                  <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={horse.id} />
                  <div className="admin-form-grid">
                    <Pair field="name" label={labels.name} ky={horse.nameKy} ru={horse.nameRu} /><Pair field="age" label={labels.age} ky={horse.ageKy} ru={horse.ageRu} />
                    <Pair field="location" label={labels.location} ky={horse.locationKy} ru={horse.locationRu} /><Pair field="description" label={labels.description} ky={horse.descriptionKy} ru={horse.descriptionRu} multiline />
                    <Field name="price" label={labels.price} type="number" value={horse.price ?? ""} required={false} />
                    <Field name="sellerName" label={labels.sellerName} value={horse.sellerName} required={false} />
                    <Field name="sellerPhone" label={labels.sellerPhone} type="tel" value={horse.sellerPhone} required={false} />
                    <Field name="imageUrl" label={labels.image} value={horse.imageUrl} />
                    <label className="admin-field">{labels.category}<select name="categoryId" required defaultValue={horse.categoryId}>{data.categories.map((category) => <option value={category.id} key={category.id}>{category.nameKy} / {category.nameRu}</option>)}</select></label>
                  </div>
                  <PublishToggle label={labels.published} checked={horse.published} /><FormButtons save={labels.save} isNew={false} action={deleteHorseAction} id={horse.id} labels={labels} />
                </form>
              </EditDetails>)}
            </> : <p className="admin-empty-note">{labels.empty}</p>}
          </section>}

          {tab === "federation" && <section className="admin-section">
            <h3 className="admin-subheading">{labels.members} <span>{data.members.length}</span></h3>
            <EditDetails title={`+ ${labels.newItem}`} isNew>
              <form action={saveMemberAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} />
                <MemberFields labels={labels} locale={locale} />
                <PublishToggle label={labels.published} /><FormButtons save={labels.save} isNew labels={labels} />
              </form>
            </EditDetails>
            {data.members.map((member) => <EditDetails key={member.id} title={`${member.name} · ${locale === "ky" ? member.roleKy : member.roleRu}`}>
              <form action={saveMemberAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={member.id} />
                <MemberFields member={member} labels={labels} locale={locale} />
                <PublishToggle label={labels.published} checked={member.published} /><FormButtons save={labels.save} isNew={false} action={deleteMemberAction} id={member.id} labels={labels} />
              </form>
            </EditDetails>)}

            <h3 className="admin-subheading admin-subheading-spaced">{labels.gallery} <span>{data.aboutPhotos.length}</span></h3>
            <EditDetails title={`+ ${labels.newItem}`} isNew>
              <form action={saveAboutPhotoAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} />
                <div className="admin-form-grid"><Field name="imageUrl" label={labels.image} /><Field name="sortOrder" label="#" type="number" value={data.aboutPhotos.length + 1} /><Pair field="caption" label={labels.caption} /></div>
                <PublishToggle label={labels.published} /><FormButtons save={labels.save} isNew labels={labels} />
              </form>
            </EditDetails>
            {data.aboutPhotos.map((photo) => <EditDetails key={photo.id} title={locale === "ky" ? photo.captionKy : photo.captionRu}>
              <form action={saveAboutPhotoAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={photo.id} />
                <div className="admin-form-grid"><Field name="imageUrl" label={labels.image} value={photo.imageUrl} /><Field name="sortOrder" label="#" type="number" value={photo.sortOrder} /><Pair field="caption" label={labels.caption} ky={photo.captionKy} ru={photo.captionRu} /></div>
                <PublishToggle label={labels.published} checked={photo.published} /><FormButtons save={labels.save} isNew={false} action={deleteAboutPhotoAction} id={photo.id} labels={labels} />
              </form>
            </EditDetails>)}

            <h3 className="admin-subheading admin-subheading-spaced">{labels.history} <span>{data.milestones.length}</span></h3>
            <EditDetails title={`+ ${labels.newItem}`} isNew>
              <form action={saveMilestoneAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} />
                <div className="admin-form-grid"><Field name="year" label={labels.year} type="number" /><Pair field="title" label={labels.title} /><Pair field="text" label={labels.milestoneText} multiline required={false} /></div>
                <PublishToggle label={labels.published} /><FormButtons save={labels.save} isNew labels={labels} />
              </form>
            </EditDetails>
            {data.milestones.map((milestone) => <EditDetails key={milestone.id} title={`${milestone.year} · ${locale === "ky" ? milestone.titleKy : milestone.titleRu}`}>
              <form action={saveMilestoneAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={milestone.id} />
                <div className="admin-form-grid"><Field name="year" label={labels.year} type="number" value={milestone.year} /><Pair field="title" label={labels.title} ky={milestone.titleKy} ru={milestone.titleRu} /><Pair field="text" label={labels.milestoneText} ky={milestone.textKy} ru={milestone.textRu} multiline required={false} /></div>
                <PublishToggle label={labels.published} checked={milestone.published} /><FormButtons save={labels.save} isNew={false} action={deleteMilestoneAction} id={milestone.id} labels={labels} />
              </form>
            </EditDetails>)}
          </section>}

          {tab === "inquiries" && <section className="admin-section">
            {data.inquiries.length ? data.inquiries.map((inquiry) => <article className={`inquiry-item${inquiry.handled ? " is-handled" : ""}`} key={inquiry.id}>
              <div className="inquiry-heading"><div><span>{inquiry.handled ? labels.handled : labels.unread}</span><h3>{inquiry.name}</h3></div><time>{new Intl.DateTimeFormat(locale === "ky" ? "ky-KG" : "ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(inquiry.createdAt)}</time></div>
              <div className="inquiry-contact"><a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>{inquiry.email && <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>}</div>
              <p>{inquiry.message}</p>
              <form action={markInquiryHandledAction} className="inquiry-status-form"><input type="hidden" name="id" value={inquiry.id} /><input type="hidden" name="locale" value={locale} /><label><input type="checkbox" name="handled" defaultChecked={inquiry.handled} />{inquiry.handled ? labels.markNew : labels.markHandled}</label><button className="admin-save" type="submit"><Save size={14} />{labels.save}</button></form>
            </article>) : <p className="admin-empty-note">{labels.empty}</p>}
          </section>}
        </div>
      </div>

      <AdminPreview
        src={`/${locale}${previewPaths[tab]}`}
        refreshKey={saved}
        initial={preview}
        labels={{
          title: labels.preview, hide: labels.previewHide, reload: labels.previewReload, back: labels.previewBack,
          desktop: labels.previewDesktop, phone: labels.previewPhone, open: labels.previewOpen, drag: labels.previewDrag,
        }}
      />
    </main>
  );
}
