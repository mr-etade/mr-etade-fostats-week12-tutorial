/* ==========================================================
   Linear Regression II — Tutorial JavaScript
   Week 12 · CMN112/CMP112/CBS102
   Mirrors the structure of the Week 10 tutorial.
   ========================================================== */

// =====================================================
// COLOUR PALETTE
// =====================================================
const COLORS = {
  cream:  '#fefdfa',
  paper:  '#f6f1e6',
  ink:    '#1a1a1c',
  red:    '#ff2e20',
  yellow: '#ffd966',
  green:  '#86cf64',
  blue:   '#04b4d8',
  muted:  '#7a7a80'
};

// =====================================================
// PROGRESS TRACKING (localStorage)
// =====================================================
const STORAGE_KEY = 'wpu_stats_tutorial_w12';

function getProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function setProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function markQuestionAnswered(sectionId, qNum, correct) {
  const p = getProgress();
  if (!p[sectionId]) p[sectionId] = {};
  p[sectionId][qNum] = { correct, ts: Date.now() };
  setProgress(p);
}

function getSectionStatus(sectionId, totalQs) {
  const p = getProgress();
  const sect = p[sectionId];
  if (!sect) return { status: 'not-started', count: 0, total: totalQs };
  const answered = Object.keys(sect).length;
  const correct = Object.values(sect).filter(v => v.correct).length;
  if (answered === 0) return { status: 'not-started', count: 0, total: totalQs };
  if (correct === totalQs) return { status: 'complete', count: correct, total: totalQs };
  return { status: 'in-progress', count: correct, total: totalQs };
}

const SECTION_QUESTION_COUNTS = { 1: 3, 2: 3, 3: 3, 4: 3 };
const TOTAL_SECTIONS = 4;

function updateLandingProgress() {
  let completedSections = 0;
  Object.keys(SECTION_QUESTION_COUNTS).forEach(sid => {
    const total = SECTION_QUESTION_COUNTS[sid];
    const { status, count } = getSectionStatus(sid, total);
    const el = document.getElementById('status-' + sid);
    if (!el) return;
    el.classList.remove('complete', 'in-progress');
    if (status === 'complete') {
      el.textContent = 'Complete';
      el.classList.add('complete');
      completedSections++;
    } else if (status === 'in-progress') {
      el.textContent = `In progress · ${count}/${total}`;
      el.classList.add('in-progress');
    } else {
      el.textContent = 'Not started';
    }
  });

  const bar = document.getElementById('overallProgress');
  const text = document.getElementById('progressCount');
  if (bar) bar.style.width = (completedSections / TOTAL_SECTIONS * 100) + '%';
  if (text) text.textContent = completedSections;
}

// =====================================================
// MATH RENDER HELPER
// =====================================================
function rerenderMath(el) {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise(el ? [el] : undefined).catch(() => {});
  }
}

// =====================================================
// FEEDBACK BANK
// =====================================================
const FEEDBACK = {
  // ------------ SECTION 1: Pearson's r ------------
  's1-q1': {
    correctMsg: "Yes — $r \\approx 0.960$, a very strong positive linear relationship.",
    wrongMsg: "Walk through the column sums again — small slips compound through the formula.",
    workingHTML: `
      <strong class="label">The column sums</strong>
      <div class="working">
        <p>$n = 6$, &nbsp; $\\sum x = 42$, &nbsp; $\\sum y = 51$</p>
        <p>$\\sum xy = 422$, &nbsp; $\\sum x^2 = 364$, &nbsp; $\\sum y^2 = 499$</p>
      </div>
      <strong class="label">Numerator</strong>
      <div class="working">
        <p>$n\\sum xy - \\sum x \\sum y = 6(422) - (42)(51) = 2532 - 2142 = 390$</p>
      </div>
      <strong class="label">Denominator pieces</strong>
      <div class="working">
        <p>$n\\sum x^2 - (\\sum x)^2 = 6(364) - 42^2 = 2184 - 1764 = 420$</p>
        <p>$n\\sum y^2 - (\\sum y)^2 = 6(499) - 51^2 = 2994 - 2601 = 393$</p>
        <p>$\\sqrt{420 \\times 393} = \\sqrt{165{,}060} \\approx 406.28$</p>
      </div>
      <strong class="label">Putting it together</strong>
      <div class="working">
        <p>$r = \\dfrac{390}{406.28} \\approx 0.960$</p>
      </div>
      <p>Interpretation: a <strong>very strong positive</strong> linear relationship between training hours and vulnerabilities reported. Lesson: $\\sum y^2$ is the most error-prone column — double-check it before substituting.</p>`
  },

  's1-q2': {
    correctMsg: "Right — $r$ has the same sign as the slope, is bounded by $\\pm 1$, and is unit-free.",
    wrongMsg: "Re-read what $r$ measures versus what the slope $m$ measures.",
    workingHTML: `
      <strong class="label">Three things to remember about $r$</strong>
      <p><strong>1. Sign:</strong> $r$ has the same sign as the slope $m$. If $m > 0$, then $r > 0$; if $m < 0$, then $r < 0$.</p>
      <p><strong>2. Bounded:</strong> $-1 \\leq r \\leq +1$, always. If you compute $|r| > 1$, you have an arithmetic error.</p>
      <p><strong>3. Unit-free:</strong> $r$ is dimensionless. Changing units (e.g. response time in seconds vs milliseconds) doesn't change $r$.</p>
      <strong class="label">Why option D is wrong</strong>
      <p>$r = 0$ only rules out a <em>linear</em> relationship. A perfect $y = x^2$ curve (over a symmetric $x$-range) can give $r \\approx 0$ even though $y$ is completely determined by $x$. This is the classic reason to always plot the data alongside computing $r$ — a single number can hide a strong non-linear pattern.</p>`
  },

  's1-q3': {
    correctMsg: "Yes — strong negative. The points cluster tightly around a downward line.",
    wrongMsg: "Look at both the direction of the trend and how tightly the points hug it.",
    workingHTML: `
      <strong class="label">Reading the scatter plot</strong>
      <p>The points fall almost on a straight line going from top-left to bottom-right. Two things to note:</p>
      <p><strong>Direction:</strong> $y$ decreases as $x$ increases — that's a <em>negative</em> trend, so $r < 0$.</p>
      <p><strong>Strength:</strong> the points hug the line very tightly — almost no scatter. That's a <em>strong</em> relationship, so $|r|$ is close to 1.</p>
      <strong class="label">Sign × strength</strong>
      <p>Negative direction × strong cluster ⇒ $r \\approx -0.95$ (strong negative). For comparison:</p>
      <p>• $r \\approx +0.95$: strong positive (upward, tight)</p>
      <p>• $r \\approx -0.30$: weak negative (downward, very scattered)</p>
      <p>• $r \\approx 0$: no linear trend (cloud, or curved pattern)</p>`
  },

  // ------------ SECTION 2: R-squared ------------
  's2-q1': {
    correctMsg: "Right — $R^2 = r^2 = (-0.82)^2 \\approx 0.672$, or 67.2%.",
    wrongMsg: "Don't carry the sign into $R^2$ — squaring removes it.",
    workingHTML: `
      <strong class="label">The relationship</strong>
      <div class="working">
        <p>$R^2 = r^2$</p>
        <p>$R^2 = (-0.82)^2 = 0.6724$</p>
        <p>Round to 3 d.p.: $R^2 = 0.672$, or 67.2%.</p>
      </div>
      <strong class="label">Why the sign disappears</strong>
      <p>Squaring always gives a non-negative result. That's why $R^2 \\in [0, 1]$ — it loses the sign information but gains the "proportion of variance explained" interpretation.</p>
      <p>If you reported $R^2 = -0.672$ or $R^2 = 0.82$, you've confused $r$ with $R^2$. They are different things — $r$ tells you direction and strength; $R^2$ tells you proportion of variation explained.</p>`
  },

  's2-q2': {
    correctMsg: "Yes — 68.4% of the variation in defects is explained by code review time.",
    wrongMsg: "Re-read the standard interpretation of $R^2$ — it's about variation in $y$, not $x$.",
    workingHTML: `
      <strong class="label">The standard sentence</strong>
      <p>"About $R^2 \\times 100$% of the variation in the <em>dependent variable</em> ($y$) is explained by the linear relationship with the <em>independent variable</em> ($x$). The remaining $(1-R^2) \\times 100$% is due to other factors not in the model."</p>
      <strong class="label">For this scenario</strong>
      <p>$y$ = number of defects found, &nbsp; $x$ = code review time (minutes).</p>
      <p>$R^2 = 0.684$ ⇒ "About <strong>68.4%</strong> of the variation in the number of defects found is explained by code review time. The remaining 31.6% is due to other factors — reviewer experience, code complexity, defect type, and so on."</p>
      <strong class="label">Common slip</strong>
      <p>Saying "68.4% of the variation in <em>review time</em> is explained by defects" flips the predictive direction. Once you've chosen which variable is $y$ and which is $x$, $R^2$ always describes variation in $y$.</p>`
  },

  's2-q3': {
    correctMsg: "Correct — high $R^2$ does not prove the model is appropriate.",
    wrongMsg: "Read the options carefully — which one is the assumption that can fail even with a tight fit?",
    workingHTML: `
      <strong class="label">What $R^2$ does — and doesn't — tell you</strong>
      <p>$R^2$ measures how much of the variation in $y$ is captured by the fitted line, <em>within the observed data range</em>. A high $R^2$ means the line fits the data tightly. It does NOT mean:</p>
      <p>• The relationship is causal (lurking variables can produce tight correlations).</p>
      <p>• The relationship is genuinely linear (a curve over a small $x$-range can look very linear with a high $R^2$ — but extrapolation will fail badly).</p>
      <p>• The model will predict well outside the data range.</p>
      <strong class="label">The fix</strong>
      <p>Always check the <strong>residual plot</strong>. If the residuals show a clear curve or funnel, the linear model is the wrong tool — even if $R^2$ is high.</p>
      <p>This is why our 7-step procedure puts "check residuals" (step 6) <em>after</em> computing $r$ and $R^2$ (step 5).</p>`
  },

  // ------------ SECTION 3: Residuals + Causation ------------
  's3-q1': {
    correctMsg: "Right — a curved pattern in the residuals signals a non-linear relationship.",
    wrongMsg: "Recall what each residual plot pattern tells you about the model.",
    workingHTML: `
      <strong class="label">Reading residual plots</strong>
      <p><strong>Random scatter</strong> around zero ⇒ linear model is appropriate. Good.</p>
      <p><strong>Curved pattern</strong> (U-shape, arch) ⇒ the line is missing curvature in the data. A non-linear model (quadratic, log, exponential) is needed.</p>
      <p><strong>Funnel shape</strong> (residuals spread out as $x$ grows) ⇒ heteroscedasticity. The variance of $y$ depends on $x$. The line itself may still be the right shape, but inference (CIs, $t$-tests on the slope) becomes unreliable.</p>
      <p><strong>Outliers</strong> (one or two points far from the rest) ⇒ check for data-entry errors or genuinely unusual cases that may need separate treatment.</p>
      <strong class="label">For this question</strong>
      <p>A clear U-shape means: yes, a line passes through the data, but it systematically over-predicts in the middle and under-predicts at the ends (or vice versa). A non-linear model would fit better.</p>`
  },

  's3-q2': {
    correctMsg: "Right — the lurking variable (server load / outages) drives both.",
    wrongMsg: "Look for a third variable that could plausibly cause both observed variables.",
    workingHTML: `
      <strong class="label">The classic lurking-variable trap</strong>
      <p>Two variables are strongly correlated. Does one cause the other? Often, neither — they're both caused by a third, hidden variable.</p>
      <strong class="label">For this scenario</strong>
      <p>Failed login attempts and customer support tickets both spike together. It's tempting to say one causes the other, but the more likely story is:</p>
      <p>• Server load / outage events → users can't log in → failed login attempts go up.</p>
      <p>• Server load / outage events → users can't access services → support tickets go up.</p>
      <p>Server-side issues drive both, even though the two observed variables have no direct causal link. That's the lurking variable.</p>
      <strong class="label">The takeaway</strong>
      <p>"Correlation is not causation" is shorthand for: a high $r$ tells you the variables move together, but says nothing about <em>why</em>. Establishing causation requires controlled experiments, randomised trials, or careful causal-inference techniques — not just correlation analysis.</p>`
  },

  's3-q3': {
    correctMsg: "Yes — that's the funnel pattern, the visual signature of heteroscedasticity.",
    wrongMsg: "Match the verbal description to the diagnostic pattern.",
    workingHTML: `
      <strong class="label">Spotting heteroscedasticity</strong>
      <p>Heteroscedasticity = "different scatter". In a good linear-regression setup, the residuals should have <em>constant</em> spread across all values of $x$ (homoscedasticity).</p>
      <p>If the residuals fan out (funnel widens to the right) or fan in (funnel narrows), that's a violation. The line itself may still be fine for prediction, but:</p>
      <p>• Standard errors of the slope become unreliable.</p>
      <p>• Confidence intervals are too narrow or too wide.</p>
      <p>• The $t$-test on the slope can give misleading $p$-values.</p>
      <strong class="label">For this IT context</strong>
      <p>If response times become more variable as concurrent users increase (a "funnel"), it makes intuitive sense — a heavily loaded server behaves erratically. The linear trend may still hold on average, but predictions at high loads will have much wider uncertainty than predictions at low loads.</p>
      <p>Common remedies: log-transform $y$, use weighted least squares, or model the variance explicitly.</p>`
  },

  // ------------ SECTION 4: Slope inference walkthrough ------------
  'p1-s1': {
    correctMsg: "Right — testing whether the slope is zero is a two-tailed test by default.",
    wrongMsg: "Re-read the hypotheses for the slope in regression inference.",
    workingHTML: `
      <strong class="label">Default hypotheses for the slope</strong>
      <div class="working">
        <p>$H_0: \\beta_1 = 0$ &nbsp; (no linear relationship between $x$ and $y$ in the population)</p>
        <p>$H_a: \\beta_1 \\neq 0$ &nbsp; (a linear relationship exists, direction unspecified)</p>
      </div>
      <strong class="label">Why two-tailed</strong>
      <p>Unless the question gives you a prior directional belief ("the IT manager believes training <em>reduces</em> incidents"), the standard test on the slope is two-tailed. We're asking the open question: "is there <em>any</em> linear relationship?" — not "is it positive?" or "is it negative?"</p>
      <p>If the question had said "test whether training hours <em>reduce</em> failures", that would be left-tailed: $H_a: \\beta_1 < 0$.</p>`
  },

  'p1-s2': {
    correctMsg: "Yes — $|t| \\approx 5.07$, well above any standard critical value at $df = 8$.",
    wrongMsg: "Recheck the arithmetic — small mistakes in $\\text{SE}(m)$ get amplified.",
    workingHTML: `
      <strong class="label">The formula</strong>
      <div class="working">
        <p>$t = \\dfrac{m}{\\text{SE}(m)}$</p>
      </div>
      <strong class="label">Substituting the given values</strong>
      <div class="working">
        <p>$m = -3.10$, &nbsp; $\\text{SE}(m) = 0.612$</p>
        <p>$t = \\dfrac{-3.10}{0.612} \\approx -5.07$</p>
      </div>
      <p>The question asked for the magnitude, so $|t| \\approx 5.07$. (The negative sign reflects the negative slope — more training hours, fewer phishing-test failures.)</p>
      <strong class="label">Sanity check</strong>
      <p>With $n = 10$ and $df = 8$, the critical value at $\\alpha = 0.05$ (two-tailed) is $t_{0.025,\\,8} = 2.306$. Our $|t| = 5.07$ is well above this — that already tells us we'll reject $H_0$ at the next step.</p>`
  },

  'p1-s3': {
    correctMsg: "Right — $|t| = 5.07 > 2.306$, so we reject $H_0$.",
    wrongMsg: "Compare $|t|$ to the critical value and write the conclusion in context.",
    workingHTML: `
      <strong class="label">The decision</strong>
      <div class="working">
        <p>Critical value: $t_{0.025,\\,8} = 2.306$ &nbsp; (two-tailed, $df = n - 2 = 8$)</p>
        <p>Test statistic: $|t| = 5.07$</p>
        <p>$5.07 > 2.306$ &nbsp; ⇒ &nbsp; reject $H_0$.</p>
      </div>
      <strong class="label">Contextual conclusion</strong>
      <p>"At the 5% significance level, there is strong evidence that cybersecurity training hours and the number of phishing-test failures are linearly related. The estimated slope $m = -3.10$ suggests that, on average, each additional hour of training is associated with about 3 fewer phishing-test failures."</p>
      <strong class="label">What to be careful about</strong>
      <p>The hypothesis test tells us the relationship is statistically significant — meaning it's unlikely to be a fluke. It does <em>not</em> by itself prove causation. To claim that training <em>causes</em> the drop in failures, we'd need a controlled experiment (random assignment, control group, etc.) — not just an observational dataset.</p>
      <p>Also: the 95% CI for $\\beta_1$ would be $-3.10 \\pm 2.306 \\times 0.612 = (-4.51, -1.69)$. Since 0 is not in the interval, this confirms the test's conclusion.</p>`
  }
};

// =====================================================
// QUESTION-CHECKING ENGINE
// =====================================================
function initQuestions(sectionId) {
  document.querySelectorAll('.question, .wt-step').forEach(qEl => {
    const btn = qEl.querySelector('.btn-check');
    if (!btn) return;
    btn.addEventListener('click', () => checkQuestion(qEl, sectionId));
  });
}

function getFeedbackKey(qEl, sectionId) {
  if (qEl.classList.contains('wt-step')) {
    const problemId = qEl.closest('.walkthrough').id.replace('problem', '');
    return `p${problemId}-s${qEl.dataset.step}`;
  }
  return `s${sectionId}-q${qEl.dataset.q}`;
}

function checkQuestion(qEl, sectionId) {
  let allCorrect = true;
  let anyAnswered = false;

  qEl.querySelectorAll('.numeric-input').forEach(input => {
    const target = parseFloat(input.dataset.answer);
    const tol = parseFloat(input.dataset.tolerance) || 0.01;
    const val = parseFloat(input.value);
    input.style.borderColor = '';
    if (isNaN(val)) {
      allCorrect = false;
      input.style.borderColor = COLORS.red;
      return;
    }
    anyAnswered = true;
    if (Math.abs(val - target) <= tol) {
      input.style.borderColor = COLORS.green;
    } else {
      allCorrect = false;
      input.style.borderColor = COLORS.red;
    }
  });

  qEl.querySelectorAll('.match-select').forEach(sel => {
    const expected = sel.dataset.answer;
    const val = sel.value;
    sel.style.borderColor = '';
    if (!val) {
      allCorrect = false;
      sel.style.borderColor = COLORS.red;
      return;
    }
    anyAnswered = true;
    if (val === expected) {
      sel.style.borderColor = COLORS.green;
    } else {
      allCorrect = false;
      sel.style.borderColor = COLORS.red;
    }
  });

  qEl.querySelectorAll('.mc-options').forEach(group => {
    const correct = group.dataset.correct;
    const checked = group.querySelector('input[type="radio"]:checked');
    group.querySelectorAll('.mc-option').forEach(o => {
      o.classList.remove('correct-answer', 'wrong-answer');
    });
    if (!checked) {
      allCorrect = false;
      return;
    }
    anyAnswered = true;
    const chosenLabel = checked.closest('.mc-option');
    if (checked.value === correct) {
      chosenLabel.classList.add('correct-answer');
    } else {
      allCorrect = false;
      chosenLabel.classList.add('wrong-answer');
      const correctInput = group.querySelector(`input[value="${correct}"]`);
      if (correctInput) correctInput.closest('.mc-option').classList.add('correct-answer');
    }
  });

  if (!anyAnswered) {
    showFeedback(qEl, 'partial', 'Take a swing first', '<p>Have a go at the question first, then check.</p>');
    return;
  }

  qEl.classList.remove('correct', 'incorrect');
  const fbKey = getFeedbackKey(qEl, sectionId);
  const fbData = FEEDBACK[fbKey] || {
    correctMsg: 'You got it.',
    wrongMsg: 'Have another look.',
    workingHTML: ''
  };

  if (allCorrect) {
    qEl.classList.add('correct');
    showFeedback(qEl, 'success', 'Right answer',
      `<p>${fbData.correctMsg}</p>${fbData.workingHTML}`);
  } else {
    qEl.classList.add('incorrect');
    showFeedback(qEl, 'error', 'Not quite',
      `<p>${fbData.wrongMsg}</p>${fbData.workingHTML}`);
  }

  const qNum = qEl.dataset.q || qEl.dataset.step;
  if (qNum && sectionId) {
    const key = qEl.classList.contains('wt-step')
      ? `p${qEl.closest('.walkthrough').id.replace('problem','')}-s${qNum}`
      : qNum;
    markQuestionAnswered(sectionId, key, allCorrect);
  }

  if (allCorrect && qEl.classList.contains('wt-step')) {
    handleWalkthroughProgression(qEl);
  }
}

function showFeedback(qEl, type, tag, bodyHTML) {
  const fb = qEl.querySelector('.feedback');
  if (!fb) return;
  fb.className = 'feedback show ' + type;
  fb.innerHTML = `
    <span class="feedback-tag">${tag}</span>
    <div class="feedback-body">${bodyHTML}</div>
  `;
  rerenderMath(fb);
}

// =====================================================
// SECTION 1 — PEARSON r EXPLORER
// Adjustable scatter strength + sign, recomputes r live
// =====================================================
function initRExplorer() {
  const strengthInput = document.getElementById('r-strength');
  const signInput = document.getElementById('r-sign');
  const noiseInput = document.getElementById('r-noise');
  if (!strengthInput) return;

  // Fixed x-values; y is generated from a noisy line
  const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // Deterministic noise sequence so dragging the slider gives smooth changes
  const baseNoise = [0.7, -0.5, 0.3, -0.8, 0.6, -0.2, 0.5, -0.7, 0.4, -0.4];

  function update() {
    const strength = +strengthInput.value;
    const sign = signInput.value === '-1' ? -1 : 1;
    const noiseAmount = +noiseInput.value;

    const slope = sign * (strength / 50);
    const noiseScale = noiseAmount / 25;
    const ys = xs.map((x, i) => 5 + slope * x + baseNoise[i] * noiseScale);

    document.getElementById('r-strength-val').textContent = strength;
    document.getElementById('r-sign-val').textContent = sign > 0 ? 'positive' : 'negative';
    document.getElementById('r-noise-val').textContent = noiseAmount;

    const stats = computeStats(xs, ys);
    document.getElementById('r-readout').textContent = stats.r.toFixed(3);
    document.getElementById('r2-readout').textContent = stats.r2.toFixed(3);

    const absR = Math.abs(stats.r);
    let strengthWord;
    if (absR < 0.3) strengthWord = 'weak / none';
    else if (absR < 0.7) strengthWord = 'moderate';
    else if (absR < 0.95) strengthWord = 'strong';
    else strengthWord = 'very strong';
    const direction = stats.r > 0 ? 'positive' : (stats.r < 0 ? 'negative' : '');
    document.getElementById('r-words').textContent =
      stats.r === 0 || isNaN(stats.r) ? '—' : `${strengthWord} ${direction}`;

    drawScatter(xs, ys, stats);
  }

  [strengthInput, signInput, noiseInput].forEach(el => {
    el.addEventListener('input', update);
  });
  update();
}

function computeStats(xs, ys) {
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
  const sumY2 = ys.reduce((acc, y) => acc + y * y, 0);

  const num = n * sumXY - sumX * sumY;
  const denX = n * sumX2 - sumX * sumX;
  const denY = n * sumY2 - sumY * sumY;
  const denom = Math.sqrt(denX * denY);

  const r = denom === 0 ? 0 : num / denom;
  const r2 = r * r;
  const m = denX === 0 ? 0 : num / denX;
  const c = (sumY - m * sumX) / n;

  return { r, r2, m, c, n, sumX, sumY, sumXY, sumX2, sumY2 };
}

function drawScatter(xs, ys, stats) {
  const svg = document.getElementById('r-svg');
  if (!svg) return;
  svg.innerHTML = '';
  const W = 500, H = 280;
  const padX = 40, padY = 30;
  const innerW = W - 2 * padX, innerH = H - 2 * padY;

  const xMin = Math.min(...xs) - 0.5;
  const xMax = Math.max(...xs) + 0.5;
  const yMin = Math.min(...ys) - 1;
  const yMax = Math.max(...ys) + 1;

  const xScale = x => padX + (x - xMin) / (xMax - xMin) * innerW;
  const yScale = y => padY + innerH - (y - yMin) / (yMax - yMin) * innerH;

  svgEl(svg, 'line', {
    x1: padX, y1: padY + innerH, x2: W - padX, y2: padY + innerH,
    stroke: COLORS.ink, 'stroke-width': 2
  });
  svgEl(svg, 'line', {
    x1: padX, y1: padY, x2: padX, y2: padY + innerH,
    stroke: COLORS.ink, 'stroke-width': 2
  });
  svgEl(svg, 'text', {
    x: W - padX + 8, y: padY + innerH + 5, fill: COLORS.ink,
    'font-size': '14', 'font-style': 'italic',
    'font-family': 'Fraunces, serif', 'font-weight': '700'
  }, 'x');
  svgEl(svg, 'text', {
    x: padX - 8, y: padY - 6, fill: COLORS.ink,
    'font-size': '14', 'font-style': 'italic', 'text-anchor': 'middle',
    'font-family': 'Fraunces, serif', 'font-weight': '700'
  }, 'y');

  const lineX1 = xMin + 0.3;
  const lineX2 = xMax - 0.3;
  const lineY1 = stats.m * lineX1 + stats.c;
  const lineY2 = stats.m * lineX2 + stats.c;
  svgEl(svg, 'line', {
    x1: xScale(lineX1), y1: yScale(lineY1),
    x2: xScale(lineX2), y2: yScale(lineY2),
    stroke: COLORS.blue, 'stroke-width': 3
  });

  xs.forEach((x, i) => {
    svgEl(svg, 'circle', {
      cx: xScale(x), cy: yScale(ys[i]),
      r: 5, fill: COLORS.yellow,
      stroke: COLORS.ink, 'stroke-width': 2
    });
  });
}

// =====================================================
// SECTION 2 — R-SQUARED DECOMPOSITION EXPLORER
// =====================================================
function initR2Explorer() {
  const slopeInput = document.getElementById('r2-slope');
  const interceptInput = document.getElementById('r2-intercept');
  if (!slopeInput) return;

  const xs = [1, 2, 3, 4, 5, 6, 7, 8];
  const ys = [4.5, 5.8, 6.2, 7.9, 8.1, 9.6, 10.3, 11.2];
  const yBar = ys.reduce((a, b) => a + b, 0) / ys.length;

  function update() {
    const m = +slopeInput.value;
    const c = +interceptInput.value;

    document.getElementById('r2-slope-val').textContent = m.toFixed(2);
    document.getElementById('r2-intercept-val').textContent = c.toFixed(2);

    const yHats = xs.map(x => m * x + c);
    const ssRes = xs.reduce((acc, x, i) => acc + Math.pow(ys[i] - yHats[i], 2), 0);
    const ssTot = ys.reduce((acc, y) => acc + Math.pow(y - yBar, 2), 0);
    const r2 = 1 - ssRes / ssTot;

    document.getElementById('r2-ssres').textContent = ssRes.toFixed(2);
    document.getElementById('r2-sstot').textContent = ssTot.toFixed(2);
    document.getElementById('r2-value').textContent = (r2 < 0 ? '< 0' : r2.toFixed(3));

    drawR2Decomposition(xs, ys, yHats, yBar, m, c);
  }

  [slopeInput, interceptInput].forEach(el => {
    el.addEventListener('input', update);
  });
  update();

  const autoFitBtn = document.getElementById('r2-autofit');
  if (autoFitBtn) {
    autoFitBtn.addEventListener('click', () => {
      const stats = computeStats(xs, ys);
      slopeInput.value = stats.m.toFixed(2);
      interceptInput.value = stats.c.toFixed(2);
      update();
    });
  }
}

function drawR2Decomposition(xs, ys, yHats, yBar, m, c) {
  const svg = document.getElementById('r2-svg');
  if (!svg) return;
  svg.innerHTML = '';
  const W = 500, H = 320;
  const padX = 40, padY = 30;
  const innerW = W - 2 * padX, innerH = H - 2 * padY;

  const xMin = 0, xMax = 9;
  const yMin = 0, yMax = 14;
  const xScale = x => padX + (x - xMin) / (xMax - xMin) * innerW;
  const yScale = y => padY + innerH - (y - yMin) / (yMax - yMin) * innerH;

  svgEl(svg, 'line', {
    x1: padX, y1: padY + innerH, x2: W - padX, y2: padY + innerH,
    stroke: COLORS.ink, 'stroke-width': 2
  });
  svgEl(svg, 'line', {
    x1: padX, y1: padY, x2: padX, y2: padY + innerH,
    stroke: COLORS.ink, 'stroke-width': 2
  });

  svgEl(svg, 'line', {
    x1: padX, y1: yScale(yBar), x2: W - padX, y2: yScale(yBar),
    stroke: COLORS.muted, 'stroke-width': 2.5, 'stroke-dasharray': '6,4'
  });
  svgEl(svg, 'text', {
    x: W - padX - 4, y: yScale(yBar) - 6, fill: COLORS.ink,
    'text-anchor': 'end', 'font-size': '12', 'font-style': 'italic',
    'font-family': 'Fraunces, serif', 'font-weight': '700'
  }, `ȳ = ${yBar.toFixed(2)}`);

  const lineX1 = xMin + 0.3, lineX2 = xMax - 0.3;
  svgEl(svg, 'line', {
    x1: xScale(lineX1), y1: yScale(m * lineX1 + c),
    x2: xScale(lineX2), y2: yScale(m * lineX2 + c),
    stroke: COLORS.blue, 'stroke-width': 3
  });

  xs.forEach((x, i) => {
    const yObs = ys[i];
    const yHat = yHats[i];
    // Explained (green): from yBar to yHat
    svgEl(svg, 'line', {
      x1: xScale(x), y1: yScale(yBar),
      x2: xScale(x), y2: yScale(yHat),
      stroke: COLORS.green, 'stroke-width': 3.5, 'stroke-opacity': 0.85
    });
    // Residual (red): from yHat to y_i
    svgEl(svg, 'line', {
      x1: xScale(x), y1: yScale(yHat),
      x2: xScale(x), y2: yScale(yObs),
      stroke: COLORS.red, 'stroke-width': 3.5, 'stroke-opacity': 0.85
    });
    svgEl(svg, 'circle', {
      cx: xScale(x), cy: yScale(yHat),
      r: 3, fill: COLORS.blue
    });
    svgEl(svg, 'circle', {
      cx: xScale(x), cy: yScale(yObs),
      r: 5, fill: COLORS.yellow,
      stroke: COLORS.ink, 'stroke-width': 2
    });
  });

  svgEl(svg, 'text', {
    x: W - padX + 8, y: padY + innerH + 5, fill: COLORS.ink,
    'font-size': '14', 'font-style': 'italic',
    'font-family': 'Fraunces, serif', 'font-weight': '700'
  }, 'x');
  svgEl(svg, 'text', {
    x: padX - 8, y: padY - 6, fill: COLORS.ink,
    'font-size': '14', 'font-style': 'italic', 'text-anchor': 'middle',
    'font-family': 'Fraunces, serif', 'font-weight': '700'
  }, 'y');
}

// =====================================================
// SECTION 3 — RESIDUAL PLOT PATTERN PICKER
// =====================================================
function initResidualPlots() {
  const buttons = document.querySelectorAll('.resid-btn');
  if (!buttons.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drawResidualPlot(btn.dataset.pattern);
    });
  });
  drawResidualPlot('random');
}

function drawResidualPlot(pattern) {
  const svg = document.getElementById('resid-svg');
  if (!svg) return;
  svg.innerHTML = '';
  const W = 500, H = 260;
  const padX = 40, padY = 30;
  const innerW = W - 2 * padX, innerH = H - 2 * padY;

  const xMin = 0, xMax = 10;
  const yMin = -2.5, yMax = 2.5;
  const xScale = x => padX + (x - xMin) / (xMax - xMin) * innerW;
  const yScale = y => padY + innerH / 2 - y / (yMax - yMin) * innerH;

  svgEl(svg, 'line', {
    x1: padX, y1: yScale(0), x2: W - padX, y2: yScale(0),
    stroke: COLORS.ink, 'stroke-width': 2, 'stroke-dasharray': '5,4'
  });
  svgEl(svg, 'line', {
    x1: padX, y1: padY + innerH, x2: W - padX, y2: padY + innerH,
    stroke: COLORS.ink, 'stroke-width': 2
  });
  svgEl(svg, 'line', {
    x1: padX, y1: padY, x2: padX, y2: padY + innerH,
    stroke: COLORS.ink, 'stroke-width': 2
  });

  svgEl(svg, 'text', {
    x: W - padX + 8, y: padY + innerH + 5, fill: COLORS.ink,
    'font-size': '14', 'font-style': 'italic',
    'font-family': 'Fraunces, serif', 'font-weight': '700'
  }, 'x');
  svgEl(svg, 'text', {
    x: padX - 8, y: padY - 6, fill: COLORS.ink,
    'font-size': '14', 'font-style': 'italic', 'text-anchor': 'middle',
    'font-family': 'Fraunces, serif', 'font-weight': '700'
  }, 'e');

  const N = 18;
  const points = [];
  const seed = [0.6,-0.5,0.4,-0.8,0.3,-0.4,0.7,-0.2,0.5,-0.6,0.4,-0.7,0.3,-0.5,0.6,-0.3,0.4,-0.6];
  for (let i = 0; i < N; i++) {
    const x = xMin + (xMax - xMin) * (i + 0.5) / N;
    let y;
    const noise = seed[i] * 0.7;
    if (pattern === 'random') {
      y = noise;
    } else if (pattern === 'curved') {
      const xn = (x - 5) / 3;
      y = (xn * xn - 1) * 1.0 + noise * 0.4;
    } else if (pattern === 'funnel') {
      y = seed[i] * (0.2 + (x / xMax) * 1.8);
    } else {
      y = noise;
    }
    points.push({ x, y });
  }

  const fillMap = { random: COLORS.green, curved: COLORS.yellow, funnel: COLORS.red };
  const colour = fillMap[pattern] || COLORS.green;

  points.forEach(p => {
    svgEl(svg, 'circle', {
      cx: xScale(p.x), cy: yScale(p.y),
      r: 5, fill: colour,
      stroke: COLORS.ink, 'stroke-width': 2
    });
  });

  const labelMap = {
    random: 'Random scatter ⇒ linear model is appropriate',
    curved: 'Curved pattern ⇒ a non-linear model is needed',
    funnel: 'Funnel ⇒ heteroscedasticity (non-constant spread)'
  };
  const info = labelMap[pattern] || labelMap.random;
  const infoEl = document.getElementById('resid-info');
  if (infoEl) infoEl.textContent = info;
}

// =====================================================
// SECTION 4 — WALKTHROUGH UNLOCK LOGIC
// =====================================================
function initWalkthrough() {}

function handleWalkthroughProgression(stepEl) {
  const problem = stepEl.closest('.walkthrough');
  if (!problem) return;
  stepEl.classList.add('correct');

  const stepNum = +stepEl.dataset.step;
  const next = problem.querySelector(`.wt-step[data-step="${stepNum + 1}"]`);
  if (next) {
    next.classList.remove('locked');
    next.classList.add('unlocked');
    rerenderMath(next);
    setTimeout(() => next.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
  } else {
    const completion = problem.querySelector('.wt-complete');
    if (completion) {
      completion.classList.remove('locked');
      completion.classList.add('unlocked');
      setTimeout(() => completion.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    }
  }
}

// =====================================================
// HELPERS
// =====================================================
function svgEl(parent, tag, attrs, text) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (text != null) el.textContent = text;
  parent.appendChild(el);
  return el;
}
