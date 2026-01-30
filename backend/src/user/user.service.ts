import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find or create user by email
   */
  async findOrCreateByEmail(email: string, name?: string): Promise<User> {
    this.logger.log(`Finding or creating user with email: ${email}`);

    // Try to find existing user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      this.logger.log(`User found: ${user.id}`);
      // Update name if provided and different
      if (name && user.name !== name) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { name },
        });
        this.logger.log(`User name updated to: ${name}`);
      }
      return user;
    }

    // Create new user
    user = await this.prisma.user.create({
      data: {
        email,
        name,
      },
    });

    this.logger.log(`User created: ${user.id}`);
    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
