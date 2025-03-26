let originalImage = null;
let currentImage = null;
const filters = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0
};

const beforeCanvas = document.getElementById('beforeCanvas');
const afterCanvas = document.getElementById('afterCanvas');
const ctxBefore = beforeCanvas.getContext('2d');
const ctxAfter = afterCanvas.getContext('2d');
const slider = document.getElementById('slider');

document.getElementById('imageInput').addEventListener('change', handleImageUpload);
document.getElementById('brightness').addEventListener('input', updateFilters);
document.getElementById('contrast').addEventListener('input', updateFilters);
document.getElementById('saturation').addEventListener('input', updateFilters);
document.getElementById('sharpness').addEventListener('input', updateFilters);

slider.addEventListener('input', (e) => {
    const value = e.target.value;
    afterCanvas.style.clipPath = `inset(0 0 0 ${100 - value}%)`;
});

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
        originalImage = new Image();
        originalImage.onload = () => {
            setupCanvases(originalImage);
            currentImage = originalImage;
            applyFilters();
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function setupCanvases(image) {
    const container = document.querySelector('.image-container');
    const aspectRatio = image.width / image.height;
    const maxWidth = container.offsetWidth;
    const maxHeight = 500;

    if (image.width > maxWidth || image.height > maxHeight) {
        if (aspectRatio > 1) {
            beforeCanvas.width = maxWidth;
            beforeCanvas.height = maxWidth / aspectRatio;
        } else {
            beforeCanvas.height = maxHeight;
            beforeCanvas.width = maxHeight * aspectRatio;
        }
    } else {
        beforeCanvas.width = image.width;
        beforeCanvas.height = image.height;
    }

    afterCanvas.width = beforeCanvas.width;
    afterCanvas.height = beforeCanvas.height;

    ctxBefore.drawImage(image, 0, 0, beforeCanvas.width, beforeCanvas.height);
}

function updateFilters(e) {
    filters[e.target.id] = parseInt(e.target.value);
    applyFilters();
}

function applyFilters() {
    if (!originalImage) return;

    ctxAfter.drawImage(originalImage, 0, 0, afterCanvas.width, afterCanvas.height);

    const imageData = ctxAfter.getImageData(0, 0, afterCanvas.width, afterCanvas.height);
    const data = imageData.data;

    applyBrightness(data, filters.brightness);
    applyContrast(data, filters.contrast);
    applySaturation(data, filters.saturation);
    
    ctxAfter.putImageData(imageData, 0, 0);
}

function applyBrightness(data, value) {
    const factor = value / 100;
    for (let i = 0; i < data.length; i += 4) {
        data[i] += 255 * factor;
        data[i+1] += 255 * factor;
        data[i+2] += 255 * factor;
    }
}

function applyContrast(data, value) {
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i+1] = factor * (data[i+1] - 128) + 128;
        data[i+2] = factor * (data[i+2] - 128) + 128;
    }
}

function applySaturation(data, value) {
    const factor = value / 100;
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.2989 * data[i] + 0.5870 * data[i+1] + 0.1140 * data[i+2];
        data[i] = data[i] + (gray - data[i]) * factor;
        data[i+1] = data[i+1] + (gray - data[i+1]) * factor;
        data[i+2] = data[i+2] + (gray - data[i+2]) * factor;
    }
}

function resetFilters() {
    document.querySelectorAll('input[type="range"]').forEach(input => {
        if (input.id !== 'slider') input.value = 0;
    });
    filters.brightness = 0;
    filters.contrast = 0;
    filters.saturation = 0;
    filters.sharpness = 0;
    applyFilters();
}

function downloadImage() {
    if (!currentImage) return;

    const link = document.createElement('a');
    link.download = 'enhanced-image.png';
    link.href = afterCanvas.toDataURL();
    link.click();
}