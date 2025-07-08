import { API_BASE_URL } from '@/config/api';

export async function GET(request, { params }) {
  const id = params.id;

  try {
    const response = await fetch(`${API_BASE_URL}/listings/cars/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Return the exact response from the backend
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 