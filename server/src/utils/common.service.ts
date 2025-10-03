import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class CommonService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  public dbConnection: Db;

  async onModuleInit() {
    try {
      const uri = process.env.DATABASE_URL!; // e.g. "mongodb://localhost:27017"
	  console.log('MongoDB connection URI:', uri);
      this.client = new MongoClient(uri);

      await this.client.connect();
      console.log('✅ MongoDB connected');

      // Single DB name
      this.dbConnection = this.client.db(process.env.MONGO_DBNAME);
    } catch (err) {
      console.error('❌ MongoDB connection failed', err);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }

  // Optional helper to get DB instance
  getDb(): Db {
    return this.dbConnection;
  }
}
