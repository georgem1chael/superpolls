import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DateTimeGrid from './components/DateTimeGrid';
import HeatmapCalendar from './components/HeatmapCalendar';
import BrainstormingWall from './components/BrainstormingWall';
import type { Survey, Participant, TimeSlot, Availability, Idea } from './types';
import { getSurveyData, updateAvailability, addIdea as addIdeaAPI, voteIdea as voteIdeaAPI, getCurrentUser, joinSurvey } from './api';

const SurveyPage = () => {
    const { surveyId } = useParams<{ surveyId: string }>();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [currentUserName, setCurrentUserName] = useState<string>('');
    const [currentParticipantId, setCurrentParticipantId] = useState<number | null>(null);
    const [hasJoined, setHasJoined] = useState(false);

    useEffect(() => {
        const fetchSurvey = async () => {
            if (!surveyId) return;
            
            try {
                const userData = await getCurrentUser();
                setCurrentUserName(userData.name);
                
                const data = await getSurveyData(parseInt(surveyId));
                setSurvey(data.survey);
                setTimeSlots(data.timeSlots);
                setAvailability(data.availability);
                setIdeas(data.ideas);
                
                const matchingParticipant = data.participants.find(
                    (p: Participant) => p.name === userData.name
                );
                
                if (matchingParticipant) {
                    setCurrentParticipantId(matchingParticipant.id);
                    setHasJoined(true);
                    const sortedParticipants = [
                        matchingParticipant,
                        ...data.participants.filter((p: Participant) => p.id !== matchingParticipant.id)
                    ];
                    setParticipants(sortedParticipants);
                } else {
                    setHasJoined(false);
                    setParticipants(data.participants);
                }
                
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };
        fetchSurvey();
    }, [surveyId]);

    const handleAvailabilityChange = async (participantId: number, timeSlotId: string, status: 'unavailable' | 'maybe' | 'available') => {
        try {
            await updateAvailability(parseInt(surveyId!), participantId, timeSlotId, status);
            setAvailability(prev => [
                ...prev.filter(a => !(a.participantId === participantId && a.timeSlotId === timeSlotId)),
                { participantId, timeSlotId, status }
            ]);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const handleAddIdea = async (text: string) => {
        try {
            const newIdea = await addIdeaAPI(parseInt(surveyId!), text, currentUserName);
            setIdeas(prev => [...prev, newIdea]);
        } catch (error) {
            console.error('Failed to add idea');
        }
    };

    const handleVoteIdea = async (ideaId: number, voteType: 'up' | 'down') => {
        try {
            const updatedIdea = await voteIdeaAPI(ideaId, voteType);
            setIdeas(prev => prev.map(idea => idea.id === ideaId ? updatedIdea : idea));
        } catch (error) {
            console.error('Vote failed');
        }
    };

    const handleJoinSurvey = async () => {
        try {
            await joinSurvey(parseInt(surveyId!));
            const data = await getSurveyData(parseInt(surveyId!));
            const userData = await getCurrentUser();
            
            const matchingParticipant = data.participants.find(
                (p: Participant) => p.name === userData.name
            );
            
            if (matchingParticipant) {
                setCurrentParticipantId(matchingParticipant.id);
                setHasJoined(true);
                
                // Sort participants: current user first, then others
                const sortedParticipants = [
                    matchingParticipant,
                    ...data.participants.filter((p: Participant) => p.id !== matchingParticipant.id)
                ];
                setParticipants(sortedParticipants);
            }
            setAvailability(data.availability);
        } catch (error) {
            console.error('Failed to join survey:', error);
            alert('Failed to join survey.');
        }
    };

    const handleUpgrade = () => {
        setIsPremium(true);
    };

    if (loading) {
        return (
            <div className="wrapper">
                <div className="loading">Loading survey...</div>
            </div>
        );
    }

    //survey not found //
    if (!survey) {
        return (
            <div className="wrapper">
                <div className="error">
                    <h2>Survey Not Found</h2>
                    <p>The survey you're looking for doesn't exist or is no longer available.</p>
                    <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="wrapper">
            <div className="survey-unified-container">
                <header className="survey-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
                        {!hasJoined && (
                            <button onClick={handleJoinSurvey} className="btn btn-primary">
                                Join Survey
                            </button>
                        )}
                    </div>
                    <h1>{survey.title}</h1>
                    {survey.description && <p className="survey-description">{survey.description}</p>}
                </header>

                <div className="survey-sections">
                    {/* Date/Time Grid Section */}
                    <section className="section date-time-section">
                        <DateTimeGrid
                            participants={participants}
                            timeSlots={timeSlots}
                            availability={availability}
                            onAvailabilityChange={handleAvailabilityChange}
                            currentUser={currentParticipantId}
                            isEditable={survey.editable}
                        />
                    </section>

                    {/* Heatmap Calendar Section */}
                    <section className="section calendar-section">
                        <HeatmapCalendar
                            participants={participants}
                            timeSlots={timeSlots}
                            availability={availability}
                            isPremium={isPremium}
                            onUpgrade={handleUpgrade}
                        />
                    </section>

                    {/* Brainstorming Wall Section */}
                    <section className="section brainstorm-section">
                        <BrainstormingWall
                            ideas={ideas}
                            onAddIdea={handleAddIdea}
                            onVoteIdea={handleVoteIdea}
                            currentUser={currentUserName}
                            isEditable={survey.editable}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SurveyPage;