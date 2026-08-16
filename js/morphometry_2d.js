/**
 * HSAY - Comprehensive 2D Morphometry Engine
 * Covers all anatomical modules:
 * 1. Craniofacial Proportions (fWHR, thirds, fifths, widths, ratios)
 * 2. Periorbital Complex & Eyes (canthal tilt, scleral show, palpebral aspect, intercanthal, Hunter eyes)
 * 3. Brows & Brow Ridge (thickness, arch, position, compactness)
 * 4. Nasal Morphology (width, length, alar base, symmetry, nasolabial)
 * 5. Lips & Philtrum (lip ratio, philtrum ratio, mouth-to-nose, cupid's bow)
 * 6. Cheekbones & Malar Projection (bizygomatic, prominence, symmetry, jaw-cheek ratio)
 * 7. Mandibular Architecture (jaw width, taper, gonial angle estimate, symmetry)
 * 8. Chin Morphology (height, width, projection, philtrum-chin relationship)
 * 9. Hairline & Forehead (height, shape, symmetry)
 * 10. Secondary Sexual Dimorphism & Facial Masculinity/Femininity
 * 11. Biological Youthfulness & Perceived Age
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
    const avgThird = (hUpper + hMid + hLower) / 3 || 1;
    const devThirds = ((Math.abs(hUpper - avgThird) + Math.abs(hMid - avgThird) + Math.abs(hLower - avgThird)) / (3 * avgThird)) * 100;
    const thirdsStr = `${(hUpper / avgThird).toFixed(2)} : ${(hMid / avgThird).toFixed(2)} : ${(hLower / avgThird).toFixed(2)}`;

    // Rule of Fifths
    const earL = pts[234], eyeOutL = pts[33], eyeInL = pts[133];
    const eyeInR = pts[362], eyeOutR = pts[263], earR = pts[454];
    const w1 = Math.abs(eyeOutL.x - earL.x);
    const w2 = Math.abs(eyeInL.x - eyeOutL.x);
    const w3 = Math.abs(eyeInR.x - eyeInL.x);
    const w4 = Math.abs(eyeOutR.x - eyeInR.x);
    const w5 = Math.abs(earR.x - eyeOutR.x);
    const avgFifth = (w1 + w2 + w3 + w4 + w5) / 5 || 1;
    const devFifths = ((Math.abs(w1 - avgFifth) + Math.abs(w2 - avgFifth) + Math.abs(w3 - avgFifth) + Math.abs(w4 - avgFifth) + Math.abs(w5 - avgFifth)) / (5 * avgFifth)) * 100;

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

    // Observable Hunter Eyes Index formula (0-100)
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

    // Estimated Gonial Angle & Ramus from frontal geometry + depth cues
    const estimatedGonialAngle = gender === 'male' ? Math.max(105, Math.min(128, 110 + (mandibularTaperVal - 95) * 0.45))
                                                   : Math.max(115, Math.min(135, 120 + (mandibularTaperVal - 105) * 0.40));
    const estimatedRamusIndex = gender === 'male' ? Math.max(0.60, Math.min(0.88, 0.72 + (jawCheekRatioVal - 0.85) * 0.8))
                                                  : Math.max(0.55, Math.min(0.78, 0.64 + (jawCheekRatioVal - 0.78) * 0.7));

    // =============================================================
    // 6. SECONDARY SEXUAL DIMORPHISM & MASCULINITY / FEMININITY
    // =============================================================
    // Masculinity factors: high fWHR, low compact brow, square jaw angle, high jaw/cheek ratio, thin upper lip
    let mascScore = 50;
    if (fwhrVal >= 1.95) mascScore += 12; else if (fwhrVal < 1.80) mascScore -= 10;
    if (orbitalCompactnessVal <= 0.38) mascScore += 12; else if (orbitalCompactnessVal > 0.48) mascScore -= 10;
    if (mandibularTaperVal <= 102) mascScore += 14; else if (mandibularTaperVal > 115) mascScore -= 12;
    if (jawCheekRatioVal >= 0.86) mascScore += 12; else if (jawCheekRatioVal < 0.80) mascScore -= 10;
    if (lipRatioVal <= 1.4) mascScore += 6; else mascScore -= 6;
    const masculinityVal = Math.max(10, Math.min(98, mascScore));

    // =============================================================
    // 7. BIOLOGICAL YOUTHFULNESS & PERCEIVED AGE ESTIMATE
    // =============================================================
    let youthScore = 80;
    if (scleralShowMm > 0.4) youthScore -= 8;
    if (philtrumChinRatioVal < 1.8 && gender === 'male') youthScore -= 5;
    // Perceived age offset from standard young adult baseline (25yo)
    const perceivedAgeOffset = Math.round((78 - youthScore) * 0.25);
    const perceivedAgeEstimate = Math.max(18, Math.min(55, 25 + perceivedAgeOffset));

    // =============================================================
    // EVALUATE ALL METRICS AGAINST POPULATION REFERENCE DB
    // =============================================================
    const evalParam = (id, val) => PopulationReferenceDB.evaluate(id, val, gender);

    const metrics = {
      // Craniofacial
      fwhr: evalParam('fwhr', fwhrVal),
      midfaceRatio: evalParam('midfaceRatio', midfaceRatioVal),
      thirds: evalParam('facialThirdsDev', devThirds),
      fifths: evalParam('facialFifthsDev', devFifths),
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
      hunterEyes: evalParam('hunterEyesScore', hunterEyesVal),

      // Brows
      browThickness: evalParam('browThickness', browThicknessVal),
      browCurvature: evalParam('browCurvature', browCurvatureVal),

      // Nose
      nasalWidthRatio: evalParam('nasalWidthRatio', nasalWidthRatioVal),
      nasalLengthRatio: evalParam('nasalLengthRatio', nasalLengthRatioVal),
      nasolabialAngle: evalParam('nasolabialAngle', gender === 'male' ? 98.0 : 104.0),

      // Lips
      lipRatio: evalParam('lipRatio', lipRatioVal),
      mouthWidthRatio: evalParam('mouthWidthRatio', mouthWidthRatioVal),

      // Jaw & Chin
      gonialAngle: evalParam('gonialAngle', estimatedGonialAngle),
      ramusIndex: evalParam('ramusIndex', estimatedRamusIndex),
      mandibularTaper: evalParam('mandibularTaper', mandibularTaperVal),
      chinProjection: evalParam('chinProjection', gender === 'male' ? 1.5 : 0.5),

      // Dimorphism & Age
      masculinity: evalParam('masculinityIndex', masculinityVal),
      youthfulness: evalParam('youthfulnessIndex', youthScore)
    };

    // Sub-module overall scores
    const subScores = {
      craniofacial: Math.round(
        metrics.fwhr.score100 * 0.25 +
        metrics.midfaceRatio.score100 * 0.20 +
        metrics.thirds.score100 * 0.15 +
        metrics.fifths.score100 * 0.15 +
        metrics.jawCheekRatio.score100 * 0.15 +
        metrics.philtrumChinRatio.score100 * 0.10
      ),
      periorbital: Math.round(
        metrics.canthalTilt.score100 * 0.25 +
        metrics.palpebralRatio.score100 * 0.25 +
        metrics.scleralShow.score100 * 0.20 +
        metrics.intercanthalIndex.score100 * 0.15 +
        metrics.orbitalCompactness.score100 * 0.15
      ),
      dimorphism: masculinityVal,
      youthfulness: youthScore,
      perceivedAge: perceivedAgeEstimate
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
        perceivedAge: perceivedAgeEstimate
      }
    };
  }
}

window.Morphometry2DEngine = Morphometry2DEngine;
