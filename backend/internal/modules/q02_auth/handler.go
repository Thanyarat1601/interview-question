package q02_auth

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"example.com/interview-question-tcc-thaibev/backend/internal/common"
	"example.com/interview-question-tcc-thaibev/backend/internal/config"
	"example.com/interview-question-tcc-thaibev/backend/internal/middleware"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Handler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewHandler(db *gorm.DB, cfg *config.Config) *Handler {
	return &Handler{db: db, cfg: cfg}
}

func (h *Handler) Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	if input.Password != input.ConfirmPassword {
		common.Fail(c, http.StatusBadRequest, "password and confirm_password do not match")
		return
	}
	username := strings.ToLower(strings.TrimSpace(input.Username))
	if username == "" {
		common.Fail(c, http.StatusBadRequest, "username is required")
		return
	}

	var existing User
	if err := h.db.Where("username = ?", username).First(&existing).Error; err == nil {
		common.Fail(c, http.StatusConflict, "username already exists")
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		common.Fail(c, http.StatusInternalServerError, "failed to hash password")
		return
	}

	user := User{Username: username, PasswordHash: string(hash)}
	if err := h.db.Create(&user).Error; err != nil {
		common.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	common.OK(c, http.StatusCreated, gin.H{"id": user.ID, "username": user.Username}, "registered")
}

func (h *Handler) Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	username := strings.ToLower(strings.TrimSpace(input.Username))

	var user User
	if err := h.db.Where("username = ?", username).First(&user).Error; err != nil {
		common.Fail(c, http.StatusUnauthorized, "invalid username or password")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		common.Fail(c, http.StatusUnauthorized, "invalid username or password")
		return
	}

	token, exp, err := middleware.IssueToken(h.cfg.JWTSecret, user.ID, user.Username, 8*time.Hour)
	if err != nil {
		common.Fail(c, http.StatusInternalServerError, "failed to issue token")
		return
	}
	common.OK(c, http.StatusOK, AuthResponse{
		Token:     token,
		ExpiresAt: exp,
		Username:  user.Username,
		UserID:    user.ID,
	}, "login success")
}

func (h *Handler) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")
	common.OK(c, http.StatusOK, gin.H{"user_id": userID, "username": username}, "")
}
