import { NextResponse } from "next/server";
import { db } from "../../../db/client";
import { users, engagements, signals, techTags } from "../../../db/schema";

export async function GET() {
  try {
    console.log('🚀 Starting dummy data insertion...');
    
    // Insert Tech Tags
    console.log('📝 Inserting tech tags...');
    const techTagsData = [
      { name: 'React' },
      { name: 'TypeScript' },
      { name: 'PostgreSQL' },
      { name: 'Node.js' },
      { name: 'Tailwind CSS' },
      { name: 'Next.js' }
    ];
    
    for (const tag of techTagsData) {
      try {
        await db.insert(techTags).values(tag);
      } catch (error: unknown) {
        // Ignore duplicate key errors
        if (!(error instanceof Error && error.message?.includes('duplicate key'))) {
          console.error('Error inserting tech tag:', error);
        }
      }
    }

    // Insert Users
    console.log('👥 Inserting users...');
    const usersData = [
      { name: 'Alice Johnson', email: 'alice@apphelix.com', role: 'Admin' },
      { name: 'Bob Smith', email: 'bob@apphelix.com', role: 'Curator' },
      { name: 'Carol Williams', email: 'carol@apphelix.com', role: 'Member' },
      { name: 'David Brown', email: 'david@apphelix.com', role: 'Viewer' },
      { name: 'Eve Davis', email: 'eve@apphelix.com', role: 'Member' },
    ];
    
    for (const user of usersData) {
      try {
        await db.insert(users).values(user);
      } catch (error: unknown) {
        // Ignore duplicate key errors
        if (!(error instanceof Error && error.message?.includes('duplicate key'))) {
          console.error('Error inserting user:', error);
        }
      }
    }

    // Insert Engagements
    console.log('💼 Inserting engagements...');
    const engagementsData = [
      {
        name: 'E-Commerce Platform Modernization',
        clientName: 'TechRetail Inc.',
        status: 'In Progress',
        description: 'Redesign legacy e-commerce platform with modern tech stack',
        techTags: 'React,TypeScript,Node.js,PostgreSQL',
        createdAt: '2026-02-15T10:30:00Z',
        updatedAt: '2026-03-06T14:20:00Z'
      },
      {
        name: 'Mobile App Development',
        clientName: 'FitWell Solutions',
        status: 'Scoping',
        description: 'Build a cross-platform fitness tracking mobile application',
        techTags: 'React,TypeScript,Tailwind CSS,Next.js',
        createdAt: '2026-03-01T09:15:00Z',
        updatedAt: '2026-03-06T12:00:00Z'
      },
      {
        name: 'Data Pipeline Optimization',
        clientName: 'Analytics Corp',
        status: 'Open',
        description: 'Optimize data ingestion and ETL pipeline for real-time analytics',
        techTags: 'PostgreSQL,Node.js',
        createdAt: '2026-03-04T16:45:00Z',
        updatedAt: '2026-03-06T08:30:00Z'
      }
    ];
    
    for (const engagement of engagementsData) {
      try {
        await db.insert(engagements).values(engagement);
      } catch (error: unknown) {
        // Ignore duplicate key errors
        if (!(error instanceof Error && error.message?.includes('duplicate key'))) {
          console.error('Error inserting engagement:', error);
        }
      }
    }

    // Insert Signals
    console.log('🚨 Inserting signals...');
    const signalsData = [
      {
        title: 'Database Performance Issue',
        description: 'Queries taking too long on high-traffic endpoints. Need optimization expertise.',
        engagementId: 1,
        createdBy: 'alice@apphelix.com',
        status: 'Open',
        urgency: 'High',
        requiredSkills: 'PostgreSQL,Query Optimization,Performance Tuning',
        createdAt: '2026-03-05T14:30:00Z',
        updatedAt: '2026-03-06T10:00:00Z'
      },
      {
        title: 'React Component Architecture Review',
        description: 'Need guidance on best practices for component structure and state management.',
        engagementId: 1,
        createdBy: 'bob@apphelix.com',
        status: 'In Progress',
        urgency: 'Medium',
        requiredSkills: 'React,TypeScript,Architecture',
        createdAt: '2026-03-04T11:20:00Z',
        updatedAt: '2026-03-06T13:15:00Z'
      },
      {
        title: 'API Design for Mobile App',
        description: 'Design RESTful APIs for mobile app backend.',
        engagementId: 2,
        createdBy: 'carol@apphelix.com',
        status: 'Open',
        urgency: 'High',
        requiredSkills: 'Node.js,API Design,Mobile Backend',
        createdAt: '2026-03-03T09:00:00Z',
        updatedAt: '2026-03-06T15:30:00Z'    },
      {
        title: 'ETL Script Debugging',
        description: 'Debug failing data pipeline ETL scripts during nightly runs.',
        engagementId: 3,
        createdBy: 'david@apphelix.com',
        status: 'Resolved',
        urgency: 'Medium',
        requiredSkills: 'PostgreSQL,Python,ETL,Debugging',
        createdAt: '2026-03-02T13:45:00Z',
        updatedAt: '2026-03-06T11:00:00Z'
      },
      {
        title: 'Security Review for Auth Flow',
        description: 'Review authentication and authorization implementation for security vulnerabilities.',
        engagementId: 1,
        createdBy: 'eve@apphelix.com',
        status: 'Open',
        urgency: 'High',
        requiredSkills: 'Security,TypeScript,Authentication,OAuth',
        createdAt: '2026-03-05T10:10:00Z',
        updatedAt: '2026-03-06T14:45:00Z'
      }
    ];
    
    for (const signal of signalsData) {
      try {
        await db.insert(signals).values(signal);
      } catch (error: unknown) {
        // Ignore duplicate key errors
        if (!(error instanceof Error && error.message?.includes('duplicate key'))) {
          console.error('Error inserting signal:', error);
        }
      }
    }

    // Get counts
    const userCount = await db.select().from(users);
    const engagementCount = await db.select().from(engagements);
    const signalCount = await db.select().from(signals);

    const result = {
      message: 'Dummy data insertion completed successfully!',
      summary: {
        users: userCount.length,
        engagements: engagementCount.length,
        signals: signalCount.length
      }
    };

    console.log('🎉 Dummy data insertion completed:', result);
    
    return NextResponse.json(result);
    
  } catch (error: unknown) {
    console.error('❌ Error inserting dummy data:', error);
    return NextResponse.json(
      { error: 'Failed to insert dummy data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}