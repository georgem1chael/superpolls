import React from 'react';
import type { Participant, TimeSlot, Availability } from '../types';

interface DateTimeGridProps {
    participants: Participant[];
    timeSlots: TimeSlot[];
    availability: Availability[];
    onAvailabilityChange: (participantId: number, timeSlotId: string, status: 'unavailable' | 'maybe' | 'available') => void;
    currentUser?: number | null;
    isEditable: boolean;
}

const DateTimeGrid: React.FC<DateTimeGridProps> = ({
    participants,
    timeSlots,
    availability,
    onAvailabilityChange,
    currentUser = null,
    isEditable
}) => {
    const getStatus = (participantId: number, timeSlotId: string) => {
        const found = availability.find(a => a.participantId === participantId && a.timeSlotId === timeSlotId);
        return found?.status || 'unavailable';
    };

    const getStatusClass = (status: string) => {
        if (status === 'available') return 'status-available';
        if (status === 'maybe') return 'status-maybe';
        return 'status-unavailable';
    };

    const handleCellClick = (participantId: number, timeSlotId: string) => {
        if (!isEditable || participantId !== currentUser) return;
        
        const currentStatus = getStatus(participantId, timeSlotId);
        let nextStatus: 'unavailable' | 'maybe' | 'available' = 'unavailable';
        if (currentStatus === 'unavailable') nextStatus = 'maybe';
        else if (currentStatus === 'maybe') nextStatus = 'available';
        
        onAvailabilityChange(participantId, timeSlotId, nextStatus);
    };

    const getBestTimeSlots = (): string[] => {
        const scores: { [key: string]: number } = {};
        
        timeSlots.forEach(slot => {
            scores[slot.id] = availability
                .filter(a => a.timeSlotId === slot.id)
                .reduce((score, a) => {
                    if (a.status === 'available') return score + 2;
                    if (a.status === 'maybe') return score + 1;
                    return score;
                }, 0);
        });

        const maxScore = Math.max(...Object.values(scores));
        return Object.keys(scores).filter(slotId => scores[slotId] === maxScore);
    };

    const bestTimeSlots = getBestTimeSlots();

    return (
        <div className="datetime-grid-container">
            <h3>When should we meet ?</h3>
            
            <div className="datetime-grid">
                {/* Header row */}
                <div className="grid-header">
                    <div className="participant-header">Participant</div>
                    {timeSlots.map(slot => (
                        <div key={slot.id} className={`time-header ${bestTimeSlots.includes(slot.id) ? 'best-time' : ''}`}>
                            <div className="day-name">{slot.day}</div>
                            {slot.time && <div className="time-name">{slot.time}</div>}
                        </div>
                    ))}
                </div>

                {/* Participant rows */}
                {participants.map(participant => (
                    <div key={participant.id} className="grid-row">
                        <div className="participant-name">
                            {participant.name}
                            {participant.id === currentUser && <span className="current-user-badge">You</span>}
                        </div>
                        {timeSlots.map(slot => {
                            const status = getStatus(participant.id, slot.id);
                            const isClickable = isEditable && participant.id === currentUser;
                            
                            return (
                                <div
                                    key={slot.id}
                                    className={`availability-cell ${getStatusClass(status)} ${isClickable ? 'clickable' : ''} ${bestTimeSlots.includes(slot.id) ? 'best-time-cell' : ''}`}
                                    onClick={() => handleCellClick(participant.id, slot.id)}
                                >
                                    <div className="cell-content"></div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="grid-legend">
                <div className="legend-item">
                    <div className="legend-color status-unavailable"></div>
                    <span>Not available</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color status-maybe"></div>
                    <span>Maybe</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color status-available"></div>
                    <span>Available</span>
                </div>
            </div>
            
            {isEditable && (
                <div className="edit-instructions">
                    Click on your row to change your availability
                </div>
            )}
        </div>
    );
};

export default DateTimeGrid;