from alchemy import getDb
db = getDb()

class Answer(db.Model):
    id = db.Column(db.Integer, primary_key=True)               # Unique ID for each answer.      
    name = db.Column(db.String(100), nullable=False)  
    question = db.Column(db.Integer,nullable=False)    
    answer = db.Column(db.String(1000), nullable=False)
    userID = db.Column(db.Integer, nullable=True)    
    def to_dict(self):
        dict = {
            "id": self.id,
            "question": self.question,
            "name":self.name,
            "answer":self.answer
        }
        if self.userID:
            dict['userID'] = self.userID
        return dict

##Subclasses not used
class ColorAnswer(Answer):
    #color = db.Column(db.String(20)) 
    def to_dict(self):
        dict = Answer.to_dict(self)
        dict["color"] = self.color
        return dict

class TextAnswer(Answer):
    #answer = db.Column(db.String(1000))     
    def to_dict(self):
        dict = Answer.to_dict(self)
        dict["answer"] = self.answer
        return dict
