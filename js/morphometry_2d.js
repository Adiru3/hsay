/**
 * HSAY - Comprehensive 2D Morphometry Engine
 * Covers all anatomical modules:
 * 1. Craniofacial Anthropometry (fWHR, thirds, fifths, widths, ratios)
 * 2. Periorbital Complex & Eyes (canthal tilt, scleral show, palpebral aspect, intercanthal)
 * 3. Hunter Eyes Index (COMMUNITY METRIC - isolated from scientific Z-Scores)
 * 4. Brows & Brow Ridge (thickness, arch, curvature)
 * 5. Nasal Morphology (alar base width, length, symmetry)
 * 6. Lips & Philtrum (lip ratio, philtrum ratio, mouth-to-nose)
 * 7. Mandibular Architecture (mandibular taper angle, jaw-cheek ratio)
 * 8. Chin Morphology (chin height ratio, philtrum-chin relationship)
 * 9. Secondary Sexual Dimorphism
 * 10. Visual Youthfulness (Perceived)
 */
class Morphometry2DEngine {
  /**
   * Analyzes all 2D morphometric features from 1000x1000 aligned landmarks
   * @param {Array} landmarks - 478 Aligned landmarks in 1000x1000 space
   * @param {string} gender - 'male' | 'female' | 'universal'
   * @param {HTMLCanvasElement} [canvas] - Optional canvas for pixel analysis
   * @returns {Object} Comprehensive morphometric results categorized by module
   */
  static analyze(landmarks, gender = 'male', canvas = null) {
    const pts = landmarks;
    const dist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

    // =============================================================
    // 1. CRANIOFACIAL PROPORTIONS & SKELETAL BASE
    // =============================================================
    const bizygomaticWidth = dist(pts[234], pts[454]); // Cheekbone span
    const eyebrowMid = pts[9] || pts[168];
    const upperLipMid = pts[0] || pts[13];
    const midfaceHeight = Math.abs(upperLipMid.y - eyebrowMid.y) || 1;
    const fwhrVal = bizygomaticWidth / midfaceHeight;

    const pupilLeft = pts[468] || { x: (pts[33].x + pts[133].x) / 2, y: (pts[33].y + pts[133].y) / 2 };
    const pupilRight = pts[473] || { x: (pts[362].x + pts[263].x) / 2, y: (pts[362].y + pts[263].y) / 2 };
    const ipd = dist(pupilLeft, pupilRight) || 1;
    const pupilMidY = (pupilLeft.y + pupilRight.y) / 2;
    const pupilToLipDist = Math.abs(upperLipMid.y - pupilMidY) || 1;
    const midfaceRatioVal = pupilToLipDist / ipd;

    const foreheadTop = pts[10];
    const glabella = pts[9] || pts[168];
    const subnasale = pts[2];
    const menton = pts[152];

    const hUpper = Math.abs(glabella.y - foreheadTop.y);
    const hMid = Math.abs(subnasale.y - glabella.y);
    const hLower = Math.abs(menton.y - subnasale.y);
    const totalHeight = hUpper + hMid + hLower || 1;
    
    // Normalized proportional representation of facial thirds (33% : 33% : 33%)
    const tUpperPct = (hUpper / totalHeight) * 100;
    const tMidPct = (hMid / totalHeight) * 100;
    const tLowerPct = (hLower / totalHeight) * 100;
    const thirdsStr = `${Math.round(tUpperPct)}% : ${Math.round(tMidPct)}% : ${Math.round(tLowerPct)}%`;
    const devThirds = (Math.abs(tUpperPct - 33.3) + Math.abs(tMidPct - 33.3) + Math.abs(tLowerPct - 33.3)) / 3;

    // Rule of Fifths
    const earL = pts[234], eyeOutL = pts[33], eyeInL = pts[133];
    const eyeInR = pts[362], eyeOutR = pts[263], earR = pts[454];
    const w1 = Math.abs(eyeOutL.x - earL.x);
    const w2 = Math.abs(eyeInL.x - eyeOutL.x);
    const w3 = Math.abs(eyeInR.x - eyeInL.x);
    const w4 = Math.abs(eyeOutR.x - eyeInR.x);
    const w5 = Math.abs(earR.x - eyeOutR.x);
    const totalW = w1 + w2 + w3 + w4 + w5 || 1;
    const devFifths = (Math.abs(w1/totalW - 0.20) + Math.abs(w2/totalW - 0.20) + Math.abs(w3/totalW - 0.20) + Math.abs(w4/totalW - 0.20) + Math.abs(w5/totalW - 0.20)) / 5 * 100;

    const bigonialWidth = dist(pts[132], pts[361]); // Width at gonial angles
    const jawCheekRatioVal = bigonialWidth / (bizygomaticWidth || 1);

    const foreheadWidth = dist(pts[103], pts[332]) || bizygomaticWidth * 0.84;
    const foreheadFaceRatioVal = foreheadWidth / (bizygomaticWidth || 1);

    const philtrumLen = Math.abs(pts[0].y - subnasale.y) || 1;
    const lowerLipBottom = pts[17];
    const chinHeight = Math.abs(menton.y - lowerLipBottom.y) || 1;
    const philtrumChinRatioVal = chinHeight / philtrumLen;
    const chinFaceRatioVal = chinHeight / (hLower || 1);

    const mouthWidth = dist(pts[61], pts[291]);
    const alarWidth = dist(pts[129], pts[358]) || 1;
    const mouthNoseRatioVal = mouthWidth / alarWidth;
    const mouthWidthRatioVal = mouthWidth / (bizygomaticWidth || 1);
    const nasalWidthRatioVal = alarWidth / (bizygomaticWidth || 1);
    const nasalHeight = Math.abs(subnasale.y - glabella.y) || 1;
    const nasalLengthRatioVal = nasalHeight / (midfaceHeight || 1);

    // =============================================================
    // 2. EYES & PERIORBITAL COMPLEX
    // =============================================================
    const dyLeft = pts[33].y - pts[133].y;
    const dxLeft = pts[133].x - pts[33].x;
    const angleLeftDeg = (Math.atan2(-dyLeft, dxLeft) * 180) / Math.PI;

    const dyRight = pts[263].y - pts[362].y;
    const dxRight = pts[263].x - pts[362].x;
    const angleRightDeg = (Math.atan2(-dyRight, dxRight) * 180) / Math.PI;
    const avgCanthalTilt = (angleLeftDeg + angleRightDeg) / 2;

    const irisRadiusLeft = dist(pts[468], pts[469] || pts[145]) * 0.5 || 12;
    const irisRadiusRight = dist(pts[473], pts[474] || pts[374]) * 0.5 || 12;
    const lowerLidToIrisLeft = pts[145].y - (pts[468].y + irisRadiusLeft);
    const lowerLidToIrisRight = pts[374].y - (pts[473].y + irisRadiusRight);
    const avgScleralShowPx = Math.max(0, (lowerLidToIrisLeft + lowerLidToIrisRight) / 2);
    const scleralShowMm = parseFloat((avgScleralShowPx * 0.22).toFixed(1));

    const eyeWidthL = dist(pts[33], pts[133]);
    const eyeHeightL = dist(pts[159], pts[145]) || 1;
    const ratioL = eyeWidthL / eyeHeightL;

    const eyeWidthR = dist(pts[263], pts[362]);
    const eyeHeightR = dist(pts[386], pts[374]) || 1;
    const ratioR = eyeWidthR / eyeHeightR;
    const palpebralRatioVal = (ratioL + ratioR) / 2;

    const intercanthalDist = dist(pts[133], pts[362]);
    const avgEyeWidth = (eyeWidthL + eyeWidthR) / 2 || 1;
    const intercanthalIndexVal = intercanthalDist / avgEyeWidth;

    const browDistL = Math.abs(pts[159].y - pts[70].y);
    const browDistR = Math.abs(pts[386].y - pts[300].y);
    const avgBrowDist = (browDistL + browDistR) / 2;
    const orbitalCompactnessVal = avgBrowDist / avgEyeWidth;

    // Observable Hunter Eyes Index formula (COMMUNITY ONLY)
    let hunterEyesVal = 70;
    hunterEyesVal += (avgCanthalTilt >= 3.0 ? 12 : (avgCanthalTilt >= 1.0 ? 5 : -10));
    hunterEyesVal -= Math.min(25, scleralShowMm * 20);
    hunterEyesVal += (palpebralRatioVal >= 3.1 ? 15 : (palpebralRatioVal >= 2.8 ? 8 : -8));
    hunterEyesVal += (orbitalCompactnessVal <= 0.40 ? 12 : -8);
    hunterEyesVal = Math.max(15, Math.min(99, hunterEyesVal));

    // =============================================================
    // 3. BROWS & BROW RIDGE
    // =============================================================
    const browThickL = dist(pts[70], pts[63] || pts[105]);
    const browThickR = dist(pts[300], pts[293] || pts[334]);
    const avgBrowThick = (browThickL + browThickR) / 2;
    const browThicknessVal = avgBrowThick / avgEyeWidth;

    const browAngleL = Math.atan2(pts[70].y - pts[66].y, pts[66].x - pts[70].x) * (180 / Math.PI);
    const browAngleR = Math.atan2(pts[300].y - pts[296].y, pts[300].x - pts[296].x) * (180 / Math.PI);
    const browCurvatureVal = Math.abs((browAngleL + browAngleR) / 2);

    // =============================================================
    // 4. LIPS & PHILTRUM
    // =============================================================
    const upperLipTop = pts[0] || pts[12];
    const lipLineMid = pts[13];
    const upperLipH = Math.abs(lipLineMid.y - upperLipTop.y) || 1;
    const lowerLipH = Math.abs(lowerLipBottom.y - lipLineMid.y) || 1;
    const lipRatioVal = lowerLipH / upperLipH;


    // =============================================================
    // 5. JAW & MANDIBULAR ARCHITECTURE
    // =============================================================
    const pGonioL = pts[132], pGonioR = pts[361], pChin = pts[152];
    const vecL = { x: pGonioL.x - pChin.x, y: pGonioL.y - pChin.y };
    const vecR = { x: pGonioR.x - pChin.x, y: pGonioR.y - pChin.y };
    const dot = vecL.x * vecR.x + vecL.y * vecR.y;
    const magL = Math.hypot(vecL.x, vecL.y);
    const magR = Math.hypot(vecR.x, vecR.y);
    const mandibularTaperVal = (Math.acos(Math.max(-1, Math.min(1, dot / (magL * magR || 1)))) * 180) / Math.PI;

    // =============================================================
    // 6. SECONDARY SEXUAL DIMORPHISM & MASCULINITY / FEMININITY
    // =============================================================
    let mascScore = 50;
    if (fwhrVal >= 1.95) mascScore += 12; else if (fwhrVal < 1.80) mascScore -= 10;
    if (orbitalCompactnessVal <= 0.38) mascScore += 12; else if (orbitalCompactnessVal > 0.48) mascScore -= 10;
    if (mandibularTaperVal <= 102) mascScore += 14; else if (mandibularTaperVal > 115) mascScore -= 12;
    if (jawCheekRatioVal >= 0.86) mascScore += 12; else if (jawCheekRatioVal < 0.80) mascScore -= 10;
    if (lipRatioVal <= 1.4) mascScore += 6; else mascScore -= 6;
    const masculinityVal = Math.max(10, Math.min(98, mascScore));

    // =============================================================
    // 7. VISUAL YOUTHFULNESS & PERCEIVED FACIAL AGE ESTIMATE
    // =============================================================
    let youthScore = 78;
    if (scleralShowMm > 0.4) youthScore -= 7;
    if (philtrumChinRatioVal < 1.8 && gender === 'male') youthScore -= 4;
    
    // Perceived visual age (calibrated around 24 young adult baseline, strictly positive 18–50)
    const perceivedAgeYears = Math.max(18, Math.min(50, 24 + Math.round((75 - youthScore) * 0.25)));

    // =============================================================
    // EVALUATE ALL METRICS AGAINST POPULATION REFERENCE DB
    // =============================================================
    const evalParam = (id, val) => PopulationReferenceDB.evaluate(id, val, gender);

    const metrics = {
      // Craniofacial
      fwhr: evalParam('fwhr', fwhrVal),
      midfaceRatio: evalParam('midfaceRatio', midfaceRatioVal),
      thirds: {
        ...evalParam('facialThirdsDev', devThirds),
        referenceRange: '30% – 36% each (1:1:1)'
      },
      fifths: {
        ...evalParam('facialFifthsDev', devFifths),
        referenceRange: '18% – 22% each (1:1:1:1:1)'
      },
      jawCheekRatio: evalParam('jawCheekRatio', jawCheekRatioVal),
      foreheadFaceRatio: evalParam('foreheadFaceRatio', foreheadFaceRatioVal),
      chinFaceRatio: evalParam('chinFaceRatio', chinFaceRatioVal),
      philtrumChinRatio: evalParam('philtrumChinRatio', philtrumChinRatioVal),
      mouthNoseRatio: evalParam('mouthNoseRatio', mouthNoseRatioVal),

      // Periorbital
      canthalTilt: evalParam('canthalTilt', avgCanthalTilt),
      scleralShow: evalParam('scleralShow', scleralShowMm),
      palpebralRatio: evalParam('palpebralRatio', palpebralRatioVal),
      intercanthalIndex: evalParam('intercanthalIndex', intercanthalIndexVal),
      orbitalCompactness: evalParam('orbitalCompactness', orbitalCompactnessVal),

      // Hunter Eyes (COMMUNITY ONLY - No Academic Z-score)
      hunterEyes: {
        id: 'hunterEyes',
        nameEn: 'Hunter Eyes Composite Index',
        nameRu: 'Индекс Hunter Eyes (Сообщество)',
        rawVal: hunterEyesVal,
        score100: Math.round(hunterEyesVal),
        status: 'MEASURED',
        domain: 'COMMUNITY',
        zScore: null,
        percentile: null,
        referenceRange: '75 – 95 (Community Tier)',
        confidence: 88
      },

      // Brows
      browThickness: evalParam('browThickness', browThicknessVal),
      browCurvature: evalParam('browCurvature', browCurvatureVal),

      // Nose
      nasalWidthRatio: evalParam('nasalWidthRatio', nasalWidthRatioVal),
      nasalLengthRatio: evalParam('nasalLengthRatio', nasalLengthRatioVal),

      // Lips
      lipRatio: evalParam('lipRatio', lipRatioVal),
      mouthWidthRatio: evalParam('mouthWidthRatio', mouthWidthRatioVal),

      // Jaw & Dimorphism
      mandibularTaper: evalParam('mandibularTaper', mandibularTaperVal),
      masculinity: evalParam('masculinityIndex', masculinityVal),
      youthfulness: evalParam('youthfulnessIndex', youthScore)
    };

    // Sub-module overall scores (Arithmetic mean of normalized metric scores 0–100)
    const subScores = {
      craniofacial: Math.round(
        (metrics.fwhr.score100 +
         metrics.midfaceRatio.score100 +
         metrics.thirds.score100 +
         metrics.fifths.score100 +
         metrics.jawCheekRatio.score100 +
         metrics.philtrumChinRatio.score100) / 6
      ),
      periorbital: Math.round(
        (metrics.canthalTilt.score100 +
         metrics.palpebralRatio.score100 +
         metrics.scleralShow.score100 +
         metrics.intercanthalIndex.score100 +
         metrics.orbitalCompactness.score100) / 5
      ),
      dimorphism: masculinityVal,
      youthfulness: youthScore,
      perceivedAge: perceivedAgeYears
    };


    return {
      subScores,
      metrics,
      rawMeasurements: {
        fwhr: fwhrVal.toFixed(2),
        midfaceRatio: midfaceRatioVal.toFixed(2),
        thirdsStr,
        jawCheekRatio: jawCheekRatioVal.toFixed(2),
        canthalTiltDeg: avgCanthalTilt.toFixed(1),
        scleralShowMm: scleralShowMm.toFixed(1),
        palpebralRatio: palpebralRatioVal.toFixed(2),
        hunterEyesScore: Math.round(hunterEyesVal),
        mandibularTaperDeg: mandibularTaperVal.toFixed(1),
        lipRatio: lipRatioVal.toFixed(2),
        perceivedAge: perceivedAgeYears
      }
    };
  }
}

window.Morphometry2DEngine = Morphometry2DEngine;
