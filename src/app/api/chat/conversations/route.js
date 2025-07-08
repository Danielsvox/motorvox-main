import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const body = await request.json();
    const { seller_id, car_id } = body;

    if (!seller_id || !car_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send start_conversation event through WebSocket
    // The actual conversation creation happens through WebSocket
    return NextResponse.json({
      success: true,
      seller_id,
      car_id
    });

  } catch (error) {
    console.error('Error initiating conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate conversation' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Forward request to backend messaging service
    const response = await fetch(`${API_BASE_URL}/api/messaging/conversations/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
} 