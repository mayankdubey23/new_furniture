import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Customization from '@/models/Customization';
import {
  DEFAULT_COUNTRY_CODE,
  buildCustomerAddress,
  getCountryOption,
  getIndianCityDirectory,
} from '@/lib/addressDirectory';

const VALID_CONTACT_METHODS = new Set(['email', 'phone', 'both']);

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const customerName = cleanString(body.customerName);
    const customerEmail = cleanString(body.customerEmail).toLowerCase();
    const customerPhone = cleanString(body.customerPhone);
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

    if (!productId || !productName) {
      return NextResponse.json(
        { error: 'Please choose the product you want to customize.' },
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
      status: 'pending',
    });

    await customization.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Your customization request has been submitted successfully. Our team will review your preferences shortly.',
        referenceId: customization._id,
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

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const customizations = await Customization.find({ customerEmail: email.toLowerCase() })
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
