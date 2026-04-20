'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/lib/api/browser';


const FEATURED_COLORS = [
  { name: 'Cognac Leather', hex: '#8B5E3C' },
  { name: 'Midnight Navy', hex: '#1F2A44' },
  { name: 'Sunset Terracotta', hex: '#C96A4A' },
  { name: 'Forest Green', hex: '#2F5D50' },
];


const MATERIALS = [
  'Leather',
  'Velvet',
  'Boucle',
  'Linen',
  'Premium Fabric',
];


const FINISHES = [
  'Dark Walnut',
  'Natural Oak',
  'Matte Black',
  'Brushed Brass',
  'Polished Nickel',
];

const SOFA_CONFIGURATIONS = [
  {
    value: 'One-Seater',
    eyebrow: 'Compact comfort',
    highlight: 'Best for quiet reading corners and layered lounge nooks.',
    description:
      'A one-seater sofa or armchair is perfect for creating a cosy nook or adding extra seating without overwhelming a room. These seats come in a wide range of silhouettes, from plush statement chairs to cleaner modern forms.',
    footprint: 'Small footprint',
    layout: 'Single statement seat',
    bestFor: 'Bedrooms, studies, lounge corners',
    details: ['Pairs well with accent lighting', 'Easy to move between rooms', 'Adds comfort without visual bulk'],
    surface:
      'linear-gradient(135deg, rgba(255,247,241,0.96) 0%, rgba(239,218,202,0.92) 52%, rgba(165,106,63,0.34) 100%)',
    glow: 'rgba(165,106,63,0.26)',
    accent: '#b57047',
  },
  {
    value: 'Two-Seater',
    eyebrow: 'Intimate seating',
    highlight: 'Made for compact living rooms and close conversations.',
    description:
      'A two-seater sofa or loveseat is ideal for smaller spaces or as a companion piece to a larger sofa. It creates an intimate seating arrangement while still bringing softness and elegance to the room.',
    footprint: 'Apartment friendly',
    layout: 'Loveseat format',
    bestFor: 'Studios, secondary lounges, paired seating plans',
    details: ['Keeps the room open and airy', 'Strong companion piece for larger sofas', 'Works beautifully in formal corners'],
    surface:
      'linear-gradient(135deg, rgba(249,243,255,0.96) 0%, rgba(223,212,240,0.92) 50%, rgba(91,78,122,0.3) 100%)',
    glow: 'rgba(91,78,122,0.24)',
    accent: '#6a5a8d',
  },
  {
    value: 'Three-Seater',
    eyebrow: 'Balanced everyday anchor',
    highlight: 'A versatile centrepiece for most living rooms.',
    description:
      'Three-seater sofas are a standard choice for many living rooms, offering generous seating without taking over the full plan. They balance comfort and style, making them one of the most flexible options in the collection.',
    footprint: 'Balanced footprint',
    layout: 'Classic living room anchor',
    bestFor: 'Family rooms, everyday hosting, main seating walls',
    details: ['Comfortable without feeling oversized', 'Fits both classic and modern interiors', 'Easy base for layered cushions and throws'],
    surface:
      'linear-gradient(135deg, rgba(245,250,244,0.96) 0%, rgba(214,229,212,0.92) 50%, rgba(60,99,78,0.3) 100%)',
    glow: 'rgba(60,99,78,0.24)',
    accent: '#4b745f',
  },
  {
    value: '3+2+1 Sofa Sets',
    eyebrow: 'Complete seating composition',
    highlight: 'Flexible multi-piece seating for larger entertaining spaces.',
    description:
      'This classic sofa set offers a cohesive look with flexible seating. Best suited for larger living rooms, it creates an inviting environment for both entertaining and lounging while keeping the whole space visually coordinated.',
    footprint: 'Large-room layout',
    layout: 'Three-piece set',
    bestFor: 'Formal lounges, family gathering rooms, hosting zones',
    details: ['Creates a finished full-room arrangement', 'Lets you spread seating across the plan', 'Keeps scale consistent across pieces'],
    surface:
      'linear-gradient(135deg, rgba(255,244,232,0.96) 0%, rgba(242,214,186,0.92) 50%, rgba(144,92,46,0.3) 100%)',
    glow: 'rgba(144,92,46,0.24)',
    accent: '#9e6a39',
  },
  {
    value: 'L-shaped Sofas',
    eyebrow: 'Room-defining layout',
    highlight: 'The most adaptive choice for families and social spaces.',
    description:
      'L-shaped sofas offer exceptional versatility and comfort with a broader seating layout. They are ideal for large families or homes that host often, and they can help define an open room while maximizing usable seating.',
    footprint: 'Expanded footprint',
    layout: 'Corner-hugging configuration',
    bestFor: 'Open plans, TV lounges, high-traffic family spaces',
    details: ['Makes corners work harder', 'Adds the most shared seating surface', 'Feels tailored in open layouts'],
    surface:
      'linear-gradient(135deg, rgba(239,246,252,0.96) 0%, rgba(205,224,236,0.92) 50%, rgba(61,100,128,0.3) 100%)',
    glow: 'rgba(61,100,128,0.24)',
    accent: '#4a7b9d',
  },
];

const DEFAULT_CUSTOM_COLOR_PICKER = '#A8D8D8';

function cleanString(value) {
  return String(value || '').trim();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanString(value));
}

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

/**
 * @param {{ products?: import('@/lib/productCatalog').ProductRecord[] }} props
 */
export default function LuxeCustomizationStudio({ products = [] }) {
  const containerRef = useRef();
  const formRef = useRef();
  const progressRef = useRef([]);


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
    sizeOrConfiguration: '',
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
  const [submissionError, setSubmissionError] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [hoveredSofaConfiguration, setHoveredSofaConfiguration] = useState(
    SOFA_CONFIGURATIONS[0].value
  );

  const totalSteps = 5;
  const customizableProducts = useMemo(
    () =>
      Array.isArray(products)
        ? products.filter((product) => product && product.active !== false && product.inStock !== false)
        : [],
    [products]
  );
  const selectedProduct =
    customizableProducts.find(
      (product) =>
        String(product.id || product._id) === cleanString(customization.product.id)
    ) || null;
  const featuredColorOptions = useMemo(() => {
    if (selectedProduct?.colors?.length) {
      return selectedProduct.colors.map((color, index) => ({
        name: color.name,
        image: color.image,
        hex: FEATURED_COLORS[index % FEATURED_COLORS.length]?.hex || FEATURED_COLORS[0].hex,
      }));
    }

    return FEATURED_COLORS;
  }, [selectedProduct]);
  const hasSelectedProduct =
    Boolean(cleanString(customization.product.id)) &&
    Boolean(cleanString(customization.product.name));
  const hasCustomerName = Boolean(cleanString(customerInfo.name));
  const hasCustomerEmail = isEmail(customerInfo.email);
  const hasCustomerPhone = Boolean(cleanString(customerInfo.phone));
  const hasCustomColor =
    Boolean(cleanString(customization.color.custom.name)) &&
    Boolean(
      cleanString(customization.color.custom.code) ||
        cleanString(customization.color.custom.picker)
    );
  const hasFeaturedColor = Boolean(customization.color.featured?.name);
  const hasMaterial = Boolean(cleanString(customization.material));
  const hasFinish = Boolean(cleanString(customization.finish));
  const hasDeliveryCity = Boolean(cleanString(customization.delivery.city));
  const hasExpectedTimeline = Boolean(cleanString(customization.delivery.timeline));
  const isSofaProduct = cleanString(selectedProduct?.category).toLowerCase() === 'sofa';
  const hasStepOneDetails =
    hasSelectedProduct && hasCustomerName && hasCustomerEmail && hasCustomerPhone;
  const hasSofaConfiguration =
    !isSofaProduct || Boolean(cleanString(customization.sizeOrConfiguration));
  const activeSofaConfiguration =
    SOFA_CONFIGURATIONS.find(
      (configuration) =>
        configuration.value === cleanString(customization.sizeOrConfiguration)
    ) ||
    SOFA_CONFIGURATIONS.find(
      (configuration) =>
        configuration.value === cleanString(hoveredSofaConfiguration)
    ) ||
    SOFA_CONFIGURATIONS[0];
  const stepCompletion = {
    1: hasStepOneDetails && hasSofaConfiguration,
    2: hasFeaturedColor || hasCustomColor,
    3: hasMaterial && hasFinish,
    4: true,
    5: hasDeliveryCity && hasExpectedTimeline,
  };
  const canContinue = Boolean(stepCompletion[currentStep]);
  const canSubmit = Object.values(stepCompletion).every(Boolean) && !isSubmitting;


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

  const handleProductSelect = (product) => {
    const nextColorNames = Array.isArray(product.colors) && product.colors.length
      ? product.colors.map((color) => color.name)
      : FEATURED_COLORS.map((color) => color.name);
    const nextIsSofa = cleanString(product.category).toLowerCase() === 'sofa';

    setCustomization((prev) => ({
      ...prev,
      product: {
        ...prev.product,
        id: String(product.id || product._id || ''),
        name: product.name,
        quantity:
          prev.product.quantity > 0
            ? Math.min(prev.product.quantity, product.stockQuantity || prev.product.quantity)
            : 1,
      },
      color:
        prev.color.featured &&
        !nextColorNames.includes(prev.color.featured?.name)
          ? {
              ...prev.color,
              featured: null,
            }
          : prev.color,
      sizeOrConfiguration: nextIsSofa ? prev.sizeOrConfiguration : '',
    }));
  };

  const handleColorSelect = (color) => {
    setCustomization((prev) => ({
      ...prev,
      color: {
        ...prev.color,
        featured: color,
        custom: {
          name: '',
          code: '',
          picker: '',
        },
      },
    }));
    setShowCustomColor(false);
  };

  const handleAddonToggle = (addon) => {
    setSelectedAddons((prev) => {
      const nextAddons = prev.includes(addon)
        ? prev.filter((entry) => entry !== addon)
        : [...prev, addon];

      setCustomization((current) => ({
        ...current,
        addons: nextAddons,
      }));

      return nextAddons;
    });
  };

  const handleCustomColorToggle = () => {
    setShowCustomColor((prev) => !prev);
    setCustomization((prev) => ({
      ...prev,
      color: {
        ...prev.color,
        featured: null,
        custom: {
          ...prev.color.custom,
          picker: prev.color.custom.picker || DEFAULT_CUSTOM_COLOR_PICKER,
        },
      },
    }));
  };

  const handleSofaConfigurationSelect = (value) => {
    setHoveredSofaConfiguration(value);
    setCustomization((prev) => ({
      ...prev,
      sizeOrConfiguration: value,
    }));
  };

  const handleNextStep = () => {
    if (!canContinue) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);

      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);

      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setSubmissionError('Please complete every required customization detail before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const payload = {
        customerName: cleanString(customerInfo.name),
        customerEmail: cleanString(customerInfo.email),
        customerPhone: cleanString(customerInfo.phone),
        productId: cleanString(customization.product.id),
        productName: cleanString(customization.product.name),
        quantity: customization.product.quantity,
        selectedFeaturedColor: hasFeaturedColor ? customization.color.featured : undefined,
        customColorName: cleanString(customization.color.custom.name),
        customColorCode: cleanString(customization.color.custom.code),
        customColorPickerValue: cleanString(customization.color.custom.picker),
        selectedMaterial: cleanString(customization.material),
        selectedFinish: cleanString(customization.finish),
        selectedAddons: selectedAddons,
        sizeOrConfiguration: cleanString(customization.sizeOrConfiguration),
        customDescription: cleanString(customization.notes),
        preferredContactMethod: cleanString(customization.delivery.contact) || 'email',
        preferredCallTime: cleanString(customization.delivery.callTime),
        deliveryCity: cleanString(customization.delivery.city),
        expectedTimeline: cleanString(customization.delivery.timeline),
      };

      const response = await fetch(getApiUrl('/api/customizations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ||
            errorData?.message ||
            'Failed to submit customization request.'
        );
      }

      const data = await response.json();
      setReferenceId(data.referenceId);
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionError(
        error instanceof Error
          ? error.message
          : 'Failed to submit customization. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  if (submitted) {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 pb-20 pt-28 sm:px-6 md:px-10 lg:px-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.15),transparent_30%),linear-gradient(115deg,rgba(18,14,11,0.95)_10%,rgba(48,32,23,0.6)_50%,rgba(18,14,11,0.95)_100%)]" />

        <div className="relative mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-theme-bronze/30 bg-theme-ink/40 px-5 py-12 text-center backdrop-blur-md sm:px-8 sm:py-16"
          >

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

            <h2 className="mb-4 font-display text-2xl text-theme-ivory sm:text-3xl md:text-4xl">
              Request Submitted Successfully
            </h2>

            <p className="text-lg text-theme-ivory/80 mb-2">
              Thank you for your customization request!
            </p>
            <p className="text-base text-theme-ivory/60 mb-8">
              Our team will review your preferences shortly and contact you soon.
            </p>


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


            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              className="inline-block w-full rounded-full bg-theme-bronze px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-all hover:bg-theme-bronze/90 sm:w-auto"
            >
              Return Home →
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-hidden px-4 pb-20 pt-24 sm:px-6 md:px-10 md:pt-28 lg:px-20">

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(circle_at_top_left,rgba(165,106,63,0.15),transparent_30%),linear-gradient(115deg,rgba(18,14,11,0.95)_10%,rgba(48,32,23,0.6)_50%,rgba(18,14,11,0.95)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[10rem] h-[30rem] w-[30rem] rounded-full bg-theme-bronze/10 blur-[150px]" />
      <div className="pointer-events-none absolute right-[-4rem] top-[20rem] h-[25rem] w-[25rem] rounded-full bg-theme-olive/10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-4xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center md:mb-16"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-theme-bronze">
            Premium Customization
          </p>
          <h1 className="mb-6 font-display text-3xl text-theme-ivory sm:text-4xl md:text-5xl lg:text-6xl">
            Craft Your Signature Piece
          </h1>
          <p className="mx-auto max-w-2xl text-base text-theme-ivory/72 sm:text-lg">
            Create a bespoke furniture piece tailored to your style. Choose from our featured luxury colors or request custom shade. Our artisans will handcraft your vision.
          </p>
        </motion.div>


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


        <form ref={formRef} onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          {submissionError ? (
            <div className="mb-8 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-100 backdrop-blur-md">
              {submissionError}
            </div>
          ) : null}

          <AnimatePresence mode="wait">

            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-5 backdrop-blur-md sm:p-8 md:p-12"
              >
                <h2 className="mb-8 font-display text-2xl text-theme-ivory">
                  Select Product And Share Your Information
                </h2>

                <div className="mb-10">
                  <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-theme-bronze">
                        Product To Customize
                      </p>
                      <p className="mt-2 text-sm text-theme-ivory/60">
                        Pick the piece you want our studio to tailor for you.
                      </p>
                    </div>
                    {selectedProduct ? (
                      <div className="rounded-full border border-theme-bronze/30 bg-theme-bronze/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                        {selectedProduct.category}
                      </div>
                    ) : null}
                  </div>

                  {customizableProducts.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {customizableProducts.map((product) => {
                        const active = cleanString(customization.product.id) === String(product.id || product._id);

                        return (
                          <button
                            key={String(product.id || product._id)}
                            type="button"
                            onClick={() => handleProductSelect(product)}
                            className={`overflow-hidden rounded-[1.5rem] border text-left transition-all ${
                              active
                                ? 'border-theme-bronze/80 bg-theme-bronze/12 shadow-[0_20px_50px_rgba(165,106,63,0.15)]'
                                : 'border-theme-bronze/20 bg-white/5 hover:border-theme-bronze/45 hover:bg-white/8'
                            }`}
                          >
                            <div className="aspect-[4/3] overflow-hidden bg-white/5">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="space-y-3 p-5">
                              <div>
                                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-theme-bronze/80">
                                  {product.eyebrow || product.category}
                                </p>
                                <h3 className="mt-2 text-lg font-semibold text-theme-ivory">
                                  {product.name}
                                </h3>
                              </div>
                              <p className="line-clamp-2 text-sm leading-6 text-theme-ivory/60">
                                {product.description}
                              </p>
                              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-base font-semibold text-theme-ivory">
                                  {formatCurrency(product.finalPrice || product.price)}
                                </span>
                                <span className="text-xs uppercase tracking-[0.24em] text-theme-ivory/50">
                                  {product.stockQuantity || product.stock} in stock
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-theme-bronze/20 bg-white/5 px-6 py-5 text-sm text-theme-ivory/70">
                      No customizable products are available right now.
                    </div>
                  )}

                  {selectedProduct ? (
                    <div className="mt-6 rounded-2xl border border-theme-bronze/20 bg-theme-bronze/10 p-5">
                      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-theme-bronze">
                            Selected Piece
                          </p>
                          <p className="mt-2 text-lg font-semibold text-theme-ivory">
                            {selectedProduct.name}
                          </p>
                        </div>
                        <div className="w-full sm:w-auto sm:min-w-[180px]">
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={Math.max(1, selectedProduct.stockQuantity || selectedProduct.stock || 1)}
                            value={customization.product.quantity}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                product: {
                                  ...prev.product,
                                  quantity: Math.max(
                                    1,
                                    Math.min(
                                      Number.parseInt(e.target.value || '1', 10) || 1,
                                      Math.max(1, selectedProduct.stockQuantity || selectedProduct.stock || 1)
                                    )
                                  ),
                                },
                              }))
                            }
                            className="w-full rounded-lg border border-theme-bronze/25 bg-white/5 px-4 py-3 text-theme-ivory focus:border-theme-bronze/60 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

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

                <div className="mt-10 rounded-[1.8rem] border border-theme-bronze/20 bg-white/5 p-5 sm:p-6">
                  <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-theme-bronze">
                        Sofa Varieties
                      </p>
                      <p className="mt-2 text-sm text-theme-ivory/60">
                        {isSofaProduct
                          ? 'Fill your step one details, then hover or tap a sofa name to preview its personality and choose the layout you want.'
                          : 'Choose a sofa from the product list to unlock the sofa-type explorer.'}
                      </p>
                    </div>
                    {cleanString(customization.sizeOrConfiguration) ? (
                      <div className="rounded-full border border-theme-bronze/30 bg-theme-bronze/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-bronze">
                        Selected {customization.sizeOrConfiguration}
                      </div>
                    ) : null}
                  </div>

                  {!isSofaProduct ? (
                    <div className="rounded-[1.4rem] border border-dashed border-theme-bronze/20 bg-theme-ink/20 px-5 py-6 text-sm leading-7 text-theme-ivory/64">
                      The sofa-style experience appears when the chosen product belongs to the sofa collection.
                    </div>
                  ) : !hasStepOneDetails ? (
                    <div className="rounded-[1.4rem] border border-dashed border-theme-bronze/20 bg-theme-ink/20 px-5 py-6 text-sm leading-7 text-theme-ivory/64">
                      Complete your product, name, email, and phone details first. Once those are filled, the sofa varieties below become interactive.
                    </div>
                  ) : (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                      <div className="space-y-3">
                        {SOFA_CONFIGURATIONS.map((configuration) => {
                          const isHovered =
                            activeSofaConfiguration.value === configuration.value;
                          const isSelected =
                            cleanString(customization.sizeOrConfiguration) ===
                            configuration.value;

                          return (
                            <button
                              key={configuration.value}
                              type="button"
                              onMouseEnter={() =>
                                setHoveredSofaConfiguration(configuration.value)
                              }
                              onFocus={() =>
                                setHoveredSofaConfiguration(configuration.value)
                              }
                              onClick={() =>
                                handleSofaConfigurationSelect(configuration.value)
                              }
                              className={`w-full rounded-[1.35rem] border px-4 py-4 text-left transition-all ${
                                isHovered || isSelected
                                  ? 'border-theme-bronze/65 bg-theme-bronze/12 shadow-[0_18px_40px_rgba(165,106,63,0.16)]'
                                  : 'border-theme-bronze/18 bg-white/4 hover:border-theme-bronze/40 hover:bg-white/8'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-theme-ivory">
                                    {configuration.value}
                                  </p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-theme-bronze/80">
                                    {configuration.eyebrow}
                                  </p>
                                </div>
                                {isSelected ? (
                                  <span className="rounded-full border border-theme-bronze/35 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-theme-bronze">
                                    chosen
                                  </span>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeSofaConfiguration.value}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -18 }}
                          transition={{ duration: 0.25 }}
                          className="relative overflow-hidden rounded-[1.8rem] border border-white/10 p-6 text-theme-ink shadow-[0_24px_60px_rgba(26,22,19,0.2)]"
                          style={{
                            background: activeSofaConfiguration.surface,
                            boxShadow: `0 30px 70px ${activeSofaConfiguration.glow}`,
                          }}
                        >
                          <div
                            className="absolute right-[-3rem] top-[-3rem] h-40 w-40 rounded-full blur-3xl"
                            style={{ backgroundColor: activeSofaConfiguration.glow }}
                          />
                          <div className="relative">
                            <p
                              className="text-[0.68rem] font-semibold uppercase tracking-[0.32em]"
                              style={{ color: activeSofaConfiguration.accent }}
                            >
                              {activeSofaConfiguration.eyebrow}
                            </p>
                            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="font-display text-3xl text-theme-ink">
                                  {activeSofaConfiguration.value}
                                </h3>
                                <p className="mt-3 max-w-xl text-sm leading-7 text-theme-ink/72">
                                  {activeSofaConfiguration.description}
                                </p>
                              </div>
                              <div
                                className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]"
                                style={{
                                  borderColor: `${activeSofaConfiguration.accent}55`,
                                  color: activeSofaConfiguration.accent,
                                  backgroundColor: 'rgba(255,255,255,0.42)',
                                }}
                              >
                                {activeSofaConfiguration.highlight}
                              </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                              {[
                                ['Footprint', activeSofaConfiguration.footprint],
                                ['Layout', activeSofaConfiguration.layout],
                                ['Best for', activeSofaConfiguration.bestFor],
                              ].map(([label, value]) => (
                                <div
                                  key={label}
                                  className="rounded-[1.1rem] border bg-white/48 px-4 py-4"
                                  style={{
                                    borderColor: `${activeSofaConfiguration.accent}33`,
                                  }}
                                >
                                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-theme-ink/52">
                                    {label}
                                  </p>
                                  <p className="mt-2 text-sm font-semibold text-theme-ink">
                                    {value}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-6 rounded-[1.2rem] border border-white/40 bg-white/38 px-4 py-4">
                              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-theme-ink/55">
                                Why this layout stands out
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {activeSofaConfiguration.details.map((detail) => (
                                  <span
                                    key={detail}
                                    className="rounded-full border border-white/55 bg-white/58 px-3 py-1.5 text-xs font-semibold text-theme-ink/78"
                                  >
                                    {detail}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}


            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-5 backdrop-blur-md sm:p-8 md:p-12">
                  <h2 className="mb-2 font-display text-2xl text-theme-ivory">
                    Featured Luxury Colors
                  </h2>
                  <p className="mb-8 text-theme-ivory/60">
                    {selectedProduct
                      ? `Select a finish direction for ${selectedProduct.name}`
                      : 'Select from our curated collection of premium finishes'}
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {featuredColorOptions.map((color) => (
                      <motion.button
                        key={`${color.name}-${color.hex}`}
                        type="button"
                        onClick={() => handleColorSelect(color)}
                        whileHover={{ scale: 1.02 }}
                        className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all sm:p-6 ${
                          customization.color.featured?.name === color.name
                            ? 'border-theme-bronze/80 bg-theme-bronze/10'
                            : 'border-theme-bronze/20 bg-white/5 hover:border-theme-bronze/40'
                        }`}
                      >
                        <div className="flex items-start gap-4 sm:items-center">
                          {color.image ? (
                            <img
                              src={color.image}
                              alt={color.name}
                              className="h-14 w-14 rounded-lg object-cover shadow-lg"
                            />
                          ) : (
                            <div
                              className="h-12 w-12 rounded-lg shadow-lg"
                              style={{ backgroundColor: color.hex }}
                            />
                          )}
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


                <motion.div
                  className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-5 backdrop-blur-md sm:p-8 md:p-12"
                >
                  <button
                    type="button"
                    onClick={handleCustomColorToggle}
                    className="mb-6 flex w-full items-center justify-between rounded-lg border border-theme-bronze/20 bg-white/5 px-4 py-4 text-left transition-all hover:border-theme-bronze/40 hover:bg-white/10 sm:px-6"
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
                                  featured: null,
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
                                  featured: null,
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
                          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                            <input
                              type="color"
                              value={customization.color.custom.picker || DEFAULT_CUSTOM_COLOR_PICKER}
                              onChange={(e) =>
                                setCustomization((prev) => ({
                                  ...prev,
                                  color: {
                                    ...prev.color,
                                    featured: null,
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
                                  customization.color.custom.picker || DEFAULT_CUSTOM_COLOR_PICKER,
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


            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-5 backdrop-blur-md sm:p-8 md:p-12">
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

                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-5 backdrop-blur-md sm:p-8 md:p-12">
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


            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-5 backdrop-blur-md sm:p-8 md:p-12">
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

                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-5 backdrop-blur-md sm:p-8 md:p-12">
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


            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-ink/40 p-5 backdrop-blur-md sm:p-8 md:p-12">
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


                <div className="rounded-2xl border border-theme-bronze/20 bg-theme-bronze/10 p-5 backdrop-blur-md sm:p-8 md:p-12">
                  <h2 className="mb-6 font-display text-2xl text-theme-ivory">
                    Request Summary
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-theme-bronze mb-1">
                        Product
                      </p>
                      <p className="text-theme-ivory">
                        {customization.product.name || 'Not selected'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-theme-bronze mb-1">
                        Quantity
                      </p>
                      <p className="text-theme-ivory">{customization.product.quantity}</p>
                    </div>
                    {cleanString(customization.sizeOrConfiguration) ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-theme-bronze mb-1">
                          Sofa Type
                        </p>
                        <p className="text-theme-ivory">
                          {customization.sizeOrConfiguration}
                        </p>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-theme-bronze mb-1">
                        Color
                      </p>
                      <p className="text-theme-ivory">
                        {customization.color.featured?.name ||
                          customization.color.custom.name ||
                          'Not selected'}
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


          <div className="mt-12 space-y-4">
            {((currentStep < totalSteps && !canContinue) ||
              (currentStep === totalSteps && !canSubmit)) ? (
              <p className="text-sm text-theme-ivory/60">
                Complete the required selections for this step before continuing.
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="w-full rounded-full border border-theme-bronze bg-theme-bronze px-8 py-4 font-semibold text-white transition-all hover:bg-theme-bronze/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              ← Back
            </button>

            {currentStep === totalSteps ? (
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-full bg-theme-bronze px-8 py-4 font-semibold text-white transition-all hover:bg-theme-bronze/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Customization Request →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!canContinue}
                className="w-full rounded-full bg-theme-bronze px-8 py-4 font-semibold text-white transition-all hover:bg-theme-bronze/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Next →
              </button>
            )}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
