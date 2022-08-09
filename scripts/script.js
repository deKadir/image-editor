const fileInput = document.querySelector('.file-input'),
  chooseBtn = document.querySelector('.choose-img'),
  previewImg = document.querySelector('.preview-img img'),
  filterOptions = document.querySelectorAll('.filter button'),
  rotateOptions = document.querySelectorAll('.options button'),
  filterName = document.querySelector('.filter-info .name'),
  filterValue = document.querySelector('.filter-info .value'),
  resetFilter = document.querySelector('.reset-filter'),
  saveBtn = document.querySelector('.save-img'),
  filterSlider = document.querySelector('.slider input');

//initial values
const valuesInit = {
  rotation: 0,
  flip: {
    vertical: 1,
    horizontal: 1,
  },
  filters: {
    brightness: { value: 100, max: 200, function: 'brightness' },
    saturation: { value: 100, max: 200, function: 'saturate' },
    inversion: { value: 0, max: 100, function: 'invert' },
    grayscale: { value: 0, max: 100, function: 'grayscale' },
  },
};

let values = structuredClone(valuesInit);

//event listeners
chooseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', loadImage);
filterSlider.addEventListener('input', updateSlider);
resetFilter.addEventListener('click', resetValues);
saveBtn.addEventListener('click', saveImage);

//change filters
filterOptions.forEach((option) => {
  option.addEventListener('click', () => {
    document.querySelector('.filter .active').classList.remove('active');
    option.classList.add('active');
    filterName.innerText = option.innerText;
    filterSlider.max = values.filters[option.id].max;
    filterSlider.value = values.filters[option.id].value;
    filterValue.innerText = `${values.filters[option.id].value}%`;
  });
});

//rotation operations
rotateOptions.forEach((option) => {
  option.addEventListener('click', () => {
    switch (option.id) {
      case 'left':
        values.rotation -= 90;
        break;
      case 'right':
        values.rotation += 90;
        break;
      case 'horizontal':
        values.flip.horizontal = values.flip.horizontal === 1 ? -1 : 1;
        break;
      case 'vertical':
        values.flip.vertical = values.flip.vertical === 1 ? -1 : 1;
        break;

      default:
        break;
    }
    applyFilters();
  });
});

//load from input to image src
function loadImage() {
  let file = fileInput.files[0];
  if (!file) return;
  resetValues();
  previewImg.src = URL.createObjectURL(file);
  previewImg.addEventListener('load', () => {
    document.querySelector('.container').classList.remove('disable');
  });
}

//update slider input value
function updateSlider() {
  const selectedFilter = document.querySelector('.filter .active');
  const filter = values.filters[selectedFilter.id];
  values.filters[selectedFilter.id].value = parseInt(filterSlider.value);
  filterValue.innerText = `${filter.value}%`;
  applyFilters();
}

//save image
function saveImage() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = previewImg.naturalWidth;
  canvas.height = previewImg.naturalHeight;

  //apply changes
  ctx.filter = filterToString();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (values.rotation !== 0) {
    ctx.rotate((values.rotation * Math.PI) / 180);
  }
  ctx.scale(values.flip.vertical, values.flip.horizontal);

  //put the image
  ctx.drawImage(
    previewImg,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );
  //create link
  const link = document.createElement('a');
  link.href = canvas.toDataURL();
  link.download = 'image.jpg';
  link.click();
}

//applies values to image
function applyFilters() {
  previewImg.style.transform = `rotate(${values.rotation}deg) scale(${values.flip.vertical},${values.flip.horizontal})`;
  previewImg.style.filter = filterToString();
}

//resets values
function resetValues() {
  values = structuredClone(valuesInit);
  applyFilters();
}

function filterToString() {
  const keys = Object.keys(values.filters);
  return keys.reduce((previous, current) => {
    return (previous += `${values.filters[current].function}(${values.filters[current].value}%) `);
  }, '');
}
