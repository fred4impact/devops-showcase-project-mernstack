import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScannerService } from './scanner.service';

@ApiTags('Scanner')
@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}
}
