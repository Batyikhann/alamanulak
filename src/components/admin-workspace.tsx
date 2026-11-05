import Link from "next/link";
import {
  Check,
  ChevronDown,
  LogOut,
  Save,
  KeyRound,
  Trash2,
} from "lucide-react";
import type {
  AboutPhoto,
  FederationMember,
  HistoryMilestone,
  MediaItem,
  HorseCategory,
  HorseListing,
  NewsArticle,
  Player,
  PlayerCard,
  RuleSection,
  SiteSettings,
  Tournament,
} from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import AdminNavScroll from "@/components/admin-nav-scroll";
import { ImageBatch, ImageField, ImageList, type BatchLabels, type ImageLabels } from "@/components/admin-image-field";
import AdminLangHelper from "@/components/admin-lang-helper";
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
  deletePlayerCardAction,
  deleteRuleAction,
  deleteTournamentAction,
  logoutAction,
  saveAdminCredentialsAction,
  saveAboutPhotoAction,
  saveAboutPhotoBatchAction,
  saveCategoryAction,
  saveHorseAction,
  saveMediaAction,
  saveMediaBatchAction,
  saveMemberAction,
  saveMilestoneAction,
  saveNewsAction,
  savePlayerAction,
  savePlayerCardAction,
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
  data: {
    settings: SiteSettings;
    articles: NewsArticle[];
    tournaments: Tournament[];
    players: (Player & { card: PlayerCard | null })[];
    rules: RuleSection[];
    categories: HorseCategory[];
    horses: HorseWithCategory[];
    members: FederationMember[];
    aboutPhotos: AboutPhoto[];
    milestones: HistoryMilestone[];
    mediaItems: MediaItem[];
  };
};

export const adminTabs = ["settings", "news", "tournaments", "players", "media", "rules", "horses", "federation", "profile"] as const;
export type AdminTab = (typeof adminTabs)[number];

// Felt-panel symbols for rules (key matches components/rules-page.tsx).
const symbolOptions: [string, string, string][] = [
  ["", "Автоматтык", "Автоматически"], ["horn", "Кочкор мүйүз", "Бараньи рога"], ["rosette", "Төрт мүйүз", "Розетка"],
  ["tunduk", "Түндүк", "Тюндюк"], ["horse", "Ат башы", "Голова коня"], ["shyrdak", "Шырдак оюму", "Узор шырдака"], ["emblem", "Федерациянын белгиси", "Эмблема федерации"],
];

const mediaCategories: [string, string, string][] = [
  ["tournaments", "Турнирлер", "Турниры"], ["players", "Оюнчулар", "Игроки"], ["horses", "Жылкылар", "Лошади"], ["federation", "Федерация", "Федерация"],
];

// The upload boxes' texts in the admin's language.
const imageLabels = (labels: typeof ui.ky | typeof ui.ru): ImageLabels => ({
  choose: labels.imgChoose, replace: labels.imgReplace, remove: labels.imgRemove, drop: labels.imgDrop,
  uploading: labels.imgUploading, error: labels.imgError, empty: labels.imgEmpty, edit: labels.imgEdit, uploaded: labels.imgUploaded,
  editorTitle: labels.editorTitle, editorHint: labels.editorHint, zoom: labels.editorZoom, shape: labels.editorShape,
  original: labels.editorOriginal, useOriginal: labels.editorUseOriginal, apply: labels.editorApply, cancel: labels.editorCancel,
});
const batchLabels = (labels: typeof ui.ky | typeof ui.ru): BatchLabels => ({
  ...imageLabels(labels), title: labels.batchTitle, hint: labels.batchHint, captionKy: labels.batchCaptionKy, captionRu: labels.batchCaptionRu, saveAll: labels.batchSaveAll,
});

function MediaFields({ item, labels, locale, nextOrder }: { item?: MediaItem; labels: typeof ui.ky | typeof ui.ru; locale: Locale; nextOrder: number }) {
  return <div className="admin-form-grid">
    <ImageField name="imageUrl" label={labels.image} value={item?.imageUrl} labels={imageLabels(labels)} />
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
    profileNav: "Профиль",
    profileTitle: "Профиль жана кирүү",
    credentials: "Кирүү маалыматтары",
    credentialsNote: "Колдонуучу атын жана/же сырсөздү өзгөртүү үчүн учурдагы сырсөздү жазыңыз. Сырсөздү өзгөртпөсөңүз, жаңы сырсөз талааларын бош калтырыңыз. Сакталгандан кийин ушул түзмөктө кирген бойдон каласыз.",
    loginUsername: "Колдонуучу аты (кирүү үчүн)",
    currentPassword: "Учурдагы сырсөз",
    newPassword: "Жаңы сырсөз (кеминде 12 белги)",
    confirmPassword: "Жаңы сырсөздү кайталаңыз",
    saveCredentials: "Кирүү маалыматтарын жаңыртуу",
    wrongPassword: "Учурдагы сырсөз туура эмес. Эч нерсе өзгөргөн жок.",
    passwordMismatch: "Жаңы сырсөздөр дал келбейт. Эч нерсе өзгөргөн жок.",
    backToSite: "Сайтка кайтуу",
    publicSite: "Сайтты көрүү",
    logout: "Чыгуу",
    saved: "Өзгөртүүлөр сакталды",
    categoryError: "Бул категорияда жарыялар бар. Адегенде жарыяларды башка категорияга өткөрүңүз.",
    invalidError: "Сакталган жок: эки тилдеги талааларды толтуруп, маалыматты текшериңиз (мисалы, аяктоо күнү башталышынан кийин болушу керек, шилтемелер https:// менен башталат).",
    settingsTitle: "Башкы бет жана байланыш",
    siteName: "Сайттын аталышы",
    heroTitle: "Башкы аталыш",
    heroText: "Башкы текст",
    aboutTitle: "Федерация бөлүмүнүн аталышы",
    aboutText: "Федерация жөнүндө",
    calendarText: "Турнирлер жөнүндө",
    band: "Башкы беттеги сүрөт тилкеси",
    bandNote: "Турнирлер менен оюнчулардын ортосундагы экрандын туурасына созулган сүрөт. Видео шилтемеси кошулса, тилкеде «Видеону көрүү» баскычы чыгат.",
    bandShown: "Башкы бетте көрсөтүү",
    bandTitle: "Тилкенин аталышы",
    bandText: "Кыска текст (кааласаңыз)",
    contact: "Байланыш маалыматы",
    image: "Сүрөт",
    imgChoose: "Сүрөт тандоо",
    imgReplace: "Башка сүрөт тандоо",
    imgRemove: "Алып салуу",
    imgDrop: "же сүрөттү бул жерге сүйрөп таштаңыз",
    imgUploading: "Жүктөлүүдө…",
    imgError: "Сүрөт жүктөлгөн жок. Башка файлды тандап көрүңүз.",
    imgEmpty: "Сүрөт тандала элек",
    imgEdit: "Сүрөттү ачып оңдоо",
    imgUploaded: "Жүктөлгөн сүрөт",
    editorTitle: "Сүрөттү оңдоо",
    editorHint: "Жылдыруу үчүн сүйрөңүз, чоңойтуу үчүн сыдырманы же чычканды колдонуңуз. Алкактын ичиндеги бөлүк сакталат.",
    editorZoom: "Чоңойтуу",
    editorShape: "Кесүү формасы",
    editorOriginal: "Түп нуска",
    editorUseOriginal: "Өзгөртпөй колдонуу",
    editorApply: "Колдонуу",
    editorCancel: "Жокко чыгаруу",
    batchTitle: "Бир же бир нече сүрөт жүктөө",
    batchHint: "Компьютерден же телефондон бир сүрөттү же бир нечесин бирден тандаңыз. Жазууларды азыр же кийин кошсоңуз болот.",
    batchCaptionKy: "Жазуу кыргызча (кааласаңыз)",
    batchCaptionRu: "Жазуу орусча (кааласаңыз)",
    batchSaveAll: "Баарын сактоо",
    social: "Социалдык тармактын шилтемеси",
    whatsapp: "WhatsApp номери, +996 менен (футер)",
    instagram: "Instagram шилтемеси (футер)",
    facebook: "Facebook шилтемеси (футер)",
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
    tournamentDetails: "Толук маалымат (турнирдин барагы)",
    excerpt: "Кыскача текст",
    place: "Өткөрүлүүчү жер",
    starts: "Башталышы",
    ends: "Аякташы",
    results: "Жыйынтык боюнча эскертүү (кааласаңыз, мисалы финалдын эсеби)",
    prizePlaces: "Байге орундары",
    prizeNote: "Байгени мелдешти жарыялаганда жазыңыз (сайтта алдыдагы мелдештин астында көрүнөт). Жеңген командаларды мелдеш бүткөндөн кийин жазыңыз. Баары милдеттүү эмес.",
    prize: "Байге (мисалы: 500 000 сом, автоунаа)",
    winnerTeam: "Жеңген команда",
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
    cards: "Карточка",
    cardNote: "Оюнчуда бир гана карточка болот. Экинчи сары карточка аны кызылга алмаштырат.",
    secondCard: "Экинчи сары карточка (кызылга айланат)",
    cardColor: "Карточка",
    cardYellow: "Сары",
    cardRed: "Кызыл",
    cardDate: "Берилген күнү",
    cardTournament: "Турнир",
    cardNoTournament: "Турнирсиз",
    cardReason: "Себеби",
    addCard: "Карточка кошуу",
    age: "Жашы",
    location: "Жайгашкан жери",
    price: "Баасы · сом",
    sellerName: "Сатуучунун аты (кааласаңыз)",
    sellerPhone: "Телефон",
    sellerContacts: "Сатуучунун байланыштары (аттын барагында көрүнөт, негизинен телефон жана WhatsApp)",
    sellerTelegram: "Telegram (@аты же шилтеме)",
    sellerInstagram: "Instagram (@аты же шилтеме)",
    horseVideo: "YouTube видео шилтемеси (федерациянын каналынан, аттын барагында көрсөтүлөт)",
    horsePhoto: "Негизги сүрөт (картада көрсөтүлөт)",
    horsePhotos: "Кошумча сүрөттөр (аттын барагында көрсөтүлөт)",
    category: "Категория",
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
    photo: "Сүрөт (кааласаңыз)",
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
  },
  ru: {
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
    profileNav: "Профиль",
    profileTitle: "Профиль и вход",
    credentials: "Данные для входа",
    credentialsNote: "Чтобы изменить имя пользователя и/или пароль, введите текущий пароль. Если пароль не меняете, оставьте поля нового пароля пустыми. После сохранения вы останетесь в системе на этом устройстве.",
    loginUsername: "Имя пользователя (для входа)",
    currentPassword: "Текущий пароль",
    newPassword: "Новый пароль (не меньше 12 символов)",
    confirmPassword: "Повторите новый пароль",
    saveCredentials: "Обновить данные для входа",
    wrongPassword: "Текущий пароль неверный. Ничего не изменено.",
    passwordMismatch: "Новые пароли не совпадают. Ничего не изменено.",
    backToSite: "Вернуться на сайт",
    publicSite: "Открыть сайт",
    logout: "Выйти",
    saved: "Изменения сохранены",
    categoryError: "В этой категории есть объявления. Сначала перенесите их в другую категорию.",
    invalidError: "Не сохранено: заполните поля на обоих языках и проверьте данные (например, дата окончания должна быть позже начала, ссылки начинаются с https://).",
    settingsTitle: "Главная и контакты",
    siteName: "Название сайта",
    heroTitle: "Главный заголовок",
    heroText: "Главный текст",
    aboutTitle: "Заголовок раздела о федерации",
    aboutText: "О федерации",
    calendarText: "О турнирах",
    band: "Фотополоса на главной",
    bandNote: "Фото во всю ширину экрана между турнирами и игроками. Если добавить ссылку на видео, на полосе появится кнопка «Смотреть видео».",
    bandShown: "Показывать на главной",
    bandTitle: "Заголовок полосы",
    bandText: "Короткий текст (по желанию)",
    contact: "Контактные данные",
    image: "Фото",
    imgChoose: "Выбрать фото",
    imgReplace: "Выбрать другое фото",
    imgRemove: "Убрать",
    imgDrop: "или перетащите фото сюда",
    imgUploading: "Загрузка…",
    imgError: "Не удалось загрузить фото. Попробуйте другой файл.",
    imgEmpty: "Фото не выбрано",
    imgEdit: "Открыть и изменить фото",
    imgUploaded: "Загруженное фото",
    editorTitle: "Редактирование фото",
    editorHint: "Перетащите, чтобы сдвинуть; увеличивайте ползунком или колёсиком мыши. Сохранится то, что внутри рамки.",
    editorZoom: "Масштаб",
    editorShape: "Форма обрезки",
    editorOriginal: "Оригинал",
    editorUseOriginal: "Без изменений",
    editorApply: "Применить",
    editorCancel: "Отмена",
    batchTitle: "Загрузить одно или несколько фото",
    batchHint: "Выберите одно или сразу несколько фото с компьютера или телефона. Подписи можно добавить сейчас или позже.",
    batchCaptionKy: "Подпись по-кыргызски (по желанию)",
    batchCaptionRu: "Подпись по-русски (по желанию)",
    batchSaveAll: "Сохранить все",
    social: "Ссылка на соцсеть",
    whatsapp: "Номер WhatsApp с +996 (футер)",
    instagram: "Ссылка на Instagram (футер)",
    facebook: "Ссылка на Facebook (футер)",
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
    tournamentDetails: "Подробная информация (страница турнира)",
    excerpt: "Короткий текст",
    place: "Место проведения",
    starts: "Начало",
    ends: "Окончание",
    results: "Примечание к результату (по желанию, например счёт финала)",
    prizePlaces: "Призовые места",
    prizeNote: "Призы укажите при объявлении турнира (на сайте они видны у предстоящего турнира). Команды-победители впишите после окончания. Всё по желанию.",
    prize: "Приз (например: 500 000 сом, автомобиль)",
    winnerTeam: "Команда-победитель",
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
    cards: "Карточка",
    cardNote: "У игрока может быть только одна карточка. Вторая жёлтая заменяет её на красную.",
    secondCard: "Вторая жёлтая карточка (станет красной)",
    cardColor: "Карточка",
    cardYellow: "Жёлтая",
    cardRed: "Красная",
    cardDate: "Дата",
    cardTournament: "Турнир",
    cardNoTournament: "Без турнира",
    cardReason: "Причина",
    addCard: "Добавить карточку",
    age: "Возраст",
    location: "Местонахождение",
    price: "Цена · сом",
    sellerName: "Имя продавца (по желанию)",
    sellerPhone: "Телефон",
    sellerContacts: "Контакты продавца (видны на странице лошади, прежде всего телефон и WhatsApp)",
    sellerTelegram: "Telegram (@имя или ссылка)",
    sellerInstagram: "Instagram (@имя или ссылка)",
    horseVideo: "Ссылка на видео YouTube (с канала федерации, на странице лошади)",
    horsePhoto: "Главное фото (на карточке)",
    horsePhotos: "Дополнительные фото (на странице лошади)",
    category: "Категория",
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
    photo: "Фото (по желанию)",
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

// A bilingual field: one input with a small KY | RU switch beside its label. Both languages stay in the
// form and are saved; the switch only chooses which one is shown. A red dot marks a language still empty
// (required, or filled in the other language), and AdminLangHelper switches to it if the form is sent without it.
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
  const control = (lang: "Ky" | "Ru", value = "") => multiline
    ? <textarea name={`${field}${lang}`} defaultValue={value} required={required} rows={rows} placeholder=" " />
    : <input name={`${field}${lang}`} defaultValue={value} required={required} placeholder=" " />;
  return <div className={`admin-pair${multiline ? " is-multiline" : ""}`}>
    <div className="admin-pair-head">
      <span>{label}</span>
      <span className="admin-lang-switch">
        <label className="is-ky"><input type="radio" name={`_lang_${field}`} value="ky" defaultChecked />KY</label>
        <label className="is-ru"><input type="radio" name={`_lang_${field}`} value="ru" />RU</label>
      </span>
    </div>
    <label className="admin-field admin-pair-field" data-lang="ky"><span className="sr-only">{label} · KY</span>{control("Ky", ky)}</label>
    <label className="admin-field admin-pair-field" data-lang="ru"><span className="sr-only">{label} · RU</span>{control("Ru", ru)}</label>
  </div>;
}

function PublishToggle({ label, checked = false, name = "published" }: { label: string; checked?: boolean; name?: string }) {
  return <label className="publish-toggle"><input type="checkbox" name={name} defaultChecked={checked} /><span><Check size={13} /></span>{label}</label>;
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

// The fields of a player's yellow or red card: colour, date, the tournament (optional) and the reason (optional).
// `fixedColor` leaves the colour out (the form sends it itself).
function PlayerCardFields({ card, tournaments, labels, locale, fixedColor = false }: { card?: PlayerCard; tournaments: Tournament[]; labels: typeof ui.ky | typeof ui.ru; locale: Locale; fixedColor?: boolean }) {
  return <div className="admin-form-grid admin-form-grid-three">
    {!fixedColor && <label className="admin-field">{labels.cardColor}<select name="color" required defaultValue={card?.color ?? "yellow"}>
      <option value="yellow">{labels.cardYellow}</option>
      <option value="red">{labels.cardRed}</option>
    </select></label>}
    <Field name="date" label={labels.cardDate} type="date" value={card ? card.date.toISOString().slice(0, 10) : ""} />
    <label className="admin-field">{labels.cardTournament}<select name="tournamentId" defaultValue={card?.tournamentId ?? ""}>
      <option value="">{labels.cardNoTournament}</option>
      {tournaments.map((tournament) => <option key={tournament.id} value={tournament.id}>{locale === "ky" ? tournament.titleKy : tournament.titleRu} · {tournament.startsAt.toISOString().slice(0, 10)}</option>)}
    </select></label>
    <Pair field="reason" label={labels.cardReason} ky={card?.reasonKy} ru={card?.reasonRu} required={false} />
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
    <ImageField name="photoUrl" label={labels.photo} value={member?.photoUrl} required={false} aspect="1:1" labels={imageLabels(labels)} />
    <Field name="phone" label={labels.memberPhone} value={member?.phone} required={false} />
    <Pair field="bio" label={labels.memberBio} ky={member?.bioKy} ru={member?.bioRu} multiline required={false} />
  </div>;
}

// A bazaar listing: the horse, its YouTube video (the photo is only used until there is one), and the seller's
// contact options shown behind the "contact" button over the video.
function HorseFields({ horse, categories, labels }: { horse?: HorseListing; categories: HorseCategory[]; labels: typeof ui.ky | typeof ui.ru }) {
  return <>
    <div className="admin-form-grid">
      <Pair field="name" label={labels.name} ky={horse?.nameKy} ru={horse?.nameRu} /><Pair field="age" label={labels.age} ky={horse?.ageKy} ru={horse?.ageRu} />
      <Pair field="location" label={labels.location} ky={horse?.locationKy} ru={horse?.locationRu} /><Pair field="description" label={labels.description} ky={horse?.descriptionKy} ru={horse?.descriptionRu} multiline />
      <Field name="videoUrl" label={labels.horseVideo} type="url" value={horse?.videoUrl} required={false} />
      <Field name="price" label={labels.price} type="number" value={horse?.price ?? ""} required={false} />
      <ImageField name="imageUrl" label={labels.horsePhoto} value={horse?.imageUrl} required={false} aspect="16:9" labels={imageLabels(labels)} />
      <ImageList name="photoUrls" label={labels.horsePhotos} values={horse?.photoUrls} labels={imageLabels(labels)} />
      <label className="admin-field">{labels.category}<select name="categoryId" required defaultValue={horse?.categoryId ?? ""}>
        {!horse && <option value="" disabled>—</option>}
        {categories.map((category) => <option value={category.id} key={category.id}>{category.nameKy} / {category.nameRu}</option>)}
      </select></label>
    </div>
    <h3 className="admin-subheading">{labels.sellerContacts}</h3>
    <div className="admin-form-grid admin-form-grid-three">
      <Field name="sellerName" label={labels.sellerName} value={horse?.sellerName} required={false} />
      <Field name="sellerPhone" label={labels.sellerPhone} type="tel" value={horse?.sellerPhone} required={false} />
      <Field name="sellerWhatsapp" label="WhatsApp" type="tel" value={horse?.sellerWhatsapp} required={false} />
      <Field name="sellerTelegram" label={labels.sellerTelegram} value={horse?.sellerTelegram} required={false} />
      <Field name="sellerInstagram" label={labels.sellerInstagram} value={horse?.sellerInstagram} required={false} />
    </div>
  </>;
}

// A tournament's three prize places: the prize on offer (filled in when announcing) and the winning team
// (filled in after it ends). All optional; each in both languages.
function PrizeFields({ tournament, labels }: { tournament?: Tournament; labels: typeof ui.ky | typeof ui.ru }) {
  return <>
    <h3 className="admin-subheading">{labels.prizePlaces}</h3>
    <p className="admin-form-note">{labels.prizeNote}</p>
    {([1, 2, 3] as const).map((place) => (
      <div className="admin-prize-place" key={place}>
        <span className={`admin-prize-medal is-${place}`}>{place}</span>
        <div className="admin-form-grid">
          <Pair field={`prize${place}`} label={labels.prize} ky={tournament?.[`prize${place}Ky`]} ru={tournament?.[`prize${place}Ru`]} required={false} />
          <Pair field={`winner${place}`} label={labels.winnerTeam} ky={tournament?.[`winner${place}Ky`]} ru={tournament?.[`winner${place}Ru`]} required={false} />
        </div>
      </div>
    ))}
  </>;
}

function datetimeLocal(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function AdminWorkspace({ locale, username, tab, saved, error, data }: AdminWorkspaceProps) {
  const labels = ui[locale];
  const tabHref = (id: AdminTab, lang: Locale = locale) => `/admin/settings?lang=${lang}${id === "settings" ? "" : `&tab=${id}`}`;
  // Same order as the public site's top navigation (the home page settings stand where "Home" is).
  const nav: [AdminTab, string][] = [
    ["settings", labels.settings],
    ["federation", labels.federation],
    ["tournaments", labels.tournaments],
    ["players", labels.players],
    ["news", labels.news],
    ["media", labels.media],
    ["rules", labels.rules],
    ["horses", labels.horses],
    ["profile", labels.profileNav],
  ];
  const titles: Record<AdminTab, string> = {
    profile: labels.profileTitle, settings: labels.settingsTitle, news: labels.news, tournaments: labels.schedule,
    players: labels.players, media: labels.media, rules: labels.rulesSection, horses: labels.horses, federation: labels.federation,
  };

  return (
    <main className="admin-app">
      <LocaleSync locale={locale} />
      <AdminLangHelper />
      <AdminNavScroll tab={tab} />
      <header className="admin-header">
        <nav className="admin-nav">
          {nav.map(([id, label]) => (
            <Link key={id} href={tabHref(id)} className={id === tab ? "is-active" : undefined} aria-current={id === tab ? "page" : undefined}>{label}</Link>
          ))}
          <span className="admin-nav-divider" aria-hidden="true" />
          <a href={`/${locale}`}>{labels.backToSite}</a>
        </nav>
        {saved && <p className="admin-toast" key={saved} role="status"><Check size={15} />{labels.saved}</p>}
      </header>

      <div className="admin-main">
        <div className="admin-content">
          <h1 className="admin-page-title">{titles[tab]}</h1>
          {error === "category-used" && <p className="admin-flash admin-flash-error">{labels.categoryError}</p>}
          {error === "invalid" && <p className="admin-flash admin-flash-error">{labels.invalidError}</p>}
          {error === "wrong-password" && <p className="admin-flash admin-flash-error">{labels.wrongPassword}</p>}
          {error === "password-mismatch" && <p className="admin-flash admin-flash-error">{labels.passwordMismatch}</p>}

          {tab === "profile" && <section className="admin-section">
            {/* Sign-in username and password: confirmed with the current password */}
            <form action={saveAdminCredentialsAction} className="admin-form" autoComplete="off">
              <input type="hidden" name="locale" value={locale} />
              <h3 className="admin-subheading">{labels.credentials}</h3>
              <p className="admin-form-note">{labels.credentialsNote}</p>
              <div className="admin-form-grid">
                <label className="admin-field">{labels.loginUsername}<input name="username" defaultValue={username} autoComplete="username" minLength={3} maxLength={40} required /></label>
                <label className="admin-field">{labels.currentPassword}<input name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required /></label>
                <label className="admin-field">{labels.newPassword}<input name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} /></label>
                <label className="admin-field">{labels.confirmPassword}<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} /></label>
              </div>
              <div className="admin-form-actions"><button className="admin-save" type="submit"><KeyRound size={15} />{labels.saveCredentials}</button></div>
            </form>
            <form action={logoutAction} className="admin-form">
              <input type="hidden" name="locale" value={locale} />
              <div className="admin-form-actions"><button className="admin-save" type="submit"><LogOut size={15} aria-hidden="true" />{labels.logout}</button></div>
            </form>
          </section>}

          {tab === "settings" && <section className="admin-section">
            <form action={saveSettingsAction} className="admin-form">
              <input type="hidden" name="locale" value={locale} />
              <div className="admin-form-grid">
                <Field name="brandName" label={labels.siteName} value={data.settings.brandName} />
                <ImageField name="heroImageUrl" label={labels.image} value={data.settings.heroImageUrl} labels={imageLabels(labels)} />
                <Pair field="heroTitle" label={labels.heroTitle} ky={data.settings.heroTitleKy} ru={data.settings.heroTitleRu} multiline rows={2} />
                <Pair field="heroText" label={labels.heroText} ky={data.settings.heroTextKy} ru={data.settings.heroTextRu} multiline />
                <Pair field="aboutTitle" label={labels.aboutTitle} ky={data.settings.aboutTitleKy} ru={data.settings.aboutTitleRu} />
                <Pair field="aboutText" label={labels.aboutText} ky={data.settings.aboutTextKy} ru={data.settings.aboutTextRu} multiline />
                <Pair field="calendarTitle" label={labels.tournaments} ky={data.settings.calendarTitleKy} ru={data.settings.calendarTitleRu} />
                <Pair field="calendarText" label={labels.calendarText} ky={data.settings.calendarTextKy} ru={data.settings.calendarTextRu} multiline />
                <Pair field="teamTitle" label={labels.playersTitle} ky={data.settings.teamTitleKy} ru={data.settings.teamTitleRu} />
                <Pair field="newsTitle" label={labels.news} ky={data.settings.newsTitleKy} ru={data.settings.newsTitleRu} />
                <Pair field="rulesTitle" label={labels.rulesSection} ky={data.settings.rulesTitleKy} ru={data.settings.rulesTitleRu} />
                <Pair field="horsesTitle" label={labels.horses} ky={data.settings.horsesTitleKy} ru={data.settings.horsesTitleRu} multiline rows={2} />
              </div>
              <h3 className="admin-subheading">{labels.band}</h3>
              <p className="admin-form-note">{labels.bandNote}</p>
              <PublishToggle name="bandShown" label={labels.bandShown} checked={data.settings.bandShown} />
              <div className="admin-form-grid">
                <ImageField name="bandImageUrl" label={labels.image} value={data.settings.bandImageUrl} aspect="16:9" labels={imageLabels(labels)} />
                <Field name="bandVideoUrl" label={labels.videoUrl} type="url" value={data.settings.bandVideoUrl} required={false} />
                <Pair field="bandTitle" label={labels.bandTitle} ky={data.settings.bandTitleKy} ru={data.settings.bandTitleRu} />
                <Pair field="bandText" label={labels.bandText} ky={data.settings.bandTextKy} ru={data.settings.bandTextRu} multiline rows={2} required={false} />
              </div>
              <h3 className="admin-subheading">{labels.contact}</h3>
              <div className="admin-form-grid admin-form-grid-three">
                <Field name="contactPhone" label={labels.phone} value={data.settings.contactPhone} />
                <Field name="contactEmail" label={labels.email} value={data.settings.contactEmail} type="email" />
                <Field name="socialUrl" label={labels.social} value={data.settings.socialUrl} required={false} />
                <Field name="whatsappNumber" label={labels.whatsapp} value={data.settings.whatsappNumber} type="tel" required={false} />
                <Field name="instagramUrl" label={labels.instagram} value={data.settings.instagramUrl} type="url" required={false} />
                <Field name="facebookUrl" label={labels.facebook} value={data.settings.facebookUrl} type="url" required={false} />
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
                  <ImageField name="imageUrl" label={labels.image} labels={imageLabels(labels)} />
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
                  <ImageField name="imageUrl" label={labels.image} value={article.imageUrl} labels={imageLabels(labels)} />
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
                  <ImageField name="imageUrl" label={labels.image} required={false} labels={imageLabels(labels)} />
                  <Pair field="description" label={labels.tournamentDetails} required={false} multiline rows={6} />
                  <Pair field="resultSummary" label={labels.results} required={false} multiline />
                </div>
                <PrizeFields labels={labels} />
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
                  <ImageField name="imageUrl" label={labels.image} value={tournament.imageUrl} required={false} labels={imageLabels(labels)} />
                  <Pair field="description" label={labels.tournamentDetails} ky={tournament.descriptionKy} ru={tournament.descriptionRu} required={false} multiline rows={6} />
                  <Pair field="resultSummary" label={labels.results} ky={tournament.resultSummaryKy} ru={tournament.resultSummaryRu} required={false} multiline />
                </div>
                <PrizeFields tournament={tournament} labels={labels} />
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
                  <ImageField name="imageUrl" label={labels.image} required={false} aspect="1:1" labels={imageLabels(labels)} />
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
                  <ImageField name="imageUrl" label={labels.image} value={player.imageUrl} required={false} aspect="1:1" labels={imageLabels(labels)} />
                </div>
                <PublishToggle label={labels.published} checked={player.published} />
                <FormButtons save={labels.save} isNew={false} action={deletePlayerAction} id={player.id} labels={labels} />
              </form>
              {/* One card per player: the card itself (editable), then a form for a new one. A new card on a
                  yellow turns it red; a red is already the last step, so only it is shown. */}
              <h3 className="admin-subheading">{labels.cards}</h3>
              <p className="admin-form-note">{labels.cardNote}</p>
              {player.card && <EditDetails title={`${player.card.color === "red" ? "🟥" : "🟨"} ${player.card.date.toISOString().slice(0, 10)}${player.card.reasonKy ? ` · ${locale === "ky" ? player.card.reasonKy : player.card.reasonRu}` : ""}`}>
                <form action={savePlayerCardAction} className="admin-form">
                  <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={player.card.id} /><input type="hidden" name="playerId" value={player.id} />
                  <PlayerCardFields card={player.card} tournaments={data.tournaments} labels={labels} locale={locale} />
                  <FormButtons save={labels.save} isNew={false} action={deletePlayerCardAction} id={player.card.id} labels={labels} />
                </form>
              </EditDetails>}
              {player.card?.color !== "red" && <EditDetails title={`+ ${player.card ? labels.secondCard : labels.addCard}`} isNew>
                <form action={savePlayerCardAction} className="admin-form">
                  <input type="hidden" name="locale" value={locale} /><input type="hidden" name="playerId" value={player.id} />
                  {/* A second card is always red, so there is no colour to choose */}
                  {player.card ? <><input type="hidden" name="color" value="red" /><PlayerCardFields tournaments={data.tournaments} labels={labels} locale={locale} fixedColor /></>
                    : <PlayerCardFields tournaments={data.tournaments} labels={labels} locale={locale} />}
                  <FormButtons save={labels.save} isNew labels={labels} />
                </form>
              </EditDetails>}
            </EditDetails>)}
            {!data.players.length && <p className="admin-empty-note">{labels.empty}</p>}
          </section>}

          {tab === "media" && <section className="admin-section">
            {!data.mediaItems.length && <p className="admin-empty-note">{labels.mediaHint}</p>}
            {/* Several photos at once: category and "published" apply to all of them */}
            <form action={saveMediaBatchAction} className="admin-form admin-batch-form">
              <input type="hidden" name="locale" value={locale} />
              <ImageBatch labels={batchLabels(labels)}>
                <div className="admin-form-grid">
                  <label className="admin-field">{labels.mediaCategory}<select name="category" defaultValue="tournaments">
                    {mediaCategories.map(([key, ky, ru]) => <option key={key} value={key}>{locale === "ky" ? ky : ru}</option>)}
                  </select></label>
                </div>
                <PublishToggle label={labels.published} checked />
              </ImageBatch>
            </form>
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
                  <HorseFields categories={data.categories.filter((category) => category.active)} labels={labels} />
                  <PublishToggle label={labels.published} /><FormButtons save={labels.save} isNew labels={labels} />
                </form>
              </EditDetails>
              {data.horses.map((horse) => <EditDetails key={horse.id} title={horse.nameKy}>
                <form action={saveHorseAction} className="admin-form">
                  <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={horse.id} />
                  <HorseFields horse={horse} categories={data.categories} labels={labels} />
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
            <form action={saveAboutPhotoBatchAction} className="admin-form admin-batch-form">
              <input type="hidden" name="locale" value={locale} />
              <ImageBatch labels={batchLabels(labels)}><PublishToggle label={labels.published} checked /></ImageBatch>
            </form>
            <EditDetails title={`+ ${labels.newItem}`} isNew>
              <form action={saveAboutPhotoAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} />
                <div className="admin-form-grid"><ImageField name="imageUrl" label={labels.image} labels={imageLabels(labels)} /><Field name="sortOrder" label="#" type="number" value={data.aboutPhotos.length + 1} /><Pair field="caption" label={labels.caption} /></div>
                <PublishToggle label={labels.published} /><FormButtons save={labels.save} isNew labels={labels} />
              </form>
            </EditDetails>
            {data.aboutPhotos.map((photo) => <EditDetails key={photo.id} title={locale === "ky" ? photo.captionKy : photo.captionRu}>
              <form action={saveAboutPhotoAction} className="admin-form">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={photo.id} />
                <div className="admin-form-grid"><ImageField name="imageUrl" label={labels.image} value={photo.imageUrl} labels={imageLabels(labels)} /><Field name="sortOrder" label="#" type="number" value={photo.sortOrder} /><Pair field="caption" label={labels.caption} ky={photo.captionKy} ru={photo.captionRu} /></div>
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

        </div>
      </div>
    </main>
  );
}
