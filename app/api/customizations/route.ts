import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongoose';
import Customization from '@/models/Customization';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();


    if (!body.customerName || !body.customerEmail || !body.customerPhone) {
      return NextResponse.json(
        { error: 'Customer name, email, and phone are required' },
        { status: 400 }
      );
    }

    if (!body.productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }


    let productId;
    try {
      if (body.productId) {
        productId = new ObjectId(body.productId);
      } else {

        productId = new ObjectId();
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const customization = new Customization({
      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail.toLowerCase().trim(),
      customerPhone: body.customerPhone.trim(),
      productId: productId,
      productName: body.productName.trim(),
      quantity: body.quantity || 1,
      selectedFeaturedColor: body.selectedFeaturedColor,
      customColorName: body.customColorName,
      customColorCode: body.customColorCode,
      customColorPickerValue: body.customColorPickerValue,
      selectedMaterial: body.selectedMaterial,
      selectedFinish: body.selectedFinish,
      selectedAddons: body.selectedAddons || [],
      sizeOrConfiguration: body.sizeOrConfiguration,
      customDescription: body.customDescription,
      uploadedReference: body.uploadedReference,
      preferredContactMethod: body.preferredContactMethod || 'email',
      preferredCallTime: body.preferredCallTime,
      deliveryCity: body.deliveryCity,
      expectedTimeline: body.expectedTimeline,
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
    return NextResponse.json(
      { error: 'Failed to submit customization request' },
      { status: 500 }
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
