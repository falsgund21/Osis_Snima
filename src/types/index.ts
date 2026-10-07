export interface ClassItem {
  id: string;
  name: string;
  created_at?: string;
  student_count?: number;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  class_id: string;
  class_name?: string;
  has_voted: boolean;
  voted_at?: string | null;
  created_at?: string;
}

export interface Candidate {
  id: string;
  candidate_number: number;
  leader_name: string;
  vice_leader_name: string;
  photo_url?: string;
  slogan?: string;
  vision: string;
  mission: string[];
  created_at?: string;
  vote_count?: number;
  vote_percentage?: number;
}

export interface Vote {
  id: string;
  candidate_id: string;
  created_at: string;
}

export interface AppSettings {
  id: number;
  school_name: string;
  school_logo: string;
  election_period: string;
  is_election_active: boolean;
  show_trial_accounts?: boolean;
  admin_username: string;
  admin_password_hash: string;
  updated_at?: string;
}

export interface CandidateResult {
  candidate_id: string;
  candidate_number: number;
  leader_name: string;
  vice_leader_name: string;
  photo_url?: string;
  votes: number;
  percentage: number;
}

export interface ElectionStats {
  totalStudents: number;
  totalClasses: number;
  totalCandidates: number;
  totalVoted: number;
  totalNotVoted: number;
  participationPercentage: number;
  candidateResults: CandidateResult[];
}
