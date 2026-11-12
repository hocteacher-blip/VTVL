import React, { useState, useRef, useEffect } from 'react';
import { ImpactFactors } from '../types/scheme';
import { askExpertConsultant } from '../services/geminiService';
import { Sparkles, Send, X, Bot, User, BookOpen, AlertCircle } from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schoolInfo: ImpactFactors;
  currentStep: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  schoolInfo,
  currentStep,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Kính chào Quý Thầy/Cô! Tôi là Chuyên gia cao cấp về vị trí việc làm và tổ chức nhân sự ngành Giáo dục & Đào tạo. 
Tôi đang đồng hành hỗ trợ ${schoolInfo.schoolName || 'nhà trường'} (${schoolInfo.level === 'LIEN_CAP_TH_THCS' ? 'Trường liên cấp Tiểu học & THCS' : schoolInfo.level === 'THCS' ? 'Cấp THCS' : 'Cấp Tiểu học'}) thực hiện Bước ${currentStep} theo Nghị định 232/2026/NĐ-CP và Thông tư 20/2023/TT-BGDĐT. 
Thầy/Cô có câu hỏi hoặc cần giải đáp về định mức giáo viên, chức danh nghề nghiệp, phương án kiêm nhiệm hay hồ sơ thẩm định?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: text.trim() }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await askExpertConsultant(newMsgs, schoolInfo, currentStep);
      setMessages([...newMsgs, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: 'Lỗi kết nối tới chuyên gia AI: ' + (err?.message || 'Vui lòng thử lại sau.'),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    schoolInfo.level === 'LIEN_CAP_TH_THCS'
      ? 'Định mức trường liên cấp TH & THCS theo Điều 14, 15 Thông tư 20/2023 tính thế nào?'
      : schoolInfo.level === 'THCS'
      ? 'Định mức giáo viên THCS theo Thông tư 20/2023 là bao nhiêu?'
      : 'Trường tiểu học học 2 buổi/ngày được bố trí tối đa bao nhiêu giáo viên/lớp?',
    'Phân biệt vị trí việc làm, chức danh nghề nghiệp và chức vụ quản lý',
    'Quy định kiêm nhiệm vị trí Thủ quỹ và CNTT trường học',
    'Thủ tục hồ sơ nộp thẩm định tại Sở Nội vụ và Phòng GD&ĐT',
    'Chỉ tiêu Bảo vệ và Tạp vụ theo Nghị định 111/2022/NĐ-CP tính như thế nào?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-600 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Chuyên gia Tư vấn VTVL
            </h3>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>{schoolInfo.schoolName}</span>
              <span>·</span>
              <span className="text-indigo-600 font-semibold">Bước {currentStep}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold ${
                m.role === 'user' ? 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900' : 'bg-indigo-600'
              }`}
            >
              {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 italic text-xs">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            <span>Chuyên gia đang tra cứu văn bản pháp luật và phản hồi...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Gợi ý câu hỏi nghiệp vụ:
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="text-[11px] text-left px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi chuyên gia về định mức, quy định, hồ sơ..."
            disabled={isLoading}
            className="flex-1 text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
