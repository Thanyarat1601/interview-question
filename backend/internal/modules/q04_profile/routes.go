package q04_profile

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(api *gin.RouterGroup, db *gorm.DB) {
	h := NewHandler(db)
	g := api.Group("/q04")
	{
		g.POST("/profiles", h.Create)
		g.GET("/profiles/:id", h.Get)
	}
}
