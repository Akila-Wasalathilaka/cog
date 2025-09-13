import { NextRequest, NextResponse } from 'next/server';
import { assessmentSessionsStore } from '@/lib/data/assessments';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    // Get auth token from cookie or header
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const { itemId } = params;
    const { score, metrics_json, response_time_ms } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // First try to submit to backend
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/assessments/items/${itemId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: score,
          metrics_json: metrics_json,
          response_time_ms: response_time_ms
        }),
      });

      if (backendResponse.ok) {
        const result = await backendResponse.json();
        return NextResponse.json(result);
      } else {
        console.warn('Backend submission failed, falling back to mock data');
      }
    } catch (backendError) {
      console.warn('Backend submission error, falling back to mock data:', backendError);
    }

    // Fallback to mock data if backend fails
    // Find the assessment session that contains this item
    const sessions = assessmentSessionsStore.getAll();
    let targetSession = null;
    let targetGame = null;

    for (const session of sessions) {
      const game = session.cognitive_games.find((g: any) => g.game_id === itemId);
      if (game) {
        targetSession = session;
        targetGame = game;
        break;
      }
    }

    if (!targetSession || !targetGame) {
      return NextResponse.json({ error: 'Assessment item not found' }, { status: 404 });
    }

    // Update the game result in the session
    const updatedGames = targetSession.cognitive_games.map((game: any) => {
      if (game.game_id === itemId) {
        return {
          ...game,
          status: 'completed',
          score: score,
          time_taken: response_time_ms || 0,
          responses: metrics_json?.responses || [],
          cognitive_metrics: {
            ...game.cognitive_metrics,
            reaction_time_avg: metrics_json?.averageResponseTime || 0
          }
        };
      }
      return game;
    });

    // Update the session with the new game results
    const updatedSession = {
      ...targetSession,
      cognitive_games: updatedGames,
      progress_percentage: (updatedGames.filter((g: any) => g.status === 'completed').length / updatedGames.length) * 100
    };

    assessmentSessionsStore.update(targetSession.id, updatedSession);

    return NextResponse.json({
      success: true,
      message: 'Game result submitted successfully',
      itemId: itemId,
      score: score
    });

  } catch (error) {
    console.error('Submit game result error:', error);
    return NextResponse.json({ error: 'Failed to submit game result' }, { status: 500 });
  }
}
