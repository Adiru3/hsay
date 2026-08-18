/**
 * HSAY (How sexy are you?) - Internationalization (i18n) Engine
 * Full 100% bilingual coverage (English default + Russian)
 */
class I18n {
  static currentLang = localStorage.getItem('hsay_lang') || 'en';

  static translations = {
    en: {
      // Branding & Header
      appTitle: "HSAY",
      appSubtitle: "How sexy are you? — 3D DeepScan Facial Morphometry & Attractiveness Standard",
      headerCameraBtn: "Camera",
      headerPwaBtn: "Install PWA",
      headerDonateBtn: "Support / Contact",
      langSwitchBtn: "RU",

      // Modes
      modeFrontal: "1. Frontal Analysis (Full Face)",
      modeProfile: "2. Profile 90° (Cephalometrics)",
      modeComposite: "3. DeepScan Composite (Full Passport)",
      statusEmpty: "Not uploaded",
      statusReadyFrontal: "Ready (Frontal)",
      statusReadyProfile: "Ready (Profile 90°)",
      statusReadyComposite: "100% DeepScan Ready",
      statusPartialComposite: "Partial Data",
      statusWaiting: "Awaiting Data",

      // Upload Box
      slotFrontal: "Current Slot: <strong>Frontal Portrait Photo</strong>",
      slotProfile: "Current Slot: <strong>Profile Photo (90° Sagittal)</strong>",
      slotComposite: "<strong>DeepScan Composite Passport (Frontal + Profile)</strong>",
      dropzoneTitleFrontal: "Upload Frontal Portrait",
      dropzoneHintFrontal: "Clear front-facing photo without head tilt (JPG, PNG, WEBP)",
      dropzoneTitleProfile: "Upload 90° Profile Photo",
      dropzoneHintProfile: "Strict 90° lateral angle for cephalometric jaw and nasal analysis",
      selectPhotoBtn: "Select Photo",
      genderMale: "Male Phenotype",
      genderFemale: "Female Phenotype",
      genderUniversal: "Universal Phenotype",
      calibrationInfo: "2D roll alignment; focal length is not inferred",

      // Viewport & Toolbar
      viewportFrontal: "Projection: Frontal",
      viewportProfile: "Projection: Profile 90° (Marking)",
      viewportComposite: "DeepScan Composite Passport",
      btnDragMode: "Drag Landmarks",
      btnWizardMode: "12-Step Wizard",
      btnResetPoints: "Auto-Reset",
      dragPrompt: "<strong>Drag Mode:</strong> Click and drag any anatomical point (G, Prn, Sn, Pog, Go, Ar, C) to update angles in real-time.",
      wizardStepCompleted: "<strong>✓ 12 landmarks placed!</strong> You can now drag any point for micro-adjustments.",
      pointsResetDone: "Landmarks reset to automatic AI detection.",

      // Overlay Toggles
      toggleMesh: "Mesh (478 pts)",
      toggleAlignment: "Axes & Tilt",
      toggleThirds: "Thirds & Fifths",
      toggleSymmetry: "Symmetry & FA",
      toggleHunter: "Eye Geometry Box",
      toggleEline: "Ricketts E-Line",
      toggleCeph: "Angles & Planes",
      toggle3DDepth: "3D Depth Vectors",

      // Quality & Reliability Banner
      qcTitle: "Photo Reliability & Quality Control",
      qcQuality: "Photo Quality",
      qcConfidence: "Analysis Confidence",
      qcLighting: "Lighting Uniformity",
      qcSharpness: "Sharpness Index",
      confHigh: "HIGH CONFIDENCE",
      confMed: "MEDIUM CONFIDENCE",
      confLow: "LOW CONFIDENCE",

      // Measurement Reliability Meter
      reliabilityTitle: "Data Reliability Decomposition",
      relMeasured: "Directly Measured",
      relEstimated: "Estimated (Monocular 3D / 2D)",
      relNotObserved: "Not Observable",

      // 3 Independent Models
      heroScientificTitle: "Facial Structural Balance",
      heroScientificSubtitle: "Transparent Photo Heuristic",
      heroScientificDesc: "Explicit weighted geometry and presentation inputs",
      heroSexualTitle: "Feature Definition & Freshness",
      heroSexualSubtitle: "Transparent Photo Heuristic",
      heroSexualDesc: "Selected sex-profile fit, lower-face geometry, eyes and skin presentation",
      heroPslTitle: "PSL-Inspired Geometry Index",
      heroPslSubtitle: "Rule-Based Heuristic",
      heroPslDesc: "Code-defined geometry index (1.0 – 9.0), not a community rank",

      equalWeightBanner: "Six equal-weight domains · photo-derived heuristic",

      scoreOutOf100: "out of 100",
      scoreOutOf10: "out of 10",
      morphPercentileLabel: "Structural-balance index:",
      dimorphPercentileLabel: "Feature-definition index:",
      communityPercentileLabel: "Geometry-heuristic status:",
      predictionUncertaintyLabel: "Photo-sensitivity range:",
      modelConfidenceLabel: "Photo reliability:",

      badgeEmpirical: "RULE-BASED PHOTO HEURISTIC",
      badgeDimorphism: "RULE-BASED PHOTO HEURISTIC",
      badgeCommunity: "NOT A COMMUNITY RANK",

      // Potential Card
      potentialCardTitle: "Repeat-Photo Upper Bound",
      potentialCardSubtitle: "Upper photo-sensitivity bound only; not a prediction of maximum appearance or treatment outcome.",
      potentialModelEstimateTag: "NOT AN APPEARANCE FORECAST",
      potentialCurrentLevel: "Current index",
      potentialTargetLevel: "Photo upper bound",
      potentialGrowthPts: "priority",

      // Reserves
      resSkin: "🧪 Skin & Soft-Tissue:",
      resPeri: "👁️ Eye-area geometry:",
      resSym: "⚖️ Symmetry (FA):",
      resJaw: "💪 Jaw & Posture:",
      resNeck: "📐 Neck posture on the repeat photo:",
      resMewing: "👅 Profile and E-Line check:",

      // Matrix & Structure
      matrixHeaderTitle: "Cross-view Feature Summary",
      matrixDimorphLabel: "1. Selected sex-profile fit (Model B input)",
      matrixAnthroLabel: "2. Craniofacial proportions (Model A: 16.7%)",
      matrixSkinLabel: "3. Skin and soft-tissue photo proxy (Model A: 16.7%)",
      matrixSymLabel: "4. Bilateral balance (Model A: 16.7%)",

      radarAttractivenessTitle: "Facial Harmony & Proportions Radar",
      radarDimorphTitle: "Morphology & Cephalometrics Radar",
      activeModuleStructure: "Active Module Structure",
      academicPercentilesDesc: "Transparent image-derived module scores. Fixed reference intervals are code anchors, not population percentiles.",

      // Sections & Module Cards
      secCraniofacial: "Craniofacial Anthropometry & Proportions",
      secPeriorbital: "Periorbital Complex & Eyes",
      secBrows: "Brows & Brow Ridge",
      secNose: "Nasal Morphology",
      secLips: "Lips & Philtrum Geometry",
      secCheekbones: "Cheekbones & Malar Projection",
      secJaw: "Mandibular Architecture & Jawline",
      secChin: "Chin & Symphysis Structure",
      secHairline: "Hairline & Forehead",
      secSymmetry: "Bilateral Symmetry & Coaxiality",
      secDimorphism: "Sexual Dimorphism & Masculinity",
      secYouthfulness: "Visual Youthfulness (Perceived)",
      secSkinQuality: "Skin & Soft-Tissue Appearance",
      secSoftTissue: "Soft Tissue & Facial Contour",
      secHarmony: "Holistic Feature Integration & Harmony",
      sec3DDeepscan: "Monocular 3D Spatial Proxies (Estimated)",

      // Metric Names
      metricFwhr: "fWHR (Facial Width-to-Height)",
      metricMidface: "Midface Compactness",
      metricThirds: "Facial Thirds (Upper : Mid : Lower)",
      metricFifths: "Facial Fifths (5 Horizontal)",
      metricJawCheek: "Bigonial / Bizygomatic Ratio",
      metricPhiltrumChin: "Philtrum / Chin Ratio",
      metricMouthNose: "Mouth / Nose Ratio",
      metricCanthalTilt: "Canthal Tilt",
      metricScleralShow: "Inferior Scleral Show",
      metricPalpebral: "Palpebral Aspect Ratio",
      metricIntercanthal: "Intercanthal Index (1:1)",
      metricOrbitalComp: "Orbital Compactness",
      metricHunterEyes: "Eye Geometry Composite (photo proxy)",
      metricBrowThick: "Brow Thickness",
      metricBrowCurv: "Brow Curvature & Arch",
      metricNasalWidth: "Nasal Width Ratio",
      metricNasalLen: "Nasal Length Ratio",
      metricLipRatio: "Lower / Upper Lip Ratio",
      metricMouthWidth: "Mouth Width Ratio",
      metricGonialAngle: "True Gonial Angle (Ar-Go-Me)",
      metricRamusIndex: "Ramus Index (Height/Corpus)",
      metricMandibularTaper: "Mandibular Taper Angle",
      metricChinProj: "Chin Anterior Projection",
      metricMasculinity: "Masculinity Index",
      metricYouthfulness: "Visual Youthfulness (Perceived)",
      metricCheekHollow: "Cheek Hollow (Malar Contrast)",
      metricUniformity: "CIELAB Color Homogeneity",
      metricMicrorelief: "Microrelief Variance",
      metricCarotenoid: "Carotenoid Undertone (b*)",
      metricDarkCircles: "Dark Circles (ΔL*)",
      metricFA: "Bilateral Symmetry (FA)",
      metricMidlineDev: "Midline Coaxiality Deviation",
      metricTextureSym: "Texture Symmetry Index",
      metricConvexity: "Facial Convexity (G-Sn-Pog)",
      metricEline: "Ricketts E-Line (Li to E-Line)",
      metricCervicomental: "Cervicomental Neck Angle",
      metricOrbitalVec: "Orbital Vector (Maxillary Support)",
      metricNasolabial: "Nasolabial Angle (Cm-Sn-Ls)",

      refTargetLabel: "Reference distribution:",

      // Status Badges
      badgeMeasured: "MEASURED",
      badgeEstimated: "ESTIMATED",
      badgeNotObservable: "NOT OBSERVABLE",
      badgeScientific: "SCIENTIFIC",
      badgeEstimated3D: "ESTIMATED 3D PROXY",

      // Recommendations
      recsHeader: "Personalized Scientific Optimization Protocols",
      recFilterAll: "All Levels",
      recFilterSoft: "🟢 Softmaxxing",
      recFilterMedium: "🟡 Training & Posture",
      recFilterAdvanced: "🔴 Clinical / Specialized",

      // Export / PDF
      exportPdfBtn: "Print / Export PDF",
      footerEngineInfo: "Powered by MediaPipe 3D Mesh + OpenCV CIELAB + Statistical Anthropometric Reference Norms",
      footerDisclaimer: "Methodological Note: Equal domain weights are a predefined methodological baseline and are not interpreted as empirically estimated causal or predictive effect sizes. Disclaimer: This software is an anthropometric and aesthetic analysis tool for educational, research, and personal optimization purposes. Monocular 3D estimations are mathematical approximations and do not constitute clinical cephalometric radiography.",

      // FAQ
      faqSectionTitle: "Scientific Facial Morphometry & FAQ Guide",

      // Webcam Modal
      webcamModalTitle: "Take Portrait Photo",
      webcamCaptureBtn: "Capture Photo",
      webcamCancelBtn: "Cancel",

      // Welcome Card
      welcomeTitle: "Research-Informed Multi-Domain Facial Analysis",
      welcomeDesc: "Transparent local pipeline combining 2D facial proportions, profile proxies, image-based skin presentation and explicitly equal-weighted Model A domains. It is not a complete assessment of a person or a population ranking."
    },

    ru: {
      // Branding & Header
      appTitle: "HSAY",
      appSubtitle: "How sexy are you? — 3D DeepScan морфометрия лица и научный стандарт привлекательности",
      headerCameraBtn: "Камера",
      headerPwaBtn: "Установить PWA",
      headerDonateBtn: "Поддержать / Связаться",
      langSwitchBtn: "EN",

      // Modes
      modeFrontal: "1. Анфас (Фронтальный анализ)",
      modeProfile: "2. Профиль 90° (Цефалометрия)",
      modeComposite: "3. DeepScan Composite (Сводный паспорт)",
      statusEmpty: "Не загружен",
      statusReadyFrontal: "Готов (Анфас)",
      statusReadyProfile: "Готов (Профиль 90°)",
      statusReadyComposite: "100% DeepScan готов",
      statusPartialComposite: "Частичные данные",
      statusWaiting: "Ждет данные",

      // Upload Box
      slotFrontal: "Текущий слот: <strong>Фронтальное портретное фото (Анфас)</strong>",
      slotProfile: "Текущий слот: <strong>Фото в профиль (90° Сагиттальный)</strong>",
      slotComposite: "<strong>Сводный паспорт DeepScan (Анфас + Профиль)</strong>",
      dropzoneTitleFrontal: "Загрузите портретное фото (Анфас)",
      dropzoneHintFrontal: "Четкий кадр прямо перед камерой без наклона головы (JPG, PNG, WEBP)",
      dropzoneTitleProfile: "Загрузите фото в профиль (90°)",
      dropzoneHintProfile: "Строгий боковой ракурс 90° для цефалометрического анализа челюсти и носа",
      selectPhotoBtn: "Выбрать снимок",
      genderMale: "Мужской фенотип",
      genderFemale: "Женский фенотип",
      genderUniversal: "Универсальный",
      calibrationInfo: "2D-выравнивание наклона; фокусное расстояние не определяется",

      // Viewport & Toolbar
      viewportFrontal: "Проекция: Анфас",
      viewportProfile: "Проекция: Профиль 90° (Разметка)",
      viewportComposite: "DeepScan Сводный паспорт",
      btnDragMode: "Перетаскивание точек",
      btnWizardMode: "Пошагово (12 точек)",
      btnResetPoints: "Авто-сброс",
      dragPrompt: "<strong>Режим перетаскивания:</strong> Нажмите и тяните любую точку (G, Prn, Sn, Pog, Go, Ar, C) для обновления углов в реальном времени.",
      wizardStepCompleted: "<strong>✓ Разметка 12 точек завершена!</strong> Теперь можно перетаскивать точки для микро-подгонки.",
      pointsResetDone: "Точки сброшены к автоматической AI-разметке.",

      // Overlay Toggles
      toggleMesh: "Mesh (478 точек)",
      toggleAlignment: "Оси & Тилт",
      toggleThirds: "Трети & Пятые",
      toggleSymmetry: "Симметрия & FA",
      toggleHunter: "Контур геометрии глаз",
      toggleEline: "Линия Риккетса (E-Line)",
      toggleCeph: "Углы & Плоскости",
      toggle3DDepth: "3D векторы глубины",

      // Quality & Reliability Banner
      qcTitle: "Контроль качества снимка и надежность анализа",
      qcQuality: "Качество фото",
      qcConfidence: "Уверенность анализа",
      qcLighting: "Равномерность света",
      qcSharpness: "Четкость снимка",
      confHigh: "ВЫСОКАЯ УВЕРЕННОСТЬ",
      confMed: "СРЕДНЯЯ УВЕРЕННОСТЬ",
      confLow: "НИЗКАЯ УВЕРЕННОСТЬ",

      // Measurement Reliability Meter
      reliabilityTitle: "Декомпозиция надежности измерений",
      relMeasured: "Прямые измерения",
      relEstimated: "Оценочные (3D / 2D Монокуляр)",
      relNotObserved: "Не поддаются наблюдению",

      // 3 Independent Models
      heroScientificTitle: "Структурный баланс лица",
      heroScientificSubtitle: "Прозрачная фото-эвристика",
      heroScientificDesc: "Явные веса геометрии и признаков на фото",
      heroSexualTitle: "Выраженность черт и свежесть",
      heroSexualSubtitle: "Прозрачная фото-эвристика",
      heroSexualDesc: "Выбранный половой профиль, нижняя треть лица, глаза и вид кожи",
      heroPslTitle: "PSL-подобный индекс геометрии",
      heroPslSubtitle: "Эвристика на правилах",
      heroPslDesc: "Индекс геометрии 1.0–9.0, заданный кодом; не рейтинг сообщества",

      equalWeightBanner: "Шесть доменов с равными весами · фото-эвристика",

      scoreOutOf100: "из 100",
      scoreOutOf10: "из 10",
      morphPercentileLabel: "Индекс структурного баланса:",
      dimorphPercentileLabel: "Индекс выраженности черт:",
      communityPercentileLabel: "Статус геометрической эвристики:",
      predictionUncertaintyLabel: "Чувствительность к качеству фото:",
      modelConfidenceLabel: "Надёжность фото:",

      badgeEmpirical: "ФОТО-ЭВРИСТИКА НА ПРАВИЛАХ",
      badgeDimorphism: "ФОТО-ЭВРИСТИКА НА ПРАВИЛАХ",
      badgeCommunity: "НЕ РЕЙТИНГ СООБЩЕСТВА",

      // Potential Card
      potentialCardTitle: "Верхняя граница повторного фото",
      potentialCardSubtitle: "Только верхняя граница чувствительности к фото; не прогноз максимума внешности или результата лечения.",
      potentialModelEstimateTag: "НЕ ПРОГНОЗ ВНЕШНОСТИ",
      potentialCurrentLevel: "Текущий индекс",
      potentialTargetLevel: "Верхняя граница фото",
      potentialGrowthPts: "приоритет",

      // Reserves
      resSkin: "🧪 Кожа & Мягкие ткани:",
      resPeri: "👁️ Геометрия области глаз:",
      resSym: "⚖️ Симметрия (FA) & Жевание:",
      resJaw: "💪 Массетеры & Осанка:",
      resNeck: "📐 Положение шеи на повторном фото:",
      resMewing: "👅 Проверка профиля и E-Line:",

      // Matrix & Structure
      matrixHeaderTitle: "Сводка признаков из двух ракурсов",
      matrixDimorphLabel: "1. Выбранный половой профиль (вход Model B)",
      matrixAnthroLabel: "2. Краниофациальные пропорции (Model A: 16.7%)",
      matrixSkinLabel: "3. Фото-прокси кожи и мягких тканей (Model A: 16.7%)",
      matrixSymLabel: "4. Билатеральный баланс (Model A: 16.7%)",

      radarAttractivenessTitle: "Радар гармонии и пропорций лица",
      radarDimorphTitle: "Радар морфологии и цефалометрии",
      activeModuleStructure: "Структура активного модуля",
      academicPercentilesDesc: "Прозрачные баллы модулей по изображению. Фиксированные интервалы — ориентиры кода, а не популяционные процентили.",

      // Sections & Module Cards
      secCraniofacial: "Краниофациальная антропометрия и пропорции",
      secPeriorbital: "Периорбитальный комплекс и глаза",
      secBrows: "Брови и надбровные дуги",
      secNose: "Морфология носа",
      secLips: "Геометрия губ и фильтрума",
      secCheekbones: "Скулы и малярная проекция",
      secJaw: "Нижняя челюсть и контур",
      secChin: "Подбородок и симфиз",
      secHairline: "Линия роста волос и лоб",
      secSymmetry: "Билатеральная симметрия и соосность",
      secDimorphism: "Половой диморфизм и маскулинность",
      secYouthfulness: "Визуальная молодость лица",
      secSkinQuality: "Внешний вид кожи и мягких тканей",
      secSoftTissue: "Мягкие ткани и контур лица",
      secHarmony: "Холистическая интеграция черт и гармония",
      sec3DDeepscan: "Монокулярные 3D пространственные прокси (Оценка)",

      // Metric Names
      metricFwhr: "fWHR (Ширина к высоте средней зоны)",
      metricMidface: "Компактность средней зоны",
      metricThirds: "Трети лица (Верхняя : Средняя : Нижняя)",
      metricFifths: "Правило пятых долей",
      metricJawCheek: "Челюсть / Скулы (Bigonial)",
      metricPhiltrumChin: "Фильтрум / Подбородок",
      metricMouthNose: "Рот / Основание носа",
      metricCanthalTilt: "Кантикальный тилт глаз",
      metricScleralShow: "Нижний склеральный просвет",
      metricPalpebral: "Индекс глазной щели (Palpebral)",
      metricIntercanthal: "Межглазной индекс (1:1)",
      metricOrbitalComp: "Компактность глазницы",
      metricHunterEyes: "Композит геометрии глаз (фото-прокси)",
      metricBrowThick: "Толщина бровей",
      metricBrowCurv: "Изгиб и арка бровей",
      metricNasalWidth: "Ширина основания носа",
      metricNasalLen: "Длина носа",
      metricLipRatio: "Отношение нижней губы к верхней",
      metricMouthWidth: "Ширина рта к скулам",
      metricGonialAngle: "Истинный гониальный угол (Ar-Go-Me)",
      metricRamusIndex: "Индекс ветви челюсти (Ramus)",
      metricMandibularTaper: "Угол конуса челюсти",
      metricChinProj: "Проекция подбородка вперед",
      metricMasculinity: "Индекс маскулинности",
      metricYouthfulness: "Визуальная молодость лица",
      metricCheekHollow: "Cheek Hollow (Скуловой контраст)",
      metricUniformity: "CIELAB Однородность тона",
      metricMicrorelief: "Дисперсия микротекстуры",
      metricCarotenoid: "Каротиноидный тон (b*)",
      metricDarkCircles: "Темные круги (ΔL*)",
      metricFA: "Билатеральная симметрия (FA)",
      metricMidlineDev: "Отклонение срединной линии",
      metricTextureSym: "Индекс симметрии текстуры",
      metricConvexity: "Выпуклость лица (G-Sn-Pog)",
      metricEline: "Линия Риккетса (E-Line)",
      metricCervicomental: "Шейно-подбородочный угол",
      metricOrbitalVec: "Орбитальный вектор (Опора максиллы)",
      metricNasolabial: "Носогубный угол (Cm-Sn-Ls)",

      refTargetLabel: "Референсный диапазон:",

      // Status Badges
      badgeMeasured: "ИЗМЕРЕНО",
      badgeEstimated: "ОЦЕНОЧНО",
      badgeNotObservable: "НЕ НАБЛЮДАЕМО",
      badgeScientific: "НАУЧНЫЙ",
      badgeEstimated3D: "3D ПРОКСИ (ОЦЕНКА)",

      // Recommendations
      recsHeader: "Персонализированные научные рекомендации и протоколы",
      recFilterAll: "Все уровни",
      recFilterSoft: "🟢 Softmaxxing",
      recFilterMedium: "🟡 Тренинг & Осанка",
      recFilterAdvanced: "🔴 Клинический / Специальный",

      // Export / PDF
      exportPdfBtn: "Печать / Экспорт PDF",
      footerEngineInfo: "Работает на базе MediaPipe 3D Mesh + OpenCV CIELAB + Статистических антропометрических референсных норм",
      footerDisclaimer: "Методологическое примечание: Равные веса доменов являются заранее определённым методологическим baseline и не интерпретируются как эмпирически установленные размеры эффектов или причинные вклады признаков в привлекательность. Предупреждение: Данная система является антропометрическим и эстетическим инструментом для образовательных и исследовательских целей. Монокулярная 3D-оценка представляет собой математическую аппроксимацию и не заменяет клиническую цефалометрическую телерентгенографию.",

      // FAQ
      faqSectionTitle: "Часто задаваемые вопросы и стандарты морфометрии",

      // Webcam Modal
      webcamModalTitle: "Сделать снимок",
      webcamCaptureBtn: "Сделать снимок",
      webcamCancelBtn: "Отмена",

      // Welcome Card
      welcomeTitle: "Исследовательская многодоменная модель анализа лица",
      welcomeDesc: "Прозрачный локальный конвейер: 2D-пропорции лица, прокси профиля, вид кожи на изображении и шесть явно равновесных доменов Model A. Это не полная оценка человека и не популяционный рейтинг."
    }
  };

  static t(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key] !== undefined) {
      return this.translations[lang][key];
    }
    if (this.translations['en'] && this.translations['en'][key] !== undefined) {
      return this.translations['en'][key];
    }
    return key;
  }

  static setLang(lang) {
    if (lang === 'en' || lang === 'ru') {
      this.currentLang = lang;
      localStorage.setItem('hsay_lang', lang);
      document.documentElement.lang = lang;
      this.applyTranslations();
      window.dispatchEvent(new CustomEvent('hsay_lang_changed', { detail: { lang } }));
    }
  }

  static toggleLang() {
    this.setLang(this.currentLang === 'en' ? 'ru' : 'en');
  }

  static applyTranslations() {
    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation) {
        if (el.tagName === 'INPUT' && el.getAttribute('type') === 'button') {
          el.value = translation;
        } else {
          el.innerHTML = translation;
        }
      }
    });

    // Translate all elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // Translate all elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });

    // Update language switch button text
    const langSwitchBtn = document.getElementById('langSwitchBtn');
    if (langSwitchBtn) {
      const label = document.getElementById('langSwitchLabel');
      if (label) {
        label.textContent = this.currentLang === 'en' ? 'RU' : 'EN';
      } else {
        langSwitchBtn.textContent = this.currentLang === 'en' ? 'RU' : 'EN';
      }
    }
  }
}

// Global accessor
window.I18n = I18n;
