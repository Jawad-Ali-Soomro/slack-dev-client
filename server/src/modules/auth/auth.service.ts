import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import { JwtPayload } from './interfaces/jwt.interface';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import ms, { StringValue } from 'ms';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private async generateAccessToken(user: {
    id: number;
    email: string;
    role: Role;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }

  private async generateRefreshToken(user: { id: number }) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as '30d',
      },
    );
  }

  private async createVerificationToken(userId: number) {
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    const token = randomBytes(32).toString('hex');

    await this.prisma.emailVerificationToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return token;
  }

  private sanitizeUser(user: {
    id: number;
    username: string;
    email: string;
    role: Role;
    status: string;
    emailVerified: boolean;
    emailVerifiedAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });
    if (existingUser) {
      throw new ConflictException(
        'User with that username or email already exists',
      );
    }
    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password: hashed },
    });

    const token = await this.createVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(
      user.email,
      token,
      user.username,
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user: this.sanitizeUser(user),
    };
  }

  private normalizeVerificationToken(raw: string): string {
    const trimmed = raw.trim();

    if (trimmed.includes('token=')) {
      try {
        const url = new URL(
          trimmed.startsWith('http') ? trimmed : `http://local?${trimmed.replace(/^\?/, '')}`,
        );
        const fromQuery = url.searchParams.get('token');
        if (fromQuery) {
          return fromQuery.trim();
        }
      } catch {
        const match = trimmed.match(/[?&]token=([^&\s#]+)/);
        if (match?.[1]) {
          return decodeURIComponent(match[1]).trim();
        }
      }
    }

    return trimmed;
  }

  async verifyEmail(rawToken: string) {
    const token = this.normalizeVerificationToken(rawToken);

    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    const verification = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException(
        'Invalid verification token. Use the latest link from your email, or request a new one via resend-verification.',
      );
    }

    if (verification.expiresAt < new Date()) {
      await this.prisma.emailVerificationToken.delete({
        where: { id: verification.id },
      });
      throw new BadRequestException('Verification token has expired');
    }

    if (verification.user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const user = await this.prisma.user.update({
      where: { id: verification.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    return {
      message: 'Email verified successfully',
      user: this.sanitizeUser(user),
    };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message:
          'If an account exists with that email, a verification link has been sent.',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const token = await this.createVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(
      user.email,
      token,
      user.username,
    );

    return {
      message:
        'If an account exists with that email, a verification link has been sent.',
    };
  }

  async login(loginUserDto: LoginUserDto) {
    if (!loginUserDto.email && !loginUserDto.username) {
      throw new BadRequestException('Email or username is required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(loginUserDto.email ? [{ email: loginUserDto.email }] : []),
          ...(loginUserDto.username
            ? [{ username: loginUserDto.username }]
            : []),
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }

    if (user.status === 'suspended') {
      throw new ForbiddenException('Your account has been suspended');
    }

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const session = await this.prisma.session.create({
      data: {
        refreshToken: hashedRefreshToken,
        expiresAt: new Date(
          Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRES_IN as StringValue),
        ),
        userId: user.id,
      },
    });

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        userId: payload.sub,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    let session: Prisma.SessionGetPayload<{
      include: {
        user: true;
      };
    }> | null = null;

    for (const s of sessions) {
      const matches = await bcrypt.compare(refreshToken, s.refreshToken);

      if (matches) {
        session = s;
        break;
      }
    }

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.user.status === 'suspended') {
      throw new ForbiddenException('Your account has been suspended');
    }

    const accessToken = await this.generateAccessToken(session.user);

    const newRefreshToken = await this.generateRefreshToken(session.user);

    const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);

    await this.prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshToken: hashedRefresh,
        expiresAt: new Date(
          Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRES_IN as StringValue),
        ),
        lastUsedAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const sessions = await this.prisma.session.findMany({
      where: {
        userId: payload.sub,
      },
    });

    for (const session of sessions) {
      const matches = await bcrypt.compare(refreshToken, session.refreshToken);

      if (matches) {
        await this.prisma.session.update({
          where: {
            id: session.id,
          },
          data: {
            isRevoked: true,
          },
        });

        return {
          message: 'Logged out successfully',
        };
      }
    }

    throw new UnauthorizedException();
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        emailVerifiedAt: true,
        avatar: true,
        createdAt: true,
        sessions: {
          where: {
            isRevoked: false,
          },
          select: {
            id: true,
            deviceName: true,
            deviceType: true,
            browser: true,
            operatingSystem: true,
            ipAddress: true,
            location: true,
            lastUsedAt: true,
            createdAt: true,
          },
        },
        ownedOrganizations: true,
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Profile fetched successfully',
      user,
    };
  }
}
