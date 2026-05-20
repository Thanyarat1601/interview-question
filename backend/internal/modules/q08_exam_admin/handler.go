package q08_exam_admin

import (
	"net/http"
	"strconv"

	"example.com/interview-question-tcc-thaibev/backend/internal/common"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) *Handler { return &Handler{db: db} }

// List returns exams ordered by id with a recomputed running number ("no").
// After a delete, "no" stays sequential 1..N — that satisfies the brief.
func (h *Handler) List(c *gin.Context) {
	var rows []Exam
	if err := h.db.Order("id asc").Find(&rows).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	out := make([]ExamDTO, 0, len(rows))
	for i, r := range rows {
		out = append(out, ExamDTO{
			No: i + 1, ID: r.ID,
			QuestionText:  r.QuestionText,
			ChoiceA:       r.ChoiceA,
			ChoiceB:       r.ChoiceB,
			ChoiceC:       r.ChoiceC,
			ChoiceD:       r.ChoiceD,
			CorrectAnswer: r.CorrectAnswer,
		})
	}
	common.OK(c, http.StatusOK, out, "")
}

func (h *Handler) Create(c *gin.Context) {
	var input CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	row := Exam{
		QuestionText:  input.QuestionText,
		ChoiceA:       input.ChoiceA,
		ChoiceB:       input.ChoiceB,
		ChoiceC:       input.ChoiceC,
		ChoiceD:       input.ChoiceD,
		CorrectAnswer: input.CorrectAnswer,
	}
	if err := h.db.Create(&row).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusCreated, row, "exam created")
}

func (h *Handler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.db.Delete(&Exam{}, id).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusOK, gin.H{"id": id}, "exam deleted")
}
