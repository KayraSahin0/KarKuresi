// --- Yapılandırma ---
const images = [
    'images/askimla.png',
    'images/askimla1.png',
    'images/askimla2.png',
    'images/askimla3.png',
    'images/askimla4.png'
];

// --- Seçiciler ---
const photoFrame = document.getElementById('photoFrame');
const interactionArea = document.getElementById('interactionArea');
const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');
const bgPattern = document.getElementById('bgPattern');

// --- Değişkenler ---
let currentImageIndex = 0;
let isSnowing = false;
let particles = [];
let animationId;
let w, h;

// --- 1. Arka Planı Doldur (Hareketli "SENİ ÇOK SEVİYORUM") ---
function createBackgroundPattern() {
    const container = document.getElementById('bgPattern');
    const text = "SENİ ÇOK SEVİYORUM  •  "; // Araya nokta koyduk
    const rowCount = 40; // Ekrana sığacak satır sayısı
    const repeatCount = 50; // Yan yana kaç kere yazılacağı

    let htmlContent = "";

    for (let r = 0; r < rowCount; r++) {
        // Satır oluştur
        let rowContent = "";
        for (let t = 0; t < repeatCount; t++) {
            rowContent += `<span class="bg-text">${text}</span>`;
        }

        // Çift satırlar sağa, tek satırlar sola kaysın
        const directionClass = r % 2 === 0 ? "move-left" : "move-right";
        
        // HTML'i birleştir
        htmlContent += `<div class="bg-row ${directionClass}">${rowContent}</div>`;
    }

    container.innerHTML = htmlContent;
}

createBackgroundPattern();

// --- 2. Kar Küresi Animasyon Mantığı ---

// Canvas Boyutlandırma
function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    w = canvas.width;
    h = canvas.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Kar Tanesi Sınıfı
class SnowFlake {
    constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Aşağıdan çıkarsa yukarı taşı
        if (this.y > h) {
            this.y = -5;
            this.x = Math.random() * w;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

// Kar Başlat
function startSnow() {
    if (isSnowing) return; // Zaten yağıyorsa tekrar başlatma
    isSnowing = true;
    
    // Kar taneleri oluştur
    particles = [];
    for(let i=0; i<100; i++) {
        particles.push(new SnowFlake());
    }

    animate();

    // 5 Saniye sonra karı durdur (veya azaltarak bitir)
    setTimeout(() => {
        isSnowing = false;
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, w, h); // Temizle
    }, 5000);
}

function animate() {
    if(!isSnowing) return;
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    animationId = requestAnimationFrame(animate);
}

// --- 3. Fotoğraf Değiştirme ve Tetikleme ---

function triggerEffect() {
    // 1. Kar yağdır
    startSnow();

    // 2. Fotoğrafı değiştir
    currentImageIndex = (currentImageIndex + 1) % images.length;
    
    // Hafif opaklık efektiyle geçiş
    photoFrame.style.opacity = 0;
    setTimeout(() => {
        photoFrame.src = images[currentImageIndex];
        photoFrame.style.opacity = 1;
    }, 200); // CSS transition süresiyle uyumlu bekleme
}

// Masaüstü: Tıklama ile tetikle
interactionArea.addEventListener('click', triggerEffect);

// Mobil: Sallama (Shake) Algılama
let x, y, z, last_x, last_y, last_z;
let lastTime = 0;
const SHAKE_THRESHOLD = 15; // Hassasiyet ayarı

if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', function(event) {
        let current = event.accelerationIncludingGravity;
        if(!current) return;

        let currentTime = new Date().getTime();
        
        if ((currentTime - lastTime) > 100) {
            let diffTime = currentTime - lastTime;
            lastTime = currentTime;

            x = current.x;
            y = current.y;
            z = current.z;

            let speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;

            if (speed > SHAKE_THRESHOLD) {
                triggerEffect();
            }

            last_x = x;
            last_y = y;
            last_z = z;
        }
    });
}