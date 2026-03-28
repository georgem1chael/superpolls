export interface Survey {
    id: number;
    title: string;
    description?: string;
    editable: boolean;
    owner: number;
}

export interface Participant {
    id: number;
    name: string;
}

export interface TimeSlot {
    id: string;
    day: string;
    time?: string;
}

export interface Availability {
    participantId: number;
    timeSlotId: string;
    status: 'unavailable' | 'maybe' | 'available';
}

export interface Idea {
    id: number;
    text: string;
    author: string;
    votes: number;
    userVote?: 'up' | 'down' | null;
}