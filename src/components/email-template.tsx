import * as React from 'react';

interface EmailTemplateProps {
  name: string;
  score: number;
  listening: number;
  structure: number;
  reading: number;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  name,
  score,
  listening,
  structure,
  reading,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      
      {/* Header Biru */}
      <div style={{ backgroundColor: '#1e3a8a', padding: '20px', textAlign: 'center', color: 'white' }}>
        <h2 style={{ margin: 0 }}>Hasil Ujian TOEFL Prediction</h2>
        <p style={{ margin: '5px 0 0', fontSize: '14px', opacity: 0.9 }}>Universitas Ibn Khaldun Bogor</p>
      </div>

      {/* Body Konten */}
      <div style={{ padding: '30px' }}>
        <p>Halo, <strong>{name}</strong>!</p>
        <p>Terima kasih telah mengikuti ujian. Berikut adalah rincian hasil tes Anda yang telah terekam oleh sistem kami:</p>
        
        {/* Kotak Skor Utama */}
        <div style={{ textAlign: 'center', margin: '30px 0', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ display: 'block', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Skor Prediksi</span>
          <span style={{ display: 'block', fontSize: '48px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1' }}>{score}</span>
        </div>

        {/* Tabel Rincian */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0' }}>Seksi Ujian</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Jumlah Benar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Listening Comprehension</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>{listening}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Structure & Written Exp.</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>{structure}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Reading Comprehension</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>{reading}</td>
            </tr>
          </tbody>
        </table>

        <p style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
          *Hasil ini merupakan prediksi komputer (Computer-Based) dan bersifat final. Sertifikat resmi dapat diunduh melalui dashboard akun Anda.
        </p>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #e2e8f0' }}>
        <p>&copy; 2026 Laboratorium Komputer UIKA Bogor.<br/>Sistem CBT Skripsi.</p>
      </div>
    </div>
  </div>
);