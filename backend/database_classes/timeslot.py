from alchemy import getDb
db = getDb()

class TimeSlot(db.Model):
    """Represents a time slot option in a survey"""
    
    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, nullable=False)
    slot_id = db.Column(db.String(50), nullable=False)  # 'friday', 'saturday', etc.
    day = db.Column(db.String(50), nullable=False)
    
    def to_dict(self):
        return {
            "id": self.slot_id,
            "day": self.day
        }