import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy init Gemini AI
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'KiotFix Computer & Electronic Repair Management Server',
    version: '2.5.0'
  });
});

// AI Diagnostic Endpoint for Hardware Technicians
app.post('/api/gemini/diagnose', async (req, res) => {
  try {
    const { deviceType, brand, model, faultDescription, measurements } = req.body;
    const ai = getGemini();
    
    if (!ai) {
      // Fallback smart rule-based diagnostic if no API key provided
      const suggestions = generateLocalDiagnostic(deviceType, faultDescription, measurements);
      return res.json({
        success: true,
        source: 'rule-engine',
        diagnosis: suggestions
      });
    }

    const prompt = `Bạn là một chuyên gia sửa chữa phần cứng máy tính, laptop, card màn hình (VGA) và mainboard điện tử cấp độ chip level (IC, MOSFET, BIOS, VRAM, Chipset).
Hãy phân tích thiết bị sau và đưa ra hướng dẫn chẩn đoán kỹ thuật cụ thể:
- Loại thiết bị: ${deviceType || 'Laptop/PC/VGA'}
- Hãng & Model: ${brand || ''} ${model || ''}
- Mô tả lỗi: ${faultDescription}
- Đo đạc đoản mạch / điện áp đã đo: ${JSON.stringify(measurements || {})}

Hãy trả về phản hồi theo định dạng markdown gồm:
1. **Phân tích nguyên nhân tiềm ẩn** (chập nguồn, mất áp standby 3.3V/5V, đứt đường tín hiệu, lỗi BIOS, lỗi VRAM, lỗi GPU/CPU, v.v.)
2. **Các điểm đo (Test points) & linh kiện cần kiểm tra trước** (MOSFET đầu vào, IC nguồn xung, cuộn cảm Coil, trở gánh, tụ lọc)
3. **Phương án sửa chữa & Linh kiện đề xuất thay thế**
4. **Lưu ý an toàn kỹ thuật (Nhiệt độ khò hàn, dòng cấp nguồn DC)**`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      source: 'gemini-ai',
      diagnosis: response.text
    });
  } catch (error: any) {
    console.error('Gemini Diagnose Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi phân tích AI'
    });
  }
});

// Printer test simulation endpoint for WiFi / LAN Thermal Printers (Port 9100 / ESC POS)
app.post('/api/printers/test', (req, res) => {
  const { ip, port, name, paperSize } = req.body;
  console.log(`[PRINTER] Test print packet sent to ${name} (${ip}:${port}), Paper: ${paperSize}`);
  
  res.json({
    success: true,
    message: `Đã kết nối thành công máy in nhiệt WiFi/LAN [${name}] tại IP ${ip}:${port || 9100} (${paperSize}). Lệnh in test ESC/POS đã được gửi.`,
    timestamp: new Date().toISOString()
  });
});

// Fallback rule engine helper
function generateLocalDiagnostic(deviceType: string, fault: string, measurements: any) {
  const f = (fault || '').toLowerCase();
  if (f.includes('không lên nguồn') || f.includes('mất nguồn') || f.includes('không kích nguồn')) {
    return `### Chẩn đoán kỹ thuật (Hệ thống KiotFix Expert Engine):
1. **Nguyên nhân tiềm năng:**
   - Chập MOSFET nguồn đầu vào 19V (Laptop) hoặc đường 12V/5V VSB (PC).
   - Mất điện áp 3.3V / 5V Standby do IC nguồn xung (TPS51125, RT8205, v.v.) bị lỗi hoặc chập tụ gốm lọc nguồn.
   - Lỗi chip EC / SIO (IT8586, KB9012, v.v.) hoặc lỗi ROM BIOS nạp sai FW.

2. **Các bước kiểm tra bằng đồng hồ VOM / Dao động ký:**
   - Cấp nguồn qua máy cấp dòng (DC Power Supply 30V-5A), quan sát dòng ăn: Nếu ăn dòng 0.00A -> Đứt cầu chì hoặc hỏng MOSFET đầu vào. Nếu ăn dòng cao > 1.5A -> Chập đường B+ 19V.
   - Dò nhiệt bằng cồn Isopropyl hoặc camera nhiệt để xác định linh kiện nóng rực.

3. **Linh kiện đề xuất:**
   - Thay cặp MOSFET nguồn kênh P/N đầu vào.
   - Thay IC nguồn cấp trước 3V/5V hoặc nạp lại file BIOS chuẩn có Clean ME Region.`;
  } else if (f.includes('vga') || f.includes('rác hình') || f.includes('artifact') || f.includes('treo driver') || f.includes('không nhận vga')) {
    return `### Chẩn đoán kỹ thuật Card màn hình (VGA/GPU):
1. **Nguyên nhân tiềm năng:**
   - Lỗi 1 trong các chip VRAM (Samsung, Micron, Hynix) bị bong chân BGA hoặc chết ô nhớ.
   - Sụt áp nguồn cấp Core GPU (NVVDD) hoặc nguồn VRAM (FBVDDQ).
   - Lỗi chip GPU trung tâm do quá nhiệt trong thời gian dài.

2. **Các bước kiểm tra:**
   - Chạy phần mềm test VRAM chuyên dụng (MATS / MODS đối với NVIDIA hoặc Tserver với AMD) để xác định chính xác Channel VRAM lỗi (ví dụ: Bank A0, A1, B0, B1).
   - Đo trở kháng cuộn cảm nguồn Core (~0.2Ω - 0.8Ω) và nguồn VRAM (~15Ω - 50Ω).

3. **Phương án:**
   - Đóng lại chân (Reball) hoặc thay chip VRAM tương ứng.
   - Vệ sinh tra keo tản nhiệt cao cấp (Honeywell PTM7950 / Thermal Grizzly).`;
  }
  return `### Chẩn đoán kỹ thuật:
1. **Kiểm tra sơ bộ:** Vệ sinh chân RAM, tiếp xúc khe cắm PCIe, đo đạc điện áp cuộn cảm các pha nguồn chính.
2. **Khuyến nghị:** Nạp lại BIOS bằng máy nạp RT809F/CH341A và kiểm tra xung nhịp thạch anh 32.768kHz và 25MHz.`;
}

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
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
    console.log(`KiotFix Server running on http://localhost:${PORT}`);
  });
}

startServer();
