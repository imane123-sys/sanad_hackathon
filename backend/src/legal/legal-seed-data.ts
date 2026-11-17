import { LegalCategory } from '@prisma/client';

export interface SeedLegalResource {
  title: string;
  description: string;
  legalReference: string;
  officialSource: string;
  category: LegalCategory;
  language: string;
  publishedAt: Date;
  lastVerifiedAt: Date | null;
  isActive: boolean;
}

export const VERIFIED_MOROCCAN_LEGAL_SEEDS: SeedLegalResource[] = [
  {
    title: 'القانون 103-13 — تجريم العنف ضد النساء وتشديد العقوبات في محيط الأسرة',
    description:
      'يُعرّف القانون رقم 103-13 العنف ضد النساء بكل فعل مادي أو معنوي أو امتناع يترتب عليه ضرر جسدي أو نفسي أو جنسي أو اقتصادي. كما يُضاعف العقوبات السجنية والغرامات المالية عند ارتكاب العنف من قِبل الزوج، الطليق، الخاطب، أو أحد الفروع أو الأصول.',
    legalReference: 'القانون رقم 103-13، المواد 1 إلى 5 والمادة 400 وما يليها',
    officialSource: 'الجريدة الرسمية عدد 6655 بتاريخ 12 مارس 2018 / ظهير شريف رقم 1-18-19',
    category: LegalCategory.CRIMINAL_LAW_VIOLENCE,
    language: 'ar',
    publishedAt: new Date('2018-03-12'),
    lastVerifiedAt: new Date('2026-01-15'),
    isActive: true,
  },
  {
    title: 'Loi n° 103-13 — Répression des violences faites aux femmes et peines aggravées',
    description:
      'Définit et sanctionne les violences physiques, psychologiques, sexuelles et économiques. Les peines de réclusion criminelle et les amendes sont doublées lorsque l’auteur est le conjoint, l’ex-conjoint, le fiancé ou une personne ayant autorité sur la victime.',
    legalReference: 'Loi n° 103-13, Articles 1 à 5 et Article 400 modifiant le Code Pénal',
    officialSource: 'Bulletin Officiel n° 6655 du 12 mars 2018 / Dahir n° 1-18-19',
    category: LegalCategory.CRIMINAL_LAW_VIOLENCE,
    language: 'fr',
    publishedAt: new Date('2018-03-12'),
    lastVerifiedAt: new Date('2026-01-15'),
    isActive: true,
  },
  {
    title: 'قانون المسطرة الجنائية — أوامر الحماية القضائية العاجلة وإبعاد المعتدي',
    description:
      'يُخول للنيابة العامة ولقاضي التحقيق وللمحكمة اتخاذ تدابير حمائية فورية تشمل: إبعاد المعتدي فوراً عن بيت الزوجية، منعه من الاقتراب من الضحية أو أبنائها، سحب أي سلاح في حوزته، وإنذاره بعدم التعرض تحت طائلة العقوبات الحبسية النافذة.',
    legalReference: 'قانون المسطرة الجنائية، المادتان 82-5-1 و82-5-2',
    officialSource: 'القانون رقم 103-13 المتمم للمسطرة الجنائية / وزارة العدل المغربية',
    category: LegalCategory.CIVIL_PROTECTION,
    language: 'ar',
    publishedAt: new Date('2018-09-12'),
    lastVerifiedAt: new Date('2026-02-01'),
    isActive: true,
  },
  {
    title: 'Code de Procédure Pénale — Mesures conservatoires d’éloignement et ordonnances de protection',
    description:
      'Habilite le Procureur du Roi ou le juge d’instruction à ordonner l’expulsion immédiate du conjoint violent du domicile conjugal, l’interdiction formelle de s’approcher de la victime et la restitution de ses effets personnels en urgence.',
    legalReference: 'Code de Procédure Pénale marocain, Articles 82-5-1 et 82-5-2',
    officialSource: 'Ministère de la Justice du Maroc / Bulletin Officiel',
    category: LegalCategory.CIVIL_PROTECTION,
    language: 'fr',
    publishedAt: new Date('2018-09-12'),
    lastVerifiedAt: new Date('2026-02-01'),
    isActive: true,
  },
  {
    title: 'مدونة الأسرة — دعوى التطليق للضرر وحفظ حقوق الزوجة المستحقة',
    description:
      'يحق للمرأة المتضررة من أي تصرف أو عنف أو إخلال بالواجبات الزوجية طلب التطليق للضرر. تُقبل كافة وسائل الإثبات الشرعية والقانونية بما فيها الشواهد الطبية المثبتة للعجز، محاضر الضابطة القضائية، المراسلات الرقمية وشهادة الشهود.',
    legalReference: 'مدونة الأسرة المغربية، المواد 98 إلى 101',
    officialSource: 'الجريدة الرسمية عدد 5184 بتاريخ 5 فبراير 2004 / ظهير شريف رقم 1-04-22',
    category: LegalCategory.FAMILY_LAW,
    language: 'ar',
    publishedAt: new Date('2004-02-05'),
    lastVerifiedAt: new Date('2026-01-20'),
    isActive: true,
  },
  {
    title: 'Code de la Famille — Divorce judiciaire pour préjudice (Tatliq li-Darar)',
    description:
      'Chaque épouse victime d’un préjudice physique, moral ou matériel rendant la vie commune intolérable peut obtenir la dissolution judiciaire du lien conjugal avec octroi des indemnités de préjudice et conservation intégrale de ses droits légaux.',
    legalReference: 'Code de la Famille (Moudawana), Articles 98 à 101',
    officialSource: 'Bulletin Officiel n° 5184 du 5 février 2004 / Dahir n° 1-04-22',
    category: LegalCategory.FAMILY_LAW,
    language: 'fr',
    publishedAt: new Date('2004-02-05'),
    lastVerifiedAt: new Date('2026-01-20'),
    isActive: true,
  },
  {
    title: 'مدونة الأسرة — أولوية الأم في الحضانة وإلزامية توفير سكن مستقل للمحضون',
    description:
      'تُسند حضانة الأطفال للأم في المرتبة الأولى بقوة القانون، ولا تسقط عنها إلا بشروط دقيقة ومعللة. يلزم الأب بتوفير سكن مستقل ومحترم للمحضونين وأمهم الحاضنة أو أداء واجب الإيجار المعتمد قضائياً.',
    legalReference: 'مدونة الأسرة المغربية، المواد 163 إلى 179',
    officialSource: 'ظهير شريف رقم 1-04-22 صادر بتنفيذ قانون مدونة الأسرة',
    category: LegalCategory.FAMILY_LAW,
    language: 'ar',
    publishedAt: new Date('2004-02-05'),
    lastVerifiedAt: new Date('2026-01-18'),
    isActive: true,
  },
  {
    title: 'مدونة الأسرة — النفقة الشاملة والتنفيذ المعجل بحكم القانون',
    description:
      'تشمل النفقة الغذاء والكسوة والعلاج والتعليم وتكاليف السكن ومصاريف الأعياد وفق المعايير المعمول بها. حُكم النفقة مشمول بالنفاذ المعجل بقوة القانون ولا يوقفه الطعن بالاستئناف حفاظاً على مصلحة الأبناء والزوجة.',
    legalReference: 'مدونة الأسرة المغربية، المواد 190 إلى 205',
    officialSource: 'ظهير شريف رقم 1-04-22 صادر بتنفيذ قانون مدونة الأسرة',
    category: LegalCategory.FAMILY_LAW,
    language: 'ar',
    publishedAt: new Date('2004-02-05'),
    lastVerifiedAt: new Date('2026-01-18'),
    isActive: true,
  },
  {
    title: 'مجموعة القانون الجنائي — مكافحة الابتزاز والتشهير الرقمي ونشر الصور الخاصة',
    description:
      'يُعاقب بالحبس من سنة إلى 3 سنوات وغرامة مالية من ألفين إلى عشرين ألف درهم كل من قام عمداً بالتقاط أو تسجيل أو بث أو توزيع صور أو محادثات شخصية أو حميمية لشخص دون موافقته الصريحة عبر الأنظمة المعلوماتية أو منصات التواصل.',
    legalReference: 'مجموعة القانون الجنائي المغربي، الفصول 447-1 و447-2 و447-3',
    officialSource: 'القانون رقم 103-13 المغير للمجموعة الجنائية (ظهير رقم 1-59-413)',
    category: LegalCategory.CRIMINAL_LAW_VIOLENCE,
    language: 'ar',
    publishedAt: new Date('2018-09-12'),
    lastVerifiedAt: new Date('2026-02-10'),
    isActive: true,
  },
  {
    title: 'Code Pénal — Infractions relatives aux atteintes à la vie privée et cyberharcèlement',
    description:
      'Sanctionne de 1 à 3 ans de prison et d’une amende quiconque diffuse des propos, photos ou vidéos intimes sans l’accord de la personne concernée. La sanction est portée au maximum si l’infraction est commise par un conjoint ou envers un mineur.',
    legalReference: 'Code Pénal Marocain, Articles 447-1, 447-2 et 447-3',
    officialSource: 'Bulletin Officiel n° 6655 / Dahir n° 1-18-19',
    category: LegalCategory.CRIMINAL_LAW_VIOLENCE,
    language: 'fr',
    publishedAt: new Date('2018-09-12'),
    lastVerifiedAt: new Date('2026-02-10'),
    isActive: true,
  },
  {
    title: 'المرسوم الملكي 514-65 — نظام المساعدة القضائية المجانية وتعيين محامٍ رسمي',
    description:
      'يضمن للمتقاضية المعوزة حق الاستفادة من المساعدة القضائية بقوة القانون، بحيث يُعيّن لها نقيب المحامين محامياً للدفاع عن حقوقها مجاناً، مع الإعفاء التام من جميع الرسوم القضائية ومصاريف إجراءات التبليغ والتنفيذ والخبرة الطبية.',
    legalReference: 'المرسوم الملكي بمثابة قانون رقم 514-65 المنظم للمساعدة القضائية',
    officialSource: 'الجريدة الرسمية عدد 2824 بتاريخ 16 نوفمبر 1966 / وزارة العدل',
    category: LegalCategory.LEGAL_PROCEDURES,
    language: 'ar',
    publishedAt: new Date('1966-11-16'),
    lastVerifiedAt: new Date('2026-01-25'),
    isActive: true,
  },
  {
    title: 'Décret Royal n° 514-65 — Assistance Juridictionnelle Gratuite et commission d’office',
    description:
      'Permet à toute femme sans ressources suffisantes d’obtenir gratuitement un avocat commis par le Bâtonnier et d’être entièrement exonérée des taxes judiciaires, droits d’enregistrement et frais de notification d’huissier de justice.',
    legalReference: 'Décret Royal portant Loi n° 514-65',
    officialSource: 'Ministère de la Justice / Barreau des Avocats du Maroc',
    category: LegalCategory.LEGAL_PROCEDURES,
    language: 'fr',
    publishedAt: new Date('1966-11-16'),
    lastVerifiedAt: new Date('2026-01-25'),
    isActive: true,
  },
  {
    title: 'القانون 09-08 — حماية المعطيات الشخصية والسرية المطلقة لملفات الضحايا',
    description:
      'يُلزم المؤسسات والمنصات بالحفاظ على السر المهني والسرية التامة لجميع البيانات والشكايات وسجلات الدلائل. يحظر القانون حظراً قاطعاً نقل أو تبادل أي معلومة شخصية دون إذن مكتوب وصريح من صاحبة الشأن.',
    legalReference: 'القانون رقم 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي',
    officialSource: 'الجريدة الرسمية عدد 5711 بتاريخ 23 فبراير 2009 / اللجنة الوطنية لمراقبة حماية المعطيات (CNDP)',
    category: LegalCategory.HUMAN_RIGHTS,
    language: 'ar',
    publishedAt: new Date('2009-02-23'),
    lastVerifiedAt: new Date('2026-02-05'),
    isActive: true,
  },
  {
    title: 'Loi n° 09-08 — Protection des données à caractère personnel et confidentialité probatoire',
    description:
      'Consacre le secret professionnel strict, le chiffrement et la sécurité des éléments de preuve. Interdit formellement toute divulgation, transfert ou exploitation des données sensibles des utilisatrices sans consentement éclairé préalable.',
    legalReference: 'Loi n° 09-08, Dahir n° 1-09-15',
    officialSource: 'Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP)',
    category: LegalCategory.HUMAN_RIGHTS,
    language: 'fr',
    publishedAt: new Date('2009-02-23'),
    lastVerifiedAt: new Date('2026-02-05'),
    isActive: true,
  },
  {
    title: 'مدونة الشغل — حظر التمييز ومكافحة التحرش المهني ضد الأجيرات في فضاء العمل',
    description:
      'تمنع مدونة الشغل في المادتين 9 و40 أي تمييز ضد المرأة في التوظيف أو الأجر أو الترقية، كما تعتبر كل تحرش جنسي أو نفسي يمارسه المشغل أو رئيس العمل خطأً جسيماً يوجب التعويض الكامل عن الطرد التعسفي مع الملاحقة الجنائية.',
    legalReference: 'القانون رقم 65-99 بمثابة مدونة الشغل، المادتان 9 و40',
    officialSource: 'الجريدة الرسمية عدد 5167 بتاريخ 8 دجنبر 2003 / ظهير شريف رقم 1-03-194',
    category: LegalCategory.LABOR_DISCRIMINATION,
    language: 'ar',
    publishedAt: new Date('2003-12-08'),
    lastVerifiedAt: new Date('2026-01-30'),
    isActive: true,
  },
  {
    title: 'مسودة التدابير التكميلية لإيواء النساء ضحايا الاعتداء والاستجابة السريعة',
    description:
      'مبادئ توجيهية استرشادية حول تدابير الإيواء الاستعجالي والمرافقة المجتمعية. هذا النص ما زال قيد الدراسة الفنية ولم يصدر بعد في الجريدة الرسمية كمقتضى تنفيذي نهائي.',
    legalReference: 'مشروع مسطرة التدبير الاستعجالي لمراكز الإيواء (قيد المراجعة الفنية)',
    officialSource: 'لجنة التنسيق القطاعي للمساعدة الاجتماعية (في طور المصادقة)',
    category: LegalCategory.CIVIL_PROTECTION,
    language: 'ar',
    publishedAt: new Date('2025-11-10'),
    lastVerifiedAt: null, // Note: Set to null to clearly showcase content requiring further verification!
    isActive: true,
  },
];
