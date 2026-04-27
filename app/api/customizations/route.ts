import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Customization from '@/models/Customization';
import {
  DEFAULT_COUNTRY_CODE,
  buildCustomerAddress,
  getCountryOption,
  getIndianCityDirectory,
} from '@/lib/addressDirectory';
import { getProductById } from '@/lib/services/storefront';
import { buildCustomizationQuote } from '@/lib/customizationPricing';
import { getUserFromCookie } from '@/lib/userAuth';
import { saveCustomerAddress } from '@/lib/server/customerAddresses';
import { normalizePhoneNumber } from '@/lib/phoneOtp';
import User from '@/models/User';

const VALID_CONTACT_METHODS = new Set(['email', 'phone', 'both']);
const ENGLISH_NAME_PATTERN = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CUSTOMIZATION_PHONE_PATTERN = /^\d{10}$/;

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEnglishName(value: unknown) {
  return cleanString(value)
    .replace(/[^A-Za-z\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 60);
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const signedInUser = await getUserFromCookie();

    if (!signedInUser?.userId) {
      return NextResponse.json(
        { error: 'Please sign in before submitting a customization request.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const customerName = normalizeEnglishName(body.customerName);
    const customerEmail = cleanString(signedInUser.email).toLowerCase();
    const customerPhone = cleanString(body.customerPhone).replace(/\D/g, '').slice(0, 10);
    const normalizedUserPhone = normalizePhoneNumber(customerPhone);
    const productId = cleanString(body.productId);
    const productName = cleanString(body.productName);
    const selectedMaterial = cleanString(body.selectedMaterial);
    const selectedFinish = cleanString(body.selectedFinish);
    const deliveryCountry = cleanString(body.deliveryCountry || DEFAULT_COUNTRY_CODE).toUpperCase();
    const deliveryState = cleanString(body.deliveryState);
    const deliveryCity = cleanString(body.deliveryCity);
    const deliveryPincode = cleanString(body.deliveryPincode).replace(/\D/g, '').slice(0, 6);
    const deliveryAddressLine1 = cleanString(body.deliveryAddressLine1);
    const deliveryAddressLine2 = cleanString(body.deliveryAddressLine2);
    const deliveryAddress =
      buildCustomerAddress(deliveryAddressLine1, deliveryAddressLine2) ||
      cleanString(body.deliveryAddress);
    const expectedTimeline = cleanString(body.expectedTimeline);
    const customColorName = cleanString(body.customColorName);
    const customColorCode = cleanString(body.customColorCode);
    const customColorPickerValue = cleanString(body.customColorPickerValue);
    const quantityInput = Number.parseInt(String(body.quantity ?? '1'), 10);
    const quantity = Number.isFinite(quantityInput) && quantityInput > 0 ? quantityInput : 1;
    const selectedAddons = Array.isArray(body.selectedAddons)
      ? body.selectedAddons
          .filter((value: unknown): value is string => typeof value === 'string')
          .map((value: string) => value.trim())
          .filter(Boolean)
      : [];
    const preferredContactMethod = VALID_CONTACT_METHODS.has(body.preferredContactMethod)
      ? body.preferredContactMethod
      : 'email';
    const selectedFeaturedColor =
      body.selectedFeaturedColor && typeof body.selectedFeaturedColor === 'object'
        ? body.selectedFeaturedColor
        : undefined;
    const hasFeaturedColor =
      Boolean(selectedFeaturedColor) &&
      typeof selectedFeaturedColor.name === 'string' &&
      cleanString(selectedFeaturedColor.name).length > 0;
    const hasCustomColor = Boolean(
      customColorName && (customColorCode || customColorPickerValue)
    );

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Customer name, email, and phone are required' },
        { status: 400 }
      );
    }

    if (!ENGLISH_NAME_PATTERN.test(customerName)) {
      return NextResponse.json(
        { error: 'Name must contain English letters only.' },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Please use a valid signed-in email address.' },
        { status: 400 }
      );
    }

    if (!CUSTOMIZATION_PHONE_PATTERN.test(customerPhone) || !normalizedUserPhone) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    if (!productId || !productName) {
      return NextResponse.json(
        { error: 'Please choose the product you want to customize.' },
        { status: 400 }
      );
    }

    const selectedProduct = await getProductById(productId);

    if (!selectedProduct) {
      return NextResponse.json(
        { error: 'The selected product could not be found.' },
        { status: 400 }
      );
    }

    if (!hasFeaturedColor && !hasCustomColor) {
      return NextResponse.json(
        { error: 'Please choose a featured color or provide a custom color.' },
        { status: 400 }
      );
    }

    if (!selectedMaterial || !selectedFinish) {
      return NextResponse.json(
        { error: 'Please choose both a material and a finish.' },
        { status: 400 }
      );
    }

    if (!getCountryOption(deliveryCountry) || deliveryCountry !== DEFAULT_COUNTRY_CODE) {
      return NextResponse.json(
        { error: 'Structured customization delivery currently supports India addresses only.' },
        { status: 400 }
      );
    }

    if (
      !deliveryAddressLine1 ||
      !deliveryState ||
      !deliveryCity ||
      !deliveryPincode ||
      !expectedTimeline
    ) {
      return NextResponse.json(
        {
          error:
            'Delivery address, state, city, pincode, and expected timeline are required.',
        },
        { status: 400 }
      );
    }

    if (!getIndianCityDirectory(deliveryState, deliveryCity)) {
      return NextResponse.json(
        { error: 'Please choose a valid city for the selected state.' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(deliveryPincode)) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit pincode.' },
        { status: 400 }
      );
    }

    const quote = buildCustomizationQuote({
      product: selectedProduct,
      quantity,
      selectedFeaturedColorName: hasFeaturedColor ? cleanString(selectedFeaturedColor.name) : '',
      customColorName,
      selectedMaterial,
      selectedFinish,
      selectedAddons,
      sizeOrConfiguration: cleanString(body.sizeOrConfiguration),
    });

    const userRecord = await User.findById(signedInUser.userId);

    if (!userRecord) {
      return NextResponse.json(
        { error: 'Your account could not be found. Please sign in again.' },
        { status: 401 }
      );
    }

    let shouldSaveUser = false;

    if (String(userRecord.name || '').trim() !== customerName) {
      userRecord.name = customerName;
      shouldSaveUser = true;
    }

    if (String(userRecord.email || '').trim().toLowerCase() !== customerEmail) {
      userRecord.email = customerEmail;
      shouldSaveUser = true;
    }

    if (String(userRecord.phone || '').trim() !== normalizedUserPhone) {
      const existingPhoneOwner = await User.findOne({
        phone: normalizedUserPhone,
        _id: { $ne: userRecord._id },
      })
        .select('_id')
        .lean();

      if (existingPhoneOwner) {
        return NextResponse.json(
          { error: 'That phone number is already linked to another account.' },
          { status: 409 }
        );
      }

      userRecord.phone = normalizedUserPhone;
      shouldSaveUser = true;
    }

    if (userRecord.active === false) {
      userRecord.active = true;
      shouldSaveUser = true;
    }

    if (shouldSaveUser) {
      await userRecord.save();
    }

    await saveCustomerAddress(signedInUser.userId, {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      country: deliveryCountry,
      state: deliveryState,
      city: deliveryCity,
      pincode: deliveryPincode,
      addressLine1: deliveryAddressLine1,
      addressLine2: deliveryAddressLine2,
      address: deliveryAddress,
      isDefault: true,
    });

    const customization = new Customization({
      customerName,
      customerEmail,
      customerPhone,
      productId,
      productName,
      quantity,
      selectedFeaturedColor,
      customColorName,
      customColorCode,
      customColorPickerValue,
      selectedMaterial,
      selectedFinish,
      selectedAddons,
      sizeOrConfiguration: cleanString(body.sizeOrConfiguration),
      customDescription: cleanString(body.customDescription).slice(0, 1000),
      uploadedReference: cleanString(body.uploadedReference),
      preferredContactMethod,
      preferredCallTime: cleanString(body.preferredCallTime),
      deliveryCountry,
      deliveryState,
      deliveryCity,
      deliveryPincode,
      deliveryAddressLine1,
      deliveryAddressLine2,
      deliveryAddress,
      expectedTimeline,
      quoteCurrency: quote.currency,
      quotedBaseUnitPrice: quote.baseUnitPrice,
      quotedUnitPrice: quote.customizedUnitPrice,
      quotedBaseTotal: quote.baseTotal,
      quotedAdjustmentsTotal: quote.adjustmentsTotal,
      quotedGrandTotal: quote.grandTotal,
      quoteLineItems: quote.lines
        .filter((line) => line.included)
        .map((line) => ({
          id: line.id,
          label: line.label,
          description: line.description,
          unitAmount: line.unitAmount,
          totalAmount: line.totalAmount,
        })),
      status: 'pending',
    });

    await customization.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Your customization request has been submitted successfully. Our team will review your preferences shortly.',
        referenceId: customization._id,
        quote: {
          currency: quote.currency,
          baseUnitPrice: quote.baseUnitPrice,
          customizedUnitPrice: quote.customizedUnitPrice,
          baseTotal: quote.baseTotal,
          adjustmentsTotal: quote.adjustmentsTotal,
          grandTotal: quote.grandTotal,
          lines: quote.lines.filter((line) => line.included),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting customization:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to submit customization request';
    const isDatabaseIssue = /MONGODB_URI|ECONNREFUSED|timed out|Topology/i.test(message);

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'production'
            ? 'Failed to submit customization request'
            : message,
      },
      { status: isDatabaseIssue ? 503 : 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const signedInUser = await getUserFromCookie();

    if (!signedInUser?.userId) {
      return NextResponse.json(
        { error: 'Please sign in to view your customization requests.' },
        { status: 401 }
      );
    }

    const userRecord = await User.findById(signedInUser.userId).select('email').lean();
    const allowedEmails = [
      cleanString(signedInUser.email).toLowerCase(),
      cleanString(userRecord?.email).toLowerCase(),
    ].filter(Boolean);
    const uniqueEmails = Array.from(new Set(allowedEmails));

    if (!uniqueEmails.length) {
      return NextResponse.json(
        { error: 'Your account email could not be resolved. Please sign in again.' },
        { status: 401 }
      );
    }

    const customizations = await Customization.find({
      customerEmail:
        uniqueEmails.length === 1
          ? uniqueEmails[0]
          : {
              $in: uniqueEmails,
            },
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ customizations });
  } catch (error) {
    console.error('Error fetching customizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customizations' },
      { status: 500 }
    );
  }
}
