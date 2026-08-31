import React, { useEffect, useState } from "react";
import { Plus, FileWarning } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FormField, inputCls } from "./FormField";
import { CustomSelect } from "./CustomSelect";
import { PlatformEntry } from "./PlatformEntry";
import type { SignalementFormData } from "./SignalementForm";
import type { PlatformEntryData } from "./PlatformEntry";
import { CyberViolenceService } from "../../services/cyberviolence.service";
import { PlatformsService } from "../../services/platforms.service";

interface ContenuStepProps {
  data: SignalementFormData["contenu"];
  errors: {
    violenceType?: string;
    violenceTypeOther?: string;
    description?: string;
    platforms?: Array<Partial<Record<keyof PlatformEntryData, string>>>;
  };
  onChange: (
    field: keyof SignalementFormData["contenu"],
    value: unknown,
  ) => void;
  onPlatformChange: (
    id: string,
    field: keyof PlatformEntryData,
    value: string | File[],
  ) => void;
  onAddPlatform: () => void;
  onRemovePlatform: (id: string) => void;
}

interface CyberViolence {
  id: number;
  name: string;
}

interface Platforme {
  id: number;
  name: string;
}

export const ContenuStep: React.FC<ContenuStepProps> = ({
  data,
  errors,
  onChange,
  onPlatformChange,
  onAddPlatform,
  onRemovePlatform,
}) => {
  const { t } = useTranslation();
  const [cyberViolences, setCyberViolences] = useState<CyberViolence[]>([]);
  const [loadingCyberViolences, setLoadingCyberViolences] = useState(true);
  const [platforms, setPlatforms] = useState<Platforme[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);

  useEffect(() => {
    const fetchCyberViolence = async () => {
      try {
        const data = await CyberViolenceService.getCyberViolence();
        setCyberViolences(data);
      } catch (error) {
        console.error("Erreur lors du chargement des cyberviolences:", error);
      } finally {
        setLoadingCyberViolences(false);
      }
    };
    fetchCyberViolence();
  }, []);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const data = await PlatformsService.getPlatforms();
        setPlatforms(data);
      } catch (error) {
        console.error("Erreur lors du chargement des platforms:", error);
      } finally {
        setLoadingPlatforms(false);
      }
    };
    fetchPlatforms();
  }, []);

  const platformOptions = platforms.map((platform) => ({
    label: platform.name,
    value: String(platform.id),
  }));

  const violenceOptions = [
    ...cyberViolences.map((violence) => ({
      label: violence.name,
      value: String(violence.id),
    })),
    {
      label: "Autre",
      value: "OTHER",
    },
  ];

  // Build screenshot previews whenever screenshots change
  useEffect(() => {
    const newPreviews = data.platforms.map((p) =>
      p.screenshots.map((file) =>
        file instanceof File ? URL.createObjectURL(file) : "",
      ),
    );

    // Update previews if different
    data.platforms.forEach((p, idx) => {
      const prevs = newPreviews[idx] || [];
      if (JSON.stringify(p.screenshotPreviews) !== JSON.stringify(prevs)) {
        onPlatformChange(p.id, "screenshotPreviews" as any, prevs as any);
      }
    });

    return () => {
      newPreviews.flat().forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.platforms.map((p) => p.screenshots).flat().length]);

  return (
    <div className="space-y-8">
      {/* Context banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <FileWarning className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            {t("form.contenu.bannerTitle")}
          </p>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
            {t("form.contenu.bannerSubtitle")}
          </p>
        </div>
      </div>

      {/* Violence type custom select */}
      <div className="space-y-4">
        <FormField
          label={t("form.contenu.violenceTypeTitle")}
          required
          error={errors.violenceType}
          htmlFor="violenceType"
        >
          <CustomSelect
            id="violenceType"
            options={violenceOptions}
            value={data.violenceType}
            onChange={(val) => onChange("violenceType", val)}
            placeholder={
              loadingCyberViolences
                ? "..."
                : t("form.contenu.selectViolenceType")
            }
            error={!!errors.violenceType}
            searchable
          />
        </FormField>

        {data.violenceType === "OTHER" && (
          <FormField
            label={t("form.contenu.otherViolenceType")}
            required
            error={errors.violenceTypeOther}
            htmlFor="violenceTypeOther"
          >
            <input
              id="violenceTypeOther"
              type="text"
              placeholder={t("form.contenu.otherViolenceType")}
              value={data.violenceTypeOther || ""}
              onChange={(e) => onChange("violenceTypeOther", e.target.value)}
              className={inputCls(!!errors.violenceTypeOther)}
            />
          </FormField>
        )}
      </div>

      {/* Description */}
      <div className="space-y-4">
        <FormField
          label={t("form.contenu.descriptionTitle")}
          error={errors.description}
          htmlFor="description"
        >
          <textarea
            id="description"
            rows={5}
            placeholder={t("form.contenu.descriptionPlaceholder")}
            value={data.description}
            onChange={(e) => onChange("description", e.target.value)}
            className={`${inputCls(!!errors.description)} resize-none`}
          />
        </FormField>
      </div>

      {/* Platforms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-emc-primary uppercase tracking-wide">
            {t("form.contenu.platformsTitle")}
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-emc-surface-hover text-slate-700 dark:text-emc-secondary">
            {data.platforms.length} / 5
          </span>
        </div>

        <div className="space-y-4">
          {data.platforms.map((entry, index) => (
            <PlatformEntry
              key={entry.id}
              entry={entry}
              index={index}
              showRemove={data.platforms.length > 1}
              errors={errors.platforms?.[index] || {}}
              onChange={onPlatformChange}
              onRemove={onRemovePlatform}
              platformOptions={platformOptions}
              loadingPlatforms={loadingPlatforms}
            />
          ))}
        </div>

        {data.platforms.length < 5 && (
          <button
            type="button"
            onClick={onAddPlatform}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-4 py-2.5 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            {t("form.contenu.addPlatformBtn")}
          </button>
        )}

        {data.platforms.length >= 5 && (
          <p className="text-center text-xs text-amber-600 dark:text-amber-400 py-2 font-medium">
            {t("form.contenu.maxPlatformsReached")}
          </p>
        )}
      </div>
    </div>
  );
};
