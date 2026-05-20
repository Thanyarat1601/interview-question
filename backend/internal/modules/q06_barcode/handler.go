package q06_barcode

import (
	"net/http"
	"strconv"
	"strings"

	"example.com/interview-question-tcc-thaibev/backend/internal/common"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) *Handler { return &Handler{db: db} }

func (h *Handler) List(c *gin.Context) {
	var rows []BarcodeProduct
	if err := h.db.Order("id asc").Find(&rows).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusOK, rows, "")
}

func (h *Handler) Create(c *gin.Context) {
	var input CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	code := strings.ToUpper(strings.TrimSpace(input.ProductCode))
	if !CodeRegex.MatchString(code) {
		common.Fail(c, http.StatusBadRequest, "product_code must match XXXX-XXXX-XXXX-XXXX (A-Z, 0-9)")
		return
	}
	row := BarcodeProduct{ProductCode: code}
	if err := h.db.Create(&row).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusCreated, row, "product created")
}

func (h *Handler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.db.Delete(&BarcodeProduct{}, id).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusOK, gin.H{"id": id}, "product deleted")
}
