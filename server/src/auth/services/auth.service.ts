import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../../firebase/firebase.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  private readonly usersCollection = 'users';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, username } = signupDto;

    try {
      // 1. Create Firebase Auth user
      const userRecord = await this.firebaseService.auth.createUser({
        email,
        password,
        displayName: username,
      });

      // 2. Create Firestore User Profile document
      const now = new Date().toISOString();
      const userProfile = {
        uid: userRecord.uid,
        username,
        email,
        role: 'user',
        onboardingCompleted: false,
        profileCompleted: false,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        isDeleted: false,
      };

      await this.firebaseService.firestore
        .collection(this.usersCollection)
        .doc(userRecord.uid)
        .set(userProfile);

      return userProfile;
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Email address is already in use');
      }
      throw new InternalServerErrorException(error.message || 'Failed to register user');
    }
  }

  async login(loginDto: LoginDto): Promise<{ idToken: string; userProfile: any }> {
    const { email, password } = loginDto;
    const apiKey = this.configService.get<string>('FIREBASE_WEB_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Firebase Web API Key is missing. Login via credentials cannot be validated on the backend.',
      );
    }

    // Call Firebase Auth REST API to verify email/password
    try {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.error?.message || 'Authentication failed';
        if (
          errorMessage === 'EMAIL_NOT_FOUND' ||
          errorMessage === 'INVALID_PASSWORD' ||
          errorMessage === 'INVALID_LOGIN_CREDENTIALS'
        ) {
          throw new UnauthorizedException('Invalid email or password');
        }
        throw new UnauthorizedException(errorMessage);
      }

      const data = await response.json();
      const idToken = data.idToken;
      const uid = data.localId;

      // Update last login timestamp in Firestore
      const now = new Date().toISOString();
      const userRef = this.firebaseService.firestore.collection(this.usersCollection).doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('User profile not found in database');
      }

      const currentData = userDoc.data();
      if (currentData?.isDeleted || currentData?.status !== 'active') {
        throw new UnauthorizedException('This account has been disabled or deleted');
      }

      const updatedProfile = {
        ...currentData,
        lastLoginAt: now,
        updatedAt: now,
      };

      await userRef.update({
        lastLoginAt: now,
        updatedAt: now,
      });

      return {
        idToken,
        userProfile: updatedProfile,
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to authenticate credentials: ' + error.message);
    }
  }

  async createSessionCookie(idToken: string): Promise<string> {
    try {
      // 5 days session cookie expiration
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      return await this.firebaseService.auth.createSessionCookie(idToken, { expiresIn });
    } catch (error: any) {
      throw new UnauthorizedException('Failed to establish a secure session');
    }
  }

  async revokeSession(sessionCookie: string): Promise<void> {
    try {
      const decodedClaims = await this.firebaseService.auth.verifySessionCookie(sessionCookie);
      await this.firebaseService.auth.revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      // Catch silently on invalid token during logout
    }
  }

  async getUserProfile(uid: string) {
    const userDoc = await this.firebaseService.firestore.collection(this.usersCollection).doc(uid).get();
    if (!userDoc.exists || userDoc.data()?.isDeleted) {
      return null;
    }
    const userData = userDoc.data();
    
    try {
      const profileDoc = await this.firebaseService.firestore.collection('athlete_profiles').doc(uid).get();
      if (profileDoc.exists) {
        userData.physicalProfile = profileDoc.data();
      }
    } catch (err) {
      console.error('Failed to fetch physical profile', err);
    }
    
    return userData;
  }
}
