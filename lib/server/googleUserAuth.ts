import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import type { GoogleUserProfile } from '@/lib/googleAuth';
import { createUserToken, setUserSession } from '@/lib/userAuth';
import User from '@/models/User';

export async function signInWithGoogleProfile(googleProfile: GoogleUserProfile) {
  await dbConnect();

  let user = await User.findOne({ googleId: googleProfile.googleId });

  if (!user) {
    user = await User.findOne({ email: googleProfile.email });
  }

  if (!user) {
    user = await User.create({
      name: googleProfile.name,
      email: googleProfile.email,
      googleId: googleProfile.googleId,
    });
  } else {
    if (!user.googleId && !googleProfile.isAuthoritativeEmail) {
      throw new Error('GOOGLE_ACCOUNT_LINK_REQUIRED');
    }

    let shouldSave = false;

    if (!user.googleId) {
      user.googleId = googleProfile.googleId;
      shouldSave = true;
    }

    if (!user.name?.trim() && googleProfile.name) {
      user.name = googleProfile.name;
      shouldSave = true;
    }

    if (shouldSave) {
      await user.save();
    }
  }

  const token = createUserToken(user._id.toString(), user.name, user.email);

  const cookieStore = await cookies();
  setUserSession(cookieStore, token);

  return {
    name: user.name,
    email: user.email,
  };
}
