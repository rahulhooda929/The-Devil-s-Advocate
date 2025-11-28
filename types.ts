export enum AgentRole {
  USER = 'user',
  MODEL = 'model'
}

export enum AgentStatus {
  IDLE = 'idle',
  LISTENING = 'listening',
  RESEARCHING = 'researching',
  DEBATING = 'debating',
  JUDGING = 'judging'
}

export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: AgentRole;
  text: string;
  timestamp: number;
  sources?: Source[];
  sentiment?: string; // Analysis from the "Listener" agent
}

export interface DebateScore {
  logic: number;
  evidence: number;
  emotionalControl: number;
  feedback: string;
}

export interface DebateSession {
  topic: string;
  messages: Message[];
  status: AgentStatus;
  scores: DebateScore[];
}