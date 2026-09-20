export type MatchmakingStatus = 'idle' | 'ready' | 'queueing' | 'matched_connecting' | 'in_match' | 'recovering' | 'abandoned';

export type MatchmakingState = {
  status: MatchmakingStatus;
  queueStartedAt: number | null;
};

export type MatchmakingAction =
  | { type: 'set_status'; status: MatchmakingStatus }
  | { type: 'join_requested'; startedAt?: number }
  | { type: 'leave_requested' }
  | { type: 'queue_status'; status: string; queuedAt?: number }
  | { type: 'match_found' }
  | { type: 'game_connected' }
  | { type: 'queue_error' }
  | { type: 'ws_closed' };

export const initialMatchmakingState: MatchmakingState = {
  status: 'idle',
  queueStartedAt: null
};

export function matchmakingReducer(state: MatchmakingState, action: MatchmakingAction): MatchmakingState {
  switch (action.type) {
    case 'set_status':
      return {
        ...state,
        status: action.status,
        queueStartedAt: action.status === 'queueing' ? (state.queueStartedAt ?? null) : null
      };
    case 'join_requested':
      return { ...state, status: 'queueing', queueStartedAt: action.startedAt ?? null };
    case 'leave_requested':
      return { ...state, status: 'ready', queueStartedAt: null };
    case 'queue_status': {
      const normalized = action.status === 'queued' ? 'queueing' : action.status;
      if (normalized === 'left') {
        return { ...state, status: 'ready', queueStartedAt: null };
      }
      if (normalized === 'matched') {
        return { ...state, status: 'matched_connecting', queueStartedAt: null };
      }
      if (normalized === 'queueing') {
        return { ...state, status: normalized, queueStartedAt: action.queuedAt ?? state.queueStartedAt };
      }
      if (normalized === 'ready' || normalized === 'idle' || normalized === 'recovering' || normalized === 'abandoned') {
        return { ...state, status: normalized, queueStartedAt: null };
      }
      return state;
    }
    case 'match_found':
      return { ...state, status: 'matched_connecting', queueStartedAt: null };
    case 'game_connected':
      return { ...state, status: 'in_match', queueStartedAt: null };
    case 'queue_error':
      if (state.status === 'queueing') {
        return { ...state, status: 'ready', queueStartedAt: null };
      }
      return state;
    case 'ws_closed':
      if (state.status === 'queueing' || state.status === 'matched_connecting' || state.status === 'in_match') {
        return { ...state, status: 'recovering' };
      }
      return state;
    default:
      return state;
  }
}
