import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Trái Cây Đông Lạnh Đà Nẵng 28 API is running.';
  }
}
