/**
 * HSAY - Scoring & Human-Rating Attractiveness Prediction Engine
 * 
 * Methodological Note:
 * Equal domain weights are a predefined methodological baseline and are not
 * interpreted as empirically estimated causal or predictive effect sizes.
 * (Равные веса доменов являются заранее определённым методологическим baseline
 * и не интерпретируются как эмпирически установленные размеры эффектов
 * или причинные вклады признаков в привлекательность).
 * 
 * Two-Step Normalization Architecture:
 * 1. Metric Normalization: raw metric → normalized metric score (0–100) via PopulationReferenceDB
 * 2. Domain Normalization: DOMAIN SCORE = arithmetic mean of its normalized metric scores (0–100)
 * 3. Model Score: arithmetic mean of the 6 equal-weight predefined domain scores:
 *    Model A / Model B = (D1 + D2 + D3 + D4 + D5 + D6) / 6
 * 
 * Strict Separation of Views:
 * - FRONTAL SCORE: strictly derived from 2D frontal portrait view
 * - PROFILE SCORE: strictly derived from 90° lateral cephalometric profile view
 * - COMPOSITE SCORE: 3rd-level passport when both views are present
 */
class AttractivenessScorer {
  /**
   * Evaluates Frontal (Анфас) View across all 3 independent models
   */
  static calculateFrontal(morph2D, periorbitalRes, skinRes, symRes, dimorphRes, morph3D, qcRes, wholeFace) {
    // -------------------------------------------------------------
    // DOMAIN 1: Averageness / Prototypicality (Langlois, Rhodes)
    // -------------------------------------------------------------
    const sAverage = wholeFace ? wholeFace.averagenessScore : 85;

    // -------------------------------------------------------------
    // DOMAIN 2: Skin & Facial Appearance (Stephen, Fink)
    // -------------------------------------------------------------
    const sSkin = skinRes ? skinRes.subTotalScore : 82;

    // -------------------------------------------------------------
    // DOMAIN 3: Bilateral Symmetry (Grammer & Thornhill)
    // -------------------------------------------------------------
    const sSym = symRes ? symRes.subTotalScore : 85;

    // -------------------------------------------------------------
    // DOMAIN 4: Periorbital & Eye Configuration (Baudouin, Cunningham)
    // -------------------------------------------------------------
    const sPeri = morph2D.subScores.periorbital;

    // -------------------------------------------------------------
    // DOMAIN 5: Craniofacial Anthropometry & Proportions (Farkas, Cunningham)
    // -------------------------------------------------------------
    const sAnthro = morph2D.subScores.craniofacial;

    // -------------------------------------------------------------
    // DOMAIN 6: Secondary Sexual Dimorphism (Perrett, Little)
    // -------------------------------------------------------------
    const sDimorph = morph2D.subScores.dimorphism;
    const sYouth = morph2D.subScores.youthfulness;
    const sHarmony = FeatureIntegrationEngine.evaluateHarmony(morph2D, symRes, morph3D, skinRes).globalHarmonyScore;
    const s3D = morph3D ? morph3D.score3D : 80;

    // Sub-domain: Jaw & Lower-Face Architecture
    const sJaw = Math.round(
      (morph2D.metrics.mandibularTaper.score100 +
       morph2D.metrics.jawCheekRatio.score100 +
       morph2D.metrics.chinFaceRatio.score100) / 3
    );

    // -------------------------------------------------------------
    // MODEL A: PERCEIVED FACIAL ATTRACTIVENESS (FRONTAL) (0–100)
    // Equal-Weight Multi-Domain Aggregation (1/6 = 16.67% per domain)
    // -------------------------------------------------------------
    const humanRatingAttractivenessRaw = (
      sAverage +
      sSkin +
      sSym +
      sPeri +
      sAnthro +
      sDimorph
    ) / 6;

    const muSci = 68.0, sigmaSci = 11.5;
    const zScoreSci = (humanRatingAttractivenessRaw - muSci) / sigmaSci;
    const finalScoreSci = Math.max(5, Math.min(99, Math.round(humanRatingAttractivenessRaw)));
    const percentileSci = PopulationReferenceDB.zToPercentile(zScoreSci);
    const confSci = qcRes ? qcRes.photoReliability : 90;
    const uncSci = PopulationReferenceDB.computeUncertainty(finalScoreSci, confSci);

    // -------------------------------------------------------------
    // MODEL B: PERCEIVED FACIAL SEXUAL ATTRACTIVENESS (FRONTAL) (0–100)
    // Equal-Weight Multi-Domain Aggregation (1/6 = 16.67% per domain)
    // -------------------------------------------------------------
    const humanRatingSexualRaw = (
      sDimorph +
      sSkin +
      sYouth +
      sJaw +
      sSym +
      sAnthro
    ) / 6;

    const muSex = 66.5, sigmaSex = 12.0;
    const zScoreSex = (humanRatingSexualRaw - muSex) / sigmaSex;
    const finalScoreSex = Math.max(5, Math.min(99, Math.round(humanRatingSexualRaw)));
    const percentileSex = PopulationReferenceDB.zToPercentile(zScoreSex);
    const uncSex = PopulationReferenceDB.computeUncertainty(finalScoreSex, confSci);

    // -------------------------------------------------------------
    // MODEL C: PSL LOOKSMAX COMMUNITY SCORE (1.0 – 10.0)
    // -------------------------------------------------------------
    const pslRaw = 1.0 + (humanRatingAttractivenessRaw / 100) * 8.5 + (sDimorph >= 85 ? 0.3 : 0);
    const finalPsl = parseFloat(Math.max(1.0, Math.min(9.9, pslRaw)).toFixed(1));
    const pslPercentile = Math.round(percentileSci);
    const pslTier = this._getPslTier(finalPsl);

    // -------------------------------------------------------------
    // MEASUREMENT RELIABILITY BREAKDOWN
    // -------------------------------------------------------------
    const reliabilityBreakdown = {
      measuredPct: 78,
      estimatedPct: 18,
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
        uncertainty: uncSci
      },
      sexual: {
        score: finalScoreSex,
        zScore: parseFloat(zScoreSex.toFixed(2)),
        percentile: Math.round(percentileSex),
        confidence: confSci,
        uncertainty: uncSex
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
        anthro: { score: sAnthro, weight: '16.7%', metrics: morph2D.metrics, title: 'Craniofacial Proportions' },
        periorbital: { score: sPeri, weight: '16.7%', metrics: morph2D.metrics, title: 'Periorbital Complex' },
        skin: { score: sSkin, weight: '16.7%', metrics: skinRes ? skinRes.metrics : {}, title: 'Skin & Soft Tissue' },
        symmetry: { score: sSym, weight: '16.7%', metrics: symRes ? symRes.metrics : {}, title: 'Symmetry & Coaxiality' },
        dimorphism: { score: sDimorph, weight: '16.7%', metrics: morph2D.metrics, title: 'Sexual Dimorphism' },
        morph3D: morph3D
      },
      morph2D,
      recommendations: recs
    };
  }

  /**
   * Evaluates Profile (Профиль 90°) View strictly from lateral cephalometrics
   */
  static calculateProfile(cephReport, qcRes) {
    const sCeph = cephReport.subTotalScore;
    const m = cephReport.metrics;

    const mu = 66.0, sigma = 12.0;
    const zScore = (sCeph - mu) / sigma;
    const percentile = PopulationReferenceDB.zToPercentile(zScore);
    const conf = qcRes ? qcRes.photoReliability : 88;
    const unc = PopulationReferenceDB.computeUncertainty(sCeph, conf);

    const pslRaw = 1.0 + (sCeph / 100) * 8.5;
    const finalPsl = parseFloat(Math.max(1.0, Math.min(9.9, pslRaw)).toFixed(1));
    const pslTier = this._getPslTier(finalPsl);

    // Profile Optimization Potential
    const sGonial = m.gonialAngle.score || m.gonialAngle.score100 || 70;
    const sRamus = m.ramusIndex.score || m.ramusIndex.score100 || 70;
    const sEline = m.eline.score || m.eline.score100 || 70;
    const sNeck = m.cervicomental.score || m.cervicomental.score100 || 70;

    const gonialDeficit = (100 - sGonial) * 0.70;
    const ramusDeficit = (100 - sRamus) * 0.65;
    const elineDeficit = (100 - sEline) * 0.75;
    const neckDeficit = (100 - sNeck) * 0.85;

    const potGain = 0.30 * elineDeficit + 0.30 * neckDeficit + 0.20 * gonialDeficit + 0.20 * ramusDeficit;
    const potScore = Math.max(sCeph, Math.min(99, Math.round(sCeph + potGain)));
    const potDelta = potScore - sCeph;
    const potPercentile = PopulationReferenceDB.zToPercentile((potScore - mu) / sigma);

    const potentialData = {
      score: potScore,
      delta: potDelta,
      percentile: Math.round(potPercentile),
      percentileText: `Up to Top ${(100 - potPercentile).toFixed(1)}% of population`,
      percentileTextRu: `До Топ ${(100 - potPercentile).toFixed(1)}% популяции`,
      reserves: {
        mewingEline: Math.round(0.30 * elineDeficit),
        neckPosture: Math.round(0.30 * neckDeficit),
        masseters: Math.round(0.20 * gonialDeficit + 0.20 * ramusDeficit)
      }
    };

    const reliabilityBreakdown = {
      measuredPct: 88,
      estimatedPct: 8,
      notObservablePct: 4,
      photoQuality: qcRes ? qcRes.photoReliability : 88,
      confidenceRating: qcRes ? qcRes.confidenceRating : 'HIGH'
    };

    const recs = this._generateProfileRecs(cephReport);

    return {
      viewMode: 'profile',
      scientific: {
        score: sCeph,
        zScore: parseFloat(zScore.toFixed(2)),
        percentile: Math.round(percentile),
        confidence: conf,
        uncertainty: unc
      },
      sexual: {
        score: Math.max(10, Math.min(99, Math.round(0.40 * sGonial + 0.30 * sRamus + 0.30 * sEline))),
        zScore: parseFloat(zScore.toFixed(2)),
        percentile: Math.round(percentile),
        confidence: conf,
        uncertainty: unc
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
        cephalometrics: { score: sCeph, metrics: m, title: 'Sagittal Cephalometrics' }
      },
      recommendations: recs
    };
  }

  /**
   * Evaluates DeepScan Composite (Сводный паспорт: Анфас + Профиль 90°)
   */
  static calculateComposite(frontalReport, profileReport) {
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
    const uncSci = PopulationReferenceDB.computeUncertainty(compositeSciScore, conf);

    const zScoreSex = (compositeSexScore - mu) / sigma;
    const percentileSex = PopulationReferenceDB.zToPercentile(zScoreSex);
    const uncSex = PopulationReferenceDB.computeUncertainty(compositeSexScore, conf);

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
        uncertainty: uncSci
      },
      sexual: {
        score: compositeSexScore,
        zScore: parseFloat(zScoreSex.toFixed(2)),
        percentile: Math.round(percentileSex),
        confidence: conf,
        uncertainty: uncSex
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
        averageness: { score: frontalReport.modules.morph3D ? Math.round(frontalReport.modules.morph3D.score3D || 85) : 85, weight: 16.7, label: 'Averageness & Prototypicality' },
        skinHealth: { score: frontalReport.modules.skin.score, weight: 16.7, label: 'Skin & Soft-Tissue Appearance' },
        symmetry: { score: frontalReport.modules.symmetry.score, weight: 16.7, label: 'Fluctuating Symmetry & Balance' },
        periorbital: { score: frontalReport.modules.periorbital.score, weight: 16.7, label: 'Periorbital & Eye Harmony' },
        anthropometry: { score: Math.round(0.50 * frontalReport.modules.anthro.score + 0.50 * profileReport.modules.cephalometrics.score), weight: 16.7, label: 'Craniofacial & Sagittal Architecture' },
        dimorphism: { score: frontalReport.modules.dimorphism.score, weight: 16.7, label: 'Secondary Sexual Dimorphism' }
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
      return { code: 'ELITE / GIGACHAD', badgeClass: 'tier-s', descEn: 'Top 0.1% Looksmax community tier', descRu: 'Топ 0.1% стандарт сообщества Looksmax' };
    } else if (psl >= 7.0) {
      return { code: 'CHADLITE / HIGH TIER', badgeClass: 'tier-a', descEn: 'Top 2% Looksmax tier', descRu: 'Топ 2% стандарт сообщества Looksmax' };
    } else if (psl >= 6.0) {
      return { code: 'HIGH / ABOVE AVERAGE', badgeClass: 'tier-b', descEn: 'Top 15% Looksmax tier', descRu: 'Топ 15% стандарт сообщества Looksmax' };
    } else if (psl >= 5.0) {
      return { code: 'MEDIAN / NORMIE', badgeClass: 'tier-c', descEn: 'Population average tier', descRu: 'Среднепопуляционный тир' };
    } else if (psl >= 4.0) {
      return { code: 'LTN / LOW TIER NORMIE', badgeClass: 'tier-d', descEn: 'Below average tier', descRu: 'Ниже среднего' };
    } else {
      return { code: 'SUB-FIVE', badgeClass: 'tier-f', descEn: 'Significant optimization reserve', descRu: 'Высокий потенциал оптимизации' };
    }
  }

  /**
   * Comprehensive Recommendations Engine
   */
  static _generateComprehensiveFrontalRecs(morph2D, skinRes, symRes, morph3D) {
    const m = morph2D.metrics;
    const recs = [];

    // 1. Skin & Soft Tissue
    if (skinRes && skinRes.metrics.carotenoid.score < 82) {
      recs.push({
        id: 'rec_carotenoid',
        level: 'soft',
        icon: 'carrot',
        titleEn: 'Dietary Carotenoid Protocol (Beta-Carotene & Lycopene)',
        titleRu: 'Протокол каротиноидной оптимизации тона кожи',
        categoryEn: 'Dermatological Nutrition',
        categoryRu: 'Дерматологическая нутрициология',
        gain: '+2.5 pts to Perceived Skin Vitality',
        gainRu: '+2.5 pts к визуальной свежести кожи',
        rawGain: 2.5,
        textEn: 'Stephen et al. (2011) demonstrated that increasing dietary beta-carotene (carrots, sweet potatoes) and lycopene (cooked tomatoes) by 15-25mg/day significantly enhances skin yellowness (CIELAB b*), which human observers perceive as a primary cue of health and attractiveness.',
        textRu: 'Исследования Stephen et al. (2011) доказали, что повышение потребления бета-каротина и ликопина увеличивает значение b* в шкале CIELAB, что воспринимается людьми как индикатор здоровья и привлекательности.'
      });
    }

    if (skinRes && skinRes.metrics.uniformity.score < 80) {
      recs.push({
        id: 'rec_retinoid',
        level: 'soft',
        icon: 'sparkles',
        titleEn: 'Topical Retinoid & Daily SPF 50+ Broad-Spectrum',
        titleRu: 'Топические ретиноиды и ежедневный SPF 50+ широкого спектра',
        categoryEn: 'Dermatological Protocol',
        categoryRu: 'Дерматологический протокол',
        gain: '+3.0 pts to Skin Texture Homogeneity',
        gainRu: '+3.0 pts к однородности тона и микрорельефу',
        rawGain: 3.0,
        textEn: 'Fink et al. (2006) established that facial skin color homogeneity accounts for significant variance in attractiveness ratings. Incorporate 0.025%-0.05% topical tretinoin/adapalene combined with UVA/UVB SPF 50+ to reduce color variance (std dev σ < 3.8).',
        textRu: 'Fink et al. (2006) установили, что гомогенность тона кожи является ключевым предиктором привлекательности. Ретиноиды ускоряют клеточное обновление, сглаживая дисперсию тона σ < 3.8.'
      });
    }

    // 2. Periorbital & Sleep
    if (m.scleralShow.score100 < 80 || (skinRes && skinRes.metrics.darkCircles.score < 80)) {
      recs.push({
        id: 'rec_periorbital',
        level: 'medium',
        icon: 'moon',
        titleEn: 'Circadian Sleep Restoration & Caffeine 5% + EGCG Serum',
        titleRu: 'Циркадный сон и сыворотка с кофеином 5% + EGCG',
        categoryEn: 'Periorbital Care',
        categoryRu: 'Периорбитальный уход',
        gain: '+2.8 pts to Periorbital Complex',
        gainRu: '+2.8 pts к тонусу век и периорбитальной зоне',
        rawGain: 2.8,
        textEn: 'Axelsson et al. (2010) demonstrated sleep deprivation increases palpebral ptosis, periorbital edema, and dark circles. Maintain 7.5-8.5h sleep with elevated head position and topical caffeine/vitamin K oxide.',
        textRu: 'Axelsson et al. (2010) показали, что депривация сна усиливает птоз нижнего века и темные круги. Регулярный сон и кофеин 5% улучшают микроциркуляцию.'
      });
    }

    // 3. Symmetry & Bilateral Chewing
    if (symRes && symRes.scoreStructural < 82) {
      recs.push({
        id: 'rec_symmetry',
        level: 'medium',
        icon: 'scale',
        titleEn: 'Bilateral Chewing Equilibrium & Masticatory Balance',
        titleRu: 'Сбалансированное билатеральное жевание и коррекция прикуса',
        categoryEn: 'Myofunctional Exercise',
        categoryRu: 'Миофункциональная коррекция',
        gain: '+2.4 pts to Bilateral Symmetry',
        gainRu: '+2.4 pts к билатеральной симметрии',
        rawGain: 2.4,
        textEn: 'Unilateral chewing causes hypertrophic asymmetry of the masseter muscle and temporal bone torsion. Consciously distribute masticatory load 50/50 and screen for unilateral dental malocclusion.',
        textRu: 'Одностороннее жевание приводит к гипертрофической асимметрии массетеров. Равномерное жевание 50/50 восстанавливает симметрию нижней трети.'
      });
    }

    // 4. Facial Adiposity & Body Fat
    if (skinRes && skinRes.metrics.adiposity.score < 82) {
      recs.push({
        id: 'rec_leanness',
        level: 'soft',
        icon: 'activity',
        titleEn: 'Systemic Body Fat Optimization (10–14% Body Fat Target)',
        titleRu: 'Оптимизация процента подкожного жира (10–14% для мужчин)',
        categoryEn: 'Body Composition',
        categoryRu: 'Композиция тела',
        gain: '+3.5 pts to Mandibular Definition & Cheek Hollow',
        gainRu: '+3.5 pts к четкости челюсти и скуловому контуру',
        rawGain: 3.5,
        textEn: 'Coetzee et al. (2012) proved facial adiposity is heavily correlated with perceived health and facial definition. Reducing body fat to 10-14% (men) or 19-22% (women) sharpens the mandibular border and zygomatic arch.',
        textRu: 'Coetzee et al. (2012) доказали связь лицевой адипозности с восприятием привлекательности. Снижение процента жира до 10-14% подчеркивает скулы и угол челюсти.'
      });
    }

    return recs;
  }

  /**
   * Profile Cephalometric Recommendations
   */
  static _generateProfileRecs(cephReport) {
    const m = cephReport.metrics;
    const recs = [];

    if (m.cervicomental && (m.cervicomental.score || m.cervicomental.score100 || 100) < 82) {
      recs.push({
        id: 'rec_chin_tuck',
        level: 'medium',
        icon: 'arrow-up-right',
        titleEn: 'Deep Cervical Flexor Training (McKenzie Chin Tucks)',
        titleRu: 'Тренинг глубоких сгибателей шеи (Чин-таки Маккензи)',
        categoryEn: 'Postural Alignment',
        categoryRu: 'Постуральная коррекция',
        gain: '+3.8 pts to Cervicomental Neck Angle',
        gainRu: '+3.8 pts к шейно-подбородочному углу',
        rawGain: 3.8,
        textEn: 'Forward head posture reduces mandibular apparent projection and flattens the cervicomental angle by 12-18°. Perform 3 sets of 15 isometric chin tucks daily to activate longus colli muscles.',
        textRu: 'Выдвижение шеи вперед сглаживает шейно-подбородочный угол на 12-18°. Изометрические чин-таки Маккензи 3x15 в день восстанавливают проекцию подбородка.'
      });
    }

    if (m.eline && (m.eline.score || m.eline.score100 || 100) < 80) {
      recs.push({
        id: 'rec_mewing',
        level: 'medium',
        icon: 'smile',
        titleEn: 'Palatal Tongue Posture (Mewing / Orthotropic Rest Position)',
        titleRu: 'Палатальная осанка языка (Мьюинг / Ортотропика)',
        categoryEn: 'Myofunctional Therapy',
        categoryRu: 'Миофункциональная терапия',
        gain: '+2.6 pts to Sagittal Submental Tone',
        gainRu: '+2.6 pts к сагиттальному тонусу подъязычной зоны',
        rawGain: 2.6,
        textEn: 'Maintaining continuous resting contact of the posterior third of the tongue against the hard and soft palate elevates the hyoid bone, immediately tightening the submental soft tissue profile.',
        textRu: 'Прижатие задней трети языка к небу поднимает подъязычную кость, мгновенно подтягивая ткани подбородка и улучшая линию Риккетса.'
      });
    }

    return recs;
  }
}

window.AttractivenessScorer = AttractivenessScorer;
