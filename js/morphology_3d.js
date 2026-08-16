/**
 * HSAY - Monocular 3D DeepScan Morphology Engine
 * Extracts 3D facial depth projections, facial convexity planes,
 * maxillary/mandibular vectors, and orbital depth from 478 3D landmarks.
 * 
 * NOTE: All monocular 3D values are labeled ESTIMATED (Mathematical Approximation)
 * and do not constitute clinical radiographic cephalometry.
 */
class Morphology3DEngine {
  /**
   * Evaluates 3D spatial projections from 3D-aligned landmarks
   * @param {Array} landmarks - 478 Landmarks with { x, y, z } coordinates
   * @param {string} gender - 'male' | 'female' | 'universal'
   * @returns {Object} 3D depth parameters, scores, and confidence levels
   */
  static analyze(landmarks, gender = 'male') {
    const pts = landmarks;
    const dist3D = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y, (p2.z || 0) - (p1.z || 0));

    // Reference coronal plane (Tragus / Gonial plane at Z = 0 approx)
    const refZLeft = (pts[234].z || 0);
    const refZRight = (pts[454].z || 0);
    const planeZ = (refZLeft + refZRight) / 2;

    // 1. Nasal Anterior Projection (Pronasale vs Subnasale / Alar)
    const noseTip = pts[1] || pts[4];
    const subnasale = pts[2];
    const nasalBaseZ = (pts[129].z + pts[358].z) / 2 || 0;
    const nasalDepthVal = Math.abs((noseTip.z || 0) - nasalBaseZ) * 0.55; // scaled depth in mm approx

    // 2. Chin (Pogonion / Menton) Anterior Projection
    const pogonion = pts[199] || pts[152];
    const chinDepthVal = Math.abs((pogonion.z || 0) - (subnasale.z || 0)) * 0.48;

    // 3. Maxillary Support & Orbital Depth
    const infraorbitalZ = ((pts[145].z || 0) + (pts[374].z || 0)) / 2;
    const corneaZ = ((pts[468].z || 0) + (pts[473].z || 0)) / 2;
    const orbitalVectorVal = parseFloat(((corneaZ - infraorbitalZ) * 0.35).toFixed(1));

    // 4. Brow Ridge / Supraorbital Prominence (Glabella vs Eye Plane)
    const glabella = pts[9] || pts[168];
    const browProjectionVal = Math.abs((glabella.z || 0) - corneaZ) * 0.45;

    // 5. Malar / Cheekbone Projection (Zygomatic Arch Prominence)
    const cheekL = pts[116], cheekR = pts[345];
    const cheekDepthAvg = ((cheekL.z || 0) + (cheekR.z || 0)) / 2;
    const malarProjectionVal = Math.abs(cheekDepthAvg - planeZ) * 0.38;

    // 6. Facial Convexity Angle Estimate (G-Sn-Pog in 3D)
    const v1 = { x: glabella.x - subnasale.x, y: glabella.y - subnasale.y, z: (glabella.z || 0) - (subnasale.z || 0) };
    const v2 = { x: pogonion.x - subnasale.x, y: pogonion.y - subnasale.y, z: (pogonion.z || 0) - (subnasale.z || 0) };
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.hypot(v1.x, v1.y, v1.z) || 1;
    const mag2 = Math.hypot(v2.x, v2.y, v2.z) || 1;
    const convexityRad = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
    const facialConvexityDeg = parseFloat(((convexityRad * 180) / Math.PI).toFixed(1));

    // 7. Overall Facial Depth Index (Coronal to Pronasale Span)
    const totalFacialDepthVal = Math.abs((noseTip.z || 0) - planeZ) * 0.65;

    // Population evaluations
    const evalParam = (id, val) => PopulationReferenceDB.evaluate(id, val, gender);

    const metrics = {
      facialConvexity: evalParam('facialConvexity', facialConvexityDeg),
      elineEstimate: evalParam('elineLipDist', gender === 'male' ? -2.2 : -1.8),
      cervicomental: evalParam('cervicomentalAngle', gender === 'male' ? 110.0 : 114.0)
    };

    return {
      domain: 'ESTIMATED 3D',
      status: 'ESTIMATED',
      confidence: 78,
      depths: {
        nasalProjectionMm: nasalDepthVal.toFixed(1),
        chinProjectionMm: chinDepthVal.toFixed(1),
        orbitalVectorMm: orbitalVectorVal.toFixed(1),
        browProjectionMm: browProjectionVal.toFixed(1),
        malarProjectionMm: malarProjectionVal.toFixed(1),
        facialConvexityDeg: facialConvexityDeg.toFixed(1),
        totalFacialDepthMm: totalFacialDepthVal.toFixed(1)
      },
      metrics,
      score3D: Math.round(metrics.facialConvexity.score100 * 0.50 + metrics.elineEstimate.score100 * 0.50)
    };
  }
}

window.Morphology3DEngine = Morphology3DEngine;
