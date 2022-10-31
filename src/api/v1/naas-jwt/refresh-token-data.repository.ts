import { EntityRepository, UpdateResult } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { RefreshTokenData } from './refresh-token-data.entity';

@EntityRepository(RefreshTokenData)
export class RefreshTokenDataRepository extends BaseRepository<RefreshTokenData> {
  async insertRefreshTokenData(refreshTokenDataParam): Promise<RefreshTokenData> {
    const {
      refreshToken, refreshTokenExpiry, userId, idToken,
    } = refreshTokenDataParam;
    const refreshTokenData: RefreshTokenData = new RefreshTokenData();
    refreshTokenData.refreshToken = refreshToken;
    refreshTokenData.refreshTokenExpiry = refreshTokenExpiry;
    refreshTokenData.userId = userId;
    refreshTokenData.idToken = idToken;
    await this.save(refreshTokenData);
    return refreshTokenData;
  }

  // eslint-disable-next-line class-methods-use-this
  async updateRefreshTokenData(
    currentRefreshTokenDataParam,
    refreshTokenDataParam,
  ): Promise<RefreshTokenData> {
    const {
      refreshToken, refreshTokenExpiry, userId, isValid, idToken,
    } = refreshTokenDataParam;

    const currentData = currentRefreshTokenDataParam;
    currentData.refreshToken = refreshToken;
    currentData.refreshTokenExpiry = refreshTokenExpiry;
    currentData.idToken = idToken;

    await this.update(
      { userId, idToken },
      {
        refreshToken,
        refreshTokenExpiry,
        isValid,
        idToken,
        isSignedOut: false,
      },
    );
    return currentData;
  }

  async invalidateRefreshToken(userId: string, idToken: string): Promise<UpdateResult> {
    return this.update({ userId, idToken }, { isValid: false });
  }
}
