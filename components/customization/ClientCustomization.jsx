'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';

// Featured colors for all products
const FEATURED_COLORS = [
  { name: 'Cognac Leather', hex: '#8B5E3C' },
  { name: 'Midnight Navy', hex: '#1F2A44' },
  { name: 'Sunset Terracotta', hex: '#C96A4A' },
  { name: 'Forest Green', hex: '#2F5D50' },
];

// Material options
const MATERIALS = [
  'Leather',
  'Velvet',
  'Boucle',
  'Linen',
  'Premium Fabric',
];

// Finish options
const FINISHES = [
  'Dark Walnut',
  'Natural Oak',
  'Matte Black',
  'Brushed Brass',
  'Polished Nickel',
];

// Product-specific add-ons
const PRODUCT_ADDONS = {
  recliner: ['Manual Glide', 'Power Motor'],
  pouffe: ['Hidden Seam', 'Contrast Piping'],
  sofa: ['Extended Depth', 'Premium Cushion Fill', 'Left or Right Chaise'],
  chair: ['Swivel Base', 'Accent Stitching'],
};

export default function LuxeCustomizationStudio() {
  const containerRef = useRef();
  const formRef = useRef();
  const progressRef = useRef([]);

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [customization, setCustomization] = useState({
    product: {
      id: '',
      name: '',
      quantity: 1,
    },
    color: {
      featured: null,
      custom: {
        name: '',
        code: '',
        picker: '',
      },
    },
    material: '',
    finish: '',
    addons: [],
    notes: '',
    reference: null,
    delivery: {
      contact: 'email',
      callTime: '',
      city: '',
      timeline: '',
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const totalSteps = 5;

  // GSAP animations
  useGSAP(
    () => {
      gsap.from('.step-badge', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
      });
    },
    { scope: containerRef }
  );

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorSelect = (color) => {
    setCustomization((prev) => ({
      ...prev,
      color: { ...prev.color, featured: color },
    }));
  };

  const handleAddonToggle = (addon) => {
    setSelectedAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
    setCustomization((prev) => ({
      ...prev,
      addons: selectedAddons.includes(addon)
        ? selectedAddons.filter((a) => a !== addon)
        : [...selectedAddons, addon],
    }));
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      // Scroll to top of form container instead of full page
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      // Scroll to top of form container instead of full page
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        productId: customization.product.id || '000000000000000000000000',
        productName: 'Premium Custom Furniture',
        quantity: customization.product.quantity,
        selectedFeaturedColor: customization.color.featured,
        customColorName: customization.color.custom.name,
        customColorCode: customization.color.custom.code,
        customColorPickerValue: customization.color.custom.picker,
        selectedMaterial: customization.material,
        selectedFinish: customization.finish,
        selectedAddons: selectedAddons,
        customDescription: customization.notes,
        preferredContactMethod: customization.delivery.contact,
        preferredCallTime: customization.delivery.callTime,
        deliveryCity: customization.delivery.city,
        expectedTimeline: customization.delivery.timeline,
      };

      const response = await fetch('/api/customizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit customization');
      }

      const data = await response.json();
      setReferenceId(data.referenceId);
      setSubmitted(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit customization. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <main className="relative min-h-screen overflow-hidden px-6 pb-20 pt-32 md:px-10 lg:px-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.15),transparent_30%),linear-gradient(115deg,rgba(18,14,11,0.95)_10%,rgba(48,32,23,0.6)_50%,rgba(18,14,11,0.95)_100%)]" />

        <div className="relative mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-theme-bronze/30 bg-theme-ink/40 px-8 py-16 text-center backdrop-blur-md"
          >
            {/* Success Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-theme-bronze to-theme-bronze/60"
            >
              <svg
                className="h-8 w-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>

            <h2 className="font-display text-3xl text-theme-ivory md:text-4xl mb-4">
              Request Submitted Successfully
            </h2>

            <p className="text-lg text-theme-ivory/80 mb-2">
              Thank you for your customization request!
            </p>
            <p className="text-base text-theme-ivory/60 mb-8">
              Our team will review your preferences shortly and contact you soon.
            </p>

            {/* Reference ID */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg border border-theme-bronze/20 bg-theme-bronze/10 px-6 py-4 mb-8"
            >
              <p className="text-xs uppercase tracking-widest text-theme-bronze mb-2">
                Reference ID
              </p>
              <p className="font-mono text-lg text-theme-ivory">{referenceId}</p>
            </motion.div>

            {/* Trust Badges */}
            <div className="mb-10 grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-4 backdrop-blur-sm">
                <p className="text-2xl mb-1">✓</p>
                <p className="text-xs text-theme-ivory/70">5-Year Warranty</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-4 backdrop-blur-sm">
                <p className="text-2xl mb-1">🤍</p>
                <p className="text-xs text-theme-ivory/70">White-Glove Delivery</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-4 backdrop-blur-sm">
                <p className="text-2xl mb-1">✨</p>
                <p className="text-xs text-theme-ivory/70">Handcrafted</p>
              </div>
            </div>

            <p className="mb-8 text-sm text-theme-ivory/60">
              Check your email for a detailed confirmation of your customization preferences.
            </p>

            <Link
              href="/"
              className="inline-block rounded-full bg-theme-bronze px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white hover:bg-theme-bronze/90 transition-all"
            >
              Return Home →
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-hidden px-4 pb-20 pt-28 sm:px-6 md:px-10 lg:px-20">
      {/* Ambient Backgrounds */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.15),transparent_30%),linear-gradient(115deg,rgba(18,14,11,0.95)_10%,rgba(48,32,23,0.6)_50%,rgba(18,14,11,0.95)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[10rem] h-[30rem] w-[30rem] rounded-full bg-theme-bronze/10 blur-[150px]" />
      <div className="pointer-events-none absolute right-[-4rem] top-[20rem] h-[25rem] w-[25rem] rounded-full bg-theme-olive/10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">
            Premium Customization
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-theme-ivory mb-6">
            Craft Your Signature Piece
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-theme-ivory/72">
            Create a bespoke furniture piece tailored to your style. Choose from our featured luxury colors or request custom shade. Our artisans will handcraft your vision.
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="mb-16 flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
              key={i}
              ref={(el) => (progressRef.current[i] = el)}
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={
                i < currentStep
                  ? { scale: 1, opacity: 1 }
                  : i === currentStep - 1
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.8, opacity: 0.4 }
              }
              className={`h-2 rounded-full transition-all ${
                i < currentStep
                  ? 'w-8 bg-theme-bronze'
                  : i === currentStep - 1
                  ? 'w-8 bg-theme-bronze/60'
                  : 'w-2 bg-theme-ivory/20'
              }`}
            />
          ))}
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Customer Info */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-8 backdrop-blur-md md:p-12"
              >
                <h2 className="mb-8 font-display text-2xl text-theme-ivory">
                  Your Information
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customerInfo.name}
                    onChange={(e) =>
                      handleCustomerInfoChange('name', e.target.value)
                    }
                    required
                    className="rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory placeholder-theme-ivory/40 backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={customerInfo.email}
                    onChange={(e) =>
                      handleCustomerInfoChange('email', e.target.value)
                    }
                    required
                    className="rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory placeholder-theme-ivory/40 backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      handleCustomerInfoChange('phone', e.target.value)
                    }
                    required
                    className="rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory placeholder-theme-ivory/40 backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none md:col-span-2"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Featured Colors */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-8 backdrop-blur-md md:p-12">
                  <h2 className="mb-2 font-display text-2xl text-theme-ivory">
                    Featured Luxury Colors
                  </h2>
                  <p className="mb-8 text-theme-ivory/60">
                    Select from our curated collection of premium finishes
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    {FEATURED_COLORS.map((color) => (
                      <motion.button
                        key={color.hex}
                        type="button"
                        onClick={() => {
                          handleColorSelect(color);
                          setShowCustomColor(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        className={`group relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                          customization.color.featured?.hex === color.hex
                            ? 'border-theme-bronze/80 bg-theme-bronze/10'
                            : 'border-theme-bronze/20 bg-white/5 hover:border-theme-bronze/40'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="h-12 w-12 rounded-lg shadow-lg"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div>
                            <p className="font-semibold text-theme-ivory">
                              {color.name}
                            </p>
                            <p className="text-sm text-theme-ivory/60">
                              {color.hex}
                            </p>
                          </div>
                        </div>
                        {customization.color.featured?.hex === color.hex && (
                          <div className="absolute right-4 top-4 text-theme-bronze">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Section */}
                <motion.div
                  className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-8 backdrop-blur-md md:p-12"
                >
                  <button
                    type="button"
                    onClick={() => setShowCustomColor(!showCustomColor)}
                    className="mb-6 flex w-full items-center justify-between rounded-lg border border-theme-bronze/20 bg-white/5 px-6 py-4 text-left transition-all hover:border-theme-bronze/40 hover:bg-white/10"
                  >
                    <span className="font-semibold text-theme-ivory">
                      Need Another Color?
                    </span>
                    <span className="text-theme-bronze">
                      {showCustomColor ? '−' : '+'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showCustomColor && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-theme-ivory">
                            Color Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Warm Sage, Burgundy Velvet"
                            value={customization.color.custom.name}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                color: {
                                  ...prev.color,
                                  custom: {
                                    ...prev.color.custom,
                                    name: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory placeholder-theme-ivory/40 backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-theme-ivory">
                            Color Code (HEX, RGB, or Pantone)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., #A8D8D8 or RGB(168, 216, 216)"
                            value={customization.color.custom.code}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                color: {
                                  ...prev.color,
                                  custom: {
                                    ...prev.color.custom,
                                    code: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory placeholder-theme-ivory/40 backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-theme-ivory">
                            Color Picker
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="color"
                              value={customization.color.custom.picker || '#A8D8D8'}
                              onChange={(e) =>
                                setCustomization((prev) => ({
                                  ...prev,
                                  color: {
                                    ...prev.color,
                                    custom: {
                                      ...prev.color.custom,
                                      picker: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="h-12 w-24 cursor-pointer rounded-lg border border-theme-bronze/20"
                            />
                            <div
                              className="h-12 w-24 rounded-lg shadow-lg"
                              style={{
                                backgroundColor:
                                  customization.color.custom.picker || '#A8D8D8',
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}

            {/* Step 3: Material & Finish */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-8 backdrop-blur-md md:p-12">
                  <h2 className="mb-6 font-display text-2xl text-theme-ivory">
                    Select Material
                  </h2>

                  <div className="grid gap-3 md:grid-cols-2">
                    {MATERIALS.map((material) => (
                      <button
                        key={material}
                        type="button"
                        onClick={() =>
                          setCustomization((prev) => ({
                            ...prev,
                            material,
                          }))
                        }
                        className={`rounded-lg border-2 px-6 py-4 text-left font-semibold transition-all ${
                          customization.material === material
                            ? 'border-theme-bronze/80 bg-theme-bronze/10 text-theme-ivory'
                            : 'border-theme-bronze/20 bg-white/5 text-theme-ivory hover:border-theme-bronze/40'
                        }`}
                      >
                        {material}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-8 backdrop-blur-md md:p-12">
                  <h2 className="mb-6 font-display text-2xl text-theme-ivory">
                    Select Finish
                  </h2>

                  <div className="grid gap-3 md:grid-cols-2">
                    {FINISHES.map((finish) => (
                      <button
                        key={finish}
                        type="button"
                        onClick={() =>
                          setCustomization((prev) => ({
                            ...prev,
                            finish,
                          }))
                        }
                        className={`rounded-lg border-2 px-6 py-4 text-left font-semibold transition-all ${
                          customization.finish === finish
                            ? 'border-theme-bronze/80 bg-theme-bronze/10 text-theme-ivory'
                            : 'border-theme-bronze/20 bg-white/5 text-theme-ivory hover:border-theme-bronze/40'
                        }`}
                      >
                        {finish}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Add-ons & Notes */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-8 backdrop-blur-md md:p-12">
                  <h2 className="mb-6 font-display text-2xl text-theme-ivory">
                    Optional Add-ons
                  </h2>

                  <div className="grid gap-3 md:grid-cols-2">
                    {['Premium Cushion Fill', 'Accent Stitching', 'Extended Depth', 'Swivel Base'].map((addon) => (
                      <button
                        key={addon}
                        type="button"
                        onClick={() => handleAddonToggle(addon)}
                        className={`rounded-lg border-2 px-6 py-4 text-left font-semibold transition-all flex items-center justify-between ${
                          selectedAddons.includes(addon)
                            ? 'border-theme-bronze/80 bg-theme-bronze/10 text-theme-ivory'
                            : 'border-theme-bronze/20 bg-white/5 text-theme-ivory hover:border-theme-bronze/40'
                        }`}
                      >
                        {addon}
                        {selectedAddons.includes(addon) && (
                          <svg className="h-5 w-5 text-theme-bronze" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-8 backdrop-blur-md md:p-12">
                  <label className="mb-4 block font-display text-2xl text-theme-ivory">
                    Additional Customization Notes
                  </label>
                  <p className="mb-4 text-sm text-theme-ivory/60">
                    Share any extra details such as preferred stitching, finish feel, inspiration, comfort preference, or delivery instructions.
                  </p>
                  <textarea
                    placeholder="Tell us everything you'd like us to know about your custom piece..."
                    value={customization.notes}
                    onChange={(e) =>
                      setCustomization((prev) => ({
                        ...prev,
                        notes: e.target.value.slice(0, 1000),
                      }))
                    }
                    maxLength={1000}
                    className="w-full h-32 rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory placeholder-theme-ivory/40 backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none resize-none"
                  />
                  <p className="mt-2 text-xs text-theme-ivory/40">
                    {customization.notes.length}/1000 characters
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 5: Delivery & Review */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-8 backdrop-blur-md md:p-12">
                  <h2 className="mb-6 font-display text-2xl text-theme-ivory">
                    Delivery Preferences
                  </h2>

                  <div className="grid gap-6">
                    <div>
                      <label className="mb-3 block font-semibold text-theme-ivory">
                        Preferred Contact Method
                      </label>
                      <select
                        value={customization.delivery.contact}
                        onChange={(e) =>
                          setCustomization((prev) => ({
                            ...prev,
                            delivery: { ...prev.delivery, contact: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-3 block font-semibold text-theme-ivory">
                        Preferred Call Time (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 9-12 PM weekdays"
                        value={customization.delivery.callTime}
                        onChange={(e) =>
                          setCustomization((prev) => ({
                            ...prev,
                            delivery: { ...prev.delivery, callTime: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory placeholder-theme-ivory/40 backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-3 block font-semibold text-theme-ivory">
                        Delivery City
                      </label>
                      <input
                        type="text"
                        placeholder="Your city"
                        value={customization.delivery.city}
                        onChange={(e) =>
                          setCustomization((prev) => ({
                            ...prev,
                            delivery: { ...prev.delivery, city: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory placeholder-theme-ivory/40 backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-3 block font-semibold text-theme-ivory">
                        Expected Timeline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Within 2 months"
                        value={customization.delivery.timeline}
                        onChange={(e) =>
                          setCustomization((prev) => ({
                            ...prev,
                            delivery: { ...prev.delivery, timeline: e.target.value },
                          }))
                        }
                        className="w-full rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-3 text-theme-ivory placeholder-theme-ivory/40 backdrop-blur-sm focus:border-theme-bronze/60 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Review Summary */}
                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-bronze/10 p-8 backdrop-blur-md md:p-12">
                  <h2 className="mb-6 font-display text-2xl text-theme-ivory">
                    Request Summary
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-theme-bronze mb-1">
                        Color
                      </p>
                      <p className="text-theme-ivory">
                        {customization.color.featured?.name || 'Custom'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-theme-bronze mb-1">
                        Material
                      </p>
                      <p className="text-theme-ivory">{customization.material || 'Not selected'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-theme-bronze mb-1">
                        Finish
                      </p>
                      <p className="text-theme-ivory">{customization.finish || 'Not selected'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-theme-bronze mb-1">
                        Add-ons
                      </p>
                      <p className="text-theme-ivory">
                        {selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="rounded-full border border-theme-bronze/40 px-8 py-4 font-semibold text-theme-ivory hover:bg-white/5 disabled:opacity-40 transition-all"
            >
              ← Back
            </button>

            {currentStep === totalSteps ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-theme-bronze px-8 py-4 font-semibold text-white hover:bg-theme-bronze/90 disabled:opacity-60 transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Customization Request →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextStep}
                className="rounded-full bg-theme-bronze px-8 py-4 font-semibold text-white hover:bg-theme-bronze/90 transition-all"
              >
                Next →
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}