/**
 * HSAY - Monocular 3D DeepScan Morphology Engine
 * Extracts estimated 3D spatial proxies from single 2D monocular photos.
 * 
 * CRITICAL METHODOLOGICAL RULES:
 * 1. Single 2D monocular photographs cannot yield absolute physical metric depths in millimeters
 *    without stereo calibration or a physical fiducial marker.
 * 2. All monocular 3D outputs are dimensionless normalized indices, ratios, or spatial angle estimates.
 * 3. Status is strictly labeled ESTIMATED (or ESTIMATED 3D PROXY) with wider prediction uncertainty.
 * 4. NEVER labeled as SCIENTIFIC / MEASURED.
 */
class Morphology3DEngine {
  /**
   * Evaluates estimated 3D spatial projections from 3D-aligned MediaPipe landmarks
   * @param {Array} landmarks - 478 Landmarks with { x, y, z } coordinates
   * @param {string} gender - 'male' | 'female' | 'universal'
   * @returns {Object} 3D depth parameters, scores, and confidence levels
   */
  static analyze(landmarks, gender = 'male') {
    const pts = landmarks;

    // Reference coronal plane (Tragus / Gonial lateral plane)
    const refZLeft = pts[234].z || 0;
    const refZRight = pts[454].z || 0;
    const planeZ = (refZLeft + refZRight) / 2;

    const faceWidth = Math.hypot(pts[454].x - pts[234].x, pts[454].y - pts[234].y) || 350;
    const intercanthal = Math.hypot(pts[362].x - pts[133].x, pts[362].y - pts[133].y) || 100;

    // 1. Nasal Tip Projection Ratio (Pronasale vs Alar Base relative to Interocular Distance)
    const noseTip = pts[1] || pts[4];
    const subnasale = pts[2];
    const nasalBaseZ = (pts[129].z + pts[358].z) / 2 || 0;
    const rawNasalZSpan = Math.abs((noseTip.z || 0) - nasalBaseZ);
    // Properly scaled dimensionless ratio (0.55 – 0.70 reference range)
    let nasalProjectionRatio = parseFloat((rawNasalZSpan / (intercanthal * 0.1 || 10)).toFixed(2));
    if (nasalProjectionRatio < 0.3 || nasalProjectionRatio > 1.2) {
      nasalProjectionRatio = null;
    }

    // 2. Chin (Pogonion) Anterior Projection Ratio
    const pogonion = pts[199] || pts[152];
    const rawChinZSpan = Math.abs((pogonion.z || 0) - (subnasale.z || 0));
    let chinProjectionRatio = parseFloat((rawChinZSpan / (intercanthal * 0.1 || 10)).toFixed(2));
    if (chinProjectionRatio < 0.2 || chinProjectionRatio > 1.0) {
      chinProjectionRatio = null;
    }

    // 3. Maxillary Support & Orbital Vector Proxy
    const infraorbitalZ = ((pts[145].z || 0) + (pts[374].z || 0)) / 2;
    const corneaZ = ((pts[468].z || 0) + (pts[473].z || 0)) / 2;
    const orbitalZDiff = corneaZ - infraorbitalZ;
    let orbitalVectorDesc = 'Neutral Vector (Est.)';
    if (orbitalZDiff > 0.02) {
      orbitalVectorDesc = 'Negative Vector (Est.)';
    } else if (orbitalZDiff < -0.01) {
      orbitalVectorDesc = 'Positive Vector (Est.)';
    }

    // 4. Supraorbital / Brow Ridge Prominence Ratio
    const glabella = pts[9] || pts[168];
    const rawBrowZSpan = Math.abs((glabella.z || 0) - corneaZ);
    let browProminenceRatio = parseFloat((rawBrowZSpan / (intercanthal * 0.1 || 10)).toFixed(2));
    if (browProminenceRatio < 0.1 || browProminenceRatio > 0.9) {
      browProminenceRatio = null;
    }

    // 5. Malar / Cheekbone Prominence Ratio (Zygion depth relative to coronal plane)
    const cheekL = pts[116], cheekR = pts[345];
    const cheekDepthAvg = ((cheekL.z || 0) + (cheekR.z || 0)) / 2;
    const malarDepthZ = Math.abs(cheekDepthAvg - planeZ);
    let malarProminenceRatio = parseFloat((malarDepthZ / (faceWidth * 0.05 || 15)).toFixed(2));
    if (malarProminenceRatio < 0.4 || malarProminenceRatio > 1.2) {
      malarProminenceRatio = null;
    }

    // 6. Estimated Facial Convexity Angle (G - Sn - Pog in 3D Landmark Space)
    const v1 = { x: glabella.x - subnasale.x, y: glabella.y - subnasale.y, z: (glabella.z || 0) - (subnasale.z || 0) };
    const v2 = { x: pogonion.x - subnasale.x, y: pogonion.y - subnasale.y, z: (pogonion.z || 0) - (subnasale.z || 0) };
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.hypot(v1.x, v1.y, v1.z) || 1;
    const mag2 = Math.hypot(v2.x, v2.y, v2.z) || 1;
    const convexityRad = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
    const facialConvexityDeg = parseFloat(((convexityRad * 180) / Math.PI).toFixed(1));

    // The MediaPipe depth channel is a monocular mesh proxy, not a calibrated
    // anatomical depth measurement.  Expose a value when finite, but do not
    // manufacture a normative score from a population table.
    const proxyMetric = (id, val) => {
      if (!Number.isFinite(val)) {
        return {
          id,
          rawVal: null,
          score100: null,
          status: 'NOT_OBSERVABLE',
          domain: 'ESTIMATED 3D',
          referenceRange: 'Unavailable from this image',
          confidence: 0
        };
      }
      return {
        id,
        rawVal: val,
        score100: null,
        status: 'ESTIMATED',
        domain: 'ESTIMATED 3D',
        referenceRange: 'Single-image mesh proxy; no population target',
        confidence: 35
      };
    };

    const metrics = {
      facialConvexity: {
        ...proxyMetric('facialConvexity', facialConvexityDeg)
      },
      nasalProjection: {
        ...proxyMetric('nasalProjectionIndex3D', nasalProjectionRatio)
      },
      chinProjection: {
        ...proxyMetric('chinProjectionIndex3D', chinProjectionRatio)
      },
      malarProminence: {
        ...proxyMetric('malarProminenceIndex3D', malarProminenceRatio)
      }
    };

    return {
      domain: 'ESTIMATED 3D',
      status: 'ESTIMATED',
      confidence: 68,
      depths: {
        nasalProjectionIndex: Number.isFinite(nasalProjectionRatio) ? `${nasalProjectionRatio} (Ratio)` : 'Unavailable',
        chinProjectionIndex: Number.isFinite(chinProjectionRatio) ? `${chinProjectionRatio} (Ratio)` : 'Unavailable',
        orbitalVectorDesc: orbitalVectorDesc,
        browProminenceIndex: Number.isFinite(browProminenceRatio) ? `${browProminenceRatio} (Ratio)` : 'Unavailable',
        malarProminenceIndex: Number.isFinite(malarProminenceRatio) ? `${malarProminenceRatio} (Ratio)` : 'Unavailable',
        facialConvexityDeg: `${facialConvexityDeg}° (3D Est.)`
      },
      metrics,
      score3D: null
    };
  }
}

window.Morphology3DEngine = Morphology3DEngine;
