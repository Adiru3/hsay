/* Deterministic regression checks for the rule-based score layer.
 * Run with: node tests/scoring.spec.js
 */
const assert = require('node:assert/strict');

global.window = global;
global.FeatureIntegrationEngine = {
  evaluateHarmony: () => ({ globalHarmonyScore: 80 })
};
require('../js/scoring.js');
require('../js/reference_data.js');

const metric = score100 => ({ score100 });
const morphometry = (dimorphism = 70) => ({
  subScores: {
    periorbital: 70,
    craniofacial: 70,
    dimorphism,
    youthfulness: 70,
    perceivedAge: null
  },
  metrics: {
    mandibularTaper: metric(70),
    jawCheekRatio: metric(70),
    chinFaceRatio: metric(70),
    hunterEyes: metric(60),
    scleralShow: metric(80),
    fwhr: metric(70),
    midfaceRatio: metric(70),
    thirds: metric(70),
    fifths: metric(70),
    mouthNoseRatio: metric(70)
  }
});

const skin = { subTotalScore: 70, status: 'MEASURED', metrics: { darkCircles: { score: 80 } } };
const symmetry = { subTotalScore: 70, scoreStructural: 80, metrics: {} };
const photoQuality = { photoReliability: 50, confidenceRating: 'LOW' };

const baseline = AttractivenessScorer.calculateFrontal(
  morphometry(), null, skin, symmetry, null, null, photoQuality, { configurationScore: 80 }
);

assert.equal(baseline.scientific.score, 73);
assert.equal(baseline.sexual.score, 70);
assert.equal(baseline.psl.score, 6.5);
assert.equal(baseline.psl.percentile, null);
assert.equal(baseline.scientific.percentile, null);
assert.equal(baseline.scientific.confidence, 50);
assert.equal(baseline.potential.delta, 13);
assert.equal(baseline.potential.photoCeiling, 86);
assert.equal(baseline.potential.humanAppearanceMaximum, null);
assert.equal(baseline.psl.modules.eyeGeometry.weight, '16.7%');
assert.equal(baseline.coverage.items.find(item => item.id === 'frontal_geometry').status, 'OBSERVED');
assert.equal(baseline.coverage.items.find(item => item.id === 'profile_geometry').status, 'MISSING_INPUT');
assert.equal(baseline.coverage.items.find(item => item.id === 'human_preference').status, 'NOT_MEASURABLE');
assert.ok(baseline.recommendations.some(rec => rec.id === 'rec_missing_profile'));
for (const key of ['configuration', 'anthro', 'periorbital', 'skin', 'symmetry', 'harmony']) {
  assert.equal(baseline.modules[key].weight, '16.7%');
}
assert.equal(
  baseline.psl.index,
  Number((Object.values(baseline.psl.modules).reduce((sum, module) => sum + module.score, 0) / 6).toFixed(1))
);

const changedConfiguration = AttractivenessScorer.calculateFrontal(
  morphometry(), null, skin, symmetry, null, null, photoQuality, { configurationScore: 20 }
);
assert.ok(changedConfiguration.scientific.score < baseline.scientific.score);
assert.equal(changedConfiguration.psl.score, baseline.psl.score);

const moreDimorphic = AttractivenessScorer.calculateFrontal(
  morphometry(100), null, skin, symmetry, null, null, photoQuality, { configurationScore: 80 }
);

// No discontinuous +0.3 bonus and no hidden change to Model A.
assert.equal(moreDimorphic.scientific.score, baseline.scientific.score);
assert.ok(moreDimorphic.psl.score > baseline.psl.score);
assert.ok(moreDimorphic.psl.score - baseline.psl.score < 0.5);

const profileMetrics = Object.fromEntries(
  ['gonialAngle', 'ramusIndex', 'eline', 'cervicomental', 'convexity', 'nasolabial', 'orbitalVector']
    .map(key => [key, { score: 70, score100: 70 }])
);
const profile = AttractivenessScorer.calculateProfile({ subTotalScore: 70, metrics: profileMetrics }, photoQuality);
assert.equal(profile.scientific.confidence, 50);
assert.equal(profile.sexual.percentile, null);
assert.deepEqual(Object.values(profile.psl.modules).map(module => module.weight), Array(6).fill('16.7%'));
assert.equal(profile.coverage.items.find(item => item.id === 'frontal_geometry').status, 'MISSING_INPUT');
assert.ok(profile.recommendations.some(rec => rec.id === 'rec_missing_frontal'));

const composite = AttractivenessScorer.calculateComposite(baseline, profile);
assert.equal(composite.scientific.percentile, null);
assert.ok(composite.psl.score >= 1 && composite.psl.score <= 9);
assert.equal(composite.coverage.items.find(item => item.id === 'frontal_geometry').status, 'OBSERVED');
assert.equal(composite.coverage.items.find(item => item.id === 'profile_geometry').status, 'OBSERVED');

// Reference intervals can guide a heuristic score, but must not masquerade
// as a calibrated population position without an image-measurement cohort.
const referenceProbe = PopulationReferenceDB.evaluate('fwhr', 1.88, 'universal');
assert.equal(referenceProbe.percentile, null);
assert.equal(referenceProbe.zScore, null);
assert.ok(referenceProbe.score100 >= 15 && referenceProbe.score100 <= 94);

console.log('scoring.spec.js: passed');
