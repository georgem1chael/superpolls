import React from 'react';
import type { Participant, TimeSlot, Availability } from '../types';

interface HeatmapCalendarProps {
    participants: Participant[];
    timeSlots: TimeSlot[];
    availability: Availability[];
    isPremium: boolean;
    onUpgrade: () => void;
}

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
    participants,
    timeSlots,
    availability,
    isPremium,
    onUpgrade
}) => {
    const getHeatmapIntensity = (timeSlotId: string): number => {
        const totalParticipants = participants.length;
        if (totalParticipants === 0) return 0;
        
        const score = availability
            .filter(a => a.timeSlotId === timeSlotId)
            .reduce((sum, a) => {
                if (a.status === 'available') return sum + 2;
                if (a.status === 'maybe') return sum + 1;
                return sum;
            }, 0);
        
        const maxPossibleScore = totalParticipants * 2;
        return maxPossibleScore > 0 ? score / maxPossibleScore : 0;
    };

    const getBestTimeSlot = (): TimeSlot | null => {
        let bestSlot = null;
        let bestScore = -1;
        
        timeSlots.forEach(slot => {
            const intensity = getHeatmapIntensity(slot.id);
            if (intensity > bestScore) {
                bestScore = intensity;
                bestSlot = slot;
            }
        });
        
        return bestSlot;
    };

    const getHeatmapClass = (intensity: number): string => {
        if (intensity >= 0.8) return 'heat-5';
        if (intensity >= 0.6) return 'heat-4';
        if (intensity >= 0.4) return 'heat-3';
        if (intensity >= 0.2) return 'heat-2';
        return 'heat-1';
    };

    const bestTimeSlot = getBestTimeSlot();

    if (!isPremium) {
        return (
            <div className="heatmap-calendar-container premium-locked">
                <div className="calendar-header">
                    <h4>Heatmap Calendar view (upgrade)</h4>
                </div>
                {/* upgrade button */}
                <div className="premium-preview">
                    <div className="preview-overlay">
                        <div className="upgrade-prompt">
                            <h3>Premium Feature</h3>
                            <p>Upgrade to see the heatmap calendar view with aggregated availability data</p>
                            <button className="btn btn-primary btn-large" onClick={onUpgrade}>
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                    {/* blurred calendar preview */}
                    <div className="blurred-calendar">
                        {timeSlots.map(slot => (
                            <div key={slot.id} className="calendar-day blurred">
                                <div className="day-header">{slot.day}</div>
                                <div className="day-content heat-preview"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    //if premium show full heatmap calendar //
    return (
        <div className="heatmap-calendar-container">
            <div className="calendar-header">
                <h4>Heatmap Calendar view (upgrade)</h4>
                {bestTimeSlot && (
                    <div className="current-best">
                        <span className="best-label">Current best date!</span>
                        <div className="best-time">{bestTimeSlot.day}</div>
                    </div>
                )}
            </div>
            
            <div className="heatmap-calendar">
                {timeSlots.map(slot => {
                    const intensity = getHeatmapIntensity(slot.id);
                    const isBest = bestTimeSlot?.id === slot.id;
                    
                    return (
                        <div 
                            key={slot.id} 
                            className={`calendar-day ${getHeatmapClass(intensity)} ${isBest ? 'best-day' : ''}`}
                        >
                            <div className="day-header">
                                <div className="day-name">{slot.day}</div>
                                {slot.time && <div className="day-time">{slot.time}</div>}
                            </div>
                            <div className="day-content">
                                <div className="availability-summary">
                                    {availability
                                        .filter(a => a.timeSlotId === slot.id && a.status === 'available')
                                        .length} available
                                </div>
                                {/* Best time slot indicator */}
                                {isBest && (
                                    <div className="best-indicator">
                                        ⭐ Best
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* heatmap legend from cool to hot */}
            <div className="heatmap-legend">
                <span>Less available</span>
                <div className="legend-gradient">
                    <div className="heat-1"></div>
                    <div className="heat-2"></div>
                    <div className="heat-3"></div>
                    <div className="heat-4"></div>
                    <div className="heat-5"></div>
                </div>
                <span>More available</span>
            </div>
        </div>
    );
};

export default HeatmapCalendar;