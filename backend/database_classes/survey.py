from alchemy import getDb
db = getDb()


class Survey(db.Model):
    """
    Represents a empty survey
    """

    # Define the table columns (fields) and their types.
    id = db.Column(db.Integer, primary_key=True)               # Unique ID for each survey.
    title = db.Column(db.String(100), nullable=False)          # Short description (required).
    description = db.Column(db.String(300), nullable=True)         # Optional extra information.
    editable = db.Column(db.Boolean, nullable=False, default=False)  
    answers = db.Column(db.Integer, nullable=False, default=0)
    owner = db.Column(db.Integer, nullable=False)
    public = db.Column(db.Boolean, nullable=False, default=True)
    def to_dict(self):
        """
        Convert the Survey object into a plain Python dictionary,
        making it easy to convert into JSON for HTTP responses.
        """
        dict = {
            "id": self.id,
            "title": self.title,
            "editable": self.editable,
            "owner": self.owner,
            "answers": self.answers,
            "public": self.public
        }
        if self.description:
            dict["description"] = self.description
        return dict
