package q05_queue

import (
	"errors"
	"net/http"

	"example.com/interview-question-tcc-thaibev/backend/internal/common"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) *Handler { return &Handler{db: db} }

// ensureRow inserts the singleton state row if missing. Idempotent.
func ensureRow(db *gorm.DB) error {
	var state QueueState
	err := db.First(&state, 1).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		state = QueueState{ID: 1, LetterIdx: -1, DigitIdx: -1, Current: "00"}
		return db.Create(&state).Error
	}
	return err
}

func (h *Handler) Current(c *gin.Context) {
	if err := ensureRow(h.db); err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	var state QueueState
	if err := h.db.First(&state, 1).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusOK, gin.H{"current": state.Current}, "")
}

// Next advances the queue under a row-level lock so concurrent presses cannot
// produce duplicate tickets. PostgreSQL: SELECT ... FOR UPDATE.
func (h *Handler) Next(c *gin.Context) {
	if err := ensureRow(h.db); err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	var newCurrent string
	err := h.db.Transaction(func(tx *gorm.DB) error {
		var state QueueState
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&state, 1).Error; err != nil {
			return err
		}
		// advance
		state.DigitIdx++
		if state.LetterIdx < 0 {
			state.LetterIdx = 0
			state.DigitIdx = 0
		} else if state.DigitIdx > 9 {
			state.DigitIdx = 0
			state.LetterIdx++
		}
		if state.LetterIdx > 25 {
			return errFull
		}
		state.Current = string(rune('A'+state.LetterIdx)) + string(rune('0'+state.DigitIdx))
		newCurrent = state.Current
		return tx.Save(&state).Error
	})
	if err != nil {
		if errors.Is(err, errFull) {
			common.Fail(c, http.StatusConflict, "queue full (reached Z9); please reset")
			return
		}
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusOK, gin.H{"current": newCurrent}, "ticket issued")
}

func (h *Handler) Reset(c *gin.Context) {
	if err := ensureRow(h.db); err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	err := h.db.Transaction(func(tx *gorm.DB) error {
		var state QueueState
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&state, 1).Error; err != nil {
			return err
		}
		state.LetterIdx = -1
		state.DigitIdx = -1
		state.Current = "00"
		return tx.Save(&state).Error
	})
	if err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusOK, gin.H{"current": "00"}, "queue reset")
}

var errFull = errors.New("queue full")
