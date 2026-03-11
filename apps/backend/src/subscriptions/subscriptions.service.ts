import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSubscriptionDto) {
    const subscription = await this.prisma.subscription.create({
      data: {
        ...dto,
        userId,
        price: dto.price,
        nextChargeDate: new Date(dto.nextChargeDate),
      },
      include: {
        usage: true,
      },
    });

    return {
      ...subscription,
      price: Number(subscription.price),
    };
  }

  async findAll(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: {
        usage: true,
      },
      orderBy: {
        nextChargeDate: 'asc',
      },
    });

    return subscriptions.map(sub => ({
      ...sub,
      price: Number(sub.price),
    }));
  }

  async findOne(id: string, userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        usage: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      ...subscription,
      price: Number(subscription.price),
    };
  }

  async update(id: string, userId: string, dto: UpdateSubscriptionDto) {
    await this.findOne(id, userId); // Check ownership

    const updateData: any = { ...dto };
    if (dto.nextChargeDate) {
      updateData.nextChargeDate = new Date(dto.nextChargeDate);
    }

    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        usage: true,
      },
    });

    return {
      ...subscription,
      price: Number(subscription.price),
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check ownership

    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  async importFromCsv(userId: string, csvContent: string) {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return { imported: 0, errors: ['Empty CSV'] };

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const nameIdx = headers.indexOf('name');
    const priceIdx = headers.indexOf('price');
    const periodIdx = headers.indexOf('billingperiod');
    const categoryIdx = headers.indexOf('category');
    const dateIdx = headers.indexOf('startdate');

    if (nameIdx === -1 || priceIdx === -1) {
      return { imported: 0, errors: ['CSV must have name and price columns'] };
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.every(c => !c)) continue;

      try {
        const name = cols[nameIdx];
        const price = parseFloat(cols[priceIdx]);
        if (!name || isNaN(price)) {
          errors.push(`Row ${i}: invalid name or price`);
          continue;
        }

        const billingPeriod = periodIdx !== -1 && cols[periodIdx]?.toUpperCase() === 'YEARLY' ? 'YEARLY' : 'MONTHLY';
        const category = categoryIdx !== -1 && cols[categoryIdx] ? cols[categoryIdx] : 'Other';
        const parsedDate = dateIdx !== -1 && cols[dateIdx] ? new Date(cols[dateIdx]) : new Date();
        const nextChargeDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

        await this.prisma.subscription.create({
          data: {
            userId,
            name,
            price,
            billingPeriod,
            category,
            isActive: true,
            nextChargeDate,
          },
        });
        imported++;
      } catch (e) {
        errors.push(`Row ${i}: ${e instanceof Error ? e.message : 'unknown error'}`);
      }
    }

    return { imported, errors };
  }

  async confirmUse(id: string, userId: string) {
    await this.findOne(id, userId); // Check ownership

    const usage = await this.prisma.subscriptionUsage.upsert({
      where: { subscriptionId: id },
      update: {
        lastConfirmedUseAt: new Date(),
      },
      create: {
        subscriptionId: id,
        lastConfirmedUseAt: new Date(),
      },
    });

    return usage;
  }
}

