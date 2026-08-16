/**
 * Module: Sexual Dimorphism & Hormonal Status Engine
 * Evaluates evolutionary reproductive potential markers:
 * Brow Ridge depth, Jaw squareness, fWHR dimorphism, Ramus/Corpus strength, and Lip golden ratios.
 */
class DimorphismAnalyzer {
  /**
   * Evaluates dimorphism features based on gender phenotype target
   * @param {Array} landmarks - Aligned 1000x1000 landmarks
   * @param {string} gender - 'male', 'female', or 'universal'
   * @returns {Object} Dimorphism scores and feature details
   */
  static analyze(landmarks, gender = 'male') {
    const pts = landmarks;
    const dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

    // 1. Brow Ridge Protection / Supraorbital Prominence
    const browLeftDist = Math.abs(pts[159].y - pts[70].y);
    const browRightDist = Math.abs(pts[386].y - pts[300].y);
    const avgBrowEyeDist = (browLeftDist + browRightDist) / 2;
    const eyeWidth = dist(pts[33], pts[133]) || 1;
    const browCompactnessRatio = avgBrowEyeDist / eyeWidth;

    let scoreBrowRidge = 100;
    if (gender === 'male') {
      // Male ideal: low, compact, deep-set
      if (browCompactnessRatio > 0.48) {
        scoreBrowRidge = Math.max(0, 100 - (browCompactnessRatio - 0.48) * 200);
      }
    } else if (gender === 'female') {
      // Female ideal: arched, open
      if (browCompactnessRatio < 0.42) {
        scoreBrowRidge = Math.max(0, 100 - (0.42 - browCompactnessRatio) * 200);
      }
    }

    // 2. Lip Thickness & Volume Ratio
    const upperLipTop = pts[0] || pts[12];
    const lipLineMid = pts[13];
    const lowerLipBottom = pts[17];

    const upperLipThick = Math.abs(lipLineMid.y - upperLipTop.y) || 1;
    const lowerLipThick = Math.abs(lowerLipBottom.y - lipLineMid.y) || 1;
    const lipRatio = lowerLipThick / upperLipThick;

    let lipIdeal = gender === 'female' ? 1.6 : (gender === 'male' ? 1.2 : 1.4);
    const lipDev = Math.abs(lipRatio - lipIdeal);
    const scoreLips = Math.max(0, Math.min(100, 100 - lipDev * 85));

    // 3. Jaw Squareness & Angle Arc (Gonion L - Menton - Gonion R)
    const pGonioL = pts[132];
    const pGonioR = pts[361];
    const pChin = pts[152];

    const vecL = { x: pGonioL.x - pChin.x, y: pGonioL.y - pChin.y };
    const vecR = { x: pGonioR.x - pChin.x, y: pGonioR.y - pChin.y };

    const dot = vecL.x * vecR.x + vecL.y * vecR.y;
    const magL = Math.hypot(vecL.x, vecL.y);
    const magR = Math.hypot(vecR.x, vecR.y);
    const jawAngleDeg = (Math.acos(Math.max(-1, Math.min(1, dot / (magL * magR || 1)))) * 180) / Math.PI;

    let scoreJaw = 100;
    if (gender === 'male') {
      if (jawAngleDeg > 115) {
        scoreJaw = Math.max(0, 100 - (jawAngleDeg - 115) * 3.5);
      } else if (jawAngleDeg < 85) {
        scoreJaw = Math.max(0, 100 - (85 - jawAngleDeg) * 3.5);
      }
    } else if (gender === 'female') {
      if (jawAngleDeg < 112) {
        scoreJaw = Math.max(0, 100 - (112 - jawAngleDeg) * 3.5);
      }
    }

    // 4. Lower Third Massiveness Index
    const cheekWidth = dist(pts[234], pts[454]) || 1;
    const jawWidth = dist(pts[132], pts[361]);
    const jawRatio = jawWidth / cheekWidth;

    let jawRatioScore = 100;
    if (gender === 'male') {
      if (jawRatio < 0.85) jawRatioScore = Math.max(0, 100 - (0.85 - jawRatio) * 350);
    } else if (gender === 'female') {
      if (jawRatio > 0.84) jawRatioScore = Math.max(0, 100 - (jawRatio - 0.84) * 350);
    }

    // Weighted Dimorphism Subtotal
    const subTotalDimorph = Math.round(
      scoreJaw * 0.30 +
      jawRatioScore * 0.25 +
      scoreBrowRidge * 0.25 +
      scoreLips * 0.20
    );

    return {
      subTotalScore: Math.max(0, Math.min(100, subTotalDimorph)),
      metrics: {
        browRidge: {
          value: browCompactnessRatio < 0.46 ? 'Компактный (Маскулинный)' : 'Открытый (Фемининный)',
          score: Math.round(scoreBrowRidge),
          ideal: gender === 'male' ? 'Компактный / Глубокий' : 'Открытая арка'
        },
        lipRatio: {
          value: `1 : ${lipRatio.toFixed(2)}`,
          score: Math.round(scoreLips),
          ideal: `1 : ${lipIdeal.toFixed(1)}`
        },
        jawAngle: {
          value: `${jawAngleDeg.toFixed(1)}°`,
          score: Math.round(scoreJaw),
          ideal: gender === 'male' ? '90° – 110° (Квадратный)' : '115° – 128° (Мягкий овал)'
        },
        jawMassiveness: {
          value: `${jawRatio.toFixed(2)}`,
          score: Math.round(jawRatioScore),
          ideal: gender === 'male' ? '0.85 – 0.92' : '0.76 – 0.84'
        }
      }
    };
  }
}

window.DimorphismAnalyzer = DimorphismAnalyzer;

