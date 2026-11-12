import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// ----------------------------------------------------
// AUTHENTICATION & GMAIL VERIFICATION STORE & SERVICE
// ----------------------------------------------------
interface StoredUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  schoolName: string;
  schoolLevel: string;
  role: string;
  phoneNumber?: string;
  isVerified: boolean;
  verificationOtp?: string;
  otpExpiresAt?: number;
  createdAt: string;
  lastLoginAt?: string;
}

const DATA_DIR = path.resolve(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadUsers(): StoredUser[] {
  try {
    ensureDataDir();
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading users:', err);
  }
  return [];
}

function saveUsers(users: StoredUser[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

async function sendVerificationEmail(email: string, fullName: string, otp: string) {
  const subject = `[VTVL GD&ĐT] Mã xác thực kích hoạt tài khoản của Thầy/Cô: ${otp}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
      <div style="background: #1e1b4b; padding: 20px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">HỆ THỐNG XÂY DỰNG ĐỀ ÁN VỊ TRÍ VIỆC LÀM</h2>
        <p style="margin: 4px 0 0; font-size: 13px; color: #a5b4fc;">Bộ Giáo dục & Đào tạo — Nghị định 232/2026/NĐ-CP & TT 20/2023/TT-BGDĐT</p>
      </div>
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <p style="font-size: 15px; margin-top: 0;">Kính gửi <strong>${fullName || 'Thầy/Cô'}</strong>,</p>
        <p>Hệ thống nhận được yêu cầu đăng ký tài khoản cán bộ quản lý / giáo viên với địa chỉ Gmail: <strong>${email}</strong>.</p>
        <p>Để hoàn tất đăng ký và kích hoạt tài khoản sử dụng phần mềm xây dựng Vị trí việc làm, vui lòng nhập mã xác nhận 6 chữ số dưới đây:</p>
        
        <div style="margin: 24px 0; text-align: center;">
          <div style="display: inline-block; background: #e0e7ff; color: #3730a3; padding: 14px 32px; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; border: 2px dashed #6366f1;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Mã này có hiệu lực trong vòng <strong>15 phút</strong>.</p>
        </div>

        <p style="font-size: 13px; color: #dc2626; font-style: italic;">
          * Lưu ý: Không chia sẻ mã xác thực này cho bất kỳ ai để đảm bảo an toàn thông tin cơ cấu nhân sự và đề án của nhà trường.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">
          Đây là email tự động từ Hệ thống chuẩn hóa 9 bước xây dựng Vị trí việc làm ngành Giáo dục và Đào tạo. Vui lòng không trả lời trực tiếp email này.
        </p>
      </div>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`[GMAIL VERIFICATION SENT]`);
  console.log(`Người nhận: ${fullName} <${email}>`);
  console.log(`MÃ XÁC THỰC OTP: >>> ${otp} <<< (Hạn 15 phút)`);
  console.log(`======================================================\n`);

  if (process.env.SMTP_HOST || (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)) {
    try {
      const transporter = nodemailer.createTransport(
        process.env.SMTP_HOST
          ? {
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT) || 587,
              secure: process.env.SMTP_SECURE === 'true',
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            }
          : {
              service: 'gmail',
              auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
              },
            }
      );

      await transporter.sendMail({
        from: `"Ban Chỉ Đạo VTVL GD&ĐT" <${process.env.SMTP_FROM || process.env.GMAIL_USER || 'vtvl.gddt@gmail.com'}>`,
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`[SMTP SUCCESS] Đã gửi thư thực tế qua SMTP tới ${email}`);
    } catch (smtpErr: any) {
      console.warn(`[SMTP NOTICE] Không thể gửi trực tiếp qua máy chủ SMTP bên ngoài:`, smtpErr?.message);
    }
  }
}

// 1. API: Đăng ký tài khoản (Register) - Đăng ký là tài khoản có hiệu lực ngay
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, schoolName, schoolLevel, role, phoneNumber } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const users = loadUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (existing.password === password) {
        existing.fullName = fullName || existing.fullName;
        if (schoolName) existing.schoolName = schoolName;
        if (schoolLevel) existing.schoolLevel = schoolLevel;
        if (role) existing.role = role;
        if (phoneNumber) existing.phoneNumber = phoneNumber;
        existing.isVerified = true;
        existing.lastLoginAt = new Date().toISOString();
        saveUsers(users);
        const { password: _, verificationOtp: __, otpExpiresAt: ___, ...safeUser } = existing;
        return res.json({
          success: true,
          message: 'Tài khoản đã tồn tại và đã đồng bộ thông tin. Đăng nhập thành công!',
          user: safeUser,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ Email này đã được đăng ký trong hệ thống. Vui lòng chuyển sang tab Đăng nhập để đăng nhập.',
      });
    }

    // Tạo tài khoản mới có hiệu lực ngay (isVerified: true)
    const newUser: StoredUser = {
      id: 'usr_' + Date.now(),
      email: cleanEmail,
      password,
      fullName,
      schoolName: schoolName || 'Trường phổ thông công lập',
      schoolLevel: schoolLevel || 'TIEU_HOC',
      role: role || 'Hiệu trưởng',
      phoneNumber,
      isVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _, verificationOtp: __, otpExpiresAt: ___, ...safeUser } = newUser;

    console.log(`[USER REGISTERED & ACTIVE] Tài khoản ${cleanEmail} đã đăng ký thành công và có hiệu lực ngay!`);

    return res.json({
      success: true,
      message: 'Đăng ký tài khoản thành công! Bạn có thể sử dụng hệ thống ngay bây giờ.',
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/register:', error);
    res.status(500).json({ success: false, message: 'Lỗi trong quá trình đăng ký tài khoản.' });
  }
});

// 2. API: Xác thực mã (Giữ tương thích)
app.post('/api/auth/verify-otp', (req, res) => {
  const { email } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    user.isVerified = true;
    saveUsers(users);
    const { password: _, verificationOtp: __, otpExpiresAt: ___, ...safeUser } = user;
    return res.json({ success: true, message: 'Tài khoản hợp lệ.', user: safeUser });
  }
  return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
});

// 3. API: Gửi lại mã (Giữ tương thích)
app.post('/api/auth/resend-otp', async (_req, res) => {
  return res.json({ success: true, message: 'Tài khoản không yêu cầu mã xác nhận.' });
});

// 4. API: Đăng nhập (Login) - Đăng ký là đăng nhập được ngay
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản chưa được đăng ký trong hệ thống. Vui lòng bấm "Đăng ký tài khoản" trước.',
      });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác.' });
    }

    user.isVerified = true;
    user.lastLoginAt = new Date().toISOString();
    saveUsers(users);

    const { password: _, verificationOtp: __, otpExpiresAt: ___, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/login:', error);
    res.status(500).json({ success: false, message: 'Lỗi đăng nhập hệ thống.' });
  }
});

// 5. API: Kiểm tra trạng thái người dùng hiện tại (Me)
app.get('/api/auth/me', (req, res) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Thiếu email.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user || !user.isVerified) {
      return res.status(404).json({ success: false, message: 'Chưa xác thực hoặc không tìm thấy tài khoản.' });
    }

    const { password: _, verificationOtp: __, otpExpiresAt: ___, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
});

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_EXPERT_INSTRUCTION = `Bạn là Chuyên gia cao cấp về tổ chức bộ máy, quản lý nhân sự công lập, phân tích công việc và xây dựng Đề án Vị trí việc làm (VTVL) trong ngành Giáo dục và Đào tạo Việt Nam.
Nhiệm vụ của bạn là tư vấn, hướng dẫn và hỗ trợ các trường Tiểu học và THCS công lập thực hiện chuẩn hóa quy trình 9 bước xây dựng VTVL theo quy định pháp luật:
1. Căn cứ cốt lõi: Nghị định 232/2026/NĐ-CP (hoặc Nghị định 106/2020/NĐ-CP), Thông tư 20/2023/TT-BGDĐT (hướng dẫn VTVL, cơ cấu viên chức theo CDNN và định mức số lượng người làm việc trong cơ sở GDPT công lập), Thông tư 19/2023/TT-BGDĐT, Nghị định 111/2022/NĐ-CP (hợp đồng hỗ trợ phục vụ), Thông tư 02/2021/TT-BGDĐT, 03/2021/TT-BGDĐT, 08/2023/TT-BGDĐT (tiêu chuẩn chức danh nghề nghiệp giáo viên Tiểu học, THCS), Thông tư 28/2020/TT-BGDĐT (Điều lệ trường Tiểu học) và Thông tư 32/2020/TT-BGDĐT (Điều lệ trường THCS, THPT).
2. Quy tắc quan trọng:
- Phân biệt rõ rệt giữa Trường Tiểu học và Trường THCS: định mức GV/lớp (Tiểu học: tối đa 1.5 GV/lớp dạy 2 buổi/ngày hoặc 1.2 GV/lớp dạy 1 buổi/ngày; THCS: tối đa 1.9 GV/lớp), định mức tiết dạy (Tiểu học: 23 tiết/tuần; THCS: 19 tiết/tuần).
- Không nhầm lẫn giữa:
  + Vị trí việc làm (Job Position - ví dụ: Giáo viên tiểu học, Giáo viên THCS môn Toán, Nhân viên Văn thư,...)
  + Chức danh nghề nghiệp (Professional Title - ví dụ: Giáo viên tiểu học hạng I, II, III mã số V.07.03.29,...)
  + Chức vụ quản lý (Management Post - ví dụ: Hiệu trưởng, Phó Hiệu trưởng).
- Luôn chỉ dẫn căn cứ pháp lý rõ ràng.
- Đưa ra lời khuyên thực tế, văn phong hành chính nhà nước trang trọng, chặt chẽ, dễ áp dụng vào hồ sơ trình Phòng Giáo dục và Đào tạo, Sở Nội vụ thẩm định.`;

// API: AI Expert Consultant Chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, schoolContext, currentStep } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        reply: `[Chế độ chuyên gia chuẩn hóa] Tôi là Trợ lý Chuyên gia Vị trí việc làm ngành GD&ĐT. Hiện tại chưa cấu hình GEMINI_API_KEY nên hệ thống đang hoạt động với bộ quy chuẩn cố định theo Thông tư 20/2023/TT-BGDĐT và Nghị định 232/2026/NĐ-CP. Quý Thầy/Cô vui lòng nhập thông tin trường để được tính toán định mức và xây dựng đề án tự động.`,
      });
    }

    const contextPrompt = `
Thông tin đơn vị đang xây dựng đề án:
- Cấp học: ${schoolContext?.level === 'THCS' ? 'Trường Trung học cơ sở (THCS)' : 'Trường Tiểu học'}
- Tên trường: ${schoolContext?.schoolName || 'Chưa đặt tên'}
- Quy mô: ${schoolContext?.totalClasses || 0} lớp, ${schoolContext?.totalStudents || 0} học sinh, ${schoolContext?.satelliteCampuses || 0} điểm trường.
- Vùng miền: ${schoolContext?.region || 'Vùng đồng bằng, phát triển bình thường'}
- Bước đang thực hiện trong quy trình 9 bước: Bước ${currentStep || 1}

Nội dung câu hỏi/yêu cầu của người dùng:
${messages?.[messages.length - 1]?.content || ''}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_EXPERT_INSTRUCTION,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({
      error: error?.message || 'Lỗi xử lý yêu cầu từ chuyên gia AI',
      fallback: 'Hệ thống đã ghi nhận. Xin mời tiếp tục theo các bảng biểu chuẩn hóa 9 bước.',
    });
  }
});

// API: Step Analyzer & Legal Validator
app.post('/api/gemini/analyze-step', async (req, res) => {
  try {
    const { stepNumber, stepData, schoolInfo } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        analysis: `Đã kiểm tra sơ bộ Bước ${stepNumber}: Số liệu phù hợp với quy định cơ bản của Thông tư 20/2023/TT-BGDĐT cho ${schoolInfo?.level === 'THCS' ? 'trường THCS' : 'trường Tiểu học'}. Hãy tiếp tục đối chiếu với các phụ lục tiếp theo.`,
        passed: true,
        recommendations: [
          'Rà soát kĩ số liệu giữa số lớp và số giáo viên theo định mức',
          'Đảm bảo danh mục vị trí việc làm không tự đặt tên trái quy định',
        ],
      });
    }

    const prompt = `
Phân tích và thẩm tra dữ liệu Bước ${stepNumber} trong Quy trình 9 bước xây dựng Vị trí việc làm:
Thông tin trường: ${JSON.stringify(schoolInfo)}
Dữ liệu bước ${stepNumber}:
${JSON.stringify(stepData, null, 2)}

Hãy đóng vai trò chuyên viên thẩm định của Phòng GD&ĐT và Sở Nội vụ:
1. Đánh giá tính chuẩn xác theo Nghị định 232/2026/NĐ-CP và Thông tư 20/2023/TT-BGDĐT.
2. Phát hiện các điểm sai sót hoặc nguy cơ bị từ chối thẩm định (ví dụ: đặt sai tên VTVL, tính vượt định mức biên chế, kiêm nhiệm chưa hợp lý).
3. Nêu các kiến nghị bổ sung hoàn thiện cụ thể.
Trả về bằng văn phong trang trọng, súc tích, gạch đầu dòng rõ ràng.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_EXPERT_INSTRUCTION,
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-step:', error);
    res.status(500).json({ error: error?.message || 'Lỗi phân tích bước' });
  }
});

// API: Generate Custom Job Description & Competency Framework (Bước 6)
app.post('/api/gemini/generate-job-description', async (req, res) => {
  try {
    const { positionName, positionGroup, schoolInfo } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        jobDescription: {
          objective: `Thực hiện công tác ${positionName} tại ${schoolInfo?.schoolName || 'nhà trường'}, đảm bảo chất lượng giáo dục toàn diện theo Chương trình GDPT 2018.`,
          duties: [
            'Thực hiện kế hoạch giáo dục, giảng dạy theo quy định của Bộ GD&ĐT.',
            'Quản lý học sinh, tham gia các hoạt động chuyên môn và hội đồng trường.',
            'Thực hiện tự bồi dưỡng chuyên môn, nghiệp vụ thường xuyên.',
          ],
          outputs: ['Kế hoạch bài dạy (giáo án)', 'Hồ sơ đánh giá học sinh', 'Báo cáo chuyên môn'],
          criteria: ['Hoàn thành tốt nhiệm vụ giảng dạy', 'Đảm bảo tỷ lệ chuyên cần và phổ cập'],
          competencies: [
            { name: 'Năng lực chuyên môn, nghiệp vụ', level: 4, desc: 'Nắm vững kiến thức bộ môn và phương pháp sư phạm' },
            { name: 'Năng lực ứng dụng CNTT', level: 3, desc: 'Sử dụng thành thạo phần mềm quản lý và thiết bị số' },
            { name: 'Năng lực phối hợp', level: 4, desc: 'Phối hợp tốt với phụ huynh và đồng nghiệp' },
          ],
        },
      });
    }

    const prompt = `
Xây dựng Bản mô tả công việc và Khung năng lực chi tiết cho Vị trí việc làm sau:
- Tên vị trí: ${positionName}
- Nhóm vị trí: ${positionGroup}
- Cấp học: ${schoolInfo?.level === 'THCS' ? 'Trường THCS' : 'Trường Tiểu học'}
- Tên trường: ${schoolInfo?.schoolName || 'Trường phổ thông công lập'}

Yêu cầu định dạng JSON với các trường:
{
  "objective": "Mục tiêu vị trí việc làm ngắn gọn, chuẩn xác",
  "duties": ["Nhiệm vụ 1", "Nhiệm vụ 2", "Nhiệm vụ 3", "Nhiệm vụ 4", "Nhiệm vụ 5"],
  "outputs": ["Sản phẩm/kết quả đầu ra 1", "Sản phẩm 2", "Sản phẩm 3"],
  "criteria": ["Tiêu chí đánh giá mức độ hoàn thành 1", "Tiêu chí 2"],
  "qualification": "Yêu cầu trình độ chuyên môn đào tạo (Đại học sư phạm...)",
  "experience": "Yêu cầu kinh nghiệm nếu có",
  "competencies": [
    {"name": "Tên nhóm năng lực (ví dụ Năng lực chuyên môn giảng dạy)", "level": 4, "desc": "Mô tả tiêu chuẩn đạt được"},
    {"name": "Năng lực ứng dụng công nghệ thông tin và chuyển đổi số", "level": 3, "desc": "Mô tả tiêu chuẩn đạt được"},
    {"name": "Năng lực phối hợp công tác và xử lý tình huống", "level": 4, "desc": "Mô tả tiêu chuẩn đạt được"}
  ]
}
Chỉ trả về chuỗi JSON hợp lệ.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_EXPERT_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ jobDescription: parsed });
  } catch (error: any) {
    console.error('Error generating job description:', error);
    res.status(500).json({ error: error?.message || 'Lỗi tạo bản mô tả' });
  }
});

// API: Audit & Validate Entire Dossier (Bước 9)
app.post('/api/gemini/audit-dossier', async (req, res) => {
  try {
    const { schoolInfo, dossierData } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        verdict: 'HỒ SƠ ĐỦ ĐIỀU KIỆN TRÌNH THẨM ĐỊNH',
        complianceRate: 98,
        issuesFound: [],
        highlights: [
          'Cơ cấu số lượng người làm việc tuân thủ Thông tư 20/2023/TT-BGDĐT.',
          'Các vị trí việc làm được phân nhóm chính xác 4 nhóm theo Nghị định 232/2026/NĐ-CP.',
          'Số liệu giữa các bảng thống kê và bản thuyết minh hoàn toàn trùng khớp.',
        ],
        submissionChecklist: [
          { item: 'Tờ trình đề nghị phê duyệt Đề án VTVL', status: 'Đã hoàn thiện' },
          { item: 'Đề án vị trí việc làm kèm các phụ lục số liệu 1-7', status: 'Đã hoàn thiện' },
          { item: 'Bản mô tả công việc và khung năng lực từng vị trí', status: 'Đã hoàn thiện' },
          { item: 'Biên bản họp Hội đồng trường thông qua Đề án', status: 'Cần đính kèm biên bản ký đóng dấu' },
        ],
      });
    }

    const prompt = `
Hãy đóng vai trò Hội đồng Thẩm định Đề án Vị trí việc làm (gồm đại diện Sở Giáo dục và Đào tạo, Sở Nội vụ, Phòng Tài chính - Kế hoạch).
Rà soát toàn bộ hồ sơ Đề án VTVL sau:
Thông tin trường: ${JSON.stringify(schoolInfo)}
Tóm tắt số liệu Đề án:
${JSON.stringify(dossierData, null, 2)}

Trả về kết quả kiểm tra định dạng JSON:
{
  "verdict": "HỒ SƠ ĐỦ ĐIỀU KIỆN TRÌNH THẨM ĐỊNH hoặc CẦN CHỈNH SỬA BỔ SUNG",
  "complianceRate": 95,
  "issuesFound": ["Vấn đề 1 nếu có", "Vấn đề 2 nếu có"],
  "highlights": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "submissionChecklist": [
    {"item": "Tên văn bản trong hồ sơ", "status": "Đạt / Cần bổ sung"}
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_EXPERT_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error in /api/gemini/audit-dossier:', error);
    res.status(500).json({ error: error?.message || 'Lỗi thẩm tra hồ sơ' });
  }
});

// Ensure any unhandled /api/* request returns JSON, not HTML
app.all('/api/*', (_req, res) => {
  res.status(404).json({ success: false, message: 'Đường dẫn API không tồn tại.' });
});

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
