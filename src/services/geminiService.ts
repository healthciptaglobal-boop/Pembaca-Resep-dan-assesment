import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzePrescription(imageB64: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Anda adalah asisten apoteker profesional di Indonesia.
    Tugas Anda adalah membaca resep dokter dari gambar yang diberikan.
    
    1. Identifikasi obat, dosis, dan aturan pakai (signa).
    2. Cari informasi kandungan aktif dari database BPOM (simulasikan pengetahuan Anda).
    3. Cari interaksi obat dari standar FDA Amerika.
    4. Tentukan Beyond Use Date (BUD) yang sesuai untuk sediaan tersebut.
    5. Berikan saran edukasi pasien.
    
    Tampilkan hasil dalam Bahasa Indonesia yang jelas dan profesional.
    Gunakan format Markdown dengan header yang rapi.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageB64,
          },
        },
      ],
    },
  });

  return response.text;
}

export async function analyzeManualPrescription(data: any[]) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Anda adalah asisten apoteker profesional di Indonesia.
    Berikut adalah data resep yang diinput secara manual:
    ${JSON.stringify(data)}
    
    Tugas Anda:
    1. Berikan informasi kandungan aktif (BPOM).
    2. Berikan informasi interaksi obat (FDA).
    3. Tentukan Beyond Use Date (BUD).
    4. Berikan saran edukasi pasien.
    
    Tampilkan hasil dalam Bahasa Indonesia yang jelas dan profesional dalam format Markdown.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}

export async function assessPatientComplaint(complaint: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Anda adalah Apoteker yang melakukan asesmen swamedikasi (self-medication).
    Pasien mengeluhkan: "${complaint}"
    
    Tugas Anda:
    1. Lakukan asesmen singkat (tanyakan hal penting jika perlu, atau langsung berikan rekomendasi jika keluhan sudah jelas).
    2. Berikan rekomendasi pengobatan yang sesuai dengan kapasitas apoteker (obat bebas/bebas terbatas).
    3. Berikan tanda bahaya (red flags) kapan pasien harus ke dokter.
    
    Tampilkan hasil dalam Bahasa Indonesia yang ramah dan profesional dalam format Markdown.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}
