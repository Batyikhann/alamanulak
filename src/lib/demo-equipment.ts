// Demo equipment for the bazaar (riders' and horses' gear) until sellers can list their own: photos from Wikimedia
// Commons (credits in /public/images/equipment/CREDITS.md), prices in som.

export type EquipmentType = "saddle" | "tack" | "rider";
export type EquipmentCondition = "new" | "used";
export type Equipment = {
  id: string;
  image: string;
  nameKy: string;
  nameRu: string;
  descriptionKy: string;
  descriptionRu: string;
  type: EquipmentType;
  condition: EquipmentCondition;
  price: number;
  regionKy: string;
  regionRu: string;
};

export const demoEquipment: Equipment[] = [
  {
    id: "saddle-kyrgyz", image: "/images/equipment/saddle-kyrgyz.jpg", type: "saddle", condition: "used", price: 85000, regionKy: "Бишкек", regionRu: "Бишкек",
    nameKy: "Кыргыз ээри, күмүш кооздолгон", nameRu: "Кыргызское седло с серебряной отделкой",
    descriptionKy: "Колго жасалган салттуу ээр: жыгач кашы, күмүш жасалгалары жана кийиз токуму менен.", descriptionRu: "Традиционное седло ручной работы: деревянная лука, серебряная отделка и войлочный потник.",
  },
  {
    id: "saddle", image: "/images/equipment/saddle.jpg", type: "saddle", condition: "used", price: 60000, regionKy: "Нарын", regionRu: "Нарын",
    nameKy: "Салттуу ээр, толук комплект", nameRu: "Традиционное седло, полный комплект",
    descriptionKy: "Үзөңгүсү, басмайылы жана куюшканы менен. Узак жолго жана улак тартышка ылайыктуу.", descriptionRu: "Со стременами, подпругой и подхвостником. Подходит для дальней езды и улак тартыша.",
  },
  {
    id: "stirrups", image: "/images/equipment/stirrups.jpg", type: "tack", condition: "new", price: 9000, regionKy: "Ош", regionRu: "Ош",
    nameKy: "Жез үзөңгү, жуп", nameRu: "Латунные стремена, пара",
    descriptionKy: "Оор, бекем үзөңгү: буттун табаны кең турат. Кайышы кошо берилет.", descriptionRu: "Тяжёлые прочные стремена с широкой подножкой. Путлища в комплекте.",
  },
  {
    id: "horseshoes", image: "/images/equipment/horseshoes.jpg", type: "tack", condition: "new", price: 3500, regionKy: "Талас", regionRu: "Талас",
    nameKy: "Така жана мык, төрт буту үчүн", nameRu: "Подковы с гвоздями, на четыре ноги",
    descriptionKy: "Тоо жолуна жана таштуу талаага ылайыктуу болот така. Мыгы кошо.", descriptionRu: "Стальные подковы для горных дорог и каменистого поля. Гвозди в комплекте.",
  },
  {
    id: "halter", image: "/images/equipment/halter.jpg", type: "tack", condition: "new", price: 2500, regionKy: "Каракол", regionRu: "Каракол",
    nameKy: "Аркан ноокто чылбыры менен", nameRu: "Верёвочный недоуздок с чомбуром",
    descriptionKy: "Жумшак, бирок бекем аркан ноокто: атты жетелөөгө жана байлоого.", descriptionRu: "Мягкий, но прочный верёвочный недоуздок — чтобы водить и привязывать коня.",
  },
  {
    id: "saddle-pad", image: "/images/equipment/saddle-pad.jpg", type: "tack", condition: "new", price: 6000, regionKy: "Бишкек", regionRu: "Бишкек",
    nameKy: "Ээр алдына тердик", nameRu: "Потник под седло",
    descriptionKy: "Калың, тер сиңирүүчү тердик: аттын белин ээрдин сүрүлүүсүнөн сактайт.", descriptionRu: "Толстый впитывающий потник: бережёт спину коня от натирания седлом.",
  },
  {
    id: "kamchy", image: "/images/equipment/kamchy.jpg", type: "rider", condition: "new", price: 4500, regionKy: "Нарын", regionRu: "Нарын",
    nameKy: "Колго өрүлгөн камчы", nameRu: "Плетёная камча ручной работы",
    descriptionKy: "Булгаарыдан өрүлгөн камчы, сабы кооздолгон. Чабандестин салттуу шайманы.", descriptionRu: "Кожаная плетёная камча с украшенной рукоятью — традиционное снаряжение всадника.",
  },
  {
    id: "helmet", image: "/images/equipment/helmet.jpg", type: "rider", condition: "used", price: 7500, regionKy: "Бишкек", regionRu: "Бишкек",
    nameKy: "Чабандестин туулгасы", nameRu: "Шлем всадника",
    descriptionKy: "Башты коргоочу туулга, өлчөмү 57–58. Машыгууга жана мелдешке.", descriptionRu: "Защитный шлем, размер 57–58. Для тренировок и соревнований.",
  },
  {
    id: "boots", image: "/images/equipment/boots.jpg", type: "rider", condition: "new", price: 12000, regionKy: "Ош", regionRu: "Ош",
    nameKy: "Булгаары өтүк, атка минүү үчүн", nameRu: "Кожаные сапоги для верховой езды",
    descriptionKy: "Бийик кончу, бекем такасы бар булгаары өтүк. Өлчөмдөрү 40–45.", descriptionRu: "Кожаные сапоги с высоким голенищем и прочным каблуком. Размеры 40–45.",
  },
];
