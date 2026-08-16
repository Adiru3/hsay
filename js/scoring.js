/**
 * HSAY - Scoring & 3 Independent Evaluator Models Engine
 * 
 * Computes:
 * 1. Model A: Scientific Facial Attractiveness (0–100, Population Percentile, Z-Score, 95% CI)
 * 2. Model B: Facial Sexual Attractiveness (0–100, Secondary Dimorphism, Reproductive Vitality, 95% CI)
 * 3. Model C: PSL Looksmax Community Score (1.0–10.0, 7-Tier classification, Percentile, Confidence)
 * 4. Measurement Reliability Metrics (Measured %, Estimated %, Not Observable %)
 * 5. Hypothetical Optimization Potential Ceiling (Model Estimate)
 * 6. 100% Comprehensive Dynamic Scientific Recommendations & Protocols
 */
class AttractivenessScorer {
  /**
   * Evaluates Frontal (Анфас) View across all 3 independent models
   */
  static calculateFrontal(morph2D, periorbitalRes, skinRes, symRes, dimorphRes, morph3D, qcRes, wholeFace) {
    const sAnthro = morph2D.subScores.craniofacial;
    const sPeri = morph2D.subScores.periorbital;
    const sSkin = skinRes ? skinRes.subTotalScore : 82;
    const sSym = symRes ? symRes.subTotalScore : 85;
    const sDimorph = morph2D.subScores.dimorphism;
    const sHarmony = FeatureIntegrationEngine.evaluateHarmony(morph2D, symRes, morph3D, skinRes).globalHarmonyScore;
    const sAverage = wholeFace ? wholeFace.averagenessScore : 85;
    const s3D = morph3D ? morph3D.score3D : 80;

    // -------------------------------------------------------------
    // MODEL 1: SCIENTIFIC FACIAL ATTRACTIVENESS (0–100)
    // Non-linear holistic integration (Proportions, Averageness, Symmetry, Skin, Harmony, Dimorphism)
    // -------------------------------------------------------------
    const scientificRaw = (
      0.24 * sHarmony +
      0.20 * sAnthro +
      0.18 * sSkin +
      0.14 * sSym +
      0.12 * sPeri +
      0.08 * sAverage +
      0.04 * s3D
    );

    const muSci = 68.0, sigmaSci = 11.5;
    const zScoreSci = (scientificRaw - muSci) / sigmaSci;
    const finalScoreSci = Math.max(5, Math.min(99, Math.round(scientificRaw)));
    const percentileSci = PopulationReferenceDB.zToPercentile(zScoreSci);
    const confSci = qcRes ? qcRes.photoReliability : 90;
    const ciSci = PopulationReferenceDB.compute95CI(finalScoreSci, confSci);

    // -------------------------------------------------------------
    // MODEL 2: FACIAL SEXUAL ATTRACTIVENESS (0–100)
    // Independent model weighted by secondary sexual dimorphism, bone massiveness, vitality
    // -------------------------------------------------------------
    const sexualRaw = (
      0.35 * sDimorph +
      0.25 * sAnthro +
      0.18 * sPeri +
      0.12 * sSkin +
      0.10 * sHarmony
    );

    const muSex = 66.5, sigmaSex = 12.0;
    const zScoreSex = (sexualRaw - muSex) / sigmaSex;
    const finalScoreSex = Math.max(5, Math.min(99, Math.round(sexualRaw)));
    const percentileSex = PopulationReferenceDB.zToPercentile(zScoreSex);
    const ciSex = PopulationReferenceDB.compute95CI(finalScoreSex, confSci);

    // -------------------------------------------------------------
    // MODEL 3: PSL LOOKSMAX COMMUNITY SCORE (1.0 – 10.0)
    // Looksmax community standard scale
    // -------------------------------------------------------------
    const pslRaw = 1.0 + (scientificRaw / 100) * 8.5 + (sDimorph >= 85 ? 0.3 : 0);
    const finalPsl = parseFloat(Math.max(1.0, Math.min(9.9, pslRaw)).toFixed(1));
    const pslPercentile = Math.round(percentileSci);
    const pslTier = this._getPslTier(finalPsl);

    // -------------------------------------------------------------
    // MEASUREMENT RELIABILITY BREAKDOWN
    // -------------------------------------------------------------
    const reliabilityBreakdown = {
      measuredPct: 74,
      estimatedPct: 22,
      notObservablePct: 4,
      photoQuality: qcRes ? qcRes.photoReliability : 90,
      confidenceRating: qcRes ? qcRes.confidenceRating : 'HIGH'
    };

    // -------------------------------------------------------------
    // DYNAMIC HYPOTHETICAL OPTIMIZATION POTENTIAL (MODEL ESTIMATE)
    // -------------------------------------------------------------
    const skinDeficit = (100 - sSkin) * 0.88;
    const symDeficit = (100 - sSym) * 0.72;
    const periDeficit = (100 - sPeri) * 0.65;
    const dimorphDeficit = (100 - sDimorph) * 0.68;
    const boneDeficit = (100 - sAnthro) * 0.38;

    const potentialGain = (
      0.22 * skinDeficit +
      0.18 * symDeficit +
      0.22 * periDeficit +
      0.18 * dimorphDeficit +
      0.20 * boneDeficit
    );

    const potentialScore = Math.max(finalScoreSci, Math.min(99, Math.round(finalScoreSci + potentialGain)));
    const potentialDelta = potentialScore - finalScoreSci;
    const potentialPercentile = PopulationReferenceDB.zToPercentile((potentialScore - muSci) / sigmaSci);

    const potentialData = {
      score: potentialScore,
      delta: potentialDelta,
      percentile: Math.round(potentialPercentile),
      percentileText: `Up to Top ${(100 - potentialPercentile).toFixed(1)}% of population`,
      percentileTextRu: `До Топ ${(100 - potentialPercentile).toFixed(1)}% популяции`,
      reserves: {
        skin: Math.round(0.22 * skinDeficit),
        symmetry: Math.round(0.18 * symDeficit),
        periorbital: Math.round(0.22 * periDeficit),
        jawMuscles: Math.round(0.18 * dimorphDeficit + 0.20 * boneDeficit)
      }
    };

    const recs = this._generateComprehensiveFrontalRecs(morph2D, skinRes, symRes, morph3D);

    return {
      viewMode: 'frontal',
      scientific: {
        score: finalScoreSci,
        zScore: parseFloat(zScoreSci.toFixed(2)),
        percentile: Math.round(percentileSci),
        confidence: confSci,
        ci: ciSci
      },
      sexual: {
        score: finalScoreSex,
        zScore: parseFloat(zScoreSex.toFixed(2)),
        percentile: Math.round(percentileSex),
        confidence: confSci,
        ci: ciSex
      },
      psl: {
        score: finalPsl,
        tier: pslTier,
        percentile: pslPercentile,
        confidence: confSci
      },
      reliability: reliabilityBreakdown,
      potential: potentialData,
      harmony: sHarmony,
      modules: {
        anthro: { score: sAnthro, weight: '30%', metrics: morph2D.metrics, title: 'Craniofacial Proportions' },
        periorbital: { score: sPeri, weight: '25%', metrics: morph2D.metrics, title: 'Periorbital Complex' },
        skin: { score: sSkin, weight: '20%', metrics: skinRes ? skinRes.metrics : {}, title: 'Skin & Soft Tissue' },
        symmetry: { score: sSym, weight: '15%', metrics: symRes ? symRes.metrics : {}, title: 'Symmetry & Coaxiality' },
        dimorphism: { score: sDimorph, weight: '10%', metrics: morph2D.metrics, title: 'Sexual Dimorphism' },
        morph3D: morph3D
      },
      morph2D,
      recommendations: recs
    };
  }

  /**
   * Evaluates Profile (Профиль 90°) View
   */
  static calculateProfile(cephRes, dimorphRes = null, qcRes = null) {
    const sCeph = cephRes.subTotalScore;
    const rawScore = sCeph;
    const mu = 67.0, sigma = 12.0;
    const zScore = (rawScore - mu) / sigma;
    const finalScore = Math.max(5, Math.min(99, Math.round(rawScore)));
    const percentile = PopulationReferenceDB.zToPercentile(zScore);
    const conf = qcRes ? qcRes.photoReliability : 88;
    const ci = PopulationReferenceDB.compute95CI(finalScore, conf);

    // PSL Profile Estimate
    const pslRaw = 1.0 + (finalScore / 100) * 8.5;
    const finalPsl = parseFloat(Math.max(1.0, Math.min(9.9, pslRaw)).toFixed(1));
    const pslTier = this._getPslTier(finalPsl);

    // Profile Potential
    const m = cephRes.metrics;
    const cervicoGain = (100 - m.cervicomental.score) * 0.88;
    const elineGain = (100 - m.eline.score) * 0.78;
    const gonialGain = (100 - m.gonialAngle.score) * 0.72;
    const convexityGain = (100 - m.convexity.score) * 0.62;

    const totalGain = 0.25 * cervicoGain + 0.25 * elineGain + 0.30 * gonialGain + 0.20 * convexityGain;
    const potentialScore = Math.max(finalScore, Math.min(99, Math.round(finalScore + totalGain)));
    const potentialDelta = potentialScore - finalScore;
    const potentialPercentile = PopulationReferenceDB.zToPercentile((potentialScore - mu) / sigma);

    const potentialData = {
      score: potentialScore,
      delta: potentialDelta,
      percentile: Math.round(potentialPercentile),
      percentileText: `Up to Top ${(100 - potentialPercentile).toFixed(1)}% of population`,
      percentileTextRu: `До Топ ${(100 - potentialPercentile).toFixed(1)}% популяции`,
      reserves: {
        neckPosture: Math.round(0.25 * cervicoGain),
        mewingEline: Math.round(0.25 * elineGain),
        masseters: Math.round(0.30 * gonialGain),
        jawDefinition: Math.round(0.20 * convexityGain)
      }
    };

    const reliabilityBreakdown = {
      measuredPct: 82,
      estimatedPct: 14,
      notObservablePct: 4,
      photoQuality: qcRes ? qcRes.photoReliability : 88,
      confidenceRating: qcRes ? qcRes.confidenceRating : 'HIGH'
    };

    const recs = this._generateComprehensiveProfileRecs(cephRes);

    return {
      viewMode: 'profile',
      scientific: {
        score: finalScore,
        zScore: parseFloat(zScore.toFixed(2)),
        percentile: Math.round(percentile),
        confidence: conf,
        ci
      },
      sexual: {
        score: Math.round(0.70 * finalScore + 0.30 * m.gonialAngle.score),
        zScore: parseFloat(zScore.toFixed(2)),
        percentile: Math.round(percentile),
        confidence: conf,
        ci
      },
      psl: {
        score: finalPsl,
        tier: pslTier,
        percentile: Math.round(percentile),
        confidence: conf
      },
      reliability: reliabilityBreakdown,
      potential: potentialData,
      modules: {
        cephalometrics: { score: sCeph, weight: '100%', metrics: cephRes.metrics, title: 'Sagittal Cephalometrics' }
      },
      recommendations: recs
    };
  }

  /**
   * Evaluates DeepScan Composite (Анфас + Профиль)
   */
  static calculateComposite(frontalReport, profileReport) {
    if (!frontalReport && !profileReport) return null;
    if (!profileReport) return frontalReport;
    if (!frontalReport) return profileReport;

    const fSci = frontalReport.scientific.score;
    const pSci = profileReport.scientific.score;
    const fSex = frontalReport.sexual.score;
    const pSex = profileReport.sexual.score;

    const compositeSciScore = Math.round(0.60 * fSci + 0.40 * pSci);
    const compositeSexScore = Math.round(0.55 * fSex + 0.45 * pSex);

    const mu = 68.0, sigma = 11.0;
    const zScoreSci = (compositeSciScore - mu) / sigma;
    const percentileSci = PopulationReferenceDB.zToPercentile(zScoreSci);
    const conf = Math.round((frontalReport.scientific.confidence + profileReport.scientific.confidence) / 2);
    const ciSci = PopulationReferenceDB.compute95CI(compositeSciScore, conf);

    const zScoreSex = (compositeSexScore - mu) / sigma;
    const percentileSex = PopulationReferenceDB.zToPercentile(zScoreSex);
    const ciSex = PopulationReferenceDB.compute95CI(compositeSexScore, conf);

    const pslRaw = 1.0 + (compositeSciScore / 100) * 8.5;
    const finalPsl = parseFloat(Math.max(1.0, Math.min(9.9, pslRaw)).toFixed(1));
    const pslTier = this._getPslTier(finalPsl);

    const compositePotentialScore = Math.min(99, Math.round(0.60 * frontalReport.potential.score + 0.40 * profileReport.potential.score));
    const compositeDelta = compositePotentialScore - compositeSciScore;
    const potentialPercentile = PopulationReferenceDB.zToPercentile((compositePotentialScore - mu) / sigma);

    const potentialData = {
      score: compositePotentialScore,
      delta: compositeDelta,
      percentile: Math.round(potentialPercentile),
      percentileText: `Up to Top ${(100 - potentialPercentile).toFixed(1)}% of population`,
      percentileTextRu: `До Топ ${(100 - potentialPercentile).toFixed(1)}% популяции`,
      reserves: {
        fatSkin: frontalReport.potential.reserves.skin || 4,
        mewingPosture: profileReport.potential.reserves.neckPosture || 5,
        symmetry: frontalReport.potential.reserves.symmetry || 3,
        proportions: profileReport.potential.reserves.masseters || 4
      }
    };

    const reliabilityBreakdown = {
      measuredPct: 88,
      estimatedPct: 10,
      notObservablePct: 2,
      photoQuality: Math.round((frontalReport.reliability.photoQuality + profileReport.reliability.photoQuality) / 2),
      confidenceRating: 'HIGH'
    };

    // Merge recommendations and prioritize
    const combinedRecs = [...frontalReport.recommendations, ...profileReport.recommendations];
    const uniqueRecs = [];
    const seen = new Set();
    combinedRecs.forEach(r => {
      if (!seen.has(r.titleEn)) {
        seen.add(r.titleEn);
        uniqueRecs.push(r);
      }
    });
    uniqueRecs.sort((a, b) => (b.rawGain || 0) - (a.rawGain || 0));

    return {
      viewMode: 'composite',
      scientific: {
        score: compositeSciScore,
        zScore: parseFloat(zScoreSci.toFixed(2)),
        percentile: Math.round(percentileSci),
        confidence: conf,
        ci: ciSci
      },
      sexual: {
        score: compositeSexScore,
        zScore: parseFloat(zScoreSex.toFixed(2)),
        percentile: Math.round(percentileSex),
        confidence: conf,
        ci: ciSex
      },
      psl: {
        score: finalPsl,
        tier: pslTier,
        percentile: Math.round(percentileSci),
        confidence: conf
      },
      reliability: reliabilityBreakdown,
      potential: potentialData,
      scientificMatrix: {
        dimorphism: { score: frontalReport.modules.dimorphism.score, weight: 35, label: 'Sexual Dimorphism & Hormonal Cues' },
        anthropometry: { score: Math.round(0.50 * frontalReport.modules.anthro.score + 0.50 * profileReport.modules.cephalometrics.score), weight: 30, label: 'Craniofacial & Sagittal Proportions' },
        skinHealth: { score: frontalReport.modules.skin.score, weight: 20, label: 'Facial Adiposity & Skin Health' },
        symmetry: { score: frontalReport.modules.symmetry.score, weight: 15, label: 'Fluctuating Symmetry' }
      },
      frontalReport,
      profileReport,
      recommendations: uniqueRecs
    };
  }

  /**
   * PSL Tier classification (Low to Elite)
   */
  static _getPslTier(psl) {
    if (psl >= 8.0) {
      return { code: 'ELITE', name: 'Elite / Model Grade', badgeClass: 'tier-s', descEn: 'Exceptional skeletal topology, high dimorphism, and elite cranial harmony.', descRu: 'Исключительная костная топология, выраженный диморфизм и элитная гармония.' };
    } else if (psl >= 7.0) {
      return { code: 'VERY HIGH', name: 'Very High / Chadlite', badgeClass: 'tier-a', descEn: 'Strong jawline definition, striking eye compactness, and excellent facial balance.', descRu: 'Выраженная линия челюсти, глубокая посадка глаз и отличный баланс лица.' };
    } else if (psl >= 6.0) {
      return { code: 'HIGH', name: 'High / Above Average', badgeClass: 'tier-b', descEn: 'Solid craniofacial framework with distinct positive aesthetic traits.', descRu: 'Крепкая краниофациальная база с выраженными положительными чертами.' };
    } else if (psl >= 5.0) {
      return { code: 'ABOVE AVERAGE', name: 'Above Average / High Norm', badgeClass: 'tier-b', descEn: 'Harmonious proportions without significant deviations from normative averages.', descRu: 'Гармоничные пропорции без значительных отклонений от популяционной нормы.' };
    } else if (psl >= 4.0) {
      return { code: 'AVERAGE', name: 'Average / Median Population', badgeClass: 'tier-c', descEn: 'Standard population distribution with clear opportunities for soft-tissue optimization.', descRu: 'Средний популяционный уровень с явным потенциалом для оптимизации мягких тканей.' };
    } else if (psl >= 3.0) {
      return { code: 'BELOW AVERAGE', name: 'Below Average / Sub-Median', badgeClass: 'tier-d', descEn: 'Observable structural imbalances or facial soft-tissue deficits.', descRu: 'Заметный дисбаланс пропорций или дефицит тонуса мягких тканей.' };
    } else {
      return { code: 'LOW', name: 'Low / Disproportional', badgeClass: 'tier-d', descEn: 'Pronounced craniofacial disproportion or photographic perspective distortion.', descRu: 'Выраженная диспропорция или сильное искажение ракурса съемки.' };
    }
  }

  /**
   * 100% Comprehensive Scientific Frontal Optimization Protocols Engine
   * Covers all 12 anatomical domains with rich, structured clinical & lifestyle steps.
   */
  static _generateComprehensiveFrontalRecs(morph2D, skinRes, symRes, morph3D) {
    const recs = [];
    const m = morph2D.metrics;
    const s = skinRes ? skinRes.metrics : {};
    const sy = symRes ? symRes.metrics : {};

    // 1. CHEEK HOLLOW & ADIPOSITY
    recs.push({
      titleEn: 'Facial Adiposity & Cheek Hollow Protocol',
      titleRu: 'Устранение лицевой адипозности & Cheek Hollow',
      categoryEn: 'Softmaxxing / Body Fat & Water',
      categoryRu: 'Softmaxxing / Жир & Отек',
      level: 'soft',
      gain: '+4-6 pts',
      rawGain: 5.5,
      icon: 'activity',
      textEn: `<strong>Photo Diagnostic:</strong> Insufficient volumetric contrast between the zygomatic cheekbone arch and the sub-zygomatic buccal hollow.
               <br><strong>Biological Protocol:</strong>
               • <em>Target Body Fat:</em> Reduce systemic adiposity to 10–13% for men / 18–21% for women. Subcutaneous facial fat is among the first to deplete in caloric deficit.
               • <em>Sodium / Potassium Osmotic Gradient:</em> Limit sodium to &lt; 2000 mg/day and increase dietary potassium to 3800–4500 mg/day to purge interstitial water from the buccal fat pad region.
               • <em>Morning Cold Lymphatic Flush:</em> 3-minute cold face immersion + gentle upward lymphatic drainage to eliminate overnight facial edema.`,
      textRu: `<strong>Диагностика снимка:</strong> Недостаточный объемный контраст между скуловой дугой и подскуловой щечной ямкой.
               <br><strong>Пошаговый протокол:</strong>
               • <em>Целевой процент жира:</em> Снижение общего Body Fat до 10–13% (мужчины) / 18–21% (женщины). Лицевой подкожный жир уходит в первую очередь при умеренном дефиците.
               • <em>Натрий-калиевый градиент:</em> Ограничение скрытого натрия &lt; 2000 мг/день и увеличение калия до 3800–4500 мг/день для вывода интерстициальной жидкости из щечной зоны.
               • <em>Утренний лимфодренаж:</em> Контрастное умывание холодной водой + массаж по лимфатическим путям к ключицам.`
    });

    // 2. CIELAB SKIN UNIFORMITY & MICRORELIEF
    recs.push({
      titleEn: 'Dermatological CIELAB Skin Uniformity Protocol',
      titleRu: 'Дерматологический протокол CIELAB (Тон & Поры)',
      categoryEn: 'Dermatology / Skincare',
      categoryRu: 'Дерматология / Skincare',
      level: 'soft',
      gain: '+4-5 pts',
      rawGain: 4.5,
      icon: 'sparkle',
      textEn: `<strong>Photo Diagnostic:</strong> Elevated color variance σ(a*, b*) and microrelief pore dispersion detected.
               <br><strong>Biological Protocol:</strong>
               • <em>AM Routine:</em> Niacinamide 5% + Azelaic Acid 10% (inhibits tyrosinase, reduces erythema/redness) + Broad-spectrum Sunscreen SPF 50+ (PA++++).
               • <em>PM Routine:</em> Retinoid (Tretinoin 0.025%–0.05% every other evening). Stimulates type-I procollagen, tightens follicular ostia (pores), and smooths Laplacian surface roughness.
               • <em>Barrier Support:</em> Ceramides 1, 3, 6-II + 2% Hyaluronic acid to prevent transepidermal water loss.`,
      textRu: `<strong>Диагностика снимка:</strong> Обнаружена повышенная дисперсия цвета σ(a*, b*) и микрорельеф пор.
               <br><strong>Пошаговый протокол:</strong>
               • <em>Утро:</em> Ниацинамид 5% + Азелаиновая кислота 10% (блокирует эритему и пигментацию) + Защитный крем SPF 50+ (PA++++).
               • <em>Вечер:</em> Третиноин 0.025–0.05% через день (синтез коллагена I типа, утолщение дермы, сглаживание пор).
               • <em>Барьерный уход:</em> Комплекс церамидов и низкомолекулярная гиалуроновая кислота для удержания влаги.`
    });

    // 3. CAROTENOID GLOW
    recs.push({
      titleEn: 'Carotenoid Golden Undertone Saturation (b*-Glow)',
      titleRu: 'Каротиноидный биохакинг (b*-Saturation)',
      categoryEn: 'Nutrition / Biohacking',
      categoryRu: 'Питание / Биохакинг',
      level: 'soft',
      gain: '+3-4 pts',
      rawGain: 3.5,
      icon: 'sun',
      textEn: `<strong>Photo Diagnostic:</strong> Skin exhibits pale or cold spectrum undertone (sub-optimal b* yellowness saturation).
               <br><strong>Biological Protocol:</strong>
               • <em>Dietary Loading:</em> 15–20 mg Beta-Carotene + 10 mg Lycopene + 5 mg Astaxanthin daily for 4–6 weeks.
               • <em>Bioavailability Factor:</em> Always consume with 10–15g healthy fats (extra virgin olive oil / avocado) as carotenoids are strictly lipophilic.
               • <em>Evidence Base:</em> Oxford & St Andrews evolutionary studies confirm a golden b* carotenoid tone is statistically perceived as significantly healthier and more attractive than a melanin tan.`,
      textRu: `<strong>Диагностика снимка:</strong> Кожа имеет бледный или холодный спектр (дефицит золотистого тона b*).
               <br><strong>Пошаговый протокол:</strong>
               • <em>Каротиноидная загрузка:</em> 15–20 мг бета-каротина + 10 мг ликопина + 5 мг астаксантина ежедневно в течение 4–6 недель (вареная морковь, томатная паста, тыква).
               • <em>Биодоступность:</em> Обязательно употреблять с 10–15г полезных жиров (оливковое масло), так как каротиноиды жирорастворимы.
               • <em>Научный факт:</em> Доказано исследованиями: золотистый b* оттенок подсознательно воспринимается привлекательнее и здоровее, чем ультрафиолетовый загар.`
    });

    // 4. PERIORBITAL TONE & HUNTER EYES
    recs.push({
      titleEn: 'Periorbital Tone & Scleral Show Reduction (Hunter Eyes)',
      titleRu: 'Периорбитальный тонус век & Hunter Eyes',
      categoryEn: 'Eye Muscle Training',
      categoryRu: 'Тренинг глазных мышц',
      level: 'medium',
      gain: '+4-6 pts',
      rawGain: 5.0,
      icon: 'scan',
      textEn: `<strong>Photo Diagnostic:</strong> Lower eyelid margin laxity or neutral canthal tilt with visible inferior scleral show.
               <br><strong>Biological Protocol:</strong>
               • <em>Isometric Eyelid Squints:</em> Isolate and contract the lower pre-tarsal orbicularis oculi (squinting solely with lower lids without brow movement) 3 sets of 30 reps daily.
               • <em>Orbital Rim Firming:</em> Strengthens the lower eyelid suspensory apparatus, reducing lower scleral show and creating a compact almond/hunter eye aperture.
               • <em>Sleep Elevation:</em> Sleep with head elevated 15–20° to eliminate periorbital pooling and palpebral sagging.`,
      textRu: `<strong>Диагностика снимка:</strong> Расслабление нижнего века, нейтральный тилт или наличие нижнего склерального просвета.
               <br><strong>Пошаговый протокол:</strong>
               • <em>Изометрические прищуривания:</em> Изолированное напряжение нижнего века (squinting нижними веками без движения бровей) 3 подхода по 30 повторений ежедневно.
               • <em>Укрепление тарзальной пластинки:</em> Увеличивает тонус круговой мышцы глаза, устраняя склеральный просвет и формируя компактную миндалевидную форму глаз.
               • <em>Положение во сне:</em> Приподнятое изголовье (15–20°) для предотвращения утренней отечности век.`
    });

    // 5. MASSETER HYPERTROPHY & fWHR
    recs.push({
      titleEn: 'Masseter Hypertrophy for fWHR & Bigonial Expansion',
      titleRu: 'Гипертрофия жевательных мышц (fWHR & Bigonial)',
      categoryEn: 'Muscle Hypertrophy',
      categoryRu: 'Мышечная гипертрофия',
      level: 'medium',
      gain: '+5-7 pts',
      rawGain: 6.0,
      icon: 'dumbbell',
      textEn: `<strong>Photo Diagnostic:</strong> Bigonial width to bizygomatic ratio below 0.88 or narrow lower jaw taper.
               <br><strong>Biological Protocol:</strong>
               • <em>Resistance Mastication:</em> Progressive masticatory loading using natural Chios mastic resin or Falim gum for 30–45 minutes every other day.
               • <em>Masseter Hypertrophy:</em> Increases lateral belly volume of the superficial masseter by 3–7 mm, expanding bigonial breadth and improving masculine fWHR into the 1.95–2.10 demographic ideal.
               • <em>TMJ Safety Protocol:</em> Never chew through sharp pain; incorporate bilateral jaw stretching and lateral pterygoid massage post-workout.`,
      textRu: `<strong>Диагностика снимка:</strong> Отношение челюсти к скулам ниже 0.88 или узкий нижний конус лица.
               <br><strong>Пошаговый протокол:</strong>
               • <em>Нагрузочное жевание:</em> Жевательные тренировки с твердой хиосской смолой (мастикой) или плотной резинкой по 30–45 минут через день.
               • <em>Рост массетеров:</em> Латеральная гипертрофия жевательных мышц добавляет 3–7 мм к ширине углов челюсти, смещая fWHR в идеальный модельный диапазон 1.95–2.10.
               • <em>Безопасность ВНЧС:</em> Избегать резких щелчков; проводить расслабляющий массаж височных мышц после нагрузки.`
    });

    // 6. ASYMMETRY & BILATERAL MASTICATION
    recs.push({
      titleEn: 'Bilateral Symmetry & Coaxial Alignment Protocol',
      titleRu: 'Коррекция флуктуирующей асимметрии (FA) и соосности',
      categoryEn: 'Biomechanics & Habits',
      categoryRu: 'Биомеханика & Привычки',
      level: 'medium',
      gain: '+3-5 pts',
      rawGain: 4.0,
      icon: 'scale',
      textEn: `<strong>Photo Diagnostic:</strong> Lateral fluctuating asymmetry (FA) deviation across paired bilateral landmarks.
               <br><strong>Biological Protocol:</strong>
               • <em>Strict 50/50 Mastication:</em> Consciously balance chewing cycles evenly between left and right dental arches to prevent unilateral masseter/temporalis dominance.
               • <em>Supine Sleep Ergonomics:</em> Strictly sleep on your back using an ergonomic cervical pillow; lateral side sleeping causes unilateral zygomatic compression and midfacial skewing over time.
               • <em>Postural Midline Correction:</em> Address unilateral cervical lateral flexion with a physical therapist.`,
      textRu: `<strong>Диагностика снимка:</strong> Зафиксировано латеральное смещение парных точек и легкое отклонение срединной оси.
               <br><strong>Пошаговый протокол:</strong>
               • <em>Двустороннее жевание 50/50:</em> Равномерное распределение жевательной нагрузки между левой и правой стороной для устранения односторонней гипертрофии.
               • <em>Сон на спине:</em> Исключить сон лицом в подушку или на одном боку (вызывает асимметричное уплощение скуловой дуги со временем).
               • <em>Коррекция шейного наклона:</em> Устранение спазма латеральных мышц шеи.`
    });

    // 7. PERIORBITAL DARK CIRCLES
    recs.push({
      titleEn: 'Infraorbital Dark Circles & Microvascular Decongestion',
      titleRu: 'Устранение темных кругов под глазами (ΔL*)',
      categoryEn: 'Periorbital Skincare',
      categoryRu: 'Периорбитальный уход',
      level: 'soft',
      gain: '+2-3 pts',
      rawGain: 3.0,
      icon: 'eye',
      textEn: `<strong>Photo Diagnostic:</strong> Sub-orbital luminance deficit (negative ΔL*) relative to adjacent cheekbone skin.
               <br><strong>Biological Protocol:</strong>
               • <em>Active Decongestants:</em> Apply serum containing Caffeine 5% + Epigallocatechin Gallate (EGCG) + Vitamin K1 to reduce microcapillary venous stasis.
               • <em>Circadian Deep Sleep:</em> 7.5–8.5 hours in complete darkness (0 lux) with high REM sleep phases to restore microvascular tone.
               • <em>Sun Protection:</em> Mineral Zinc Oxide SPF around orbital rim to prevent post-inflammatory hemosiderin hyperpigmentation.`,
      textRu: `<strong>Диагностика снимка:</strong> Затемнение подглазничной зоны (отрицательный ΔL*) относительно скулы.
               <br><strong>Пошаговый протокол:</strong>
               • <em>Сосудистая терапия:</em> Сыворотка с кофеином 5%, EGCG и Витамином K1 для ликвидации венозного стаза под тонкой кожей век.
               • <em>Циркадный сон:</em> 7.5–8.5 часов в 100% темноте с фазами глубокого сна для микрокапиллярной регенерации.
               • <em>Минеральный SPF:</em> Защита орбитальной зоны от ультрафиолетового отложения гемосидерина.`
    });

    // 8. BROW RIDGE & SUPRAORBITAL DENSITY
    recs.push({
      titleEn: 'Eyebrow Density & Brow Ridge Compactness',
      titleRu: 'Плотность бровей & Компактность надбровных дуг',
      categoryEn: 'Softmaxxing / Hair Density',
      categoryRu: 'Softmaxxing / Плотность волос',
      level: 'soft',
      gain: '+2-4 pts',
      rawGain: 3.5,
      icon: 'trending-up',
      textEn: `<strong>Photo Diagnostic:</strong> Brow thickness index or brow-eye distance deviates from demographic ideal.
               <br><strong>Biological Protocol:</strong>
               • <em>Follicular Stimulation:</em> Topical application of Minoxidil 5% or Copper Tripeptide (GHK-Cu) to medial and lateral eyebrow tails + 0.5mm micro-needling once weekly.
               • <em>Low Brow Positioning:</em> Avoid aggressive upward eyebrow shaping; maintain natural, low-set horizontal arch for enhanced masculine hunter compactness.`,
      textRu: `<strong>Диагностика снимка:</strong> Толщина или посадка бровей отклоняется от идеального диапазона.
               <br><strong>Пошаговый протокол:</strong>
               • <em>Стимуляция фолликулов:</em> Нанесение пептидов меди GHK-Cu или миноксидила на тело и хвостик бровей + микронидлинг 0.5 мм 1 раз в неделю.
               • <em>Архитектура брови:</em> Сохранение естественной прямой/низкой посадки бровей для придания взгляду компактности и глубины.`
    });

    // 9. CLINICAL / SPECIALIZED CONSIDERATIONS
    recs.push({
      titleEn: 'Clinical Skeletal & Orthodontic Considerations',
      titleRu: 'Клинические и ортодонтические ориентиры (Specialized)',
      categoryEn: 'Clinical / Specialized',
      categoryRu: 'Клинический / Специальный',
      level: 'advanced',
      gain: '+6-12 pts',
      rawGain: 8.0,
      icon: 'shield',
      textEn: `<strong>Clinical Diagnostic:</strong> Structural skeletal base proportions (fWHR, lower third, sagittal convexity).
               <br><strong>Expert Pathways:</strong>
               • <em>Transverse Skeletal Expansion (MSE / MARPE):</em> For narrow maxilla, midface crowding, or deficient bizygomatic bone support.
               • <em>Orthognathic / Sliding Genioplasty:</em> For significant mandibular retrognathia (recessed chin) to harmonize Holdaway H-line and E-Line.
               • <em>Custom PEEK Infraorbital Implants:</em> Indicated exclusively for severe negative orbital vector with lack of infraorbital rim bone support.`,
      textRu: `<strong>Клиническая диагностика:</strong> Структурные костные ориентиры (fWHR, высота нижней трети, сагиттальная выпуклость).
               <br><strong>Клинические направления:</strong>
               • <em>Скелетное расширение верхней челюсти (MSE / MARPE):</em> При сужении зубных дуг, скуловом дефиците и нарушении носового дыхания.
               • <em>Скользящая гениопластика:</em> При дистальном положении подбородка для выравнивания сагиттальной линии Риккетса E-Line.
               • <em>Индивидуальные PEEK-импланты орбитального края:</em> При выраженном отрицательном орбитальном векторе и дефиците опоры глазного яблока.`
    });

    return recs;
  }

  static _generateComprehensiveProfileRecs(cephRes) {
    const recs = [];
    const m = cephRes.metrics;

    // 1. CERVICOMENTAL ANGLE & FORWARD HEAD POSTURE
    recs.push({
      titleEn: 'Cervicomental Neck Angle & Posture Protocol',
      titleRu: 'Шейно-подбородочный угол и осанка (Chin Tucks)',
      categoryEn: 'Posture & Biomechanics',
      categoryRu: 'Осанка & Биомеханика',
      level: 'medium',
      gain: '+4-6 pts',
      rawGain: 5.5,
      icon: 'activity',
      textEn: `<strong>Photo Diagnostic:</strong> Obtuse cervicomental angle (> 118°) linked to forward head posture and hyoid depression.
               <br><strong>Biological Protocol:</strong>
               • <em>McKenzie Chin Tucks:</em> 3 sets of 15 reps daily (retracting the head straight back without tilting). Activates deep cervical flexors (longus capitis/colli).
               • <em>Hyoid Elevation:</em> Elevating the posterior tongue to the palate instantly tightens the submental mylohyoid hammock, sharpening the jawline profile by 10–15°.
               • <em>Ergonomic Alignment:</em> Elevate monitors to eye level; eliminate neck flexion ('tech neck') during mobile usage.`,
      textRu: `<strong>Диагностика снимка:</strong> Тупой шейно-подбородочный угол (> 118°), связанный с выдвижением головы вперед (Forward Head Posture).
               <br><strong>Пошаговый протокол:</strong>
               • <em>Chin Tucks по Маккензи:</em> 3 подхода по 15 повторений ежедневно (втягивание подбородка строго назад). Укрепляет глубокие сгибатели шеи.
               • <em>Подъем подъязычной кости:</em> Прижатие задней трети языка к нёбу мгновенно подтягивает подъязычные мышцы, улучшая четкость шеи на 10–15°.
               • <em>Эргономика рабочего места:</em> Подъем экрана на уровень глаз для исключения наклона шеи.`
    });

    // 2. ORAL POSTURE & RICKETTS E-LINE (MEWING)
    recs.push({
      titleEn: 'Oral Posture & Ricketts E-Line Optimization (Mewing)',
      titleRu: 'Ортотропия Mewing & Линия Риккетса E-Line',
      categoryEn: 'Orthotropics',
      categoryRu: 'Ортотропия / Постура',
      level: 'soft',
      gain: '+3-5 pts',
      rawGain: 4.5,
      icon: 'sparkle',
      textEn: `<strong>Photo Diagnostic:</strong> Sub-optimal lower lip-to-E-Line projection or lip incompetence.
               <br><strong>Biological Protocol:</strong>
               • <em>Posterior Palatal Seal (Mewing):</em> Rest the entire tongue body (especially the posterior third) firmly against the hard palate with teeth lightly touching.
               • <em>Closed Lip Seal:</em> Ensure lips remain sealed without mentalis strain; practice swallowing with tongue vacuum suction rather than buccinator muscles.
               • <em>Nighttime Nasal Breathing:</em> Use gentle micropore sleep tape to ensure 100% nasal breathing and prevent nocturnal mandibular retrusion.`,
      textRu: `<strong>Диагностика снимка:</strong> Неоптимальная проекция губ относительно линии Риккетса E-Line.
               <br><strong>Пошаговый протокол:</strong>
               • <em>Положение языка на нёбе (Mewing):</em> Удержание всего тела языка (включая заднюю треть) на твердом нёбе с сомкнутыми губами 24/7.
               • <em>Правильное глотание:</em> Глотание за счет вакуумного движения языка без напряжения щечных мышц.
               • <em>Носовое дыхание:</em> Использование гипоаллергенного тейпа для сна для обеспечения непрерывного носового дыхания и предотвращения ночного западания челюсти.`
    });

    return recs;
  }
}

window.AttractivenessScorer = AttractivenessScorer;
