import React, { useRef } from 'react';
import { Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormField, inputCls } from './FormField';
import { CustomSelect } from './CustomSelect';

export interface PlatformEntryData {
  id: string;
  platform: string;
  contentType: string;
  link: string;
  screenshots: File[];
  screenshotPreviews: string[];
}

interface PlatformEntryProps {
  entry: PlatformEntryData;
  index: number;
  showRemove: boolean;
  errors: Partial<Record<keyof PlatformEntryData, string>>;
  onChange: (id: string, field: keyof PlatformEntryData, value: string | File[]) => void;
  onRemove: (id: string) => void;
  platformOptions: Array<{ label: string; value: string }>;
  loadingPlatforms?: boolean;
}

export const PlatformEntry: React.FC<PlatformEntryProps> = ({
  entry,
  index,
  showRemove,
  errors,
  onChange,
  onRemove,
  platformOptions,
  loadingPlatforms = false,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentTypes = [
    { label: t('form.contenu.contentTypes.POST'), value: 'Publication' },
    { label: t('form.contenu.contentTypes.COMMENT'), value: 'Commentaire' },
    { label: t('form.contenu.contentTypes.IMAGE'), value: 'Photo' },
    { label: t('form.contenu.contentTypes.VIDEO'), value: 'Vidéo' },
    { label: t('form.contenu.contentTypes.PROFILE'), value: 'Profil' },
    { label: t('form.contenu.contentTypes.PAGE'), value: 'Groupe' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 2 - entry.screenshots.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining);
    onChange(entry.id, 'screenshots', [...entry.screenshots, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeScreenshot = (idx: number) => {
    const updated = entry.screenshots.filter((_, i) => i !== idx);
    onChange(entry.id, 'screenshots', updated);
  };

  return (
    <div className="relative border border-slate-200 dark:border-emc-border-strong rounded-2xl p-4 bg-slate-50/50 dark:bg-emc-elevated/30 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-emc-primary">
            {t('form.contenu.platformEntry', { index: index + 1 })}
          </span>
        </div>
        {showRemove && (
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('form.contenu.removePlatformBtn')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Custom Platform Select */}
        <FormField label={t('form.contenu.platformsTitle')} required error={errors.platform} htmlFor={`platform-${entry.id}`}>
          <CustomSelect
            id={`platform-${entry.id}`}
            options={platformOptions}
            value={entry.platform}
            onChange={(val) => onChange(entry.id, 'platform', val)}
            placeholder={loadingPlatforms ? '...' : t('form.contenu.selectPlatform')}
            error={!!errors.platform}
            searchable
          />
        </FormField>

        {/* Custom Content Type Select */}
        <FormField label={t('form.contenu.selectContentType')} required error={errors.contentType} htmlFor={`contentType-${entry.id}`}>
          <CustomSelect
            id={`contentType-${entry.id}`}
            options={contentTypes}
            value={entry.contentType}
            onChange={(val) => onChange(entry.id, 'contentType', val)}
            placeholder={t('form.contenu.selectContentType')}
            error={!!errors.contentType}
          />
        </FormField>
      </div>

      {/* Link URL */}
      <FormField
        label={t('form.contenu.contentUrlLabel')}
        required
        error={errors.link}
        htmlFor={`link-${entry.id}`}
      >
        <input
          id={`link-${entry.id}`}
          type="url"
          placeholder={t('form.contenu.contentUrlPlaceholder')}
          value={entry.link}
          onChange={(e) => onChange(entry.id, 'link', e.target.value)}
          className={inputCls(!!errors.link)}
        />
      </FormField>

      {/* Screenshots */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800 dark:text-emc-primary">
            {t('form.contenu.screenshotsLabel')} <span className="text-rose-500">*</span>
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            entry.screenshots.length >= 2
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
              : 'bg-slate-200/80 dark:bg-emc-surface-hover text-slate-700 dark:text-emc-secondary'
          }`}>
            {entry.screenshots.length} / 2
          </span>
        </div>

        {errors.screenshots && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{errors.screenshots}</p>
        )}

        {/* Previews */}
        {entry.screenshotPreviews.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {entry.screenshotPreviews.map((src, i) => (
              <div key={i} className="relative group">
                <img
                  src={src}
                  alt={`Capture ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-emc-border-strong shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-white bg-black/60 rounded px-1">Capture {i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload trigger */}
        {entry.screenshots.length < 2 && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id={`screenshots-${entry.id}`}
              onChange={handleFileChange}
            />
            <label
              htmlFor={`screenshots-${entry.id}`}
              className="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-emc-border-strong hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 text-xs font-semibold text-slate-700 dark:text-emc-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-all"
            >
              <Upload className="w-4 h-4 text-blue-500" />
              <ImageIcon className="w-4 h-4 text-slate-400" />
              {t('form.contenu.addScreenshotBtn')}
            </label>
          </div>
        )}

        {entry.screenshots.length >= 2 && (
          <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1 font-medium">
            <span>✓</span> {t('form.contenu.screenshotsMaxExceeded')}
          </p>
        )}
      </div>
    </div>
  );
};
