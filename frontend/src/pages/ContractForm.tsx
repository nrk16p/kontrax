import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateApi } from '../services/templateApi';
import type { ContractTemplate, TemplateField } from '../types/contract';

// ─── Step definitions ─────────────────────────────────────────────────────────

const GROUP_ORDER = ['party_a', 'party_b', 'property', 'terms', 'general'] as const;
const GROUP_LABELS: Record<string, string> = {
  party_a: 'ฝ่ายที่ 1 (ผู้ให้)',
  party_b: 'ฝ่ายที่ 2 (ผู้รับ)',
  property: 'ข้อมูลทรัพย์สิน',
  terms: 'เงื่อนไขสัญญา',
  general: 'ข้อมูลทั่วไป',
};

export default function ContractForm() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);

  // Load template
  useEffect(() => {
    if (!templateId) return;
    templateApi
      .getById(templateId)
      .then((res) => {
        setTemplate(res.data ?? null);
        // Pre-populate empty values
        const init: Record<string, string> = {};
        res.data?.fields.forEach((f) => { init[f.key] = ''; });
        setValues(init);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [templateId]);

  if (loading) return <LoadingState />;
  if (!template) return <div className="p-8 text-red-600">ไม่พบแบบสัญญา</div>;

  // ── Group fields by their group property ──
  const grouped = groupFields(template.fields);
  const steps = GROUP_ORDER.filter((g) => grouped[g]?.length > 0);
  const totalSteps = steps.length + 1; // +1 for Preview & Sign step
  const isLastStep = currentStep === steps.length; // Preview step

  // ── Validation for current step ──
  const validateStep = (): boolean => {
    if (isLastStep) return consentGiven;
    const stepGroup = steps[currentStep];
    const stepFields = grouped[stepGroup] ?? [];
    const newErrors: Record<string, string> = {};
    stepFields.forEach((f) => {
      if (f.required && !values[f.key]?.trim()) {
        newErrors[f.key] = 'กรุณากรอกข้อมูลนี้';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (isLastStep) {
      handleSaveDraft();
    } else {
      setCurrentStep((s) => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveDraft = async () => {
    if (!consentGiven) { setShowConsentModal(true); return; }
    setSaving(true);
    try {
      const res = await templateApi.saveDraft({
        templateId: template.id,
        fieldValues: values,
        consentGiven: true,
      });
      setSavedDraftId(res.data?.id ?? null);
      navigate(`/contracts/draft/${res.data?.id}`);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, val: string) => {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <button onClick={() => navigate('/templates')} className="text-gray-400 hover:text-gray-700 text-sm mr-3">
              ← ย้อนกลับ
            </button>
            <span className="font-semibold text-gray-900 text-sm">{template.name}</span>
          </div>
          {/* Step progress */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i < currentStep ? 'w-6 bg-blue-500' :
                  i === currentStep ? 'w-8 bg-blue-600' :
                  'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* ── Form Steps ── */}
        {!isLastStep && (
          <FormStep
            group={steps[currentStep]}
            fields={grouped[steps[currentStep]] ?? []}
            values={values}
            errors={errors}
            onChange={handleChange}
          />
        )}

        {/* ── Preview + Consent Step ── */}
        {isLastStep && (
          <PreviewStep
            template={template}
            values={values}
            consentGiven={consentGiven}
            onConsentChange={setConsentGiven}
          />
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium disabled:opacity-30 hover:bg-gray-50 transition"
          >
            ← ก่อนหน้า
          </button>

          <button
            onClick={handleNext}
            disabled={saving || (isLastStep && !consentGiven)}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin">⟳</span> กำลังบันทึก...
              </>
            ) : isLastStep ? (
              '💾 บันทึกแบบร่างและลงนาม →'
            ) : (
              'ถัดไป →'
            )}
          </button>
        </div>
      </div>

      {/* ── PDPA Consent Modal ── */}
      {showConsentModal && (
        <ConsentModal
          onAccept={() => { setConsentGiven(true); setShowConsentModal(false); }}
          onDecline={() => setShowConsentModal(false)}
        />
      )}
    </div>
  );
}

// ─── Form Step ────────────────────────────────────────────────────────────────

function FormStep({
  group,
  fields,
  values,
  errors,
  onChange,
}: {
  group: string;
  fields: TemplateField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">{GROUP_LABELS[group] ?? group}</h2>
      <p className="text-sm text-gray-400 mb-6">กรอกข้อมูลให้ครบถ้วน ข้อมูลจะถูกใช้ในสัญญาของคุณ</p>

      <div className="space-y-5">
        {fields.map((field) => (
          <FieldInput
            key={field.key}
            field={field}
            value={values[field.key] ?? ''}
            error={errors[field.key]}
            onChange={(val) => onChange(field.key, val)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Field Input ──────────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: TemplateField;
  value: string;
  error?: string;
  onChange: (val: string) => void;
}) {
  const baseClass = `w-full px-4 py-2.5 rounded-lg border text-sm transition ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
  } outline-none`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.type === 'textarea' && (
        <textarea
          className={`${baseClass} resize-y min-h-[80px]`}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      )}

      {field.type === 'select' && field.options && (
        <select
          className={baseClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">-- เลือก --</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {['text', 'email', 'number', 'phone', 'date'].includes(field.type) && (
        <input
          type={field.type === 'phone' ? 'tel' : field.type}
          className={baseClass}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.hint && !error && (
        <p className="text-xs text-gray-400 mt-1">ℹ {field.hint}</p>
      )}
      {error && <p className="text-xs text-red-500 mt-1">⚠ {error}</p>}
    </div>
  );
}

// ─── Preview Step ─────────────────────────────────────────────────────────────

function PreviewStep({
  template,
  values,
  consentGiven,
  onConsentChange,
}: {
  template: ContractTemplate;
  values: Record<string, string>;
  consentGiven: boolean;
  onConsentChange: (v: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">ตรวจสอบข้อมูลสัญญา</h2>
      <p className="text-sm text-gray-400 mb-6">โปรดตรวจสอบข้อมูลทั้งหมดก่อนบันทึกแบบร่าง</p>

      {/* Summary table */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-6">
        {template.fields.map((field) => (
          <div key={field.key} className="flex px-5 py-3 text-sm">
            <span className="w-44 flex-shrink-0 text-gray-500">{field.label}</span>
            <span className="text-gray-900 font-medium">
              {isPii(field.key)
                ? maskValue(values[field.key] ?? '')
                : values[field.key] || <span className="text-gray-300 italic">ไม่ได้กรอก</span>
              }
            </span>
          </div>
        ))}
      </div>

      {/* PDPA Consent */}
      <div className={`rounded-xl p-5 border-2 transition ${consentGiven ? 'border-green-400 bg-green-50' : 'border-amber-300 bg-amber-50'}`}>
        <p className="text-sm font-semibold text-gray-800 mb-2">🔐 ความยินยอมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</p>
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
          ข้อมูลส่วนบุคคลของคุณจะถูกจัดเก็บและใช้เพื่อจัดทำสัญญาเท่านั้น ข้อมูลจะถูกเข้ารหัสและไม่ถูกนำไปใช้เพื่อวัตถุประสงค์อื่นหรือเปิดเผยต่อบุคคลภายนอก โดยไม่ได้รับความยินยอมจากคุณ
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-green-600"
          />
          <span className="text-sm text-gray-700">
            ฉันยินยอมให้จัดเก็บและประมวลผลข้อมูลส่วนบุคคลของฉันตามนโยบาย PDPA ของ Kontrax
          </span>
        </label>
      </div>
    </div>
  );
}

// ─── PDPA Consent Modal ───────────────────────────────────────────────────────

function ConsentModal({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="font-bold text-lg text-gray-900 mb-3">🔐 ต้องการความยินยอม PDPA</h3>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          เพื่อดำเนินการต่อ คุณต้องให้ความยินยอมในการจัดเก็บข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
        </p>
        <div className="flex gap-3">
          <button onClick={onDecline} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
            ไม่ยินยอม
          </button>
          <button onClick={onAccept} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
            ยินยอม
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="text-4xl mb-3 animate-pulse">📄</div>
        <p className="text-sm">กำลังโหลดแบบฟอร์ม...</p>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupFields(fields: TemplateField[]): Record<string, TemplateField[]> {
  return fields.reduce<Record<string, TemplateField[]>>((acc, f) => {
    const g = f.group ?? 'general';
    if (!acc[g]) acc[g] = [];
    acc[g].push(f);
    return acc;
  }, {});
}

const PII_KEYS = ['landlord_id', 'tenant_id', 'employee_id'];
const isPii = (key: string) => PII_KEYS.includes(key);
const maskValue = (val: string) =>
  val ? 'X'.repeat(Math.max(0, val.length - 4)) + val.slice(-4) : '';
