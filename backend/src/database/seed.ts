import pool from '../config/database.js';
import { UserModel } from '../models/User.js';
import { ReportModel } from '../models/Report.js';

export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'citizen@example.com',
        password: 'password123',
        role: 'citizen' as const
      },
      {
        name: 'Dr. Sarah Analyst',
        email: 'analyst@incois.gov.in',
        password: 'analyst123',
        role: 'analyst' as const
      },
      {
        name: 'Admin User',
        email: 'admin@incois.gov.in',
        password: 'admin123',
        role: 'admin' as const
      }
    ];

    const createdUsers = [];
    for (const userData of sampleUsers) {
      try {
        const user = await UserModel.create(userData);
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.email}`);
      } catch (error: any) {
        if (error.message.includes('duplicate key')) {
          console.log(`⚠️  User already exists: ${userData.email}`);
          const existingUser = await UserModel.findByEmail(userData.email);
          if (existingUser) createdUsers.push(existingUser);
        } else {
          throw error;
        }
      }
    }

    // Create sample reports
    const sampleReports = [
      {
        event_type: 'high_wave' as const,
        description: 'Unusually high waves observed near Marina Beach. Waves reaching 3-4 meters in height, causing concern among local fishermen.',
        longitude: 80.2707,
        latitude: 13.0827,
        location_name: 'Marina Beach, Chennai'
      },
      {
        event_type: 'flood' as const,
        description: 'Heavy rainfall causing street flooding in T. Nagar area. Water level approximately 1 foot deep on main roads.',
        longitude: 80.2340,
        latitude: 13.0418,
        location_name: 'T. Nagar, Chennai'
      },
      {
        event_type: 'unusual_tide' as const,
        description: 'Extremely low tide observed at Kochi harbor. Water level 2 feet below normal, exposing unusual amount of seabed.',
        longitude: 76.2673,
        latitude: 9.9312,
        location_name: 'Kochi Harbor, Kerala'
      },
      {
        event_type: 'high_wave' as const,
        description: 'Strong waves hitting Vizag coast. Fishermen returning early due to rough sea conditions.',
        longitude: 83.3106,
        latitude: 17.6868,
        location_name: 'Visakhapatnam Beach, Andhra Pradesh'
      }
    ];

    // Create reports using the first user (citizen)
    if (createdUsers.length > 0) {
      const citizenUser = createdUsers[0];
      
      for (const reportData of sampleReports) {
        try {
          const report = await ReportModel.create(citizenUser.id, reportData);
          console.log(`✅ Created report: ${report.event_type} at ${report.location_name}`);
        } catch (error) {
          console.error(`❌ Failed to create report:`, error);
        }
      }

      // Verify some reports using analyst user
      if (createdUsers.length > 1) {
        const analystUser = createdUsers[1];
        const reportsToVerify = await ReportModel.findAll({ limit: 2 });
        
        for (const report of reportsToVerify) {
          try {
            await ReportModel.verify(report.id, analystUser.id);
            console.log(`✅ Verified report: ${report.id}`);
          } catch (error) {
            console.error(`❌ Failed to verify report:`, error);
          }
        }
      }
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}