package q02_auth

import (
	"example.com/interview-question-tcc-thaibev/backend/internal/config"
	"example.com/interview-question-tcc-thaibev/backend/internal/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(api *gin.RouterGroup, db *gorm.DB, cfg *config.Config) {
	h := NewHandler(db, cfg)
	g := api.Group("/q02")
	{
		g.POST("/register", h.Register)
		g.POST("/login", h.Login)
		g.GET("/me", middleware.RequireJWT(cfg.JWTSecret), h.Me)
	}
}
