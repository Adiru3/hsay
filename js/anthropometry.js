/**
 * Module: Craniofacial Bone Base & Frontal Proportions (Block 1)
 * Evaluates fWHR, Midface Compactness, Rule of Thirds, Rule of Fifths,
 * Bigonial-to-Bizygomatic Ratio, Philtrum-to-Chin Ratio, and Mouth-to-Nose Ratio.
 */
class AnthropometryAnalyzer {
  /**
   * Evaluates all 7 frontal anthropometric features
   * @param {Array} landmarks - Aligned 1000x1000 landmarks
   * @param {string} gender - 'male', 'female', or 'universal'
   * @returns {Object} Metric scores, values, ideals, and subtotal (0-100)
   */
  static analyze(landmarks, gender = 'male') {
    const pts = landmarks;
    const dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

    // -------------------------------------------------------------
    // 1. fWHR (Facial Width-to-Height Ratio)
    // -------------------------------------------------------------
    const bizygomaticWidth = dist(pts[234], pts[454]); // Cheekbone landmarks
    const eyebrowMid = pts[9] || pts[168];
    const upperLipMid = pts[0] || pts[13];
    const midfaceHeight = Math.abs(upperLipMid.y - eyebrowMid.y) || 1;

    const fwhrValue = bizygomaticWidth / midfaceHeight;

    let fwhrIdealMin = 1.90, fwhrIdealMax = 2.15;
    if (gender === 'female') { fwhrIdealMin = 1.72; fwhrIdealMax = 1.95; }
    else if (gender === 'universal') { fwhrIdealMin = 1.80; fwhrIdealMax = 2.05; }

    let scoreFwhr = 100;
    if (fwhrValue < fwhrIdealMin) {
      scoreFwhr = Math.max(0, 100 - (fwhrIdealMin - fwhrValue) * 220);
    } else if (fwhrValue > fwhrIdealMax) {
      scoreFwhr = Math.max(0, 100 - (fwhrValue - fwhrIdealMax) * 220);
    }

    // -------------------------------------------------------------
    // 2. Midface Ratio (Компактность средней зоны)
    // -------------------------------------------------------------
    // Interpupillary distance (IPD) / distance from pupil line to upper lip (stomion)
    // Optimum: <= 1.0 (compact midface)
    const pupilLeft = pts[468] || { x: (pts[33].x + pts[133].x) / 2, y: (pts[33].y + pts[133].y) / 2 };
    const pupilRight = pts[473] || { x: (pts[362].x + pts[263].x) / 2, y: (pts[362].y + pts[263].y) / 2 };
    const ipd = dist(pupilLeft, pupilRight);
    const pupilMidY = (pupilLeft.y + pupilRight.y) / 2;
    const pupilToLipDist = Math.abs(upperLipMid.y - pupilMidY) || 1;

    const midfaceRatio = pupilToLipDist / ipd; // Distance / IPD (optimum <= 1.0)
    let scoreMidfaceRatio = 100;
    if (midfaceRatio > 1.0) {
      // Penalty for elongated midface
      scoreMidfaceRatio = Math.max(0, 100 - (midfaceRatio - 1.0) * 280);
    } else if (midfaceRatio < 0.78) {
      scoreMidfaceRatio = Math.max(0, 100 - (0.78 - midfaceRatio) * 220);
    }

    // -------------------------------------------------------------
    // 3. Rule of Thirds (Vertical Facial Thirds: Tr-G, G-Sn, Sn-Me)
    // -------------------------------------------------------------
    const foreheadTop = pts[10];
    const glabella = pts[9] || pts[168];
    const subnasale = pts[2];
    const menton = pts[152];

    const hUpper = Math.abs(glabella.y - foreheadTop.y);
    const hMid = Math.abs(subnasale.y - glabella.y);
    const hLower = Math.abs(menton.y - subnasale.y);

    const avgThird = (hUpper + hMid + hLower) / 3;
    const devThirds = (
      Math.abs(hUpper - avgThird) +
      Math.abs(hMid - avgThird) +
      Math.abs(hLower - avgThird)
    ) / (3 * avgThird);

    const scoreThirds = Math.max(0, Math.min(100, 100 - devThirds * 220));
    const thirdsStr = `${(hUpper / avgThird).toFixed(2)} : ${(hMid / avgThird).toFixed(2)} : ${(hLower / avgThird).toFixed(2)}`;

    // -------------------------------------------------------------
    // 4. Rule of Fifths (Horizontal Facial Fifths)
    // -------------------------------------------------------------
    const earL = pts[234];
    const eyeOutL = pts[33];
    const eyeInL = pts[133];
    const eyeInR = pts[362];
    const eyeOutR = pts[263];
    const earR = pts[454];

    const w1 = Math.abs(eyeOutL.x - earL.x);
    const w2 = Math.abs(eyeInL.x - eyeOutL.x);
    const w3 = Math.abs(eyeInR.x - eyeInL.x);
    const w4 = Math.abs(eyeOutR.x - eyeInR.x);
    const w5 = Math.abs(earR.x - eyeOutR.x);

    const avgFifth = (w1 + w2 + w3 + w4 + w5) / 5;
    const devFifths = (
      Math.abs(w1 - avgFifth) +
      Math.abs(w2 - avgFifth) +
      Math.abs(w3 - avgFifth) +
      Math.abs(w4 - avgFifth) +
      Math.abs(w5 - avgFifth)
    ) / (5 * avgFifth);

    const scoreFifths = Math.max(0, Math.min(100, 100 - devFifths * 220));

    // -------------------------------------------------------------
    // 5. Bigonial-to-Bizygomatic Ratio (Челюсть / Скулы)
    // -------------------------------------------------------------
    const bigonialWidth = dist(pts[132], pts[361]); // Width between gonial angles
    const jawCheekRatio = bigonialWidth / (bizygomaticWidth || 1);

    let jawIdealMin = 0.85, jawIdealMax = 0.92;
    if (gender === 'female') { jawIdealMin = 0.76; jawIdealMax = 0.84; }
    else if (gender === 'universal') { jawIdealMin = 0.80; jawIdealMax = 0.90; }

    let scoreJawCheek = 100;
    if (jawCheekRatio < jawIdealMin) {
      scoreJawCheek = Math.max(0, 100 - (jawIdealMin - jawCheekRatio) * 350);
    } else if (jawCheekRatio > jawIdealMax) {
      scoreJawCheek = Math.max(0, 100 - (jawCheekRatio - jawIdealMax) * 400);
    }

    // -------------------------------------------------------------
    // 6. Philtrum-to-Chin Ratio (Фильтрум / Подбородок)
    // -------------------------------------------------------------
    const philtrumLen = Math.abs(pts[0].y - subnasale.y);
    const lowerLipBottom = pts[17];
    const chinHeight = Math.abs(menton.y - lowerLipBottom.y);
    const philtrumToChin = chinHeight / (philtrumLen || 1); // Chin relative to Philtrum

    // Males: 1:2.0 - 1:2.2 (Chin is 2.0 - 2.2x Philtrum)
    // Females: 1:1.6 - 1:1.8
    let chinIdealMin = 2.0, chinIdealMax = 2.2;
    if (gender === 'female') { chinIdealMin = 1.6; chinIdealMax = 1.8; }
    else if (gender === 'universal') { chinIdealMin = 1.8; chinIdealMax = 2.1; }

    let scorePhiltrumChin = 100;
    if (philtrumToChin < chinIdealMin) {
      scorePhiltrumChin = Math.max(0, 100 - (chinIdealMin - philtrumToChin) * 120);
    } else if (philtrumToChin > chinIdealMax) {
      scorePhiltrumChin = Math.max(0, 100 - (philtrumToChin - chinIdealMax) * 100);
    }

    // -------------------------------------------------------------
    // 7. Intercommissural-to-Interalar Ratio (Рот / Основание носа)
    // -------------------------------------------------------------
    // Mouth width (Cheilion-Cheilion 61-291) vs Alar base (129-358)
    const mouthWidth = dist(pts[61], pts[291]);
    const alarWidth = dist(pts[129], pts[358]) || 1;
    const mouthNoseRatio = mouthWidth / alarWidth; // Golden ratio ~ 1.618

    const goldenRatio = 1.618;
    const mouthNoseDev = Math.abs(mouthNoseRatio - goldenRatio);
    const scoreMouthNose = Math.max(0, Math.min(100, 100 - mouthNoseDev * 180));

    // -------------------------------------------------------------
    // Weighted Sub-Total Frontal Craniofacial Score
    // -------------------------------------------------------------
    const subTotalAnthro = Math.round(
      scoreFwhr * 0.22 +
      scoreMidfaceRatio * 0.18 +
      scoreThirds * 0.15 +
      scoreFifths * 0.15 +
      scoreJawCheek * 0.15 +
      scorePhiltrumChin * 0.08 +
      scoreMouthNose * 0.07
    );

    return {
      subTotalScore: Math.max(0, Math.min(100, subTotalAnthro)),
      metrics: {
        fwhr: {
          value: fwhrValue.toFixed(2),
          score: Math.round(scoreFwhr),
          ideal: `${fwhrIdealMin} – ${fwhrIdealMax}`
        },
        midfaceRatio: {
          value: `${midfaceRatio.toFixed(2)}`,
          score: Math.round(scoreMidfaceRatio),
          ideal: '≤ 1.00 (Компактная)'
        },
        thirds: {
          value: thirdsStr,
          score: Math.round(scoreThirds),
          ideal: '1.0 : 1.0 : 1.0 (±5%)'
        },
        fifths: {
          value: `${Math.round(scoreFifths)}%`,
          score: Math.round(scoreFifths),
          ideal: '5 равных отрезков'
        },
        jawCheekRatio: {
          value: jawCheekRatio.toFixed(2),
          score: Math.round(scoreJawCheek),
          ideal: `${jawIdealMin} – ${jawIdealMax}`
        },
        philtrumChin: {
          value: `1 : ${philtrumToChin.toFixed(2)}`,
          score: Math.round(scorePhiltrumChin),
          ideal: `1 : ${chinIdealMin} – 1 : ${chinIdealMax}`
        },
        mouthNoseRatio: {
          value: mouthNoseRatio.toFixed(2),
          score: Math.round(scoreMouthNose),
          ideal: '≈ 1.618 (Золотое сечение)'
        }
      }
    };
  }
}

window.AnthropometryAnalyzer = AnthropometryAnalyzer;

