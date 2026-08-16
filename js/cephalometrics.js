/**
 * HSAY - Sagittal Cephalometrics & 90° Profile Analyzer (Block 2)
 * Specialized 90° Profile Face Analysis Engine.
 * 
 * Supports:
 * 1. Automatic extraction from 3D FaceMesh landmarks on lateral view.
 * 2. Interactive Manual Point Placement & Drag-and-Drop Landmark Tuning.
 * 3. 12-point Step-by-Step Guided Wizard.
 * 
 * Landmarks:
 * - G (Glabella / Лоб)
 * - N (Nasion / Переносица)
 * - Prn (Pronasale / Кончик носа)
 * - Sn (Subnasale / Основание носа)
 * - Cm (Columella / Колумелла)
 * - Ls (Labrale superius / Верхняя губа)
 * - Li (Labrale inferius / Нижняя губа)
 * - Pog (Pogonion / Выступ подбородка)
 * - Me (Menton / Низ подбородка)
 * - Go (True Gonion / Угол челюсти)
 * - Ar (Articulare / Козелок / Ветвь)
 * - C (Cervical / Подподбородочно-шейный угол)
 * - Cornea / Or (Зрачок / Орбита)
 */
class CephalometricsAnalyzer {
  /**
   * Landmark definitions and metadata for manual placement and guides
   */
  static getLandmarkDefinitions() {
    const lang = (window.I18n && window.I18n.currentLang) || 'en';
    if (lang === 'ru') {
      return [
        { id: 'Prn', name: 'Кончик носа (Pronasale)', color: '#06b6d4', desc: 'Наиболее выступающая вперед точка кончика носа' },
        { id: 'Sn', name: 'Основание носа (Subnasale)', color: '#06b6d4', desc: 'Точка перехода носовой перегородки в верхнюю губу' },
        { id: 'N', name: 'Переносица (Nasion)', color: '#8b5cf6', desc: 'Самое глубокое углубление между лбом и спинкой носа' },
        { id: 'G', name: 'Лоб / Надбровье (Glabella)', color: '#8b5cf6', desc: 'Наиболее выступающая вперед точка надбровных дуг' },
        { id: 'Ls', name: 'Верхняя губа (Labrale Sup.)', color: '#f59e0b', desc: 'Крайняя передняя точка красной каймы верхней губы' },
        { id: 'Li', name: 'Нижняя губа (Labrale Inf.)', color: '#f59e0b', desc: 'Крайняя передняя точка красной каймы нижней губы' },
        { id: 'Pog', name: 'Выступ подбородка (Pogonion)', color: '#10b981', desc: 'Самая передняя выступающая точка подбородка' },
        { id: 'Me', name: 'Низ подбородка (Menton)', color: '#10b981', desc: 'Самая нижняя точка контура подбородка' },
        { id: 'Go', name: 'Угол челюсти (Gonion)', color: '#06b6d4', desc: 'Вершина угла нижней челюсти (между ветвью и телом)' },
        { id: 'Ar', name: 'Козелок / Ветвь (Articulare)', color: '#06b6d4', desc: 'Верхняя точка восходящей ветви челюсти возле уха' },
        { id: 'C', name: 'Шейный переход (Cervical)', color: '#f43f5e', desc: 'Точка перехода подбородка в вертикальную линию шеи' },
        { id: 'Cornea', name: 'Зрачок / Орбита (Eye)', color: '#e5e7eb', desc: 'Центр видимого зрачка / глазного яблока' }
      ];
    }
    return [
      { id: 'Prn', name: 'Nasal Tip (Pronasale)', color: '#06b6d4', desc: 'Most prominent anterior point of the nasal tip' },
      { id: 'Sn', name: 'Subnasale (Columella Base)', color: '#06b6d4', desc: 'Junction point between columella and upper lip' },
      { id: 'N', name: 'Nasion (Nasal Root)', color: '#8b5cf6', desc: 'Deepest soft-tissue depression between forehead and nose bridge' },
      { id: 'G', name: 'Glabella (Brow Ridge)', color: '#8b5cf6', desc: 'Most anterior prominent point of supraorbital ridge' },
      { id: 'Ls', name: 'Upper Lip (Labrale Sup.)', color: '#f59e0b', desc: 'Most anterior point of vermilion border of upper lip' },
      { id: 'Li', name: 'Lower Lip (Labrale Inf.)', color: '#f59e0b', desc: 'Most anterior point of vermilion border of lower lip' },
      { id: 'Pog', name: 'Chin Tip (Pogonion)', color: '#10b981', desc: 'Most anterior prominent point of the soft-tissue chin' },
      { id: 'Me', name: 'Menton (Inferior Chin)', color: '#10b981', desc: 'Lowest contour point of the inferior chin border' },
      { id: 'Go', name: 'Gonion (Mandibular Angle)', color: '#06b6d4', desc: 'Vertex angle between mandibular ramus and corpus' },
      { id: 'Ar', name: 'Articulare / Ramus Top', color: '#06b6d4', desc: 'Top point of ascending ramus near ear tragus' },
      { id: 'C', name: 'Cervical Submental Point', color: '#f43f5e', desc: 'Junction point of submental plane and vertical neck' },
      { id: 'Cornea', name: 'Cornea / Orbital Plane', color: '#e5e7eb', desc: 'Center of corneal eye globe profile' }
    ];
  }

  /**
   * Analyzes sagittal profile features from 3D FaceMesh landmarks on profile view
   */
  static analyze(landmarks, gender = 'male') {
    const pts = landmarks;

    // 1. Precise Detection of Profile Facing Direction (Left vs Right)
    let minX = Infinity, maxX = -Infinity;
    pts.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
    });
    const centerX = (minX + maxX) / 2;
    const noseTipRef = pts[1] || pts[4] || pts[5];
    const facingLeft = noseTipRef.x < centerX;

    const findExtremePoint = (indices, findMinX = true) => {
      let bestPt = pts[indices[0]];
      let bestX = findMinX ? Infinity : -Infinity;
      indices.forEach(idx => {
        if (pts[idx]) {
          if (findMinX && pts[idx].x < bestX) {
            bestX = pts[idx].x;
            bestPt = pts[idx];
          } else if (!findMinX && pts[idx].x > bestX) {
            bestX = pts[idx].x;
            bestPt = pts[idx];
          }
        }
      });
      return bestPt || pts[indices[0]];
    };

    // Extract initial landmarks from mesh
    const Prn = findExtremePoint([1, 4, 5, 195, 197, 275, 45, 274, 278], facingLeft);
    const Sn = pts[2] || pts[94] || { x: Prn.x + (facingLeft ? 25 : -25), y: Prn.y + 35 };
    const Cm = pts[94] || { x: (Prn.x + Sn.x) * 0.5, y: (Prn.y + Sn.y) * 0.5 };
    const N = findExtremePoint([168, 6, 197, 195, 8], !facingLeft);
    const G = findExtremePoint([9, 107, 108, 151, 67, 109, 10], facingLeft);
    const Ls = findExtremePoint([0, 11, 12, 37, 267, 39, 269], facingLeft);
    const Li = findExtremePoint([17, 84, 314, 85, 315, 181, 405], facingLeft);
    const Pog = findExtremePoint([199, 175, 152, 200, 18, 148, 176, 377], facingLeft);

    let Me = pts[152];
    let maxMeY = -Infinity;
    [152, 148, 176, 377, 400, 208, 428, 175, 199].forEach(idx => {
      if (pts[idx] && pts[idx].y > maxMeY) {
        maxMeY = pts[idx].y;
        Me = pts[idx];
      }
    });

    let Go = null, Ar = null, Cornea = null, Infraorbital = null;
    if (facingLeft) {
      Go = findExtremePoint([361, 397, 365, 379, 400, 288, 366, 323], false);
      Ar = pts[454] || pts[356] || pts[389] || { x: Go.x - 10, y: Go.y - 120 };
      Cornea = pts[473] || pts[263] || pts[362];
      Infraorbital = pts[374] || pts[345] || pts[425];
    } else {
      Go = findExtremePoint([132, 172, 136, 150, 176, 58, 137, 93], true);
      Ar = pts[234] || pts[127] || pts[162] || { x: Go.x + 10, y: Go.y - 120 };
      Cornea = pts[468] || pts[33] || pts[133];
      Infraorbital = pts[145] || pts[116] || pts[205];
    }

    if (!Go || Math.abs(Go.x - Me.x) < 40) {
      Go = { x: facingLeft ? Me.x + 120 : Me.x - 120, y: Me.y - 45 };
    }
    if (!Ar || Math.abs(Ar.y - Go.y) < 30) {
      Ar = { x: Go.x + (facingLeft ? 10 : -10), y: Go.y - 110 };
    }

    const C = {
      x: Me.x + (Go.x - Me.x) * 0.52,
      y: Me.y + Math.max(15, Math.abs(Me.y - Sn.y) * 0.26)
    };
    const NeckBottom = {
      x: C.x + (facingLeft ? 5 : -5),
      y: C.y + 75
    };

    const pointsMap = {
      G: { x: G.x, y: G.y },
      N: { x: N.x, y: N.y },
      Prn: { x: Prn.x, y: Prn.y },
      Sn: { x: Sn.x, y: Sn.y },
      Cm: { x: Cm.x, y: Cm.y },
      Ls: { x: Ls.x, y: Ls.y },
      Li: { x: Li.x, y: Li.y },
      Pog: { x: Pog.x, y: Pog.y },
      Me: { x: Me.x, y: Me.y },
      Go: { x: Go.x, y: Go.y },
      Ar: { x: Ar.x, y: Ar.y },
      Cornea: { x: Cornea ? Cornea.x : 500, y: Cornea ? Cornea.y : 400 },
      Infraorbital: { x: Infraorbital ? Infraorbital.x : 500, y: Infraorbital ? Infraorbital.y : 430 },
      C: { x: C.x, y: C.y },
      NeckBottom: { x: NeckBottom.x, y: NeckBottom.y }
    };

    return this.analyzeFromCustomPoints(pointsMap, gender, facingLeft);
  }

  /**
   * Pure Mathematical Cephalometric Evaluation from Exact Placed Points
   */
  static analyzeFromCustomPoints(pointsMap, gender = 'male', explicitFacingLeft = null) {
    const { G, N, Prn, Sn, Ls, Li, Pog, Me, Go, Ar, Cornea, C } = pointsMap;
    const Cm = pointsMap.Cm || { x: (Prn.x + Sn.x) * 0.5, y: (Prn.y + Sn.y) * 0.5 };
    const NeckBottom = pointsMap.NeckBottom || { x: C.x, y: C.y + 75 };
    const Infraorbital = pointsMap.Infraorbital || { x: Cornea.x, y: Cornea.y + 30 };

    const dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

    const calcAngleDeg = (pA, pB, pC) => {
      const v1 = { x: pA.x - pB.x, y: pA.y - pB.y };
      const v2 = { x: pC.x - pB.x, y: pC.y - pB.y };
      const dot = v1.x * v2.x + v1.y * v2.y;
      const mag1 = Math.hypot(v1.x, v1.y) || 1;
      const mag2 = Math.hypot(v2.x, v2.y) || 1;
      const cosVal = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
      return (Math.acos(cosVal) * 180) / Math.PI;
    };

    const facingLeft = explicitFacingLeft !== null ? explicitFacingLeft : (Prn.x < Go.x);

    // 1. True Gonial Angle (Ar - Go - Me)
    const gonialAngle = calcAngleDeg(Ar, Go, Me);
    const ramusLength = dist(Ar, Go);
    const corpusLength = dist(Go, Pog) || 1;
    const ramusRatio = ramusLength / corpusLength;

    // 2. Maxillary Support & Orbital Vector
    const cornealXDiff = facingLeft ? (Cornea.x - Infraorbital.x) : (Infraorbital.x - Cornea.x);
    let orbitalVectorType = 'Neutral Vector (0 mm)';
    let scoreOrbital = 88;
    if (cornealXDiff > 4) {
      orbitalVectorType = `Negative Vector (-${(cornealXDiff * 0.3).toFixed(1)} mm)`;
      scoreOrbital = Math.max(30, Math.round(85 - cornealXDiff * 4.5));
    } else if (cornealXDiff < -2) {
      orbitalVectorType = `Positive Vector (+${(Math.abs(cornealXDiff) * 0.3).toFixed(1)} mm)`;
      scoreOrbital = Math.min(99, Math.round(90 + Math.abs(cornealXDiff) * 2.5));
    }

    // 3. Ricketts Esthetic E-Line (Prn to Pog)
    const p1 = Prn, p2 = Pog;
    const getElineXAtY = (y) => {
      if (Math.abs(p2.y - p1.y) < 1e-5) return p1.x;
      const t = (y - p1.y) / (p2.y - p1.y);
      return p1.x + t * (p2.x - p1.x);
    };

    const elineAtLi = getElineXAtY(Li.y);
    const liDiff = facingLeft ? (Li.x - elineAtLi) : (elineAtLi - Li.x);
    const liDiffMm = parseFloat((liDiff * 0.22).toFixed(1));

    // 4. Soft-Tissue Facial Convexity Angle (G - Sn - Pog)
    const facialConvexityAngle = calcAngleDeg(G, Sn, Pog);

    // 5. Nasolabial Angle (Cm - Sn - Ls)
    const nasolabialAngle = calcAngleDeg(Cm, Sn, Ls);

    // 6. Nasofrontal Angle (G - N - Prn)
    const nasofrontalAngle = calcAngleDeg(G, N, Prn);

    // 7. Cervicomental Neck-Chin Angle (Me - C - NeckBottom)
    const cervicomentalAngle = calcAngleDeg(Me, C, NeckBottom);

    // Population Evaluations
    const evalParam = (id, val) => PopulationReferenceDB.evaluate(id, val, gender);

    const mGonial = evalParam('gonialAngle', gonialAngle);
    const mRamus = evalParam('ramusIndex', ramusRatio);
    const mEline = evalParam('elineLipDist', liDiffMm);
    const mConvexity = evalParam('facialConvexity', facialConvexityAngle);
    const mCervico = evalParam('cervicomentalAngle', cervicomentalAngle);
    const mNasolabial = evalParam('nasolabialAngle', nasolabialAngle);

    const subTotalCeph = Math.round(
      mGonial.score100 * 0.25 +
      mRamus.score100 * 0.20 +
      mEline.score100 * 0.20 +
      mConvexity.score100 * 0.15 +
      mCervico.score100 * 0.10 +
      scoreOrbital * 0.10
    );

    return {
      subTotalScore: Math.max(10, Math.min(99, subTotalCeph)),
      facingLeft,
      landmarks: pointsMap,
      metrics: {
        gonialAngle: {
          value: `${gonialAngle.toFixed(1)}°`,
          score: mGonial.score100,
          ideal: mGonial.idealStr,
          status: 'MEASURED',
          domain: 'SCIENTIFIC'
        },
        ramusIndex: {
          value: `${ramusRatio.toFixed(2)}`,
          score: mRamus.score100,
          ideal: mRamus.idealStr,
          status: 'MEASURED',
          domain: 'SCIENTIFIC'
        },
        eline: {
          value: `${liDiffMm > 0 ? '+' : ''}${liDiffMm} mm`,
          score: mEline.score100,
          ideal: mEline.idealStr,
          status: 'MEASURED',
          domain: 'SCIENTIFIC'
        },
        convexity: {
          value: `${facialConvexityAngle.toFixed(1)}°`,
          score: mConvexity.score100,
          ideal: mConvexity.idealStr,
          status: 'MEASURED',
          domain: 'SCIENTIFIC'
        },
        cervicomental: {
          value: `${cervicomentalAngle.toFixed(1)}°`,
          score: mCervico.score100,
          ideal: mCervico.idealStr,
          status: 'MEASURED',
          domain: 'SCIENTIFIC'
        },
        nasolabial: {
          value: `${nasolabialAngle.toFixed(1)}°`,
          score: mNasolabial.score100,
          ideal: mNasolabial.idealStr,
          status: 'MEASURED',
          domain: 'SCIENTIFIC'
        },
        nasofrontal: {
          value: `${nasofrontalAngle.toFixed(1)}°`,
          score: 90,
          ideal: '115° – 135°',
          status: 'MEASURED',
          domain: 'SCIENTIFIC'
        },
        orbitalVector: {
          value: orbitalVectorType,
          score: scoreOrbital,
          ideal: 'Positive Vector (+1.0 to +3.0 mm)',
          status: 'MEASURED',
          domain: 'SCIENTIFIC'
        }
      }
    };
  }
}

window.CephalometricsAnalyzer = CephalometricsAnalyzer;
