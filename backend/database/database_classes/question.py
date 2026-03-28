from alchemy import getDb
db = getDb()


class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)             
    survey = db.Column(db.Integer,nullable=False)
    title = db.Column(db.String(100), nullable=False)          
    description = db.Column(db.String(300), nullable=True)         
    type = db.Column(db.String, nullable=False, default="Color")
    def to_dict(self):
        dict = {
            "id": self.id,
            "title": self.title,
            "type" : self.type,
            "survey" : self.survey
        }
        if self.description:
            dict["description"] = self.description
        return dict


class SubQuestion(Question):
    d = db.Column(db.Integer, db.ForeignKey('question.id'), primary_key=True)
    parent = db.Column(db.Integer)
    def to_dict(self):
        q = Question.to_dict(self)
        q["parent"] = self.parent
        return q
    