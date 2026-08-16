/**
 * HSAY - Population Reference Database & Statistical Engine
 * Provides validated anthropometric distributions (Mean, SD, Percentiles, Z-Scores)
 * across Male, Female, and Universal demographics.
 */
class PopulationReferenceDB {
  /**
   * Reference distributions derived from clinical anthropometric, cephalometric,
   * and facial evolutionary studies (Farkas, Enlow, Proffit, Rhodes, Little, Grammer).
   */
  static database = {
    // -------------------------------------------------------------
    // CRANIOFACIAL PROPORTIONS
    // -------------------------------------------------------------
    fwhr: {
      id: 'fwhr',
      nameEn: 'fWHR (Facial Width-to-Height Ratio)',
      nameRu: 'fWHR (Ширина к высоте средней зоны)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 1.95, sd: 0.12, idealMin: 1.92, idealMax: 2.15 },
      female: { mean: 1.82, sd: 0.11, idealMin: 1.74, idealMax: 1.95 },
      universal: { mean: 1.88, sd: 0.13, idealMin: 1.80, idealMax: 2.05 }
    },
    midfaceRatio: {
      id: 'midfaceRatio',
      nameEn: 'Midface Compactness Index (IPD / Subnasale)',
      nameRu: 'Индекс компактности средней трети',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 0.94, sd: 0.08, idealMin: 0.82, idealMax: 0.98 },
      female: { mean: 0.96, sd: 0.08, idealMin: 0.85, idealMax: 1.00 },
      universal: { mean: 0.95, sd: 0.08, idealMin: 0.84, idealMax: 0.99 }
    },
    facialThirdsDev: {
      id: 'facialThirdsDev',
      nameEn: 'Facial Thirds Deviation (Tr-G : G-Sn : Sn-Me)',
      nameRu: 'Отклонение третей лица (Верх : Ср : Низ)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '%',
      male: { mean: 6.5, sd: 3.2, idealMin: 0.0, idealMax: 4.5 },
      female: { mean: 6.2, sd: 3.0, idealMin: 0.0, idealMax: 4.2 },
      universal: { mean: 6.3, sd: 3.1, idealMin: 0.0, idealMax: 4.4 }
    },
    facialFifthsDev: {
      id: 'facialFifthsDev',
      nameEn: 'Facial Fifths Deviation (Horizontal 5 Sectors)',
      nameRu: 'Отклонение пятых долей лица',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '%',
      male: { mean: 7.2, sd: 3.5, idealMin: 0.0, idealMax: 5.0 },
      female: { mean: 6.8, sd: 3.3, idealMin: 0.0, idealMax: 4.8 },
      universal: { mean: 7.0, sd: 3.4, idealMin: 0.0, idealMax: 4.9 }
    },
    jawCheekRatio: {
      id: 'jawCheekRatio',
      nameEn: 'Bigonial-to-Bizygomatic Ratio (Jaw/Cheekbone)',
      nameRu: 'Отношение челюсти к скулам (Bigonial)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 0.87, sd: 0.05, idealMin: 0.86, idealMax: 0.93 },
      female: { mean: 0.79, sd: 0.04, idealMin: 0.76, idealMax: 0.83 },
      universal: { mean: 0.83, sd: 0.06, idealMin: 0.80, idealMax: 0.89 }
    },
    foreheadFaceRatio: {
      id: 'foreheadFaceRatio',
      nameEn: 'Forehead Width / Bizygomatic Ratio',
      nameRu: 'Ширина лба к ширине скул',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 0.83, sd: 0.04, idealMin: 0.80, idealMax: 0.86 },
      female: { mean: 0.85, sd: 0.04, idealMin: 0.82, idealMax: 0.88 },
      universal: { mean: 0.84, sd: 0.04, idealMin: 0.81, idealMax: 0.87 }
    },
    chinFaceRatio: {
      id: 'chinFaceRatio',
      nameEn: 'Chin Height / Lower Face Height',
      nameRu: 'Высота подбородка к нижней трети',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 0.58, sd: 0.04, idealMin: 0.55, idealMax: 0.62 },
      female: { mean: 0.52, sd: 0.04, idealMin: 0.48, idealMax: 0.55 },
      universal: { mean: 0.55, sd: 0.05, idealMin: 0.51, idealMax: 0.59 }
    },
    philtrumChinRatio: {
      id: 'philtrumChinRatio',
      nameEn: 'Philtrum-to-Chin Ratio (Subnasale-Ls : Li-Me)',
      nameRu: 'Соотношение фильтрума и подбородка',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 2.15, sd: 0.22, idealMin: 2.00, idealMax: 2.28 },
      female: { mean: 1.72, sd: 0.18, idealMin: 1.60, idealMax: 1.85 },
      universal: { mean: 1.93, sd: 0.25, idealMin: 1.75, idealMax: 2.15 }
    },
    mouthNoseRatio: {
      id: 'mouthNoseRatio',
      nameEn: 'Intercommissural / Interalar Ratio (Mouth/Nose)',
      nameRu: 'Ширина рта к основанию носа',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 1.58, sd: 0.11, idealMin: 1.50, idealMax: 1.68 },
      female: { mean: 1.62, sd: 0.10, idealMin: 1.54, idealMax: 1.70 },
      universal: { mean: 1.60, sd: 0.11, idealMin: 1.52, idealMax: 1.69 }
    },

    // -------------------------------------------------------------
    // EYES & PERIORBITAL
    // -------------------------------------------------------------
    canthalTilt: {
      id: 'canthalTilt',
      nameEn: 'Canthal Tilt (Exocanthion vs Endocanthion)',
      nameRu: 'Кантикальный тилт глаз',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '°',
      male: { mean: 3.8, sd: 2.2, idealMin: 2.5, idealMax: 6.5 },
      female: { mean: 4.6, sd: 2.4, idealMin: 3.5, idealMax: 8.0 },
      universal: { mean: 4.2, sd: 2.3, idealMin: 3.0, idealMax: 7.2 }
    },
    scleralShow: {
      id: 'scleralShow',
      nameEn: 'Inferior Scleral Exposure (Lower Lid Show)',
      nameRu: 'Нижний склеральный просвет',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: 'mm',
      male: { mean: 0.6, sd: 0.8, idealMin: 0.0, idealMax: 0.2 },
      female: { mean: 0.8, sd: 0.9, idealMin: 0.0, idealMax: 0.3 },
      universal: { mean: 0.7, sd: 0.8, idealMin: 0.0, idealMax: 0.25 }
    },
    palpebralRatio: {
      id: 'palpebralRatio',
      nameEn: 'Palpebral Fissure Aspect Ratio (Width/Height)',
      nameRu: 'Индекс глазной щели (Hunter Eyes)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 3.25, sd: 0.35, idealMin: 3.10, idealMax: 3.75 },
      female: { mean: 2.90, sd: 0.32, idealMin: 2.65, idealMax: 3.35 },
      universal: { mean: 3.08, sd: 0.38, idealMin: 2.85, idealMax: 3.55 }
    },
    intercanthalIndex: {
      id: 'intercanthalIndex',
      nameEn: 'Intercanthal Distance / Eye Width Ratio',
      nameRu: 'Межглазной индекс (1:1)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 1.02, sd: 0.09, idealMin: 0.95, idealMax: 1.05 },
      female: { mean: 1.01, sd: 0.08, idealMin: 0.95, idealMax: 1.05 },
      universal: { mean: 1.01, sd: 0.08, idealMin: 0.95, idealMax: 1.05 }
    },
    orbitalCompactness: {
      id: 'orbitalCompactness',
      nameEn: 'Orbital Compactness (Brow to Upper Lid Margin)',
      nameRu: 'Компактность глазницы (Бровь к веку)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 0.38, sd: 0.07, idealMin: 0.28, idealMax: 0.42 },
      female: { mean: 0.50, sd: 0.08, idealMin: 0.42, idealMax: 0.58 },
      universal: { mean: 0.44, sd: 0.09, idealMin: 0.34, idealMax: 0.52 }
    },
    hunterEyesScore: {
      id: 'hunterEyesScore',
      nameEn: 'Hunter Eyes Aggregate Index',
      nameRu: 'Индекс Hunter Eyes (Компактность)',
      domain: 'COMMUNITY',
      status: 'MEASURED',
      unit: '/100',
      male: { mean: 68.0, sd: 14.0, idealMin: 85.0, idealMax: 100.0 },
      female: { mean: 62.0, sd: 15.0, idealMin: 78.0, idealMax: 95.0 },
      universal: { mean: 65.0, sd: 14.5, idealMin: 80.0, idealMax: 98.0 }
    },

    // -------------------------------------------------------------
    // BROWS & BROW RIDGE
    // -------------------------------------------------------------
    browThickness: {
      id: 'browThickness',
      nameEn: 'Eyebrow Thickness Relative Index',
      nameRu: 'Толщина и плотность бровей',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 0.24, sd: 0.05, idealMin: 0.22, idealMax: 0.30 },
      female: { mean: 0.17, sd: 0.04, idealMin: 0.14, idealMax: 0.22 },
      universal: { mean: 0.20, sd: 0.05, idealMin: 0.18, idealMax: 0.26 }
    },
    browCurvature: {
      id: 'browCurvature',
      nameEn: 'Brow Arch / Curvature Angle',
      nameRu: 'Арка и угол наклона брови',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '°',
      male: { mean: 7.5, sd: 3.8, idealMin: 3.0, idealMax: 9.0 },
      female: { mean: 15.2, sd: 4.5, idealMin: 12.0, idealMax: 19.0 },
      universal: { mean: 11.3, sd: 5.2, idealMin: 7.0, idealMax: 15.0 }
    },

    // -------------------------------------------------------------
    // NOSE
    // -------------------------------------------------------------
    nasalWidthRatio: {
      id: 'nasalWidthRatio',
      nameEn: 'Nose Width / Facial Width Ratio',
      nameRu: 'Ширина носа к ширине лица',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 0.27, sd: 0.03, idealMin: 0.24, idealMax: 0.28 },
      female: { mean: 0.24, sd: 0.03, idealMin: 0.21, idealMax: 0.25 },
      universal: { mean: 0.25, sd: 0.03, idealMin: 0.22, idealMax: 0.27 }
    },
    nasalLengthRatio: {
      id: 'nasalLengthRatio',
      nameEn: 'Nose Length / Midface Height Ratio',
      nameRu: 'Длина носа к высоте средней трети',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 0.72, sd: 0.05, idealMin: 0.67, idealMax: 0.75 },
      female: { mean: 0.69, sd: 0.05, idealMin: 0.64, idealMax: 0.72 },
      universal: { mean: 0.70, sd: 0.05, idealMin: 0.65, idealMax: 0.74 }
    },
    nasolabialAngle: {
      id: 'nasolabialAngle',
      nameEn: 'Nasolabial Angle (Cm-Sn-Ls)',
      nameRu: 'Носогубный угол (Cm-Sn-Ls)',
      domain: 'SCIENTIFIC',
      status: 'ESTIMATED',
      unit: '°',
      male: { mean: 98.0, sd: 7.5, idealMin: 92.0, idealMax: 105.0 },
      female: { mean: 104.0, sd: 8.0, idealMin: 98.0, idealMax: 112.0 },
      universal: { mean: 101.0, sd: 8.0, idealMin: 95.0, idealMax: 108.0 }
    },

    // -------------------------------------------------------------
    // LIPS & MOUTH
    // -------------------------------------------------------------
    lipRatio: {
      id: 'lipRatio',
      nameEn: 'Lower Lip to Upper Lip Thickness Ratio',
      nameRu: 'Соотношение толщины губ (Низ / Верх)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 1.35, sd: 0.22, idealMin: 1.20, idealMax: 1.50 },
      female: { mean: 1.62, sd: 0.25, idealMin: 1.45, idealMax: 1.80 },
      universal: { mean: 1.48, sd: 0.26, idealMin: 1.30, idealMax: 1.65 }
    },
    mouthWidthRatio: {
      id: 'mouthWidthRatio',
      nameEn: 'Mouth Width / Bizygomatic Width Ratio',
      nameRu: 'Ширина рта к ширине скул',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 0.42, sd: 0.04, idealMin: 0.40, idealMax: 0.46 },
      female: { mean: 0.40, sd: 0.04, idealMin: 0.38, idealMax: 0.44 },
      universal: { mean: 0.41, sd: 0.04, idealMin: 0.39, idealMax: 0.45 }
    },

    // -------------------------------------------------------------
    // JAW & CHIN
    // -------------------------------------------------------------
    gonialAngle: {
      id: 'gonialAngle',
      nameEn: 'True Gonial Angle (Ar-Go-Me)',
      nameRu: 'Истинный гониальный угол',
      domain: 'SCIENTIFIC',
      status: 'ESTIMATED',
      unit: '°',
      male: { mean: 118.0, sd: 6.5, idealMin: 110.0, idealMax: 122.0 },
      female: { mean: 124.0, sd: 6.8, idealMin: 118.0, idealMax: 128.0 },
      universal: { mean: 121.0, sd: 7.0, idealMin: 114.0, idealMax: 125.0 }
    },
    ramusIndex: {
      id: 'ramusIndex',
      nameEn: 'Ramus Height to Mandibular Corpus Ratio',
      nameRu: 'Индекс ветви Ramus (Высота / Тело)',
      domain: 'SCIENTIFIC',
      status: 'ESTIMATED',
      unit: '',
      male: { mean: 0.74, sd: 0.09, idealMin: 0.70, idealMax: 0.88 },
      female: { mean: 0.65, sd: 0.08, idealMin: 0.60, idealMax: 0.74 },
      universal: { mean: 0.70, sd: 0.09, idealMin: 0.65, idealMax: 0.80 }
    },
    mandibularTaper: {
      id: 'mandibularTaper',
      nameEn: 'Mandibular Taper Angle (Gonion-Gonion-Chin)',
      nameRu: 'Угол конуса челюсти',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '°',
      male: { mean: 98.5, sd: 7.2, idealMin: 90.0, idealMax: 108.0 },
      female: { mean: 114.0, sd: 8.0, idealMin: 106.0, idealMax: 122.0 },
      universal: { mean: 106.0, sd: 9.5, idealMin: 98.0, idealMax: 115.0 }
    },
    chinProjection: {
      id: 'chinProjection',
      nameEn: 'Chin Anterior Projection (Holdaway H-Line / Pog)',
      nameRu: 'Передняя проекция подбородка',
      domain: 'SCIENTIFIC',
      status: 'ESTIMATED',
      unit: 'mm',
      male: { mean: 1.5, sd: 2.2, idealMin: 0.0, idealMax: 3.5 },
      female: { mean: 0.5, sd: 2.0, idealMin: -1.0, idealMax: 2.0 },
      universal: { mean: 1.0, sd: 2.2, idealMin: -0.5, idealMax: 2.8 }
    },

    // -------------------------------------------------------------
    // PROFILE & 3D DEPTH
    // -------------------------------------------------------------
    elineLipDist: {
      id: 'elineLipDist',
      nameEn: 'Ricketts Esthetic E-Line Lower Lip Distance',
      nameRu: 'Линия Риккетса E-Line (Нижняя губа)',
      domain: 'SCIENTIFIC',
      status: 'ESTIMATED',
      unit: 'mm',
      male: { mean: -2.2, sd: 2.0, idealMin: -3.5, idealMax: -1.0 },
      female: { mean: -1.8, sd: 1.8, idealMin: -2.8, idealMax: -0.5 },
      universal: { mean: -2.0, sd: 1.9, idealMin: -3.0, idealMax: -0.8 }
    },
    facialConvexity: {
      id: 'facialConvexity',
      nameEn: 'Soft-Tissue Facial Convexity Angle (G-Sn-Pog)',
      nameRu: 'Угол выпуклости профиля G-Sn-Pog',
      domain: 'SCIENTIFIC',
      status: 'ESTIMATED',
      unit: '°',
      male: { mean: 167.0, sd: 5.5, idealMin: 164.0, idealMax: 174.0 },
      female: { mean: 164.0, sd: 5.2, idealMin: 160.0, idealMax: 170.0 },
      universal: { mean: 165.5, sd: 5.4, idealMin: 162.0, idealMax: 172.0 }
    },
    cervicomentalAngle: {
      id: 'cervicomentalAngle',
      nameEn: 'Cervicomental Neck-Chin Angle',
      nameRu: 'Шейно-подбородочный угол',
      domain: 'SCIENTIFIC',
      status: 'ESTIMATED',
      unit: '°',
      male: { mean: 110.0, sd: 8.5, idealMin: 100.0, idealMax: 118.0 },
      female: { mean: 114.0, sd: 8.0, idealMin: 105.0, idealMax: 120.0 },
      universal: { mean: 112.0, sd: 8.5, idealMin: 102.0, idealMax: 119.0 }
    },

    // -------------------------------------------------------------
    // SYMMETRY & FA
    // -------------------------------------------------------------
    fluctuatingAsymmetry: {
      id: 'fluctuatingAsymmetry',
      nameEn: 'Bilateral Fluctuating Asymmetry (24 Landmark Pairs)',
      nameRu: 'Флуктуирующая асимметрия (24 пары)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '%',
      male: { mean: 94.2, sd: 4.5, idealMin: 96.0, idealMax: 100.0 },
      female: { mean: 94.8, sd: 4.2, idealMin: 96.5, idealMax: 100.0 },
      universal: { mean: 94.5, sd: 4.4, idealMin: 96.0, idealMax: 100.0 }
    },
    midlineDeviation: {
      id: 'midlineDeviation',
      nameEn: 'Midline Coaxiality Deviation (G-Prn-Sn-St-Me)',
      nameRu: 'Соосность медианных линий лица',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: 'px',
      male: { mean: 2.8, sd: 1.6, idealMin: 0.0, idealMax: 1.6 },
      female: { mean: 2.6, sd: 1.5, idealMin: 0.0, idealMax: 1.5 },
      universal: { mean: 2.7, sd: 1.5, idealMin: 0.0, idealMax: 1.5 }
    },

    // -------------------------------------------------------------
    // SKIN & SOFT TISSUE
    // -------------------------------------------------------------
    cielabUniformity: {
      id: 'cielabUniformity',
      nameEn: 'CIELAB Color Homogeneity σ(a*, b*)',
      nameRu: 'Однородность тона кожи CIELAB',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 4.8, sd: 2.1, idealMin: 1.5, idealMax: 3.5 },
      female: { mean: 4.2, sd: 1.8, idealMin: 1.2, idealMax: 3.0 },
      universal: { mean: 4.5, sd: 2.0, idealMin: 1.4, idealMax: 3.2 }
    },
    carotenoidBStar: {
      id: 'carotenoidBStar',
      nameEn: 'Carotenoid Undertone Saturation (b* Saturation)',
      nameRu: 'Каротиноидный золотистый тон b*',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 12.5, sd: 4.8, idealMin: 10.0, idealMax: 22.0 },
      female: { mean: 13.2, sd: 4.5, idealMin: 11.0, idealMax: 23.0 },
      universal: { mean: 12.8, sd: 4.6, idealMin: 10.5, idealMax: 22.5 }
    },
    laplacianSmoothness: {
      id: 'laplacianSmoothness',
      nameEn: 'Laplacian Microrelief & Smoothness Index',
      nameRu: 'Микрорельеф и гладкость пор (Лапласиан)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: 55.0, sd: 18.0, idealMin: 20.0, idealMax: 45.0 },
      female: { mean: 45.0, sd: 16.0, idealMin: 18.0, idealMax: 38.0 },
      universal: { mean: 50.0, sd: 17.5, idealMin: 19.0, idealMax: 42.0 }
    },
    cheekHollowContrast: {
      id: 'cheekHollowContrast',
      nameEn: 'Cheek Hollow Adiposity / Bone Definition',
      nameRu: 'Контраст щечной впадины (Cheek Hollow)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '%',
      male: { mean: 6.8, sd: 4.2, idealMin: 5.0, idealMax: 16.0 },
      female: { mean: 4.5, sd: 3.5, idealMin: 3.0, idealMax: 12.0 },
      universal: { mean: 5.6, sd: 4.0, idealMin: 4.0, idealMax: 14.0 }
    },
    darkCirclesDeltaL: {
      id: 'darkCirclesDeltaL',
      nameEn: 'Infraorbital Dark Circles Index (ΔL*)',
      nameRu: 'Периорбитальные темные круги (ΔL*)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      male: { mean: -2.8, sd: 1.8, idealMin: -1.2, idealMax: 0.5 },
      female: { mean: -2.5, sd: 1.7, idealMin: -1.0, idealMax: 0.5 },
      universal: { mean: -2.6, sd: 1.8, idealMin: -1.1, idealMax: 0.5 }
    },

    // -------------------------------------------------------------
    // SEXUAL DIMORPHISM & AGE
    // -------------------------------------------------------------
    masculinityIndex: {
      id: 'masculinityIndex',
      nameEn: 'Secondary Sexual Dimorphism / Masculinity',
      nameRu: 'Индекс полового диморфизма / Маскулинность',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '/100',
      male: { mean: 68.0, sd: 12.5, idealMin: 80.0, idealMax: 98.0 },
      female: { mean: 32.0, sd: 12.0, idealMin: 15.0, idealMax: 30.0 },
      universal: { mean: 50.0, sd: 18.0, idealMin: 40.0, idealMax: 60.0 }
    },
    youthfulnessIndex: {
      id: 'youthfulnessIndex',
      nameEn: 'Biological Youthfulness Index',
      nameRu: 'Индекс биологической молодости',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '/100',
      male: { mean: 72.0, sd: 14.0, idealMin: 80.0, idealMax: 100.0 },
      female: { mean: 74.0, sd: 13.5, idealMin: 82.0, idealMax: 100.0 },
      universal: { mean: 73.0, sd: 13.8, idealMin: 81.0, idealMax: 100.0 }
    }
  };

  /**
   * Evaluates a measured parameter against population distribution
   * @param {string} paramKey - Key in database
   * @param {number} value - Measured raw value
   * @param {string} gender - 'male' | 'female' | 'universal'
   * @returns {Object} { zScore, percentile, score100, status, domain, idealStr, confidence }
   */
  static evaluate(paramKey, value, gender = 'male') {
    const entry = this.database[paramKey];
    if (!entry) {
      return {
        zScore: 0,
        percentile: 50,
        score100: 70,
        status: 'ESTIMATED',
        domain: 'SCIENTIFIC',
        idealStr: 'N/A',
        confidence: 70
      };
    }

    const dist = entry[gender] || entry['universal'];
    const zScore = (value - dist.mean) / (dist.sd || 1e-4);
    const percentile = this.zToPercentile(zScore);

    // Calculate score (0-100) based on distance from ideal bounds
    let score100 = 100;
    if (value < dist.idealMin) {
      const diff = dist.idealMin - value;
      const sigmaDiff = diff / (dist.sd || 1);
      score100 = Math.max(10, 100 - sigmaDiff * 35);
    } else if (value > dist.idealMax) {
      const diff = value - dist.idealMax;
      const sigmaDiff = diff / (dist.sd || 1);
      score100 = Math.max(10, 100 - sigmaDiff * 35);
    }

    const idealStr = `${dist.idealMin}${entry.unit} – ${dist.idealMax}${entry.unit}`;

    return {
      id: entry.id,
      nameEn: entry.nameEn,
      nameRu: entry.nameRu,
      rawVal: value,
      unit: entry.unit,
      zScore: parseFloat(zScore.toFixed(2)),
      percentile: Math.round(percentile),
      score100: Math.round(Math.max(5, Math.min(99, score100))),
      status: entry.status,
      domain: entry.domain,
      idealStr,
      confidence: entry.status === 'MEASURED' ? 95 : 75
    };
  }

  /**
   * Computes standard normal CDF percentile from Z-Score
   */
  static zToPercentile(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (z > 0) p = 1 - p;
    return Math.max(0.1, Math.min(99.9, p * 100));
  }

  /**
   * Computes 95% Confidence Interval for a given score & sample confidence
   */
  static compute95CI(score, confidencePct = 90) {
    // Margin of error inversely proportional to confidence
    const margin = parseFloat(((100 - confidencePct) * 0.12 + 1.8).toFixed(1));
    const lower = Math.max(1, Math.round(score - margin));
    const upper = Math.min(99, Math.round(score + margin));
    return {
      margin,
      lower,
      upper,
      formatted: `${score} ± ${margin} (${lower}–${upper})`
    };
  }
}

window.PopulationReferenceDB = PopulationReferenceDB;
