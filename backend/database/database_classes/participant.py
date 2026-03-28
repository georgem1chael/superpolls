from alchemy import getDb
db = getDb()

class Participant(db.Model):
    """Represents a participant in a survey"""
    
    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, nullable=True)  # If logged in
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "survey_id": self.survey_id
        }