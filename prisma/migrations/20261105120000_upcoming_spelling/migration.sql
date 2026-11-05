-- The Kyrgyz word for "upcoming" is "алдыдагы": the calendar text's default, and the text already saved.
ALTER TABLE "SiteSettings" ALTER COLUMN "calendarTextKy" SET DEFAULT 'Федерация жыл бою республикалык жана эл аралык улак тартыш мелдештерин уюштурат. Жазгы ачылыштан тартып Нооруз, Эгемендүүлүк күнү жана кышкы кубокторго чейин ар бир сезондун өз чабышы бар. Төмөндө алдыдагы мелдештер жана өткөн турнирлердин жыйынтыктары.';
UPDATE "SiteSettings" SET "calendarTextKy" = replace("calendarTextKy", 'алдагы', 'алдыдагы');
