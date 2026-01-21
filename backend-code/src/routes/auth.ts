import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema } from '../schemas/auth.js';
import { logActivity } from '../services/activity.js';
import { sendVerificationEmail } from '../services/email.js';

const router = Router();

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register - Step 1: Send OTP
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if email already exists in users
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing pending registration for this email
    await prisma.pendingUser.deleteMany({
      where: { email },
    });

    // Create pending user
    await prisma.pendingUser.create({
      data: {
        email,
        password: hashedPassword,
        name,
        otp,
        expiresAt,
      },
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, otp, name);

    if (!emailSent) {
      await prisma.pendingUser.deleteMany({ where: { email } });
      res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
      return;
    }

    res.status(200).json({ 
      message: 'Verification code sent to your email',
      email,
      requiresVerification: true
    });
  } catch (error) {
    next(error);
  }
});

// Register - Step 2: Verify OTP
router.post('/verify-otp', validate(verifyOtpSchema), async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find pending user
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { email },
    });

    if (!pendingUser) {
      res.status(400).json({ error: 'No pending registration found. Please register again.' });
      return;
    }

    // Check if OTP expired
    if (new Date() > pendingUser.expiresAt) {
      await prisma.pendingUser.delete({ where: { email } });
      res.status(400).json({ error: 'OTP expired. Please register again.' });
      return;
    }

    // Verify OTP
    if (pendingUser.otp !== otp) {
      res.status(400).json({ error: 'Invalid OTP. Please try again.' });
      return;
    }

    // Create actual user
    const user = await prisma.user.create({
      data: {
        email: pendingUser.email,
        password: pendingUser.password,
        name: pendingUser.name,
        role: 'editor',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Delete pending user
    await prisma.pendingUser.delete({ where: { email } });

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    await logActivity(user.id, 'user_registered', 'New user account created and verified');

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

// Resend OTP
router.post('/resend-otp', validate(resendOtpSchema), async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find pending user
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { email },
    });

    if (!pendingUser) {
      res.status(400).json({ error: 'No pending registration found. Please register again.' });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update pending user with new OTP
    await prisma.pendingUser.update({
      where: { email },
      data: { otp, expiresAt },
    });

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, otp, pendingUser.name);

    if (!emailSent) {
      res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
      return;
    }

    res.status(200).json({ message: 'New verification code sent to your email' });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    await logActivity(user.id, 'user_login', 'User logged in');

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
