from flask import jsonify, request
from flask_login import login_user, logout_user, login_required, current_user


from database_classes.answer import Answer
from database_classes.question import Question, SubQuestion
from database_classes.survey import Survey
from database_classes.user import User
from database_classes.participant import Participant
from database_classes.timeslot import TimeSlot
from database_classes.availability import Availability
from database_classes.idea import Idea
from database_classes.vote import Vote
from alchemy import getDb, getApp, getLoginManager

db = getDb()
app = getApp()
login_manager = getLoginManager()


with app.app_context():
    db.create_all()

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

############################################################################################
#####################################User Managment#########################################
############################################################################################


@login_manager.user_loader
def load_user_from_id(id):
    return User.get_by_id(id)


@app.route("/users/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return "", 200
    
    if current_user.is_authenticated:
        logout_user()
    
    data = request.get_json()
    if not data or "email" not in data or "name" not in data or "password" not in data:
        return jsonify({"error": "Missing data field"}), 400
    
    if User.get_by_email(data["email"].strip()):
        return jsonify({"error": "Email already exists"}), 400
    
    user = User.create_user(
        name=data["name"].strip(),
        email=data["email"].strip(),
        password=data["password"].strip()
    )
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return jsonify(user.name), 201


@app.route("/users/current", methods=["GET", "OPTIONS"])
def get_current_user():
    if request.method == "OPTIONS":
        return "", 200
    
    if not current_user.is_authenticated:
        return jsonify({"error": "Not authenticated"}), 401
    
    return jsonify({
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }), 200


@app.route("/users/logIn", methods=["POST", "OPTIONS"])
def logIn():
    if request.method == "OPTIONS":
        return "", 200
    
    if current_user.is_authenticated:
        logout_user()
    
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Missing fields"}), 400
    
    user = User.get_by_email(data["email"].strip())
    if not user or not user.check_password(data["password"].strip()):
        return jsonify({"error": "Invalid credentials"}), 401
    
    login_user(user, remember=data.get("remember", False))
    return jsonify(user.name), 200


@app.route("/users/logout", methods=["GET"])
@login_required
def logout():
    logout_user()
    return "", 200


############################################################################################
##################################Private survey methods####################################
############################################################################################


# Helper Methods
def isNotSurveyOwner(survey: int):
    survey_o = Survey.query.get(survey)
    return not survey_o or not survey_o.owner == current_user.id


@app.route("/surveys", methods=["GET"])
@login_required
def get_surveys():
    user_id = current_user.id
    
    # Get surveys created by the user
    owned_surveys = Survey.query.filter_by(owner=user_id).all()
    
    # Get surveys where the user is a participant
    participated_survey_ids = [p.survey_id for p in Participant.query.filter_by(user_id=user_id).all()]
    participated_surveys = Survey.query.filter(Survey.id.in_(participated_survey_ids)).all()
    
    # Combine and remove duplicates
    all_surveys = {s.id: s for s in owned_surveys + participated_surveys}
    
    return jsonify([s.to_dict() for s in all_surveys.values()]), 200


@app.route("/questions/<int:survey>", methods=["GET"])
@login_required
def get_questions(survey: int):
    if isNotSurveyOwner(survey):
        return jsonify({"error": "Wrong user for survey"}), 401

    elements = Question.query.filter(Question.survey == survey)
    low_questions = SubQuestion.query.filter(
        SubQuestion.survey == survey,
    )
    top_questions = [
        question
        for question in elements
        if question.id not in [q.id for q in low_questions]
    ]
    elements = list(low_questions) + top_questions
    return jsonify([element.to_dict() for element in elements]), 200


@app.route("/answers/<int:question>", methods=["GET"])
@login_required
def get_answers(question: int):
    questionO = Question.query.get(question)
    if not questionO:
        return jsonify({"error": "Question not found"}), 404
    if isNotSurveyOwner(questionO.survey):
        return jsonify({"error": "Wrong user for survey"}), 401

    elements = Answer.query.filter(Answer.question == question)
    return jsonify([element.to_dict() for element in elements]), 200


# SET
@app.route("/add/empty-survey", methods=["POST"])
@login_required
def add_empty_survey():
    user = current_user.id
    data = request.get_json()
    if not data or "title" not in data:
        return jsonify({"error": "title is required"}), 400
    survey = Survey(
        title=data["title"],
        editable=data.get("editable", False),
        public=data.get("public", True),
        description=data.get("description"),
        owner=user,
    )
    db.session.add(survey)
    db.session.commit()
    return jsonify(survey.to_dict()), 201


@app.route("/survey/<int:survey_id>/join", methods=["POST", "OPTIONS"])
@login_required
def join_survey(survey_id: int):
    if request.method == "OPTIONS":
        return "", 200
    
    # Check if user already joined
    existing = Participant.query.filter_by(
        survey_id=survey_id,
        user_id=current_user.id
    ).first()
    
    if existing:
        return jsonify({"message": "Already joined", "participant": existing.to_dict()}), 200
    
    # Create new participant
    participant = Participant(
        survey_id=survey_id,
        name=current_user.name,
        user_id=current_user.id
    )
    db.session.add(participant)
    db.session.commit()
    
    return jsonify({"message": "Joined successfully", "participant": participant.to_dict()}), 201


@app.route("/add/survey-with-data", methods=["POST"])
@login_required
def add_survey_with_data():
    user = current_user.id
    data = request.get_json()
    if not data or "title" not in data:
        return jsonify({"error": "title is required"}), 400
    
    # Create the survey
    survey = Survey(
        title=data["title"],
        editable=data.get("editable", False),
        public=data.get("public", True),
        description=data.get("description"),
        owner=user,
    )
    db.session.add(survey)
    db.session.flush()  # Get survey ID
    
    # Add participants (creator is first)
    participants = data.get("participants", [])
    for participant_name in participants:
        if participant_name and participant_name.strip():
            participant = Participant(
                survey_id=survey.id,
                name=participant_name.strip(),
                user_id=current_user.id if participant_name.strip() == current_user.name else None
            )
            db.session.add(participant)
    
    # Add timeslots
    timeslots = data.get("timeslots", [])
    for timeslot_data in timeslots:
        if timeslot_data.get("slot_id") and timeslot_data.get("day"):
            timeslot = TimeSlot(
                survey_id=survey.id,
                slot_id=timeslot_data["slot_id"].strip(),
                day=timeslot_data["day"].strip()
            )
            db.session.add(timeslot)
    
    db.session.commit()
    return jsonify(survey.to_dict()), 201


@app.route("/add/survey", methods=["POST"])
@login_required
def add_survey():
    data = request.get_json()
    if not data or "title" not in data:
        return jsonify({"error": "title is required"}), 400
    
    survey = Survey(
        title=data["title"],
        editable=data.get("editable", False),
        public=data.get("public", True),
        description=data.get("description"),
        owner=current_user.id
    )
    db.session.add(survey)
    db.session.flush()
    
    questions = data.get("questions", [])
    for q in questions:
        if q and "title" in q:
            question = Question(
                survey=survey.id,
                description=q.get("description"),
                title=q["title"]
            )
            db.session.add(question)
            db.session.flush()
            
            if "questions" in q:
                for sub_q in q["questions"]:
                    if sub_q and "title" in sub_q:
                        subquestion = SubQuestion(
                            survey=survey.id,
                            description=sub_q.get("description"),
                            title=sub_q["title"],
                            parent=question.id
                        )
                        db.session.add(subquestion)
    
    db.session.commit()
    return jsonify(survey.to_dict()), 201


@app.route("/add/question/<int:survey>", methods=["POST"])
@login_required
def add_question(survey: int):
    if isNotSurveyOwner(survey):
        return jsonify({"error": "Wrong user for survey"}), 401

    data = request.get_json()
    if not data or "title" not in data:
        return jsonify({"error": "title is required"}), 400
    if "parent" not in data:
        question = Question(
            survey=survey,
            description=data.get("description", None),
            title=data["title"],
        )
    else:
        question = SubQuestion(
            survey=survey,
            description=data.get("description", None),
            title=data["title"],
            parent=data["parent"],
        )
    db.session.add(question)
    db.session.commit()
    return jsonify(question.to_dict()), 201


@app.route("/survey/<int:survey_id>", methods=["DELETE", "OPTIONS"])
@login_required
def delete_survey(survey_id: int):
    if request.method == "OPTIONS":
        return "", 200
    
    survey = Survey.query.get(survey_id)
    if not survey:
        return jsonify({"error": "Survey not found"}), 404
    
    if survey.owner != current_user.id:
        return jsonify({"error": "Not authorized to delete this survey"}), 403
    
    Participant.query.filter_by(survey_id=survey_id).delete()
    TimeSlot.query.filter_by(survey_id=survey_id).delete()
    Idea.query.filter_by(survey_id=survey_id).delete()
    Question.query.filter_by(survey=survey_id).delete()
    
    db.session.delete(survey)
    db.session.commit()
    
    return jsonify({"message": "Survey deleted successfully"}), 200


############################################################################################
################################Public survey methods#######################################
############################################################################################


@app.route("/public/<int:user>/surveys", methods=["GET"])
def get_surveys_public(user: int):
    elements = Survey.query.filter(Survey.owner == user, Survey.public == True)
    return jsonify([element.to_dict() for element in elements]), 200


@app.route("/public/<int:user>/questions/<int:survey>", methods=["GET"])
def get_questions_public(user: int, survey: int):
    if not Survey.query.filter(
        Survey.owner == user, Survey.public == True, Survey.id == survey
    ).first():
        return jsonify([]), 200
    elements = Question.query.filter(Question.survey == survey)
    low_questions = SubQuestion.query.filter(
        SubQuestion.survey == survey,
    )
    top_questions = [
        question
        for question in elements
        if question.id not in [q.id for q in low_questions]
    ]
    elements = low_questions + top_questions
    return jsonify([element.to_dict() for element in elements]), 200


@app.route("/public/<int:user>/answers/<int:question>", methods=["GET"])
def get_answers_public(user: int, question: int):
    question = Question.query.filter(Question.id == question).first()
    if (not question) or (
        not Survey.query.filter(
            Survey.owner == user, Survey.public == True, Survey.id == question
        ).first()
    ):
        return jsonify({"error": "Question not found"}), 200
    elements = Answer.query.filter(Answer.question == question)
    return jsonify([element.to_dict() for element in elements]), 200


@app.route("/survey/<int:surveyId>", methods=["GET"])
def get_survey(surveyId: int):
    user = current_user.id
    survey = Survey.query.get(surveyId)
    if not survey or (survey.owner != user and survey.public == False):
        return jsonify({"error": "Wrong user for survey"}), 401

    survey = survey.to_dict()
    questions = [
        question.to_dict()
        for question in Question.query.filter(
            Question.survey == surveyId,
        )
    ]
    low_questions = [
        question.to_dict()
        for question in SubQuestion.query.filter(
            SubQuestion.survey == surveyId,
        )
    ]
    top_questions = [
        question
        for question in questions
        if question["id"] not in [q["id"] for q in low_questions]
    ]
    for question in low_questions:
        for top_question in top_questions:
            if top_question["id"] == question["parent"]:
                if top_question.get("questions"):
                    top_question["questions"].append(question)
                else:
                    top_question["questions"] = [question]

    for question in questions:
        question["answers"] = [
            answer.to_dict()
            for answer in Answer.query.filter(Answer.question == question["id"])
        ]
    survey["questions"] = top_questions
    return jsonify(survey), 200


# No checks done (existency, publicity, ...)
@app.route("/add/answer/<int:question>", methods=["POST"])
def add_answer(question: int):
    data = request.get_json()
    if not data or "answer" not in data:
        return jsonify({"error": "answer is required"}), 400

    if "name" not in data:
        if current_user.id == 0:
            return jsonify({"error": "name is required"}), 400
        else:
            answer = Answer(
                name=current_user.name,
                userId=current_user.id,
                question=question,
                answer=data["answer"],
            )
    else:
        if current_user.id == 0:
            answer = Answer(name=data["name"], question=question, answer=data["answer"])
        else:
            answer = Answer(
                name=data["name"],
                userId=current_user.id,
                question=question,
                answer=data["answer"],
            )
    db.session.add(answer)
    db.session.commit()
    return jsonify(answer.to_dict()), 201


############################################################################################
###########################Survey Interaction Endpoints#####################################
############################################################################################

# Get survey data with participants, timeslots, availability, and ideas
@app.route("/survey/<int:survey_id>/data", methods=["GET", "OPTIONS"])
@login_required
def get_survey_data(survey_id: int):
    if request.method == "OPTIONS":
        return "", 200
    
    survey = Survey.query.get(survey_id)
    if not survey:
        return jsonify({"error": "Survey not found"}), 404
    
    participants = Participant.query.filter_by(survey_id=survey_id).all()
    timeslots = TimeSlot.query.filter_by(survey_id=survey_id).all()
    availability = Availability.query.filter(
        Availability.participant_id.in_([p.id for p in participants])
    ).all()
    ideas = Idea.query.filter_by(survey_id=survey_id).all()
    
    # Add user's votes to ideas
    user_id = current_user.id
    ideas_with_votes = []
    for idea in ideas:
        idea_dict = idea.to_dict()
        user_vote = Vote.query.filter_by(idea_id=idea.id, user_id=user_id).first()
        idea_dict["userVote"] = user_vote.vote_type if user_vote else None
        ideas_with_votes.append(idea_dict)
    
    return jsonify({
        "survey": survey.to_dict(),
        "participants": [p.to_dict() for p in participants],
        "timeSlots": [t.to_dict() for t in timeslots],
        "availability": [a.to_dict() for a in availability],
        "ideas": ideas_with_votes
    }), 200


# Update availability
@app.route("/survey/<int:survey_id>/availability", methods=["POST", "OPTIONS"])
def update_availability(survey_id: int):
    if request.method == "OPTIONS":
        return "", 200
    
    data = request.get_json()
    if not data or "participantId" not in data or "timeSlotId" not in data or "status" not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    # Find existing or create new
    availability = Availability.query.filter_by(
        participant_id=data["participantId"],
        timeslot_id=data["timeSlotId"]
    ).first()
    
    if availability:
        availability.status = data["status"]
    else:
        availability = Availability(
            participant_id=data["participantId"],
            timeslot_id=data["timeSlotId"],
            status=data["status"]
        )
        db.session.add(availability)
    
    db.session.commit()
    return jsonify(availability.to_dict()), 200


# Add idea
@app.route("/survey/<int:survey_id>/ideas", methods=["POST", "OPTIONS"])
def add_idea(survey_id: int):
    if request.method == "OPTIONS":
        return "", 200
    
    data = request.get_json()
    if not data or "text" not in data or "author" not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    idea = Idea(
        survey_id=survey_id,
        text=data["text"],
        author=data["author"],
        votes=0
    )
    db.session.add(idea)
    db.session.commit()
    return jsonify(idea.to_dict()), 201


# Vote on idea
@app.route("/idea/<int:idea_id>/vote", methods=["POST", "OPTIONS"])
@login_required
def vote_idea(idea_id: int):
    if request.method == "OPTIONS":
        return "", 200
    
    data = request.get_json()
    if not data or "voteType" not in data:
        return jsonify({"error": "Missing voteType"}), 400
    
    idea = Idea.query.get(idea_id)
    if not idea:
        return jsonify({"error": "Idea not found"}), 404
    
    user_id = current_user.id
    vote_type = data["voteType"]
    
    # Check if user already voted on this idea
    existing_vote = Vote.query.filter_by(idea_id=idea_id, user_id=user_id).first()
    
    if existing_vote:
        # User already voted
        if existing_vote.vote_type == vote_type:
            # Clicking same vote removes it
            if vote_type == "up":
                idea.votes -= 1
            else:
                idea.votes += 1
            db.session.delete(existing_vote)
        else:
            # Changing vote (from up to down or vice versa)
            if vote_type == "up":
                idea.votes += 2  # Remove the -1 and add +1
            else:
                idea.votes -= 2  # Remove the +1 and add -1
            existing_vote.vote_type = vote_type
    else:
        # New vote
        if vote_type == "up":
            idea.votes += 1
        elif vote_type == "down":
            idea.votes -= 1
        
        new_vote = Vote(idea_id=idea_id, user_id=user_id, vote_type=vote_type)
        db.session.add(new_vote)
    
    db.session.commit()
    
    # Get user's current vote for response
    user_vote = Vote.query.filter_by(idea_id=idea_id, user_id=user_id).first()
    result = idea.to_dict()
    result["userVote"] = user_vote.vote_type if user_vote else None
    
    return jsonify(result), 200
