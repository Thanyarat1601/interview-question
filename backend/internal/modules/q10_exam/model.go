package q10_exam

import "time"

type Question struct {
	ID            uint   `json:"id" gorm:"primaryKey"`
	QuestionText  string `json:"question_text" gorm:"type:text;not null"`
	ChoiceA       string `json:"choice_a" gorm:"size:300;not null"`
	ChoiceB       string `json:"choice_b" gorm:"size:300;not null"`
	ChoiceC       string `json:"choice_c" gorm:"size:300;not null"`
	ChoiceD       string `json:"choice_d" gorm:"size:300;not null"`
	CorrectAnswer string `json:"-" gorm:"size:1;not null"`
}

func (Question) TableName() string { return "q10_questions" }

type Submission struct {
	ID         uint       `json:"id" gorm:"primaryKey"`
	StudentName string    `json:"student_name" gorm:"size:200;not null"`
	Score      int        `json:"score"`
	TotalCount int        `json:"total_count"`
	Answers    []Answer   `json:"answers" gorm:"foreignKey:SubmissionID;constraint:OnDelete:CASCADE"`
	CreatedAt  time.Time  `json:"created_at"`
}

func (Submission) TableName() string { return "q10_submissions" }

type Answer struct {
	ID            uint   `json:"id" gorm:"primaryKey"`
	SubmissionID  uint   `json:"submission_id"`
	QuestionID    uint   `json:"question_id"`
	ChosenAnswer  string `json:"chosen_answer" gorm:"size:1"`
	IsCorrect     bool   `json:"is_correct"`
}

func (Answer) TableName() string { return "q10_answers" }

type SubmissionInput struct {
	StudentName string         `json:"student_name" binding:"required,min=1,max=200"`
	Answers     []AnswerInput  `json:"answers" binding:"required,min=1,dive"`
}

type AnswerInput struct {
	QuestionID   uint   `json:"question_id" binding:"required"`
	ChosenAnswer string `json:"chosen_answer" binding:"required,oneof=A B C D"`
}
