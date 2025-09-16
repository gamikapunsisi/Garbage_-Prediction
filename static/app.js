const form = document.getElementById('upload-form');
const fileInput = document.getElementById('image');
const predictBtn = document.getElementById('predict-btn');
const preview = document.getElementById('preview');
const previewImg = document.getElementById('preview-img');
const results = document.getElementById('results');
const errorEl = document.getElementById('error');
const predictedClassEl = document.getElementById('predicted-class');
const confidenceEl = document.getElementById('confidence');
const probabilitiesEl = document.getElementById('probabilities');

function resetUI() {
  errorEl.classList.add('hidden');
  results.classList.add('hidden');
  errorEl.textContent = '';
  probabilitiesEl.innerHTML = '';
}

fileInput.addEventListener('change', () => {
  resetUI();
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    previewImg.src = e.target.result;
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  resetUI();
  const file = fileInput.files && fileInput.files[0];
  if (!file) {
    errorEl.textContent = 'Please choose an image.';
    errorEl.classList.remove('hidden');
    return;
  }

  predictBtn.disabled = true;
  predictBtn.textContent = 'Predicting…';

  try {
    const data = new FormData();
    data.append('image', file);

    const resp = await fetch('/predict', {
      method: 'POST',
      body: data
    });

    const json = await resp.json();
    if (!resp.ok) {
      throw new Error(json.error || 'Prediction failed');
    }

    const { predicted_class, confidence, probabilities } = json;
    predictedClassEl.textContent = `Prediction: ${predicted_class}`;
    confidenceEl.textContent = `Confidence: ${Math.round(confidence * 100)}%`;

    // probabilities expected as { class: prob_percent, ... }
    const probsContainer = document.createElement('div');
    probsContainer.className = 'probs';
    Object.entries(probabilities || {}).forEach(([label, pct]) => {
      const row = document.createElement('div');
      row.className = 'prob-row';

      const name = document.createElement('div');
      name.textContent = label;

      const bar = document.createElement('div');
      bar.className = 'bar';
      const fill = document.createElement('span');
      const pct100 = Math.max(0, Math.min(100, Math.round((pct || 0) * 100)));
      fill.style.width = `${pct100}%`;
      bar.appendChild(fill);

      const value = document.createElement('div');
      value.textContent = `${pct100}%`;

      row.appendChild(name);
      row.appendChild(bar);
      row.appendChild(value);
      probsContainer.appendChild(row);
    });

    probabilitiesEl.appendChild(probsContainer);
    results.classList.remove('hidden');
  } catch (err) {
    errorEl.textContent = err.message || String(err);
    errorEl.classList.remove('hidden');
  } finally {
    predictBtn.disabled = false;
    predictBtn.textContent = 'Predict';
  }
});


