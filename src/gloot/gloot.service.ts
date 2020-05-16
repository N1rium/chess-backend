import { Injectable, HttpService } from '@nestjs/common';

@Injectable()
export class GlootService {
  constructor(private httpService: HttpService) {}
}
