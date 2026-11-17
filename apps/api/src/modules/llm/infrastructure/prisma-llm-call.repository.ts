import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { LlmCallRepository, type LlmCallRecord } from '../domain/llm-call.repository.js';

@Injectable()
export class PrismaLlmCallRepository extends LlmCallRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async record(call: LlmCallRecord): Promise<void> {
    await this.prisma.llmCall.create({ data: call });
  }
}
