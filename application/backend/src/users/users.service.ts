import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { Order, OrderDocument } from '../schemas/order.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getUserOrders(userId: string) {
    return this.orderModel.find({ userId }).populate('items.ticketTypeId').exec();
  }

  async upgradeToOrganizer(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role === UserRole.ORGANIZER) {
      throw new BadRequestException('User is already an organizer');
    }

    user.role = UserRole.ORGANIZER;
    await user.save();

    return {
      message: 'Successfully upgraded to organizer',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async createAdminUser(data: { name: string; email: string; password: string }) {
    const { name, email, password } = data;

    // Check if admin already exists
    const existingAdmin = await this.userModel.findOne({ email });
    if (existingAdmin) {
      throw new ConflictException('Admin user already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const adminUser = new this.userModel({
      name,
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await adminUser.save();

    return {
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    };
  }
}
