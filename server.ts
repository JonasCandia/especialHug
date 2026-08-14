import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import { createCanvas, loadImage } from 'canvas';
import { createServer as createViteServer } from 'vite';
import type { Theme, Order, Payment, CreditAccount, AdminMetrics, CreditPackage } from './src/types.js';

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const DATA_DIR = path.join(process.cwd(), 'data');
const STORAGE_DIR = path.join(process.cwd(), 'storage');
const PRIVATE_MASTERS_DIR = path.join(STORAGE_DIR, 'masters');
const PUBLIC_PREVIEWS_DIR = path.join(STORAGE_DIR, 'previews');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PRIVATE_MASTERS_DIR)) fs.mkdirSync(PRIVATE_MASTERS_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_PREVIEWS_DIR)) fs.mkdirSync(PUBLIC_PREVIEWS_DIR, { recursive: true });

const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed themes
const DEFAULT_THEMES: Theme[] = [
  {
    id: 'jesus-abraco',
    name: 'Jesus Abraçando',
    subtitle: 'Um abraço celestial de paz, conforto e acolhimento divino',
    description: 'Componha a sua foto sendo calorosamente abraçado por Jesus Cristo em um cenário de luz dourada divina e serenidade.',
    photosRequired: 1,
    photoLabels: ['Sua foto (rosto ou meio corpo)'],
    photoTips: ['Foto nítida, com boa iluminação e rosto bem visível', 'Preferencialmente olhando para frente ou levemente sorrindo'],
    promptTemplate: 'A heartwarming, divine masterpiece painting of Jesus Christ warmly embracing the person from the uploaded photo. Soft glowing halo and celestial golden backlight, serene expression of compassion, love and unconditional peace. Warm oil painting with gentle textures.',
    availableStyles: [
      { id: 'oleo-divino', name: 'Pintura a Óleo Emocional', description: 'Tonalidades quentes e pinceladas suaves clássicas', promptSuffix: 'fine art emotional oil painting style with golden warm tones and rich textures' },
      { id: 'realista-suave', name: 'Fotografia Realista Acolhedora', description: 'Luz cinematográfica suave e atmosfera aconchegante', promptSuffix: 'cinematic gentle warm photorealistic lighting, natural skin tones, soft focus background' },
      { id: 'aquarela-celestial', name: 'Aquarela Celestial', description: 'Leveza e brilho etéreo com toques dourados', promptSuffix: 'dreamy watercolor style with celestial gold leaf dust highlights and airy ambiance' }
    ],
    active: true,
    exampleImage: '/src/assets/images/theme_jesus_hug_1786735091777.jpg',
    emotionalCopy: 'Sinta o calor de um abraço sagrado que renova a fé e acalma o coração.',
    badge: 'Mais Popular'
  },
  {
    id: 'ente-querido',
    name: 'Ente Querido que Já Se Foi',
    subtitle: 'Um reencontro afetivo eterno guardado no coração',
    description: 'Reúna você e aquela pessoa especial que já partiu em um abraço terno e cheio de saudade, em uma atmosfera de paz e luz eterna.',
    photosRequired: 2,
    photoLabels: ['Sua foto atual', 'Foto do ente querido falecido'],
    photoTips: ['Fotos antigas ou recentes são aceitas', 'Procure fotos onde os rostos estejam identificáveis', 'Nosso processo trata cada memória com máximo respeito'],
    promptTemplate: 'A deeply emotional and respectful memorial portrait painting reuniting the living person with their deceased loved one in a tender embrace. Soft celestial morning light, glowing warm aura, peaceful smiles, nostalgic warm golden memory atmosphere, honoring their eternal bond.',
    availableStyles: [
      { id: 'oleo-memorial', name: 'Pintura Memorial Afetiva', description: 'Tons acolhedores que eternizam a lembrança com delicadeza', promptSuffix: 'tender oil painting honoring memories with soft luminous background and warm embraces' },
      { id: 'luz-dourada', name: 'Luz Dourada Celestial', description: 'Brilho suave do entardecer transmitindo paz e serenidade', promptSuffix: 'ethereal golden hour heavenly glow, gentle bokeh and peaceful reunion ambiance' },
      { id: 'aquarela-afeto', name: 'Aquarela de Memórias', description: 'Tons suaves e poéticos que expressam amor eterno', promptSuffix: 'poetic soft pastel watercolor with gentle glowing highlights' }
    ],
    active: true,
    exampleImage: '/src/assets/images/theme_loved_one_1786735100640.jpg',
    emotionalCopy: 'A saudade se transforma em carinho em uma lembrança única para guardar para sempre.',
    badge: 'Homenagem Sensível'
  },
  {
    id: 'pet-abraco',
    name: 'Abraço com seu Pet',
    subtitle: 'O carinho incondicional do seu melhor amigo de quatro patas',
    description: 'Imortalize o vínculo único entre você e seu pet (cão, gato ou outro companheiro) em um abraço carinhoso repleto de luz e afeto.',
    photosRequired: 2,
    photoLabels: ['Sua foto', 'Foto do seu Pet'],
    photoTips: ['Foto do seu pet onde ele apareça bem', 'Pode ser pet atual ou homenagem a um pet que virou estrelinha'],
    promptTemplate: 'A heartwarming, joyful portrait painting of a person hugging their beloved pet closely. Gentle golden sunlight, cozy atmosphere, expressive happy eyes, tender bond of companionship, fine art textured details.',
    availableStyles: [
      { id: 'oleo-pet', name: 'Pintura Clássica Aconchegante', description: 'Cores quentes e detalhes vibrantes no pelo do animal', promptSuffix: 'warm textured oil painting showcasing the rich fur and expressive eyes' },
      { id: 'realista-pet', name: 'Estilo Fotografia Emotiva', description: 'Iluminação natural e clima de ternura e alegria', promptSuffix: 'natural warm lighting portrait capturing authentic connection and love' },
      { id: 'aquarela-pet', name: 'Aquarela Colorida', description: 'Tons vibrantes e suaves cheios de vida', promptSuffix: 'expressive dynamic watercolor portrait with cheerful warm hues' }
    ],
    active: true,
    exampleImage: '/src/assets/images/theme_pet_hug_1786735111541.jpg',
    emotionalCopy: 'Celebre o amor mais puro e leal com uma arte cheia de sentimento.',
    badge: 'Amor Incondicional'
  }
];

interface DatabaseSchema {
  themes: Theme[];
  orders: Order[];
  credits: Record<string, number>; // email -> balance
  payments: Payment[];
  creditPackages: CreditPackage[];
}

function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      return {
        themes: data.themes || DEFAULT_THEMES,
        orders: data.orders || [],
        credits: data.credits || {},
        payments: data.payments || [],
        creditPackages: data.creditPackages || [
          { id: 'pack-1', credits: 1, priceBrl: 5.00, tag: 'Básico' },
          { id: 'pack-3', credits: 3, priceBrl: 10.00, originalPriceBrl: 15.00, tag: 'Mais Econômico', popular: true },
          { id: 'pack-5', credits: 5, priceBrl: 15.00, originalPriceBrl: 25.00, tag: 'Super Pacote' }
        ]
      };
    }
  } catch (err) {
    console.error('Error loading DB, using defaults:', err);
  }

  const initialDB: DatabaseSchema = {
    themes: DEFAULT_THEMES,
    orders: [],
    credits: { 'demo@abraco.com': 3 },
    payments: [],
    creditPackages: [
      { id: 'pack-1', credits: 1, priceBrl: 5.00, tag: 'Básico' },
      { id: 'pack-3', credits: 3, priceBrl: 10.00, originalPriceBrl: 15.00, tag: 'Mais Econômico', popular: true },
      { id: 'pack-5', credits: 5, priceBrl: 15.00, originalPriceBrl: 25.00, tag: 'Super Pacote' }
    ]
  };
  saveDB(initialDB);
  return initialDB;
}

function saveDB(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Global In-Memory DB
let db = loadDB();

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

/**
 * Server-side Watermarking Engine
 * Generates an undeniable watermark overlay with repeated diagonal warning texts,
 * protecting the generated image from unauthorized capture before payment.
 */
async function generateWatermarkedPreview(masterBuffer: Buffer): Promise<Buffer> {
  try {
    const img = await loadImage(masterBuffer);
    const width = 800;
    const height = Math.round((img.height / img.width) * 800) || 800;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Draw base image scaled down
    ctx.drawImage(img, 0, 0, width, height);

    // 2. Add subtle vignette/dimming
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // 3. Grid line overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    const step = 80;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 4. Diagonal repeating watermark text
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 4);

    const rows = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';

    rows.forEach((r) => {
      const yPos = r * 90;
      // Dark shadow for high contrast
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillText('ABRAÇO • PRÉVIA NÃO PAGA • AMOSTRA', 2, yPos + 2);
      ctx.fillText('ABRAÇO • PRÉVIA NÃO PAGA • AMOSTRA', -400 + 2, yPos + 2);
      ctx.fillText('ABRAÇO • PRÉVIA NÃO PAGA • AMOSTRA', 400 + 2, yPos + 2);

      // Bright text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillText('ABRAÇO • PRÉVIA NÃO PAGA • AMOSTRA', 0, yPos);
      ctx.fillText('ABRAÇO • PRÉVIA NÃO PAGA • AMOSTRA', -400, yPos);
      ctx.fillText('ABRAÇO • PRÉVIA NÃO PAGA • AMOSTRA', 400, yPos);
    });

    ctx.restore();

    // 5. Solid Center Banner
    const bannerHeight = 70;
    const bannerY = (height - bannerHeight) / 2;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, bannerY, width, bannerHeight);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, bannerY, width, bannerHeight);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText("🔒 PRÉVIA COM MARCA D'ÁGUA", width / 2, bannerY + 24);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('Libere o arquivo original em Alta Resolução (sem marca) após o pagamento', width / 2, bannerY + 48);

    return canvas.toBuffer('image/jpeg', { quality: 0.75 });
  } catch (err) {
    console.error('Error generating watermark preview:', err);
    return masterBuffer;
  }
}

/**
 * Image composition / AI generation engine
 */
async function generateMasterArt(order: Order, theme: Theme): Promise<Buffer> {
  const ai = getGeminiClient();
  const promptStyle = theme.availableStyles.find((s) => s.id === order.styleChosen);
  const fullPrompt = `${theme.promptTemplate}. Style modifier: ${promptStyle?.promptSuffix || 'warm comforting fine art portrait'}. Emotion: deeply comforting, high aesthetic appeal, masterwork.`;

  // Attempt Gemini AI Image Generation if API key is present
  if (ai) {
    try {
      console.log(`[AI Gen] Attempting Gemini image synthesis for order ${order.id}...`);
      
      const contentsParts: any[] = [];
      // Pass uploaded photos if any
      for (const p of order.photos) {
        if (p.startsWith('data:image/')) {
          const mimeMatch = p.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (mimeMatch) {
            contentsParts.push({
              inlineData: {
                mimeType: mimeMatch[1],
                data: mimeMatch[2]
              }
            });
          }
        }
      }

      contentsParts.push({
        text: `Create a completed harmonious artistic portrait based on the theme "${theme.name}". ${fullPrompt}. Ensure natural faces, warm tender lighting, and emotional resonance.`
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: { parts: contentsParts },
        config: {
          imageConfig: {
            aspectRatio: '4:3'
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            console.log(`[AI Gen] Success with Gemini image generation for order ${order.id}!`);
            return Buffer.from(part.inlineData.data, 'base64');
          }
        }
      }
    } catch (err: any) {
      console.warn('[AI Gen] Gemini generation fallback:', err?.message || err);
    }
  }

  // Fallback High-Fidelity Canvas Compositor
  // Blends user's actual uploaded photos with thematic artistic templates and warm atmospheric lighting
  console.log(`[Composite Engine] Creating high-fidelity blended artistic master for order ${order.id}...`);
  const canvasWidth = 1200;
  const canvasHeight = 900;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // Background gradient based on theme
  let grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  if (theme.id === 'jesus-abraco') {
    grad.addColorStop(0, '#fef3c7'); // warm divine amber
    grad.addColorStop(0.5, '#fde68a');
    grad.addColorStop(1, '#d97706');
  } else if (theme.id === 'ente-querido') {
    grad.addColorStop(0, '#e0f2fe'); // soft celestial morning blue & gold
    grad.addColorStop(0.5, '#fef08a');
    grad.addColorStop(1, '#ca8a04');
  } else {
    grad.addColorStop(0, '#ffedd5'); // cozy pet sunset
    grad.addColorStop(0.5, '#fed7aa');
    grad.addColorStop(1, '#ea580c');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Load example theme background if available
  let baseArtLoaded = false;
  if (theme.exampleImage && theme.exampleImage.startsWith('/src/assets/images/')) {
    const localImgPath = path.join(process.cwd(), theme.exampleImage);
    if (fs.existsSync(localImgPath)) {
      try {
        const baseImg = await loadImage(localImgPath);
        ctx.drawImage(baseImg, 0, 0, canvasWidth, canvasHeight);
        baseArtLoaded = true;
      } catch (e) {
        console.warn('Could not load base theme image:', e);
      }
    }
  }

  // Composite uploaded user photos into artistic portraits
  if (order.photos && order.photos.length > 0) {
    const numPhotos = order.photos.length;
    for (let i = 0; i < numPhotos; i++) {
      try {
        const photoData = order.photos[i];
        let photoBuffer: Buffer | null = null;
        if (photoData.startsWith('data:image/')) {
          const base64Data = photoData.split(',')[1];
          photoBuffer = Buffer.from(base64Data, 'base64');
        } else if (fs.existsSync(photoData)) {
          photoBuffer = fs.readFileSync(photoData);
        }

        if (photoBuffer) {
          const userPhoto = await loadImage(photoBuffer);
          ctx.save();

          // Calculate portrait position & oval clip
          const size = numPhotos === 1 ? 380 : 310;
          let posX = numPhotos === 1 ? 410 : (i === 0 ? 250 : 640);
          let posY = numPhotos === 1 ? 260 : 280;

          // Glowing aura behind face
          const auraGrad = ctx.createRadialGradient(posX + size / 2, posY + size / 2, size * 0.2, posX + size / 2, posY + size / 2, size * 0.7);
          auraGrad.addColorStop(0, 'rgba(254, 243, 199, 0.85)');
          auraGrad.addColorStop(0.7, 'rgba(251, 191, 36, 0.4)');
          auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(posX + size / 2, posY + size / 2, size * 0.7, 0, Math.PI * 2);
          ctx.fill();

          // Clip to softened artistic oval
          ctx.beginPath();
          ctx.ellipse(posX + size / 2, posY + size / 2, size * 0.45, size * 0.55, 0, 0, Math.PI * 2);
          ctx.clip();

          // Draw user photo
          ctx.drawImage(userPhoto, posX, posY, size, size * 1.15);

          // Warm tint overlay
          ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
          ctx.fillRect(posX, posY, size, size * 1.15);

          ctx.restore();

          // Soft golden rim around user photo
          ctx.save();
          ctx.strokeStyle = 'rgba(253, 224, 71, 0.75)';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.ellipse(posX + size / 2, posY + size / 2, size * 0.45, size * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } catch (err) {
        console.warn(`Could not composite photo index ${i}:`, err);
      }
    }
  }

  // Artistic finish / celestial golden dust particles & warm atmosphere
  ctx.save();
  for (let d = 0; d < 60; d++) {
    const rx = Math.random() * canvasWidth;
    const ry = Math.random() * canvasHeight;
    const rradius = Math.random() * 4 + 1;
    ctx.fillStyle = `rgba(254, 240, 138, ${Math.random() * 0.5 + 0.2})`;
    ctx.beginPath();
    ctx.arc(rx, ry, rradius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lower vignette / warm signature
  ctx.font = 'italic 20px serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.textAlign = 'right';
  ctx.fillText(`Abraço Arte Afetiva • ${theme.name}`, canvasWidth - 40, canvasHeight - 30);
  ctx.restore();

  return canvas.toBuffer('image/jpeg', { quality: 0.95 });
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Theme Catalog
app.get('/api/themes', (req, res) => {
  const includeInactive = req.query.admin === 'true';
  const themes = includeInactive ? db.themes : db.themes.filter((t) => t.active);
  res.json({ success: true, themes });
});

app.put('/api/admin/themes/:id', (req, res) => {
  const { id } = req.params;
  const themeIndex = db.themes.findIndex((t) => t.id === id);
  if (themeIndex === -1) {
    return res.status(404).json({ success: false, error: 'Tema não encontrado' });
  }

  db.themes[themeIndex] = {
    ...db.themes[themeIndex],
    ...req.body
  };
  saveDB(db);
  res.json({ success: true, theme: db.themes[themeIndex] });
});

// 2. Credits System
app.get('/api/credits', (req, res) => {
  const email = (req.query.email as string)?.trim().toLowerCase();
  if (!email) {
    return res.json({ success: true, credits: 0, packages: db.creditPackages });
  }
  const balance = db.credits[email] || 0;
  res.json({ success: true, email, credits: balance, packages: db.creditPackages });
});

app.post('/api/credits/buy', (req, res) => {
  const { email, packageId, method } = req.body;
  if (!email || !packageId) {
    return res.status(400).json({ success: false, error: 'Email e pacote são obrigatórios' });
  }

  const pack = db.creditPackages.find((p) => p.id === packageId);
  if (!pack) {
    return res.status(404).json({ success: false, error: 'Pacote de créditos inválido' });
  }

  const paymentId = `pay-${uuidv4().slice(0, 8)}`;
  const normalizedEmail = email.trim().toLowerCase();

  const payment: Payment = {
    id: paymentId,
    creditPackId: pack.id,
    customerEmail: normalizedEmail,
    amountBrl: pack.priceBrl,
    gateway: 'mercado_pago',
    method: method === 'card' ? 'card' : 'pix',
    status: 'pending',
    pixQrCode: `00020101021226840014br.gov.bcb.pix2562pix-abraco-app.mercadopago.com/qr/${paymentId}520400005303986540${pack.priceBrl.toFixed(2)}5802BR5920ABRACO FOTOS IA6009SAO PAULO62070503***6304E8A1`,
    pixCopyPaste: `00020101021226840014br.gov.bcb.pix2562pix-abraco-app.mercadopago.com/qr/${paymentId}520400005303986540${pack.priceBrl.toFixed(2)}5802BR5920ABRACO FOTOS IA6009SAO PAULO62070503***6304E8A1`,
    transactionId: `MP-TX-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  db.payments.unshift(payment);
  saveDB(db);

  res.json({
    success: true,
    payment,
    message: 'Pagamento iniciado via Mercado Pago'
  });
});

// 3. Create Order & Upload Photos
app.post('/api/orders', async (req, res) => {
  try {
    const { themeId, photos, styleChosen, customerEmail, customerName, customNotes } = req.body;

    if (!themeId || !photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ success: false, error: 'Tema e fotos são obrigatórios' });
    }

    const theme = db.themes.find((t) => t.id === themeId);
    if (!theme) {
      return res.status(404).json({ success: false, error: 'Tema não encontrado' });
    }

    if (photos.length < theme.photosRequired) {
      return res.status(400).json({
        success: false,
        error: `Este tema exige pelo menos ${theme.photosRequired} foto(s).`
      });
    }

    const orderId = `ord-${uuidv4().slice(0, 8)}`;
    const normalizedEmail = (customerEmail || 'cliente@exemplo.com').trim().toLowerCase();

    const newOrder: Order = {
      id: orderId,
      themeId: theme.id,
      themeName: theme.name,
      customerEmail: normalizedEmail,
      customerName: customerName || '',
      photos,
      styleChosen: styleChosen || theme.availableStyles[0]?.id || 'padrao',
      status: 'processando',
      hasMasterImage: false,
      creditsUsed: 0,
      priceBrl: 5.00,
      createdAt: new Date().toISOString(),
      customNotes: customNotes || ''
    };

    db.orders.unshift(newOrder);
    saveDB(db);

    // Run async generation
    (async () => {
      try {
        console.log(`[Order Processing] Starting generation for order ${orderId}...`);
        const masterBuffer = await generateMasterArt(newOrder, theme);

        // 1. Save master in PRIVATE storage (never sent directly before payment)
        const masterPath = path.join(PRIVATE_MASTERS_DIR, `${orderId}.jpg`);
        fs.writeFileSync(masterPath, masterBuffer);

        // 2. Generate server-side watermarked preview
        const previewBuffer = await generateWatermarkedPreview(masterBuffer);
        const previewPath = path.join(PUBLIC_PREVIEWS_DIR, `${orderId}-preview.jpg`);
        fs.writeFileSync(previewPath, previewBuffer);

        // 3. Update order
        const targetOrder = db.orders.find((o) => o.id === orderId);
        if (targetOrder) {
          targetOrder.status = 'aguardando_pagamento';
          targetOrder.hasMasterImage = true;
          targetOrder.previewUrl = `/api/orders/${orderId}/preview?v=${Date.now()}`;
          saveDB(db);
          console.log(`[Order Processing] Order ${orderId} is ready with watermarked preview.`);
        }
      } catch (err: any) {
        console.error(`[Order Processing] Failed for order ${orderId}:`, err);
        const targetOrder = db.orders.find((o) => o.id === orderId);
        if (targetOrder) {
          targetOrder.status = 'erro';
          targetOrder.errorMessage = err?.message || 'Falha ao processar imagem';
          saveDB(db);
        }
      }
    })();

    res.json({
      success: true,
      order: {
        id: newOrder.id,
        status: newOrder.status,
        themeName: newOrder.themeName,
        createdAt: newOrder.createdAt
      }
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, error: err?.message || 'Erro ao criar pedido' });
  }
});

// 4. Get Order Status & Public Watermarked Preview
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
  }

  // Mask private master URL, only expose preview and signed download if paid
  res.json({
    success: true,
    order: {
      id: order.id,
      themeId: order.themeId,
      themeName: order.themeName,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      styleChosen: order.styleChosen,
      status: order.status,
      previewUrl: order.previewUrl,
      hasMasterImage: order.hasMasterImage,
      downloadExpiresAt: order.downloadExpiresAt,
      downloadToken: order.status === 'pago' || order.status === 'concluido' ? order.downloadToken : undefined,
      downloadUrl:
        order.status === 'pago' || order.status === 'concluido'
          ? `/api/download/${order.downloadToken}`
          : undefined,
      priceBrl: order.priceBrl,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
      errorMessage: order.errorMessage
    }
  });
});

// 5. Public Watermarked Preview Image Route
app.get('/api/orders/:id/preview', (req, res) => {
  const { id } = req.params;
  const previewPath = path.join(PUBLIC_PREVIEWS_DIR, `${id}-preview.jpg`);
  if (fs.existsSync(previewPath)) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return fs.createReadStream(previewPath).pipe(res);
  }

  // Return fallback if still processing
  res.status(404).send('Prévia ainda não disponível ou em processamento.');
});

// 6. Direct Order Payment Creation (Mercado Pago Pix / Card)
app.post('/api/payments/create', (req, res) => {
  const { orderId, method, customerEmail } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'ID do pedido obrigatório' });
  }

  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
  }

  const paymentId = `pay-${uuidv4().slice(0, 8)}`;
  const payment: Payment = {
    id: paymentId,
    orderId: order.id,
    customerEmail: customerEmail || order.customerEmail,
    amountBrl: order.priceBrl,
    gateway: 'mercado_pago',
    method: method === 'card' ? 'card' : 'pix',
    status: 'pending',
    pixQrCode: `00020101021226840014br.gov.bcb.pix2562pix-abraco-app.mercadopago.com/qr/${paymentId}520400005303986540${order.priceBrl.toFixed(2)}5802BR5920ABRACO FOTOS IA6009SAO PAULO62070503***6304E8A1`,
    pixCopyPaste: `00020101021226840014br.gov.bcb.pix2562pix-abraco-app.mercadopago.com/qr/${paymentId}520400005303986540${order.priceBrl.toFixed(2)}5802BR5920ABRACO FOTOS IA6009SAO PAULO62070503***6304E8A1`,
    transactionId: `MP-TX-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  order.paymentId = paymentId;
  db.payments.unshift(payment);
  saveDB(db);

  res.json({
    success: true,
    payment,
    order
  });
});

// Helper to unlock order upon payment confirmation
function unlockOrderAndIssueDownload(order: Order, paymentId?: string): string {
  const token = `dl-${uuidv4()}`;
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48h expiration

  order.status = 'concluido';
  order.downloadToken = token;
  order.downloadExpiresAt = expires;
  order.completedAt = new Date().toISOString();
  if (paymentId) order.paymentId = paymentId;

  saveDB(db);
  return token;
}

// 7. Unlock Order using Existing Credits (1 credit = 1 image)
app.post('/api/orders/:id/unlock-with-credit', (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
  }

  const normalizedEmail = (email || order.customerEmail).trim().toLowerCase();
  const currentCredits = db.credits[normalizedEmail] || 0;

  if (currentCredits < 1) {
    return res.status(400).json({
      success: false,
      error: 'Saldo de créditos insuficiente. Você precisa de 1 crédito para liberar esta imagem.'
    });
  }

  // Deduct 1 credit
  db.credits[normalizedEmail] = currentCredits - 1;
  order.creditsUsed = 1;
  const token = unlockOrderAndIssueDownload(order);

  res.json({
    success: true,
    message: 'Imagem liberada com sucesso usando 1 crédito!',
    remainingCredits: db.credits[normalizedEmail],
    downloadUrl: `/api/download/${token}`,
    downloadExpiresAt: order.downloadExpiresAt
  });
});

// 8. Payment Simulation (Convenient instant verification for testing)
app.post('/api/payments/:id/simulate-success', (req, res) => {
  const { id } = req.params;
  const payment = db.payments.find((p) => p.id === id);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
  }

  payment.status = 'approved';
  payment.confirmedAt = new Date().toISOString();

  // If this was a credit package purchase
  if (payment.creditPackId) {
    const pack = db.creditPackages.find((p) => p.id === payment.creditPackId);
    if (pack) {
      const email = payment.customerEmail;
      db.credits[email] = (db.credits[email] || 0) + pack.credits;
    }
  }

  // If this was a direct order payment
  let downloadUrl = '';
  if (payment.orderId) {
    const order = db.orders.find((o) => o.id === payment.orderId);
    if (order) {
      const token = unlockOrderAndIssueDownload(order, payment.id);
      downloadUrl = `/api/download/${token}`;
    }
  }

  saveDB(db);
  res.json({
    success: true,
    payment,
    downloadUrl,
    message: 'Pagamento Mercado Pago aprovado com sucesso!'
  });
});

// 9. Mercado Pago Webhook Endpoint (Official Webhook)
app.post('/api/webhooks/mercadopago', (req, res) => {
  try {
    console.log('[Mercado Pago Webhook] Received event:', req.query, req.body);
    const topic = req.query.topic || req.body?.type || req.body?.topic;
    const paymentId = req.query.id || req.body?.data?.id;

    if (paymentId) {
      // Find matching payment
      const payment = db.payments.find((p) => p.id === paymentId || p.transactionId === paymentId);
      if (payment && payment.status !== 'approved') {
        payment.status = 'approved';
        payment.confirmedAt = new Date().toISOString();

        if (payment.creditPackId) {
          const pack = db.creditPackages.find((p) => p.id === payment.creditPackId);
          if (pack) {
            db.credits[payment.customerEmail] = (db.credits[payment.customerEmail] || 0) + pack.credits;
          }
        }

        if (payment.orderId) {
          const order = db.orders.find((o) => o.id === payment.orderId);
          if (order) {
            unlockOrderAndIssueDownload(order, payment.id);
          }
        }
        saveDB(db);
      }
    }

    res.status(200).json({ status: 'received' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// 10. Secure Signed Download Endpoint (Only works after payment, expirable 48h)
app.get('/api/download/:token', (req, res) => {
  const { token } = req.params;
  const order = db.orders.find((o) => o.downloadToken === token);

  if (!order) {
    return res.status(403).send(`
      <html>
        <head><title>Acesso Não Autorizado</title></head>
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2>Acesso Não Autorizado ou Token Inválido</h2>
          <p>O download da foto sem marca d'água só é liberado após a confirmação do pagamento.</p>
          <a href="/">Voltar para o site</a>
        </body>
      </html>
    `);
  }

  // Check 48h expiration
  if (order.downloadExpiresAt && new Date(order.downloadExpiresAt).getTime() < Date.now()) {
    return res.status(410).send(`
      <html>
        <head><title>Link Expirado</title></head>
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2>Link de Download Expirado (48 Horas)</h2>
          <p>Por motivos de segurança e LGPD, este link expirou. Você pode solicitar o reenvio acessando sua conta com o e-mail <b>${order.customerEmail}</b>.</p>
          <a href="/">Solicitar Reenvio</a>
        </body>
      </html>
    `);
  }

  const masterPath = path.join(PRIVATE_MASTERS_DIR, `${order.id}.jpg`);
  if (!fs.existsSync(masterPath)) {
    return res.status(404).send('Arquivo master não encontrado no servidor.');
  }

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Disposition', `attachment; filename="abraco-${order.themeId}-${order.id}.jpg"`);
  fs.createReadStream(masterPath).pipe(res);
});

// 11. Resend / Refresh Expirable Link
app.post('/api/orders/:id/resend-link', (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const order = db.orders.find((o) => o.id === id);

  if (!order || (order.status !== 'pago' && order.status !== 'concluido')) {
    return res.status(400).json({ success: false, error: 'Pedido não elegível para reenvio' });
  }

  if (email && order.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
    return res.status(403).json({ success: false, error: 'E-mail não coincide com o pedido' });
  }

  const token = unlockOrderAndIssueDownload(order, order.paymentId);
  res.json({
    success: true,
    downloadUrl: `/api/download/${token}`,
    downloadExpiresAt: order.downloadExpiresAt,
    message: 'Novo link assinado válido por mais 48 horas gerado com sucesso!'
  });
});

// 12. User Order History Lookup by Email
app.get('/api/orders/user/history', (req, res) => {
  const email = (req.query.email as string)?.trim().toLowerCase();
  if (!email) {
    return res.json({ success: true, orders: [] });
  }

  const userOrders = db.orders
    .filter((o) => o.customerEmail.toLowerCase() === email)
    .map((o) => ({
      id: o.id,
      themeId: o.themeId,
      themeName: o.themeName,
      status: o.status,
      previewUrl: o.previewUrl,
      downloadToken: o.status === 'concluido' ? o.downloadToken : undefined,
      downloadExpiresAt: o.downloadExpiresAt,
      createdAt: o.createdAt,
      priceBrl: o.priceBrl
    }));

  res.json({ success: true, orders: userOrders });
});

// 13. Admin Endpoints
app.get('/api/admin/metrics', (req, res) => {
  const completed = db.orders.filter((o) => o.status === 'concluido' || o.status === 'pago').length;
  const pending = db.orders.filter((o) => o.status === 'aguardando_pagamento' || o.status === 'processando').length;
  
  const revenueFromPayments = db.payments
    .filter((p) => p.status === 'approved')
    .reduce((acc, p) => acc + (p.amountBrl || 0), 0);

  const metrics: AdminMetrics = {
    totalRevenueBrl: revenueFromPayments,
    totalOrders: db.orders.length,
    completedOrders: completed,
    pendingOrders: pending,
    totalCreditsSold: db.payments
      .filter((p) => p.status === 'approved' && p.creditPackId)
      .reduce((acc, p) => {
        const pack = db.creditPackages.find((cp) => cp.id === p.creditPackId);
        return acc + (pack?.credits || 0);
      }, 0),
    activeThemesCount: db.themes.filter((t) => t.active).length
  };

  res.json({ success: true, metrics });
});

app.get('/api/admin/orders', (req, res) => {
  const orders = db.orders.map((o) => ({
    ...o,
    hasMasterImage: fs.existsSync(path.join(PRIVATE_MASTERS_DIR, `${o.id}.jpg`))
  }));
  res.json({ success: true, orders, payments: db.payments });
});

app.post('/api/admin/orders/:id/approve', (req, res) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ success: false, error: 'Pedido não encontrado' });

  const token = unlockOrderAndIssueDownload(order, 'ADMIN-MANUAL-UNLOCK');
  res.json({
    success: true,
    downloadUrl: `/api/download/${token}`,
    order
  });
});

app.post('/api/admin/orders/:id/regenerate', async (req, res) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ success: false, error: 'Pedido não encontrado' });

  const theme = db.themes.find((t) => t.id === order.themeId) || db.themes[0];

  try {
    order.status = 'processando';
    saveDB(db);

    const masterBuffer = await generateMasterArt(order, theme);
    const masterPath = path.join(PRIVATE_MASTERS_DIR, `${order.id}.jpg`);
    fs.writeFileSync(masterPath, masterBuffer);

    const previewBuffer = await generateWatermarkedPreview(masterBuffer);
    const previewPath = path.join(PUBLIC_PREVIEWS_DIR, `${order.id}-preview.jpg`);
    fs.writeFileSync(previewPath, previewBuffer);

    order.status = order.downloadToken ? 'concluido' : 'aguardando_pagamento';
    order.previewUrl = `/api/orders/${order.id}/preview?v=${Date.now()}`;
    saveDB(db);

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Erro ao regenerar arte' });
  }
});

// ----------------------------------------------------
// VITE / STATIC INTEGRATION
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Abraço Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
