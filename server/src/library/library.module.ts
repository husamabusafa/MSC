import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryResolver } from './library.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LibraryService, LibraryResolver],
  exports: [LibraryService],
})
export class LibraryModule {} 