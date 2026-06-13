import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (admin.apps.length > 0) {
      return;
    }

    try {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>(
        'FIREBASE_CLIENT_EMAIL',
      );
      let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
      if (privateKey) {
        // Remove wrapping quotes if they exist (common issue when pasting into Render/Vercel)
        privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
      }

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.warn(
          'Firebase Admin credentials are not fully configured in environment variables. Firebase Admin will not initialize properly.',
        );
        return;
      }

      const storageBucket =
        this.configService.get<string>('FIREBASE_STORAGE_BUCKET') ||
        `${projectId}.appspot.com`;

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });

      this.logger.log('Firebase Admin initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing Firebase Admin', error);
      throw error;
    }
  }

  get auth(): admin.auth.Auth {
    return admin.auth();
  }

  get firestore(): admin.firestore.Firestore {
    return admin.firestore();
  }

  get storage(): admin.storage.Storage {
    return admin.storage();
  }
}
