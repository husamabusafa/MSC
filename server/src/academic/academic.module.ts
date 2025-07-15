import { Module } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { AcademicResolver } from './academic.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AcademicService, AcademicResolver],
  exports: [AcademicService],
})
export class AcademicModule {} 