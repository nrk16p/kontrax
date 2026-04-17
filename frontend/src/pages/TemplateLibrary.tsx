import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateApi } from '../services/templateApi';
import type { ContractTemplate, TemplateCategory } from '../types/contract';
import { CATEGORY_LABELS } from '../types/contract';

const ALL_CATEGORIES = Object.entries(CATEGORY_LABELS) as [
  TemplateCategory,
  { th: string; en: string; icon: string }
][];

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');

  useEffect(() => {
    const cat = activeCategory === 'all' ? undefined : activeCategory;
    setLoading(true);
    templateApi
      .list(cat)
      .then((res) => setTemplates(res.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">เลือกแบบสัญญา</h1>
          <p className="mt-1 text-gray-500 text-sm">
            แบบฟอร์มสัญญามาตรฐานจัดทำโดยทนายความผู้เชี่ยวชาญ · ตรวจสอบและอัปเดตตามกฎหมายปัจจุบัน
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* ── Category Filter ── */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400'
            }`}
          >
            ทั้งหมด
          </button>
          {ALL_CATEGORIES.map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            >
              {meta.icon} {meta.th}
            </button>
          ))}
        </div>

        {/* ── States ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            เกิดข้อผิดพลาด: {error}
          </div>
        )}

        {!loading && !error && templates.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📄</p>
            <p>ไม่พบแบบสัญญาในหมวดนี้</p>
          </div>
        )}

        {/* ── Template Cards ── */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onSelect={() => navigate(`/contracts/new/${t.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onSelect,
}: {
  template: ContractTemplate;
  onSelect: () => void;
}) {
  const meta = CATEGORY_LABELS[template.category as TemplateCategory];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{meta?.icon ?? '📄'}</span>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          v{template.version}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{template.name}</h3>
      <p className="text-xs text-gray-400 mb-3">{template.nameEn}</p>
      <p className="text-xs text-gray-600 line-clamp-2 mb-4">{template.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          ⏱ ประมาณ {template.estimatedMinutes} นาที · {template.fields?.length ?? 0} ฟิลด์
        </span>
        <button
          onClick={onSelect}
          className="text-xs font-medium text-blue-600 group-hover:text-blue-700 group-hover:underline"
        >
          เลือก →
        </button>
      </div>
    </div>
  );
}
