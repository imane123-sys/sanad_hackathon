export interface LegalArticleReference {
  code: string;
  article: string;
  titleFr: string;
  titleAr: string;
  summaryFr: string;
  summaryAr: string;
  summaryDarija: string;
  officialSource: string;
  keywords: string[];
}

export const MOROCCAN_LEGAL_CORPUS: LegalArticleReference[] = [
  {
    code: 'LOI_103_13',
    article: 'Loi n° 103-13, Articles 1 à 5',
    titleFr: 'Lutte contre les violences faites aux femmes — Définitions et sanctions',
    titleAr: 'القانون رقم 103-13 — محاربة العنف ضد النساء (التعاريف والعقوبات)',
    summaryFr:
      'Définit et réprime sévèrement les violences physiques, psychologiques, sexuelles et économiques. Les peines sont doublées lorsque l’auteur est l’époux, le fiancé, le tuteur ou une personne ayant autorité.',
    summaryAr:
      'يُعرّف ويجرّم العنف الجسدي، النفسي، الجنسي والاقتصادي ضد النساء. وتُضاعف العقوبات الزجرية إذا كان مرتكب الفعل زوجاً أو خاطباً أو وصياً أو شخصاً له سلطة على الضحية.',
    summaryDarija:
      'القانون 103-13 كيعاقب بالحبس والغرامة على أي ضرب، سب، إهانة، عنف جنسي ولا حرمان من الفلوس من طرف الراجل ولا الخطيب، والعقوبة كتدوبل فالعنف الزوجي.',
    officialSource: 'Bulletin Officiel n° 6655 du 12 mars 2018 / Dahir n° 1-18-19',
    keywords: [
      'violence',
      'frapper',
      'coups',
      'menace',
      'injure',
      'عنف',
      'ضرب',
      'اعتداء',
      'إهانة',
      'سب',
      'كيهددني',
      'كيضربني',
      'كيعنفني',
      'سلخني',
      'معيور',
    ],
  },
  {
    code: 'CPP_82_5',
    article: 'Code de Procédure Pénale, Article 82-5-1 & 82-5-2',
    titleFr: 'Ordonnances de protection et éloignement immédiat de l’agresseur',
    titleAr: 'قانون المسطرة الجنائية — أوامر الحماية وتدبير إبعاد المعتدي',
    summaryFr:
      'Permet au procureur du Roi ou au juge d’ordonner l’expulsion immédiate du conjoint violent du domicile conjugal, l’interdiction de s’approcher de la victime et de ses enfants, la confiscation de ses armes, et l’injonction de suivi psychologique.',
    summaryAr:
      'يخول للنيابة العامة أو لقاضي التحقيق أو للمحكمة إصدار تدبير حمائي فوري يقضي بإبعاد الزوج المعتدي عن بيت الزوجية، ومنعه من الاقتراب من الضحية أو أبنائها، وسحب سلاحه، وإخضاعه لعلاج نفسي.',
    summaryDarija:
      'وكيل الملك كيقدر يخرج الراجل اللي كيعنف من دار الزوجية ويمنعو يقرب ليك ولا لولادك ويعطيك أمر بالحماية الفورية.',
    officialSource: 'Modifié par la Loi n° 103-13 / Code de Procédure Pénale marocain',
    keywords: [
      'éloignement',
      'protection',
      'domicile conjugal',
      'expulsion',
      'interdiction d’approcher',
      'إبعاد',
      'حماية',
      'بيت الزوجية',
      'طرد',
      'منع الاقتراب',
      'يجري عليا',
      'نخرجو من الدار',
      'ما يقربش ليا',
    ],
  },
  {
    code: 'MOUDAWANA_PREJUDICE',
    article: 'Code de la Famille (Moudawana), Articles 98 à 101',
    titleFr: 'Divorce pour préjudice (Tatliq li-Darar)',
    titleAr: 'مدونة الأسرة — التطليق للضرر (المواد 98 إلى 101)',
    summaryFr:
      'Chaque épouse victime d’un préjudice physique, moral ou matériel rendant la vie commune impossible peut demander le divorce judiciaire pour préjudice. Les certificats médicaux, témoignages, messages et procès-verbaux de police constituent des preuves recevables.',
    summaryAr:
      'يحق للزوجة طلب التطليق للضرر عند إخلال الزوج بواجباته أو ارتكابه أي تصرف يلحق بها أذى مادياً أو معنوياً، وتُثبت الواقعة بالشهادات الطبية، والرسائل، ومحاضر الشرطة، وشهادة الشهود.',
    summaryDarija:
      'تقدري تطلبي الطلاق للضرر إلى كان كيتعدى عليك وتثبتيه بالشهادة الطبية ولا الميساجات ولا الشكاية عند البوليس وتاخدي حقوقك ومستحقاتك كاملة.',
    officialSource: 'Dahir n° 1-04-22 du 3 février 2004 portant promulgation de la Moudawana',
    keywords: [
      'divorce',
      'tatliq',
      'darar',
      'préjudice',
      'moudawana',
      'طلاق',
      'تطليق',
      'ضرر',
      'مدونة الأسرة',
      'نطلق منو',
      'بغيت نتفارق',
      'حقوقي ف الطلاق',
    ],
  },
  {
    code: 'MOUDAWANA_GARDE',
    article: 'Code de la Famille (Moudawana), Articles 163 à 179',
    titleFr: 'Garde des enfants (Hadana) et logement des enfants',
    titleAr: 'مدونة الأسرة — الحضانة وسكن المحضون (المواد 163 إلى 179)',
    summaryFr:
      'La garde des enfants revient prioritairement à la mère. Le père est tenu d’assurer les frais d’entretien et un logement décent et indépendant pour la gardienne et ses enfants mineurs.',
    summaryAr:
      'تُسند الحضانة في المرتبة الأولى للأم. ويلزم الأب بأداء واجبات النفقة وتوفير سكن مستقل ولائق للمحضونين وأمهم الحاضنة.',
    summaryDarija:
      'الحضانة ديال الولاد كتبقى للأم هي اللولة، والراجل مفروض عليه يخلص النفقة ويوفر سكن لائق ليك ولولادك.',
    officialSource: 'Dahir n° 1-04-22 / Code de la Famille',
    keywords: [
      'garde',
      'hadana',
      'enfants',
      'logement',
      'pension',
      'حضانة',
      'أطفال',
      'أولاد',
      'سكن المحضون',
      'ولادي',
      'ياخد ليا ولادي',
      'حضانة الدراري',
    ],
  },
  {
    code: 'MOUDAWANA_NAFAQA',
    article: 'Code de la Famille (Moudawana), Articles 190 à 205',
    titleFr: 'Pension alimentaire (Nafaqa) et son exécution prioritaire',
    titleAr: 'مدونة الأسرة — النفقة وإلزامية أدائها الفوري',
    summaryFr:
      'La pension alimentaire comprend l’alimentation, l’habillement, les soins médicaux, l’instruction des enfants et le logement. Le jugement de pension est revêtu de la force exécutoire par provision.',
    summaryAr:
      'تشمل النفقة الغذاء والكسوة والعلاج والتعليم وسكنى المحضون، وتحدد حسب دخل الملزم بها. ويُنفذ الحكم بالنفقة بصيغة التنفيذ المعجل بقوة القانون.',
    summaryDarija:
      'النفقة مفروضة على الراجل من ماكلة ولباس وتطبيب ومدرسة، وحكم النفقة كيتنفذ فالحين وبلا تعقيدات.',
    officialSource: 'Dahir n° 1-04-22 / Code de la Famille',
    keywords: [
      'nafaqa',
      'pension alimentaire',
      'nourriture',
      'éducation',
      'نفقة',
      'مصروف',
      'تعليم',
      'ما كيصرفش',
      'ما كيعطيش الفلوس',
      'نفقة الولاد',
    ],
  },
  {
    code: 'PENAL_447',
    article: 'Code Pénal Marocain, Articles 447-1 à 447-3',
    titleFr: 'Chantage numérique, atteinte à la vie privée et diffusion illicite',
    titleAr: 'مجموعة القانون الجنائي — التشهير والابتزاز الإلكتروني (المواد 447-1 إلى 447-3)',
    summaryFr:
      'Punit d’un à trois ans d’emprisonnement et d’une amende quiconque intercepte, enregistre, diffuse ou transmet des propos, photos ou vidéos à caractère privé ou intime sans le consentement de la personne.',
    summaryAr:
      'يُعاقب بالحبس من سنة إلى 3 سنوات وغرامة مالية كل من قام عمداً بتسجيل أو بث أو توزيع صور أو محادثات شخصية أو حميمية دون موافقة صاحبها، أو قام بالابتزاز الإلكتروني.',
    summaryDarija:
      'أي واحد كيهدد ينشر تصاورك ولا محادثاتك فواتساب ولا فايسبوك كيعاقبو القانون بالحبس حتى لـ 3 سنين وغرامة، وتسمى جريمة ابتزاز وتشهير.',
    officialSource: 'Loi n° 103-13 modifiant le Code Pénal (Dahir n° 1-59-413)',
    keywords: [
      'photos',
      'whatsapp',
      'chantage',
      'diffusion',
      'menace photos',
      'ابتزاز',
      'تشهير',
      'صور',
      'واتساب',
      'فايسبوك',
      'كيبتزني بالتصاور',
      'غادي يفضحني',
      'نشر تصاوري',
    ],
  },
  {
    code: 'AIDE_JURIDICTIONNELLE',
    article: 'Décret Royal portant Loi n° 514-65',
    titleFr: 'Assistance Juridictionnelle Gratuite (Avocat d’office)',
    titleAr: 'المرسوم الملكي بمثابة قانون رقم 514-65 — المساعدة القضائية المجانية',
    summaryFr:
      'Accorde la désignation gratuite d’un avocat inscrit au barreau et l’exonération intégrale des frais de justice (frais d’huissier, taxes judiciaires, expertises) à toute femme sans ressources suffisantes.',
    summaryAr:
      'تمنح المرأة المعوزة حق تعيين محامٍ مجاني من طرف نقيب المحامين والإعفاء الكامل من جميع الرسوم القضائية ومصاريف المفوضين القضائيين والخبرات.',
    summaryDarija:
      'إلا ما عندكش باش تخلصي محامية، عندك الحق فالمساعدة القضائية المجانية: المحكمة كتعين ليك محامي فابور وما كتخلصي حتى درهم فصوائر الدعوى.',
    officialSource: 'Décret royal n° 514-65 du 1er novembre 1966 organisant l’Assistance Judiciaire',
    keywords: [
      'avocat gratuit',
      'aide juridictionnelle',
      'sans frais',
      'barreau',
      'محامي مجاني',
      'مساعدة قضائية',
      'معنديش فلوس',
      'محامية فابور',
      'ما قادراش نخلص',
      'أتعاب المحامي',
    ],
  },
  {
    code: 'LOI_09_08',
    article: 'Loi n° 09-08 (Protection des données personnelles - CNDP)',
    titleFr: 'Protection des données personnelles et confidentialité stricte',
    titleAr: 'القانون رقم 09-08 — حماية المعطيات ذات الطابع الشخصي (CNDP)',
    summaryFr:
      'Garantit le secret professionnel, la non-divulgation des informations confidentielles des utilisatrices et interdit formellement tout partage de données sans consentement libre et éclairé.',
    summaryAr:
      'يضمن السرية التامة وحرمة المعطيات الشخصية للمستفيدات ويمنع منعاً كلياً مشاركة أي معطى أو معلومة خاصة دون موافقة مسبقة وصريحة.',
    summaryDarija:
      'المعلومات ديالك ف سند سرية 100% وما كيتشارك حتى حرف مع أي واحد إلا بموافقتك ووفق القانون 09-08.',
    officialSource: 'Dahir n° 1-09-15 du 18 février 2009 portant promulgation de la loi n° 09-08',
    keywords: [
      'confidentialité',
      'données',
      'anonymat',
      'cndp',
      '09-08',
      'سرية',
      'معطيات شخصية',
      'أمان',
      'سرية تامة',
      'واش معلوماتي سرية',
      'شكون كيشوف محادثاتي',
    ],
  },
];
