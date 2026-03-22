import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

const CREATE_TABLES_SQL = [
  `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
   CREATE TABLE users (
     id NVARCHAR(128) PRIMARY KEY,
     email NVARCHAR(255) NOT NULL,
     displayName NVARCHAR(255),
     photoURL NVARCHAR(500),
     createdAt DATETIME2 DEFAULT GETDATE()
   )`,

  `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'incidents')
   CREATE TABLE incidents (
     id INT IDENTITY(1,1) PRIMARY KEY,
     userId NVARCHAR(128) NOT NULL,
     category NVARCHAR(50) NOT NULL,
     title NVARCHAR(255) NOT NULL,
     description NVARCHAR(MAX),
     latitude FLOAT NOT NULL,
     longitude FLOAT NOT NULL,
     imageUrl NVARCHAR(500),
     upvotes INT DEFAULT 0,
     isActive BIT DEFAULT 1,
     createdAt DATETIME2 DEFAULT GETDATE(),
     expiresAt DATETIME2
   )`,

  `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'gas_stations')
   CREATE TABLE gas_stations (
     id INT IDENTITY(1,1) PRIMARY KEY,
     googlePlaceId NVARCHAR(255),
     name NVARCHAR(255) NOT NULL,
     latitude FLOAT NOT NULL,
     longitude FLOAT NOT NULL,
     address NVARCHAR(500),
     status NVARCHAR(20) DEFAULT 'open',
     reportCount INT DEFAULT 0,
     lastReportAt DATETIME2
   )`,

  `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'station_reports')
   CREATE TABLE station_reports (
     id INT IDENTITY(1,1) PRIMARY KEY,
     stationId INT NOT NULL,
     userId NVARCHAR(128) NOT NULL,
     status NVARCHAR(20) NOT NULL,
     comment NVARCHAR(MAX),
     createdAt DATETIME2 DEFAULT GETDATE()
   )`,

  `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'incident_votes')
   CREATE TABLE incident_votes (
     id INT IDENTITY(1,1) PRIMARY KEY,
     incidentId INT NOT NULL,
     userId NVARCHAR(128) NOT NULL,
     createdAt DATETIME2 DEFAULT GETDATE(),
     UNIQUE (incidentId, userId)
   )`,
];

export async function POST() {
  try {
    for (const sql of CREATE_TABLES_SQL) {
      await execute(sql);
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      tables: ['users', 'incidents', 'gas_stations', 'station_reports', 'incident_votes'],
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
