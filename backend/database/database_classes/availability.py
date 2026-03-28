from alchemy import getDb
db = getDb()

class Availability(db.Model):
    """Represents a participant's availability for a time slot"""
    
    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.Integer, nullable=False)
    timeslot_id = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'available', 'maybe', 'unavailable'
    
    def to_dict(self):
        return {
            "participantId": self.participant_id,
            "timeSlotId": self.timeslot_id,
            "status": self.status
        }