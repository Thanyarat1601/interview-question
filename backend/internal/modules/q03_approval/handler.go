package q03_approval

import (
	"net/http"
	"strconv"
	"time"

	"example.com/interview-question-tcc-thaibev/backend/internal/common"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) *Handler { return &Handler{db: db} }

func (h *Handler) List(c *gin.Context) {
	var rows []Document
	if err := h.db.Order("id asc").Find(&rows).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusOK, rows, "")
}

func (h *Handler) decide(c *gin.Context, target ApprovalStatus) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var input DecisionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	var doc Document
	if err := h.db.First(&doc, id).Error; err != nil {
		common.Fail(c, http.StatusNotFound, "document not found")
		return
	}
	if doc.Status != StatusPending {
		common.Fail(c, http.StatusConflict, "document is already "+string(doc.Status))
		return
	}
	now := time.Now()
	doc.Status = target
	doc.Reason = input.Reason
	doc.DecidedAt = &now
	if err := h.db.Save(&doc).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusOK, doc, "decision saved")
}

func (h *Handler) Approve(c *gin.Context) { h.decide(c, StatusApproved) }
func (h *Handler) Reject(c *gin.Context)  { h.decide(c, StatusRejected) }
