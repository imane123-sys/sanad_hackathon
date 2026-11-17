export type DangerLevel = 'NONE' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface DangerAssessment {
  isDangerAlert: boolean;
  dangerLevel: DangerLevel;
  detectedRisks: string[];
  emergencyOrientation: {
    fr: string;
    ar: string;
    darija: string;
  };
  recommendedHelplines: Array<{
    nameFr: string;
    nameAr: string;
    number: string;
    type: string;
  }>;
}

export class SensitiveSituationDetector {
  // Trilingual patterns for critical imminent danger (weapons, killing threats, active beating, imprisonment)
  private static readonly CRITICAL_DANGER_PATTERNS: RegExp[] = [
    // Darija
    /باغي\s*يقتلني/i,
    /غادي\s*يدبحني/i,
    /كيهددني\s*بالموس/i,
    /هاز\s*عليا\s*(جنوية|موس|سلاح)/i,
    /كيضربني\s*دابا/i,
    /حابسني\s*ف(البيت|الدار)/i,
    /خايفة\s*على\s*حياتي/i,
    /الدم\s*كيسيل/i,
    /غادي\s*نقتل\s*راسي/i,
    /عتقوني\s*عافاكم/i,

    // Standard Arabic
    /يهددني\s*بالقتل/i,
    /يحمل\s*سلاحا/i,
    /سلاح\s*أبيض/i,
    /يضربني\s*الآن/i,
    /محتجزة\s*في\s*المنزل/i,
    /خطر\s*على\s*حياتي/i,
    /اعتداء\s*جسدي\s*خطير/i,
    /نزيف\s*حالي/i,
    /أفكر\s*في\s*الانتحار/i,
    /استغاثة\s*عاجلة/i,

    // French
    /menace\s*de\s*me\s*tuer/i,
    /il\s*a\s*un\s*couteau/i,
    /il\s*a\s*une\s*arme/i,
    /il\s*me\s*frappe\s*actuellement/i,
    /séquestrée/i,
    /enfermé(e)?\s*dans\s*(la\s*chambre|l'appartement|la\s*maison)/i,
    /danger\s*de\s*mort/i,
    /je\s*saigne\s*beaucoup/i,
    /envie\s*d'en\s*finir/i,
    /au\s*secours/i,
  ];

  // Trilingual patterns for high-risk situations (severe threats, stalking, physical abuse)
  private static readonly HIGH_RISK_PATTERNS: RegExp[] = [
    // Darija
    /ضربني/i,
    /سلخني/i,
    /كيهددني/i,
    /جرى\s*عليا/i,
    /خدا\s*ليا\s*ولادي/i,
    /كيتبعني\s*فالزنقة/i,
    /كيبتزني\s*بتصاور/i,

    // Standard Arabic
    /عنف\s*جسدي/i,
    /طردني\s*من\s*البيت/i,
    /انتزع\s*مني\s*أطفالي/i,
    /ملاحقة\s*وترصد/i,
    /ابتزاز\s*بصور/i,

    // French
    /violence\s*physique/i,
    /il\s*m'a\s*expulsée/i,
    /il\s*m'a\s*enlevé\s*mes\s*enfants/i,
    /harcèlement\s*continu/i,
    /chantage\s*aux\s*photos/i,
  ];

  public static assess(text: string): DangerAssessment {
    if (!text || text.trim() === '') {
      return this.createCleanAssessment();
    }

    const detectedRisks: string[] = [];

    // Check Critical Danger
    for (const pattern of this.CRITICAL_DANGER_PATTERNS) {
      if (pattern.test(text)) {
        detectedRisks.push('IMMINENT_PHYSICAL_DANGER');
        break;
      }
    }

    // Check High Risk
    for (const pattern of this.HIGH_RISK_PATTERNS) {
      if (pattern.test(text)) {
        detectedRisks.push('SEVERE_THREAT_OR_ABUSE');
        break;
      }
    }

    const isCritical = detectedRisks.includes('IMMINENT_PHYSICAL_DANGER');
    const isHigh = detectedRisks.includes('SEVERE_THREAT_OR_ABUSE');

    if (!isCritical && !isHigh) {
      return this.createCleanAssessment();
    }

    const dangerLevel: DangerLevel = isCritical ? 'CRITICAL' : 'HIGH';

    return {
      isDangerAlert: true,
      dangerLevel,
      detectedRisks,
      emergencyOrientation: {
        fr:
          isCritical
            ? 'ALERTE SÉCURITÉ IMMÉDIATE : Votre intégrité physique semble en danger imminent. Mettez-vous immédiatement à l’abri et contactez d’urgence Police Secours (19), la Gendarmerie Royale (177) ou la Ligne Nationale 1919.'
            : 'SITUATION SENSIBLE DÉTECTÉE : Vous faites face à des faits graves de violence ou de menaces réprimés par la Loi 103-13. Nous vous orientons vers une assistance d’urgence et des professionnelles qualifiées.',
        ar:
          isCritical
            ? 'تنبيه أمني عاجل: سلامتكِ الجسدية في خطر مباشر. ابتعدي فوراً عن مصدر الخطر واتصلي فوراً بالشرطة (19) أو الدرك الملكي (177) أو الخط الوطني لمناهضة العنف (1919).'
            : 'وضعية حساسة تستوجب الحماية: ما تتعرضين له يمثل أفعال عنف يعاقب عليها القانون 103-13. نوجهكِ فوراً نحو خلايا التكفل القضائي ومراكز الدعم الآمنة.',
        darija:
          isCritical
            ? 'إنذار خطر عاجل: عافاكِ تحركي لشي بلاصة آمنة دابا وماتبقايش بوحدكِ. اتصلي بالبوليس (19) ولا الجندارم (177) ولا خط 1919 المجاني فالحين.'
            : 'راكِ فوضعية صعيبة والقانون 103-13 معاك وكيعاقب على هادشي. تقدري تطلبي الحماية وأمر الإبعاد وتواصلي مع مركز إيواء قريب ليك.',
      },
      recommendedHelplines: [
        {
          nameFr: 'Ligne Nationale de Protection des Femmes',
          nameAr: 'الخط الوطني لمناهضة العنف ضد النساء',
          number: '1919',
          type: 'NATIONAL_HELPLINE',
        },
        {
          nameFr: 'Police Secours (Urbain)',
          nameAr: 'الشرطة والنجدة (الوسط الحضري)',
          number: '19',
          type: 'POLICE',
        },
        {
          nameFr: 'Gendarmerie Royale (Rural)',
          nameAr: 'الدرك الملكي (المناطق القروية)',
          number: '177',
          type: 'GENDARMERIE',
        },
        {
          nameFr: 'SAMU / Urgences Médicales',
          nameAr: 'الإسعاف الطبي المستعجل',
          number: '141',
          type: 'MEDICAL',
        },
      ],
    };
  }

  private static createCleanAssessment(): DangerAssessment {
    return {
      isDangerAlert: false,
      dangerLevel: 'NONE',
      detectedRisks: [],
      emergencyOrientation: { fr: '', ar: '', darija: '' },
      recommendedHelplines: [],
    };
  }
}
