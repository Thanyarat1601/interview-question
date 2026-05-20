package q09_comment

import (
	"net/http"
	"strings"

	"example.com/interview-question-tcc-thaibev/backend/internal/common"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const FixedCommenter = "Blend 285"

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) *Handler { return &Handler{db: db} }

func (h *Handler) List(c *gin.Context) {
	var rows []Comment
	if err := h.db.Order("id asc").Find(&rows).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusOK, rows, "")
}

func (h *Handler) Create(c *gin.Context) {
	var input CreateCommentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	msg := strings.TrimSpace(input.Message)
	if msg == "" {
		common.Fail(c, http.StatusBadRequest, "message is required")
		return
	}
	row := Comment{CommenterName: FixedCommenter, Message: msg}
	if err := h.db.Create(&row).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusCreated, row, "comment posted")
}
