-- Insert dummy data into beacon database

-- Insert Tech Tags
INSERT INTO tech_tags (name) VALUES 
  ('React'),
  ('TypeScript'),
  ('PostgreSQL'),
  ('Node.js'),
  ('Tailwind CSS'),
  ('Next.js')
ON CONFLICT DO NOTHING;

-- Insert Users
INSERT INTO users (name, email, role) VALUES 
  ('Alice Johnson', 'alice@apphelix.com', 'Admin'),
  ('Bob Smith', 'bob@apphelix.com', 'Curator'),
  ('Carol Williams', 'carol@apphelix.com', 'Member'),
  ('David Brown', 'david@apphelix.com', 'Viewer'),
  ('Eve Davis', 'eve@apphelix.com', 'Member')
ON CONFLICT DO NOTHING;

-- Insert Engagements
INSERT INTO engagements (name, client_name, status, description, tech_tags, created_at, updated_at) VALUES 
  (
    'E-Commerce Platform Modernization',
    'TechRetail Inc.',
    'In Progress',
    'Redesign legacy e-commerce platform with modern tech stack',
    'React,TypeScript,Node.js,PostgreSQL',
    '2026-02-15T10:30:00Z',
    '2026-03-06T14:20:00Z'
  ),
  (
    'Mobile App Development',
    'FitWell Solutions',
    'Scoping',
    'Build a cross-platform fitness tracking mobile application',
    'React,TypeScript,Tailwind CSS,Next.js',
    '2026-03-01T09:15:00Z',
    '2026-03-06T12:00:00Z'
  ),
  (
    'Data Pipeline Optimization',
    'Analytics Corp',
    'Open',
    'Optimize data ingestion and ETL pipeline for real-time analytics',
    'PostgreSQL,Node.js',
    '2026-03-04T16:45:00Z',
    '2026-03-06T08:30:00Z'
  );

-- Insert Signals (linked to engagements)
INSERT INTO signals (title, description, engagement_id, created_by, status, urgency, required_skills, created_at, updated_at) VALUES 
  (
    'Database Performance Issue',
    'Queries taking too long on high-traffic endpoints. Need optimization expertise.',
    1,
    'alice@apphelix.com',
    'Open',
    'High',
    'PostgreSQL,Query Optimization,Performance Tuning',
    '2026-03-05T14:30:00Z',
    '2026-03-06T10:00:00Z'
  ),
  (
    'React Component Architecture Review',
    'Need guidance on best practices for component structure and state management.',
    1,
    'bob@apphelix.com',
    'In Progress',
    'Medium',
    'React,TypeScript,Architecture',
    '2026-03-04T11:20:00Z',
    '2026-03-06T13:15:00Z'
  ),
  (
    'API Design for Mobile App',
    'Design RESTful APIs for mobile app backend.',
    2,
    'carol@apphelix.com',
    'Open',
    'High',
    'Node.js,API Design,Mobile Backend',
    '2026-03-03T09:00:00Z',
    '2026-03-06T15:30:00Z'
  ),
  (
    'ETL Script Debugging',
    'Debug failing data pipeline ETL scripts during nightly runs.',
    3,
    'david@apphelix.com',
    'Resolved',
    'Medium',
    'PostgreSQL,Python,ETL,Debugging',
    '2026-03-02T13:45:00Z',
    '2026-03-06T11:00:00Z'
  ),
  (
    'Security Review for Auth Flow',
    'Review authentication and authorization implementation for security vulnerabilities.',
    1,
    'eve@apphelix.com',
    'Open',
    'High',
    'Security,TypeScript,Authentication,OAuth',
    '2026-03-05T10:10:00Z',
    '2026-03-06T14:45:00Z'
  );
