package q04_profile

import (
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"example.com/interview-question-tcc-thaibev/backend/internal/common"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Thai-style phone: 8-15 digits, optional leading +
var phoneRegex = regexp.MustCompile(`^\+?[0-9]{8,15}$`)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) *Handler { return &Handler{db: db} }

func (h *Handler) Create(c *gin.Context) {
	var input CreateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	phone := strings.ReplaceAll(strings.ReplaceAll(input.Phone, " ", ""), "-", "")
	if !phoneRegex.MatchString(phone) {
		common.Fail(c, http.StatusBadRequest, "invalid phone format")
		return
	}
	birth, err := parseBirthDate(input.BirthDate)
	if err != nil {
		common.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	if birth.After(time.Now()) {
		common.Fail(c, http.StatusBadRequest, "birth_date cannot be in the future")
		return
	}
	row := Profile{
		FullName:   input.FullName,
		Email:      input.Email,
		Phone:      phone,
		BirthDate:  birth,
		Occupation: input.Occupation,
		ImageData:  input.ImageData,
	}
	if err := h.db.Create(&row).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusCreated, gin.H{"id": row.ID}, "save data success")
}

func (h *Handler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var row Profile
	if err := h.db.First(&row, id).Error; err != nil {
		common.Fail(c, http.StatusNotFound, "profile not found")
		return
	}
	common.OK(c, http.StatusOK, row, "")
}

func parseBirthDate(s string) (time.Time, error) {
	for _, layout := range []string{"02/01/2006", "2006-01-02"} {
		if t, err := time.Parse(layout, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, &timeErr{}
}

type timeErr struct{}

func (timeErr) Error() string { return "birth_date must be DD/MM/YYYY" }
