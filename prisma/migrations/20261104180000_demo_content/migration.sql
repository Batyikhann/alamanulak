-- Demo content for presenting the site: the news, tournaments, horses, player birth years, player cards and tournament
-- prizes and winners that were prepared on the test database, so the live site shows the same demo.
-- It only adds: rows that already exist are left alone (ON CONFLICT DO NOTHING) and only empty fields are filled, so
-- nothing entered on the live site is overwritten. All of it can be edited or deleted in the admin.

INSERT INTO "Tournament" ("id", "titleKy", "titleRu", "locationKy", "locationRu", "startsAt", "endsAt", "prize1Ky", "prize1Ru", "winner1Ky", "winner1Ru", "prize2Ky", "prize2Ru", "winner2Ky", "winner2Ru", "prize3Ky", "prize3Ru", "winner3Ky", "winner3Ru", "resultSummaryKy", "resultSummaryRu", "imageUrl", "descriptionKy", "descriptionRu", "published", "createdAt", "updatedAt")
VALUES ('cmvz4sqfa0000x6b2pb4hxe1g', 'Ысык-Көл кубогу', 'Кубок Иссык-Куля', 'Каракол, Кыргызстан', 'Каракол, Кыргызстан', '2027-07-24 09:00:00.000', '2027-07-25 17:00:00.000', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', TRUE, '2026-11-02 10:43:57.766', '2026-11-02 10:43:57.766')
ON CONFLICT DO NOTHING;

INSERT INTO "Tournament" ("id", "titleKy", "titleRu", "locationKy", "locationRu", "startsAt", "endsAt", "prize1Ky", "prize1Ru", "winner1Ky", "winner1Ru", "prize2Ky", "prize2Ru", "winner2Ky", "winner2Ru", "prize3Ky", "prize3Ru", "winner3Ky", "winner3Ru", "resultSummaryKy", "resultSummaryRu", "imageUrl", "descriptionKy", "descriptionRu", "published", "createdAt", "updatedAt")
VALUES ('cmvz4sqfa0001x6b2pd572fy0', 'Эгемендүүлүк кубогу', 'Кубок Независимости', 'Бишкек, Кыргызстан', 'Бишкек, Кыргызстан', '2027-08-30 09:00:00.000', '2027-08-31 17:00:00.000', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', TRUE, '2026-11-02 10:43:57.766', '2026-11-02 10:43:57.766')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt0000x642hwbgb23e', 'Республикалык Аламан-Улак турнирине катталуу башталды', 'Открыта регистрация на Республиканский турнир Аламан-Улак', 'Турнир 15–16-ноябрда Бишкекте өтөт. Командалар 10-ноябрга чейин катталышы керек.', 'Турнир пройдёт 15–16 ноября в Бишкеке. Команды должны зарегистрироваться до 10 ноября.', 'Аламан-Улак федерациясы сезондун эң чоң мелдешине — Республикалык Аламан-Улак турнирине катталуу башталганын жарыялайт. Мелдешке бардык облустардын командалары катыша алат. Ар бир команда 10-ноябрга чейин курамын, аттардын ветеринардык маалымкатын жана машыктыруучунун байланышын федерацияга тапшырышы керек. Турнирдин программасы жана оюндардын тартиби каттоо аяктагандан кийин жарыяланат.', 'Федерация Аламан-Улак объявляет о начале регистрации на главное состязание сезона — Республиканский турнир Аламан-Улак. В турнире могут участвовать команды всех областей. Каждая команда до 10 ноября должна передать в федерацию состав, ветеринарные справки лошадей и контакты тренера. Программа турнира и сетка игр будут опубликованы после окончания регистрации.', '/images/ulak-steppe-race.jpg', TRUE, '2026-11-02 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt0001x6422gpx4d79', 'Федерация жаш калыстар үчүн семинар өткөрдү', 'Федерация провела семинар для молодых судей', 'Семинарга 7 облустан 25 калыс катышты.', 'В семинаре приняли участие 25 судей из 7 областей.', 'Үч күнгө созулган семинарда калыстар оюндун жаңыланган эрежелерин, сары жана кызыл карточкаларды колдонуунун тартибин жана талаадагы коопсуздук талаптарын үйрөнүштү. Практикалык сабактар Бишкектин ипподромунда өттү. Семинардын аягында катышуучулар сынак тапшырып, федерациянын сертификаттарын алышты.', 'На трёхдневном семинаре судьи изучили обновлённые правила игры, порядок показа жёлтых и красных карточек и требования безопасности на поле. Практические занятия прошли на бишкекском ипподроме. В завершение участники сдали экзамен и получили сертификаты федерации.', '/images/riders-sunset.jpg', TRUE, '2026-10-30 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt0002x642vgsg89rg', 'Оюнчулардын тартип эсеби эми сайтта', 'Дисциплинарный учёт игроков теперь на сайте', 'Ар бир оюнчунун сары жана кызыл карточкалары Оюнчулар бөлүмүндө көрсөтүлөт.', 'Жёлтые и красные карточки каждого игрока теперь видны в разделе «Игроки».', 'Федерация ачык-айкындуулукту камсыз кылуу үчүн оюнчулардын тартип эсебин сайтка чыгарды. Эми Оюнчулар бөлүмүндө ар бир чабандестин алган карточкалары, алардын күнү, мелдеши жана себеби көрсөтүлөт. Фильтр аркылуу карточкасы бар же такыр жок оюнчуларды тез табууга болот.', 'Для большей прозрачности федерация опубликовала дисциплинарный учёт игроков на сайте. Теперь в разделе «Игроки» у каждого всадника видны полученные карточки, их дата, турнир и причина. С помощью фильтра можно быстро найти игроков с карточками или вовсе без них.', '/images/yurt-flag.jpg', TRUE, '2026-10-27 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt0003x642l4pdjuzo', 'Ат базарына жаңы жарыялар кошулду', 'На конном базаре появились новые объявления', 'Федерациянын расмий базарында азыр 27 ат сатыкта.', 'На официальном базаре федерации сейчас 27 лошадей в продаже.', 'Федерациянын ат базарына Ахалтеке, араб жана кыргыз тукумундагы 20 жаңы жарыя кошулду. Ар бир жарыяда аттын тукуму, жашы, бийиктиги жана аймагы көрсөтүлгөн. Сатып алуучулар сатуучу менен түз байланыша алышат. Атыңызды сатууну кааласаңыз, федерацияга кайрылыңыз.', 'На конный базар федерации добавлено 20 новых объявлений: ахалтекинцы, арабские и кыргызские лошади. В каждом объявлении указаны порода, возраст, рост и регион лошади. Покупатели могут связаться с продавцом напрямую. Чтобы продать своего коня, обратитесь в федерацию.', '/images/horses/kyrgyz-17.jpg', TRUE, '2026-10-22 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt0004x642tooce617', 'Күзгү чемпионаттын жыйынтыктары', 'Итоги Осеннего чемпионата', 'Үч күндүк чемпионатта 8 команда беттешти.', 'За три дня чемпионата сразились 8 команд.', '10–12-октябрда Бишкекте өткөн Күзгү чемпионат сезондун эң кызыктуу мелдештеринин бири болду. Сегиз команда тайпалык этаптан баштап финалга чейин күч сынашты. Финалдык оюн акыркы мүнөттөргө чейин тең салмакта өтүп, жеңүүчү бир гана улак менен аныкталды. Калыстар мелдеш учурунда бир нече сары жана кызыл карточка көрсөтүштү.', 'Осенний чемпионат, прошедший 10–12 октября в Бишкеке, стал одним из самых зрелищных турниров сезона. Восемь команд прошли путь от группового этапа до финала. Финальная игра шла на равных до последних минут, и победителя определил один-единственный улак. За время турнира судьи показали несколько жёлтых и красных карточек.', '/images/hero-ulak.jpg', TRUE, '2026-10-15 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt0005x6425apkehj8', 'Федерациянын YouTube каналында жаңы видеолор', 'Новые видео на YouTube-канале федерации', 'Мелдештерден видеолор эми Медиа бөлүмүндө да көрүнөт.', 'Видео с турниров теперь доступны и в разделе «Медиа».', 'Федерация мелдештердин эң кызыктуу учурларын YouTube каналына жүктөп баштады. Видеолорду сайттын Медиа бөлүмүнөн түз көрүүгө болот. Жакында Күзгү чемпионаттын толук оюндары жана оюнчулар менен маектер жарыяланат.', 'Федерация начала выкладывать на YouTube-канал лучшие моменты турниров. Видео можно смотреть прямо в разделе «Медиа» на сайте. Скоро будут опубликованы полные игры Осеннего чемпионата и интервью с игроками.', '/images/season-ulak.jpg', TRUE, '2026-10-12 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt0006x642p7fd9oy5', 'Жети-Өгүздө аттарды текшерүү күнү өттү', 'В Джети-Огузе прошёл день осмотра лошадей', 'Ветеринарлар 40тан ашык атты текшерип чыгышты.', 'Ветеринары осмотрели более 40 лошадей.', 'Федерация жергиликтүү ветеринарлар менен бирге мелдешке катышкан аттардын ден соолугун текшерүү күнүн уюштурду. Ысык-Көл облусунун командаларынын 40тан ашык аты текшерилип, ээлерине тоют жана кам көрүү боюнча кеңештер берилди. Мындай текшерүүлөр ар бир чоң мелдештин алдында өткөрүлөт.', 'Вместе с местными ветеринарами федерация организовала день осмотра лошадей, участвующих в турнирах. Были осмотрены более 40 лошадей команд Иссык-Кульской области, владельцы получили советы по кормлению и уходу. Такие осмотры проводятся перед каждым крупным турниром.', '/images/horses/kyrgyz-20.jpg', TRUE, '2026-10-05 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt0007x642j4dkqfm3', 'Федерация мектептер менен «Улак сабагы» долбоорун баштады', 'Федерация запустила со школами проект «Урок улака»', 'Долбоор окуучуларга улуттук оюндун тарыхын жана эрежелерин тааныштырат.', 'Проект знакомит школьников с историей и правилами национальной игры.', '«Улак сабагы» долбоорунун алкагында федерациянын чабандестери жана машыктыруучулары мектептерге барып, улак тартыштын тарыхы, эрежелери жана аттарга кам көрүү тууралуу айтып беришет. Биринчи сабактар Нарын жана Талас облустарынын мектептеринде өттү. Долбоор окуу жылынын аягына чейин уланат.', 'В рамках проекта «Урок улака» всадники и тренеры федерации приходят в школы и рассказывают об истории улак тартыша, его правилах и уходе за лошадьми. Первые уроки прошли в школах Нарынской и Таласской областей. Проект продлится до конца учебного года.', '/images/yurt-interior.jpg', TRUE, '2026-09-20 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt0008x642um9jgcjp', 'Талас командасы жаңы машыктыруучу дайындады', 'Команда Таласа назначила нового тренера', 'Командага тажрыйбалуу улакчы, мурунку курама команданын мүчөсү келди.', 'Команду возглавил опытный улакчы, бывший игрок сборной.', 'Талас облусунун командасы жаңы сезонго жаңы машыктыруучу менен даярданат. Ал жыйырма жылдан ашык ат үстүндө оюн тажрыйбасы бар жана курама команданын курамында эл аралык мелдештерге катышкан. Жаңы машыктыруучунун биринчи максаты — жаш чабандестерди командага тартуу.', 'Команда Таласской области будет готовиться к новому сезону с новым тренером. У него более двадцати лет игрового опыта, он выступал за сборную на международных турнирах. Первая цель нового тренера — привлечь в команду молодых всадников.', '/images/horses/kyrgyz-18.jpg', TRUE, '2026-09-07 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt0009x642yg99u5ge', 'Соң-Көлдө жайлоо оюндары өттү', 'На Сон-Куле прошли игры на джайлоо', 'Салттуу оюндарга миңден ашык көрүүчү келди.', 'Посмотреть традиционные игры приехали более тысячи зрителей.', 'Соң-Көлдүн жайлоосунда федерациянын колдоосу менен салттуу ат оюндары өттү. Улак тартыштан тышкары кыз куумай, оодарыш жана ат чабыш уюштурулду. Мелдешке жакынкы айылдардын командалары жана туристтер катышып, жайлоо чыныгы майрамга айланды.', 'На джайлоо Сон-Куля при поддержке федерации прошли традиционные конные игры. Кроме улак тартыша, были организованы кыз куумай, оодарыш и скачки. В состязаниях участвовали команды окрестных сёл, приехали туристы, и джайлоо превратилось в настоящий праздник.', '/images/riders-sunset.jpg', TRUE, '2026-08-15 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt000ax642ir7fe753', 'Курама команда эл аралык мелдешке даярданууда', 'Сборная готовится к международному турниру', 'Машыгуу жыйыны Ысык-Көлдүн жээгинде өтүүдө.', 'Сборы проходят на берегу Иссык-Куля.', 'Кыргызстандын курама командасы эл аралык мелдешке даярдык көрүү үчүн Ысык-Көлдүн жээгинде машыгуу жыйынын баштады. Эки жуманын ичинде оюнчулар тактика, аттар менен иштөө жана физикалык даярдык боюнча машыгышат. Курама команданын акыркы курамы жыйындын жыйынтыгы боюнча аныкталат.', 'Сборная Кыргызстана начала тренировочные сборы на берегу Иссык-Куля перед международным турниром. В течение двух недель игроки будут работать над тактикой, подготовкой лошадей и физической формой. Окончательный состав сборной определится по итогам сборов.', '/images/season-ulak.jpg', TRUE, '2026-07-20 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "NewsArticle" ("id", "titleKy", "titleRu", "excerptKy", "excerptRu", "bodyKy", "bodyRu", "imageUrl", "published", "publishedAt", "createdAt", "updatedAt")
VALUES ('cmvzrb2nt000bx642rmvb1nux', 'Нарында облустук мелдеш өттү', 'В Нарыне прошёл областной турнир', 'Мелдеш облустун алты командасын чогултту.', 'Турнир собрал шесть команд области.', 'Нарын облусунун мелдеши сезондун алдындагы маанилүү сыноо болду. Алты команда эки күн бою беттешип, эң мыкты оюнчулар республикалык курамга талапкер катары белгиленди. Мелдешти көрүүгө облустун ар кайсы айылдарынан күйөрмандар келишти.', 'Турнир Нарынской области стал важной проверкой перед сезоном. Шесть команд соревновались два дня, а лучшие игроки были отмечены как кандидаты в республиканскую сборную. Посмотреть игры приехали болельщики из разных сёл области.', '/images/hero-ulak.jpg', TRUE, '2026-06-28 09:00:00.000', '2026-11-02 21:14:04.985', '2026-11-02 21:14:04.985')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz824300008x6lc6cz8z2h6', 'Ак куу', 'Ак-Куу', '7 жаш', '7 лет', 'Бийиктиги 154 см. Аппак, назик денелүү. Мүнөзү токтоо, балдар менен да жакшы.', 'Рост 154 см. Белоснежная, изящного сложения. Спокойный нрав, хорошо ладит с детьми.', 'Ысык-Көл обл.', 'Иссык-Кульская обл.', 1700000, '', '/images/horses/arab-09.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyi0000x6i28jujh9cv', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz824300005x6lcynp5tm92', 'Айкөл', 'Айкол', '4 жаш', '4 года', 'Бийиктиги 161 см. Сулуу сары түстүү, мүнөзү жумшак. Ат үстүндө жүрүүгө даяр.', 'Рост 161 см. Красивая буланая масть, мягкий нрав. Готов к верховой езде.', 'Жалал-Абад обл.', 'Джалал-Абадская обл.', 1650000, 'https://www.youtube.com/watch?v=hODzVR8NSCw', '/images/horses/akhal-06.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyk0002x6i25nhx2g3u', TRUE, '2026-11-02 12:15:14.220', '2026-11-03 07:09:14.443')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz824300006x6lcbjr0avpz', 'Теке жорго', 'Теке-Жорго', '9 жаш', '9 лет', 'Бийиктиги 167 см. Парад жана көргөзмөлөргө катышкан тажрыйбалуу ат. Баасы келишим боюнча.', 'Рост 167 см. Опытный конь, участвовал в парадах и выставках. Цена договорная.', 'Нарын обл.', 'Нарынская обл.', NULL, 'https://www.youtube.com/watch?v=MxbTDemgmnU', '/images/horses/akhal-07.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyk0002x6i25nhx2g3u', TRUE, '2026-11-02 12:15:14.220', '2026-11-03 07:09:14.725')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz824300003x6lcclbgfpf3', 'Бекмурат', 'Бекмурат', '8 жаш', '8 лет', 'Бийиктиги 170 см. Асыл тукумдан, республикалык көргөзмөдө байге алган.', 'Рост 170 см. Из элитной линии, призёр республиканской выставки.', 'Чүй обл.', 'Чуйская обл.', 2600000, 'https://www.youtube.com/watch?v=7IR6PLjKA7g', '/images/horses/akhal-04.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyk0002x6i25nhx2g3u', TRUE, '2026-11-02 12:15:14.220', '2026-11-03 07:09:14.844')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz824300004x6lcfkddcyrr', 'Жылдыз', 'Жылдыз', '3 жаш', '3 года', 'Бийиктиги 158 см. Жаш, ойноок кунан. Келечектүү, туура багылган.', 'Рост 158 см. Молодой резвый жеребчик. Перспективный, ухоженный.', 'Ош обл.', 'Ошская обл.', 1400000, 'https://www.youtube.com/watch?v=iUXp_OpjJo4', '/images/horses/akhal-05.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyk0002x6i25nhx2g3u', TRUE, '2026-11-02 12:15:14.220', '2026-11-03 07:09:14.983')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz824300001x6lctljr9r2k', 'Шамал', 'Шамал', '7 жаш', '7 лет', 'Бийиктиги 166 см. Шамалдай тез, мелдештерде сыналган. Токтоо, ээсин тез тааныйт.', 'Рост 166 см. Быстрый, как ветер, проверен на соревнованиях. Спокойный, быстро привыкает к хозяину.', 'Ысык-Көл обл.', 'Иссык-Кульская обл.', 2150000, 'https://www.youtube.com/watch?v=ryiSfjsF86s', '/images/horses/akhal-02.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyk0002x6i25nhx2g3u', TRUE, '2026-11-02 12:15:14.220', '2026-11-03 15:39:39.172')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz824300002x6lc2fm09x24', 'Күмүш', 'Кумуш', '5 жаш', '5 лет', 'Бийиктиги 164 см. Күмүш түстүү, келбеттүү. Улак тартышка үйрөтүлүп жатат.', 'Рост 164 см. Серебристой масти, статный. Проходит подготовку к улак тартышу.', 'Талас обл.', 'Таласская обл.', 1950000, 'https://www.youtube.com/watch?v=GDlf0y_ahwY', '/images/horses/akhal-03.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyk0002x6i25nhx2g3u', TRUE, '2026-11-02 12:15:14.220', '2026-11-03 07:09:15.382')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz824300007x6lcg7l2gzfo', 'Боз жорго', 'Боз-Жорго', '6 жаш', '6 лет', 'Бийиктиги 155 см. Араб тукумундагы боз ат, жоргосу жумшак. Көргөзмөдө катышкан.', 'Рост 155 см. Серый конь арабской породы, мягкая иноходь. Участник выставок.', 'Чүй обл.', 'Чуйская обл.', 1850000, 'https://www.youtube.com/watch?v=7jIvE4X6EDY', '/images/horses/arab-08.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyi0000x6i28jujh9cv', TRUE, '2026-11-02 12:15:14.220', '2026-11-03 07:09:15.515')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz824300009x6lckjbau89o', 'Айнур', 'Айнур', '5 жаш', '5 лет', 'Бийиктиги 153 см. Таза кандуу араб бээси, келбеттүү башы жана кооз жалы бар.', 'Рост 153 см. Чистокровная арабская кобыла, выразительная голова и красивая грива.', 'Ош обл.', 'Ошская обл.', 2050000, '', '/images/horses/arab-10.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyi0000x6i28jujh9cv', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz82431000ax6lcl80flkt3', 'Мөлтүр', 'Молтур', '4 жаш', '4 года', 'Бийиктиги 152 см. Жаш жана шайыр, үйрөтүүгө оңой. Ден соолугу текшерилген.', 'Рост 152 см. Молодой и бодрый, легко обучается. Ветеринарный осмотр пройден.', 'Талас обл.', 'Таласская обл.', 1550000, '', '/images/horses/arab-11.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyi0000x6i28jujh9cv', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz82431000bx6lc2cg7eix1', 'Ак шумкар', 'Ак-Шумкар', '8 жаш', '8 лет', 'Бийиктиги 156 см. Тажрыйбалуу айгыр, тукумдук иш үчүн ылайыктуу.', 'Рост 156 см. Опытный жеребец, подходит для племенной работы.', 'Чүй обл.', 'Чуйская обл.', 2250000, '', '/images/horses/arab-12.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyi0000x6i28jujh9cv', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz82431000cx6lc2prxv9zv', 'Наркыз', 'Наркыз', '6 жаш', '6 лет', 'Бийиктиги 151 см. Египет линиясындагы араб бээси, өтө сулуу кыймылы бар.', 'Рост 151 см. Арабская кобыла египетской линии, очень красивые движения.', 'Жалал-Абад обл.', 'Джалал-Абадская обл.', 1800000, '', '/images/horses/arab-13.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyi0000x6i28jujh9cv', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz82431000dx6lcswni3cxq', 'Сырдак', 'Сырдак', '9 жаш', '9 лет', 'Бийиктиги 157 см. Эл аралык көргөзмөлөрдө жеңген атактуу айгыр. Баасы келишим боюнча.', 'Рост 157 см. Знаменитый жеребец, победитель международных выставок. Цена договорная.', 'Баткен обл.', 'Баткенская обл.', NULL, '', '/images/horses/arab-14.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyi0000x6i28jujh9cv', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz82431000ex6lcwo18g6o1', 'Тору ат', 'Тору-Ат', '5 жаш', '5 лет', 'Бийиктиги 148 см. Кыргыз тукуму, тоодо чыдамкай. Жайлоодо эркин багылган.', 'Рост 148 см. Кыргызская порода, вынослив в горах. Вырос на вольном выпасе в джайлоо.', 'Жалал-Абад обл.', 'Джалал-Абадская обл.', 620000, '', '/images/horses/kyrgyz-15.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyj0001x6i20clc5ydt', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz82431000fx6lc7zfkfx7o', 'Кара жал', 'Кара-Жал', '4 жаш', '4 года', 'Бийиктиги 147 см. Кара жалдуу, бекем туяктуу. Тоо жолдоруна көнгөн.', 'Рост 147 см. Черногривый, с крепкими копытами. Привычен к горным тропам.', 'Жалал-Абад обл.', 'Джалал-Абадская обл.', 580000, '', '/images/horses/kyrgyz-16.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyj0001x6i20clc5ydt', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz82431000gx6lcdfwzs00a', 'Көк жал', 'Кок-Жал', '7 жаш', '7 лет', 'Бийиктиги 150 см. Соң-Көлдүн жайлоосунан. Улак тартышта тажрыйбасы бар.', 'Рост 150 см. С джайлоо Сон-Куля. Есть опыт в улак тартыше.', 'Нарын обл.', 'Нарынская обл.', 890000, '', '/images/horses/kyrgyz-17.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyj0001x6i20clc5ydt', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz82431000hx6lcrcv777q7', 'Чабдар', 'Чабдар', '8 жаш', '8 лет', 'Бийиктиги 151 см. Ээр-токум менен үйрөтүлгөн, тоо саякаттарына ылайыктуу.', 'Рост 151 см. Приучен к седлу, подходит для конных походов в горах.', 'Ысык-Көл обл.', 'Иссык-Кульская обл.', 760000, '', '/images/horses/kyrgyz-18.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyj0001x6i20clc5ydt', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz82431000ix6lc5xpa2z4o', 'Жээрде', 'Жээрде', '6 жаш', '6 лет', 'Бийиктиги 149 см. Алай өрөөнүнөн, суукка чыдамкай. Мүнөзү жоош.', 'Рост 149 см. Из Алайской долины, вынослив к холоду. Спокойный нрав.', 'Ош обл.', 'Ошская обл.', 690000, '', '/images/horses/kyrgyz-19.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyj0001x6i20clc5ydt', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz82431000jx6lc9mcdq2nx', 'Каракуш', 'Каракуш', '3 жаш', '3 года', 'Бийиктиги 146 см. Жаш кунан, Жети-Өгүздүн жайлоосунда өскөн.', 'Рост 146 см. Молодой жеребчик, вырос на пастбищах Джети-Огуза.', 'Ысык-Көл обл.', 'Иссык-Кульская обл.', 540000, '', '/images/horses/kyrgyz-20.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyj0001x6i20clc5ydt', TRUE, '2026-11-02 12:15:14.220', '2026-11-02 12:15:14.220')
ON CONFLICT DO NOTHING;

INSERT INTO "HorseListing" ("id", "nameKy", "nameRu", "ageKy", "ageRu", "descriptionKy", "descriptionRu", "locationKy", "locationRu", "price", "videoUrl", "imageUrl", "photoUrls", "sellerName", "sellerPhone", "sellerWhatsapp", "sellerTelegram", "sellerInstagram", "categoryId", "published", "createdAt", "updatedAt")
VALUES ('cmvz824300000x6lcj2p9ynd4', 'Алтын жал', 'Алтын-Жал', '6 жаш', '6 лет', 'Бийиктиги 168 см. Жылтыраган алтын түстүү, жеңил кадамдуу. Узак аралыкка чыдамкай.', 'Рост 168 см. Золотистая масть с блеском, лёгкий шаг. Вынослив на длинные дистанции.', 'Чүй обл.', 'Чуйская обл.', 2400000, 'https://www.youtube.com/watch?v=UVPagGN8PFE', '/images/horses/akhal-01.jpg', ARRAY[]::TEXT[], '', '', '', '', '', 'cmvv5fvyk0002x6i25nhx2g3u', TRUE, '2026-11-02 12:15:14.220', '2026-11-03 07:09:15.114')
ON CONFLICT DO NOTHING;

UPDATE "Player" SET "birthYear" = 1988 WHERE "id" = 'cmvv5fvyo000nx6i2pnyjj4ve' AND "birthYear" IS NULL;

INSERT INTO "PlayerCard" ("id", "playerId", "color", "date", "tournamentId", "reasonKy", "reasonRu", "createdAt", "updatedAt")
VALUES ('cmvz8epv70002x684r4en3faq', 'cmvv5fvyo000nx6i2pnyjj4ve', 'red', '2026-10-11 12:00:00.000', 'cmvv5fvyn000gx6i2p8eaz951', 'Каршылашты камчы менен уруу', 'Удар соперника камчой', '2026-11-02 12:25:02.322', '2026-11-02 12:25:02.322')
ON CONFLICT DO NOTHING;

UPDATE "Player" SET "birthYear" = 1995 WHERE "id" = 'cmvv5fvyq000ux6i2at6oqooh' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 2002 WHERE "id" = 'cmvv5fvyq000rx6i2yk61oyzw' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 1990 WHERE "id" = 'cmvv5fvyq000sx6i214ev3elj' AND "birthYear" IS NULL;

INSERT INTO "PlayerCard" ("id", "playerId", "color", "date", "tournamentId", "reasonKy", "reasonRu", "createdAt", "updatedAt")
VALUES ('cmvz8epv70006x684nqrlgwx4', 'cmvv5fvyq000sx6i214ev3elj', 'yellow', '2026-08-30 12:00:00.000', NULL, 'Оюнду атайылап кечиктирүү', 'Затягивание игры', '2026-11-02 12:25:02.322', '2026-11-03 10:22:36.056')
ON CONFLICT DO NOTHING;

UPDATE "Player" SET "birthYear" = 1997 WHERE "id" = 'cmvv5fvyq000tx6i2pu9efpwa' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 2004 WHERE "id" = 'cmvv5fvyq000yx6i2hls7fvsl' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 1992 WHERE "id" = 'cmvv5fvyq000xx6i248941p4p' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 1999 WHERE "id" = 'cmvv5fvyq000wx6i2llw7z7wz' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 1987 WHERE "id" = 'cmvv5fvyq000zx6i2n92kemai' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 1994 WHERE "id" = 'cmvv5fvyr0013x6i2q8sl6gmi' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 2001 WHERE "id" = 'cmvv5fvyr0011x6i2d6nz5vpj' AND "birthYear" IS NULL;

INSERT INTO "PlayerCard" ("id", "playerId", "color", "date", "tournamentId", "reasonKy", "reasonRu", "createdAt", "updatedAt")
VALUES ('cmvz8epv70009x6847fg833o8', 'cmvv5fvyr0011x6i2d6nz5vpj', 'red', '2026-10-12 12:00:00.000', 'cmvv5fvyn000gx6i2p8eaz951', 'Атты кооптуу башкаруу', 'Опасная езда', '2026-11-02 12:25:02.322', '2026-11-02 12:25:02.322')
ON CONFLICT DO NOTHING;

UPDATE "Player" SET "birthYear" = 1989 WHERE "id" = 'cmvv5fvyr0012x6i2atbfk900' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 1996 WHERE "id" = 'cmvv5fvyr0014x6i2f8nefxcd' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 2003 WHERE "id" = 'cmvv5fvys0016x6i2eg4w6cqc' AND "birthYear" IS NULL;

INSERT INTO "PlayerCard" ("id", "playerId", "color", "date", "tournamentId", "reasonKy", "reasonRu", "createdAt", "updatedAt")
VALUES ('cmvz8epv7000ax684utgeultn', 'cmvv5fvys0016x6i2eg4w6cqc', 'red', '2026-09-21 12:00:00.000', NULL, 'Атты кооптуу башкаруу', 'Опасная езда', '2026-11-02 12:25:02.322', '2026-11-02 12:25:02.322')
ON CONFLICT DO NOTHING;

UPDATE "Player" SET "birthYear" = 1986 WHERE "id" = 'cmvv5fvyo000mx6i2g01ev4u2' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 1993 WHERE "id" = 'cmvv5fvyo000px6i2ry88e15b' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 2000 WHERE "id" = 'cmvv5fvyo000ox6i2ijonzo80' AND "birthYear" IS NULL;

INSERT INTO "PlayerCard" ("id", "playerId", "color", "date", "tournamentId", "reasonKy", "reasonRu", "createdAt", "updatedAt")
VALUES ('cmvz8epv70001x6846nhako7v', 'cmvv5fvyo000ox6i2ijonzo80', 'red', '2026-10-12 12:00:00.000', 'cmvv5fvyn000gx6i2p8eaz951', 'Оюнду атайылап кечиктирүү', 'Затягивание игры', '2026-11-02 12:25:02.322', '2026-11-02 12:25:02.322')
ON CONFLICT DO NOTHING;

UPDATE "Player" SET "birthYear" = 1991 WHERE "id" = 'cmvv5fvys0017x6i2qegzhh5w' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 1993 WHERE "id" = 'cmvv5fvyt001cx6i29jq1fyb6' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 2000 WHERE "id" = 'cmvv5fvyt001ex6i2zek8qivq' AND "birthYear" IS NULL;

INSERT INTO "PlayerCard" ("id", "playerId", "color", "date", "tournamentId", "reasonKy", "reasonRu", "createdAt", "updatedAt")
VALUES ('cmvz8epv70005x684om0sfjqm', 'cmvv5fvyt001ex6i2zek8qivq', 'red', '2026-10-12 12:00:00.000', 'cmvv5fvyn000gx6i2p8eaz951', 'Каршылашты камчы менен уруу', 'Удар соперника камчой', '2026-11-02 12:25:02.322', '2026-11-02 12:25:02.322')
ON CONFLICT DO NOTHING;

UPDATE "Player" SET "birthYear" = 1988 WHERE "id" = 'cmvv5fvyt001bx6i2g4k3k2l4' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 1995 WHERE "id" = 'cmvv5fvyt001dx6i2d32coi0k' AND "birthYear" IS NULL;

INSERT INTO "PlayerCard" ("id", "playerId", "color", "date", "tournamentId", "reasonKy", "reasonRu", "createdAt", "updatedAt")
VALUES ('cmvz8epv70003x684jbtw3uzo', 'cmvv5fvyt001dx6i2d32coi0k', 'yellow', '2026-09-14 12:00:00.000', NULL, 'Калыстын чечимине каршы чыгуу', 'Пререкания с судьёй', '2026-11-02 12:25:02.322', '2026-11-02 12:25:02.322')
ON CONFLICT DO NOTHING;

UPDATE "Player" SET "birthYear" = 1998 WHERE "id" = 'cmvv5fvys0018x6i2d98vgydk' AND "birthYear" IS NULL;

UPDATE "Player" SET "birthYear" = 1986 WHERE "id" = 'cmvv5fvys0019x6i28pce7wa2' AND "birthYear" IS NULL;

UPDATE "Tournament" SET "prize1Ky" = '1 000 000 сом' WHERE "id" = 'cmvv5fvyn000hx6i26kjc7gjv' AND "prize1Ky" = '';

UPDATE "Tournament" SET "prize1Ru" = '1 000 000 сом' WHERE "id" = 'cmvv5fvyn000hx6i26kjc7gjv' AND "prize1Ru" = '';

UPDATE "Tournament" SET "prize2Ky" = 'Автоунаа' WHERE "id" = 'cmvv5fvyn000hx6i26kjc7gjv' AND "prize2Ky" = '';

UPDATE "Tournament" SET "prize2Ru" = 'Автомобиль' WHERE "id" = 'cmvv5fvyn000hx6i26kjc7gjv' AND "prize2Ru" = '';

UPDATE "Tournament" SET "prize3Ky" = 'Тулпар ат' WHERE "id" = 'cmvv5fvyn000hx6i26kjc7gjv' AND "prize3Ky" = '';

UPDATE "Tournament" SET "prize3Ru" = 'Скакун' WHERE "id" = 'cmvv5fvyn000hx6i26kjc7gjv' AND "prize3Ru" = '';

UPDATE "Tournament" SET "prize1Ky" = '500 000 сом' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "prize1Ky" = '';

UPDATE "Tournament" SET "prize1Ru" = '500 000 сом' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "prize1Ru" = '';

UPDATE "Tournament" SET "prize2Ky" = '300 000 сом' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "prize2Ky" = '';

UPDATE "Tournament" SET "prize2Ru" = '300 000 сом' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "prize2Ru" = '';

UPDATE "Tournament" SET "prize3Ky" = '150 000 сом' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "prize3Ky" = '';

UPDATE "Tournament" SET "prize3Ru" = '150 000 сом' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "prize3Ru" = '';

UPDATE "Tournament" SET "winner1Ky" = 'Ала-Тоо' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "winner1Ky" = '';

UPDATE "Tournament" SET "winner1Ru" = 'Ала-Тоо' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "winner1Ru" = '';

UPDATE "Tournament" SET "winner2Ky" = 'Нарын' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "winner2Ky" = '';

UPDATE "Tournament" SET "winner2Ru" = 'Нарын' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "winner2Ru" = '';

UPDATE "Tournament" SET "winner3Ky" = 'Ош' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "winner3Ky" = '';

UPDATE "Tournament" SET "winner3Ru" = 'Ош' WHERE "id" = 'cmvv5fvyn000gx6i2p8eaz951' AND "winner3Ru" = '';
