from alchemy import getDb
db = getDb()

class Idea(db.Model):
    """Represents a brainstorming idea in a survey"""
    
    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, nullable=False)
    text = db.Column(db.String(500), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    votes = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "author": self.author,
            "votes": self.votes,
            "userVote": None  # Will be calculated per user
        }