package q01_person

import (
	"net/http"
	"strconv"
	"time"

	"example.com/interview-question-tcc-thaibev/backend/internal/common"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

func (h *Handler) List(c *gin.Context) {
	var persons []Person
	if err := h.db.Order("id asc").Find(&persons).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	out := make([]PersonDTO, 0, len(persons))
	for _, p := range persons {
		out = append(out, ToDTO(p))
	}
	common.OK(c, http.StatusOK, out, "")
}

func (h *Handler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	var p Person
	if err := h.db.First(&p, id).Error; err != nil {
		common.Fail(c, http.StatusNotFound, "person not found")
		return
	}
	common.OK(c, http.StatusOK, ToDTO(p), "")
}

func (h *Handler) Create(c *gin.Context) {
	var input CreatePersonInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	birth, err := time.Parse("2006-01-02", input.BirthDate)
	if err != nil {
		common.Fail(c, http.StatusBadRequest, "birth_date must be YYYY-MM-DD")
		return
	}
	if birth.After(time.Now()) {
		common.Fail(c, http.StatusBadRequest, "birth_date cannot be in the future")
		return
	}
	p := Person{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		BirthDate: birth,
		Address:   input.Address,
	}
	if err := h.db.Create(&p).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusCreated, ToDTO(p), "person created")
}
