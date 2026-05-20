package q08_exam_admin

import "time"

type Exam struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	QuestionText  string    `json:"question_text" gorm:"type:text;not null"`
	ChoiceA       string    `json:"choice_a" gorm:"size:300;not null"`
	ChoiceB       string    `json:"choice_b" gorm:"size:300;not null"`
	ChoiceC       string    `json:"choice_c" gorm:"size:300;not null"`
	ChoiceD       string    `json:"choice_d" gorm:"size:300;not null"`
	CorrectAnswer string    `json:"correct_answer" gorm:"size:1;not null"` // A/B/C/D
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (Exam) TableName() string { return "q08_exams" }

type ExamDTO struct {
	No            int    `json:"no"`            // running number after delete
	ID            uint   `json:"id"`            // real DB id
	QuestionText  string `json:"question_text"`
	ChoiceA       string `json:"choice_a"`
	ChoiceB       string `json:"choice_b"`
	ChoiceC       string `json:"choice_c"`
	ChoiceD       string `json:"choice_d"`
	CorrectAnswer string `json:"correct_answer"`
}

type CreateInput struct {
	QuestionText  string `json:"question_text" binding:"required"`
	ChoiceA       string `json:"choice_a" binding:"required"`
	ChoiceB       string `json:"choice_b" binding:"required"`
	ChoiceC       string `json:"choice_c" binding:"required"`
	ChoiceD       string `json:"choice_d" binding:"required"`
	CorrectAnswer string `json:"correct_answer" binding:"required,oneof=A B C D"`
}
