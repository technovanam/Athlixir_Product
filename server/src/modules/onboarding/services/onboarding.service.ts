import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../../../firebase/firebase.service';
import { BasicInfoDto } from '../dto/basic-info.dto';
import { ClassificationDto } from '../dto/classification.dto';
import { BodyMetricsDto } from '../dto/body-metrics.dto';
import { TrainingProfileDto } from '../dto/training-profile.dto';
import { GoalsDto } from '../dto/goals.dto';
import { InjuryHistoryDto } from '../dto/injury-history.dto';
import { ConsentDto } from '../dto/consent.dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);
  private readonly athleteProfilesCollection = 'athlete_profiles';
  private readonly usersCollection = 'users';

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Fetches athlete profile status and maps the next incomplete step
   */
  async getStatus(uid: string) {
    const profileRef = this.firebaseService.firestore
      .collection(this.athleteProfilesCollection)
      .doc(uid);
    const doc = await profileRef.get();

    if (!doc.exists) {
      return {
        currentStep: 'basic-info',
        percentComplete: 0,
        data: {},
        onboardingCompleted: false,
      };
    }

    const data = doc.data() || {};
    let currentStep = 'basic-info';
    let percentComplete = 0;

    if (!data.dob) {
      currentStep = 'basic-info';
      percentComplete = 10;
    } else if (!data.running_type) {
      currentStep = 'classification';
      percentComplete = 25;
    } else if (data.height_cm === undefined || data.weight_kg === undefined) {
      currentStep = 'body-metrics';
      percentComplete = 40;
    } else if (data.training_days === undefined) {
      currentStep = 'training-profile';
      percentComplete = 55;
    } else if (!data.goals || data.goals.length === 0) {
      currentStep = 'goals';
      percentComplete = 70;
    } else if (!data.injury_history) {
      currentStep = 'injury-history';
      percentComplete = 85;
    } else if (!data.consent_accepted) {
      currentStep = 'consent';
      percentComplete = 95;
    } else {
      currentStep = 'completed';
      percentComplete = 100;
    }

    return {
      currentStep,
      percentComplete,
      data,
      onboardingCompleted: !!data.onboarding_completed,
    };
  }

  /**
   * Save Step 1: Basic Athlete Information
   */
  async saveBasicInfo(uid: string, email: string, dto: BasicInfoDto) {
    const now = new Date().toISOString();
    const profileRef = this.firebaseService.firestore
      .collection(this.athleteProfilesCollection)
      .doc(uid);

    const doc = await profileRef.get();
    const payload = {
      id: uid,
      user_id: uid,
      email,
      full_name: dto.fullName,
      dob: dto.dob,
      gender: dto.gender,
      state: dto.state,
      city: dto.city,
      profile_photo: dto.profilePhoto || doc.data()?.profile_photo || '',
      updated_at: now,
    };

    if (!doc.exists) {
      Object.assign(payload, {
        created_at: now,
        onboarding_completed: false,
      });
      await profileRef.set(payload);
    } else {
      await profileRef.update(payload);
    }

    return this.getStatus(uid);
  }

  /**
   * Save Step 2: Athlete Classification
   */
  async saveClassification(uid: string, dto: ClassificationDto) {
    const now = new Date().toISOString();
    const profileRef = this.firebaseService.firestore
      .collection(this.athleteProfilesCollection)
      .doc(uid);

    const doc = await profileRef.get();
    if (!doc.exists) {
      throw new BadRequestException(
        'Please complete Step 1: Basic Information first.',
      );
    }

    const payload = {
      running_type: dto.runningType,
      primary_event: dto.primaryEvent,
      secondary_event: dto.secondaryEvent,
      competition_level: dto.competitionLevel,
      updated_at: now,
    };

    await profileRef.update(payload);
    return this.getStatus(uid);
  }

  /**
   * Save Step 3: Body Metrics
   */
  async saveBodyMetrics(uid: string, dto: BodyMetricsDto) {
    const now = new Date().toISOString();
    const profileRef = this.firebaseService.firestore
      .collection(this.athleteProfilesCollection)
      .doc(uid);

    const doc = await profileRef.get();
    if (!doc.exists) {
      throw new BadRequestException(
        'Please complete Step 1: Basic Information first.',
      );
    }

    const payload = {
      height_cm: dto.heightCm,
      weight_kg: dto.weightKg,
      updated_at: now,
    };

    await profileRef.update(payload);
    return this.getStatus(uid);
  }

  /**
   * Save Step 4: Training Profile
   */
  async saveTrainingProfile(uid: string, dto: TrainingProfileDto) {
    const now = new Date().toISOString();
    const profileRef = this.firebaseService.firestore
      .collection(this.athleteProfilesCollection)
      .doc(uid);

    const doc = await profileRef.get();
    if (!doc.exists) {
      throw new BadRequestException(
        'Please complete Step 1: Basic Information first.',
      );
    }

    const docData = doc.data() || {};
    const payload = {
      training_days: dto.trainingDays,
      training_duration: dto.trainingDuration,
      experience_years: dto.experienceYears,
      personal_best:
        dto.personalBest !== undefined
          ? dto.personalBest
          : docData.personal_best || '',
      achievements:
        dto.achievements !== undefined
          ? dto.achievements
          : docData.achievements || '',
      updated_at: now,
    };

    await profileRef.update(payload);
    return this.getStatus(uid);
  }

  /**
   * Save Step 5: Athlete Goals
   */
  async saveGoals(uid: string, dto: GoalsDto) {
    const now = new Date().toISOString();
    const profileRef = this.firebaseService.firestore
      .collection(this.athleteProfilesCollection)
      .doc(uid);

    const doc = await profileRef.get();
    if (!doc.exists) {
      throw new BadRequestException(
        'Please complete Step 1: Basic Information first.',
      );
    }

    const payload = {
      goals: dto.goals,
      updated_at: now,
    };

    await profileRef.update(payload);
    return this.getStatus(uid);
  }

  /**
   * Save Step 6: Injury History
   */
  async saveInjuryHistory(uid: string, dto: InjuryHistoryDto) {
    const now = new Date().toISOString();
    const profileRef = this.firebaseService.firestore
      .collection(this.athleteProfilesCollection)
      .doc(uid);

    const doc = await profileRef.get();
    if (!doc.exists) {
      throw new BadRequestException(
        'Please complete Step 1: Basic Information first.',
      );
    }

    const payload = {
      injury_history: {
        injuries: dto.injuries,
        current_pain: dto.currentPain,
        severity: dto.severity,
      },
      updated_at: now,
    };

    await profileRef.update(payload);
    return this.getStatus(uid);
  }

  /**
   * Save Step 7: Consent & Terms and final status triggers
   */
  async saveConsent(uid: string, dto: ConsentDto) {
    const now = new Date().toISOString();
    const profileRef = this.firebaseService.firestore
      .collection(this.athleteProfilesCollection)
      .doc(uid);

    const doc = await profileRef.get();
    if (!doc.exists) {
      throw new BadRequestException(
        'Please complete Step 1: Basic Information first.',
      );
    }

    const docData = doc.data() || {};
    const payload = {
      consent_accepted:
        dto.termsAccepted && dto.aiAnalysisConsent && dto.dataStorageConsent,
      terms_accepted: dto.termsAccepted,
      ai_consent_accepted: dto.aiAnalysisConsent,
      data_consent_accepted: dto.dataStorageConsent,
      terms_accepted_at: dto.termsAccepted
        ? now
        : docData.terms_accepted_at || null,
      ai_consent_accepted_at: dto.aiAnalysisConsent
        ? now
        : docData.ai_consent_accepted_at || null,
      data_consent_accepted_at: dto.dataStorageConsent
        ? now
        : docData.data_consent_accepted_at || null,
      updated_at: now,
    };

    await profileRef.update(payload);
    return this.getStatus(uid);
  }

  /**
   * Completes onboarding flow and synchronizes profile Completed parameters across records
   */
  async completeOnboarding(uid: string) {
    const now = new Date().toISOString();

    // 1. Update athlete_profiles collection
    const profileRef = this.firebaseService.firestore
      .collection(this.athleteProfilesCollection)
      .doc(uid);

    const doc = await profileRef.get();
    if (!doc.exists) {
      throw new BadRequestException('Onboarding data not found.');
    }

    await profileRef.update({
      onboarding_completed: true,
      updated_at: now,
    });

    // 2. Synchronize main users collection to bypass route security guards
    const userRef = this.firebaseService.firestore
      .collection(this.usersCollection)
      .doc(uid);

    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.update({
        onboardingCompleted: true,
        profileCompleted: true,
        updatedAt: now,
      });
    }

    return this.getStatus(uid);
  }

  /**
   * Secure profile avatar photo upload directly into Firebase Cloud Storage
   */
  async uploadProfilePhoto(uid: string, file: any): Promise<string> {
    try {
      // Call with no parameters to grab default bucket automatically
      const bucket = this.firebaseService.storage.bucket();
      const destination = `athletes/${uid}/avatar_${Date.now()}_${String(file.originalname || 'photo.png').replace(/\s+/g, '_')}`;
      const fileRef = bucket.file(destination);

      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: uid,
          },
        },
      });

      // Try making the object public. If permissions restrict it, we will default to standard public access URL
      try {
        await fileRef.makePublic();
      } catch (err) {
        this.logger.warn(
          `Could not make storage file public (usually fine in developer environments): ${err.message}`,
        );
      }

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

      // Save url to profile doc
      const profileRef = this.firebaseService.firestore
        .collection(this.athleteProfilesCollection)
        .doc(uid);

      const doc = await profileRef.get();
      if (doc.exists) {
        await profileRef.update({
          profile_photo: publicUrl,
          updated_at: new Date().toISOString(),
        });
      } else {
        await profileRef.set({
          id: uid,
          user_id: uid,
          profile_photo: publicUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          onboarding_completed: false,
        });
      }

      return publicUrl;
    } catch (error) {
      this.logger.error(
        'Failed uploading photo to Firebase storage, falling back to data URI representation',
        error,
      );

      // Fallback base64 representation if Storage is not fully configured
      const base64Data = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64Data}`;

      const profileRef = this.firebaseService.firestore
        .collection(this.athleteProfilesCollection)
        .doc(uid);

      await profileRef.set(
        {
          profile_photo: dataUri,
          updated_at: new Date().toISOString(),
        },
        { merge: true },
      );

      return dataUri;
    }
  }
}
