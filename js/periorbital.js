/**
 * Module: Periorbital Complex Analyzer (Block 3)
 * Scientific assessment of eyes, palpebral fissure, scleral show, canthal tilt, and brow ridge.
 * Part of Craniofacial Anthropometry & Evolutionary Attractiveness standard.
 */
class PeriorbitalAnalyzer {
  /**
   * Evaluates the 6 key periorbital metrics
   * @param {Array} landmarks - 1000x1000 aligned landmarks
   * @param {string} gender - 'male', 'female', or 'universal'
   * @param {HTMLCanvasElement} [canvas] - Optional canvas for limbal ring pixel analysis
   * @returns {Object} Metric scores, computed values, and subtotal (0-100)
   */
  static analyze(landmarks, gender = 'male', canvas = null) {
    const pts = landmarks;
    const dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

    // -------------------------------------------------------------
    // 1. Canthal Tilt (Кантикальный тилт)
    // -------------------------------------------------------------
    // Left eye: endocanthion 133, exocanthion 33
    const dyLeft = pts[33].y - pts[133].y;
    const dxLeft = pts[133].x - pts[33].x;
    const angleLeftDeg = (Math.atan2(-dyLeft, dxLeft) * 180) / Math.PI;

    // Right eye: endocanthion 362, exocanthion 263
    const dyRight = pts[263].y - pts[362].y;
    const dxRight = pts[263].x - pts[362].x;
    const angleRightDeg = (Math.atan2(-dyRight, dxRight) * 180) / Math.PI;

    const avgCanthalTilt = (angleLeftDeg + angleRightDeg) / 2;

    // Ideal positive canthal tilt: +2° to +8°
    let scoreCanthal = 100;
    if (avgCanthalTilt < 2.0) {
      // Penalty for neutral or negative tilt
      scoreCanthal = Math.max(0, 100 - (2.0 - avgCanthalTilt) * 16);
    } else if (avgCanthalTilt > 8.0) {
      scoreCanthal = Math.max(0, 100 - (avgCanthalTilt - 8.0) * 10);
    }

    // -------------------------------------------------------------
    // 2. Inferior Scleral Show (Нижний склеральный просвет)
    // -------------------------------------------------------------
    // Distance from lower eyelid center (145/374) to iris center (468/473)
    // In ideal almond/hunter eyes, lower eyelid covers or touches the lower iris margin (0 mm scleral show)
    const irisRadiusLeft = dist(pts[468], pts[469] || pts[145]) * 0.5 || 12;
    const irisRadiusRight = dist(pts[473], pts[474] || pts[374]) * 0.5 || 12;

    const lowerLidToIrisLeft = pts[145].y - (pts[468].y + irisRadiusLeft);
    const lowerLidToIrisRight = pts[374].y - (pts[473].y + irisRadiusRight);
    const avgScleralShowPx = Math.max(0, (lowerLidToIrisLeft + lowerLidToIrisRight) / 2);

    // Score: 100 if scleral show == 0 px, drops as sclera becomes visible under iris
    const scoreScleralShow = Math.max(0, Math.min(100, 100 - avgScleralShowPx * 12.0));
    const scleralShowMm = (avgScleralShowPx * 0.25).toFixed(1); // approximate px to mm scaling

    // -------------------------------------------------------------
    // 3. Palpebral Fissure Aspect Ratio (Индекс глазной щели)
    // -------------------------------------------------------------
    // Width (exocanthion - endocanthion) / Height (upper lid - lower lid)
    const eyeWidthL = dist(pts[33], pts[133]);
    const eyeHeightL = dist(pts[159], pts[145]) || 1;
    const ratioL = eyeWidthL / eyeHeightL;

    const eyeWidthR = dist(pts[263], pts[362]);
    const eyeHeightR = dist(pts[386], pts[374]) || 1;
    const ratioR = eyeWidthR / eyeHeightR;

    const palpebralRatio = (ratioL + ratioR) / 2;

    // Benchmarks:
    // Males: 3.0 - 3.8 (compact almond / "hunter eyes" look)
    // Females: 2.6 - 3.4 (feminine cat-eye / open almond)
    let idealRatioMin = 3.0, idealRatioMax = 3.8;
    if (gender === 'female') {
      idealRatioMin = 2.6;
      idealRatioMax = 3.4;
    } else if (gender === 'universal') {
      idealRatioMin = 2.8;
      idealRatioMax = 3.6;
    }

    let scorePalpebral = 100;
    if (palpebralRatio < idealRatioMin) {
      scorePalpebral = Math.max(0, 100 - (idealRatioMin - palpebralRatio) * 75);
    } else if (palpebralRatio > idealRatioMax) {
      scorePalpebral = Math.max(0, 100 - (palpebralRatio - idealRatioMax) * 60);
    }

    // -------------------------------------------------------------
    // 4. Intercanthal Index (Межглазной индекс)
    // -------------------------------------------------------------
    // Ratio of Intercanthal distance (133 to 362) to average Palpebral Fissure Width (eye width)
    const intercanthalDist = dist(pts[133], pts[362]);
    const avgEyeWidth = (eyeWidthL + eyeWidthR) / 2 || 1;
    const intercanthalIndex = intercanthalDist / avgEyeWidth; // Ideal is exactly 1.0 (1:1 golden ratio)

    const intercanthalDev = Math.abs(intercanthalIndex - 1.0);
    const scoreIntercanthal = Math.max(0, Math.min(100, 100 - intercanthalDev * 200));

    // -------------------------------------------------------------
    // 5. Brow Ridge / Supraorbital Prominence (Надбровные дуги)
    // -------------------------------------------------------------
    // Distance from upper eyelid margin (159/386) to eyebrow (70/300) relative to eye width
    const browDistL = Math.abs(pts[159].y - pts[70].y);
    const browDistR = Math.abs(pts[386].y - pts[300].y);
    const avgBrowDist = (browDistL + browDistR) / 2;
    const browCompactness = avgBrowDist / avgEyeWidth;

    let scoreBrowRidge = 100;
    if (gender === 'male') {
      // Male ideal: low, compact, protective brow ridge (0.28 - 0.44)
      if (browCompactness > 0.46) {
        scoreBrowRidge = Math.max(0, 100 - (browCompactness - 0.46) * 190);
      } else if (browCompactness < 0.25) {
        scoreBrowRidge = Math.max(0, 100 - (0.25 - browCompactness) * 150);
      }
    } else {
      // Female ideal: higher, arched eyebrow (0.42 - 0.58)
      if (browCompactness < 0.40) {
        scoreBrowRidge = Math.max(0, 100 - (0.40 - browCompactness) * 190);
      } else if (browCompactness > 0.65) {
        scoreBrowRidge = Math.max(0, 100 - (browCompactness - 0.65) * 150);
      }
    }

    // -------------------------------------------------------------
    // 6. Limbal Ring Clarity & Iris Contrast (Четкость лимбального кольца)
    // -------------------------------------------------------------
    let limbalClarityVal = 88;
    let scoreLimbal = 88;

    if (canvas) {
      try {
        const ctx = canvas.getContext('2d');
        const pIris = pts[468] || pts[133];
        const rad = Math.round(irisRadiusLeft);
        if (pIris.x > rad + 5 && pIris.y > rad + 5 && pIris.x + rad + 5 < canvas.width && pIris.y + 5 < canvas.height) {
          const imgData = ctx.getImageData(Math.round(pIris.x - rad - 2), Math.round(pIris.y - 2), (rad + 4) * 2, 4);
          let edgeGrad = 0;
          for (let i = 0; i < imgData.data.length - 8; i += 4) {
            const lum1 = 0.299 * imgData.data[i] + 0.587 * imgData.data[i+1] + 0.114 * imgData.data[i+2];
            const lum2 = 0.299 * imgData.data[i+4] + 0.587 * imgData.data[i+5] + 0.114 * imgData.data[i+6];
            edgeGrad = Math.max(edgeGrad, Math.abs(lum2 - lum1));
          }
          scoreLimbal = Math.max(40, Math.min(100, 50 + edgeGrad * 0.8));
          limbalClarityVal = scoreLimbal;
        }
      } catch (e) {
        scoreLimbal = 85;
      }
    }

    // -------------------------------------------------------------
    // Weighted Sub-Total Periorbital Score
    // -------------------------------------------------------------
    const subTotalPeriorbital = Math.round(
      scoreCanthal * 0.25 +
      scorePalpebral * 0.25 +
      scoreScleralShow * 0.20 +
      scoreIntercanthal * 0.15 +
      scoreBrowRidge * 0.15
    );

    return {
      subTotalScore: Math.max(0, Math.min(100, subTotalPeriorbital)),
      metrics: {
        canthalTilt: {
          value: `${avgCanthalTilt > 0 ? '+' : ''}${avgCanthalTilt.toFixed(1)}°`,
          score: Math.round(scoreCanthal),
          ideal: '+2.0° – +8.0°'
        },
        scleralShow: {
          value: `${scleralShowMm} мм`,
          score: Math.round(scoreScleralShow),
          ideal: '0.0 мм (No show)'
        },
        palpebralRatio: {
          value: `${palpebralRatio.toFixed(2)} : 1`,
          score: Math.round(scorePalpebral),
          ideal: `${idealRatioMin} – ${idealRatioMax} (Hunter eyes)`
        },
        intercanthalIndex: {
          value: `${intercanthalIndex.toFixed(2)}`,
          score: Math.round(scoreIntercanthal),
          ideal: '1.00 (1:1)'
        },
        browRidge: {
          value: browCompactness < 0.45 ? 'Компактный / Глубокий' : 'Открытый / Высокий',
          score: Math.round(scoreBrowRidge),
          ideal: gender === 'male' ? 'Компактная дуга' : 'Умеренная арка'
        },
        limbalRing: {
          value: `${Math.round(scoreLimbal)}%`,
          score: Math.round(scoreLimbal),
          ideal: '> 80% (Четкий ободок)'
        }
      }
    };
  }
}

window.PeriorbitalAnalyzer = PeriorbitalAnalyzer;

