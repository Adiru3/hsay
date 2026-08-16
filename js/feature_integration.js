/**
 * HSAY - Holistic Feature Integration & Facial Harmony Engine
 * Evaluates non-linear cross-feature relationships and geometric interactions:
 * - Eye–Brow Harmony
 * - Eye–Nose Harmony
 * - Nose–Mouth Harmony
 * - Mouth–Chin Harmony
 * - Cheekbone–Jaw Harmony
 * - Jaw–Chin Harmony
 * - Upper–Mid–Lower Harmony
 * - Global Facial Harmony & Structural Cohesion
 * 
 * NOTE: Attractiveness is NOT a simple sum of isolated parts.
 * This engine models non-linear cross-feature synergy.
 */
class FeatureIntegrationEngine {
  /**
   * Evaluates cross-feature harmony and geometric integration
   * @param {Object} morph2D - 2D Morphometry results
   * @param {Object} symRes - Symmetry results
   * @param {Object} morph3D - 3D Morphology results
   * @param {Object} skinRes - Skin analysis results
   * @returns {Object} Pairwise harmonies, non-linear interaction terms, and global harmony score
   */
  static evaluateHarmony(morph2D, symRes, morph3D, skinRes) {
    const m = morph2D.metrics;

    // 1. Eye-Brow Harmony (Compactness, angle congruence, tilt alignment)
    const canthalTiltScore = m.canthalTilt.score100;
    const orbitalCompactScore = m.orbitalCompactness.score100;
    const browThickScore = m.browThickness.score100;
    const eyeBrowHarmony = Math.round(
      0.40 * canthalTiltScore +
      0.35 * orbitalCompactScore +
      0.25 * browThickScore
    );

    // 2. Eye-Nose Harmony (Intercanthal width vs Alar base ratio)
    const intercanthalScore = m.intercanthalIndex.score100;
    const noseWidthScore = m.nasalWidthRatio.score100;
    const eyeNoseHarmony = Math.round(0.55 * intercanthalScore + 0.45 * noseWidthScore);

    // 3. Nose-Mouth Harmony (Mouth width vs Alar width golden ratio congruence)
    const mouthNoseScore = m.mouthNoseRatio.score100;
    const noseLengthScore = m.nasalLengthRatio.score100;
    const noseMouthHarmony = Math.round(0.60 * mouthNoseScore + 0.40 * noseLengthScore);

    // 4. Mouth-Chin Harmony (Philtrum height vs Chin prominence)
    const philtrumChinScore = m.philtrumChinRatio.score100;
    const lipRatioScore = m.lipRatio.score100;
    const mouthChinHarmony = Math.round(0.55 * philtrumChinScore + 0.45 * lipRatioScore);

    // 5. Cheekbone-Jaw Harmony (Bigonial to Bizygomatic taper)
    const jawCheekScore = m.jawCheekRatio.score100;
    const fwhrScore = m.fwhr.score100;
    const cheekboneJawHarmony = Math.round(0.60 * jawCheekScore + 0.40 * fwhrScore);

    // 6. Jaw-Chin Harmony (Mandibular angle arc and chin symmetry)
    const mandibularTaperScore = m.mandibularTaper.score100;
    const gonialScore = (m.gonialAngle && m.gonialAngle.score100) || mandibularTaperScore;
    const jawChinHarmony = Math.round(0.55 * mandibularTaperScore + 0.45 * gonialScore);


    // 7. Upper-Mid-Lower Proportional Harmony
    const thirdsScore = m.thirds.score100;
    const fifthsScore = m.fifths.score100;
    const midfaceScore = m.midfaceRatio.score100;
    const verticalHorizontalHarmony = Math.round(0.40 * thirdsScore + 0.35 * fifthsScore + 0.25 * midfaceScore);

    // -------------------------------------------------------------
    // Non-linear Cross-Feature Interaction Multipliers
    // -------------------------------------------------------------
    // If both bone frame (fWHR/Jaw) and periorbital (Eyes) are high, positive synergy (+3 to +5)
    // If symmetry is low (< 75), it attenuates the highest feature score
    const baseMean = (
      eyeBrowHarmony +
      eyeNoseHarmony +
      noseMouthHarmony +
      mouthChinHarmony +
      cheekboneJawHarmony +
      jawChinHarmony +
      verticalHorizontalHarmony
    ) / 7;

    const symScore = symRes ? symRes.subTotalScore : 85;
    const symDamping = symScore < 80 ? ((80 - symScore) * 0.25) : 0;

    const bonePeriorbitalSynergy = (fwhrScore > 85 && canthalTiltScore > 85) ? 3.0 : 0;
    const globalHarmonyScore = Math.max(15, Math.min(99, Math.round(baseMean + bonePeriorbitalSynergy - symDamping)));

    return {
      globalHarmonyScore,
      pairHarmonies: {
        eyeBrow: { score: eyeBrowHarmony, nameEn: 'Eye–Brow Congruence', nameRu: 'Гармония глаз и бровей' },
        eyeNose: { score: eyeNoseHarmony, nameEn: 'Eye–Nose Proportions', nameRu: 'Гармония глаз и носа' },
        noseMouth: { score: noseMouthHarmony, nameEn: 'Nose–Mouth Balance', nameRu: 'Баланс носа и губ' },
        mouthChin: { score: mouthChinHarmony, nameEn: 'Mouth–Chin Relationship', nameRu: 'Соотношение губ и подбородка' },
        cheekJaw: { score: cheekboneJawHarmony, nameEn: 'Cheekbone–Jaw Taper', nameRu: 'Конус скул и челюсти' },
        jawChin: { score: jawChinHarmony, nameEn: 'Jaw–Chin Structural Flow', nameRu: 'Структурная дуга челюсти' },
        proportions: { score: verticalHorizontalHarmony, nameEn: 'Vertical & Horizontal Harmony', nameRu: 'Вертикальная и горизонтальная гармония' }
      }
    };
  }
}

window.FeatureIntegrationEngine = FeatureIntegrationEngine;
