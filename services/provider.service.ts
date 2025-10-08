import { db } from '@/lib/db';
import { providerProfiles, services, users } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';

export const providerService = {
  // Get all verified providers with ratings above 4.0
  async getFeaturedProviders() {
    return await db
      .select({
        id: providerProfiles.id,
        businessName: providerProfiles.businessName,
        rating: providerProfiles.rating,
        totalReviews: providerProfiles.totalReviews,
        serviceArea: providerProfiles.serviceArea,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          profilePicture: users.profilePicture,
        },
      })
      .from(providerProfiles)
      .leftJoin(users, eq(providerProfiles.userId, users.id))
      .where(
        and(
          eq(providerProfiles.verified, true),
          gte(providerProfiles.rating, '4.0')
        )
      );
    // ✅ Fully typed result
    // ✅ Autocomplete for all fields
    // ✅ Compile-time error checking
  },

  // Get provider with their services
  async getProviderWithServices(providerId: string) {
    return await db.query.providerProfiles.findFirst({
      where: eq(providerProfiles.id, providerId),
      with: {
        services: {
          where: eq(services.isActive, true),
        },
      },
    });
  },
};
