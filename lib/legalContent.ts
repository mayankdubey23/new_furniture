import type { SiteSettingRecord } from '@/lib/siteSettings';
import { ORDER_TRACKING_PREFIX, SITE_NAME } from '@/lib/brand';

export const LEGAL_LAST_UPDATED = 'April 17, 2026';

export interface LegalHighlight {
  label: string;
  value: string;
  detail: string;
}

export interface LegalSection {
  title: string;
  intro: string;
  points: string[];
  note?: string;
}

export interface LegalFaqEntry {
  id: string;
  question: string;
  answer: string;
}

export function getPrivacyHighlights(settings: SiteSettingRecord): LegalHighlight[] {
  return [
    {
      label: 'Account & Sign-In',
      value: 'Email, phone, and access credentials',
      detail: 'Used to sign you in, protect your account, and keep order updates connected to the right customer.',
    },
    {
      label: 'Checkout & Delivery',
      value: 'Addresses, order details, and tracking references',
      detail: `Used to process orders, generate ${ORDER_TRACKING_PREFIX} tracking IDs, and coordinate delivery updates.`,
    },
    {
      label: 'Preferences On Device',
      value: 'Cart, wishlist, and theme preference',
      detail: 'Stored locally in your browser so your saved pieces and visual preferences remain available between visits.',
    },
    {
      label: 'Support & Outreach',
      value: settings.email,
      detail: 'Contact forms, customization requests, and newsletter signups are routed through the studio support channels.',
    },
  ];
}

export function getTermsHighlights(): LegalHighlight[] {
  return [
    {
      label: 'Storefront Scope',
      value: 'Furniture catalog, customization, checkout, tracking',
      detail: 'These terms apply to browsing, signing in, placing orders, requesting customization, and using support tools on the site.',
    },
    {
      label: 'Payment Paths',
      value: 'Cash on Delivery and Razorpay',
      detail: 'Orders may be placed with COD or online payment when the Razorpay flow is available and successfully verified.',
    },
    {
      label: 'Order Controls',
      value: 'Stock, pricing, and identity checks',
      detail: 'We may review product availability, address details, and payment status before final fulfillment or dispatch.',
    },
    {
      label: 'Tracking Journey',
      value: `${ORDER_TRACKING_PREFIX} live status workflow`,
      detail: 'Orders move through pending, paid, shipped, and delivered milestones with notifications tied to the registered email.',
    },
  ];
}

export function getPrivacySections(settings: SiteSettingRecord): LegalSection[] {
  return [
    {
      title: 'What This Policy Covers',
      intro: `${SITE_NAME} collects and uses information only as needed to operate this storefront, manage customer accounts, process orders, handle customization requests, and provide support after purchase.`,
      points: [
        'This policy applies when you browse products, create an account, sign in, save items to cart or wishlist, submit customization requests, place orders, track shipments, contact the studio, or subscribe to updates.',
        'If you use optional sign-in methods such as Google OAuth or phone-based verification, the information made available by those flows is handled under this same policy.',
      ],
    },
    {
      title: 'Information We Collect',
      intro: 'The data collected depends on which parts of the storefront you use.',
      points: [
        'Account details such as your name, email address, phone number, encrypted password data, and sign-in method.',
        'Checkout information such as delivery name, email, phone, India address details, selected items, order notes, payment method, order reference, and tracking number.',
        'Customization request details such as selected product, colors, finishes, material choices, delivery city, preferred contact method, timeline, and project notes.',
        'Communication records such as contact-form submissions, newsletter subscriptions, and order-status notifications.',
        'Local browser data such as cart contents, wishlist items, and theme preference so your browsing experience stays consistent on your device.',
      ],
      note: 'Online payments are processed through Razorpay when enabled. We do not display or store full card details on this storefront.',
    },
    {
      title: 'How We Use Your Information',
      intro: 'Your information is used to run the services that are visible across the site today.',
      points: [
        'To create and manage customer accounts, authenticate sign-ins, and keep order updates connected to the correct registered email.',
        'To verify stock, confirm product availability, create orders, generate tracking references, and support delivery coordination.',
        'To review and respond to customization requests, contact messages, and support questions.',
        'To send confirmation emails, payment confirmations, shipment updates, delivery status notifications, and newsletter communications you request.',
        'To monitor store reliability, reduce abuse, and improve the experience of checkout, tracking, and customer support.',
      ],
    },
    {
      title: 'Payments, Orders, And Tracking',
      intro: 'Orders on this storefront can involve COD or online payment depending on the checkout path selected.',
      points: [
        'Cash on Delivery orders still create an order record, tracking ID, and delivery workflow inside the storefront.',
        'Online payment orders use Razorpay for payment authorization and verification before the order is marked as paid.',
        `Tracking IDs beginning with ${ORDER_TRACKING_PREFIX} are created so you can follow order progress through pending, paid, shipped, and delivered states.`,
        'When you are signed in with the same email used for the order, website notifications can also display order updates alongside email communication.',
      ],
    },
    {
      title: 'How Information May Be Shared',
      intro: 'We only share data with tools required to run the services offered on the storefront.',
      points: [
        'Payment data needed to complete online checkout may be shared with Razorpay.',
        'Order-status emails may be sent through configured email delivery providers such as Resend.',
        'Optional phone verification may involve configured verification providers such as Twilio when that flow is enabled.',
        'Optional Google sign-in involves Google account data required to verify identity and create or link your user account.',
        'We may disclose information if reasonably required to protect the storefront, prevent fraud, resolve disputes, or comply with applicable law.',
      ],
    },
    {
      title: 'Data Retention And Security',
      intro: 'We keep information for as long as it is reasonably needed to operate the storefront and serve customers.',
      points: [
        'Account and order records may be retained for support history, order tracking, dispute resolution, and operational reporting.',
        'Customization, contact, and newsletter records may be retained until they are no longer needed for communication or service continuity.',
        'We use reasonable technical and administrative measures to protect stored information, but no internet-based system can promise absolute security.',
      ],
    },
    {
      title: 'Your Choices',
      intro: 'You remain in control of many customer-facing actions.',
      points: [
        'You can choose whether to create an account, whether to save items in cart or wishlist, and whether to subscribe to newsletter updates.',
        'You can contact the studio to request correction or deletion of inaccurate customer information, subject to records required for completed orders and compliance needs.',
        'If you prefer not to keep browser-stored cart, wishlist, or theme preference data, you can clear your local browser storage.',
      ],
    },
    {
      title: 'Contact For Privacy Questions',
      intro: 'Questions about this policy or requests related to your information can be directed to the studio.',
      points: [
        `Email: ${settings.email}`,
        `Phone: ${settings.phone}`,
        `Address: ${settings.address}`,
      ],
      note: 'Use the contact page for the fastest support on account, order, customization, or privacy-related requests.',
    },
  ];
}

export function getTermsSections(settings: SiteSettingRecord): LegalSection[] {
  return [
    {
      title: 'Using The Storefront',
      intro: `By accessing ${SITE_NAME}, you agree to use the storefront only for lawful browsing, account access, product discovery, customization requests, checkout, and order support.`,
      points: [
        'You must not misuse the site, interfere with its operation, scrape protected content, attempt unauthorized access, or submit misleading customer details.',
        'We may update or suspend parts of the storefront, including admin-controlled content, availability, or maintenance access, when necessary for operations or security.',
      ],
    },
    {
      title: 'Accounts And Customer Information',
      intro: 'You are responsible for the accuracy of the information you provide.',
      points: [
        'If you register or sign in, your email, phone, and account credentials must be current and controlled by you.',
        'If you place an order while signed in, the registered email may be used as the primary address for confirmations, tracking, and follow-up communication.',
        'You are responsible for maintaining the confidentiality of your account and promptly reporting unauthorized access.',
      ],
    },
    {
      title: 'Products, Availability, And Pricing',
      intro: 'The storefront presents current catalog information, but some checks still happen at order time.',
      points: [
        'Product descriptions, media, pricing, and stock quantities are presented in good faith but may be updated from time to time.',
        'An item may become unavailable, inactive, or out of stock before checkout is fully completed.',
        'We reserve the right to correct catalog errors, limit quantities, or refuse an order where pricing, stock, or product data is clearly inaccurate.',
      ],
    },
    {
      title: 'Orders And Payment',
      intro: 'Orders are only accepted once required validation has been completed.',
      points: [
        'Structured checkout currently supports India delivery addresses and requires valid delivery information before an order can proceed.',
        'Orders may be placed with Cash on Delivery or online payment when Razorpay is available and payment verification succeeds.',
        'For online payment, an order may remain pending until payment verification is completed successfully.',
        'We may decline, pause, or cancel an order when availability, payment, fraud screening, or customer verification issues prevent safe fulfillment.',
      ],
    },
    {
      title: 'Customization Requests',
      intro: 'Customization on this storefront is a review-based process rather than an instant guaranteed order.',
      points: [
        'Submitting a customization request does not automatically create a production commitment.',
        'Color, finish, material, and project requests are reviewed by the studio before timeline, feasibility, and final scope are confirmed.',
        'Because bespoke work may involve manual review, some requests may be adjusted, quoted separately, or declined based on feasibility and availability.',
      ],
    },
    {
      title: 'Shipping, Tracking, And Delivery',
      intro: 'Once an order is created, the storefront can generate a tracking workflow for it.',
      points: [
        `Order tracking references beginning with ${ORDER_TRACKING_PREFIX} are used to follow progress through pending, paid, shipped, and delivered updates.`,
        'Estimated delivery timing may change based on stock, dispatch, logistics, destination, or customization complexity.',
        'Delivery updates may be sent by email and also shown in website notifications when the signed-in account matches the order email.',
      ],
    },
    {
      title: 'Changes, Cancellations, And Returns',
      intro: 'Order modifications depend on the stage of the order and the type of item involved.',
      points: [
        'If you need to change customer details, delivery information, or an order request, contact the studio as soon as possible.',
        'Once an order has moved into payment confirmation, shipping preparation, or a custom production workflow, not all changes or cancellations may be possible.',
        'Requests related to returns, replacement, or delivery concerns are reviewed case by case, especially for made-to-order or customized pieces.',
      ],
      note: 'The fastest way to resolve delivery or order concerns is through the contact page using the same email tied to the order.',
    },
    {
      title: 'Content, Intellectual Property, And Acceptable Use',
      intro: 'The storefront design, product imagery, copy, branding, and interface elements remain protected business assets.',
      points: [
        'You may not reproduce, resell, republish, or commercially exploit site content without prior written permission.',
        'You may not upload malicious content, misuse forms, impersonate another customer, or interfere with checkout, tracking, or account systems.',
      ],
    },
    {
      title: 'Liability And Updates To These Terms',
      intro: 'We aim to keep the storefront accurate and reliable, but some limitations apply.',
      points: [
        'The storefront is provided on an as-available basis and may occasionally be affected by maintenance, provider downtime, or third-party service interruptions.',
        'To the maximum extent allowed by law, we are not responsible for indirect losses arising from delayed access, temporary unavailability, or third-party service failures.',
        'We may revise these terms as the storefront evolves. The latest version published on the site will govern future use.',
      ],
    },
    {
      title: 'Questions About These Terms',
      intro: 'For contractual or order-related questions, contact the studio directly.',
      points: [
        `Email: ${settings.email}`,
        `Phone: ${settings.phone}`,
        `Address: ${settings.address}`,
      ],
    },
  ];
}

export const DEFAULT_FAQ_ITEMS: LegalFaqEntry[] = [
  {
    id: 'tracking-id',
    question: 'When do I receive my tracking ID?',
    answer: `A tracking ID is created as soon as your order is successfully recorded on the storefront. You can use that reference on the track-order page, and order updates can also appear in your account notifications when you sign in with the same email.`,
  },
  {
    id: 'cod-vs-online',
    question: 'Do both Cash on Delivery and online payment orders get confirmation emails?',
    answer: 'Yes. Cash on Delivery orders receive an order confirmation after the order is placed, and successful Razorpay payments receive a payment confirmation once verification is completed.',
  },
  {
    id: 'india-address',
    question: 'Can I place an order outside India?',
    answer: 'The current structured checkout flow supports India delivery addresses. If you need help with a special request, use the contact page so the studio can review it manually.',
  },
  {
    id: 'customization',
    question: 'Can I customize a product before placing an order?',
    answer: 'Yes. The customization flow lets customers submit material, finish, color, quantity, and project preferences for review before the studio confirms feasibility and next steps.',
  },
  {
    id: 'account-email',
    question: 'Why is my registered email important during checkout?',
    answer: 'Your registered email connects order confirmations, payment confirmations, tracking links, and website notifications to the correct customer account. Signing in before checkout gives you the smoothest order-tracking experience.',
  },
  {
    id: 'cart-storage',
    question: 'Does the site remember my cart or wishlist?',
    answer: 'Yes. Cart items, wishlist items, and theme preference can be stored locally in your browser so they remain available when you return on the same device.',
  },
  {
    id: 'availability',
    question: 'Why can an item become unavailable at checkout?',
    answer: 'Availability is checked again during order creation. If a product is inactive, out of stock, or no longer available in the live catalog, checkout can stop the order so inaccurate purchases are not accepted.',
  },
  {
    id: 'contact-support',
    question: 'How do I contact support for privacy, orders, or delivery updates?',
    answer: 'Use the contact page with the same email tied to your account or order. That helps the studio locate your order record, customization request, or account details more quickly.',
  },
];
