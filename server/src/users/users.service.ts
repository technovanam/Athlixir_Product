import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { OnboardUserDto } from './dto/onboard.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly collectionName = 'users';

  constructor(private readonly firebaseService: FirebaseService) {}

  async createOrUpdateProfile(uid: string, createUserDto: CreateUserDto) {
    const userRef = this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(uid);

    const doc = await userRef.get();
    const now = new Date().toISOString();

    if (!doc.exists) {
      const newUser = {
        ...createUserDto,
        uid,
        createdAt: now,
        updatedAt: now,
        status: 'active',
        isDeleted: false,
      };
      await userRef.set(newUser);
      return newUser;
    } else {
      const updatedUser = {
        ...createUserDto,
        updatedAt: now,
      };
      await userRef.update(updatedUser);
      return { id: doc.id, ...doc.data(), ...updatedUser };
    }
  }

  async getProfile(uid: string) {
    const userRef = this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(uid);
    const doc = await userRef.get();

    if (!doc.exists || doc.data()?.isDeleted) {
      throw new NotFoundException('User profile not found');
    }

    return { id: doc.id, ...doc.data() };
  }

  async onboardUser(uid: string, onboardUserDto: OnboardUserDto) {
    const userRef = this.firebaseService.firestore
      .collection(this.collectionName)
      .doc(uid);
    const doc = await userRef.get();

    if (!doc.exists || doc.data()?.isDeleted) {
      throw new NotFoundException('User profile not found. Cannot perform onboarding.');
    }

    const now = new Date().toISOString();
    const updatePayload = {
      onboardingCompleted: true,
      profileCompleted: true,
      workspace: {
        workspaceName: onboardUserDto.workspaceName,
        roleInWorkspace: onboardUserDto.roleInWorkspace,
        workspaceSize: onboardUserDto.workspaceSize || 1,
        industries: onboardUserDto.industries || [],
      },
      updatedAt: now,
    };

    await userRef.update(updatePayload);

    return {
      ...doc.data(),
      ...updatePayload,
    };
  }
}
