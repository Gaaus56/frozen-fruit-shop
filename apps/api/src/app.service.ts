import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Frozen Fruit Shop API is running.';
  }
}
