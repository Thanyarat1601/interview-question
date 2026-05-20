package q10_exam

import (
	"net/http"
	"strconv"

	"example.com/interview-question-tcc-thaibev/backend/internal/common"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) *Handler { return &Handler{db: db} }

func (h *Handler) Questions(c *gin.Context) {
	var rows []Question
	if err := h.db.Order("id asc").Find(&rows).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusOK, rows, "")
}

func (h *Handler) Submit(c *gin.Context) {
	var input SubmissionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	var questions []Question
	if err := h.db.Find(&questions).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	correctMap := make(map[uint]string, len(questions))
	for _, q := range questions {
		correctMap[q.ID] = q.CorrectAnswer
	}

	answers := make([]Answer, 0, len(input.Answers))
	score := 0
	for _, a := range input.Answers {
		correct, ok := correctMap[a.QuestionID]
		isCorrect := ok && correct == a.ChosenAnswer
		if isCorrect {
			score++
		}
		answers = append(answers, Answer{
			QuestionID:   a.QuestionID,
			ChosenAnswer: a.ChosenAnswer,
			IsCorrect:    isCorrect,
		})
	}

	sub := Submission{
		StudentName: input.StudentName,
		Score:       score,
		TotalCount:  len(questions),
		Answers:     answers,
	}
	if err := h.db.Create(&sub).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusCreated, sub, "submission saved")
}

func (h *Handler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var sub Submission
	if err := h.db.Preload("Answers").First(&sub, id).Error; err != nil {
		common.Fail(c, http.StatusNotFound, "submission not found")
		return
	}
	common.OK(c, http.StatusOK, sub, "")
}
