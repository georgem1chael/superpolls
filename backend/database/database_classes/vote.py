from alchemy import getDb
db = getDb()

class Vote(db.Model):
    """Represents a user's vote on an idea"""
    
    id = db.Column(db.Integer, primary_key=True)
    idea_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)  # The user who voted
    vote_type = db.Column(db.String(10), nullable=False)  # 'up' or 'down'
    
    def to_dict(self):
        return {
            "id": self.id,
            "idea_id": self.idea_id,
            "user_id": self.user_id,
            "vote_type": self.vote_type
        }
