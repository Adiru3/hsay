/**
 * HSAY - transparent, rule-based facial morphometry report.
 *
 * This module does not predict human ratings, sexual attractiveness or a
 * population rank. All composite values are image-derived fit indices with
 * disclosed weights. Fixed reference intervals are used only as code anchors;
 * the application does not show a population percentile.
 */
class AttractivenessScorer {
  static _clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
  }

  static _score(value, fallback = 50) {
    return this._clamp(Number.isFinite(value) ? value : fallback);
  }

  static _photoSensitivity(photoReliability) {
    const confidence = this._clamp(photoReliability, 10, 99);
    const range = Math.max(7, Math.round(18 - confidence * 0.11));
    return {
      uncertainty: range,
      formatted: `±${range} photo-sensitivity points`,
      confidence
    };
  }

  /**
   * Frontal image report.
   * The legacy periorbitalRes and dimorphRes parameters remain for backwards
   * compatibility; the canonical, displayed Morphometry2D outputs are used so
   * a report cannot be driven by hidden duplicate modules.
   */
  static calculateFrontal(morph2D, periorbitalRes, skinRes, symRes, dimorphRes, morph3D, qcRes, wholeFace) {
    const sConfig = this._score(wholeFace ? wholeFace.configurationScore : 70);
    const sSkin = this._score(skinRes ? skinRes.subTotalScore : 60);
    const sSym = this._score(symRes ? symRes.subTotalScore : 60);
    const sPeri = this._score(morph2D.subScores.periorbital);
    const sAnthro = this._score(morph2D.subScores.craniofacial);
    const sDimorph = this._score(morph2D.subScores.dimorphism);
    const sFreshness = this._score(morph2D.subScores.youthfulness);
    const sHarmony = this._score(FeatureIntegrationEngine.evaluateHarmony(morph2D, symRes, morph3D, skinRes).globalHarmonyScore);
    const sHunter = this._score(morph2D.metrics.hunterEyes.score100);
    const sJaw = Math.round((
      this._score(morph2D.metrics.mandibularTaper.score100) +
      this._score(morph2D.metrics.jawCheekRatio.score100) +
      this._score(morph2D.metrics.chinFaceRatio.score100)
    ) / 3);
    const sPslFrame = Math.round((
      this._score(morph2D.metrics.fwhr.score100) +
      this._score(morph2D.metrics.jawCheekRatio.score100) +
      this._score(morph2D.metrics.chinFaceRatio.score100) +
      this._score(morph2D.metrics.mandibularTaper.score100)
    ) / 4);
    const sPslProportions = Math.round((
      this._score(morph2D.metrics.midfaceRatio.score100) +
      this._score(morph2D.metrics.thirds.score100) +
      this._score(morph2D.metrics.fifths.score100) +
      this._score(morph2D.metrics.mouthNoseRatio.score100)
    ) / 4);

    // Model A — six equally weighted, observable domains. No empirical
    // validation cohort exists that would justify one domain outweighing the
    // others, so equal weighting is the least assumptive aggregation.
    const balanceScore = Math.round(
      (sConfig + sAnthro + sPeri + sSym + sSkin + sHarmony) / 6
    );

    // Model B — six equally weighted feature-definition and freshness inputs.
    // The sex-profile component is selected in Morphometry2DEngine; it is not
    // a prediction of sexual attractiveness.
    const definitionScore = Math.round(
      (sDimorph + sJaw + sPeri + sFreshness + sSym + sSkin) / 6
    );

    // PSL-inspired geometry heuristic. It deliberately has its own six
    // direct inputs, rather than using Model A or Model B as hidden inputs.
    const pslModules = {
      frameGeometry: { score: sPslFrame, weight: '16.7%', label: 'Frame geometry (fWHR, jaw and chin)' },
      eyeGeometry: { score: sHunter, weight: '16.7%', label: 'Eye geometry composite' },
      facialProportions: { score: sPslProportions, weight: '16.7%', label: 'Facial proportion geometry' },
      lowerFace: { score: sJaw, weight: '16.7%', label: 'Lower-face geometry' },
      bilateralBalance: { score: sSym, weight: '16.7%', label: 'Bilateral balance' },
      selectedProfileFit: { score: sDimorph, weight: '16.7%', label: 'Selected sex-profile fit' }
    };
    const pslIndex = parseFloat((Object.values(pslModules).reduce((sum, module) => sum + module.score, 0) / 6).toFixed(1));
    // At 100 across every disclosed component this reaches the documented
    // upper bound of 9.0, rather than reserving an unreachable top range.
    const finalPsl = parseFloat(this._clamp(1 + pslIndex * 0.08, 1, 9).toFixed(1));
    const confidence = qcRes ? qcRes.photoReliability : 65;
    const uncertainty = this._photoSensitivity(confidence);
    const skinEstimated = !skinRes || skinRes.status !== 'MEASURED';

    const priorities = {
      skin: Math.round(100 - sSkin),
      periorbital: Math.round(100 - sPeri),
      symmetry: Math.round(100 - sSym),
      jawMuscles: Math.round(100 - sJaw)
    };
    const coverage = this._buildCoverageMap('frontal', { morph2D, skinRes, symRes, morph3D, qcRes });
    const recs = [
      ...this._generateComprehensiveFrontalRecs(morph2D, skinRes, symRes, morph3D),
      ...this._coverageRecommendations(coverage)
    ];

    return {
      viewMode: 'frontal',
      methodology: 'rule_based_photo_heuristic',
      scientific: { score: balanceScore, zScore: null, percentile: null, confidence, uncertainty },
      sexual: { score: definitionScore, zScore: null, percentile: null, confidence, uncertainty },
      psl: { score: finalPsl, tier: this._getPslTier(finalPsl), percentile: null, confidence, index: pslIndex, modules: pslModules },
      reliability: {
        measuredPct: skinEstimated ? 62 : 72,
        estimatedPct: skinEstimated ? 30 : 20,
        notObservablePct: 8,
        photoQuality: confidence,
        confidenceRating: qcRes ? qcRes.confidenceRating : 'MEDIUM'
      },
      // This is an upper sensitivity bound for a repeat photograph, not a
      // prediction of a person's achievable appearance or treatment outcome.
      potential: {
        score: balanceScore,
        photoCeiling: this._clamp(balanceScore + uncertainty.uncertainty),
        delta: Math.min(uncertainty.uncertainty, 100 - balanceScore),
        humanAppearanceMaximum: null,
        limitation: 'A single photograph cannot estimate an individual maximum appearance outcome.',
        reserves: priorities,
        priorityOrder: Object.entries(priorities).sort((a, b) => b[1] - a[1]).map(([id]) => id)
      },
      harmony: sHarmony,
      modules: {
        configuration: { score: sConfig, weight: '16.7%', title: 'Configuration Balance' },
        anthro: { score: sAnthro, weight: '16.7%', metrics: morph2D.metrics, title: 'Craniofacial Proportions' },
        periorbital: { score: sPeri, weight: '16.7%', metrics: morph2D.metrics, title: 'Periorbital Complex' },
        skin: { score: sSkin, weight: '16.7%', metrics: skinRes ? skinRes.metrics : {}, title: 'Skin & Soft Tissue' },
        symmetry: { score: sSym, weight: '16.7%', metrics: symRes ? symRes.metrics : {}, title: 'Symmetry & Coaxiality' },
        dimorphism: { score: sDimorph, weight: 'Model B: 16.7%', metrics: morph2D.metrics, title: 'Feature Dimorphism' },
        harmony: { score: sHarmony, weight: '16.7%', title: 'Cross-feature Harmony' },
        morph3D
      },
      morph2D,
      coverage,
      recommendations: recs
    };
  }

  /** Profile image report based solely on the six displayed cephalometric proxies. */
  static calculateProfile(cephReport, qcRes) {
    const m = cephReport.metrics;
    const sCeph = this._score(cephReport.subTotalScore);
    const sGonial = this._score(m.gonialAngle.score ?? m.gonialAngle.score100);
    const sRamus = this._score(m.ramusIndex.score ?? m.ramusIndex.score100);
    const sEline = this._score(m.eline.score ?? m.eline.score100);
    const sNeck = this._score(m.cervicomental.score ?? m.cervicomental.score100);
    const sConvexity = this._score(m.convexity.score ?? m.convexity.score100);
    const sNasolabial = this._score(m.nasolabial.score ?? m.nasolabial.score100);

    const definitionScore = Math.round((sGonial + sRamus + sEline + sNeck + sConvexity + sNasolabial) / 6);
    const pslModules = {
      gonialGeometry: { score: sGonial, weight: '16.7%', label: 'Gonial geometry' },
      ramusGeometry: { score: sRamus, weight: '16.7%', label: 'Ramus proportion' },
      lipProfile: { score: sEline, weight: '16.7%', label: 'Lip-to-profile relation' },
      neckProfile: { score: sNeck, weight: '16.7%', label: 'Cervicomental geometry' },
      facialConvexity: { score: sConvexity, weight: '16.7%', label: 'Facial convexity' },
      nasolabialGeometry: { score: sNasolabial, weight: '16.7%', label: 'Nasolabial geometry' }
    };
    const pslIndex = parseFloat((Object.values(pslModules).reduce((sum, module) => sum + module.score, 0) / 6).toFixed(1));
    const finalPsl = parseFloat(this._clamp(1 + pslIndex * 0.08, 1, 9).toFixed(1));
    const confidence = qcRes ? qcRes.photoReliability : 60;
    const uncertainty = this._photoSensitivity(confidence);
    const priorities = {
      skin: 0,
      periorbital: Math.round(100 - sEline),
      symmetry: Math.round(100 - sConvexity),
      jawMuscles: Math.round(100 - Math.min(sGonial, sRamus, sNeck))
    };
    const coverage = this._buildCoverageMap('profile', { cephReport, qcRes });
    const recs = [
      ...this._generateProfileRecs(cephReport),
      ...this._coverageRecommendations(coverage)
    ];

    return {
      viewMode: 'profile',
      methodology: 'rule_based_profile_heuristic',
      scientific: { score: sCeph, zScore: null, percentile: null, confidence, uncertainty },
      sexual: { score: definitionScore, zScore: null, percentile: null, confidence, uncertainty },
      psl: { score: finalPsl, tier: this._getPslTier(finalPsl), percentile: null, confidence, index: pslIndex, modules: pslModules },
      reliability: {
        measuredPct: 70,
        estimatedPct: 22,
        notObservablePct: 8,
        photoQuality: confidence,
        confidenceRating: qcRes ? qcRes.confidenceRating : 'MEDIUM'
      },
      potential: {
        score: sCeph,
        photoCeiling: this._clamp(sCeph + uncertainty.uncertainty),
        delta: Math.min(uncertainty.uncertainty, 100 - sCeph),
        humanAppearanceMaximum: null,
        limitation: 'A single profile photograph cannot estimate an individual maximum appearance outcome.',
        reserves: priorities,
        priorityOrder: Object.entries(priorities).sort((a, b) => b[1] - a[1]).map(([id]) => id)
      },
      modules: { cephalometrics: { score: sCeph, metrics: m, title: 'Sagittal Cephalometrics' } },
      coverage,
      recommendations: recs
    };
  }

  /** Combines two transparent view-specific indices; it does not create a new population norm. */
  static calculateComposite(frontalReport, profileReport) {
    const compositeSciScore = Math.round((frontalReport.scientific.score + profileReport.scientific.score) / 2);
    const compositeSexScore = Math.round((frontalReport.sexual.score + profileReport.sexual.score) / 2);
    const pslIndex = parseFloat(((frontalReport.psl.index + profileReport.psl.index) / 2).toFixed(1));
    const finalPsl = parseFloat(this._clamp(1 + pslIndex * 0.08, 1, 9).toFixed(1));
    const confidence = Math.round((frontalReport.scientific.confidence + profileReport.scientific.confidence) / 2);
    const uncertainty = this._photoSensitivity(confidence);
    const reserves = {
      skin: frontalReport.potential.reserves.skin,
      periorbital: Math.max(frontalReport.potential.reserves.periorbital, profileReport.potential.reserves.periorbital),
      symmetry: Math.max(frontalReport.potential.reserves.symmetry, profileReport.potential.reserves.symmetry),
      jawMuscles: Math.max(frontalReport.potential.reserves.jawMuscles, profileReport.potential.reserves.jawMuscles)
    };
    const coverage = this._buildCoverageMap('composite', { frontalReport, profileReport });
    const seen = new Set();
    const recommendations = [
      ...frontalReport.recommendations,
      ...this._generateProfileRecs(profileReport.modules.cephalometrics),
      ...this._coverageRecommendations(coverage)
    ].filter(rec => !seen.has(rec.id) && seen.add(rec.id));

    return {
      viewMode: 'composite',
      methodology: 'rule_based_composite_heuristic',
      scientific: { score: compositeSciScore, zScore: null, percentile: null, confidence, uncertainty },
      sexual: { score: compositeSexScore, zScore: null, percentile: null, confidence, uncertainty },
      psl: {
        score: finalPsl,
        tier: this._getPslTier(finalPsl),
        percentile: null,
        confidence,
        index: pslIndex,
        modules: {
          frontalGeometry: { score: frontalReport.psl.index, weight: '50%', label: 'Frontal PSL geometry' },
          profileGeometry: { score: profileReport.psl.index, weight: '50%', label: 'Profile PSL geometry' }
        }
      },
      reliability: {
        measuredPct: Math.round((frontalReport.reliability.measuredPct + profileReport.reliability.measuredPct) / 2),
        estimatedPct: Math.round((frontalReport.reliability.estimatedPct + profileReport.reliability.estimatedPct) / 2),
        notObservablePct: 8,
        photoQuality: confidence,
        confidenceRating: confidence >= 82 ? 'HIGH' : (confidence >= 65 ? 'MEDIUM' : 'LOW')
      },
      potential: {
        score: compositeSciScore,
        photoCeiling: this._clamp(compositeSciScore + uncertainty.uncertainty),
        delta: Math.min(uncertainty.uncertainty, 100 - compositeSciScore),
        humanAppearanceMaximum: null,
        limitation: 'Two photographs still cannot estimate an individual maximum appearance outcome.',
        reserves,
        priorityOrder: Object.entries(reserves).sort((a, b) => b[1] - a[1]).map(([id]) => id)
      },
      scientificMatrix: {
        configuration: { score: frontalReport.modules.configuration.score, weight: 16.7, label: 'Configuration balance' },
        dimorphism: { score: frontalReport.modules.dimorphism.score, weight: 0, label: 'Feature definition input (Model B)' },
        skinHealth: { score: frontalReport.modules.skin.score, weight: 16.7, label: 'Skin & soft-tissue appearance' },
        symmetry: { score: frontalReport.modules.symmetry.score, weight: 16.7, label: 'Bilateral balance' },
        periorbital: { score: frontalReport.modules.periorbital.score, weight: 16.7, label: 'Periorbital configuration' },
        anthropometry: { score: frontalReport.modules.anthro.score, weight: 16.7, label: 'Craniofacial proportions' },
        harmony: { score: frontalReport.modules.harmony.score, weight: 16.7, label: 'Cross-feature harmony' }
      },
      frontalReport,
      profileReport,
      coverage,
      recommendations
    };
  }

  static _getPslTier(psl) {
    if (psl >= 7.8) return { code: 'STRONG STRUCTURAL FIT', badgeClass: 'tier-s', descEn: 'High rule-based geometry fit; not a population rank.', descRu: 'Высокое соответствие правилам геометрии; не популяционный ранг.' };
    if (psl >= 6.8) return { code: 'BALANCED FIT', badgeClass: 'tier-a', descEn: 'Balanced result across the inspected image features.', descRu: 'Сбалансированный результат по наблюдаемым признакам снимка.' };
    if (psl >= 5.5) return { code: 'MIXED FIT', badgeClass: 'tier-b', descEn: 'Mixed feature fit; inspect the action priorities below.', descRu: 'Смешанное соответствие; изучите приоритеты ниже.' };
    if (psl >= 4.2) return { code: 'REVIEW PRIORITIES', badgeClass: 'tier-c', descEn: 'Several photographed features need a second look.', descRu: 'Несколько признаков на фото стоит перепроверить.' };
    return { code: 'LOW PHOTO FIT', badgeClass: 'tier-d', descEn: 'Retake a standardised photo before drawing conclusions.', descRu: 'Сначала сделайте стандартизированное фото, затем делайте выводы.' };
  }

  /**
   * Traceable checklist coverage. It lists what the current workflow can
   * observe and, just as importantly, what no still photograph can establish.
   * This is deliberately a coverage map, not a claim of 100% assessment.
   */
  static _buildCoverageMap(viewMode, context = {}) {
    const frontalReport = context.frontalReport;
    const profileReport = context.profileReport;
    const morph2D = context.morph2D || frontalReport?.morph2D;
    const skinRes = context.skinRes;
    const morph3D = context.morph3D || frontalReport?.modules?.morph3D;
    const hasFrontal = viewMode !== 'profile';
    const hasProfile = viewMode !== 'frontal';
    const frontalCoverage = frontalReport?.coverage?.items || [];
    const priorSkin = frontalCoverage.find(item => item.id === 'skin_presentation');
    const skinReadable = Number.isFinite(skinRes?.subTotalScore) || priorSkin?.status === 'PHOTO_PROXY';
    const meshAvailable = Boolean(morph3D && Object.values(morph3D.metrics || {}).some(metric => Number.isFinite(metric.rawVal)));
    const photoReliability = context.qcRes?.photoReliability || frontalReport?.scientific?.confidence || profileReport?.scientific?.confidence || null;
    const item = (id, status, labelEn, labelRu, detailEn, detailRu, nextEn, nextRu) => ({
      id, status, labelEn, labelRu, detailEn, detailRu, nextEn, nextRu
    });

    return {
      viewMode,
      photoReliability,
      items: [
        item(
          'photo_protocol',
          Number.isFinite(photoReliability) ? 'OBSERVED' : 'REQUIRES_USER_INPUT',
          'Photo protocol and quality', 'Протокол и качество фото',
          Number.isFinite(photoReliability) ? `QC reliability: ${photoReliability}/100.` : 'No quality result is available.',
          Number.isFinite(photoReliability) ? `Надёжность QC: ${photoReliability}/100.` : 'Нет результата контроля качества.',
          'Use three to five standardised images before comparing a trend.',
          'Используйте три–пять стандартизированных фото перед сравнением динамики.'
        ),
        item(
          'frontal_geometry',
          hasFrontal && morph2D ? 'OBSERVED' : 'MISSING_INPUT',
          'Frontal facial geometry', 'Фронтальная геометрия лица',
          hasFrontal && morph2D ? 'Landmark-derived frontal proportions and bilateral geometry are available.' : 'A neutral frontal image is missing.',
          hasFrontal && morph2D ? 'Доступны фронтальные пропорции и билатеральная геометрия по ориентирам.' : 'Не хватает нейтрального фронтального фото.',
          'Add an eye-level, neutral frontal image without filters or occlusion.',
          'Добавьте нейтральное фронтальное фото без фильтров и перекрытий, камера на уровне глаз.'
        ),
        item(
          'profile_geometry',
          hasProfile ? 'OBSERVED' : 'MISSING_INPUT',
          'Profile geometry', 'Геометрия профиля',
          hasProfile ? 'A lateral photo permits only 2D profile proxies.' : 'A true lateral profile image is missing.',
          hasProfile ? 'Боковой снимок позволяет получить только 2D-прокси профиля.' : 'Не хватает настоящего бокового фото.',
          'Add a relaxed, true side view at head height; do not force jaw or neck posture.',
          'Добавьте расслабленный настоящий боковой ракурс на высоте головы; не фиксируйте челюсть или шею.'
        ),
        item(
          'eye_geometry',
          hasFrontal ? 'PHOTO_PROXY' : 'MISSING_INPUT',
          'Eye-area geometry', 'Геометрия зоны глаз',
          hasFrontal ? 'Canthal, aperture and relative scleral measures are photo proxies, not eye-health findings.' : 'A frontal image is needed for eye-area geometry.',
          hasFrontal ? 'Кантальные, глазные и относительные склеральные показатели — фото-прокси, не вывод о здоровье глаз.' : 'Для геометрии зоны глаз нужно фронтальное фото.',
          'Repeat under neutral light; seek care for pain, swelling or vision changes instead of using this proxy.',
          'Повторите при нейтральном свете; при боли, отёке или изменении зрения обратитесь к врачу, а не интерпретируйте прокси.'
        ),
        item(
          'skin_presentation',
          skinReadable ? 'PHOTO_PROXY' : 'MISSING_INPUT',
          'Skin presentation', 'Вид кожи на фото',
          skinReadable ? 'Pixel-based texture and colour measures are lighting-sensitive photo proxies.' : 'Readable skin pixels are unavailable.',
          skinReadable ? 'Пиксельные показатели текстуры и цвета зависят от света и являются фото-прокси.' : 'Недоступны читаемые пиксели кожи.',
          'Use even daylight and no filters; skin diagnosis or treatment needs a qualified clinician.',
          'Используйте ровный дневной свет и без фильтров; диагноз и лечение кожи проводит специалист.'
        ),
        item(
          'smile_and_dentition',
          'MISSING_INPUT',
          'Smile, teeth and visible dental alignment', 'Улыбка, зубы и видимое положение зубного ряда',
          'The current neutral-face workflow does not capture a smile or dental occlusion.',
          'Текущий протокол нейтрального лица не фиксирует улыбку или окклюзию зубов.',
          'Use a separate, neutral smile image for visual documentation; bite and tooth health need dental assessment.',
          'Используйте отдельное нейтральное фото улыбки для документации; прикус и здоровье зубов требуют стоматологической оценки.'
        ),
        item(
          'hair_style_grooming',
          'REQUIRES_USER_INPUT',
          'Hair, facial hair, eyebrows, eyewear and style', 'Волосы, растительность на лице, брови, очки и стиль',
          'These are not automatically rated because personal preference and context dominate their effect.',
          'Они не оцениваются автоматически: их эффект в основном зависит от личного вкуса и контекста.',
          'Use a human self-audit with your own style goal; do not convert it into a universal score.',
          'Используйте ручной чек-лист под собственную цель стиля; не превращайте его в универсальный балл.'
        ),
        item(
          'true_3d_and_soft_tissue',
          meshAvailable ? 'PHOTO_PROXY' : 'MISSING_INPUT',
          'True 3D bone and soft-tissue volume', 'Истинный 3D-каркас и объём мягких тканей',
          meshAvailable ? 'A single-image mesh depth proxy is available; it cannot establish physical millimetres or bone anatomy.' : 'No reliable depth proxy is available from this image.',
          meshAvailable ? 'Доступен прокси глубины по одному изображению; он не определяет миллиметры или костную анатомию.' : 'По этому изображению нет надёжного прокси глубины.',
          'Do not infer bone structure or treatment from a single-image depth proxy.',
          'Не делайте выводов о костной структуре или лечении по прокси глубины одного изображения.'
        ),
        item(
          'health_and_function',
          'CLINICAL_ONLY',
          'Skin diagnosis, bite, jaw function, breathing, vision and pain', 'Диагноз кожи, прикус, функция челюсти, дыхание, зрение и боль',
          'A photograph cannot evaluate symptoms, function, contraindications or diagnoses.',
          'Фото не оценивает симптомы, функцию, противопоказания или диагнозы.',
          'Use symptoms and a qualified in-person assessment when a health or functional concern exists.',
          'При жалобах используйте описание симптомов и очную оценку квалифицированного специалиста.'
        ),
        item(
          'medical_context_and_response',
          'REQUIRES_USER_INPUT',
          'Age, history, medications, goals, risks and response to interventions', 'Возраст, анамнез, лекарства, цели, риски и реакция на вмешательства',
          'No safe personalised treatment plan can be inferred without this context and clinical review.',
          'Без этих данных и клинической оценки нельзя безопасно составить персональный план лечения.',
          'Do not request treatment, dosage or outcome predictions from the image score.',
          'Не запрашивайте лечение, дозировки или прогноз результата по баллу изображения.'
        ),
        item(
          'human_preference',
          'NOT_MEASURABLE',
          'Human attractiveness, beauty and sexual appeal', 'Человеческая привлекательность, красота и сексуальная притягательность',
          'Individual and social preference is not measurable from this rule-based photo analysis.',
          'Индивидуальные и социальные предпочтения не измеряются этим алгоритмическим анализом фото.',
          'Treat all output as a geometry checklist, not a verdict about your value or appeal.',
          'Считайте выводы чек-листом геометрии, а не вердиктом о ценности или привлекательности человека.'
        )
      ]
    };
  }

  static _coverageRecommendations(coverage) {
    const byId = new Map(coverage.items.map(item => [item.id, item]));
    const make = (id, level, icon, titleEn, titleRu, categoryEn, categoryRu, textEn, textRu, protocolEn, protocolRu, sourceUrl = null, sourceLabel = null) => ({
      id, level, icon, titleEn, titleRu, categoryEn, categoryRu,
      textEn, textRu, protocolEn, protocolRu, sourceUrl, sourceLabel,
      gain: level === 'soft' ? 'Input needed' : 'Verify first', rawGain: 0
    });
    const recs = [];

    if (byId.get('frontal_geometry')?.status === 'MISSING_INPUT') {
      recs.push(make('rec_missing_frontal', 'medium', 'camera', 'Add a neutral frontal image', 'Добавьте нейтральное фронтальное фото', 'Missing input', 'Недостающие данные',
        'Frontal geometry is unavailable, so no frontal proportion recommendation can be personalised.',
        'Фронтальная геометрия недоступна, поэтому нельзя персонализировать рекомендации по фронтальным пропорциям.',
        ['Use the camera at eye height.', 'Keep the face forward and expression neutral.', 'Avoid filters, sunglasses, hair across the face and strong side light.'],
        ['Камера — на уровне глаз.', 'Лицо прямо, выражение нейтральное.', 'Без фильтров, очков, волос на лице и сильного бокового света.']));
    }
    if (byId.get('profile_geometry')?.status === 'MISSING_INPUT') {
      recs.push(make('rec_missing_profile', 'medium', 'camera', 'Add a true side-view image', 'Добавьте настоящее боковое фото', 'Missing input', 'Недостающие данные',
        'A frontal photo cannot establish profile geometry or jaw projection proxies.',
        'Фронтальное фото не определяет геометрию профиля и прокси проекции челюсти.',
        ['Use a true lateral view, not a three-quarter pose.', 'Keep the camera at head height and lips relaxed.', 'Do not push the chin, tense the jaw or crane the neck.'],
        ['Используйте настоящий боковой ракурс, не ¾.', 'Камера на высоте головы, губы расслаблены.', 'Не выдвигайте подбородок, не напрягайте челюсть и не вытягивайте шею.']));
    }
    if (byId.get('smile_and_dentition')?.status === 'MISSING_INPUT') {
      recs.push(make('rec_smile_input', 'soft', 'smile', 'Smile and teeth are not covered by this workflow', 'Улыбка и зубы не покрыты этим протоколом', 'Missing input', 'Недостающие данные',
        'A neutral-face photo cannot assess smile display, tooth alignment or bite function.',
        'Нейтральное фото лица не оценивает улыбку, видимое положение зубов или функцию прикуса.',
        ['Document a relaxed smile separately if it matters to your goal.', 'Do not infer bite health from appearance.', 'For bite, pain or function concerns, use an in-person dental assessment.'],
        ['Отдельно зафиксируйте расслабленную улыбку, если это важно для вашей цели.', 'Не делайте выводов о здоровье прикуса по внешнему виду.', 'При жалобах на прикус, боль или функцию нужна очная стоматологическая оценка.'],
        'https://www.nhs.uk/tests-and-treatments/braces/', 'NHS: orthodontic assessment overview'));
    }
    if (byId.get('hair_style_grooming')?.status === 'REQUIRES_USER_INPUT') {
      recs.push(make('rec_style_input', 'soft', 'scissors', 'Style and grooming need a personal goal', 'Для стиля и ухода нужна личная цель', 'User context', 'Контекст пользователя',
        'Hair, facial hair, eyebrows and eyewear are not scored because there is no universal optimum.',
        'Волосы, растительность на лице, брови и очки не оцениваются: универсального оптимума нет.',
        ['State your practical style goal before comparing options.', 'Use unfiltered reference photos under similar lighting.', 'Choose changes you can reverse before considering permanent changes.'],
        ['Сначала сформулируйте практическую цель стиля.', 'Сравнивайте фото без фильтров при похожем свете.', 'Сначала выбирайте обратимые изменения, а не постоянные.']));
    }
    if (byId.get('health_and_function')?.status === 'CLINICAL_ONLY') {
      recs.push(make('rec_clinical_boundary', 'soft', 'stethoscope', 'Health and function require symptoms and an in-person assessment', 'Здоровье и функция требуют симптомов и очной оценки', 'Clinical boundary', 'Граница клинической оценки',
        'The image cannot determine skin disease, bite function, breathing, vision, pain or treatment suitability.',
        'Фото не определяет болезнь кожи, функцию прикуса, дыхание, зрение, боль или пригодность лечения.',
        ['Write down symptoms, duration and what changes them.', 'Use the photo only as visual context.', 'Consult an appropriate qualified clinician for a health or functional concern.'],
        ['Запишите симптомы, длительность и что на них влияет.', 'Используйте фото только как визуальный контекст.', 'При жалобе на здоровье или функцию обратитесь к подходящему квалифицированному специалисту.']));
    }
    return recs;
  }

  static _generateComprehensiveFrontalRecs(morph2D, skinRes, symRes) {
    const m = morph2D.metrics;
    const recs = [];
    const add = (id, level, icon, titleEn, titleRu, categoryEn, categoryRu, textEn, textRu, protocolEn = [], protocolRu = [], sourceUrl = null, sourceLabel = null) => recs.push({
      id, level, icon, titleEn, titleRu, categoryEn, categoryRu,
      gain: level === 'soft' ? 'Review first' : 'Priority review',
      rawGain: level === 'soft' ? 1 : 2,
      textEn, textRu, protocolEn, protocolRu, sourceUrl, sourceLabel
    });

    if (!skinRes || !Number.isFinite(skinRes.subTotalScore) || skinRes.subTotalScore < 78) {
      add('rec_skin', 'soft', 'sparkles', 'Skin: confirm under neutral light', 'Кожа: проверьте при нейтральном освещении', 'Skin presentation', 'Внешний вид кожи',
        'Retake the photo in even daylight without beauty filters. For persistent acne, pigment change, irritation or a skin concern, consult a qualified dermatologist rather than trying to optimise a score.',
        'Переснимите лицо при ровном дневном свете без фильтров. При стойком акне, изменении пигментации, раздражении или другой проблеме кожи обратитесь к квалифицированному дерматологу, а не пытайтесь «исправить балл».',
        [
          'Take unfiltered photos in the same neutral daylight once per week; compare only images made under the same conditions.',
          'Do not pick or aggressively scrub visible lesions; use only products that are appropriate for your skin and follow their labels.',
          'Arrange a dermatology review for persistent, painful, scarring or distressing changes.'
        ],
        [
          'Делайте фото без фильтров раз в неделю при одинаковом нейтральном дневном свете и сравнивайте только такие снимки.',
          'Не выдавливайте и не травмируйте заметные элементы; используйте только подходящие вашей коже средства по инструкции.',
          'При стойких, болезненных, рубцующихся или беспокоящих изменениях запишитесь к дерматологу.'
        ],
        'https://www.aad.org/public/diseases/acne/skin-care/tips',
        'American Academy of Dermatology: acne skin-care guidance');
    }
    if (m.scleralShow.score100 < 75 || (skinRes && skinRes.metrics.darkCircles && skinRes.metrics.darkCircles.score < 75)) {
      add('rec_eye_presentation', 'soft', 'moon', 'Eye-area presentation', 'Зона глаз на фото', 'Photo and lifestyle check', 'Проверка фото и режима',
        'Sleep, hydration, allergies, lighting and camera angle can all change the eye area in one image. Compare several rested, unfiltered photos; seek clinical advice for new swelling, pain or vision symptoms.',
        'Сон, гидратация, аллергии, свет и ракурс могут заметно менять зону глаз на одном фото. Сравните несколько отдохнувших снимков без фильтров; при новой отёчности, боли или проблемах со зрением обратитесь к врачу.',
        [
          'Capture at least three rested, unfiltered photos on separate days with the camera at eye level.',
          'Treat the result as an image-condition check, not an eye-health or age assessment.',
          'Seek timely clinical advice for new pain, persistent swelling or any vision change.'
        ],
        [
          'Сделайте как минимум три отдохнувших фото без фильтров в разные дни, держа камеру на уровне глаз.',
          'Считайте результат проверкой условий изображения, а не оценкой здоровья глаз или возраста.',
          'При новой боли, стойкой отёчности или изменении зрения своевременно обратитесь к врачу.'
        ]);
    }
    if (symRes && symRes.scoreStructural < 78) {
      add('rec_symmetry_check', 'medium', 'scale', 'Verify asymmetry with a repeat photo', 'Перепроверьте асимметрию на повторном фото', 'Measurement verification', 'Проверка измерения',
        'A small head turn, lens distortion and expression can create apparent asymmetry. Repeat with the camera at eye level and a neutral expression. If asymmetry is new, painful or affects bite/function, consult a dentist or clinician.',
        'Небольшой поворот головы, искажение объектива и мимика могут создать видимость асимметрии. Повторите снимок на уровне глаз с нейтральным выражением. Если асимметрия появилась недавно, вызывает боль или влияет на прикус/функцию, обратитесь к стоматологу или врачу.',
        [
          'Use the same camera, distance, height and neutral expression for three repeat images.',
          'Compare the landmark overlays before interpreting an apparent side-to-side difference.',
          'For a new asymmetry, pain, altered bite or impaired function, seek an in-person dental or medical assessment.'
        ],
        [
          'Сделайте три повторных снимка той же камерой, с той же дистанции и высоты, с нейтральным выражением.',
          'Сначала сравните наложения ориентиров, и лишь затем интерпретируйте разницу между сторонами.',
          'При новой асимметрии, боли, изменении прикуса или нарушении функции нужна очная стоматологическая или медицинская оценка.'
        ],
        'https://www.nhs.uk/tests-and-treatments/braces/',
        'NHS: orthodontic assessment overview');
    }
    if (m.jawCheekRatio.score100 < 70 || m.mandibularTaper.score100 < 70) {
      add('rec_lower_face', 'medium', 'scan-face', 'Lower-face geometry: treat as structural', 'Геометрия нижней трети: считайте её структурной', 'Structural feature', 'Структурный признак',
        'One photo cannot prescribe a bone or bite correction. Use this result only to decide whether a standardised profile photo or an in-person dental/orthodontic assessment would be useful for a functional concern.',
        'По одному фото нельзя назначать коррекцию костей или прикуса. Используйте результат только для решения, нужен ли стандартизированный профильный снимок или очная стоматологическая/ортодонтическая оценка при функциональной жалобе.',
        [
          'Add a true side-view image with the camera at head height and no forced jaw or neck position.',
          'Do not start jaw exercises, bite changes or devices from this image result.',
          'If bite, breathing, jaw-joint pain or chewing function is a concern, book an in-person dental or orthodontic assessment.'
        ],
        [
          'Добавьте настоящий боковой снимок: камера на высоте головы, без вынужденного положения челюсти и шеи.',
          'Не начинайте упражнения для челюсти, изменение прикуса или использование устройств по результату этого фото.',
          'При жалобах на прикус, дыхание, сустав челюсти или жевание запишитесь на очную оценку к стоматологу/ортодонту.'
        ],
        'https://www.nhs.uk/tests-and-treatments/braces/',
        'NHS: orthodontic assessment overview');
    }
    if (!recs.length) {
      add('rec_consistency', 'soft', 'camera', 'Keep photo conditions consistent', 'Сохраняйте одинаковые условия фото', 'Measurement quality', 'Качество измерения',
        'The most useful comparison is a repeat image with the same distance, focal length, lighting and neutral expression. Track measurements, not a perceived social rank.',
        'Самое полезное сравнение — повторный снимок с теми же расстоянием, фокусным расстоянием, светом и нейтральным выражением. Отслеживайте измерения, а не предполагаемый социальный ранг.',
        [
          'Use the same camera and approximate distance; the app does not infer focal length.',
          'Keep the camera at eye height, face forward, use even daylight and a neutral expression.',
          'Compare trends only after at least three images made with this same protocol.'
        ],
        [
          'Используйте ту же камеру и примерную дистанцию: приложение не определяет фокусное расстояние.',
          'Держите камеру на уровне глаз, лицо прямо, ровный дневной свет и нейтральное выражение.',
          'Сравнивайте динамику только после как минимум трёх снимков по одному протоколу.'
        ]);
    }
    return recs;
  }

  static _generateProfileRecs(cephReport) {
    const m = cephReport.metrics;
    const recs = [];
    const low = metric => (metric.score ?? metric.score100 ?? 100) < 75;
    if (low(m.cervicomental)) {
      recs.push({
        id: 'rec_profile_posture', level: 'soft', icon: 'move-up', gain: 'Review first', rawGain: 1,
        titleEn: 'Retake the profile with neutral posture', titleRu: 'Переснимите профиль с нейтральной осанкой',
        categoryEn: 'Measurement verification', categoryRu: 'Проверка измерения',
        textEn: 'Avoid craning the neck or forcing the chin position. If neck pain, breathing issues or jaw symptoms are present, discuss them with a qualified clinician rather than self-treating from a photograph.',
        textRu: 'Не вытягивайте шею и не фиксируйте подбородок в неестественном положении. При боли в шее, нарушениях дыхания или симптомах со стороны челюсти обсудите их с квалифицированным врачом, а не лечите себя по фото.',
        protocolEn: [
          'Use a true side view with the camera at head height and relaxed lips.',
          'Repeat on separate days without forcing neck or chin posture.',
          'Discuss pain, breathing or jaw symptoms with a clinician; do not self-treat from the image.'
        ],
        protocolRu: [
          'Используйте настоящий боковой ракурс: камера на высоте головы, губы расслаблены.',
          'Повторите в разные дни, не фиксируя шею или подбородок в вынужденной позе.',
          'Обсудите боль, дыхание или симптомы челюсти с врачом; не лечите себя по фото.'
        ]
      });
    }
    if (low(m.eline) || low(m.convexity)) {
      recs.push({
        id: 'rec_profile_structure', level: 'medium', icon: 'ruler', gain: 'Priority review', rawGain: 2,
        titleEn: 'Use a profile result only as a screening prompt', titleRu: 'Используйте профильный результат только как повод для проверки',
        categoryEn: 'Structural feature', categoryRu: 'Структурный признак',
        textEn: 'A 2D profile proxy cannot diagnose jaw position or prescribe orthodontic treatment. For bite, breathing or joint concerns, request an in-person clinical assessment.',
        textRu: '2D-профиль не может диагностировать положение челюсти или назначать ортодонтическое лечение. При жалобах на прикус, дыхание или суставы нужна очная клиническая оценка.',
        protocolEn: [
          'Verify the image with a standardised side view before interpreting a low proxy score.',
          'Do not use the proxy to choose braces, surgery, devices or exercises.',
          'For bite, breathing or jaw-joint concerns, request an in-person dental or orthodontic assessment.'
        ],
        protocolRu: [
          'Сначала подтвердите результат стандартизированным боковым фото.',
          'Не выбирайте брекеты, операцию, устройства или упражнения по этому прокси-показателю.',
          'При жалобах на прикус, дыхание или сустав челюсти нужна очная стоматологическая или ортодонтическая оценка.'
        ],
        sourceUrl: 'https://www.nhs.uk/tests-and-treatments/braces/',
        sourceLabel: 'NHS: orthodontic assessment overview'
      });
    }
    return recs.length ? recs : [{
      id: 'rec_profile_repeat', level: 'soft', icon: 'camera', gain: 'Review first', rawGain: 1,
      titleEn: 'Keep a repeatable profile protocol', titleRu: 'Соблюдайте повторяемый протокол профиля',
      categoryEn: 'Measurement quality', categoryRu: 'Качество измерения',
      textEn: 'Use a true side view, camera at head height, neutral expression and even light before comparing measurements over time.',
      textRu: 'Используйте настоящий боковой ракурс, камеру на высоте головы, нейтральное выражение и ровный свет перед сравнением измерений во времени.',
      protocolEn: [
        'Take three neutral side-view images on different days.',
        'Keep the camera at head height and use even daylight.',
        'Compare only the same landmark definitions and photo conditions.'
      ],
      protocolRu: [
        'Сделайте три нейтральных боковых снимка в разные дни.',
        'Держите камеру на высоте головы и используйте ровный дневной свет.',
        'Сравнивайте только одинаковые ориентиры и условия фото.'
      ]
    }];
  }
}

window.AttractivenessScorer = AttractivenessScorer;
