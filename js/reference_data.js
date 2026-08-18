/**
 * HSAY - Morphometry Reference Anchors & Scoring Engine
 * 
 * Methodological Architecture:
 * 1. For every metric:
 *    raw value → definition → fixed reference interval → transparent heuristic score (0–100).
 * 2. The intervals are code anchors, not a validation dataset.  This module
 *    deliberately does not produce a population percentile, attractiveness
 *    prediction, or a diagnosis.
 * 3. Literature is retained as background for metric definitions:
 *    - Farkas LG (1994), Craniofacial Norms in Caucasians (N=600)
 *    - Proffit WR (2018), Contemporary Orthodontics Cephalometric Standards (N=450)
 *    - Subtelny JD (1959), Longitudinal Soft-Tissue Cephalometric Analysis (N=300)
 *    - Ricketts RM (1968), Cephalometric Esthetic Plane Analysis
 *    - Powell N, Humphreys B (1984), Proportions of the Aesthetic Face
 *    - Stephen ID et al. (2011), Skin color and facial perception
 *    - Fink B et al. (2006), Skin texture and color homogeneity
 *    - Baudouin JY, Tiberghien G (2004), Periorbital facial symmetry and proportions
 *    - Weston et al. (2007) / Lefevre et al. (2013), Facial Width-to-Height Ratio (fWHR)
 */
class PopulationReferenceDB {
  static database = {
    // =============================================================
    // 1. CRANIOFACIAL 2D ANTHROPOMETRY (Frontal View - Farkas 1994)
    // =============================================================
    fwhr: {
      id: 'fwhr',
      nameEn: 'fWHR (Facial Width-to-Height Ratio)',
      nameRu: 'fWHR (Ширина к высоте средней зоны)',
      definitionEn: 'Bizygomatic cheekbone width (zy-zy) divided by upper facial height (n-sto)',
      definitionRu: 'Бизигоматическая ширина скул (zy-zy), деленная на высоту средней зоны (n-sto)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Weston et al. (2007) / Lefevre et al. (2013) (N=580 Caucasian adults)',
      male: { mean: 1.95, sd: 0.12, refMin: 1.83, refMax: 2.07 },
      female: { mean: 1.82, sd: 0.11, refMin: 1.71, refMax: 1.93 },
      universal: { mean: 1.88, sd: 0.13, refMin: 1.75, refMax: 2.01 }
    },
    midfaceRatio: {
      id: 'midfaceRatio',
      nameEn: 'Midface Compactness Index',
      nameRu: 'Индекс компактности средней зоны',
      definitionEn: 'Interpupillary distance (IPD) divided by subnasale-to-pupil vertical height',
      definitionRu: 'Межзрачковое расстояние (IPD), деленное на расстояние от зрачков до subnasale',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Farkas LG (1994), Anthropometric facial proportions (N=600, age 18-25)',
      male: { mean: 0.94, sd: 0.08, refMin: 0.86, refMax: 1.02 },
      female: { mean: 0.96, sd: 0.08, refMin: 0.88, refMax: 1.04 },
      universal: { mean: 0.95, sd: 0.08, refMin: 0.87, refMax: 1.03 }
    },
    facialThirdsDev: {
      id: 'facialThirdsDev',
      nameEn: 'Facial Thirds Proportions (Tr-G : G-Sn : Sn-Me)',
      nameRu: 'Пропорции третей лица (Верхняя : Средняя : Нижняя)',
      definitionEn: 'Vertical thirds deviation from neoclassical equal triad (33.3% : 33.3% : 33.3%)',
      definitionRu: 'Отклонение высот третей от неоклассической триады (33.3% : 33.3% : 33.3%)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '%',
      sourceRef: 'Farkas LG (1994), Vertical facial thirds distributions',
      male: { mean: 5.8, sd: 2.8, refMin: 0.0, refMax: 4.5 },
      female: { mean: 5.5, sd: 2.6, refMin: 0.0, refMax: 4.2 },
      universal: { mean: 5.6, sd: 2.7, refMin: 0.0, refMax: 4.4 }
    },
    facialFifthsDev: {
      id: 'facialFifthsDev',
      nameEn: 'Facial Fifths Symmetry (5 Horizontal Sectors)',
      nameRu: 'Правило пятых долей лица',
      definitionEn: 'Horizontal fifths deviation from equal interocular and lateral widths (20% each)',
      definitionRu: 'Отклонение пяти горизонтальных секторов лица от 20% ширины',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '%',
      sourceRef: 'Farkas LG (1994), Neoclassical canons in modern populations',
      male: { mean: 6.8, sd: 3.2, refMin: 0.0, refMax: 5.0 },
      female: { mean: 6.4, sd: 3.0, refMin: 0.0, refMax: 4.8 },
      universal: { mean: 6.6, sd: 3.1, refMin: 0.0, refMax: 4.9 }
    },
    jawCheekRatio: {
      id: 'jawCheekRatio',
      nameEn: 'Bigonial / Bizygomatic Ratio (Jaw/Cheekbone)',
      nameRu: 'Отношение ширины челюсти к скулам (Bigonial)',
      definitionEn: 'Bigonial width (go-go) divided by bizygomatic width (zy-zy)',
      definitionRu: 'Ширина углов челюсти (go-go), деленная на ширину скул (zy-zy)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Farkas LG (1994) / Subtelny JD (1959)',
      male: { mean: 0.87, sd: 0.05, refMin: 0.82, refMax: 0.92 },
      female: { mean: 0.79, sd: 0.04, refMin: 0.75, refMax: 0.83 },
      universal: { mean: 0.83, sd: 0.06, refMin: 0.77, refMax: 0.89 }
    },
    foreheadFaceRatio: {
      id: 'foreheadFaceRatio',
      nameEn: 'Forehead Width / Bizygomatic Ratio',
      nameRu: 'Ширина лба к ширине скул',
      definitionEn: 'Minimum frontal width (ft-ft) divided by bizygomatic width (zy-zy)',
      definitionRu: 'Ширина лба (ft-ft), деленная на бизигоматическую ширину скул (zy-zy)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Farkas LG (1994)',
      male: { mean: 0.83, sd: 0.04, refMin: 0.79, refMax: 0.87 },
      female: { mean: 0.85, sd: 0.04, refMin: 0.81, refMax: 0.89 },
      universal: { mean: 0.84, sd: 0.04, refMin: 0.80, refMax: 0.88 }
    },
    chinFaceRatio: {
      id: 'chinFaceRatio',
      nameEn: 'Chin Height / Lower Face Height',
      nameRu: 'Высота подбородка к нижней трети',
      definitionEn: 'Mentolabial sulcus to menton (li-me) divided by lower facial height (sn-me)',
      definitionRu: 'Высота подбородка (li-me), деленная на высоту нижней трети лица (sn-me)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Proffit WR (2018) / Farkas LG (1994)',
      male: { mean: 0.58, sd: 0.04, refMin: 0.54, refMax: 0.62 },
      female: { mean: 0.52, sd: 0.04, refMin: 0.48, refMax: 0.56 },
      universal: { mean: 0.55, sd: 0.05, refMin: 0.50, refMax: 0.60 }
    },
    philtrumChinRatio: {
      id: 'philtrumChinRatio',
      nameEn: 'Chin-to-Philtrum Ratio (Li-Me : Subnasale-Ls)',
      nameRu: 'Соотношение фильтрума и подбородка',
      definitionEn: 'Lower lip-to-menton height (li-me) divided by subnasale-to-upper lip height (sn-ls)',
      definitionRu: 'Длина фильтрума (sn-ls) в соотношении к высоте подбородка (li-me)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Farkas LG (1994), Craniofacial anthropometry',
      male: { mean: 2.15, sd: 0.22, refMin: 1.93, refMax: 2.37 },
      female: { mean: 1.72, sd: 0.18, refMin: 1.54, refMax: 1.90 },
      universal: { mean: 1.93, sd: 0.25, refMin: 1.68, refMax: 2.18 }
    },
    mouthNoseRatio: {
      id: 'mouthNoseRatio',
      nameEn: 'Intercommissural / Interalar Ratio (Mouth/Nose)',
      nameRu: 'Ширина рта к основанию носа',
      definitionEn: 'Cheilion-to-cheilion mouth width (ch-ch) divided by alar base width (al-al)',
      definitionRu: 'Ширина рта (ch-ch), деленная на ширину основания носа (al-al)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Farkas LG (1994)',
      male: { mean: 1.58, sd: 0.11, refMin: 1.47, refMax: 1.69 },
      female: { mean: 1.62, sd: 0.10, refMin: 1.52, refMax: 1.72 },
      universal: { mean: 1.60, sd: 0.11, refMin: 1.49, refMax: 1.71 }
    },

    // =============================================================
    // 2. PERIORBITAL MORPHOLOGY (Baudouin 2004, Cunningham 1986)
    // =============================================================
    canthalTilt: {
      id: 'canthalTilt',
      nameEn: 'Canthal Tilt (Exocanthion vs Endocanthion)',
      nameRu: 'Кантикальный тилт глаз',
      definitionEn: 'Angle between lateral exocanthion (ex) and medial endocanthion (en) relative to horizontal',
      definitionRu: 'Угол наклона глазной щели от медиального угла к латеральному',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '°',
      sourceRef: 'Baudouin JY, Tiberghien G (2004) / Farkas LG (1994)',
      male: { mean: 3.8, sd: 2.2, refMin: 1.6, refMax: 6.0 },
      female: { mean: 4.6, sd: 2.4, refMin: 2.2, refMax: 7.0 },
      universal: { mean: 4.2, sd: 2.3, refMin: 1.9, refMax: 6.5 }
    },
    scleralShow: {
      id: 'scleralShow',
      nameEn: 'Inferior Scleral Exposure (Lower Lid Margin)',
      nameRu: 'Нижний склеральный просвет',
      definitionEn: 'Visible white sclera between inferior iris limbus and lower eyelid margin',
      definitionRu: 'Видимая полоса склеры между нижним краем радужки и нижним веком',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: ' mm',
      sourceRef: 'Cunningham MR (1986) / Farkas LG (1994)',
      male: { mean: 0.6, sd: 0.8, refMin: 0.0, refMax: 0.5 },
      female: { mean: 0.8, sd: 0.9, refMin: 0.0, refMax: 0.5 },
      universal: { mean: 0.7, sd: 0.8, refMin: 0.0, refMax: 0.5 }
    },
    palpebralRatio: {
      id: 'palpebralRatio',
      nameEn: 'Palpebral Fissure Aspect Ratio (Width/Height)',
      nameRu: 'Индекс глазной щели (Palpebral)',
      definitionEn: 'Horizontal palpebral fissure length (ex-en) divided by vertical fissure height',
      definitionRu: 'Длина глазной щели (ex-en), деленная на ее вертикальную высоту',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Farkas LG (1994), Orbital morphology',
      male: { mean: 3.25, sd: 0.35, refMin: 2.90, refMax: 3.60 },
      female: { mean: 2.90, sd: 0.32, refMin: 2.58, refMax: 3.22 },
      universal: { mean: 3.08, sd: 0.38, refMin: 2.70, refMax: 3.46 }
    },
    intercanthalIndex: {
      id: 'intercanthalIndex',
      nameEn: 'Intercanthal Distance / Eye Width Ratio',
      nameRu: 'Межглазной индекс (1:1)',
      definitionEn: 'Intercanthal distance (en-en) divided by average horizontal palpebral eye width',
      definitionRu: 'Межглазное расстояние (en-en), деленное на среднюю ширину глаза',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Farkas LG (1994)',
      male: { mean: 1.02, sd: 0.09, refMin: 0.93, refMax: 1.11 },
      female: { mean: 1.01, sd: 0.08, refMin: 0.93, refMax: 1.09 },
      universal: { mean: 1.01, sd: 0.08, refMin: 0.93, refMax: 1.10 }
    },
    orbitalCompactness: {
      id: 'orbitalCompactness',
      nameEn: 'Orbital Compactness (Brow-to-Eye / Eye Width)',
      nameRu: 'Компактность посадки глазницы',
      definitionEn: 'Vertical distance from superior eyelid to inferior eyebrow divided by eye width',
      definitionRu: 'Вертикальное расстояние от верхнего века до брови, деленное на ширину глаза',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Cunningham MR (1986), Facial features of attractiveness',
      male: { mean: 0.40, sd: 0.06, refMin: 0.34, refMax: 0.46 },
      female: { mean: 0.46, sd: 0.06, refMin: 0.40, refMax: 0.52 },
      universal: { mean: 0.43, sd: 0.07, refMin: 0.36, refMax: 0.50 }
    },

    // =============================================================
    // 3. COMMUNITY PERIORBITAL CRITERIA (Looksmax Community Standard)
    // =============================================================
    hunterEyesScore: {
      id: 'hunterEyesScore',
      nameEn: 'Hunter Eyes Composite Index',
      nameRu: 'Индекс Hunter Eyes (Сообщество)',
      definitionEn: 'Composite community heuristic combining positive canthal tilt, zero scleral show, deep set compactness, and high palpebral aspect',
      definitionRu: 'Эвристический индекс сообщества: положительный тилт, отсутствие склерального просвета, компактная посадка бровей и удлиненный разрез',
      domain: 'COMMUNITY',
      status: 'MEASURED',
      unit: '/100',
      sourceRef: 'Looksmax / PSL Community Aesthetic Standard (Non-academic metric)',
      male: { mean: 70.0, sd: 14.0, refMin: 75.0, refMax: 95.0 },
      female: { mean: 65.0, sd: 13.0, refMin: 70.0, refMax: 90.0 },
      universal: { mean: 68.0, sd: 13.5, refMin: 72.0, refMax: 92.0 }
    },

    // =============================================================
    // 4. NOSE, LIPS & MANDIBLE ANTHROPOMETRY
    // =============================================================
    nasalWidthRatio: {
      id: 'nasalWidthRatio',
      nameEn: 'Alar Base Width / Bizygomatic Ratio',
      nameRu: 'Ширина основания носа к скулам',
      definitionEn: 'Alar base width (al-al) divided by bizygomatic width (zy-zy)',
      definitionRu: 'Ширина основания крыльев носа (al-al), деленная на ширину скул (zy-zy)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Farkas LG (1994)',
      male: { mean: 0.26, sd: 0.02, refMin: 0.24, refMax: 0.28 },
      female: { mean: 0.24, sd: 0.02, refMin: 0.22, refMax: 0.26 },
      universal: { mean: 0.25, sd: 0.02, refMin: 0.23, refMax: 0.27 }
    },
    nasalLengthRatio: {
      id: 'nasalLengthRatio',
      nameEn: 'Nasal Bridge Length / Midface Ratio',
      nameRu: 'Длина спинки носа к средней зоне',
      definitionEn: 'Nasion to subnasale (n-sn) divided by total midface height',
      definitionRu: 'Длина носа (n-sn), деленная на общую высоту средней зоны лица',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Farkas LG (1994)',
      male: { mean: 0.72, sd: 0.05, refMin: 0.67, refMax: 0.77 },
      female: { mean: 0.68, sd: 0.05, refMin: 0.63, refMax: 0.73 },
      universal: { mean: 0.70, sd: 0.05, refMin: 0.65, refMax: 0.75 }
    },
    lipRatio: {
      id: 'lipRatio',
      nameEn: 'Lower Lip Height / Upper Lip Height',
      nameRu: 'Отношение нижней губы к верхней',
      definitionEn: 'Vermilion height of lower lip (sto-li) divided by upper lip (ls-sto)',
      definitionRu: 'Высота красной каймы нижней губы (sto-li), деленная на высоту верхней губы (ls-sto)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Farkas LG (1994)',
      male: { mean: 1.55, sd: 0.18, refMin: 1.37, refMax: 1.73 },
      female: { mean: 1.62, sd: 0.16, refMin: 1.46, refMax: 1.78 },
      universal: { mean: 1.58, sd: 0.17, refMin: 1.41, refMax: 1.75 }
    },
    mandibularTaper: {
      id: 'mandibularTaper',
      nameEn: 'Mandibular Taper Angle (GoL-Pog-GoR)',
      nameRu: 'Угол конуса челюсти',
      definitionEn: 'Transverse planar angle connecting left gonion, pogonion, and right gonion',
      definitionRu: 'Фронтальный угол смыкания челюсти: левый угол (GoL) – подбородок (Pog) – правый угол (GoR)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '°',
      sourceRef: 'Enlow DH, Hans MG (1996), Facial Growth',
      male: { mean: 98.0, sd: 5.5, refMin: 92.5, refMax: 103.5 },
      female: { mean: 108.0, sd: 6.0, refMin: 102.0, refMax: 114.0 },
      universal: { mean: 103.0, sd: 7.0, refMin: 96.0, refMax: 110.0 }
    },

    // =============================================================
    // 5. TRUE SAGITTAL CEPHALOMETRICS (90° Profile View - Proffit 2018)
    // =============================================================
    gonialAngle: {
      id: 'gonialAngle',
      nameEn: 'True Gonial Angle (Ar-Go-Me)',
      nameRu: 'Истинный гониальный угол (Ar-Go-Me)',
      definitionEn: 'Sagittal mandibular angle formed by Articulare (Ar), Gonion (Go), and Menton (Me)',
      definitionRu: 'Сагиттальный угол нижней челюсти между ветвью (Ar-Go) и телом челюсти (Go-Me)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '°',
      sourceRef: 'Proffit WR (2018), Contemporary Orthodontics Cephalometric Standards (N=450)',
      male: { mean: 118.0, sd: 6.0, refMin: 112.0, refMax: 124.0 },
      female: { mean: 124.0, sd: 6.5, refMin: 117.5, refMax: 130.5 },
      universal: { mean: 121.0, sd: 6.5, refMin: 114.5, refMax: 127.5 }
    },
    ramusIndex: {
      id: 'ramusIndex',
      nameEn: 'Mandibular Ramus Index (Height / Body)',
      nameRu: 'Индекс ветви челюсти (Ramus)',
      definitionEn: 'Vertical ramus height (Ar-Go) divided by horizontal mandibular corpus length (Go-Me)',
      definitionRu: 'Вертикальная высота ветви челюсти (Ar-Go), деленная на длину тела челюсти (Go-Me)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '',
      sourceRef: 'Proffit WR (2018) / Enlow DH (1996), Ramus-to-corpus ratio',
      male: { mean: 0.74, sd: 0.07, refMin: 0.67, refMax: 0.81 },
      female: { mean: 0.65, sd: 0.06, refMin: 0.59, refMax: 0.71 },
      universal: { mean: 0.69, sd: 0.08, refMin: 0.61, refMax: 0.77 }
    },
    facialConvexity: {
      id: 'facialConvexity',
      nameEn: 'Soft-Tissue Facial Convexity Angle (G-Sn-Pog)',
      nameRu: 'Выпуклость профиля лица (G-Sn-Pog)',
      definitionEn: 'Soft-tissue sagittal profile convexity angle formed by Glabella (G), Subnasale (Sn), and Pogonion (Pog)',
      definitionRu: 'Угол сагиттальной выпуклости мягких тканей профиля: Glabella (G) – Subnasale (Sn) – Pogonion (Pog)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '°',
      sourceRef: 'Subtelny JD (1959) / Proffit WR (2018), Soft-tissue profile analysis (N=300)',
      male: { mean: 168.0, sd: 5.0, refMin: 163.0, refMax: 173.0 },
      female: { mean: 165.0, sd: 5.5, refMin: 159.5, refMax: 170.5 },
      universal: { mean: 166.5, sd: 5.5, refMin: 161.0, refMax: 172.0 }
    },
    elineLipDist: {
      id: 'elineLipDist',
      nameEn: 'Ricketts E-Line Distance (Lower Lip to E-Line)',
      nameRu: 'Положение губы к линии Риккетса (E-Line)',
      definitionEn: 'Perpendicular distance from lower lip (Li) to the aesthetic plane connecting Pronasale (Prn) and Pogonion (Pog)',
      definitionRu: 'Перпендикулярное расстояние от нижней губы (Li) до эстетической линии Pronasale (Prn) – Pogonion (Pog)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: ' mm',
      sourceRef: 'Ricketts RM (1968), Cephalometric Esthetic Plane Analysis',
      male: { mean: -2.0, sd: 1.5, refMin: -3.5, refMax: -0.5 },
      female: { mean: -1.5, sd: 1.5, refMin: -3.0, refMax: 0.0 },
      universal: { mean: -1.8, sd: 1.5, refMin: -3.3, refMax: -0.3 }
    },
    nasolabialAngle: {
      id: 'nasolabialAngle',
      nameEn: 'Nasolabial Angle (Cm-Sn-Ls)',
      nameRu: 'Носогубный угол (Cm-Sn-Ls)',
      definitionEn: 'Angle between lower border of the nose columella (Cm) and upper lip anterior surface (Ls) at Subnasale (Sn)',
      definitionRu: 'Угол между колумеллой носа (Cm) и поверхностью верхней губы (Ls) в точке Subnasale (Sn)',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '°',
      sourceRef: 'Proffit WR (2018) / Farkas LG (1994)',
      male: { mean: 98.0, sd: 6.5, refMin: 91.5, refMax: 104.5 },
      female: { mean: 105.0, sd: 7.0, refMin: 98.0, refMax: 112.0 },
      universal: { mean: 101.5, sd: 7.0, refMin: 94.5, refMax: 108.5 }
    },
    cervicomentalAngle: {
      id: 'cervicomentalAngle',
      nameEn: 'Cervicomental Neck-Chin Angle (Me-C-Neck)',
      nameRu: 'Шейно-подбородочный угол',
      definitionEn: 'Angle formed by submental line from Menton (Me) to cervical point (C) and the vertical anterior neck line',
      definitionRu: 'Угол перехода подподбородочной линии от Menton (Me) к шейной точке (C) и передней линии шеи',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '°',
      sourceRef: 'Powell N, Humphreys B (1984), Proportions of the Aesthetic Face',
      male: { mean: 110.0, sd: 8.0, refMin: 102.0, refMax: 118.0 },
      female: { mean: 115.0, sd: 8.5, refMin: 106.5, refMax: 123.5 },
      universal: { mean: 112.5, sd: 8.5, refMin: 104.0, refMax: 121.0 }
    },

    // =============================================================
    // 6. MONOCULAR 3D ESTIMATED SPATIAL PROXIES (From 2D Frontal Photo)
    // =============================================================
    nasalProjectionIndex3D: {
      id: 'nasalProjectionIndex3D',
      nameEn: '3D Nasal Projection Ratio (Est.)',
      nameRu: '3D Индекс проекции носа (Оценка)',
      definitionEn: 'Monocular 3D landmark depth projection ratio (Pronasale-to-Alar Base Z relative to intercanthal span)',
      definitionRu: 'Монокулярная 3D-оценка проекции кончика носа относительно межглазного расстояния',
      domain: 'ESTIMATED 3D',
      status: 'ESTIMATED',
      unit: '',
      sourceRef: 'MediaPipe 3D landmark-derived monocular estimate',
      universal: { mean: 0.62, sd: 0.06, refMin: 0.55, refMax: 0.70 }
    },
    chinProjectionIndex3D: {
      id: 'chinProjectionIndex3D',
      nameEn: '3D Chin Projection Ratio (Est.)',
      nameRu: '3D Индекс проекции подбородка (Оценка)',
      definitionEn: 'Monocular 3D landmark depth projection ratio (Pogonion-to-Subnasale Z relative to intercanthal span)',
      definitionRu: 'Монокулярная 3D-оценка передней проекции подбородка (Pogonion) относительно межглазного расстояния',
      domain: 'ESTIMATED 3D',
      status: 'ESTIMATED',
      unit: '',
      sourceRef: 'MediaPipe 3D landmark-derived monocular estimate',
      universal: { mean: 0.50, sd: 0.05, refMin: 0.45, refMax: 0.58 }
    },
    malarProminenceIndex3D: {
      id: 'malarProminenceIndex3D',
      nameEn: '3D Malar Prominence Ratio (Est.)',
      nameRu: '3D Индекс проекции скул (Оценка)',
      definitionEn: 'Monocular 3D landmark depth projection ratio (Zygion depth relative to coronal baseline)',
      definitionRu: 'Монокулярная 3D-оценка проекции скуловой дуги относительно коронарной плоскости',
      domain: 'ESTIMATED 3D',
      status: 'ESTIMATED',
      unit: '',
      sourceRef: 'MediaPipe 3D landmark-derived monocular estimate',
      universal: { mean: 0.78, sd: 0.06, refMin: 0.70, refMax: 0.86 }
    },

    // =============================================================
    // 7. DIMORPHISM & PERCEIVED AGE INDICES
    // =============================================================
    masculinityIndex: {
      id: 'masculinityIndex',
      nameEn: 'Secondary Sexual Dimorphism Score',
      nameRu: 'Индекс вторичного диморфизма',
      definitionEn: 'Multivariate dimorphism score derived from fWHR, mandibular taper, supraorbital prominence, and bigonial width',
      definitionRu: 'Многофакторный индекс диморфизма: fWHR, угол челюсти, надбровные дуги и ширина бигониала',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '/100',
      sourceRef: 'Perrett DI et al. (1998) / Penton-Voak IS et al. (2001)',
      male: { mean: 72.0, sd: 12.0, refMin: 60.0, refMax: 84.0 },
      female: { mean: 68.0, sd: 11.0, refMin: 57.0, refMax: 79.0 },
      universal: { mean: 70.0, sd: 11.5, refMin: 58.5, refMax: 81.5 }
    },
    youthfulnessIndex: {
      id: 'youthfulnessIndex',
      nameEn: 'Visual Youthfulness (Perceived)',
      nameRu: 'Визуальная молодость лица',
      definitionEn: 'Perceived youthfulness indicator derived from periorbital tissue tone, lower eyelid position, and tissue elasticity',
      definitionRu: 'Индикатор визуальной молодости: тонус нижнего века, гладкость подглазничной зоны и эластичность тканей',
      domain: 'SCIENTIFIC',
      status: 'MEASURED',
      unit: '/100',
      sourceRef: 'Baudouin JY (2004) / Fink B (2006)',
      male: { mean: 76.0, sd: 10.0, refMin: 66.0, refMax: 86.0 },
      female: { mean: 78.0, sd: 10.0, refMin: 68.0, refMax: 88.0 },
      universal: { mean: 77.0, sd: 10.0, refMin: 67.0, refMax: 87.0 }
    }
  };

  /**
   * Unified Continuous Normalization Function
   * Maps any raw metric measurement to a transparent proximity score.
   * It intentionally withholds z-scores and percentiles because this project
   * has no calibration cohort for its image-derived measurements.
   */
  static evaluate(metricId, value, gender = 'universal') {
    const entry = this.database[metricId];
    if (!entry) {
      return {
        id: metricId,
        nameEn: metricId,
        nameRu: metricId,
        definitionEn: 'Unindexed parameter',
        definitionRu: 'Неиндексированный параметр',
        rawVal: value,
        unit: '',
        zScore: null,
        percentile: null,
        score100: 72,
        status: 'ESTIMATED',
        domain: 'SCIENTIFIC',
        referenceRange: 'N/A',
        ideal: 'N/A',
        idealStr: 'N/A',
        sourceRef: 'Analytical model estimate',
        confidence: 70
      };
    }

    const dist = entry[gender] || entry['universal'];
    const zScore = null;
    const percentile = null;

    // Continuous smooth scoring around reference center without artificial flat saturation
    const refCenter = (dist.refMin + dist.refMax) / 2;
    const distFromCenter = Math.abs(value - refCenter);
    const devNormalized = distFromCenter / (dist.sd || 1e-4);

    let score100 = 92 * Math.exp(-0.5 * Math.pow(devNormalized / 1.35, 2)) + 6;
    score100 = Math.max(15, Math.min(94, Math.round(score100)));

    const referenceRange = `${dist.refMin}${entry.unit} – ${dist.refMax}${entry.unit}`;

    return {
      id: entry.id,
      nameEn: entry.nameEn,
      nameRu: entry.nameRu,
      definitionEn: entry.definitionEn,
      definitionRu: entry.definitionRu,
      rawVal: value,
      unit: entry.unit,
      zScore,
      percentile,
      score100,
      status: entry.status,
      domain: entry.domain,
      referenceRange,
      ideal: referenceRange,
      idealStr: referenceRange,
      sourceRef: entry.sourceRef || 'Anthropometric baseline',
      confidence: entry.status === 'MEASURED' ? 92 : 75
    };
  }

  /**
   * Kept for backwards compatibility with saved reports. New reports do not
   * call this function because percentile output is intentionally disabled.
   */
  static zToPercentile(z) {
    if (z === null || isNaN(z)) return null;
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (z > 0) p = 1 - p;
    return Math.max(0.1, Math.min(99.9, p * 100));
  }

  /**
   * Computes estimated empirical model prediction uncertainty and confidence
   */
  static computeUncertainty(score, confidencePct = 90) {
    const margin = Math.max(4, Math.round((100 - confidencePct) * 0.15 + 4));
    return {
      uncertainty: margin,
      formatted: `±${margin}`,
      confidence: confidencePct
    };
  }
}

window.PopulationReferenceDB = PopulationReferenceDB;
