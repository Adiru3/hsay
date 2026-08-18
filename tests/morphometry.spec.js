/* Deterministic landmark checks for the 2D image-morphometry layer.
 * Run with: node tests/morphometry.spec.js
 */
const assert = require('node:assert/strict');

global.window = global;
require('../js/reference_data.js');
require('../js/morphometry_2d.js');
require('../js/morphology_3d.js');
require('../js/symmetry.js');

const points = Array.from({ length: 478 }, (_, i) => ({
  x: 40 + (i % 24) * 5,
  y: 30 + Math.floor(i / 24) * 5
}));
const point = (id, x, y) => { points[id] = { x, y }; };

// A finite, neutral synthetic face. The goal is formula regression, not a
// claim that these coordinates represent an anatomical reference face.
point(234, 0, 100); point(454, 200, 100);
point(168, 100, 20); point(9, 100, 20); point(10, 100, 0);
point(13, 100, 120); point(0, 100, 100); point(2, 100, 90); point(152, 100, 180);
point(468, 75, 40); point(473, 125, 40); point(469, 75, 45); point(474, 125, 45);
point(33, 55, 50); point(133, 95, 48); point(362, 105, 48); point(263, 145, 50);
point(159, 75, 35); point(145, 75, 65); point(386, 125, 35); point(374, 125, 65);
point(132, 35, 145); point(361, 165, 145); point(103, 45, 20); point(332, 155, 20);
point(17, 100, 132); point(61, 70, 110); point(291, 130, 110); point(129, 85, 90); point(358, 115, 90);
point(70, 70, 25); point(63, 70, 32); point(66, 80, 28); point(300, 130, 25); point(293, 130, 32); point(296, 120, 28);

const result = Morphometry2DEngine.analyze(points, 'female');

assert.equal(result.metrics.fwhr.rawVal.toFixed(2), '2.00');
assert.equal(result.metrics.midfaceRatio.rawVal.toFixed(2), '1.00');
assert.equal(result.metrics.fwhr.percentile, null);
assert.equal(result.metrics.scleralShow.domain, 'PHOTO PROXY');
assert.equal(result.metrics.hunterEyes.domain, 'PHOTO PROXY');
assert.equal(result.metrics.masculinity.id, 'sexProfileFit');
assert.equal(result.subScores.perceivedAge, null);
assert.ok(Number.isFinite(result.metrics.scleralShow.rawVal));

const meshProxy = Morphology3DEngine.analyze(points, 'female');
assert.equal(meshProxy.score3D, null);
assert.equal(meshProxy.metrics.facialConvexity.score100, null);
assert.equal(meshProxy.metrics.nasalProjection.status, 'NOT_OBSERVABLE');

const symmetryWithoutPixels = SymmetryAnalyzer.analyze(points, null);
assert.equal(symmetryWithoutPixels.metrics.textureSymmetry.status, 'NOT_OBSERVABLE');
assert.equal(symmetryWithoutPixels.metrics.textureSymmetry.score, null);
assert.ok(Number.isFinite(symmetryWithoutPixels.subTotalScore));

console.log('morphometry.spec.js: passed');
