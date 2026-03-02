// src/app/api/signals/route.ts
import { NextResponse } from 'next/server';
import { Signal } from '@/src/db/signal';

// In-memory store for demonstration (replace with DB integration)
let signals: Signal[] = [];

export async function GET() {
  return NextResponse.json(signals);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newSignal: Signal = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  signals.push(newSignal);
  return NextResponse.json(newSignal, { status: 201 });
}

export async function PUT(request: Request) {
  const data = await request.json();
  const idx = signals.findIndex(s => s.id === data.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  signals[idx] = { ...signals[idx], ...data, updatedAt: new Date().toISOString() };
  return NextResponse.json(signals[idx]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  signals = signals.filter(s => s.id !== id);
  return NextResponse.json({ success: true });
}
