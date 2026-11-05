import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// `--reset` replaces all public content (not the admin account) with this set.
const reset = process.argv.includes("--reset");

const images = {
  ulak: "/images/hero-ulak.jpg",
  crowd: "/images/hero-kokboru-crowd.jpg",
  hero: "/images/hero-horse.jpg",
  field: "/images/horse-field.jpg",
  pasture: "/images/horse-pasture.jpg",
  action: "/images/horse-action.jpg",
};

const settings = {
  brandName: "Alaman Ulak",
  heroTitleKy: "Alaman\nUlak",
  heroTitleRu: "Alaman\nUlak",
  heroTextKy: "Улуттун руху. Эрдиктин оюну.",
  heroTextRu: "Дух нации. Игра отважных.",
  aboutTitleKy: "Кыргыз элинин улуттук оюну",
  aboutTitleRu: "Национальная игра кыргызского народа",
  aboutTextKy:
    "Аламан-Улак федерациясы — кыргыз элинин улуттук улак оюнун өнүктүрүү, сактоо жана дүйнө жүзүнө таанытуу максатында түзүлгөн уюм. Биздин миссия — улуттук баалуулуктарды келечек муунга жеткирүү.",
  aboutTextRu:
    "Федерация Аламан-Улак — организация, созданная для развития, сохранения и популяризации национальной игры улак в мире. Наша миссия — передать национальные ценности будущим поколениям.",
  calendarTitleKy: "Турнирлер",
  calendarTitleRu: "Турниры",
  calendarTextKy:
    "Федерация жыл бою республикалык жана эл аралык улак тартыш мелдештерин уюштурат. Жазгы ачылыштан тартып Нооруз, Эгемендүүлүк күнү жана кышкы кубокторго чейин ар бир сезондун өз чабышы бар. Төмөндө алдыдагы мелдештер жана өткөн турнирлердин жыйынтыктары.",
  calendarTextRu:
    "Федерация круглый год проводит республиканские и международные турниры по улак тартышу. От весеннего открытия и Нооруза до Дня независимости и зимних кубков у каждого сезона свои состязания. Ниже — предстоящие турниры и итоги прошедших.",
  teamTitleKy: "Оюнчулар",
  teamTitleRu: "Игроки",
  newsTitleKy: "Жаңылыктар",
  newsTitleRu: "Новости",
  rulesTitleKy: "Оюндун эрежелери",
  rulesTitleRu: "Правила игры",
  horsesTitleKy: "Argymak\nжылкы базары",
  horsesTitleRu: "Argymak\nконный рынок",
  contactTitleKy: "Биз менен байланышыңыз",
  contactTitleRu: "Свяжитесь с нами",
  contactPhone: "+996 312 000 000",
  contactEmail: "info@alamanulak.kg",
  addressKy: "Бишкек ш., Кыргызстан",
  addressRu: "г. Бишкек, Кыргызстан",
  socialUrl: "",
  whatsappNumber: "",
  instagramUrl: "",
  facebookUrl: "",
  heroImageUrl: images.crowd,
};

const categories = [
  { key: "arab", nameKy: "Араб тукуму", nameRu: "Арабская порода", sortOrder: 1 },
  { key: "kyrgyz", nameKy: "Кыргыз тукуму", nameRu: "Кыргызская порода", sortOrder: 2 },
  { key: "akhal", nameKy: "Ахалтеке", nameRu: "Ахалтекинская", sortOrder: 3 },
];

const horses = [
  {
    category: "arab", nameKy: "Кара күлүк", nameRu: "Кара-Кулук", ageKy: "6 жаш", ageRu: "6 лет",
    locationKy: "Чүй обл.", locationRu: "Чуйская обл.", price: 1200000, imageUrl: images.hero,
    descriptionKy: "Бийиктиги 165 см. Күчтүү, тез жана чыдамкай — улак тартышка толук даярдалган.",
    descriptionRu: "Рост 165 см. Сильный, быстрый и выносливый — полностью подготовлен к улак тартышу.",
  },
  {
    category: "kyrgyz", nameKy: "Тулпар", nameRu: "Тулпар", ageKy: "5 жаш", ageRu: "5 лет",
    locationKy: "Ысык-Көл обл.", locationRu: "Иссык-Кульская обл.", price: 980000, imageUrl: images.field,
    descriptionKy: "Бийиктиги 158 см. Тоо шартына көнгөн, токтоо мүнөздүү, тез үйрөнөт.",
    descriptionRu: "Рост 158 см. Привычен к горным условиям, спокойный нрав, быстро обучается.",
  },
  {
    category: "arab", nameKy: "Ак боз", nameRu: "Ак-Боз", ageKy: "7 жаш", ageRu: "7 лет",
    locationKy: "Ош обл.", locationRu: "Ошская обл.", price: 1500000, imageUrl: images.pasture,
    descriptionKy: "Бийиктиги 172 см. Асыл тукум, республикалык мелдештерде байге алган.",
    descriptionRu: "Рост 172 см. Породистый, призёр республиканских соревнований.",
  },
  {
    category: "kyrgyz", nameKy: "Көк бөрү", nameRu: "Кок-Бору", ageKy: "4 жаш", ageRu: "4 года",
    locationKy: "Нарын обл.", locationRu: "Нарынская обл.", price: 750000, imageUrl: images.action,
    descriptionKy: "Бийиктиги 160 см. Жаш, шамдагай ат — жаш чабандеске ылайыктуу.",
    descriptionRu: "Рост 160 см. Молодой, ловкий конь — подойдёт молодому всаднику.",
  },
  {
    category: "arab", nameKy: "Жалын", nameRu: "Жалын", ageKy: "8 жаш", ageRu: "8 лет",
    locationKy: "Жалал-Абад обл.", locationRu: "Джалал-Абадская обл.", price: 1300000, imageUrl: images.field,
    descriptionKy: "Бийиктиги 168 см. Тажрыйбалуу, катуу беттешке көнгөн, тынч мүнөздүү.",
    descriptionRu: "Рост 168 см. Опытный, привык к жёсткой борьбе, уравновешенный.",
  },
  {
    category: "akhal", nameKy: "Аргымак", nameRu: "Аргымак", ageKy: "6 жаш", ageRu: "6 лет",
    locationKy: "Талас обл.", locationRu: "Таласская обл.", price: 2100000, imageUrl: images.hero,
    descriptionKy: "Бийиктиги 170 см. Ахалтеке тукумунун таза каны, узак аралыкка чыдамкай.",
    descriptionRu: "Рост 170 см. Чистокровный ахалтекинец, вынослив на длинных дистанциях.",
  },
  {
    category: "kyrgyz", nameKy: "Сары ала", nameRu: "Сары-Ала", ageKy: "3 жаш", ageRu: "3 года",
    locationKy: "Баткен обл.", locationRu: "Баткенская обл.", price: null, imageUrl: images.pasture,
    descriptionKy: "Бийиктиги 152 см. Жаш тай, машыгууга даяр. Баасы сүйлөшүү аркылуу.",
    descriptionRu: "Рост 152 см. Молодой конь, готов к тренировкам. Цена по договорённости.",
  },
];

const articles = [
  {
    date: "2026-10-25",
    titleKy: "Аламан-Улак федерациясынын жаңы сезону ийгиликтүү башталды",
    titleRu: "Новый сезон федерации Аламан-Улак успешно стартовал",
    excerptKy: "Алты облустун командалары сезондун биринчи оюндарында күч сынашты.",
    excerptRu: "Команды шести областей померились силами в первых играх сезона.",
    bodyKy: "Жаңы сезондун ачылышына миңдеген күйөрмандар чогулду. Федерация быйыл мелдештердин санын көбөйтүп, жаш чабандестерге көбүрөөк мүмкүнчүлүк берүүнү пландап жатат.",
    bodyRu: "На открытие нового сезона собрались тысячи болельщиков. В этом году федерация планирует увеличить число турниров и дать больше возможностей молодым всадникам.",
    imageUrl: images.action,
  },
  {
    date: "2026-10-18",
    titleKy: "Бишкекте республикалык мелдеш өттү",
    titleRu: "В Бишкеке прошёл республиканский турнир",
    excerptKy: "Финалда «Ала-Тоо» жана «Нарын» командалары беттешти.",
    excerptRu: "В финале встретились команды «Ала-Тоо» и «Нарын».",
    bodyKy: "Үч күнгө созулган мелдеште сегиз команда катышты. Финалдык беттеш акыркы мүнөттөргө чейин тең салмакта өтүп, «Ала-Тоо» командасы 6:4 эсебинде жеңишке жетишти.",
    bodyRu: "В трёхдневном турнире участвовали восемь команд. Финал до последних минут шёл на равных, и команда «Ала-Тоо» победила со счётом 6:4.",
    imageUrl: images.ulak,
  },
  {
    date: "2026-10-10",
    titleKy: "Кыргыз улакчылары эл аралык турнирге катышат",
    titleRu: "Кыргызские улакчы примут участие в международном турнире",
    excerptKy: "Курама команданын курамы жарыяланды.",
    excerptRu: "Объявлен состав сборной.",
    bodyKy: "Федерация эл аралык турнирге бара турган курама команданын курамын бекитти. Машыгуулар Ысык-Көлдөгү базада өтөт.",
    bodyRu: "Федерация утвердила состав сборной для международного турнира. Сборы пройдут на базе на Иссык-Куле.",
    imageUrl: images.field,
  },
  {
    date: "2026-09-28",
    titleKy: "Жаш чабандестер үчүн машыгуу лагери ачылды",
    titleRu: "Открылся тренировочный лагерь для молодых всадников",
    excerptKy: "14–18 жаштагы 60тан ашык бала катышууда.",
    excerptRu: "В лагере занимаются более 60 ребят от 14 до 18 лет.",
    bodyKy: "Лагерде тажрыйбалуу машыктыруучулар ат минүү техникасын, оюндун тактикасын жана коопсуздук эрежелерин үйрөтүшөт.",
    bodyRu: "Опытные тренеры обучают технике верховой езды, тактике игры и правилам безопасности.",
    imageUrl: images.pasture,
  },
  {
    date: "2026-09-14",
    titleKy: "Федерация оюндун жаңыланган эрежелерин бекитти",
    titleRu: "Федерация утвердила обновлённые правила игры",
    excerptKy: "Өзгөрүүлөр ат жана чабандестин коопсуздугуна багытталган.",
    excerptRu: "Изменения направлены на безопасность коня и всадника.",
    bodyKy: "Жаңы эрежелер боюнча ар бир мелдештин алдында аттар ветеринардык текшерүүдөн өтөт, ал эми чабандестер үчүн коргоочу шлем милдеттүү.",
    bodyRu: "По новым правилам перед каждым турниром лошади проходят ветеринарный осмотр, а для всадников обязателен защитный шлем.",
    imageUrl: images.action,
  },
  {
    date: "2026-08-30",
    titleKy: "Чолпон-Атада жайкы кубок өттү",
    titleRu: "В Чолпон-Ате прошёл Летний кубок",
    excerptKy: "Кубокту «Ысык-Көл» командасы утуп алды.",
    excerptRu: "Кубок завоевала команда «Иссык-Куль».",
    bodyKy: "Көл жээгиндеги ипподромдо өткөн мелдешке туристтер да чогулуп, улак тартыштын салтын жакындан көрүштү.",
    bodyRu: "На ипподроме у озера собрались и туристы, увидевшие традицию улак тартыша вблизи.",
    imageUrl: images.pasture,
  },
];

const tournaments = [
  {
    titleKy: "Күзгү чемпионат", titleRu: "Осенний чемпионат",
    locationKy: "Бишкек, Кыргызстан", locationRu: "Бишкек, Кыргызстан",
    startsAt: "2026-10-10T08:00:00Z", endsAt: "2026-10-12T14:00:00Z",
    resultSummaryKy: "«Ала-Тоо» — «Нарын» 6:4", resultSummaryRu: "«Ала-Тоо» — «Нарын» 6:4",
  },
  {
    titleKy: "Республикалык Аламан-Улак турнири", titleRu: "Республиканский турнир Аламан-Улак",
    locationKy: "Бишкек, Кыргызстан", locationRu: "Бишкек, Кыргызстан",
    startsAt: "2026-11-15T08:00:00Z", endsAt: "2026-11-16T14:00:00Z",
  },
  {
    titleKy: "Нооруз кубогу", titleRu: "Кубок Нооруза",
    locationKy: "Ош, Кыргызстан", locationRu: "Ош, Кыргызстан",
    startsAt: "2027-03-20T08:00:00Z", endsAt: "2027-03-21T14:00:00Z",
  },
  {
    titleKy: "Эл аралык Аламан-Улак турнири", titleRu: "Международный турнир Аламан-Улак",
    locationKy: "Чолпон-Ата, Кыргызстан", locationRu: "Чолпон-Ата, Кыргызстан",
    startsAt: "2027-05-12T08:00:00Z", endsAt: "2027-05-14T14:00:00Z",
  },
  {
    titleKy: "Федерациялар арасындагы кубок", titleRu: "Кубок федераций",
    locationKy: "Бишкек, Кыргызстан", locationRu: "Бишкек, Кыргызстан",
    startsAt: "2027-06-18T08:00:00Z", endsAt: "2027-06-20T14:00:00Z",
  },
];

const positions = {
  captain: ["Капитан", "Капитан"],
  forward: ["Чабуулчу", "Нападающий"],
  defender: ["Коргоочу", "Защитник"],
  reserve: ["Запастагы оюнчу", "Запасной игрок"],
};

// Demo players grouped by club; each player keeps its club's name (there is no separate team list).
const clubs = [
  {
    nameKy: "Ала-Тоо", nameRu: "Ала-Тоо", locationKy: "Бишкек", locationRu: "Бишкек", imageUrl: images.hero,
    descriptionKy: "Кыргызстандагы эң күчтүү жана тажрыйбалуу командалардын бири. Республикалык мелдештердин бир нече жолку жеңүүчүсү.",
    descriptionRu: "Одна из сильнейших и опытнейших команд Кыргызстана. Многократный победитель республиканских турниров.",
    players: [["Азамат Токтосунов", "captain", 7], ["Бакыт Асанов", "forward", 9], ["Нурлан Жумабеков", "defender", 4], ["Эрлан Осмонов", "reserve", 12]],
  },
  {
    nameKy: "Нарын", nameRu: "Нарын", locationKy: "Нарын", locationRu: "Нарын", imageUrl: images.action,
    descriptionKy: "Тоолуу Нарындын чыйрак чабандестери. Күчтүү коргонуусу менен белгилүү.",
    descriptionRu: "Закалённые всадники горного Нарына. Известны крепкой обороной.",
    players: [["Мирлан Сатыбалдиев", "captain", 10], ["Улан Абдыкеров", "forward", 11], ["Талант Мамытов", "defender", 3], ["Жыргал Акматов", "reserve", 15]],
  },
  {
    nameKy: "Ысык-Көл", nameRu: "Иссык-Куль", locationKy: "Каракол", locationRu: "Каракол", imageUrl: images.pasture,
    descriptionKy: "Жайкы кубоктун ээси. Ылдам чабуулдары жана жаш курамы менен айырмаланат.",
    descriptionRu: "Обладатель Летнего кубка. Отличается быстрыми атаками и молодым составом.",
    players: [["Айбек Кадыров", "captain", 8], ["Самат Бейшеев", "forward", 14], ["Данияр Усенов", "defender", 5], ["Тилек Карабаев", "reserve", 17]],
  },
  {
    nameKy: "Ош", nameRu: "Ош", locationKy: "Ош", locationRu: "Ош", imageUrl: images.field,
    descriptionKy: "Түштүктүн эң байыркы клубу. Нооруз кубогунун салттуу кожоюну.",
    descriptionRu: "Старейший клуб юга. Традиционный хозяин Кубка Нооруза.",
    players: [["Курманбек Ташиев", "captain", 6], ["Алмаз Эргешов", "forward", 9], ["Руслан Мамасалиев", "defender", 2], ["Бекзат Жолдошев", "reserve", 13]],
  },
  {
    nameKy: "Талас", nameRu: "Талас", locationKy: "Талас", locationRu: "Талас", imageUrl: images.hero,
    descriptionKy: "Манастын жеринен чыккан команда. Тактикалык оюну менен таанымал.",
    descriptionRu: "Команда с родины Манаса. Известна тактической игрой.",
    players: [["Жаныбек Сыдыков", "captain", 11], ["Нурбек Абдраимов", "forward", 7], ["Эмил Турдубаев", "defender", 4], ["Бекболот Каримов", "reserve", 16]],
  },
  {
    nameKy: "Баткен", nameRu: "Баткен", locationKy: "Баткен", locationRu: "Баткен", imageUrl: images.pasture,
    descriptionKy: "Эң жаш команда, бирок ар бир сезондо күчөп келе жатат.",
    descriptionRu: "Самая молодая команда, которая с каждым сезоном становится сильнее.",
    players: [["Сүйүнбек Мамбетов", "captain", 5], ["Адилет Назаров", "forward", 10], ["Чыңгыз Исаков", "defender", 3], ["Марат Ормонов", "reserve", 14]],
  },
];

const rules = [
  {
    titleKy: "Командалар жана курам", titleRu: "Команды и состав",
    bodyKy: "Талаада ар бир командадан бир убакта 4 чабандес ойнойт. Калган оюнчулар запаста туруп, оюн учурунда алмашып турушат.",
    bodyRu: "На поле одновременно играют по 4 всадника от каждой команды. Остальные игроки находятся в запасе и выходят на замену по ходу игры.",
  },
  {
    titleKy: "Оюн убактысы", titleRu: "Продолжительность игры",
    bodyKy: "Оюн 20 мүнөттөн турган үч мезгилден турат. Мезгилдердин ортосунда 10 мүнөттүк тыныгуу берилет.",
    bodyRu: "Игра состоит из трёх периодов по 20 минут. Между периодами — перерыв 10 минут.",
  },
  {
    titleKy: "Упай топтоо", titleRu: "Начисление очков",
    bodyKy: "Улакты каршылаш команданын тай казанына салган команда бир упай алат. Көп упай топтогон команда жеңет.",
    bodyRu: "Команда, поместившая улак в тай-казан соперника, получает одно очко. Побеждает команда, набравшая больше очков.",
  },
  {
    titleKy: "Оюн талаасы", titleRu: "Игровое поле",
    bodyKy: "Талаанын өлчөмү мелдештин жобосу менен аныкталат. Талаанын эки четинде тай казан орнотулат.",
    bodyRu: "Размеры поля определяются положением о турнире. На противоположных концах поля устанавливаются тай-казаны.",
  },
  {
    titleKy: "Тыюу салынган аракеттер", titleRu: "Запрещённые действия",
    bodyKy: "Каршылаштын атын же чабандесин камчы менен урууга, атты атайылап жыгууга жана тизгинден тартууга тыюу салынат. Бузуу үчүн айып жазасы берилет.",
    bodyRu: "Запрещено бить камчой коня или всадника соперника, намеренно валить коня и хватать за повод. За нарушения назначается штраф.",
  },
  {
    titleKy: "Ат жана чабандестин коопсуздугу", titleRu: "Безопасность коня и всадника",
    bodyKy: "Ар бир мелдештин алдында аттар ветеринардык текшерүүдөн өтөт. Чабандестер үчүн коргоочу шлем милдеттүү.",
    bodyRu: "Перед каждым турниром лошади проходят ветеринарный осмотр. Для всадников обязателен защитный шлем.",
  },
];

// Demo people for the "about" page: invented names, to be replaced in the admin panel.
const members = [
  { name: "Асанбек Токтогулов", kind: "leader", region: "KG-GB", roleKy: "Федерациянын төрагасы", roleRu: "Президент федерации",
    bioKy: "Улак тартыш боюнча эл аралык калыс. Федерацияны түзгөндөрдүн бири, 20 жылдан бери улуттук оюндарды өнүктүрүүгө салым кошуп келет.",
    bioRu: "Международный судья по улак тартышу. Один из основателей федерации, более 20 лет развивает национальные игры." },
  { name: "Нурлан Бакиров", kind: "board", region: "KG-C", roleKy: "Төраганын орун басары", roleRu: "Вице-президент",
    bioKy: "Клубдар жана мелдештер менен иштөөгө жооптуу.", bioRu: "Отвечает за работу с клубами и соревнованиями." },
  { name: "Айгүл Жумабаева", kind: "board", region: "", roleKy: "Башкы катчы", roleRu: "Генеральный секретарь",
    bioKy: "Федерациянын күнүмдүк ишин жана документтерин жетектейт.", bioRu: "Руководит повседневной работой и документацией федерации." },
  { name: "Бакыт Осмонов", kind: "board", region: "", roleKy: "Башкы калыс", roleRu: "Главный судья",
    bioKy: "Оюндун эрежелерин жана калыстардын даярдыгын көзөмөлдөйт.", bioRu: "Контролирует правила игры и подготовку судей." },
  { name: "Эрлан Садыков", kind: "board", region: "", roleKy: "Башкы машыктыруучу", roleRu: "Главный тренер",
    bioKy: "Улуттук курама команданы жана жаш чабандестерди даярдайт.", bioRu: "Готовит национальную сборную и молодых всадников." },
  { name: "Чолпон Абдыкадырова", kind: "board", region: "", roleKy: "Маалымат катчысы", roleRu: "Пресс-секретарь",
    bioKy: "Жаңылыктарга, медиага жана коомчулук менен байланышка жооптуу.", bioRu: "Отвечает за новости, медиа и связи с общественностью." },
  { name: "Талант Мамытов", kind: "board", region: "", roleKy: "Ветеринардык кеңешчи", roleRu: "Ветеринарный советник",
    bioKy: "Мелдештин алдында аттардын ден соолугун текшерүүнү уюштурат.", bioRu: "Организует ветеринарный осмотр лошадей перед турнирами." },
  { name: "Медер Ташиев", kind: "regional", region: "KG-O", roleKy: "Ош облусундагы өкүл", roleRu: "Представитель в Ошской области" },
  { name: "Улан Асанов", kind: "regional", region: "KG-Y", roleKy: "Ысык-Көл облусундагы өкүл", roleRu: "Представитель в Иссык-Кульской области" },
  { name: "Азамат Келдибеков", kind: "regional", region: "KG-N", roleKy: "Нарын облусундагы өкүл", roleRu: "Представитель в Нарынской области" },
  { name: "Жыргал Эшматов", kind: "regional", region: "KG-T", roleKy: "Талас облусундагы өкүл", roleRu: "Представитель в Таласской области" },
  { name: "Руслан Абдиев", kind: "regional", region: "KG-J", roleKy: "Жалал-Абад облусундагы өкүл", roleRu: "Представитель в Джалал-Абадской области" },
  { name: "Нурбек Исаков", kind: "regional", region: "KG-B", roleKy: "Баткен облусундагы өкүл", roleRu: "Представитель в Баткенской области" },
];

const aboutPhotos = [
  { imageUrl: "/images/hero-ulak.jpg", captionKy: "Республикалык мелдеш, Бишкек", captionRu: "Республиканский турнир, Бишкек" },
  { imageUrl: "/images/yurt-flag.jpg", captionKy: "Жайлоодогу боз үй", captionRu: "Юрта на джайлоо" },
  { imageUrl: "/images/riders-sunset.jpg", captionKy: "Чабандестер күн батышта", captionRu: "Всадники на закате" },
  { imageUrl: "/images/hero-horse.jpg", captionKy: "Ак боз күлүк", captionRu: "Белый скакун" },
  { imageUrl: "/images/horse-field.jpg", captionKy: "Машыгуудан мурун", captionRu: "Перед тренировкой" },
  { imageUrl: "/images/horse-pasture.jpg", captionKy: "Тоо этегиндеги жайыт", captionRu: "Пастбище у подножия гор" },
  { imageUrl: "/images/horse-action.jpg", captionKy: "Жаш чабандестер", captionRu: "Молодые всадники" },
];

const milestones = [
  { year: 2018, titleKy: "Федерация түзүлдү", titleRu: "Основание федерации",
    textKy: "Чабандестер жана клубдар улак тартышты өнүктүрүү үчүн бириккен.", textRu: "Всадники и клубы объединились ради развития улак тартыша." },
  { year: 2019, titleKy: "Биринчи республикалык чемпионат", titleRu: "Первый республиканский чемпионат",
    textKy: "Бардык облустардан командалар катышты.", textRu: "Участвовали команды из всех областей." },
  { year: 2021, titleKy: "Аймактык өкүлдөр", titleRu: "Региональные представители",
    textKy: "Ар бир облуста федерациянын өкүлү дайындалды.", textRu: "В каждой области назначен представитель федерации." },
  { year: 2023, titleKy: "Калыстар мектеби", titleRu: "Школа судей",
    textKy: "Калыстарды даярдоо жана аттестациялоо башталды.", textRu: "Началась подготовка и аттестация судей." },
  { year: 2025, titleKy: "Жаштар лигасы", titleRu: "Молодёжная лига",
    textKy: "18 жашка чейинки чабандестер үчүн өзүнчө мелдештер.", textRu: "Отдельные турниры для всадников до 18 лет." },
  { year: 2026, titleKy: "Жаңы сезон", titleRu: "Новый сезон",
    textKy: "Эл аралык турнирлер жана жаңы клубдар.", textRu: "Международные турниры и новые клубы." },
];

async function clearContent() {
  await prisma.$transaction([
    prisma.player.deleteMany(),
    prisma.newsArticle.deleteMany(),
    prisma.tournament.deleteMany(),
    prisma.ruleSection.deleteMany(),
    prisma.horseListing.deleteMany(),
    prisma.horseCategory.deleteMany(),
    prisma.federationMember.deleteMany(),
    prisma.aboutPhoto.deleteMany(),
    prisma.historyMilestone.deleteMany(),
  ]);
}

async function seedSettings() {
  if (reset) {
    await prisma.siteSettings.upsert({ where: { id: "main" }, update: settings, create: { id: "main", ...settings } });
    return;
  }
  const existing = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!existing) await prisma.siteSettings.create({ data: { id: "main", ...settings } });
}

async function seedCatalog() {
  if ((await prisma.horseCategory.count()) > 0) return;

  const ids = {};
  for (const { key, ...category } of categories) {
    ids[key] = (await prisma.horseCategory.create({ data: category })).id;
  }
  await prisma.horseListing.createMany({
    data: horses.map(({ category, ...horse }) => ({ ...horse, categoryId: ids[category], published: true })),
  });
}

async function seedEditorial() {
  if ((await prisma.newsArticle.count()) === 0) {
    await prisma.newsArticle.createMany({
      data: articles.map(({ date, ...article }) => ({ ...article, published: true, publishedAt: new Date(`${date}T09:00:00Z`) })),
    });
  }

  if ((await prisma.tournament.count()) === 0) {
    await prisma.tournament.createMany({
      data: tournaments.map((item) => ({ ...item, startsAt: new Date(item.startsAt), endsAt: new Date(item.endsAt), published: true })),
    });
  }

  if ((await prisma.player.count()) === 0) {
    await prisma.player.createMany({
      data: clubs.flatMap((club) => club.players.map(([name, position, number]) => ({
        name,
        positionKy: positions[position][0],
        positionRu: positions[position][1],
        number,
        clubKy: club.nameKy,
        clubRu: club.nameRu,
        bioKy: "",
        bioRu: "",
        imageUrl: "",
        published: true,
      }))),
    });
  }

  if ((await prisma.ruleSection.count()) === 0) {
    await prisma.ruleSection.createMany({
      data: rules.map((rule, index) => ({ ...rule, sortOrder: index + 1, published: true })),
    });
  }
}

async function seedFederation() {
  if ((await prisma.federationMember.count()) === 0) {
    await prisma.federationMember.createMany({
      data: members.map((member, index) => ({ bioKy: "", bioRu: "", ...member, sortOrder: index + 1, published: true })),
    });
  }
  if ((await prisma.aboutPhoto.count()) === 0) {
    await prisma.aboutPhoto.createMany({ data: aboutPhotos.map((photo, index) => ({ ...photo, sortOrder: index + 1, published: true })) });
  }
  if ((await prisma.historyMilestone.count()) === 0) {
    await prisma.historyMilestone.createMany({ data: milestones.map((milestone) => ({ ...milestone, published: true })) });
  }
}

async function main() {
  if (reset) await clearContent();
  await seedSettings();
  await seedCatalog();
  await seedEditorial();
  await seedFederation();
  console.log(reset ? "Content replaced with the reference set." : "Demo content is ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
