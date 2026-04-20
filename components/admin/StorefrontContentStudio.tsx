'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  UploadCloud,
} from 'lucide-react';
import { getApiUrl } from '@/lib/api/browser';
import type { AdminSettingsState } from '@/lib/adminSettings';
import { DEFAULT_SITE_CONTENT } from '@/lib/content/siteContent';

const PRELOAD_OPTIONS = ['none', 'metadata', 'auto'] as const;

function labelClass() {
  return 'mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-walnut/66 dark:text-theme-ivory/60';
}

function inputClass() {
  return 'w-full rounded-2xl border border-theme-line/60 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-theme-bronze dark:bg-white/6';
}

function cardClass() {
  return 'rounded-[1.6rem] border border-theme-line/50 bg-white/72 p-5 shadow-[0_18px_40px_rgba(49,30,21,0.05)] dark:bg-white/5';
}

function UploadButton({
  busy,
  accept,
  label,
  onSelect,
}: {
  busy: boolean;
  accept: string;
  label: string;
  onSelect: (file: File) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-theme-line/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-theme-walnut/72 transition hover:border-theme-bronze hover:text-theme-bronze dark:bg-white/6 dark:text-theme-ivory/68">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
      {busy ? 'Uploading' : label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={busy}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) {
            onSelect(file);
          }
          event.currentTarget.value = '';
        }}
      />
    </label>
  );
}

export default function StorefrontContentStudio({
  settings,
  setSettings,
  onSave,
  saving,
}: {
  settings: AdminSettingsState;
  setSettings: Dispatch<SetStateAction<AdminSettingsState>>;
  onSave: (nextSettings?: AdminSettingsState) => Promise<unknown>;
  saving: boolean;
}) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const latestSettingsRef = useRef(settings);
  const titleRows =
    settings.siteContent.hero.titleRows.length
      ? settings.siteContent.hero.titleRows
      : DEFAULT_SITE_CONTENT.hero.titleRows;

  useEffect(() => {
    latestSettingsRef.current = settings;
  }, [settings]);

  const uploadAsset = async (
    file: File,
    section: 'hero' | 'footer',
    slot: string,
    kind: 'image' | 'video'
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scope', 'site');
    formData.append('section', section);
    formData.append('slot', slot);
    formData.append('kind', kind);

    const response = await fetch(getApiUrl('/api/admin/uploads'), {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || 'Upload failed');
    }

    return String(data?.path || '');
  };

  const handleUpload = async (
    key: string,
    section: 'hero' | 'footer',
    slot: string,
    kind: 'image' | 'video',
    file: File,
    applyPath: (current: AdminSettingsState, path: string) => AdminSettingsState
  ) => {
    setUploadingKey(key);
    setApiError('');
    setSuccessMessage('');

    try {
      const path = await uploadAsset(file, section, slot, kind);
      const nextSettings = applyPath(latestSettingsRef.current, path);
      latestSettingsRef.current = nextSettings;
      setSettings(nextSettings);
      await onSave(nextSettings);
      setSuccessMessage('Asset uploaded and published live.');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    setApiError('');
    setSuccessMessage('');

    try {
      await onSave(settings);
      setSuccessMessage('Storefront content saved.');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to save storefront content.');
    }
  };

  return (
    <section className="rounded-[2rem] border border-theme-line/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(247,239,228,0.74))] p-6 shadow-[0_24px_70px_rgba(49,30,21,0.08)] dark:bg-[linear-gradient(145deg,rgba(47,36,30,0.46),rgba(24,18,15,0.76))] md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-theme-bronze">Storefront Content</p>
          <h2 className="mt-2 font-display text-3xl text-theme-ink dark:text-theme-ivory">Hero & Footer Media</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-theme-walnut/68 dark:text-theme-ivory/62">
            Change the hero video, footer burst video, supporting copy, and showroom messaging
            without touching code.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-theme-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-theme-bronze disabled:opacity-60 dark:bg-white dark:text-[var(--theme-contrast-ink)] sm:w-auto"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Saving' : 'Save Content'}
        </button>
      </div>

      {apiError ? (
        <div className="mb-5 flex items-center gap-3 rounded-[1.2rem] border border-red-400/30 bg-red-50/80 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {apiError}
        </div>
      ) : null}
      {successMessage ? (
        <div className="mb-5 flex items-center gap-3 rounded-[1.2rem] border border-emerald-400/30 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <div className={cardClass()}>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Hero Section</p>
              <p className="mt-2 text-sm leading-7 text-theme-walnut/64 dark:text-theme-ivory/58">
                Control the opening video, heading text, and scroll cue for the first fold.
              </p>
            </div>
            <UploadButton
              busy={uploadingKey === 'hero-video'}
              accept="video/mp4,video/webm,video/ogg"
              label="Upload Video"
              onSelect={(file) =>
                handleUpload('hero-video', 'hero', 'hero-video', 'video', file, (current, path) => ({
                  ...current,
                  siteContent: {
                    ...current.siteContent,
                    hero: {
                      ...current.siteContent.hero,
                      video: {
                        ...current.siteContent.hero.video,
                        src: path,
                      },
                    },
                  },
                }))
              }
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass()}>Eyebrow</label>
              <input
                value={settings.siteContent.hero.eyebrow}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      hero: { ...current.siteContent.hero, eyebrow: event.target.value },
                    },
                  }))
                }
                className={inputClass()}
              />
            </div>
            <div>
              <label className={labelClass()}>Scroll Hint</label>
              <input
                value={settings.siteContent.hero.scrollHint}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      hero: { ...current.siteContent.hero, scrollHint: event.target.value },
                    },
                  }))
                }
                className={inputClass()}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass()}>Description</label>
            <textarea
              rows={4}
              value={settings.siteContent.hero.description}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  siteContent: {
                    ...current.siteContent,
                    hero: { ...current.siteContent.hero, description: event.target.value },
                  },
                }))
              }
              className={inputClass()}
            />
          </div>

          <div className="mt-4 grid gap-4">
            {titleRows.map((row, index) => (
              <div key={`${row.className}-${index}`}>
                <label className={labelClass()}>{`Title Row ${index + 1}`}</label>
                <input
                  value={row.text}
                  onChange={(event) =>
                    setSettings((current) => {
                      const currentRows =
                        current.siteContent.hero.titleRows.length
                          ? current.siteContent.hero.titleRows
                          : DEFAULT_SITE_CONTENT.hero.titleRows;

                      return {
                        ...current,
                        siteContent: {
                          ...current.siteContent,
                          hero: {
                            ...current.siteContent.hero,
                            titleRows: currentRows.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, text: event.target.value }
                                : entry
                            ),
                          },
                        },
                      };
                    })
                  }
                  className={inputClass()}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass()}>Video Path</label>
              <input
                value={settings.siteContent.hero.video.src}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      hero: {
                        ...current.siteContent.hero,
                        video: { ...current.siteContent.hero.video, src: event.target.value },
                      },
                    },
                  }))
                }
                className={inputClass()}
                placeholder="/uploads/site/hero/videos/hero.mp4"
              />
            </div>

            <div>
              <label className={labelClass()}>MIME Type</label>
              <input
                value={settings.siteContent.hero.video.type}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      hero: {
                        ...current.siteContent.hero,
                        video: { ...current.siteContent.hero.video, type: event.target.value },
                      },
                    },
                  }))
                }
                className={inputClass()}
                placeholder="video/mp4"
              />
            </div>

            <div>
              <label className={labelClass()}>Preload</label>
              <select
                value={settings.siteContent.hero.video.preload || 'none'}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      hero: {
                        ...current.siteContent.hero,
                        video: {
                          ...current.siteContent.hero.video,
                          preload: event.target.value as
                            | 'none'
                            | 'metadata'
                            | 'auto',
                        },
                      },
                    },
                  }))
                }
                className={inputClass()}
              >
                {PRELOAD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <label className={labelClass()}>Poster Image</label>
                <UploadButton
                  busy={uploadingKey === 'hero-poster'}
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  label="Upload Poster"
                  onSelect={(file) =>
                    handleUpload('hero-poster', 'hero', 'hero-poster', 'image', file, (current, path) => ({
                      ...current,
                      siteContent: {
                        ...current.siteContent,
                        hero: {
                          ...current.siteContent.hero,
                          video: {
                            ...current.siteContent.hero.video,
                            poster: path,
                          },
                        },
                      },
                    }))
                  }
                />
              </div>
              <input
                value={settings.siteContent.hero.video.poster || ''}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      hero: {
                        ...current.siteContent.hero,
                        video: { ...current.siteContent.hero.video, poster: event.target.value },
                      },
                    },
                  }))
                }
                className={inputClass()}
                placeholder="/uploads/site/hero/images/poster.jpg"
              />
            </div>
          </div>
        </div>

        <div className={cardClass()}>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze">Footer Experience</p>
              <p className="mt-2 text-sm leading-7 text-theme-walnut/64 dark:text-theme-ivory/58">
                Update footer storytelling, tag chips, newsletter copy, and the burst animation.
              </p>
            </div>
            <UploadButton
              busy={uploadingKey === 'footer-video'}
              accept="video/mp4,video/webm,video/ogg"
              label="Upload Burst"
              onSelect={(file) =>
                handleUpload('footer-video', 'footer', 'footer-burst', 'video', file, (current, path) => ({
                  ...current,
                  siteContent: {
                    ...current.siteContent,
                    footer: {
                      ...current.siteContent.footer,
                      burstVideo: {
                        ...current.siteContent.footer.burstVideo,
                        src: path,
                      },
                    },
                  },
                }))
              }
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass()}>Brand Label</label>
              <input
                value={settings.siteContent.footer.brandLabel}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      footer: { ...current.siteContent.footer, brandLabel: event.target.value },
                    },
                  }))
                }
                className={inputClass()}
              />
            </div>
            <div>
              <label className={labelClass()}>Brand Name</label>
              <input
                value={settings.siteContent.footer.brandName}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      footer: { ...current.siteContent.footer, brandName: event.target.value },
                    },
                  }))
                }
                className={inputClass()}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass()}>Footer Description</label>
            <textarea
              rows={4}
              value={settings.siteContent.footer.description}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  siteContent: {
                    ...current.siteContent,
                    footer: { ...current.siteContent.footer, description: event.target.value },
                  },
                }))
              }
              className={inputClass()}
            />
          </div>

          <div className="mt-4">
            <label className={labelClass()}>Tags</label>
            <input
              value={settings.siteContent.footer.tags.join(', ')}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  siteContent: {
                    ...current.siteContent,
                    footer: {
                      ...current.siteContent.footer,
                      tags: event.target.value
                        .split(',')
                        .map((entry) => entry.trim())
                        .filter(Boolean),
                    },
                  },
                }))
              }
              className={inputClass()}
              placeholder="Furniture, Handmade, Studio"
            />
          </div>

          <div className="mt-4 grid gap-4">
            <div>
              <label className={labelClass()}>Newsletter Heading</label>
              <input
                value={settings.siteContent.footer.newsletterHeading}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      footer: {
                        ...current.siteContent.footer,
                        newsletterHeading: event.target.value,
                      },
                    },
                  }))
                }
                className={inputClass()}
              />
            </div>

            <div>
              <label className={labelClass()}>Newsletter Description</label>
              <textarea
                rows={4}
                value={settings.siteContent.footer.newsletterDescription}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      footer: {
                        ...current.siteContent.footer,
                        newsletterDescription: event.target.value,
                      },
                    },
                  }))
                }
                className={inputClass()}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass()}>Burst Video Path</label>
              <input
                value={settings.siteContent.footer.burstVideo.src}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      footer: {
                        ...current.siteContent.footer,
                        burstVideo: {
                          ...current.siteContent.footer.burstVideo,
                          src: event.target.value,
                        },
                      },
                    },
                  }))
                }
                className={inputClass()}
                placeholder="/uploads/site/footer/videos/footer-burst.mp4"
              />
            </div>

            <div>
              <label className={labelClass()}>MIME Type</label>
              <input
                value={settings.siteContent.footer.burstVideo.type}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      footer: {
                        ...current.siteContent.footer,
                        burstVideo: {
                          ...current.siteContent.footer.burstVideo,
                          type: event.target.value,
                        },
                      },
                    },
                  }))
                }
                className={inputClass()}
                placeholder="video/mp4"
              />
            </div>

            <div>
              <label className={labelClass()}>Preload</label>
              <select
                value={settings.siteContent.footer.burstVideo.preload || 'metadata'}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    siteContent: {
                      ...current.siteContent,
                      footer: {
                        ...current.siteContent.footer,
                        burstVideo: {
                          ...current.siteContent.footer.burstVideo,
                          preload: event.target.value as
                            | 'none'
                            | 'metadata'
                            | 'auto',
                        },
                      },
                    },
                  }))
                }
                className={inputClass()}
              >
                {PRELOAD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
