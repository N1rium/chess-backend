import { Injectable, HttpService } from '@nestjs/common';
import glootToken from '../util/token';

@Injectable()
export class GlootService {
  constructor(private httpService: HttpService) {}

  adjustFunds(playerId, amount, suffix) {
    try {
      this.httpService
        .post(
          'https://default-service-dot-youbet-dev.appspot.com/api/v1/walletAdmin/adjustFunds',
          {
            reference: 'string',
            reason: 'chessports-cost',
            uniqueReference: `chessports-${Date.now()}-${suffix}`,
            skipBlockedUsers: true,
            adjustmentType: 'WINNINGS',
            createWallets: true,
            needsApproval: false,
            user: {
              amount,
              bonusAmount: '0',
              currency: 'USD',
              user: playerId,
              oauthClient: 'gll-admin-dev',
            },
            convertCurrency: true,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${glootToken}`,
            },
          },
        )
        .subscribe(res => console.log('Adjusted funds'));
    } catch (e) {
      console.log('=== ERROR ===');
      console.log(e);
    }
  }
}
