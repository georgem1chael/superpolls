import React, { useState } from 'react';
import type { Idea } from '../types';

interface BrainstormingWallProps {
    ideas: Idea[];
    onAddIdea: (text: string) => void;
    onVoteIdea: (ideaId: number, vote: 'up' | 'down') => void;
    currentUser?: string;
    isEditable: boolean;
}

const BrainstormingWall: React.FC<BrainstormingWallProps> = ({
    ideas,
    onAddIdea,
    onVoteIdea,
    currentUser = 'You',
    isEditable
}) => {
    const [showForm, setShowForm] = useState(false);
    const [newIdea, setNewIdea] = useState('');

    const submitIdea = (e: React.FormEvent) => {
        e.preventDefault();
        if (newIdea.trim()) {
            onAddIdea(newIdea.trim());
            setNewIdea('');
            setShowForm(false);
        }
    };

    const handleVote = (ideaId: number, voteType: 'up' | 'down') => {
        if (!isEditable) return;
        onVoteIdea(ideaId, voteType);
    };

    const sortedIdeas = [...ideas].sort((a, b) => b.votes - a.votes);

    return (
        <div className="brainstorming-wall">
            <div className="brainstorm-header">
                <h3>Drop your ideas on the wall :</h3>
                {isEditable && (
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        Add an idea
                    </button>
                )}
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <form onSubmit={submitIdea} className="add-idea-form">
                        <h4>Add a new idea</h4>
                        <div className="form-group">
                            <label>Your idea:</label>
                            <textarea
                                value={newIdea}
                                onChange={(e) => setNewIdea(e.target.value)}
                                placeholder="Share your idea..."
                                required
                                rows={4}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                Add Idea
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowForm(false);
                                    setNewIdea('');
                                }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="ideas-grid">
                {sortedIdeas.map((idea) => (
                    <div key={idea.id} className="idea-card">
                        <div className="idea-content">
                            <p className="idea-text">{idea.text}</p>
                            <div className="idea-author">— {idea.author}</div>
                        </div>
                        
                        <div className="idea-voting">
                            <div className="vote-controls">
                                <button
                                    className={`vote-btn upvote ${idea.userVote === 'up' ? 'active' : ''}`}
                                    onClick={() => handleVote(idea.id, 'up')}
                                    disabled={!isEditable}
                                    title="Upvote this idea"
                                >
                                    ↑
                                </button>
                                <span className="vote-count">{idea.votes}</span>
                                <button
                                    className={`vote-btn downvote ${idea.userVote === 'down' ? 'active' : ''}`}
                                    onClick={() => handleVote(idea.id, 'down')}
                                    disabled={!isEditable}
                                    title="Downvote this idea"
                                >
                                    ↓
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {ideas.length === 0 && (
                    <div className="no-ideas">
                        <p>No ideas yet. Be the first to add one!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrainstormingWall;